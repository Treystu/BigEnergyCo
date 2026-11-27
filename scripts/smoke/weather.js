// Weather-persistence + location-consent flow: the 17s defect class. After
// one location load, a same-location reload must perform ZERO network weather
// pulls; selecting a location must never start sizing on its own.
import { gate, sleep } from "./runtime.mjs";
import { RUN_TIMEOUT_MS } from "./actions.mjs";

// Network counting must see worker sessions too: sizing runs fetch from the
// dedicated worker, invisible to the page's Network domain alone.
export function attachNetworkCounter(ctx) {
  const { send, ws } = ctx;
  let nasaPulls = 0;
  const baseOnmessage = ws.onmessage;
  ws.onmessage = (ev) => {
    baseOnmessage(ev);
    try {
      const m = JSON.parse(ev.data);
      if (m.method === "Target.attachedToTarget" && m.params?.sessionId) {
        // Every attached worker needs its own Network domain to be seen.
        send("Network.enable", {}, m.params.sessionId).catch(() => {});
      }
      if (
        m.method === "Network.responseReceived" &&
        /power\.larc\.nasa\.gov/.test(m.params?.response?.url || "") &&
        !m.params.response.fromDiskCache
      )
        nasaPulls += 1;
    } catch {}
  };
  return {
    enable: () => send("Network.enable"),
    reset: () => {
      nasaPulls = 0;
    },
    get count() {
      return nasaPulls;
    },
  };
}

export async function runWeatherFlow(ctx, actions) {
  const { send, evaluate } = ctx;
  const nasa = attachNetworkCounter(ctx);
  // Worker sessions must be attached (flatten mode) before the first run, or
  // the counter never sees the sizing worker's fetches.
  await send("Target.setAutoAttach", {
    autoAttach: true,
    waitForDebuggerOnStart: false,
    flatten: true,
  });
  await nasa.enable();

  console.log("SMOKE      ── weather persistence ──");
  // Pick a site before the first real worker request; the separate location
  // regression flow exercises a first click with no location selected.
  await actions.chooseHonolulu();
  await evaluate(`document.getElementById("btnRunSizing")?.click()`);
  const firstRun = await ctx.poll(
    async () =>
      evaluate(`document.body.textContent.includes("Total 20-year cost")`),
    RUN_TIMEOUT_MS,
  );
  gate("first-load run completes", firstRun);

  // Cold reload: wipe every persistence layer first, and PROVE the wipe, so a
  // completed run can only have come from the wire.
  //
  // The chosen site lives in localStorage, so the wipe takes the location with
  // it, and the location-first UI (#430) refuses to size without one: clicking
  // Run here is correctly a no-op. The old flow clicked it anyway and then read
  // the missing card and the absent pulls as a weather defect. A cold load is a
  // first load for a SITE, so the site is re-established here — that is the
  // state the gate is about — and only then is the run clicked.
  const wiped = await evaluate(`(async () => {
    localStorage.clear();
    for (const d of ((await indexedDB.databases?.()) || []))
      await new Promise((res) => {
        const req = indexedDB.deleteDatabase(d.name);
        req.onsuccess = req.onerror = req.onblocked = () => res(true);
      });
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    return {
      dbs: ((await indexedDB.databases?.()) || []).length,
      caches: (await caches.keys()).length,
    };
  })()`);
  gate(
    "persistence wipe is proven before the cold load",
    wiped?.dbs === 0 && wiped?.caches === 0,
    JSON.stringify(wiped),
  );
  nasa.reset();
  await send("Page.reload", { ignoreCache: false }).catch(() => {});
  await sleep(5000);
  gate(
    "a wiped page can be given a site again",
    await actions.chooseHonolulu("cold-site city suggestions for Honolulu"),
  );
  gate("cold reload run completes", await actions.runAndWaitCard());
  await sleep(2000); // let straggler chunk responses land
  const coldPulls = nasa.count;
  gate(
    "cold load pulls weather (counter has teeth)",
    coldPulls > 0,
    `${coldPulls} NASA network pulls on the cold load`,
  );
  // Warm reload: persistence layers intact, same location — zero pulls.
  nasa.reset();
  await send("Page.reload", { ignoreCache: false }).catch(() => {});
  await sleep(5000);
  gate(
    "same-location reload pulls zero weather data",
    (await actions.runAfterReload()) && (await sleep(2000), nasa.count === 0),
    `${nasa.count} NASA network pulls after reload (expect 0)`,
  );

  // ── Explicit location consent (location selection never sizes by itself)
  console.log("SMOKE      ── auto-location ──");
  // A fresh page: the consent gate is about a location arriving WITHOUT a
  // result, and the runs above left one on screen.
  await actions.navigate(`${ctx.base}?smoke=${Date.now()}`);
  let geoGranted = true;
  try {
    await send("Browser.grantPermissions", {
      origin: new URL(ctx.base).origin,
      permissions: ["geolocation"],
    });
    await send("Emulation.setGeolocationOverride", {
      latitude: 21.31,
      longitude: -157.86,
      accuracy: 100,
    });
  } catch (e) {
    geoGranted = false;
    gate(
      "geolocation emulation granted",
      false,
      String((e && e.message) || e).slice(0, 150),
    );
  }
  if (geoGranted) {
    // The button is clicked through a guard that returns its own failure: an
    // exception inside an event handler propagates out of Runtime.evaluate and
    // used to abort the whole suite at this stage, which reports "smoke run
    // completed: false" and tells nobody what actually happened.
    const geoClick = await evaluate(`(() => {
      const b = document.getElementById("btnGeoLocate");
      if (!b) return "missing";
      try { b.click(); return "clicked"; }
      catch (e) { return "threw: " + (e && e.message ? e.message : e); }
    })()`);
    gate(
      "geolocation control accepts the click",
      geoClick === "clicked",
      geoClick,
    );
    const geoOk = await ctx.poll(
      async () => {
        const lat = await evaluate(
          `document.getElementById("latInput")?.value`,
        );
        const note = await evaluate(
          `document.getElementById("locNote")?.textContent || ""`,
        );
        return lat === "21.31" && /precise location/i.test(note);
      },
      60000,
      1000,
    );
    const resultsShown = await evaluate(`(() => {
      const r = document.getElementById("resultsRegion");
      return r ? r.hidden === false : false;
    })()`);
    gate(
      "location resolves without starting sizing",
      geoOk && !resultsShown,
      JSON.stringify({ geoOk, resultsShown }),
    );
  }
}

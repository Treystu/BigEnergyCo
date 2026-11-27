// The speed instrument for #433: the calculator's real load path, on a
// phone-class wire, measured on the artifact that ships.
//
// WHY A BROWSER AND NOT A BYTE COUNT. #433's filed scope is "the speed a
// visitor actually experiences: the calculator page's load including its
// weather fetch, on a phone-class connection". A byte budget answers a
// different question and the repo already has one
// (tests/perf-budget.test.mjs). This file answers the filed one: first paint,
// largest contentful paint, first-load transfer, and the wait from tapping
// "Size My System" to the first priced number, all under Slow 4G with a 4x CPU
// throttle — the profile Lighthouse's mobile preset uses, applied through CDP
// so the same run can also drive the interaction a static page cannot have.
//
// WHY IT SERVES THE STAGED BUILD (or a deployed origin) RATHER THAN A FILE.
// scripts/serve-static.mjs applies the real `_headers` policy, so the reading
// describes the surface production serves — same reason
// scripts/check-lighthouse.mjs serves the stage instead of opening index.html.
// `--url` points the same instrument at a deployed artifact when the reading
// has to describe what is actually on the wire.
//
// WHAT IT DOES NOT DO: it asserts nothing. It prints readings. What a reading
// MEANS lives in scripts/lib/speed-budgets.mjs, where the first measurement it
// was declared from is recorded beside it.
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  SPEED_FIRST_MEASUREMENT,
  evaluateSpeedReading,
} from "./lib/speed-budgets.mjs";
import { serveStatic } from "./serve-static.mjs";
import { sleep, start } from "./smoke/runtime.mjs";

/** Lighthouse's mobile preset, in this wire's units. */
const SLOW_4G = {
  latency: 150,
  // CDP wants bytes/second; the preset is 1.6 Mbps down and 750 kbps up.
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
};
const CPU_THROTTLE = 4;
const VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  mobile: true,
};
const NASA = /power\.larc\.nasa\.gov/;

/**
 * Count bytes and requests on the wire, page target and worker targets alike.
 *
 * WHY THE WORKER SESSIONS: the sizing worker is a separate CDP target, so the
 * NASA POWER pull — the largest thing this page fetches — never appears on the
 * page session's wire. A first-load byte count without it would report a page
 * that loads in 458 KB while the visitor waited on five years of hourly data,
 * which is the exact false reading #433 exists to replace.
 */
function meterNetwork(ctx, blockHost) {
  const { ws, send } = ctx;
  const urls = new Map();
  const bytes = { entry: 0, results: 0 };
  const hits = { entry: [], results: [] };
  let phase = "entry";

  const read = (ev) => {
    let m;
    try {
      m = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (m.method === "Target.attachedToTarget" && m.params?.sessionId) {
      send("Network.enable", {}, m.params.sessionId).catch(() => {});
      // A block set on the page session never reaches the worker target, and
      // the worker is where the weather pull is issued.
      if (blockHost)
        send(
          "Network.setBlockedURLs",
          { urls: [`*://${blockHost}/*`] },
          m.params.sessionId,
        ).catch(() => {});
      return;
    }
    if (m.method === "Network.requestWillBeSent" && m.params?.requestId) {
      urls.set(m.params.requestId, m.params.request?.url || "");
      return;
    }
    if (m.method === "Network.loadingFinished" && m.params?.requestId) {
      bytes[phase] += m.params.encodedDataLength || 0;
      hits[phase].push(urls.get(m.params.requestId) || "");
    }
  };

  const base = ws.onmessage;
  ws.onmessage = (ev) => {
    base(ev);
    read(ev);
  };

  return {
    enable: async () => {
      await send("Target.setAutoAttach", {
        autoAttach: true,
        waitForDebuggerOnStart: false,
        flatten: true,
      }).catch(() => {});
      await send("Network.enable").catch(() => {});
    },
    resultsPhase: () => {
      phase = "results";
    },
    reading: () => ({
      entryBytes: bytes.entry,
      resultsBytes: bytes.results,
      entryRequests: hits.entry.length,
      resultsRequests: hits.results.length,
      entryNasa: hits.entry.filter((u) => NASA.test(u)).length,
      resultsNasa: hits.results.filter((u) => NASA.test(u)).length,
    }),
  };
}

const readPaint = `(() => {
  const paints = performance.getEntriesByType("paint") || [];
  const fcp = paints.find((p) => p.name === "first-contentful-paint");
  // LCP entries are only reachable through a buffered observer installed
  // before the first paint; getEntriesByType returns nothing for them.
  const lcp = window.__becoLcp ? { startTime: window.__becoLcp } : null;
  const nav = performance.getEntriesByType("navigation")[0];
  return {
    fcpMs: fcp ? Math.round(fcp.startTime) : null,
    lcpMs: lcp ? Math.round(lcp.startTime) : null,
    domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    loadMs: nav ? Math.round(nav.loadEventEnd) : null,
    resources: (performance.getEntriesByType("resource") || []).map((r) => ({
      name: r.name,
      transferSize: r.transferSize,
    })),
  };
})()`;

/** Put the form in a known state and resolve when the priced card is up. */
async function runFlow(ctx, meter) {
  const { evaluate, poll } = ctx;
  await evaluate(
    `(() => {
      const s = document.getElementById("citySearch");
      s.focus();
      s.value = "Honolulu";
      s.dispatchEvent(new InputEvent("input", { bubbles: true }));
      return true;
    })()`,
  );
  const suggested = await poll(
    async () =>
      (await evaluate(
        `document.querySelectorAll('#citySuggestions [role="option"]').length`,
      )) > 0,
    20000,
    500,
  );
  if (!suggested) return { ok: false };
  await evaluate(
    `document.querySelector('#citySuggestions [role="option"]').click()`,
  );
  await sleep(1000);
  const started = Date.now();
  meter.resultsPhase();
  await evaluate(
    `(() => {
      const k = document.getElementById("dailyKwhInput");
      k.value = "10";
      k.dispatchEvent(new Event("input", { bubbles: true }));
      k.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("btnRunSizing").click();
      return true;
    })()`,
  );
  // The card's own headline is the first-number signal: #estimateBill holds a
  // prior value before the run, so polling it alone resolves instantly and the
  // "wait" it reports is the time to read a number that was already there.
  const up = await poll(
    async () =>
      evaluate(`(() => {
        if (!document.body.textContent.includes("Total 20-year cost"))
          return false;
        const bill = document.getElementById("estimateBill");
        return Boolean(bill && /[0-9]/.test(bill.textContent || ""));
      })()`),
    240000,
    250,
  );
  return { ok: up, waitedMs: Date.now() - started };
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : fallback;
  };
  const stage = arg("stage", "_pages");
  const url = arg("url", null);
  const out = arg("out", null);
  const runs = Number(arg("runs", "1"));
  // --block-host decomposes the wait: with the weather host blocked the run
  // takes the product's own fallback path, so the difference between the two
  // readings is the third-party transport and nothing else. #433 owns the
  // numbers, and a number that cannot be split cannot be cured.
  const blockHost = arg("block-host", null);
  const check = argv.includes("--check");

  let server = null;
  let base = url;
  if (!url) {
    if (!existsSync(resolve(stage)))
      throw new Error(
        `measure-speed: no staged build at ${stage} — build it first ` +
          `(node scripts/deploy-pages-local.mjs --check --stage ${stage})`,
      );
    server = await serveStatic({ dir: stage, mountWorker: false });
    base = server.url;
  }

  const ctx = await start();
  const samples = [];
  try {
    const { send, evaluate } = ctx;
    await send("Emulation.setDeviceMetricsOverride", VIEWPORT);
    await send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLE });
    await send("Network.emulateNetworkConditions", {
      offline: false,
      ...SLOW_4G,
    });
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await send("Page.enable");
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source:
        "window.__becoLcp = 0;" +
        "try { new PerformanceObserver((list) => {" +
        "  for (const e of list.getEntries()) window.__becoLcp = e.startTime;" +
        "}).observe({ type: 'largest-contentful-paint', buffered: true });" +
        "} catch (_) {}",
    });
    if (blockHost)
      await send("Network.setBlockedURLs", {
        urls: [`*://${blockHost}/*`],
      });
    const meter = meterNetwork(ctx, blockHost);
    await meter.enable();

    for (let run = 0; run < runs; run++) {
      const navStart = Date.now();
      await send("Page.navigate", { url: `${base}/?speed=${run}` });
      // Wait past the load event so deferred modules and the service worker
      // registration land inside the entry phase: a first-load byte count
      // taken at `load` alone misses that layer.
      await sleep(8000);
      const paint = await evaluate(readPaint);
      const loadWallMs = Date.now() - navStart;

      const flow = await runFlow(ctx, meter);
      const wire = meter.reading();

      samples.push({
        run,
        fcpMs: paint.fcpMs,
        lcpMs: paint.lcpMs,
        loadWallMs,
        entryTransferBytes: wire.entryBytes,
        resultsTransferBytes: wire.resultsBytes,
        entryRequests: wire.entryRequests,
        resultsRequests: wire.resultsRequests,
        entryNasa: wire.entryNasa,
        resultsNasa: wire.resultsNasa,
        ttfnMs: flow.ok ? flow.waitedMs : null,
        failed: !flow.ok,
        largest: paint.resources
          .slice()
          .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
          .slice(0, 8)
          .map((r) => ({
            name: r.name.replace(base, ""),
            transferSize: r.transferSize,
          })),
      });
    }
  } finally {
    await ctx.close().catch(() => {});
    if (server?.close) await server.close();
  }

  const summary = {
    conditions: {
      network: "Slow 4G (1.6 Mbps down / 750 kbps up, 150 ms RTT)",
      cpu: `${CPU_THROTTLE}x throttle`,
      viewport: `${VIEWPORT.width}x${VIEWPORT.height} @${VIEWPORT.deviceScaleFactor}x`,
      cache:
        "HTTP cache disabled; run 0 is the cold reading and later runs are " +
        "service-worker warm (sw.js answers from its own cache, which the " +
        "CDP cache flag does not bypass)",
      surface: url
        ? `deployed origin ${url}`
        : `staged build ${stage} on loopback`,
      blockedHost: blockHost || "none (the real load path)",
    },
    samples,
  };
  const json = `${JSON.stringify(summary, null, 2)}\n`;
  // The smoke runtime prints its own progress lines on stdout, so the reading
  // goes to a file when a caller needs to parse it rather than read it.
  if (out) writeFileSync(out, json);
  else process.stdout.write(json);

  // --check applies the wire targets to RUN 0 — the cold reading — and says so.
  // Runs 2+ in the same browser are service-worker warm: sw.js serves the app
  // shell from its own cache, which `Network.setCacheDisabled` does not touch,
  // so their entry timing collapses (480 ms FCP measured) and their transfer
  // counts include the worker's background prefetch. Scoring the worst run
  // would measure the service worker, not the visitor's first load.
  if (check) {
    const cold = samples[0] || {};
    const reading = {
      lcp_ms: cold.lcpMs || null,
      ttfn_ms: cold.ttfnMs || null,
      ttfn_ms_weather_blocked: blockHost ? cold.ttfnMs || null : undefined,
      results_transfer_bytes: cold.resultsTransferBytes || null,
    };
    const targets = Object.fromEntries(
      Object.entries(SPEED_FIRST_MEASUREMENT.wire_targets).filter(
        ([axis]) => axis !== "ttfn_ms_weather_blocked" || blockHost,
      ),
    );
    const verdict = evaluateSpeedReading(reading, targets);
    for (const c of verdict.checks)
      console.error(
        `SPEED ${c.ok ? "ok  " : "OVER"} ${c.axis} ${c.value} / ${c.budget}` +
          (c.ok ? "" : ` (+${c.delta})`),
      );
    if (!verdict.ok) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`measure-speed: ${err.message}`);
  process.exit(1);
});

// Jev sanity-badge flow: the badge is fire-and-forget and must NEVER block
// or alter results, so the honest smoke assertion is wiring — a NEW result
// state renders the right badge shape with a stubbed /api/jev, and nothing
// changes the run. The interpretation thresholds themselves are pinned in
// node tests against live-measured calibration.
import { gate, sleep } from "./runtime.mjs";

const STUB_HEALTH = `if (String(u).indexOf("/api/health") !== -1) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: "ok", jevSanity: true }) });
          }`;

function stubFetch(callsVar, jevJson) {
  return `window.fetch = function (u, o) {
          ${STUB_HEALTH}
          if (String(u).indexOf("/api/jev") !== -1) {
            ${callsVar} = (${callsVar} || 0) + 1;
            return Promise.resolve({ ok: true, json: () => Promise.resolve(${jevJson}) });
          }
          return of.apply(this, arguments);
        };`;
}

/**
 * The health probe is answered ONCE per page session (owner ruling
 * 2026-09-29), so a stub installed after the app has booted can never take
 * effect: the app already asked during boot and that answer is now the
 * session's. These three gates therefore installed a stub into a network the
 * app had already consulted, and the badge silently never rendered.
 *
 * This layer is installed at DOCUMENT-START instead — before any app script
 * runs — and answers BOTH Jev routes, so the app never reaches the real worker
 * from a smoke run: /api/health as live, and /api/jev as a silent
 * `available:false`. It is registered for LOCAL STAGED RUNS ONLY
 * (browser-smoke.mjs gates it on isLocalBase): a real surface must be probed
 * for real, or the smoke would certify a health answer the worker never gave.
 *
 * The per-gate stubs below still wrap this one and keep their own payloads and
 * their own call counts, so nothing they assert is affected — a gate that wants
 * the pass badge still gets it from its own stub, and a render outside a gate
 * gets the documented no-badge result instead of a real POST that 503s (the
 * staged build has no worker key) and logs a console error the strict
 * no-console-errors gate would correctly fail on.
 */
export const jevHealthAtDocumentStart = `(() => {
  const of = window.fetch;
  window.fetch = function (u, o) {
    if (String(u).indexOf("/api/health") !== -1) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok", jevSanity: true }),
      });
    }
    if (String(u).indexOf("/api/jev") !== -1) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ available: false }),
      });
    }
    return of.apply(this, arguments);
  };
})();`;

const PASS_JSON = `{
              available: true, model: "jev-smoke", plausible: 0.9,
              verdict: "reasonable", verdictConfidence: 0.9,
              redFlag: 0.2, redFlagConfidence: 0.8,
            }`;
const UNCERTAIN_JSON = `{
              available: true, model: "jev-smoke", plausible: 0.45,
              verdict: "reasonable", verdictConfidence: 0.5,
              redFlag: 1.2, redFlagConfidence: 0.2,
            }`;

export async function runJevFlow(ctx) {
  const { evaluate } = ctx;
  const k = `document.getElementById("dailyKwhInput")`;
  const btn = `document.getElementById("btnRunSizing")`;

  // Pass-shaped stub on a fresh state renders the pass badge.
  const badgeGate = await evaluate(
    `(async () => {
        const of = window.fetch;
        const k = document.getElementById("dailyKwhInput");
        const btn = document.getElementById("btnRunSizing");
        const before = k.value;
        ${stubFetch("window.__jevCalls", PASS_JSON)}
        const errs = [];
        const onErr = (e) => errs.push(String((e && (e.message || e.type)) || e));
        window.addEventListener("error", onErr);
        window.addEventListener("unhandledrejection", (e) =>
          errs.push("rejection: " + String(e.reason)),
        );
        try {
          k.value = String(Number(before || "10") + 1);
          // Wait for any in-flight run to release the button before clicking,
          // so the changed input actually produces a fresh payload.
          const t0w = Date.now();
          while (btn?.disabled && Date.now() - t0w < 30000) {
            await new Promise((r) => setTimeout(r, 100));
          }
          btn.click();
          const t0 = Date.now();
          while (Date.now() - t0 < 20000) {
            const b = document.querySelector(".sanity-badge.sanity-pass");
            if (b && b.textContent.length > 0) return "badge";
            await new Promise((r) => setTimeout(r, 100));
          }
          return JSON.stringify({
            badgeAny: !!document.querySelector(".sanity-badge"),
            jevCalls: window.__jevCalls || 0,
            btnDisabled: !!btn.disabled,
            regionHidden: document.getElementById("resultsRegion")?.hidden,
            errs: errs.slice(0, 5),
          });
        } finally {
          // Restore the pre-gate scenario so later gates see the same state.
          try {
            k.value = before;
            if (!btn.disabled) btn.click();
            // Quiescence: the budget-cooperation gate that follows must not
            // start while this restore-run is still in flight.
            const t1 = Date.now();
            while (btn.disabled && Date.now() - t1 < 30000) {
              await new Promise((r) => setTimeout(r, 100));
            }
          } catch {}
          window.fetch = of;
        }
      })()`,
  );
  gate(
    "Jev sanity badge renders on a fresh result (wired, pass-shaped stub)",
    badgeGate === "badge",
    String(badgeGate),
  );

  // The uncertain band renders the NEUTRAL inconclusive badge — never a pass
  // or warning. Not vacuous: the gate proves the /api/jev request fired
  // (calls ≥ 1). Teeth: removing the uncertain render fails this gate.
  const uncertainGate = await evaluate(
    `(async () => {
        const of = window.fetch;
        const k = document.getElementById("dailyKwhInput");
        const btn = document.getElementById("btnRunSizing");
        const before = k.value;
        ${stubFetch("window.__jevCalls2", UNCERTAIN_JSON)}
        try {
          // Clear the prior real/stubbed badge so this gate proves the new
          // inconclusive request, rather than passing on stale DOM.
          document.querySelectorAll(".sanity-badge").forEach((b) => b.remove());
          // +2, not +1: the badge gate above already ran before+1, and the
          // sanity cache would satisfy a repeated key without any fetch.
          k.value = String(Number(before || "10") + 2);
          const t0w = Date.now();
          while (btn?.disabled && Date.now() - t0w < 30000) {
            await new Promise((r) => setTimeout(r, 100));
          }
          btn.click();
          const t0 = Date.now();
          while (Date.now() - t0 < 10000) {
            const badge = document.querySelector(".sanity-badge.sanity-uncertain");
            if (badge && badge.textContent.length > 0)
              return JSON.stringify({ badge: true, calls: window.__jevCalls2 || 0 });
            await new Promise((r) => setTimeout(r, 100));
          }
          return JSON.stringify({ badge: false, calls: window.__jevCalls2 || 0 });
        } finally {
          try {
            k.value = before;
            if (!btn.disabled) btn.click();
            const t1 = Date.now();
            while (btn.disabled && Date.now() - t1 < 30000) {
              await new Promise((r) => setTimeout(r, 100));
            }
          } catch {}
          window.fetch = of;
        }
      })()`,
  );
  let unc = {};
  try {
    unc = JSON.parse(uncertainGate);
  } catch (_) {
    unc = { badge: false, calls: 0 };
  }
  gate(
    "Jev inconclusive verdict renders a neutral badge (request fires)",
    unc.badge === true && unc.calls >= 1,
    uncertainGate,
  );

  // The badge mounts ONCE, on the readable card that leads the result — #441
  // deleted the mode fork, so there is no `#simpleModeToggle` to flip. What
  // still has teeth: mount() is the only writer of a badge, and the sanity
  // STATE CACHE must serve a repeat of the same result state without a second
  // /api/jev request. Reverting either re-mounts without the badge or refetches
  // on every render, and this gate goes red.
  const remountGate = await evaluate(
    `(async () => {
        const of = window.fetch;
        const k = document.getElementById("dailyKwhInput");
        const btn = document.getElementById("btnRunSizing");
        if (!k || !btn) return JSON.stringify({ err: "no run controls" });
        const before = k.value;
        ${stubFetch("window.__jevCalls3", PASS_JSON)}
        // The readable card lives INSIDE #resultsRegion, so ownership is
        // counted at page level: one badge on the page, and that one on the
        // card — a second badge anywhere is a double mount.
        const badges = () => ({
          card: document.querySelectorAll("#simpleResultsWrap .sanity-badge").length,
          total: document.querySelectorAll(".sanity-badge").length,
          pass: document.querySelectorAll("#simpleResultsWrap .sanity-badge.sanity-pass").length,
        });
        const settle = async () => {
          const t0 = Date.now();
          while (!document.querySelector(".sanity-badge") && Date.now() - t0 < 15000) {
            await new Promise((r) => setTimeout(r, 100));
          }
          await new Promise((r) => setTimeout(r, 400));
        };
        try {
          // Earlier gates leave appended badges and cache entries behind; a
          // fresh, unambiguous scenario keeps this gate self-contained.
          document.querySelectorAll(".sanity-badge").forEach((b) => b.remove());
          k.value = String(Number(before || "10") + 40);
          const t0w = Date.now();
          while (btn?.disabled && Date.now() - t0w < 30000) {
            await new Promise((r) => setTimeout(r, 100));
          }
          btn.click();
          await settle();
          const first = badges();
          const callsAtMount = window.__jevCalls3 || 0;
          // The same state, driven again: the run re-renders the result, so the
          // badge is re-mounted — from the cache, not from a new request.
          const t1w = Date.now();
          while (btn.disabled && Date.now() - t1w < 30000) {
            await new Promise((r) => setTimeout(r, 100));
          }
          btn.click();
          await settle();
          const second = badges();
          return JSON.stringify({
            first,
            second,
            callsAtMount,
            callsAfterRepeat: window.__jevCalls3 || 0,
          });
        } finally {
          try {
            k.value = before;
            if (!btn.disabled) btn.click();
          } catch {}
          window.fetch = of;
        }
      })()`,
  );
  let tg = {};
  try {
    tg = JSON.parse(remountGate);
  } catch (_) {
    tg = { err: String(remountGate).slice(0, 120) };
  }
  gate(
    "Jev badge mounts once on the readable card and re-mounts from cache on a repeat run",
    tg.first &&
      tg.first.card === 1 &&
      tg.first.total === 1 &&
      tg.first.pass === 1 &&
      tg.second &&
      tg.second.card === 1 &&
      tg.second.total === 1 &&
      tg.second.pass === 1 &&
      tg.callsAfterRepeat === tg.callsAtMount,
    remountGate,
  );

  // ── the advisor brief must know what the run actually built ────────────────
  // The advisor had no mode signal at all: the brief opened "Please size an
  // off-grid battery system for me" whatever the visitor had configured, so a
  // battery-only run could be answered with panels, an inverter and an
  // off-grid budget it does not have. These gates read the real brief the page
  // builds, in both modes, and both locales.
  const setMode = (hw, goal) => `(() => {
      const h = document.getElementById("hardwareConfig");
      h.value = "${hw}";
      h.dispatchEvent(new Event("change", { bubbles: true }));
      const g = document.getElementById("systemGoal");
      g.value = "${goal}";
      g.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`;

  await evaluate(setMode("battery", "gridtie"));
  const batteryBrief = String(
    await evaluate(`String(buildIntakeBrief ? buildIntakeBrief() : "")`),
  );
  gate(
    "advisor brief states a battery-only run builds no solar panels",
    /BATTERY ONLY/.test(batteryBrief) &&
      /NO solar panels/i.test(batteryBrief) &&
      /out of scope/i.test(batteryBrief),
    batteryBrief.slice(0, 200),
  );
  gate(
    "advisor brief bars panel advice on a battery-only run",
    /Do not assume, recommend, or cost any panels/i.test(batteryBrief) &&
      /grid-tied/.test(batteryBrief),
    batteryBrief.slice(0, 200),
  );
  gate(
    "advisor brief never promises a bill cut the battery cannot deliver",
    /do not promise a bill cut/i.test(batteryBrief),
    batteryBrief.slice(0, 200),
  );

  await evaluate(setMode("both", "gridtie"));
  const panelsBrief = String(
    await evaluate(`String(buildIntakeBrief ? buildIntakeBrief() : "")`),
  );
  gate(
    "advisor brief still names the array on a with-panels run",
    /battery plus solar panels/i.test(panelsBrief) &&
      !/BATTERY ONLY/.test(panelsBrief),
    panelsBrief.slice(0, 200),
  );

  // The mode-blind "before adding panels ... a real off-grid budget" copy rode
  // on a block whose #gridEqBox/#gridEqText never existed in any page, so its
  // own guard made it unreachable. Pin BOTH facts: the ids stay absent, and the
  // copy is gone from the shipped source.
  gate(
    "grid-equivalence box is absent from the page (its copy was never reachable)",
    (await evaluate(
      `!document.getElementById("gridEqBox") && !document.getElementById("gridEqText")`,
    )) === true,
  );

  // German: the brief is an English prompt to the model by design, but the
  // mode branch must survive a language switch - a battery-only visitor who
  // picked German still gets a no-panels brief, not an untranslated fallback.
  const langSwitch = (lang) => `(() => {
      const p = document.getElementById("langSelect");
      if (!p) return "no-picker";
      p.value = "${lang}";
      p.dispatchEvent(new Event("change", { bubbles: true }));
      return String(p.value);
    })()`;

  const langSet = String(await evaluate(langSwitch("de")));
  await evaluate(setMode("battery", "gridtie"));
  const germanBatteryBrief = String(
    await evaluate(`String(buildIntakeBrief ? buildIntakeBrief() : "")`),
  );
  gate(
    "advisor brief keeps the battery-only branch in German",
    langSet === "de" &&
      /BATTERY ONLY/.test(germanBatteryBrief) &&
      /NO solar panels/i.test(germanBatteryBrief),
    `lang=${langSet} ` + germanBatteryBrief.slice(0, 180),
  );
  await evaluate(langSwitch("en"));
  await evaluate(setMode("both", "gridtie"));
}

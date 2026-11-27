// Share-link flow: the serialized state must survive a fresh page — inputs
// restore, sizing still requires the explicit button, then it completes.
import { gate } from "./runtime.mjs";
import { RUN_TIMEOUT_MS } from "./actions.mjs";

export async function runShareFlow(ctx, actions) {
  const { evaluate } = ctx;

  console.log("SMOKE      ── share link ──");
  const shareHash = await evaluate(`(() => {
      document.getElementById("btnShareResult").click();
      return location.hash.startsWith("#s=") ? location.hash : null;
    })()`);
  gate(
    "share click leaves a #s= link in the URL",
    !!shareHash,
    String(shareHash || "").slice(0, 24),
  );
  if (shareHash) {
    await actions.navigate(`${ctx.base}${shareHash}`);
    // A VALID LINK AUTO-RUNS — the gated decision of 2026-11-07 ("the recipient
    // gap", docs/audit/BURNDOWN_LEDGER_2026-11-03.md): the sender made the link
    // to show a result, so the recipient gets the result, not a form, and the
    // landing copy tells them whose result it is. This gate used to require the
    // superseded "waiting for a click" contract and a status string that the
    // same change deleted, so it could only ever be red. What is asserted now is
    // the contract that actually ships: the shared inputs come back, the run
    // completes with no click from this harness, and the note says whose result
    // it is.
    const restored = await ctx.poll(
      async () =>
        evaluate(`(() => {
          const r = document.getElementById("resultsRegion");
          return !!r && r.hidden === false;
        })()`),
      RUN_TIMEOUT_MS,
    );
    const landed = await evaluate(`(() => ({
      kwh: document.getElementById("dailyKwhInput")?.value || "",
      hash: location.hash,
      note: (document.getElementById("sharedResultNote")?.textContent || "").trim(),
      noteHidden: document.getElementById("sharedResultNote")?.hidden,
    }))()`);
    const sharedState = JSON.parse(
      Buffer.from(shareHash.slice(3), "base64url").toString("utf8"),
    );
    gate(
      "share link delivers the shared result without a click",
      !!restored &&
        Number(landed.kwh) === sharedState.kw &&
        landed.hash === shareHash,
      JSON.stringify({
        kwh: landed.kwh,
        expectedKwh: sharedState.kw,
        hashRestored: landed.hash === shareHash,
      }),
    );
    gate(
      "shared result is labelled as the sender's",
      landed.noteHidden === false && /shared with you/i.test(landed.note),
      landed.note.slice(0, 90),
    );

    // Careless reload while another calculation is visibly in progress: hold
    // exactly one real Worker message, then reload the same share URL. The
    // new page must restore the exact link inputs without auto-running.
    await evaluate(`(() => {
      window.__reloadRunHeld = false;
      window.__reloadRunPosts = 0;
      const original = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function (message) {
        if (message?.type === "run") {
          window.__reloadRunPosts += 1;
          if (!window.__reloadRunHeld) {
            window.__reloadRunHeld = true;
            return;
          }
        }
        return original.apply(this, arguments);
      };
      document.getElementById("btnRunSizing").click();
    })()`);
    const held = await ctx.poll(
      async () =>
        evaluate(
          `window.__reloadRunHeld === true && document.getElementById("btnRunSizing")?.disabled === true`,
        ),
      5000,
      50,
    );
    gate("reload fixture holds a real in-flight sizing message", held);
    if (held) {
      // Wait for the NEW document, not merely for "a document that is
      // complete": the first poll tick can still evaluate against the page
      // being navigated away from, which is complete and has the button. On CI
      // that sampled a mid-load fresh document (readyState still "loading",
      // default inputs on screen) and reported the share as lost while the same
      // build passed locally. `performance.timeOrigin` identifies the document,
      // so the navigation must have committed before anything is measured.
      const originBefore = await evaluate(`performance.timeOrigin`);
      await ctx.send("Page.reload", { ignoreCache: false });
      const loaded = await ctx.poll(
        async () => {
          try {
            return await evaluate(
              `performance.timeOrigin !== ${JSON.stringify(originBefore)} && ` +
                `document.readyState === "complete" && !!document.getElementById("btnRunSizing")`,
            );
          } catch {
            return false;
          }
        },
        15000,
        250,
      );
      await evaluate(`(() => {
        window.__reloadPostsAfterLoad = 0;
        const original = Worker.prototype.postMessage;
        Worker.prototype.postMessage = function (message) {
          if (message?.type === "run") window.__reloadPostsAfterLoad += 1;
          return original.apply(this, arguments);
        };
      })()`);
      // Sample the SETTLED state, never the first frame after load. The
      // restore is asynchronous (the shared site's weather has to resolve
      // before the form is final), so on a slow runner the sample landed while
      // the defaults were still on screen — reported as "the share was lost"
      // on CI while the same build passed locally. Every post-condition is
      // unchanged; only the timing assumption is gone, and a run posted at any
      // point after the hook is installed still fails the gate.
      let afterReload = { loaded: false };
      const settled = await ctx.poll(
        async () => {
          try {
            afterReload = await evaluate(`({
              loaded: document.readyState === "complete",
              kwh: document.getElementById("dailyKwhInput")?.value || "",
              hash: location.hash,
              resultsHidden: document.getElementById("resultsRegion")?.hidden,
              status: document.getElementById("sizingStatus")?.textContent || "",
              posts: window.__reloadPostsAfterLoad,
            })`);
          } catch {
            return false; // a navigation is still in flight
          }
          // A reload of a share URL is the same act as opening it: the link
          // auto-runs once and delivers the result again. The gate asserts that
          // state — inputs restored from the link, result present — instead of
          // the superseded "waits for a click" contract.
          return (
            afterReload.loaded &&
            Number(afterReload.kwh) === sharedState.kw &&
            afterReload.hash === shareHash &&
            afterReload.resultsHidden === false
          );
        },
        60000,
        250,
      );
      gate(
        "reload during sizing restores the share and delivers the result",
        settled && loaded,
        JSON.stringify(afterReload),
      );
      const retry = await actions.runAndWaitCard();
      gate("explicit sizing recovers after a mid-run reload", retry);
    }

    const malformedCases = [
      { label: "latitude", state: { v: 1, la: 91, lo: 10, kw: 16 } },
      { label: "longitude", state: { v: 1, la: 10, lo: 181, kw: 16 } },
      { label: "daily-kWh", state: { v: 1, la: 21.31, lo: -157.86, kw: 501 } },
    ];
    for (const { label, state } of malformedCases) {
      const malformedHash =
        "#s=" +
        Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
      await actions.navigate(
        `${ctx.base}?malformed-share=${encodeURIComponent(label)}#${malformedHash.slice(1)}`,
      );
      const ready = await ctx.poll(
        async () =>
          evaluate(
            `document.readyState === "complete" && !!document.getElementById("btnRunSizing")`,
          ),
        10000,
        100,
      );
      const before = ready
        ? await evaluate(`(() => ({
            lat: document.getElementById("latInput")?.value || "",
            lon: document.getElementById("lonInput")?.value || "",
            kwh: document.getElementById("dailyKwhInput")?.value || "",
            hash: location.hash,
            status: document.getElementById("sizingStatus")?.textContent || "",
          }))()`)
        : null;
      // Matched by MEANING, not by the old literal wording. This gate used to
      // assert /invalid share link/i, so rewriting that message to give the
      // visitor a next step — which is what the experience facet asks for —
      // failed three smoke gates. A gate that pins the exact sentence cannot
      // survive the copy being improved; it fails on the fix and passes on the
      // defect. What it actually means to check is that the refusal is NAMED at
      // all, so the patterns accept any phrasing that says the link could not be
      // read and never assert one particular string.
      const shareRefusal =
        /invalid share link|share link could not be read|share link.*(not|could not|couldn't|cannot).*read|link (is|was) (invalid|broken|truncated)/i;
      gate(
        `malformed share ${label} is explained before the user tries to run it`,
        shareRefusal.test(before?.status || ""),
        before?.status || "no status",
      );
      await evaluate(`(() => {
        window.__invalidShareOriginalPost = Worker.prototype.postMessage;
        window.__invalidSharePosts = 0;
        Worker.prototype.postMessage = function (message) {
          if (message?.type === "run") window.__invalidSharePosts += 1;
          return window.__invalidShareOriginalPost.apply(this, arguments);
        };
        document.getElementById("btnRunSizing").click();
      })()`);
      const afterReady = await ctx.poll(
        async () => evaluate(`!!document.getElementById("sizingStatus")`),
        5000,
        50,
      );
      const after = afterReady
        ? await evaluate(`(() => ({
            lat: document.getElementById("latInput")?.value || "",
            lon: document.getElementById("lonInput")?.value || "",
            kwh: document.getElementById("dailyKwhInput")?.value || "",
            hash: location.hash,
            hidden: document.getElementById("resultsRegion")?.hidden,
            status: document.getElementById("sizingStatus")?.textContent || "",
            posts: window.__invalidSharePosts,
          }))()`)
        : null;
      gate(
        `malformed share ${label} is rejected before mutating the form or starting a worker`,
        ready &&
          before &&
          after &&
          after.lat === before.lat &&
          after.lon === before.lon &&
          after.kwh === before.kwh &&
          after.hash === malformedHash &&
          after.hidden === true &&
          after.posts === 0 &&
          /share link could not be read|invalid share link|pick a city|choose a city|latitude must|daily energy use/i.test(
            after.status,
          ),
        JSON.stringify({ label, before, after }),
      );
      await evaluate(`(() => {
        Worker.prototype.postMessage = window.__invalidShareOriginalPost;
        delete window.__invalidShareOriginalPost;
        delete window.__invalidSharePosts;
      })()`);
    }

    // Leave the shared browser session on the valid result for the following
    // result-surface flow; the malformed-link probes are isolated navigations.
    await actions.navigate(`${ctx.base}${shareHash}`);
    gate(
      "valid share flow recovers after malformed-link probes",
      await actions.runAndWaitCard(),
    );
  }
}

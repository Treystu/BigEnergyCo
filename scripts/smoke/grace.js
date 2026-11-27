// Bad-window grace (#435): both states this suite owns, driven through the
// real page with the fault forced.
//
// The weather half of the issue is already broken on purpose by
// scripts/smoke/resilience.mjs (six transport failures, one cold run each) and
// its offline disclosure is read from the run's own status line. What had no
// forced-fault drive was the other two visitor-facing windows:
//
//   · the advisor unreachable — the client used to clear the box and discard
//     the typed question, so the "try again" its copy asked for meant retyping
//     it. The gate below fails if the question is not handed back, and then
//     proves the retry actually completes instead of only looking retryable.
//   · a shared link whose parameters no longer resolve — decode-valid JSON
//     from an older schema. The page must say the link could not be read rather
//     than restore a guess, and the form underneath must still work.
//
// Neither state is inferred from source: the advisor request is failed at the
// Fetch domain (the same instrument resilience.mjs uses for NASA), and the
// share link is a real navigation to a hash the codec refuses.
import { gate } from "./runtime.mjs";
import { RUN_TIMEOUT_MS } from "./actions.mjs";
import { chooseCity, installNasaInterceptor } from "./resilience.mjs";

const CHAT = /\/api\/chat(\?|$)/;
const QUESTION = "What size battery do I need for a 3 kWh/day home?";
const CARD = "Total 20-year cost";

/** The last bot bubble that is not the Thinking… placeholder. */
const LAST_BOT = `(() => {
  const all = document.querySelectorAll('#chatWindow .chat-msg.bot:not(#loadingMsg)');
  const n = all[all.length - 1];
  return { count: all.length, text: n ? (n.textContent || "").trim() : "" };
})()`;

export async function runGraceFlow(ctx, actions) {
  const { evaluate, poll } = ctx;

  // ── 1. The advisor cannot be reached at all ──────────────────────────────
  console.log("SMOKE      ── bad windows: advisor unreachable ──");
  await actions.navigate(`${ctx.base}?smoke=${Date.now()}`);
  await poll(
    async () => await evaluate(`!!document.getElementById("chatInput")`),
    30000,
    500,
  );

  const net = installNasaInterceptor(ctx, { pattern: CHAT });
  await net.enable();
  await net.set({ action: "fail", reason: "Failed" });

  const baseline = await evaluate(`(${LAST_BOT}).count`);
  await evaluate(`(() => {
    const input = document.getElementById("chatInput");
    input.value = ${JSON.stringify(QUESTION)};
    window.sendChatMsg();
    return true;
  })()`);

  let failed = { count: baseline, text: "", input: "", sendDisabled: null };
  const failedShown = await poll(
    async () => {
      failed = await evaluate(`(() => {
        const bot = ${LAST_BOT};
        return {
          count: bot.count,
          text: bot.text,
          input: document.getElementById("chatInput")?.value || "",
          sendDisabled: document.getElementById("btnSendChat")?.disabled === true,
        };
      })()`);
      return (
        failed.count > baseline &&
        /unreachable|try again|check your connection/i.test(failed.text)
      );
    },
    20000,
    400,
  );
  gate(
    "advisor failure is stated in words, in place",
    failedShown === true,
    `text=${String(failed.text).slice(0, 90)}`,
  );
  gate(
    "advisor failure hands the question back for a one-click retry",
    failed.input === QUESTION,
    `input=${String(failed.input).slice(0, 60)}`,
  );
  gate(
    "advisor failure leaves the send control usable",
    failed.sendDisabled === false,
    `disabled=${failed.sendDisabled}`,
  );

  // The copy says "try again in a moment". Prove that is true: the very next
  // send, with the interceptor released, has to produce an answer.
  await net.release();
  const baselineRetry = failed.count;
  await evaluate(`(() => {
    const input = document.getElementById("chatInput");
    if (!input.value.trim()) input.value = ${JSON.stringify(QUESTION)};
    window.sendChatMsg();
    return true;
  })()`);
  const retried = await poll(
    async () => {
      const now = await evaluate(LAST_BOT);
      return (
        now.count > baselineRetry &&
        now.text.length > 40 &&
        !/unreachable right now/i.test(now.text)
      );
    },
    60000,
    500,
  );
  gate(
    "advisor recovers on the retry the failure copy promised",
    retried === true,
  );

  // ── 2. A shared link whose parameters no longer resolve ──────────────────
  console.log("SMOKE      ── bad windows: unresolvable share link ──");
  // Decode-valid JSON, older schema: the codec must refuse it rather than
  // restore a half-understood guess that then sizes the wrong house.
  const stale = Buffer.from(
    JSON.stringify({ v: 0, la: 21.31, lo: -157.86, kw: 12 }),
    "utf8",
  ).toString("base64url");
  await actions.navigate(`${ctx.base}#s=${stale}`);
  const refused = await poll(
    async () => {
      const text = await evaluate(
        `document.getElementById("sizingStatus")?.textContent || ""`,
      );
      return /share link could not be read|invalid share link/i.test(text);
    },
    10000,
    300,
  );
  const state = await evaluate(`(() => ({
    results: document.getElementById("resultsRegion")?.hidden === true,
    kwh: document.getElementById("dailyKwhInput")?.value || "",
    disabled: document.getElementById("dailyKwhInput")?.disabled === true,
  }))()`);
  gate(
    "an unresolvable share link is refused in words",
    refused === true,
    JSON.stringify(state),
  );
  gate(
    "an unresolvable share link does not auto-run or half-restore",
    state.results === true && state.kwh === "" && state.disabled === false,
    JSON.stringify(state),
  );

  // The copy tells the visitor to set up their own estimate below; the form
  // has to be that, so drive it to a real card.
  const located = await chooseCity(ctx, "Honolulu");
  gate(
    "the fresh form under a refused link still takes a location",
    located === true,
  );
  await evaluate(`(() => {
    const input = document.getElementById("dailyKwhInput");
    input.value = "9";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  await new Promise((r) => setTimeout(r, 200));
  await evaluate(`document.getElementById("btnRunSizing").click()`);
  const recovered = await poll(
    async () =>
      (await evaluate(`(() => {
        const region = document.getElementById("resultsRegion");
        return document.body.textContent.includes(${JSON.stringify(CARD)}) &&
          !!region && region.hidden === false;
      })()`)) === true,
    RUN_TIMEOUT_MS,
    500,
  );
  gate(
    "the recovery the refused-link copy points at really sizes",
    recovered === true,
  );
}

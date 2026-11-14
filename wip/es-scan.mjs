// Measured read of the results surface in Spanish (#365 / E13).
// Drives the built staging artifact in a real browser, runs one sizing, and
// splits #resultsRegion's rendered text into sentences. A sentence counts as
// English-only when it matches an English source string in the copy table, or
// when it carries English function words and no Spanish ones.
import { start, sleep } from "../scripts/smoke/runtime.mjs";
import { writeFileSync } from "node:fs";
import { RESULT_COPY } from "../assets/js/shared/result-copy.js";

const BASE = process.argv[2];
if (!BASE) throw new Error("usage: node wip/es-scan.mjs <base-url>");

const norm = (s) =>
  s
    .replace(/\s+/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/[“”«»]/g, '"')
    .trim();

const EN = new Set(
  Object.values(RESULT_COPY.en).map((v) => norm(String(v).replace(/\{[^}]+\}/g, " ").replace(/\s+/g, " "))).filter((v) => v.length > 12),
);

const EN_WORDS = /\b(the|your|this|with|and|never|bill|from|that|which|before|after|rather|every|only|shows?|click|cell|matrix|battery|system|cost|year|years|need|needs|winter|summer|recommended|cheapest)\b/i;
const ES_WORDS = /\b(el|la|los|las|tu|tus|de|del|con|sin|que|para|por|una|un|es|son|más|más|años|batería|factura|sistema|coste|recomendado|clic|celda|matriz|nunca|solo|invierno|verano|coste)\b/i;

const ctx = await start();
const { send, evaluate, close } = ctx;
try {
  await send("Page.enable");
  await send("Runtime.enable");
  const navigate = async (url) => {
    await send("Page.navigate", { url });
    await sleep(6000);
  };
  await navigate(BASE);
  await evaluate(`localStorage.setItem("beco-lang","es"); true`);
  await navigate(BASE);
  const lang = await evaluate(`document.documentElement.lang`);
  console.log("document lang:", lang);

  // One sizing run: Phoenix coordinates, 20 kWh/day, goal = bill cut.
  const setup = await evaluate(`(async () => {
    const lat = document.getElementById("lat"); return !!lat;
  })()`);
  await evaluate(`(() => {
    const s = document.getElementById("citySearch");
    s.focus(); s.value = "Phoenix";
    s.dispatchEvent(new InputEvent("input", { bubbles: true }));
    return true;
  })()`);
  let ok = false;
  for (let i = 0; i < 30 && !ok; i++) {
    ok = (await evaluate(`document.querySelectorAll('#citySuggestions [role="option"]').length`)) > 0;
    if (!ok) await sleep(500);
  }
  if (ok) await evaluate(`document.querySelector('#citySuggestions [role="option"]').click()`);
  await evaluate(`(() => {
    const m = document.getElementById("loadMode");
    if (m) { m.value = "kwh"; m.dispatchEvent(new Event("change", { bubbles: true })); }
    const k = document.getElementById("dailyKwhInput");
    if (k) { k.value = "20"; k.dispatchEvent(new Event("input", { bubbles: true })); k.dispatchEvent(new Event("change", { bubbles: true })); }
    const g = document.getElementById("systemGoal");
    if (g) { g.value = "cut"; g.dispatchEvent(new Event("change", { bubbles: true })); }
    return true;
  })()`);
  await evaluate(`document.getElementById("btnRunSizing").click()`);
  let shown = false;
  for (let i = 0; i < 120 && !shown; i++) {
    shown = await evaluate(`(() => { const r = document.getElementById("resultsRegion"); return !!r && !r.hidden && r.innerText.trim().length > 200; })()`);
    if (!shown) await sleep(2000);
  }
  console.log("results visible:", shown, "| setup city input:", setup);

  const text = await evaluate(`document.getElementById("resultsRegion").innerText`);
  writeFileSync("wip/es-results.txt", text, "utf8");
  const sentences = text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?…])\s+/))
    .map(norm)
    .filter((s) => s.split(" ").length >= 4 && /[A-Za-zÀ-ÿ]/.test(s));
  const english = sentences.filter((s) => {
    if (EN.has(s)) return true;
    const hits = (s.match(EN_WORDS) || []).length;
    const es = (s.match(ES_WORDS) || []).length;
    return hits >= 2 && es === 0;
  });
  console.log(`sentences: ${sentences.length}, english-only: ${english.length}`);
  writeFileSync("wip/es-english.txt", english.join("\n---\n"), "utf8");
  for (const s of english.slice(0, 40)) console.log("  EN:", s.slice(0, 160));
} finally {
  await close();
}

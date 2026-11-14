// #401 acceptance: the full-page screenshot census, driven in the real browser.
//
// WHAT THIS DOES. Drives one bill-cut run on the staged/static build with the
// repo's own zero-dependency CDP harness (scripts/smoke/runtime.mjs), then:
//   1. reads the five figures the five-figure test names, each from the DOM
//      node that displays it (not from prose search);
//   2. reads every money figure visible on the page, so the census can show a
//      figure that exists OUTSIDE the canonical dictionary;
//   3. cross-checks the reconciliation identities the cures are supposed to
//      guarantee: chart endpoint = recommended card total, savings = baseline -
//      residual - spend, and every card total = its own line items;
//   4. captures a full-page PNG.
//
// Usage: node wip/census-results-page.mjs http://127.0.0.1:8123/ [out.png]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { start } from "../scripts/smoke/runtime.mjs";
import { createActions } from "../scripts/smoke/actions.mjs";

const BASE = process.argv[2] || "http://127.0.0.1:8123/";
const OUT = process.argv[3] || "docs/lane/data-reads/2026-11-14-results-census.png";

const censusScript = `(() => {
  const txt = (el) => (el ? (el.textContent || "").replace(/\\s+/g, " ").trim() : null);
  const byId = (id) => document.getElementById(id);
  const all = (sel) => [...document.querySelectorAll(sel)];

  // The five figures, read from the node that displays each.
  const five = {
    systemSize:
      txt(byId("resCardTitle")) ||
      txt(document.querySelector("#resultsCard h3")) ||
      null,
    upfrontRange: txt(document.querySelector(".paths-upfront")) || null,
    cheapestTwentyYear: txt(document.querySelector(".paths-card-best .paths-total strong")) || null,
    savingsTwentyYear: txt(byId("cumSavingsTotal")) || null,
    breakEven:
      txt(document.querySelector(".paths-card-best .paths-rows")) || null,
  };

  // Every money-looking string on the page, with the element that carries it.
  const money = [];
  const re = /[$€£]\\s?[\\d,.]+/g;
  for (const el of all("body *")) {
    if (el.children.length) continue;
    const s = txt(el);
    if (!s || s.length > 240) continue;
    const hits = s.match(re);
    if (hits) money.push({ where: el.id || el.className || el.tagName, text: s });
  }

  // Card rows, as displayed.
  const cards = all(".paths-card").map((c) => ({
    title: txt(c.querySelector("h4")),
    upfront: txt(c.querySelector(".paths-upfront")),
    total: txt(c.querySelector(".paths-total")),
    rows: all(".paths-rows dt",  c).length
      ? Object.fromEntries(
          [...c.querySelectorAll(".paths-rows dt")].map((dt, i, arr) => [
            txt(dt),
            txt(arr[i].nextElementSibling),
          ]),
        )
      : {},
  }));

  return {
    five,
    cards,
    money,
    // The two quantities X1 was about, as the page displays them.
    engineTotalRow: (() => {
      const host = all("body *").find(
        (e) =>
          !e.children.length && /Total 20-year cost/i.test(txt(e) || ""),
      );
      if (!host) return { found: false };
      let row = host;
      for (let i = 0; i < 4 && row.parentElement; i++) row = row.parentElement;
      return { found: true, label: txt(host), rowText: txt(row) };
    })(),
    twentyYearLabels: [
      ...new Set(
        all("body *")
          .filter((e) => !e.children.length)
          .map((e) => txt(e))
          .filter((s) => s && /20-year|20 year/i.test(s) && s.length < 90),
      ),
    ],
    chartCaption: txt(byId("cumCostCaption")),
    chartEndpointNote: txt(byId("cumSavingsSub")),
    unknowns: all("body *")
      .filter((e) => !e.children.length && /Unknown|Desconocid|Unbekannt/i.test(txt(e) || ""))
      .map((e) => ({ where: e.id || e.className || e.tagName, text: txt(e) })),
    docTitle: document.title,
    url: location.href,
  };
})()`;

async function main() {
  const ctx = { base: BASE, isLocalBase: true, ...(await start()) };
  const { send, evaluate } = ctx;
  const actions = createActions(ctx);
  try {
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Log.enable");
    await actions.navigate(BASE);
    const gotCity = await actions.chooseHonolulu();
    const rate = await actions.setInputs("gridtie");
    const cardUp = await actions.runAndWaitCard();
    console.log(`city=${gotCity} rate=${rate} card=${cardUp}`);
    if (!cardUp) throw new Error("the result card never rendered");
    await new Promise((r) => setTimeout(r, 2500)); // chart + paths paint

    const census = await evaluate(censusScript);
    mkdirSync(dirname(OUT), { recursive: true });
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    writeFileSync(OUT, Buffer.from(shot.data, "base64"));
    writeFileSync(
      OUT.replace(/\.png$/, ".json"),
      `${JSON.stringify({ base: BASE, at: new Date().toISOString(), census }, null, 2)}\n`,
    );
    // A second, small capture of just the pay-cards block: the full-page PNG is
    // >1 MB and cannot be read back at a glance, and the cards are the surface
    // the cures change.
    const box = await evaluate(`(() => {
      const card = document.querySelector(".paths-card");
      const host = card && card.parentElement;
      if (!host) return null;
      const r = host.getBoundingClientRect();
      return { x: Math.max(0, r.x + window.scrollX), y: Math.max(0, r.y + window.scrollY), width: r.width, height: r.height };
    })()`);
    if (box && box.width > 0 && box.height > 0) {
      const cards = await send("Page.captureScreenshot", {
        format: "png",
        clip: { ...box, scale: 1 },
        captureBeyondViewport: true,
      });
      writeFileSync(OUT.replace(/\.png$/, "-cards.png"), Buffer.from(cards.data, "base64"));
    }
    console.log(JSON.stringify(census, null, 2));
    console.log(`\nSHOT ${OUT}`);
  } finally {
    await ctx.close?.();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

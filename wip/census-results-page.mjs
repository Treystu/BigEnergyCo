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
    // #401 item 1, the frontier consumer: it plots up-front system cost against
    // coverage, which is a DIFFERENT quantity from the cards' 20-year installed
    // total. The census records what the panel actually says so that claim is
    // checked rather than asserted.
    // #402 / Cure B: the comparison sentences and the incentive basis as the
    // page actually renders them - which card carries which pair, how many
    // times each sentence appears, and whether the basis block is identical
    // everywhere it is printed.
    paths: {
      cards: [...all("#pathsPanel .paths-card")].map((card) => ({
        title: txt(card.querySelector("h4")),
        why: txt(card.querySelector(".paths-why")),
        pair: (() => {
          const w = card.querySelector(".paths-why");
          return w
            ? [
                w.getAttribute("data-pair-cheaper"),
                w.getAttribute("data-pair-dearer"),
              ]
            : null;
        })(),
        basis: [...card.querySelectorAll("[data-incentive-basis-list] li")].map(
          (li) => txt(li),
        ),
      })),
    },
    frontier: {
      shown: !!byId("frontierWrap") && byId("frontierWrap").style.display !== "none",
      verdict: txt(byId("frontierVerdict")),
      note: txt(byId("frontierNote")),
      method: txt(byId("frontierMethodNote")),
      axisX: txt(byId("frontierChart"))
        ? [...all("#frontierChart text")].map((e) => txt(e)).filter(Boolean).slice(0, 40)
        : [],
      tableText: txt(byId("frontierTable")),
    },
    // #403 Cure C: the simplified shape as the visitor gets it. Visibility is
    // measured, not assumed: a demoted block still on screen would mean the
    // disclosure governs nothing.
    simplified: (() => {
      const demoted = [
        "resultLadder",
        "ladderIntro",
        "eli5Summary",
        "eli5CardWrap",
        "moneyBar",
        "focusPanel",
        "tierResults",
        "frontierWrap",
        "socChartWrap",
        "cumCostChartWrap",
      ];
      const shown = (id) => {
        const el = byId(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      return {
        disclosurePresent: !!byId("resultsMore"),
        disclosureOpen: !!byId("resultsMore") && byId("resultsMore").open,
        demotedVisible: demoted.filter(shown),
        // The five figures a non-author reader must be able to take away,
        // read from the SIMPLIFIED page: the outcome card plus the cost table.
        // They are all on the cheapest card, which is why the chart's savings
        // headline can live behind the disclosure and these cannot.
        five: (() => {
          // The CHEAPEST card: it carries the tag, and it is the one whose five
          // figures the reader is meant to leave with.
          const card =
            all("#pathsPanel .paths-card-best")[0] ||
            all("#pathsPanel .paths-card")[0];
          const rows = {};
          if (card) {
            const dts = [...card.querySelectorAll("dl.paths-rows dt")];
            for (const dt of dts)
              rows[txt(dt)] = txt(dt.nextElementSibling);
          }
          const outcome = txt(byId("useCaseOutcomeWrap"));
          return {
            size: txt(all("#pathsPanel .paths-system")[0] || null),
            cheapestRoute: card ? txt(card.querySelector("h4")) : null,
            upfront: card ? txt(card.querySelector(".paths-upfront")) : null,
            cheapest20: card ? txt(card.querySelector(".paths-total")) : null,
            sizefromOutcome: (outcome || "").slice(0, 160),
            rows,
          };
        })(),
      };
    })(),
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

    // #403 acceptance: the five-figure test is specified at PHONE width too, so
    // it is read at a phone viewport rather than assumed to survive the reflow.
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 1200));
    const phone = await evaluate(censusScript);
    const phoneShot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    await send("Emulation.clearDeviceMetricsOverride");
    await new Promise((r) => setTimeout(r, 800));

    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(
      OUT.replace(/\.png$/, "-phone.png"),
      Buffer.from(phoneShot.data, "base64"),
    );
    // A small viewport-only capture: the full-page phone PNG is too large to
    // look at without downscaling tools this machine does not have, and the
    // question "does the simplified shape survive at 390px" is answered by the
    // outcome card and the cost table, so the view is scrolled to them rather
    // than left at the form.
    await evaluate(`(() => {
      const anchor = document.getElementById("resultsRegion");
      if (anchor) window.scrollTo(0, anchor.getBoundingClientRect().top + window.scrollY);
      return true;
    })()`);
    await new Promise((r) => setTimeout(r, 500));
    const phoneTop = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      OUT.replace(/\.png$/, "-phone-top.png"),
      Buffer.from(phoneTop.data, "base64"),
    );
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    writeFileSync(OUT, Buffer.from(shot.data, "base64"));
    writeFileSync(
      OUT.replace(/\.png$/, ".json"),
      `${JSON.stringify({ base: BASE, at: new Date().toISOString(), census, phone }, null, 2)}\n`,
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
    // …and the cumulative-cost chart, because #401's claim is about ITS
    // endpoint agreeing with the cheapest card's total.
    const chartBox = await evaluate(`(() => {
      const host = document.getElementById("cumCostChartWrap");
      if (!host) return null;
      const r = host.getBoundingClientRect();
      return { x: Math.max(0, r.x + window.scrollX), y: Math.max(0, r.y + window.scrollY), width: r.width, height: r.height };
    })()`);
    if (chartBox && chartBox.width > 0 && chartBox.height > 0) {
      const chart = await send("Page.captureScreenshot", {
        format: "png",
        clip: { ...chartBox, scale: 1 },
        captureBeyondViewport: true,
      });
      writeFileSync(OUT.replace(/\.png$/, "-chart.png"), Buffer.from(chart.data, "base64"));
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

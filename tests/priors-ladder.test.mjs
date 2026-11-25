// #440 (GQ F11) — the ladder is presentation order, so its contract is pinned.
//
// The prior model itself lives in assets/js/sizing/intake-priors.js (landed with
// #462) with its own fixture suite in tests/intake-priors.test.mjs. This file
// pins the SURFACE: the ladder renders the registry's six cases from that one
// ranking, why-lines are hedged dictionary copy, a pick wins through the single
// writer, and the estimate summary states defaults without inventing a price.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  rankCases,
  PRIOR_FEATURES,
} from "../assets/js/sizing/intake-priors.js";
import { USE_CASE_IDS, USE_CASES } from "../assets/js/sizing/usecases.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ui = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const locales = readFileSync(
  new URL("../assets/js/shared/locales.js", import.meta.url),
  "utf8",
);

const WHY_CODES = [
  "whyHighRates",
  "whyGoodSun",
  "whyTouBattery",
  "whyOutageBackup",
  "whySuburbanSolarBackup",
  "whyReserve",
  "whyRuralOffgrid",
];

test("#440: the ladder is the registry's six cases, in the registry's order", () => {
  assert.equal(USE_CASE_IDS.length, 6);
  assert.deepEqual(
    rankCases({}).map((r) => r.id),
    USE_CASE_IDS,
    "a feature-poor place shows the registry order",
  );
  assert.ok(html.includes('id="caseLadder"'), "one ladder control");
  assert.ok(
    ui.includes("rankCases(ladderFeatures)"),
    "rows render from the ranking, not hard-coded",
  );
  assert.match(ui, /t\(c\.labelKey\)/, "labels come from the registry's key");
});

test("#440: one prior model, not a second copy", () => {
  assert.ok(
    !existsSync(new URL("../assets/js/sizing/priors.js", import.meta.url)),
    "the ranking lives in intake-priors.js only",
  );
  assert.match(
    ui,
    /import \{ rankCases \} from "\.\/intake-priors\.js\?v=/,
    "ui.js reads the canonical prior model",
  );
  // Every feature the ranking may read still declares a source and a grade.
  for (const f of PRIOR_FEATURES) {
    assert.ok(f.source, `${f.id} names its source`);
    assert.match(f.grade, /^[ABC]$/, `${f.id} carries a grade`);
  }
});

test("#440: only features with a live source feed the ladder", () => {
  // The tariff registry supplies the rate; the band is the live feature.
  assert.match(
    ui,
    /f\.tariffLevel = rate >= 0\.25 \? "high" : rate >= 0\.15 \? "medium" : "low"/,
    "the rate band is wired",
  );
  for (const absent of [
    "f.touSpread",
    "f.outageExposure",
    "f.placeClass",
    "f.exportRegime",
    "f.solarResource",
  ])
    assert.ok(
      !ui.includes(absent),
      `${absent} has no live source yet and must stay absent, not guessed`,
    );
});

test("#440: why-lines are hedged, short, and translated in every locale", () => {
  for (const key of WHY_CODES) {
    const hits = locales.match(new RegExp(`^\\s+${key}:`, "gm")) || [];
    assert.equal(hits.length, 7, `${key} is translated in all seven locales`);
  }
  const en = locales.slice(0, locales.indexOf("\n  es: {"));
  for (const key of WHY_CODES) {
    const m = new RegExp(`^\\s+${key}:\\s*\\n?\\s*"([^"]+)"`, "m").exec(en);
    assert.ok(m, `${key} has English copy`);
    assert.ok(m[1].length <= 90, `${key} is at most 90 characters`);
    assert.match(
      m[1],
      /likely|common|usual|probable/i,
      `${key} hedges rather than asserting`,
    );
  }
});

test("#440: priors order the list and never remove a case", () => {
  for (const features of [
    {},
    { tariffLevel: "high" },
    { tariffLevel: "low" },
  ]) {
    const rows = rankCases(features);
    assert.deepEqual(
      [...rows.map((r) => r.id)].sort(),
      [...USE_CASE_IDS].sort(),
    );
  }
  for (const id of USE_CASE_IDS)
    assert.ok(USE_CASES[id].metric.id, `${id} keeps its own metric`);
});

test("#440: the ladder never gates the run and a pick commits at once", () => {
  assert.match(
    html,
    /id="btnRunSizing"/,
    "the primary stays the explicit button",
  );
  assert.doesNotMatch(html, /id="modeToggleRow"/, "no mode fork returns");
  assert.match(
    ui,
    /applyUseCase\(id\);\s*\r?\n\s*paintLadderSelection\(\)/,
    "a pick applies through the one writer",
  );
  assert.match(ui, /id === "billcut"\) return "btnGoalGridtie"/);
  assert.match(ui, /id === "offgrid"\) return "btnGoalOffgrid"/);
});

test("#440: the ladder repaints after the deferred dictionary lands", () => {
  // Built during setup, before locales.js resolves, so without this repaint the
  // rendered rows show the echoed keys ("useCaseBillCut", "whyHighRates").
  const body =
    /function repaintRuntimeCopy\(\) \{[\s\S]*?\n\}/.exec(ui)?.[0] || "";
  assert.match(
    body,
    /renderCaseLadder\(\);/,
    "the ladder repaints on language",
  );
  assert.match(body, /renderEstimateCard\(\);/, "the estimate repaints too");
});

test("#440: the estimate and the ranking follow the location in place", () => {
  // A resolved place can move the rate band: the tariff writer re-derives the
  // features, and both surfaces repaint without a reload (spec 11.6).
  const tariff =
    /function applyEstimatedTariff\([\s\S]*?\n\}/.exec(ui)?.[0] || "";
  assert.match(tariff, /renderCaseLadder\(featuresFromLocation\(\)\)/);
  assert.match(tariff, /renderEstimateCard\(\)/);
  // A drag on either control re-renders the card in place.
  const bill =
    /function paintBillSliderLabel\([\s\S]*?\n\}/.exec(ui)?.[0] || "";
  assert.match(bill, /renderEstimateCard\(\)/);
  const cut = /function syncCutControls\([\s\S]*?\n\}/.exec(ui)?.[0] || "";
  assert.match(cut, /renderEstimateCard\(\)/);
});

test("#440: the estimate summary states defaults, never a priced figure", () => {
  assert.ok(html.includes('id="estimateCard"'), "the card exists");
  assert.ok(html.includes('id="estimateBasis"'), "its basis line exists");
  assert.ok(html.includes('id="estimateBill"'), "the bill default");
  assert.ok(html.includes('id="estimateLoad"'), "the load default");
  assert.ok(html.includes('id="estimateCut"'), "the cut default");
  assert.match(ui, /set\("estimateBill", Number\.isFinite\(bill\)/);
  assert.match(ui, /t\("estimateBasis", \{ rate: rate\.toFixed\(2\) \}\)/);
});

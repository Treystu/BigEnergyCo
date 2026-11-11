// Champion Audit #355 - tariff and equipment-price estimation.
//
// The audit's claim is that adjacent LAYERS disagree by enough to move a
// payback by more than a year and to flip the purchase-path winner. These pins
// hold the arithmetic that turns a rate step into those two numbers:
//
//   1. payback falls as the tariff rises, on the same capex - so a boundary step
//      in rate is a boundary step in payback, in a known direction;
//   2. capex carries the LAYER's own labour and landed multipliers, which is
//      what makes two adjacent layers differ in more than their rate;
//   3. the acceptance reads the winner-flip SHARE against 10% and any payback
//      delta above a year, and fires on either;
//   4. the audience sample is the dropdown's own presets, not a latitude grid -
//      the grid overweights ocean and makes the 0.28 fallback look common.
//
// Run: node --test tests/champion-audit-tariffLayers.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { CITY_PRESETS } from "../assets/js/sizing/nasa.js";
import {
  capexFor,
  marginalise,
  paybackYears,
  presetCensus,
  summarize,
} from "../scripts/champion-audit-tariffLayers.mjs";

test("#355: payback falls as the tariff rises, on the same system", () => {
  const cheap = { rate: 0.1, laborF: 1, landedF: 1 };
  const dear = { rate: 0.4, laborF: 1, landedF: 1 };
  const pCheap = paybackYears(cheap);
  const pDear = paybackYears(dear);
  assert.ok(pCheap > pDear, "a cheaper tariff must take longer to pay back");
  // 4x the rate is a quarter of the payback, since capex is held constant.
  assert.ok(Math.abs(pCheap / pDear - 4) < 1e-9);
});

test("#355: capex carries the layer's own labour and landed multipliers", () => {
  const base = { rate: 0.2, laborF: 1, landedF: 1 };
  const dearLabor = { rate: 0.2, laborF: 1.7, landedF: 1 };
  const dearLanded = { rate: 0.2, laborF: 1, landedF: 1.6 };
  assert.ok(capexFor(dearLabor) > capexFor(base));
  assert.ok(capexFor(dearLanded) > capexFor(base));
  assert.ok(capexFor(dearLanded) > capexFor(dearLabor));
});

test("#355: layer shares are a partition of the census", () => {
  const points = [
    { label: "A", rate: 0.1, laborF: 1, landedF: 1 },
    { label: "A", rate: 0.1, laborF: 1, landedF: 1 },
    { label: "B", rate: 0.2, laborF: 1.5, landedF: 1.1 },
  ];
  const layers = marginalise(points);
  assert.equal(layers.length, 2);
  assert.equal(layers[0].label, "A");
  assert.equal(
    layers.reduce((s, l) => s + l.points, 0),
    points.length,
  );
  assert.ok(Math.abs(layers.reduce((s, l) => s + l.share, 0) - 1) < 1e-9);
});

test("#355: the acceptance fires on a payback step OR a winner-flip share", () => {
  const b = (paybackDelta, winnerFlips) => ({
    paybackDelta,
    paybackA: 5,
    paybackB: 5 + paybackDelta,
    winnerA: winnerFlips ? "selfpurchase" : "lease",
    winnerB: "lease",
    winnerFlips,
  });

  // One boundary moving payback by 1.4 years is enough on its own.
  const oneBig = summarize([
    b(0.1, false),
    b(1.4, false),
    b(0.1, false),
    b(0.1, false),
  ]);
  assert.equal(oneBig.overPaybackLimit, 1);
  assert.equal(oneBig.mustRebaseOrLabel, true);

  // Flipping on more than 10% of samples is enough on its own.
  const manyFlips = summarize([
    b(0.1, true),
    b(0.1, false),
    b(0.1, false),
    b(0.1, false),
  ]);
  assert.equal(manyFlips.winnerFlips, 1);
  assert.equal(manyFlips.winnerSamples, 4);
  assert.equal(manyFlips.mustRebaseOrLabel, true);

  // Quiet boundaries stay quiet.
  const calm = summarize([
    b(0.05, false),
    b(0.1, false),
    b(0.2, false),
    b(0.3, false),
    b(0.4, false),
    b(0.5, false),
    b(0.6, false),
    b(0.7, false),
    b(0.8, false),
    b(0.9, false),
    b(0.95, false),
  ]);
  assert.equal(calm.winnerFlips, 0);
  assert.equal(calm.mustRebaseOrLabel, false);
});

test("#355: the audience sample is the dropdown's own presets", () => {
  const census = presetCensus();
  assert.equal(census.length, CITY_PRESETS.length);
  for (const p of census) {
    assert.ok(Number.isFinite(p.rate), `${p.name} produced no rate`);
    assert.ok(typeof p.label === "string" && p.label.length > 0);
  }
  // Every preset must be sampled, so the fallback share is audience-weighted
  // rather than a property of a latitude grid.
  assert.ok(CITY_PRESETS.length > 50);
});

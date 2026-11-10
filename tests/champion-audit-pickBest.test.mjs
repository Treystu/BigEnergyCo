// Champion Audit #349 - the chemistry recommendation's 10% margin.
//
// `pickBest` is sodium-first: LFP takes the headline only when it beats sodium's
// 20-year lifetime cost by more than COST_MARGIN (0.1). These tests pin the three
// facts the audit rests on, so a future change to the rule or to its rationale
// cannot pass silently:
//
//   1. the harness's alternative-margin rule IS the shipped rule at the shipped
//      margin (otherwise every "regret" figure would be measuring a different
//      decision function);
//   2. `pickBest` never reads its `meanTempC` argument, so the cold-site
//      rationale in the comments does not move the decision;
//   3. the aggregate reports regret in dollars beside the relative figure, and
//      counts the cases where the margin - not cost - chose sodium.
//
// Run: node --test tests/champion-audit-pickBest.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { pickBest } from "../assets/js/sizing/run.js";
import {
  pickWithMargin,
  runCase,
  summarize,
} from "../scripts/champion-audit-pickBest.mjs";

const entry = (chemistry, cost) => ({
  chemistry,
  solvable: true,
  lifetimeCostMid: cost,
});

test("#349: the alternative-margin rule is the shipped rule at 10%", () => {
  // Charge a spread of gaps, including both sides of the boundary.
  for (const lfpCost of [800, 900, 950, 1000, 1200, 2000]) {
    const entries = [entry("naion", 1000), entry("lfp", lfpCost)];
    assert.equal(
      pickWithMargin(entries, 0.1)?.chemistry,
      pickBest(entries, 20)?.chemistry,
      `margin 10% diverged from pickBest at lfpCost ${lfpCost}`,
    );
  }
  // Exactly at the boundary the shipped rule keeps sodium (strict `>`).
  assert.equal(
    pickBest([entry("naion", 1000), entry("lfp", 900)], 20)?.chemistry,
    "naion",
    "a 10.0% edge must not be 'more than' 10%",
  );
  assert.equal(
    pickBest([entry("naion", 1000), entry("lfp", 899)], 20)?.chemistry,
    "lfp",
    "an edge past 10% must go to LFP",
  );
});

test("#349: pickBest ignores meanTempC, so the cold-site rationale is prose only", () => {
  // A 2% LFP edge: inside the margin, so sodium wins. The point is that the
  // answer does not change between a freezing mean and a tropical one, which is
  // what the COLD_MEAN_C helper's presence in the same module implies it might.
  const entries = [entry("naion", 1000), entry("lfp", 980)];
  for (const meanTempC of [-5, 6.07, 25, 35]) {
    assert.equal(
      pickBest(entries, meanTempC)?.chemistry,
      "naion",
      `pickBest consulted meanTempC at ${meanTempC} C`,
    );
  }
});

test("#349: a cold site where sodium is cheaper on cost alone picks sodium", () => {
  // The shipped envelope: at a smaller one Oslo 8 kWh/day leaves one chemistry
  // unsolvable, and an unsolvable row is a different question from this test's.
  const result = runCase("Oslo, Norway", 8);
  assert.ok(result.sized.naion, "sodium must solve at Oslo 8 kWh/day");
  assert.ok(result.cold, "Oslo's mean must be below the 10 C cold threshold");
  assert.ok(
    result.lfpEdge < 0,
    `expected sodium to be cheaper on cost alone, got edge ${result.lfpEdge}`,
  );
  assert.equal(result.championChemistry, "naion");
});

test("#349: the aggregate reports dollars beside the relative regret", () => {
  const cases = [
    {
      city: "fixture",
      kwhPerDay: 1,
      meanTempC: 20,
      cold: false,
      sized: {
        naion: { pvKw: 1, battKwh: 0, lifetimeCostUsd: 1000 },
        lfp: { pvKw: 1, battKwh: 0, lifetimeCostUsd: 980 },
      },
      lfpEdge: 0.02,
      championChemistry: "naion",
      picks: [
        { margin: 0, chemistry: "lfp", lifetimeCostUsd: 980 },
        { margin: 0.05, chemistry: "naion", lifetimeCostUsd: 1000 },
        { margin: 0.1, chemistry: "naion", lifetimeCostUsd: 1000 },
        { margin: 0.15, chemistry: "naion", lifetimeCostUsd: 1000 },
        { margin: 0.2, chemistry: "naion", lifetimeCostUsd: 1000 },
      ],
    },
  ];
  const summary = summarize(cases);
  const champion = summary.rows.find((r) => r.margin === 0.1);
  assert.equal(champion.sodiumShare, 1);
  // Regret is normalised by the CHEAPEST feasible cost ($980), so a $20 gap is
  // 20/980, not 2% - the relative figure is always taken against the baseline.
  assert.equal(champion.meanRegret, 20 / 980);
  assert.equal(champion.meanRegretUsd, 20);
  assert.equal(
    champion.marginDecisiveCases,
    1,
    "a $20 gap that the margin sends to sodium is a margin-decided case",
  );
  const cheapest = summary.rows.find((r) => r.margin === 0);
  assert.equal(cheapest.meanRegret, 0, "margin 0 is pure cheapest-wins");
  assert.equal(cheapest.sodiumShare, 0);
});

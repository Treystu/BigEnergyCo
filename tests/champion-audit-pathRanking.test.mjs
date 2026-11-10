// Champion Audit #354 - purchase-path ranking under the registry's own bands.
//
// The comparator's validity rests on one thing: collapsing a registry triple to
// its low/high end must make the SHIPPED pricer quote that end, and the registry
// must come back exactly as it was. If restoration leaks, every later case in
// the sweep is priced against a mutilated registry and the whole result is
// garbage. So the pins are:
//
//   1. the triple collector finds [low, mid, high] and nothing else;
//   2. a collapse moves the quoted spend (the comparator is not inert), and
//      restoring returns the registry to its original values;
//   3. the runner-up gap is (second - first) / first on available paths;
//   4. the acceptance fires on >15% flips, and the no-change branch needs BOTH
//      <=15% flips and a median gap above 5%.
//
// Run: node --test tests/champion-audit-pathRanking.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { priceAllPaths, registryFor } from "../assets/js/sizing/paths.js";
import {
  collectTriples,
  priceAtBandEnd,
  runnerUpGap,
  summarize,
} from "../scripts/champion-audit-pathRanking.mjs";

const system = {
  pvKw: 5,
  battKwh: 10,
  annualServedKwh: 2920,
  annualBaselineBillsUsd: 1200,
  annualResidualBillsUsd: 240,
  billCutPct: 80,
  tariff: 0.28,
};

test("#354: the collector finds triples and leaves other arrays alone", () => {
  const node = {
    a: [1, 2, 3],
    b: [1, 2, 3, 4],
    c: { d: [0.1, 0.2, 0.3] },
    e: "text",
  };
  const found = collectTriples(node);
  assert.equal(found.length, 2);
  assert.deepEqual(found.map((f) => f.path.join(".")).sort(), ["a", "c.d"]);
});

test("#354: a band collapse moves the quote AND the registry is restored", () => {
  const registry = registryFor("us");
  const snapshot = JSON.stringify(registry);

  const mid = priceAllPaths(system, { region: "us" });
  const hi = priceAtBandEnd({ region: "us", system, index: 2 });

  // The comparator must be doing something: turnkey spend has to move.
  const midTurnkey = mid.paths.find((p) => p.id === "turnkey").spend20;
  const hiTurnkey = hi.paths.find((p) => p.id === "turnkey").spend20;
  assert.notEqual(hiTurnkey, midTurnkey);

  // And the registry must be byte-identical afterwards.
  assert.equal(JSON.stringify(registryFor("us")), snapshot);
});

test("#354: the runner-up gap is measured against the winner's spend", () => {
  const fake = {
    paths: [
      { id: "a", available: true, spend20: 100, year0: 1 },
      { id: "b", available: true, spend20: 150, year0: 1 },
      { id: "c", available: false, spend20: 50, year0: 1 },
    ],
  };
  assert.equal(runnerUpGap(fake), 0.5);
  // One available path has no runner-up.
  assert.equal(
    runnerUpGap({
      paths: [{ id: "a", available: true, spend20: 100, year0: 1 }],
    }),
    null,
  );
});

test("#354: the acceptance fires on flips, and closes only on both quiet conditions", () => {
  const row = (flips, gap) => ({
    winnerMid: "selfpurchase",
    flips,
    gap,
  });
  // 2/4 flips = 50%: uncertainty must be carried.
  const flippy = summarize([
    row(true, 0.1),
    row(false, 0.1),
    row(true, 0.1),
    row(false, 0.1),
  ]);
  assert.equal(flippy.flipShare, 0.5);
  assert.equal(flippy.mustCarryUncertainty, true);
  assert.equal(flippy.noChangeCloses, false);

  // No flips but a thin 2% gap: no-change does NOT close, because the bar is
  // "<=15% flips AND median gap > 5%".
  const thin = summarize([
    row(false, 0.02),
    row(false, 0.02),
    row(false, 0.02),
  ]);
  assert.equal(thin.mustCarryUncertainty, false);
  assert.equal(thin.noChangeCloses, false);

  // No flips and a fat gap: the issue's stated no-change close.
  const calm = summarize([row(false, 0.2), row(false, 0.3), row(false, 0.4)]);
  assert.equal(calm.noChangeCloses, true);
});

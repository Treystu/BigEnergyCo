// Champion Audit #349 - the chemistry margin.
//
// The audit's claims, pinned:
//   1. the margin rule is an edge comparison: lfp at or under the margin loses;
//   2. the shipped column is identified by agreement, not assumption - the
//      off-grid matrix keys tiers, not `effectiveTargetId`;
//   3. the 10% margin decides on a minority of cases, and margin changes that
//      would erase the regret also break the pick-share band, so no change.
//
// Run: node --test tests/champion-audit-chemPick.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  marginStats,
  pickAtMargin,
  regretOf,
  runCase,
  shippedColumn,
  summarize,
} from "../scripts/champion-audit-chemPick.mjs";

const entries = (na, lfp) => [
  { chemistry: "naion", solvable: true, lifetimeCostMid: na },
  { chemistry: "lfp", solvable: true, lifetimeCostMid: lfp },
];

test("#349: the margin is an edge comparison, and equality loses to sodium", () => {
  // LFP 9% cheaper than sodium.
  const e = entries(110, 100);
  assert.equal(pickAtMargin(e, 0).chemistry, "lfp");
  assert.equal(pickAtMargin(e, 0.05).chemistry, "lfp");
  assert.equal(pickAtMargin(e, 0.1).chemistry, "naion");
  assert.equal(pickAtMargin(e, 0.2).chemistry, "naion");
  // Exactly at the margin: `lfpEdge > margin` is false, so sodium keeps it.
  assert.equal(pickAtMargin(entries(100, 90), 0.1).chemistry, "naion");
  // Cheapest-wins when sodium is pricier than LFP by nothing at all.
  assert.equal(pickAtMargin(entries(100, 100), 0.1).chemistry, "naion");
});

test("#349: regret is measured against the cheapest feasible chemistry", () => {
  const e = entries(110, 100);
  const na = e[0];
  const lfp = e[1];
  assert.equal(regretOf(lfp, e), 0);
  assert.equal(regretOf(na, e), 0.1);
  assert.equal(regretOf(null, e), null);
  // An unsolvable chemistry cannot set the benchmark.
  const mixed = [
    { chemistry: "naion", solvable: false, lifetimeCostMid: 1 },
    { chemistry: "lfp", solvable: true, lifetimeCostMid: 100 },
  ];
  assert.equal(regretOf(mixed[1], mixed), 0);
});

test("#349: the shipped column is found by agreement, including tier keys", () => {
  const payload = {
    effectiveTargetId: null,
    matrix: {
      rows: [{ id: "naion" }, { id: "lfp" }],
      cells: {
        "naion:tier99": {
          chemistry: "naion",
          solvable: true,
          lifetimeCostMid: 110,
        },
        "lfp:tier99": {
          chemistry: "lfp",
          solvable: true,
          lifetimeCostMid: 100,
        },
        "naion:tier95": {
          chemistry: "naion",
          solvable: true,
          lifetimeCostMid: 220,
        },
        "lfp:tier95": {
          chemistry: "lfp",
          solvable: true,
          lifetimeCostMid: 200,
        },
      },
    },
    // 9% cheaper: sodium wins at the 10% margin.
    best: { chemistry: "naion", lifetimeCostMid: 110 },
  };
  const { column } = shippedColumn(payload, 15);
  assert.ok(column);
  assert.equal(column.target, "tier99");
  // Sanity: the other column would have produced a different pick under a
  // different margin, which is why agreement (not key order) identifies it.
  assert.equal(pickAtMargin(column.entries, 0).chemistry, "lfp");
});

test("#349: a margin change that erases regret still fails the share band", () => {
  const row = (na, lfp, picks, regrets) => ({
    naCost: na,
    lfpCost: lfp,
    picks,
    regrets,
  });
  const mk = (naWinsAt) => {
    const picks = {};
    const regrets = {};
    for (const m of [0, 0.05, 0.1, 0.15, 0.2]) {
      picks[m] = naWinsAt.includes(m) ? "naion" : "lfp";
      regrets[m] = picks[m] === "naion" ? 0.01 : 0;
    }
    return row(110, 100, picks, regrets);
  };
  const rows = [mk([0.1]), mk([0.1]), mk([0.1]), mk([0.1])];
  const s = summarize(rows);
  // The champion sits at 10% with a small regret.
  assert.equal(s.stats.find((x) => x.margin === 0.1).naPicks, 4);
  // At margin 0 no sodium picks remain: a 100pp share drift, far outside +/-10.
  assert.equal(s.marginChangeQualifies, false);
  assert.deepEqual(s.qualifyingMargins, []);
  // And the mean regret of the champion is the 1% it pays for the preference.
  assert.equal(s.stats.find((x) => x.margin === 0.1).meanRegret, 0.01);
  assert.equal(marginStats(rows, 0).naShare, 0);
});

test("#349: a real cold-ish off-grid case keeps sodium at the shipped margin", async () => {
  const r = await runCase("Berlin, Germany", "offgrid", 15);
  assert.equal(r.shippedReplayAgrees, true);
  assert.equal(r.shippedPick, "naion");
  // LFP is cheaper, but by less than the 10% margin: the safety preference
  // decides, and that is the whole point of the constant.
  assert.ok(r.gapPct > 0 && r.gapPct < 10, `gap ${r.gapPct}`);
  assert.equal(r.marginDecided, true);
  // And the site is NOT cold by the engine's own rule, so the copy never
  // explains the choice with the climate argument it is premised on.
  assert.equal(r.cold, false);
});

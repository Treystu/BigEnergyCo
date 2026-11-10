// Champion Audit #353 - frontier recommendation stability under refinement.
//
// The audit's claims, pinned:
//   1. the comment/constant mismatch existed and is now corrected one way only
//      (the comment), with the shipped value unchanged at 1.0;
//   2. refining the lattice moves the knee's capex past the 5% bar, so the
//      champion fails its own stability rule;
//   3. the movement does not converge at 4x, which is why a denser lattice is
//      not the fix.
//
// Run: node --test tests/champion-audit-frontierLayer.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  COMMENT_CLAIM_PP,
  SHIPPED_MIN_STEP_PP,
  runCase,
  rungIndex,
  summarize,
} from "../scripts/champion-audit-frontierLayer.mjs";

test("#353: the thinning comment now states the shipped 1.0 pp, not one-third", () => {
  const src = readFileSync(
    new URL("../assets/js/sizing/frontier.js", import.meta.url),
    "utf8",
  );
  assert.ok(
    !src.includes("one-third of a percentage point"),
    "the stale comment must be gone",
  );
  assert.ok(src.includes("less than one percentage point"));
  // The VALUE is unchanged: the comment was the wrong side of the mismatch.
  assert.equal(SHIPPED_MIN_STEP_PP, 1.0);
  assert.notEqual(SHIPPED_MIN_STEP_PP, +COMMENT_CLAIM_PP.toFixed(3));
  assert.ok(src.includes("const FRONTIER_MIN_STEP_PP = 1.0;"));
});

test("#353: a rung index is the nearest ladder position, never an interpolation", () => {
  const ladder = [1, 2, 4, 8];
  assert.equal(rungIndex(ladder, 1), 0);
  assert.equal(rungIndex(ladder, 2.1), 1);
  assert.equal(rungIndex(ladder, 3.9), 2);
  assert.equal(rungIndex(ladder, 99), 3);
});

test("#353: 2x refinement moves the knee's cost past 5%, so the champion fails", () => {
  const r = runCase("Nairobi, Kenya", "offgrid");
  // The shipped lattice's knee, and the same rule on 2x rungs.
  assert.deepEqual([r.knee.at1x.pvKw, r.knee.at1x.battKwh], [3.1, 7]);
  assert.deepEqual([r.knee.at2x.pvKw, r.knee.at2x.battKwh], [3.3, 8]);
  assert.equal(r.knee.at1x.capexUsd, 2622);
  assert.equal(r.knee.at2x.capexUsd, 2867);
  // 9.3% of the knee's own capex, against a 5% bar.
  assert.ok(r.kneeCostMove2x > 0.05, `cost move ${r.kneeCostMove2x}`);
  assert.equal(r.fires, true);
  // The rung condition does NOT fire - the cost condition carries the verdict.
  assert.equal(r.kneeMoveRungs2x, 0);
});

test("#353: every budget pick moves under 2x refinement", () => {
  const r = runCase("Nairobi, Kenya", "offgrid");
  assert.equal(r.budgetPicks.length, 3);
  assert.ok(
    r.budgetPicks.every((b) => b.moved),
    "a stable budget answer would contradict the filing",
  );
  // And the movement is material, not a rounding artefact: the 1.6x pick gets
  // the same 100% coverage for $351 less.
  const top = r.budgetPicks[2];
  assert.equal(top.at1x.outcomePct, 100);
  assert.equal(top.at2x.outcomePct, 100);
  assert.ok(top.at1x.capexUsd - top.at2x.capexUsd >= 300);
});

test("#353: the rules-change verdict follows the 20% site bar", () => {
  const row = (fires) => ({
    fires,
    budgetPicks: [],
    kneeMoveRungs2x: fires ? 1 : 0,
    kneeCostMove2x: fires ? 0.1 : 0,
    optimum: null,
    knee: { at1x: null },
  });
  // 2 of 10 = 20%, which is NOT "more than 20%".
  assert.equal(
    summarize([row(true), row(true), ...Array(8).fill(row(false))]).rulesChange,
    false,
  );
  // 3 of 10 fires the rule-change branch.
  assert.equal(
    summarize([row(true), row(true), row(true), ...Array(7).fill(row(false))])
      .rulesChange,
    true,
  );
});

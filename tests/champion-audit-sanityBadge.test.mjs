// Champion Audit #358 - the sanity badge's decision surface.
//
// The audit cannot measure the two error rates offline (the model is remote),
// and says so. What it does measure - the surface - is pinned here, so a
// threshold edit that silently widens the silent band or lets a verdict grant a
// pass fails a test instead of shipping.
//
// Run: node --test tests/champion-audit-sanityBadge.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { SANITY_THRESHOLDS } from "../assets/js/sizing/validate.js";
import {
  BROKEN_MUTATIONS,
  brokenCorpus,
  decisionSurface,
} from "../scripts/champion-audit-sanityBadge.mjs";

test("#358: the shipped thresholds are the ones the surface describes", () => {
  assert.deepEqual(SANITY_THRESHOLDS, {
    flagPlausibleMax: 0.3,
    flagRedFlagMin: 1.5,
    flagImpossibleConfidence: 0.6,
    passPlausibleMin: 0.6,
    passRedFlagMax: 1.0,
  });
});

test("#358: every boundary sits where the shipped comparison puts it", () => {
  const s = decisionSurface();
  for (const [name, ok] of Object.entries(s.boundaries)) {
    assert.equal(ok, true, name);
  }
});

test("#358: the badge is silent on 30% of the plausible axis by construction", () => {
  const s = decisionSurface();
  assert.equal(s.plausibleAxis.silentWidth, 0.3);
  assert.equal(s.plausibleAxis.silentShareOfAxis, 0.3);
  // Only p >= 0.6 can ever pass: 41 of 101 sampled p values, so 60 of them are
  // excluded from a pass no matter how clean the rest of the answer is.
  assert.equal(s.plausibleAxis.pValuesEverPassing, 41);
  assert.equal(s.plausibleAxis.pValuesEverSilent, 70);
  // A pass is representable on only 14.4% of the (p, r) surface.
  assert.equal(s.plausibleAxis.passPossibleShare, 0.144);
});

test("#358: a flag can never be rescued, and a verdict can never grant a pass", () => {
  const s = decisionSurface();
  assert.equal(s.asymmetry.anyFlagWins, true);
  assert.equal(s.asymmetry.impossibleNeverPasses, true);
  // Nothing to judge means no badge at all, not a silent pass.
  assert.equal(s.asymmetry.missingPlausibleIsNull, true);
  assert.equal(s.asymmetry.unavailableIsNull, true);
});

test("#358: the corpus fixture is built from real states and documented mutations", () => {
  assert.equal(BROKEN_MUTATIONS.length, 5);
  const sound = [
    {
      label: "sound",
      city: "Test",
      mode: "gridtie",
      dailyKwh: 15,
      state: {
        battKwh: 10,
        pvKw: 4,
        paybackYearsLo: 5,
        paybackYearsHi: 9,
        cutPct: 80,
      },
    },
  ];
  const broken = brokenCorpus(sound);
  // Five mutations, one of which (coverage-saturated) also zeroes the bank; the
  // cutPct mutation must appear at least once.
  assert.ok(broken.length >= 4);
  assert.ok(
    broken.every((b) => b.label === "broken" && b.breaks && b.mutation),
  );
  const quartered = broken.find((b) => b.mutation === "bank-quartered");
  assert.equal(quartered.state.battKwh, 2.5);
  // A mutation that changes nothing is dropped rather than inflating the count.
  const noop = brokenCorpus([
    {
      label: "sound",
      city: "T",
      mode: "gridtie",
      dailyKwh: 15,
      state: { battKwh: 0 },
    },
  ]);
  assert.equal(
    noop.filter((b) => ["bank-quartered", "bank-tenth"].includes(b.mutation))
      .length,
    0,
  );
});

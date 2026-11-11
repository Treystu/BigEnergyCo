// Champion Audit #347 - the bill-cut search must not cost lifetime cost, and
// the outcome it renders must be the fraction it constrained.
//
// `sizeForBillCut` binary-searches the smallest sufficient PV per battery row
// and refines locally, instead of sweeping the lattice. This test pins, on small
// envelopes so it stays cheap, that the search costs no more than an exhaustive
// sweep of the same lattice and that the returned system actually meets the
// target its label advertises.
//
// The full corpus and the acceptance calculation live in
// scripts/champion-audit-sizeForBillCut.mjs; this is the teeth that stop a future
// search change from silently reintroducing regret or a label mismatch.
//
// Run: node --test tests/champion-audit-sizeForBillCut.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  runCase,
  summarize,
} from "../scripts/champion-audit-sizeForBillCut.mjs";

const ENVELOPE = {
  pvMax: 8,
  battStep: 1,
  battMax: 24,
  pvControlStep: 0.25,
};

test("#347: the bill-cut search costs no more than an exhaustive sweep (Honolulu, 60%)", () => {
  const result = runCase(
    {
      city: "Honolulu, USA",
      kwhPerDay: 10,
      chemistry: "lfp",
      regime: "import-only",
      minFraction: 0.6,
    },
    ENVELOPE,
  );
  assert.ok(result.champion, "the champion must find a feasible system");
  assert.ok(result.control.pvKw !== null, "the control must find one too");
  assert.ok(
    result.regret <= 0.02,
    `champion regret ${result.regret}: champion $${result.champion.lifetimeCostUsd} vs control $${result.control.lifetimeCostUsd}`,
  );
  assert.ok(
    result.champion.meetsConstraint,
    "the returned system must meet the cut it was sized for",
  );
});

test("#347: the rendered bill cut is the constrained fraction (net-metered, 80%)", () => {
  const result = runCase(
    {
      city: "London, UK",
      kwhPerDay: 10,
      chemistry: "lfp",
      regime: "net-metered",
      minFraction: 0.8,
      tariff: 0.3,
      exportRate: 0.3,
    },
    ENVELOPE,
  );
  assert.ok(result.champion);
  assert.equal(result.rendered.metric, "bill-cut");
  assert.ok(
    result.rendered.fraction + 1e-9 >= 0.8,
    `rendered cut ${result.rendered.fraction} must meet the 0.8 target`,
  );
  // The printed integer is what a visitor reads, so the label claim is checked
  // against it, and the error is a MAGNITUDE - rounding 81.45% up to 82% is as
  // wrong as rounding it down to 81%.
  assert.equal(
    result.rendered.pct,
    Math.round(result.rendered.fraction * 100),
    "the audited label must be the integer run.js prints",
  );
  assert.ok(
    Math.abs(result.rendered.mismatchPp) <= 0.5,
    `label mismatch ${result.rendered.mismatchPp} pp exceeds the 0.5 pp margin`,
  );
  // Overshoot against the target is a different quantity and must be recorded
  // as itself, not as a label defect.
  assert.ok(
    result.rendered.targetOffsetPp >= 0,
    "a pick that meets the target cannot come out below it",
  );
});

test("#347: the aggregate reports target offset at its true magnitude, not zero", () => {
  // Regression for the audit's own first pass: target offset was computed as
  // (target - outcome), i.e. negative whenever the search overshot, and the
  // aggregate reduced those signed values with Math.max(…, 0), so a case sitting
  // 1.74 pp past its target published as "max label mismatch 0.00 pp".
  const synthetic = (over) => ({
    champion: { meetsConstraint: true },
    regret: 0,
    searchRegret: 0,
    rendered: {
      metric: "bill-cut",
      fraction: 0.8174,
      pct: 82,
      target: 0.8,
      mismatchPp: 0.26,
      targetOffsetPp: 1.74,
      ...over,
    },
  });
  const summary = summarize([synthetic({}), synthetic({})]);
  assert.ok(
    summary.maxTargetOvershootPp > 1.7,
    `overshoot must survive aggregation, got ${summary.maxTargetOvershootPp}`,
  );
  assert.ok(
    summary.maxMismatchPp < 0.5,
    `label truth is rounding-bounded, got ${summary.maxMismatchPp}`,
  );
  assert.equal(summary.labelBreaches.length, 0);
  // A shortfall is the direction that matters to a visitor and must stay signed.
  const shortfall = summarize([
    synthetic({
      fraction: 0.795,
      pct: 80,
      mismatchPp: -0.5,
      targetOffsetPp: -0.5,
    }),
  ]);
  assert.ok(
    shortfall.maxTargetShortfallPp < -0.4,
    `shortfall must survive aggregation, got ${shortfall.maxTargetShortfallPp}`,
  );
});

test("#347: battery-only targets render a peak offset, not a bill cut", () => {
  // run.js labels pure-battery targets "peak-hour offset" (cut10/15/20), so the
  // audit must compare the peak metric there - a bill-cut comparison would
  // condemn a correctly labelled system.
  const result = runCase(
    {
      city: "Sydney, Australia",
      kwhPerDay: 12,
      chemistry: "lfp",
      regime: "peak-only",
      minFraction: 0.1,
      pvMax: 0,
    },
    { ...ENVELOPE, pvMax: 0 },
  );
  assert.ok(result.champion, "a battery-only pick must exist");
  assert.equal(result.rendered.metric, "peak-offset");
  assert.ok(result.champion.pvKw === 0, "battery-only mode must not add PV");
  assert.ok(
    result.champion.meetsConstraint,
    "the bank must offset at least the target share of the peak window",
  );
});

test("#347: a >100% target without a credit is met by the physical surplus condition", () => {
  // This regime renders "produce X%", not a bill-cut %, so the audit judges it
  // by the constraint the search actually applies: imports ~0 and at least
  // (f - 1) of load produced as surplus. The champion's pick must satisfy it.
  const result = runCase(
    {
      city: "Nairobi, Kenya",
      kwhPerDay: 5,
      chemistry: "lfp",
      regime: "surplus-physical",
      minFraction: 1.2,
      tariff: 0.2,
      exportRate: 0,
    },
    { pvMax: 3, battStep: 1, battMax: 12, pvControlStep: 0.25 },
  );
  assert.ok(result.champion, "the champion must find a feasible system");
  assert.equal(result.rendered.metric, "physical-surplus");
  assert.ok(
    result.champion.meetsConstraint,
    "the returned system must satisfy the physical surplus condition",
  );
});

test("#347: an unreachable target reports no answer instead of a wrong one", () => {
  const result = runCase(
    {
      city: "Phoenix, USA",
      kwhPerDay: 20,
      chemistry: "lfp",
      regime: "import-only",
      minFraction: 0.95,
    },
    { pvMax: 1, battStep: 1, battMax: 2, pvControlStep: 0.25 },
  );
  assert.equal(
    result.champion,
    undefined,
    "an unreachable target must not return a system",
  );
  assert.match(result.note, /no feasible point/);
});

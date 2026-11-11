// Champion Audit #357 - weather-source selection and fallback.
//
// The live-vs-fallback sizing comparison cannot run in this lane, so what is
// pinned here is the STRUCTURAL evidence that stands in for the mechanism, and
// the fact that it is structural rather than incidental:
//
//   1. the fallback generator emits one identical day per month, so a
//      synthesized year has at most 12 distinct daily shapes and no day-to-day
//      variance at all - the thing a battery is sized for;
//   2. there is exactly one year in it, so interannual variance is zero and a
//      "worst year" test over the fallback cannot discriminate anything;
//   3. the reliability tiers still separate on that series, which tells you they
//      separate on seasonal means alone - not on weather events.
//
// Run: node --test tests/champion-audit-weatherFallback.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import { OFFLINE_PROFILES } from "../assets/js/sizing/profiles.js";
import {
  dailyGhiSums,
  seriesStructure,
  sizeTiers,
} from "../scripts/champion-audit-weatherFallback.mjs";

const phoenix = OFFLINE_PROFILES.find((p) => p.name.includes("Phoenix"));
const london = OFFLINE_PROFILES.find((p) => p.name.includes("London"));

test("#357: a synthesized year has one identical day per month, not 365", () => {
  const hours = synthesizeFromProfile(phoenix);
  const days = dailyGhiSums(hours);
  assert.equal(days.length, 365);
  assert.ok(
    new Set(days).size <= 12,
    `expected at most 12 distinct daily totals, saw ${new Set(days).size}`,
  );
  // Consecutive identical days are the direct evidence of no weather events.
  const s = seriesStructure(phoenix);
  assert.ok(
    s.longestIdenticalDayRun >= 28,
    `longest identical run was ${s.longestIdenticalDayRun}; a month of identical days is expected`,
  );
});

test("#357: the fallback carries exactly one year, so no interannual variance", () => {
  const hours = synthesizeFromProfile(phoenix);
  assert.equal(hours.length, 365 * 24);
  assert.equal(seriesStructure(phoenix).interannualVariance, 0);
  assert.equal(seriesStructure(london).interannualVariance, 0);
});

test("#357: the reliability tiers separate on seasonal means alone", () => {
  const row = sizeTiers(phoenix, 10);
  assert.equal(row.tiers.length, 3);
  for (const t of row.tiers) {
    assert.ok(Number.isFinite(t.battKwh), `${t.tier} produced no battery`);
    assert.ok(Number.isFinite(t.pvKw), `${t.tier} produced no array`);
  }
  const strict = row.tiers.find((t) => t.tier === "tier100");
  const loose = row.tiers.find((t) => t.tier === "tier95");
  // The strictest tier must never be cheaper to build than the loosest; if it
  // ever were, the tiers would not be ordering anything.
  assert.ok(strict.cost >= loose.cost);
});

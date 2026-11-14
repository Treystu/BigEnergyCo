// #401 item 1: ONE base-quantity object per selected system.
//
// The same handful of numbers is needed by every surface on the results page —
// the system's size and served energy, the visitor's current bill, the bill that
// remains, the bill cut, the horizon. Before this, each consumer re-derived them
// from whatever it happened to hold, which is how one label printed two numbers
// twice in one session (X1's two "20-year cost" baskets, X3's contradicted
// "Unknown", the $101 residual duplication).
//
// canonicalBase derives them ONCE, with the same precedence the cards' adapter
// uses, and publishes the horizon totals beside them so no consumer multiplies
// by 20 on its own. These tests hold it to that: every route must price from the
// SAME base, and the horizon totals must reconstruct from it exactly.
import assert from "node:assert/strict";
import test from "node:test";

import {
  HORIZON_YEARS,
  canonicalBase,
  priceAllPaths,
} from "../assets/js/sizing/paths.js";

const entry = (over = {}) => ({
  pvKw: 1.92,
  battKwh: 11,
  servedKwhPerYear: 3091,
  replacementsHorizon: 0,
  ...over,
});

const ctx = (over = {}) => ({
  annualBaselineBillsUsd: 1606,
  annualResidualBillsUsd: 247,
  billCutPct: 85,
  tariff: 0.44,
  ...over,
});

test("the base carries the horizon totals, derived once", () => {
  const b = canonicalBase(entry(), ctx());
  assert.equal(b.horizonYears, HORIZON_YEARS);
  assert.equal(b.annualBaselineBillsUsd, 1606);
  assert.equal(b.annualResidualBillsUsd, 247);
  assert.equal(b.baselineBills20, 1606 * HORIZON_YEARS);
  assert.equal(b.residualBills20, 247 * HORIZON_YEARS);
  assert.equal(b.netBills20, (1606 - 247) * HORIZON_YEARS);
  assert.equal(b.billCutPct, 85);
  assert.equal(b.tariff, 0.44);
});

test("every route prices from the same base, so the identities hold", () => {
  const b = canonicalBase(entry(), ctx());
  const r = priceAllPaths(b, { country: "US" });
  assert.ok(r.paths.length >= 3);
  for (const p of r.paths.filter((x) => x.available)) {
    assert.equal(p.baselineBills20, b.baselineBills20, `${p.id}: baseline`);
    assert.equal(p.residualBills20, b.residualBills20, `${p.id}: residual`);
    // The one definition the cards print: spend + remaining bills against the
    // bill the visitor would otherwise have paid in full.
    assert.equal(
      p.net20,
      b.netBills20 - p.spend20,
      `${p.id}: net must be (baseline - residual) - spend`,
    );
  }
});

test("an unknown in the base stays unknown, never a zero", () => {
  const b = canonicalBase(entry(), { annualBaselineBillsUsd: 1606 });
  assert.equal(b.annualResidualBillsUsd, null);
  assert.equal(b.residualBills20, null);
  assert.equal(b.netBills20, null);
  assert.equal(b.aboveZero, undefined, "no stray computed fields");
  const r = priceAllPaths(b, { country: "US" });
  for (const p of r.paths.filter((x) => x.available))
    assert.equal(p.net20, null, `${p.id}: an unknown net must stay unknown`);
});

test("the base is what the payload publishes, not a per-consumer copy", () => {
  // The published object is a plain, serialisable quantity set: no functions, no
  // path results. A consumer that needs a route asks priceAllPaths for it.
  const b = canonicalBase(entry(), ctx());
  for (const [k, v] of Object.entries(b))
    assert.ok(
      v === null || typeof v !== "function",
      `${k} must be data, not behaviour`,
    );
  assert.doesNotMatch(
    JSON.stringify(b),
    /"paths"/,
    "the base must not carry route results",
  );
});

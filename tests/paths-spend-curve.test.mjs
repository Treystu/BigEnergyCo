// #401 Cure A, X1: one definition, one number.
//
// The page printed two different "20-year cost" figures for one system: the
// engine's cumulative total (~$3,109 on the owner's driven run) and the
// buy-parts card's spend20 (~$10,109). They are different baskets —
// spend20 is year0 - incentives + recurring with grid bills excluded — but
// they shared one label, and the chart's own curve was drawn from the engine
// series, so a reader could not reconcile them.
//
// The structural half of the cure is that a route's card total and a curve
// plotted from that route cannot disagree: spend20 IS the endpoint of
// spendByYear. These tests pin that identity, the year-0 net-of-incentives
// start, and the reconstruction from line items.
import assert from "node:assert/strict";
import test from "node:test";

import {
  HORIZON_YEARS,
  PATH_IDS,
  priceAllPaths,
  routeSpendCurve,
} from "../assets/js/sizing/paths.js";

const system = (pvKw, battKwh, tariff) => ({
  pvKw,
  battKwh,
  annualServedKwh: pvKw * 1400,
  replacements: battKwh > 0 ? 1 : 0,
  batteryLifeYears: 10,
  annualBaselineBillsUsd: Math.round(pvKw * 1400 * tariff),
  annualResidualBillsUsd: Math.round(pvKw * 1400 * tariff * 0.2),
  billCutPct: 80,
  tariff,
});

const shapes = [];
for (const country of ["US", "DE", "IN", null])
  for (const pv of [0, 3, 8])
    for (const batt of [0, 8]) shapes.push([country, pv, batt, 0.3]);

test("spend20 IS the endpoint of the route's own curve", () => {
  for (const [country, pv, batt, tariff] of shapes) {
    const r = priceAllPaths(system(pv, batt, tariff), { country });
    for (const p of r.paths.filter((x) => x.available)) {
      assert.ok(Array.isArray(p.spendByYear), `${p.id}: curve must be priced`);
      assert.equal(p.spendByYear.length, HORIZON_YEARS + 1, `${p.id}: 0..20`);
      assert.equal(
        p.spend20,
        p.spendByYear[p.spendByYear.length - 1],
        `${p.id}: card total must be the curve's endpoint (${country}/${pv}/${batt})`,
      );
      // A second derive recomputes the same curve from the same fields.
      assert.deepEqual(p.spendByYear, routeSpendCurve(p), p.id);
      // Year 0 is the up-front cost NET of incentives, not gross.
      assert.equal(p.spendByYear[0], p.year0 - p.incentives, p.id);
      // And every point after that is the previous point plus that year's cost.
      for (let y = 1; y <= HORIZON_YEARS; y++)
        assert.equal(
          p.spendByYear[y],
          p.spendByYear[y - 1] + Math.round(p.recurringByYear[y - 1] || 0),
          `${p.id} year ${y}`,
        );
    }
  }
});

test("the curve stays monotone: no year removes money from the basket", () => {
  for (const [country, pv, batt, tariff] of shapes) {
    const r = priceAllPaths(system(pv, batt, tariff), { country });
    for (const p of r.paths.filter((x) => x.available))
      for (let y = 1; y < p.spendByYear.length; y++)
        assert.ok(
          p.spendByYear[y] >= p.spendByYear[y - 1],
          `${p.id} year ${y}: recurring costs cannot be negative`,
        );
  }
});

test("the card total still reconstructs from its own line items", () => {
  const r = priceAllPaths(system(3, 8, 0.44), { country: "US" });
  assert.ok(r.paths.length > 0);
  for (const p of r.paths.filter((x) => x.available)) {
    assert.equal(p.spend20, p.year0 - p.incentives + p.recurringTotal, p.id);
    assert.ok(PATH_IDS.includes(p.id), p.id);
  }
});

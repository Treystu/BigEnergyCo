// #401 Cure A: the chart's emerald band IS the recommended route's own curve.
//
// Before this, the chart plotted the engine's parts basket (~$3,056 on the
// driven run) while the pay cards printed the installed route's spend20
// (~$8,862). Naming the labels made the difference visible but did not make the
// numbers agree; the census then measured both on one page.
//
// canonicalCumCostSeries substitutes the route's own spendByYear for the
// engine's system curve and rebuilds the amber total as that curve plus the
// bills wedge the engine already computed. No price is re-estimated: the bills
// are preserved line for line, so the only quantity that changes is the basket
// under the emerald band — and its endpoint is the route's spend20 by
// construction (routeSpendCurve).
//
// THE INDEX CONVENTION, which cost a silent no-op once: the engine series
// comes from cumCostFor() and is indexed by YEAR — point 0 is the end of year 1,
// 20 points — while spendByYear starts at year 0 (today's up-front cost), 21
// points. Both shapes are handled, and the first two tests use each one.
import assert from "node:assert/strict";
import test from "node:test";

import { canonicalCumCostSeries } from "../assets/js/sizing/charts.js";
import {
  HORIZON_YEARS,
  priceAllPaths,
  systemForPaths,
} from "../assets/js/sizing/paths.js";

const BASELINE = 1606;
const RESIDUAL = 247;

const priced = () => {
  const sys = systemForPaths(
    { pvKw: 1.92, battKwh: 11, servedKwhPerYear: 3091, replacementsHorizon: 0 },
    {
      annualBaselineBillsUsd: BASELINE,
      annualResidualBillsUsd: RESIDUAL,
      billCutPct: 85,
      tariff: 0.44,
    },
  );
  return priceAllPaths(sys, { country: "US" });
};

// THE REAL SHAPE: 20 points, end of year 1 … end of year 20.
const engineSeries = (systemOf, billsOf) => {
  const system = new Array(HORIZON_YEARS).fill(0).map((_, i) => systemOf(i));
  const bills = new Array(HORIZON_YEARS).fill(0).map((_, i) => billsOf(i));
  return {
    years: HORIZON_YEARS,
    grid: new Array(HORIZON_YEARS).fill(0).map((_, i) => BASELINE * (i + 1)),
    system,
    solar: system.map((v, i) => v + bills[i]),
  };
};

test("a 20-point engine series takes the route curve from year 1 on", () => {
  const r = priced();
  const winner = r.by[r.ranking[0]];
  const series = engineSeries(
    (i) => 3000 + i * 3,
    (i) => RESIDUAL,
  );
  const out = canonicalCumCostSeries(series, { pathsPriced: r });
  assert.equal(out.system.length, HORIZON_YEARS);
  // Point 0 is the end of year 1, so the curve starts at spendByYear[1].
  assert.equal(out.system[0], winner.spendByYear[1]);
  assert.equal(
    out.system[out.system.length - 1],
    winner.spend20,
    "the chart's endpoint must be the card's total",
  );
  assert.equal(out.canonicalSpend20, winner.spend20);
  assert.equal(out.canonicalPathId, winner.id);
  // The bills wedge is preserved exactly: no money moved between the bands.
  for (let i = 0; i < HORIZON_YEARS; i++)
    assert.equal(out.solar[i] - out.system[i], RESIDUAL, `year ${i + 1}`);
});

test("a 21-point series (year 0 included) is aligned without a slice error", () => {
  const r = priced();
  const winner = r.by[r.ranking[0]];
  const nY = HORIZON_YEARS + 1;
  const system = new Array(nY).fill(0).map((_, i) => 3000 + i * 3);
  const series = {
    years: nY,
    grid: new Array(nY).fill(0).map((_, i) => BASELINE * i),
    system,
    solar: system.map((v, i) => v + RESIDUAL * i),
  };
  const out = canonicalCumCostSeries(series, { pathsPriced: r });
  assert.deepEqual(
    out.system,
    winner.spendByYear.map((v) => Math.round(v)),
  );
  assert.equal(out.system[out.system.length - 1], winner.spend20);
});

test("the chart's break-even is the card's break-even, from one definition", () => {
  const r = priced();
  const winner = r.by[r.ranking[0]];
  // Build the engine series FROM the route: the only wedge is the residual
  // bill, so the crossing is exactly the card's crossing.
  // Bills accumulate in the engine series (cumCostFor adds the residual every
  // year), so the wedge at point i is i+1 years of residual, not one.
  const series = engineSeries(
    (i) => winner.spendByYear[i + 1],
    (i) => RESIDUAL,
  );
  series.solar = series.system.map((v, i) => v + RESIDUAL * (i + 1));
  const out = canonicalCumCostSeries(series, { pathsPriced: r });
  let beYear = null;
  for (let i = 0; i < out.grid.length; i++)
    if (out.grid[i] >= out.solar[i]) {
      beYear = i + 1;
      break;
    }
  assert.equal(
    beYear,
    winner.breakEvenYear,
    "chart break-even must equal the card's break-even",
  );
});

test("no priced route, or a shape that cannot align: left alone", () => {
  const series = engineSeries(
    () => 50,
    () => 10,
  );
  assert.equal(canonicalCumCostSeries(series, {}), series);
  assert.equal(
    canonicalCumCostSeries(series, { pathsPriced: { ranking: [], by: {} } }),
    series,
  );
  const r = priced();
  const short = { ...series, years: 10, grid: series.grid.slice(0, 10) };
  assert.equal(canonicalCumCostSeries(short, { pathsPriced: r }), short);
  assert.equal(canonicalCumCostSeries(null, { pathsPriced: r }), null);
  // A series without the system band (battery-only shapes) is untouched: there
  // is no wedge to preserve, so substituting would invent one.
  const noSystem = {
    years: HORIZON_YEARS,
    grid: series.grid,
    solar: series.solar,
  };
  assert.equal(canonicalCumCostSeries(noSystem, { pathsPriced: r }), noSystem);
});

test("with a published base, the chart's 20-year saving is the card's net", () => {
  const r = priced();
  const winner = r.by[r.ranking[0]];
  // The engine's own float accumulation: the residual is a repeating decimal in
  // reality, so $247.03/yr over 20 years misses the whole-dollar total by cents.
  const drift = 247.03;
  const series = engineSeries(
    (i) => 3000 + i * 3,
    (i) => drift * (i + 1),
  );
  const base = {
    horizonYears: HORIZON_YEARS,
    baselineBills20: BASELINE * HORIZON_YEARS,
    residualBills20: RESIDUAL * HORIZON_YEARS,
  };
  const out = canonicalCumCostSeries(series, { pathsPriced: r, base });
  // Endpoints are the published totals, not the float accumulation.
  assert.equal(out.grid[out.grid.length - 1], base.baselineBills20);
  assert.equal(
    out.solar[out.solar.length - 1],
    winner.spend20 + base.residualBills20,
  );
  const saved = out.grid[out.grid.length - 1] - out.solar[out.solar.length - 1];
  assert.equal(saved, winner.net20, "chart gap must equal the card's net");
  assert.equal(out.canonicalNet20, winner.net20);
  // Only the horizon endpoint of the bill wedge is pinned; the rest of the
  // wedge (and the grid line's earlier points) keep the engine's own values.
  for (let i = 0; i < HORIZON_YEARS - 1; i++)
    assert.equal(out.grid[i], series.grid[i], `grid year ${i + 1}`);
});

test("without a base the series keeps the engine's own endpoints", () => {
  const r = priced();
  const series = engineSeries(
    (i) => 3000 + i * 3,
    (i) => 247.03 * (i + 1),
  );
  const out = canonicalCumCostSeries(series, { pathsPriced: r });
  assert.equal(
    out.grid[out.grid.length - 1],
    series.grid[series.grid.length - 1],
  );
  assert.equal(out.canonicalNet20, null);
});

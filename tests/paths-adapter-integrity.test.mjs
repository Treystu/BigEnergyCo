// #401 Cure A, adapter integrity (X3): a quantity the run computed cannot
// arrive null at the paths adapter.
//
// The defect, from the owner's driven run: the four pay cards printed
// "Bill cut: Unknown" and "Net over 20 years: Unknown" while the same page
// stated the saving and the coverage percentage. The cause was the seam, not
// the model — systemForPaths read `cutPct` and `billAfterMonthlyUsd` off the
// entry alone, and the entry the cards price against (the selected best) does
// not always carry them, even though the run did.
//
// These tests pin the seam rather than one run's numbers: whichever of the
// entry / payload supplies a quantity, the adapter must report it, and when no
// source carries it the answer is null — never 0, which would be a fabricated
// figure rather than an honest refusal.
import assert from "node:assert/strict";
import test from "node:test";

import {
  priceAllPaths,
  systemForPaths,
  HORIZON_YEARS,
} from "../assets/js/sizing/paths.js";

const entry = (over = {}) => ({
  pvKw: 3,
  battKwh: 8,
  servedKwhPerYear: 4826,
  replacementsHorizon: 1,
  batteryLifeYears: 10,
  ...over,
});

test("a payload-supplied bill cut and residual reach the priced paths", () => {
  // The driven run's shape: the entry has neither field, the payload has both.
  const sys = systemForPaths(entry(), {
    annualBaselineBillsUsd: 16060,
    billCutPct: 94.6,
    billAfterMonthlyUsd: 54,
    exportValueAnnualUsd: 0,
    tariff: 0.44,
  });
  assert.equal(sys.billCutPct, 94.6);
  assert.equal(sys.annualResidualBillsUsd, 54 * 12);

  const r = priceAllPaths(sys, { country: "US" });
  for (const p of r.paths.filter((x) => x.available)) {
    assert.equal(p.billCutPct, 94.6, `${p.id}: bill cut must survive the seam`);
    assert.notEqual(p.net20, null, `${p.id}: net20 cannot be Unknown`);
    assert.equal(p.residualBills20, Math.round(54 * 12 * HORIZON_YEARS));
    assert.equal(p.baselineBills20, Math.round(16060 * HORIZON_YEARS));
    // The identity the card's own line items must reconstruct.
    assert.equal(p.net20, p.baselineBills20 - p.residualBills20 - p.spend20);
  }
});

test("an entry that carries its own bill cut still wins, unchanged", () => {
  // Matrix cells carry both fields; adding the payload path must not alter them.
  const sys = systemForPaths(
    entry({ cutPct: 80, billAfterMonthlyUsd: 100, exportValueAnnualUsd: 120 }),
    { annualBaselineBillsUsd: 2400, tariff: 0.3 },
  );
  assert.equal(sys.billCutPct, 80);
  assert.equal(sys.annualResidualBillsUsd, 100 * 12 + 120);
});

test("no source carries the residual: null, never a fabricated zero", () => {
  const sys = systemForPaths(entry(), { annualBaselineBillsUsd: 2400 });
  assert.equal(sys.annualResidualBillsUsd, null);
  assert.equal(sys.billCutPct, null);
  const r = priceAllPaths(sys, { country: "US" });
  for (const p of r.paths.filter((x) => x.available)) {
    assert.equal(p.net20, null, `${p.id}: an unknown net must stay unknown`);
  }
});

test("the engine's own annual residual wins over a monthly reconstruction", () => {
  // #401 follow-up: the card net was $101 below the chart's saving because the
  // adapter rebuilt the year from `billAfterMonthlyUsd` (rounded to whole
  // dollars) AND added the export credit a second time. The run now carries the
  // engine's own residual, and that is what the adapter must use.
  const sys = systemForPaths(
    entry({ billAfterMonthlyUsd: 252, exportValueAnnualUsd: 120 }),
    {
      annualBaselineBillsUsd: 1606,
      annualResidualBillsUsd: 2940,
      tariff: 0.44,
    },
  );
  assert.equal(sys.annualResidualBillsUsd, 2940);
  const r = priceAllPaths(sys, { country: "US" });
  for (const p of r.paths.filter((x) => x.available)) {
    assert.equal(p.residualBills20, 2940 * HORIZON_YEARS, p.id);
    assert.equal(p.net20, p.baselineBills20 - 2940 * HORIZON_YEARS - p.spend20);
  }
});

test("without that field the monthly reconstruction still applies, unsquared", () => {
  // The fallback is not deleted: a matrix cell that predates the field, or a
  // shape with no residual at all, must behave exactly as before.
  const sys = systemForPaths(entry({ billAfterMonthlyUsd: 100 }), {
    annualBaselineBillsUsd: 2400,
  });
  assert.equal(sys.annualResidualBillsUsd, 100 * 12);
});

test("the four run shapes each price without a contradicted Unknown", () => {
  // bill-cut, off-grid (no served kWh), battery-only, no-bill (no baseline).
  const shapes = {
    "bill-cut": [
      entry(),
      {
        annualBaselineBillsUsd: 16060,
        billCutPct: 94.6,
        billAfterMonthlyUsd: 54,
      },
    ],
    "off-grid": [
      entry({ servedKwhPerYear: 0, pvKw: 0, battKwh: 8 }),
      {
        annualBaselineBillsUsd: 16060,
        billCutPct: 100,
        billAfterMonthlyUsd: 0,
      },
    ],
    "battery-only": [
      entry({ pvKw: 0, battKwh: 8, servedKwhPerYear: 0 }),
      { annualBaselineBillsUsd: 900, billCutPct: 40, billAfterMonthlyUsd: 45 },
    ],
    "no-bill": [entry(), { tariff: 0.3 }],
  };
  for (const [name, [e, ctx]] of Object.entries(shapes)) {
    const r = priceAllPaths(systemForPaths(e, ctx), { country: "US" });
    const available = r.paths.filter((p) => p.available);
    const stated = Number.isFinite(ctx.annualBaselineBillsUsd);
    for (const p of available) {
      // Every available path reports the definition's own identity, and net20
      // is Unknown exactly when the baseline genuinely does not exist.
      if (stated) {
        assert.notEqual(p.net20, null, `${name}/${p.id}: net20 must be stated`);
        assert.equal(p.billCutPct, ctx.billCutPct);
        assert.equal(
          p.net20,
          p.baselineBills20 - p.residualBills20 - p.spend20,
        );
      } else {
        assert.equal(p.net20, null, `${name}/${p.id}: no baseline, no net`);
      }
    }
  }
});

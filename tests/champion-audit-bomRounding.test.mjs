// Champion Audit #356 - the BOM's purchasable-configuration rounding.
//
// The audit's whole claim is a PRICE delta, so these pins are about the price
// basis more than the numbers. Each one guards a defect that had already
// produced a wrong headline in this harness:
//
//   1. `battPerKwh` is priced per USABLE kWh while every BOM quantity is
//      NAMEPLATE. Pricing nameplate at that price multiplies the battery bill by
//      1/DoD and manufactured a 170% overshoot; the provided capacity must be
//      converted to usable before it meets the price.
//   2. the retail config reports a MODULE COUNT and no capacity at all. Reading
//      `providedKwh` off it yields 0 and reported retail as 34% CHEAPER.
//   3. the acceptance compares a median against 10% and a SMALL-quartile median
//      against 25%, where "smallest quartile" is by simulated system cost.
//
// Run: node --test tests/champion-audit-bomRounding.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { RETAIL_MODULE_KWH } from "../assets/js/sizing/bom.js";
import { CHEMISTRIES } from "../assets/js/sizing/engine.js";
import {
  priceDelta,
  quantile,
  summarize,
} from "../scripts/champion-audit-bomRounding.mjs";

const site = {
  costPerWpv: 0.35,
  costPerKwInv: 0.12,
  battPerKwh: () => 140,
};
const best = { pvKw: 3, battKwh: 4, loadWh: null };

test("#356: provided capacity is converted to usable before it is priced", () => {
  const row = priceDelta({
    site,
    best,
    chemistry: "lfp",
    kwhPerDay: 8,
    batteryConfig: "diy",
  });
  const dod = CHEMISTRIES.lfp.usableDod;
  assert.equal(
    row.providedUsableKwh,
    +(row.providedNameplateKwh * dod).toFixed(2),
  );
  // The battery term inside the buyable total is the USABLE figure times the
  // per-usable price - never the nameplate figure.
  const pvTerm = row.buyablePvKw * 1000 * site.costPerWpv;
  const invTerm = best.pvKw * site.costPerKwInv;
  assert.ok(
    Math.abs(
      row.buyableUsd - (pvTerm + row.providedUsableKwh * 140 + invTerm),
    ) < 0.05,
    "buyable total must price usable kWh",
  );
});

test("#356: retail capacity is derived from its module count", () => {
  const row = priceDelta({
    site,
    best,
    chemistry: "lfp",
    kwhPerDay: 8,
    batteryConfig: "retail",
  });
  const modules = Math.max(
    1,
    Math.ceil(row.battNameplateKwh / RETAIL_MODULE_KWH),
  );
  assert.equal(
    row.providedNameplateKwh,
    +(modules * RETAIL_MODULE_KWH).toFixed(2),
  );
  assert.ok(
    row.providedNameplateKwh > 0,
    "retail must not read as zero capacity",
  );
});

test("#356: quantile interpolates linearly", () => {
  const xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(quantile(xs, 0.5), 4.5);
  assert.equal(quantile(xs, 0), 0);
  assert.equal(quantile(xs, 1), 9);
  assert.equal(quantile([], 0.5), null);
});

test("#356: the acceptance fires on a 10% median OR a 25% small-quartile median", () => {
  const row = (simulatedUsd, delta) => ({
    simulatedUsd,
    delta,
    deltaUsd: simulatedUsd * delta,
  });
  // Median 12% clears the 10% bar on its own.
  const median12 = summarize([
    row(1000, 0.12),
    row(2000, 0.12),
    row(3000, 0.12),
  ]);
  assert.equal(median12.mustSurfaceBuyablePrice, true);

  // Median 4% does not, but the cheapest quartile at 30% does - the smaller
  // systems are the ones a whole extra string hurts most.
  const smallHot = summarize([
    row(100, 0.3),
    row(200, 0.3),
    row(5000, 0.02),
    row(6000, 0.02),
  ]);
  assert.equal(smallHot.mustSurfaceBuyablePrice, true);

  // Everything modest: the requirement does not fire.
  const calm = summarize([
    row(1000, 0.02),
    row(2000, 0.03),
    row(3000, 0.04),
    row(4000, 0.05),
  ]);
  assert.equal(calm.mustSurfaceBuyablePrice, false);
});

// #354 cure: the ranking ships with the band it came from.
//
// The audit found the #1 path flips within the registry's own band width on
// 53.3% of corpus cases, well over the 15% bar, and acceptance is that "the
// presentation must carry the tie/uncertainty". priceAllPaths therefore prices
// the same rules at band-lo and band-hi as well as mid, and reports
// rankingBand { lo, hi, flips, winners } beside the mid-band ranking.
import assert from "node:assert/strict";
import test from "node:test";

import { priceAllPaths, PATH_IDS } from "../assets/js/sizing/paths.js";

const system = (pvKw, battKwh, tariff) => ({
  pvKw,
  battKwh,
  annualServedKwh: pvKw * 1400,
  replacements: battKwh > 0 ? 1 : 0,
  batteryLifeYears: 10,
  annualBaselineBillsUsd: Math.round(pvKw * 1400 * tariff),
  annualResidualBillsUsd: 0,
  billCutPct: 90,
  tariff,
});

test("the ranking is reported with its band ends", () => {
  const r = priceAllPaths(system(6, 10, 0.25), { country: "US" });
  assert.ok(Array.isArray(r.ranking));
  assert.ok(r.rankingBand, "rankingBand must be present");
  const available = r.paths.filter((p) => p.available).map((p) => p.id);
  for (const key of ["lo", "hi"]) {
    assert.deepEqual(
      [...r.rankingBand[key]].sort(),
      [...available].sort(),
      `${key} must order exactly the available paths`,
    );
  }
  assert.deepEqual(
    r.ranking,
    [...r.ranking].sort((a, b) => {
      const by = Object.fromEntries(r.paths.map((p) => [p.id, p]));
      return by[a].spend20 - by[b].spend20 || by[a].year0 - by[b].year0;
    }),
  );
});

test("flips is exactly 'the winner is not the same at every band end'", () => {
  for (const country of ["US", "IN", "DE", null]) {
    for (const pv of [2, 6, 10]) {
      for (const tariff of [0.12, 0.4]) {
        const r = priceAllPaths(system(pv, 10, tariff), { country });
        const winners = new Set(
          [r.ranking, r.rankingBand.lo, r.rankingBand.hi]
            .filter((o) => o.length)
            .map((o) => o[0]),
        );
        assert.equal(r.rankingBand.flips, winners.size > 1);
        assert.deepEqual(
          [...r.rankingBand.winners].sort(),
          [...winners].sort(),
        );
        for (const id of r.rankingBand.winners) {
          assert.ok(PATH_IDS.includes(id));
        }
      }
    }
  }
});

test("the flip rate in the shipped mechanism clears the 15% bar", () => {
  let cases = 0;
  let flips = 0;
  for (const country of ["US", "IN", "DE", null]) {
    for (const pv of [2, 4, 6, 10]) {
      for (const batt of [0, 5, 10, 20]) {
        for (const tariff of [0.12, 0.25, 0.4]) {
          const r = priceAllPaths(system(pv, batt, tariff), { country });
          cases += 1;
          if (r.rankingBand.flips) flips += 1;
        }
      }
    }
  }
  const rate = flips / cases;
  assert.ok(
    rate > 0.15,
    `within-band winner flips on ${(rate * 100).toFixed(1)}% of ${cases} cases`,
  );
});

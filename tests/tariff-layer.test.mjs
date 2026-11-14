// #355 cure: the tariff layer that priced a result is part of the estimate.
// The audit measured boundary deltas that move payback by more than a year and
// flip the winner on most of the grid, so acceptance requires the layer to be
// re-based or visibly labeled; the global fallback is the one that fired on
// 61.6% of the grid and it must therefore say so in the output.
import assert from "node:assert/strict";
import test from "node:test";

import { estimateTariff } from "../assets/js/sizing/pricing.js";

const LAYERS = ["us-state", "canada", "latlon-box", "global-avg"];

test("the US state table labels itself", () => {
  const est = estimateTariff(34.05, -118.24, "CA");
  assert.equal(est.layer, "us-state");
  assert.equal(est.state, "CA");
  assert.ok(est.rate > 0.05 && est.rate < 1, `unexpected rate ${est.rate}`);
});

test("Canada resolves by country before the US mainland box", () => {
  const est = estimateTariff(43.65, -79.38, "ON", "CA");
  assert.equal(est.layer, "canada");
  assert.equal(est.rate, 0.13);
});

test("a geographic tariff box labels itself", () => {
  // Berlin sits inside the Germany box.
  const est = estimateTariff(52.52, 13.4);
  assert.equal(est.layer, "latlon-box");
  assert.equal(est.label, "Germany");
  assert.equal(est.rate, 0.4);
});

test("the global fallback is labelled, not silent", () => {
  const ocean = estimateTariff(0, -30);
  assert.equal(ocean.layer, "global-avg");
  assert.equal(ocean.rate, 0.28);
  // The multipliers travel with the layer: the payload reports them beside it.
  assert.equal(ocean.laborF, 1);
  assert.equal(ocean.landedF, 1.1);

  const missing = estimateTariff(NaN, NaN);
  assert.equal(missing.layer, "global-avg");
});

test("every estimate names one of the four layers", () => {
  const samples = [
    [34.05, -118.24, "CA"],
    [43.65, -79.38, "ON", "CA"],
    [52.52, 13.4],
    [0, -30],
    [51.5, -0.12],
    [-33.87, 151.21],
    [19.43, -99.13],
  ];
  for (const [lat, lon, region, country] of samples) {
    const est = estimateTariff(lat, lon, region, country);
    assert.ok(
      LAYERS.includes(est.layer),
      `${lat},${lon} produced layer ${est.layer}`,
    );
  }
});

// Champion Audit #350 - the physics and climate assumption model.
//
// The sweep is only meaningful if its instrument is exact, so most of these
// pins are about the instrument rather than the numbers:
//
//   1. `e1kwWith` at the shipped constants reproduces the shipped `buildE1kw`
//      element for element, including its fill-value gap rule. If the engine's
//      builder changes, the sweep stops being a sweep of the engine.
//   2. the SHIPPED table this harness sweeps around matches the constants the
//      engine actually exports - a drift tripwire, not a documentation check;
//   3. `usableDod` genuinely does not move the search, which is why its sweep
//      reads 0.00% and why that must not be reported as "no effect on price";
//   4. the chemistry mutation used for battery sweeps is restored, so one
//      sweep cannot contaminate the next;
//   5. the per-site share in `summarizeSweep` takes the larger of the two
//      modes and counts SITES, which is what #350's acceptance says.
//
// Run: node --test tests/champion-audit-physics.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildE1kw,
  CHEMISTRIES,
  DERATES_DEFAULT,
  ETA_INVERTER,
  GAMMA_PMAX,
  NOCT,
} from "../assets/js/sizing/engine.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import { OFFLINE_PROFILES } from "../assets/js/sizing/profiles.js";
import {
  e1kwWith,
  measure,
  SHIPPED,
  summarizeSweep,
} from "../scripts/champion-audit-physics.mjs";

const city = OFFLINE_PROFILES.find((p) => p.name.includes("Phoenix"));
const hours = synthesizeFromProfile(city);

test("#350: the sweep's e1kw builder reproduces the shipped one exactly", () => {
  const shipped = buildE1kw(hours);
  const mine = e1kwWith({ hours });
  assert.equal(mine.length, shipped.length);
  for (let i = 0; i < shipped.length; i++) {
    assert.equal(mine[i], shipped[i], `e1kw diverged at hour ${i}`);
  }
});

test("#350: the swept constants are the engine's actual constants", () => {
  assert.equal(SHIPPED.soiling, DERATES_DEFAULT.soiling);
  assert.equal(SHIPPED.wiring, DERATES_DEFAULT.wiring);
  assert.equal(SHIPPED.mismatch, DERATES_DEFAULT.mismatch);
  assert.equal(SHIPPED.mppt, DERATES_DEFAULT.mppt);
  assert.equal(SHIPPED.gammaPmax, GAMMA_PMAX);
  assert.equal(SHIPPED.noct, NOCT);
  assert.equal(SHIPPED.etaInverter, ETA_INVERTER);
});

test("#350: an inverter-eta sweep is exactly an e1kw rescale", () => {
  const shipped = e1kwWith({ hours });
  const eta = e1kwWith({ hours, etaScale: 0.97 / 0.94 });
  for (let i = 0; i < shipped.length; i++) {
    assert.ok(
      Math.abs(eta[i] - shipped[i] * (0.97 / 0.94)) < 1e-9,
      `eta rescale is not linear at hour ${i}`,
    );
  }
});

test("#350: usableDod does not move the search, and is restored after use", () => {
  const sweep = {
    id: "lfp.usableDod",
    family: "chemistry",
    chem: "lfp",
    field: "usableDod",
  };
  const original = CHEMISTRIES.lfp.usableDod;
  const shipped = measure({
    city: city.name,
    hours,
    mode: "offgrid",
    sweep,
    value: original,
  });
  // 0.5 is the cited floor; 0.8 is shipped. The search prices USABLE kWh
  // (pricing.js: "landed-mid battery price per usable kWh"), so DoD only moves
  // the reported nameplate and the BOM string count - never the sized cost.
  const floor = measure({
    city: city.name,
    hours,
    mode: "offgrid",
    sweep,
    value: 0.5,
  });
  assert.equal(floor.cost, shipped.cost);
  assert.equal(
    CHEMISTRIES.lfp.usableDod,
    original,
    "the chemistry mutation leaked past the measurement",
  );
});

test("#350: the per-site share counts sites and takes the worse mode", () => {
  const rows = [
    { site: "A", mode: "offgrid", delta: 0.05 },
    { site: "A", mode: "billcut", delta: 0.001 },
    { site: "B", mode: "offgrid", delta: 0.002 },
    { site: "B", mode: "billcut", delta: 0.002 },
    { site: "C", mode: "offgrid", delta: 0.01 },
    { site: "C", mode: "billcut", delta: 0.01 },
    { site: "D", mode: "offgrid", delta: null },
  ];
  const s = summarizeSweep(rows);
  // A clears the 3% bar through its off-grid row alone; C is 1% and does not.
  assert.equal(s.sites, 3);
  assert.equal(s.sitesOverThreshold, 1);
  assert.equal(s.share, 0.3333);
  // 1/3 > 10% of sites, so this sweep would be flagged eligible.
  assert.equal(s.rebaseEligible, true);
});

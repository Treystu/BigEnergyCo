// #446 regression: the hardware list's "Prebuilt alternative" quoted 51.2 V
// 5.12 kWh rack modules for every bank, so a 1.2 kWh off-grid sizing was sold
// 4.3x what it justified, in a bus the rest of that system did not use. The
// teeth here are the three profiles the issue measured, plus the house-scale
// case that must NOT change, and the rule that makes an alternative one: the
// configuration it names covers the target, and it is the smallest such
// configuration in that voltage class.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildBom,
  pickSystemVoltage,
  retailConfig,
  RETAIL_MODULE_KWH,
} from "../assets/js/sizing/bom.js";

test("retailConfig: a 1.2 kWh bank gets a 12 V unit, not a 5.12 kWh rack", () => {
  const r = retailConfig("lfp", 1.2, 12);
  assert.equal(r.modules, 1);
  assert.equal(r.unitKwh, 1.28);
  assert.equal(r.providedKwh, 1.28);
  assert.match(r.unitLabel, /12 V/);
  assert.ok(
    !/rack/i.test(r.unitLabel),
    "a 12 V bank must not be quoted a 51.2 V rack module",
  );
  assert.equal(r.oversizeRatio, 1.07);
  // The defect itself: the old answer was one 5.12 kWh rack for a 1.2 kWh ask.
  assert.ok(r.providedKwh < RETAIL_MODULE_KWH);
});

test("retailConfig: 3.8 kWh in the 24 V class is one 5.12 kWh unit, stated as such", () => {
  const r = retailConfig("lfp", 3.8, 24);
  assert.equal(r.providedKwh, 5.12);
  assert.equal(
    r.modules,
    1,
    "a tie goes to the configuration with fewer units",
  );
  assert.equal(r.unitKwh, 5.12);
  assert.match(r.unitLabel, /24 V/);
  assert.equal(r.oversizeRatio, 1.35);
});

test("retailConfig: 6.3 kWh in the 24 V class picks the smaller total, not bigger racks", () => {
  const r = retailConfig("lfp", 6.3, 24);
  // 3 x 2.56 = 7.68 kWh beats 2 x 5.12 = 10.24 kWh: the smallest configuration
  // that still covers the target, which is what "alternative" has to mean.
  assert.equal(r.modules, 3);
  assert.equal(r.providedKwh, 7.68);
  assert.ok(r.providedKwh >= 6.3, "the configuration must still cover the ask");
  assert.equal(r.oversizeRatio, 1.22);
});

test("retailConfig: house-scale 48 V banks are unchanged", () => {
  const r = retailConfig("lfp", 14.4, 48);
  assert.equal(r.modules, Math.ceil(14.4 / RETAIL_MODULE_KWH));
  assert.equal(r.providedKwh, 3 * RETAIL_MODULE_KWH);
  assert.match(r.unitLabel, /rack modules/);
  // Sodium quotes the same rack shelf; AGM keeps its 12 V blocks.
  assert.equal(retailConfig("naion", 14.4, 48).modules, r.modules);
  const agm = retailConfig("agm", 14.4, 48);
  assert.equal(agm.modules, Math.ceil(14.4 / 2.4));
  assert.equal(agm.providedKwh, 14.4);
  assert.match(agm.unitLabel, /AGM blocks/);
});

test("retailConfig: every configuration covers the target and never goes under it", () => {
  for (const volts of [12, 24, 48]) {
    for (const target of [0.5, 1.2, 2.4, 3.8, 6.3, 9, 14.4, 28.8]) {
      const r = retailConfig("lfp", target, volts);
      assert.ok(
        r.modules >= 1,
        `${volts} V / ${target} kWh must buy something`,
      );
      assert.ok(
        r.providedKwh >= target,
        `${volts} V / ${target} kWh provides ${r.providedKwh}`,
      );
      assert.ok(r.oversizeRatio >= 1);
    }
  }
});

test("buildBom: the prebuilt row follows the bus class the system is wired for", () => {
  // The issue's Profile 1: 1.2 kWh/day off-grid at Kehena Beach, a ~1.2 kWh
  // nameplate bank on a small inverter.
  const small = buildBom({
    pvKw: 0.4,
    battNameplateKwh: 1.2,
    chemistry: "lfp",
    peakLoadW: 400,
    peakIsAverage: true,
  });
  assert.equal(small.voltage.volts, 12);
  assert.equal(small.battery.retail.unitKwh, 1.28);
  assert.equal(small.battery.retail.providedKwh, 1.28);
  assert.ok(
    small.battery.retail.providedKwh < small.battery.diy.providedKwh,
    "the prebuilt path must not be the larger of the two at RV scale",
  );

  const house = buildBom({
    pvKw: 8,
    battNameplateKwh: 14.4,
    chemistry: "lfp",
    peakLoadW: 3200,
  });
  assert.equal(house.voltage.volts, 48);
  assert.equal(house.battery.retail.unitKwh, RETAIL_MODULE_KWH);
  assert.equal(house.battery.retail.modules, 3);
  // The voltage the retail config was quoted in is the one pickSystemVoltage
  // chose for the whole system: the two can never disagree.
  assert.equal(
    pickSystemVoltage(14.4, house.inverter.recommendedKw),
    house.voltage.volts,
  );
});

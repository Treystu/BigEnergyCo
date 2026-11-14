// #356 acceptance as a test: the payload must surface the price of the
// configuration a builder actually buys, priced on the engine's own unit costs.
// The audit measured median +17.3% and smallest-quartile +27.9% between the
// simulated (continuous) system and the rounded shopping list, so the two limbs
// of the bar fire and the buyable price has to travel with the payload.
import assert from "node:assert/strict";
import test from "node:test";

import { buyablePrice, PANEL_WATTS_DEFAULT } from "../assets/js/sizing/bom.js";

// Deliberately round numbers, so the arithmetic is checkable by hand.
const costs = { costPerWpv: 0.4, costPerKwhBatt: 200, costPerKwInv: 120 };

test("a rounded-up array costs more than the simulated one", () => {
  const r = buyablePrice({
    pvKw: 3.2,
    battUsableKwh: 8,
    chemistry: "lfp",
    kwhPerDay: 12,
    ...costs,
  });
  // 3.2 kW at 550 W modules rounds up to 6 panels = 3.3 kW.
  assert.equal(r.panelsKw, 3.3);
  assert.ok(
    r.usd > r.simulatedUsd,
    `buyable ${r.usd} should exceed simulated ${r.simulatedUsd}`,
  );
  assert.ok(r.deltaFraction > 0);
});

test("the battery is priced per USABLE kWh, not per nameplate", () => {
  const r = buyablePrice({
    pvKw: 3.2,
    battUsableKwh: 8,
    chemistry: "lfp",
    kwhPerDay: 12,
    ...costs,
  });
  // 8 usable kWh at 80% DoD is a 10 kWh nameplate ask; one 16S string of
  // 3.2 V/314 Ah cells provides ~16.1 kWh nameplate = ~12.9 kWh usable.
  assert.ok(r.providedUsableKwh > 8, "the string rounds up in usable kWh");
  // Pricing the same nameplate at a per-usable price would multiply the
  // battery bill by 1/DoD (25% for LFP); the delta must stay far below that.
  assert.ok(r.deltaFraction < 0.8, `delta ${r.deltaFraction} looks inflated`);
  const simulated =
    3.2 * 1000 * costs.costPerWpv + 8 * costs.costPerKwhBatt + 3.2 * 120;
  const rebuild =
    3.3 * 1000 * costs.costPerWpv +
    r.providedUsableKwh * costs.costPerKwhBatt +
    3.2 * 120;
  assert.equal(r.simulatedUsd, Math.round(simulated));
  assert.equal(r.usd, Math.round(rebuild));
});

test("a battery-free system prices panels only", () => {
  const r = buyablePrice({
    pvKw: 2,
    battUsableKwh: 0,
    chemistry: "lfp",
    kwhPerDay: 4,
    ...costs,
  });
  assert.equal(r.providedUsableKwh, 0);
  // 2 kW at 550 W modules rounds to 4 panels = 2.2 kW, so the PV term is the
  // rounded array and the inverter term stays on the simulated PV kW.
  assert.equal(r.panelsKw, 2.2);
  assert.equal(r.usd, Math.round(2.2 * 1000 * costs.costPerWpv + 2 * 120));
});

test("an exact module fit has no PV overshoot", () => {
  // 4 panels at 550 W default = 2.2 kW exactly.
  const r = buyablePrice({
    pvKw: (4 * PANEL_WATTS_DEFAULT) / 1000,
    battUsableKwh: 0,
    chemistry: "lfp",
    kwhPerDay: 4,
    ...costs,
  });
  assert.equal(r.panelsKw, 2.2);
  assert.equal(r.deltaFraction, 0);
});

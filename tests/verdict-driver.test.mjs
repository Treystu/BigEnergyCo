// #467: a verdict may not name a cause the run's own numbers deny.
//
// The recommendation card printed "never — replacements outpace savings" on any
// null break-even while the same card's swaps row read "None in 20 years" (owner
// screenshot: ZIP 18255 off-grid cabin, 5 kWh/day, sodium-ion 6.5 kW + 10 kWh).
// The cure derives the cause from the same components that produce the number —
// the additive identity paths.explainRanking already uses — so a component that
// is zero can never be named, and off-grid runs carry no grid-bill payback
// verdict at all.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { HORIZON_YEARS, breakEvenDriver } from "../assets/js/sizing/paths.js";

// Fixture #1: the owner's ZIP 18255 cabin run, as the card reported it.
// Parts list ~$4,197 (year 3,599 + ~598 upkeep), cheapest of the pool, power
// cost $0.11/kWh, no battery swap inside 20 years, and a ~$310/yr baseline bill
// (~$6,200 across the horizon) that the installed cost never falls below.
const cabin = {
  year0: 4197,
  incentives: 0,
  spend20: 4197 + 598,
  recurringTotal: 598,
  omTotal: 598,
  replacementsTotal: 0,
  baselineBills20: 6200,
  residualBills20: 0,
  breakEvenYear: null,
};

test("a zero-swap null break-even never names replacements (#467)", () => {
  const driver = breakEvenDriver(cabin);
  assert.equal(driver.replacements, 0, "the fixture has no swaps");
  assert.notEqual(
    driver.code,
    "replacements",
    "replacements are zero, so they cannot outpace anything",
  );
  assert.equal(driver.code, "upfront");
  assert.equal(driver.gap, cabin.spend20 - cabin.baselineBills20);
  assert.equal(driver.horizon, HORIZON_YEARS);
});

test("swaps are named only when the run actually swaps (#467)", () => {
  const swapping = {
    ...cabin,
    year0: 6000,
    spend20: 6000 + 9000,
    replacementsTotal: 9000,
    omTotal: 0,
    residualBills20: 0,
  };
  assert.equal(breakEvenDriver(swapping).code, "replacements");
});

test("a residual grid bill is named before upkeep it outweighs (#467)", () => {
  const gridTied = {
    year0: 2000,
    incentives: 0,
    spend20: 2000 + 500 + 4000,
    omTotal: 500,
    replacementsTotal: 0,
    baselineBills20: 5000,
    residualBills20: 4000,
    breakEvenYear: null,
  };
  assert.equal(breakEvenDriver(gridTied).code, "residual");
});

test("a run with no baseline bill reports the off-grid frame, not a cause (#467)", () => {
  const offgrid = { ...cabin, baselineBills20: 0, residualBills20: 0 };
  assert.equal(breakEvenDriver(offgrid).code, "no-baseline");
});

test("missing route data yields no invented cause (#467)", () => {
  assert.equal(breakEvenDriver(null), null);
});

// The card must route every verdict through the driver, and danger-red must be
// an explicit caller flag again: the old `startsWith("never")` heuristic painted
// a true statement about the recommended, cheapest system as an alarm.
test("the card's never-verdict is driver-derived, and danger is explicit (#467)", () => {
  const src = fs.readFileSync("assets/js/sizing/ui.js", "utf8");
  const at = src.indexOf("function neverVerdictCopy");
  assert.notEqual(at, -1, "neverVerdictCopy is missing");
  const helper = src.slice(at, src.indexOf("\nfunction ", at + 10));
  assert.ok(
    helper.includes("breakEvenDriver"),
    "the verdict must ask the driver",
  );
  assert.match(
    helper,
    /driver\.code === "replacements"\) return t\("resRowNever"\)/,
    "the replacements sentence may only follow a replacements driver",
  );
  const append = src.slice(
    src.indexOf("function appendRows"),
    src.indexOf("function appendRows") + 900,
  );
  assert.ok(
    append.includes('opts.tone === "danger"'),
    "danger treatment must be an explicit flag",
  );
  assert.ok(
    !append.includes('v.startsWith("never")'),
    "the text heuristic that reddened true verdicts is back",
  );
});

// Off-grid results must not print a grid-bill payback verdict they cannot have.
test("off-grid results carry no grid-bill payback verdict (#467)", () => {
  const src = fs.readFileSync("assets/js/sizing/ui.js", "utf8");
  assert.match(
    src,
    /p\.tariff &&\s*isGT &&\s*typeof b\.trueBreakEvenYear === "number"/,
    "the parts-basket payback rows are grid-tied only",
  );
  assert.match(
    src,
    /t\("resCardPaybackFrame"\), t\("resNeverNoGridBill"\)/,
    "off-grid names the frame that applies instead",
  );
});

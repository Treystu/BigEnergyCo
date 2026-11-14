// #401 item 1, the advisor consumer: the brief must carry ONE set of figures
// and must name which basket each one is.
//
// The brief is data handed to a model that is told "do not recompute". So a
// basket given to it becomes a basket it repeats to the visitor. It used to
// receive only the engine's parts figures while the cards said "20-year cost
// (installed, bills not included)" - the advisor could contradict the page in a
// sentence the page itself invited.
import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalBase,
  canonicalBriefLine,
  priceAllPaths,
} from "../assets/js/sizing/paths.js";

const base = () =>
  canonicalBase(
    { pvKw: 1.92, battKwh: 11, servedKwhPerYear: 3091, replacementsHorizon: 0 },
    {
      annualBaselineBillsUsd: 1606,
      annualResidualBillsUsd: 247,
      billCutPct: 85,
      tariff: 0.44,
    },
  );

const winner = () => {
  const r = priceAllPaths(base(), { country: "US" });
  return r.by[r.ranking[0]];
};

test("the line states the base figures, once", () => {
  const line = canonicalBriefLine(base(), winner());
  assert.match(line, /^CANONICAL FIGURES for this run/);
  assert.match(line, /1\.92 kW PV \+ 11 kWh usable/);
  assert.match(line, /current bill 1606\/yr/);
  assert.match(line, /remaining bill 247\/yr/);
  assert.match(line, /bill cut 85%/);
  assert.match(line, /baseline 32120/);
  assert.match(line, /remaining 4940/);
});

test("the installed route is named, with the bracket that says what it excludes", () => {
  const w = winner();
  const line = canonicalBriefLine(base(), w);
  assert.match(line, new RegExp(`CHEAPEST INSTALLED ROUTE \\("${w.id}"\\)`));
  assert.match(line, new RegExp(`20-year cost ${w.spend20}`));
  assert.match(line, /grid bills NOT included/);
  assert.match(line, new RegExp(`net over 20 years ${w.net20}`));
  assert.match(line, new RegExp(`break-even year ${w.breakEvenYear}`));
});

test("it forbids the swap the page was quietly inviting", () => {
  const line = canonicalBriefLine(base(), winner());
  assert.match(line, /DIFFERENT baskets/);
  assert.match(
    line,
    /never present the parts figure as the system's 20-year cost/,
  );
  assert.match(line, /never add the two together/);
});

test("a run with no route, or no base, still says something honest", () => {
  const withBase = canonicalBriefLine(base(), null);
  assert.match(withBase, /CANONICAL FIGURES/);
  assert.doesNotMatch(withBase, /CHEAPEST INSTALLED ROUTE/);
  assert.equal(canonicalBriefLine(null, winner()), "");
});

test("an unknown figure is omitted, never rendered as zero", () => {
  const partial = canonicalBase(
    { pvKw: 3, battKwh: 0, servedKwhPerYear: 4000, replacementsHorizon: 0 },
    { annualBaselineBillsUsd: 2400 },
  );
  const line = canonicalBriefLine(partial, null);
  assert.doesNotMatch(line, /remaining bill 0\/yr/);
  assert.doesNotMatch(line, /bill cut 0%/);
  assert.match(line, /current bill 2400\/yr/);
});

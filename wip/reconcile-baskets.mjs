// #401 X2 / item 5: where the $3,056 and the $8,862 actually come from.
//
// The census measured two 20-year totals for one system. Neither is a typo and
// neither is mislabelled any more; they are two pricing BASES:
//
//   engine  — the parts list: cells, panels, inverter at ex-factory/budget
//             retail, plus replacements. No electrician, no permits.
//   paths   — the installed route: retail hardware (Rack modules with BMS and
//             enclosure), a licensed electrician's hours, permits, inspection
//             and interconnection, plus O&M and the inverter at year N.
//
// This script prints both decompositions per region and per size, and the
// per-unit equivalents, so the decision "which basket is canonical" can be made
// on numbers rather than on adjectives. It asserts nothing new: every figure
// comes from the registry and the engine's own catalog, and the only derived
// values are ratios of the two.
//
// Usage: node wip/reconcile-baskets.mjs [--json out.json]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { priceAllPaths, systemForPaths } from "../assets/js/sizing/paths.js";

const CASES = [
  { label: "driven (census)", pvKw: 1.92, battKwh: 11, partsListUsd: 2996 },
  { label: "3 kW + 8 kWh", pvKw: 3, battKwh: 8, partsListUsd: null },
  { label: "6 kW + 10 kWh", pvKw: 6, battKwh: 10, partsListUsd: null },
];
const COUNTRIES = ["US", "DE", "IN"];

const money = (n) => (n === null ? "n/a" : `$${Math.round(n).toLocaleString("en-US")}`);

const rows = [];
for (const country of COUNTRIES) {
  for (const c of CASES) {
    const sys = systemForPaths(
      {
        pvKw: c.pvKw,
        battKwh: c.battKwh,
        servedKwhPerYear: Math.round(c.pvKw * 1400),
        replacementsHorizon: c.battKwh > 0 ? 1 : 0,
        batteryLifeYears: 10,
      },
      {
        annualBaselineBillsUsd: Math.round(c.pvKw * 1400 * 0.3),
        annualResidualBillsUsd: Math.round(c.pvKw * 1400 * 0.3 * 0.2),
        billCutPct: 80,
        tariff: 0.3,
      },
    );
    const r = priceAllPaths(sys, { country });
    const self = r.by?.selfpurchase;
    const turnkey = r.by?.turnkey;
    if (!self) continue;
    rows.push({
      country,
      case: c.label,
      pvKw: c.pvKw,
      battKwh: c.battKwh,
      // Installed route, the card a reader sees.
      installed: {
        year0: self.year0,
        year0Low: self.year0Low,
        year0High: self.year0High,
        hardware: self.hardware,
        labour: self.labour,
        fees: self.fees,
        om: self.omTotal,
        recurring: self.recurringTotal,
        spend20: self.spend20,
        perW: +(self.hardware / (c.pvKw * 1000)).toFixed(2),
        perKwhBatt: +(self.hardware / Math.max(1, self.battKwh)).toFixed(0),
      },
      turnkey: turnkey
        ? {
            year0: turnkey.year0,
            year0Low: turnkey.year0Low,
            spend20: turnkey.spend20,
          }
        : null,
      enginePartsListUsd: c.partsListUsd,
    });
  }
}

// Per-unit comparison for the one case where the engine's parts figure is
// known from the census, so the basis difference is visible as a rate rather
// than as a total.
const driven = rows.find((r) => r.case === "driven (census)");
if (driven && driven.enginePartsListUsd) {
  driven.enginePerW = +(driven.enginePartsListUsd / (driven.pvKw * 1000)).toFixed(2);
}

const report = {
  at: new Date().toISOString(),
  note: "Two bases, measured side by side. Engine = parts list (bare cells, budget retail). Paths = installed route (retail hardware with BMS and enclosure, electrician hours, permits). The ratio is the finding; no price is invented here.",
  rows,
};

console.log(
  ["country", "case", "installed hw", "labour", "fees", "recurring", "spend20", "$/W hw"].join(
    "\t",
  ),
);
for (const r of rows)
  console.log(
    [
      r.country,
      r.case,
      money(r.installed.hardware),
      money(r.installed.labour),
      money(r.installed.fees),
      money(r.installed.recurring),
      money(r.installed.spend20),
      r.installed.perW,
    ].join("\t"),
  );

const out = process.argv[process.argv.indexOf("--json") + 1];
if (process.argv.includes("--json") && out) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nWROTE ${out}`);
}

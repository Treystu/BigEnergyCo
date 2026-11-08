#!/usr/bin/env node
// Registry coverage seeder (P2.3, R-DATA-02).
//
//   node scripts/seed-registry-countries.mjs           # report what is missing
//   node scripts/seed-registry-countries.mjs --write   # write the missing rows
//
// WHY THIS EXISTS. R-DATA-02 asks that every country the calculator can resolve
// has a registry row, because the row is where a number's origin is written
// down. One row (US) did, so every other country had no place to record either a
// cited value or an honest "unknown" - and an absent row is the silent guess the
// registry was built to stop. This script fills the structural half of P2.3:
//
//   * currency is CITED, not guessed. It comes from the shipped
//     `COUNTRY_CURRENCY` table, which tests/currency-coverage.test.mjs already
//     pins against the city partitions, and it cites ISO 4217 - the standard
//     that makes the assignment a fact rather than our inference.
//   * every other field is an EXPLICIT UNKNOWN with a note saying why and a
//     review date. R-DATA-02 permits this and forbids the alternative: a tariff
//     we have not read at a primary source must not be invented to fill the row.
//   * a country file that already exists is never touched. The seeder only adds
//     rows, so a curated file (US, with its 51 cited state rows) cannot be
//     clobbered by re-running this.
//
// WHAT THIS DOES NOT DO, stated here so the coverage figure is not mistaken for
// the plan item: it does not cite one tariff. P2.3's other half - a cited
// tariff for every country - is a primary-source read per country and is
// recorded as its own remaining work. This script makes the honest half
// complete and keeps the missing half visible instead of invisible.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { COUNTRY_CURRENCY } from "../assets/js/sizing/country-currency.js";
import {
  POLICY_FIELDS,
  REQUIRED_FIELDS,
  latestReviewBy,
} from "./lib/registry.mjs";

export const REGISTRY_DIR = resolve(
  fileURLToPath(new URL("../assets/data/registry/countries", import.meta.url)),
);

/** What each field measures, in the words the note uses. */
const SUBJECT = Object.freeze({
  tariff: "retail tariff",
  fixed_charge: "fixed charge",
  export_regime: "export rules",
  legality_gridtie: "grid-tie legality",
  legality_offgrid: "off-grid legality",
  legality_battery_only: "battery-only legality",
  legality_portable: "portable-system legality",
  turnkey_benchmark: "turnkey price benchmark",
  hardware_landed_factor: "landed hardware factor",
  electrician_rate: "electrician labour rate",
  permit_fees: "permit fees",
  lease_available: "lease availability",
  lease_term_years: "lease term",
  lease_buyout_pct: "lease buyout share",
  inflation_rate: "electricity price inflation",
  real_discount_rate: "real discount rate",
  pv_degradation_d1: "first-year PV degradation",
  pv_degradation_ann: "annual PV degradation",
});

/** The unknown note for one field. Short on purpose: 220 files carry it. */
export function unknownNote(code, field) {
  const subject = SUBJECT[field];
  if (!subject) throw new Error(`no subject recorded for ${field}`);
  if (POLICY_FIELDS.includes(field)) {
    // Policy is where a guess becomes advice, which is why D-10 keeps it off
    // the screen until it is cited rather than banded.
    return `No cited policy read for ${code} yet; D-10 keeps ${subject} unclaimed, so this is an explicit unknown (R-DATA-02).`;
  }
  return `No verified ${subject} for ${code} yet; an explicit unknown (R-DATA-02) rather than a guess.`;
}

/** The English short name for a region code, from the platform's CLDR data. */
export function countryName(code) {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const name = names.of(code);
  // Intl returns the code itself for a private-use code it cannot name, and
  // writes a placeholder is no better than the code, so fall back explicitly.
  return typeof name === "string" && name && name !== code ? name : code;
}

/**
 * One seeded country document. Pure: same inputs, same bytes, which is what
 * lets the test regenerate a committed file and compare.
 */
export function seedCountryFile(code, currency, today) {
  if (!/^[A-Z]{2}$/.test(code)) throw new Error(`not an alpha-2 code: ${code}`);
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error(
      `${code}: currency ${JSON.stringify(currency)} is not ISO 4217`,
    );
  }
  const values = {
    currency: {
      code: currency,
      grade: "A",
      source: "iso_4217",
      retrieved: today,
      review_by: latestReviewBy("currency", today),
    },
  };
  for (const field of REQUIRED_FIELDS) {
    if (field === "currency") continue;
    values[field] = {
      unknown: true,
      note: unknownNote(code, field),
      review_by: latestReviewBy(field, today),
    };
  }
  return { iso: code, name: countryName(code), values, regions: {} };
}

/** Serialise a document the way the registry files are written. */
export function serialise(doc) {
  return `${JSON.stringify(doc, null, 2)}\n`;
}

/** Country codes the calculator can resolve, sorted, with their currency. */
export function resolvableCountries() {
  return Object.entries(COUNTRY_CURRENCY).sort(([a], [b]) => (a < b ? -1 : 1));
}

/** Codes the calculator can resolve that have no registry row yet. */
export function missingCountries(dir = REGISTRY_DIR) {
  const present = new Set(
    existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".json"))
          .map((f) => f.slice(0, -5))
      : [],
  );
  return resolvableCountries()
    .map(([code]) => code)
    .filter((code) => !present.has(code));
}

function main(argv) {
  const write = argv.includes("--write");
  const today = new Date().toISOString().slice(0, 10);
  const missing = missingCountries();
  const total = Object.keys(COUNTRY_CURRENCY).length;
  console.log(
    `registry coverage: ${total - missing.length}/${total} resolvable countries have a row`,
  );
  if (!missing.length) {
    console.log("nothing to seed");
    return 0;
  }
  console.log(`missing (${missing.length}): ${missing.join(" ")}`);
  if (!write) {
    console.log(
      "re-run with --write to add them (existing files are never touched)",
    );
    return 1;
  }
  mkdirSync(REGISTRY_DIR, { recursive: true });
  for (const code of missing) {
    const path = join(REGISTRY_DIR, `${code}.json`);
    if (existsSync(path)) continue;
    writeFileSync(
      path,
      serialise(seedCountryFile(code, COUNTRY_CURRENCY[code], today)),
    );
  }
  console.log(`wrote ${missing.length} rows at ${today}`);
  return 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  process.exit(main(process.argv.slice(2)));
}

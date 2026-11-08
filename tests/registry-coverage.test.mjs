// Registry coverage: every country the calculator can resolve has a row, and
// the auto-seeded rows claim nothing they have not read (P2.3, R-DATA-02).
//
// WHY THIS TEST EXISTS. Before P2.3's structural half, the registry held one
// country file. `build-registry --check` printed the shortfall as a worklist and
// still exited 0, so a country the calculator could resolve had no row - and an
// absent row is the silent guess the registry exists to prevent: there is no
// place in the file to say "we have not verified this", so the reader cannot
// tell an unknown from a fact. These tests are the teeth behind the coverage
// number:
//
//   1. COVERAGE is total against the shipped place data, so a new country
//      partition cannot arrive without a registry row behind it.
//   2. A SEEDED ROW IS DETERMINISTIC. The committed file is compared byte for
//      byte with what the committed seeder produces from the same inputs, so the
//      220 unknown rows are a generator's output rather than 220 hand-written
//      paragraphs that could drift.
//   3. A SEEDED ROW CLAIMS NOTHING. Every field except currency is an explicit
//      unknown with a note and a review date, and no seeded row carries a
//      number, a grade or a source. This is what stops the seeder becoming a
//      machine for manufacturing confident-looking data.
//   4. A CURATED ROW IS NOT OVERWRITTEN. US carries cited values and 51
//      sub-national rows; the seeder must never touch it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { COUNTRY_CURRENCY } from "../assets/js/sizing/country-currency.js";
import {
  missingCountries,
  REGISTRY_DIR,
  seedCountryFile,
  serialise,
} from "../scripts/seed-registry-countries.mjs";
import { REQUIRED_FIELDS, validateCountry } from "../scripts/lib/registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = JSON.parse(
  readFileSync(join(ROOT, "assets/data/registry/sources.json"), "utf8"),
).sources;

function readCountry(code) {
  return readFileSync(join(REGISTRY_DIR, `${code}.json`), "utf8");
}

const countryFiles = readdirSync(REGISTRY_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();

const seeded = countryFiles.filter((code) => {
  const doc = JSON.parse(readCountry(code));
  return doc.values?.tariff?.unknown === true;
});

test("COVERAGE: every country the calculator can resolve has a registry row", () => {
  assert.deepEqual(missingCountries(), []);
  assert.equal(
    countryFiles.length >= Object.keys(COUNTRY_CURRENCY).length,
    true,
  );
});

test("COVERAGE: a resolvable country's row is never a name-only placeholder", () => {
  for (const code of Object.keys(COUNTRY_CURRENCY)) {
    const doc = JSON.parse(readCountry(code));
    assert.equal(doc.iso, code, `${code}.iso must match its filename`);
    assert.ok(
      typeof doc.name === "string" && doc.name.trim().length > 0,
      `${code}: name must not be blank`,
    );
    for (const field of REQUIRED_FIELDS) {
      assert.ok(
        field in doc.values,
        `${code}: missing ${field} - R-DATA-02 requires every field`,
      );
    }
  }
});

test("SEEDED ROWS: deterministic output of the committed seeder", () => {
  assert.ok(
    seeded.length >= 200,
    `expected the seeded rows, found ${seeded.length}`,
  );
  for (const code of seeded) {
    const doc = JSON.parse(readCountry(code));
    const retrieved = doc.values.currency.retrieved;
    const regenerated = serialise(
      seedCountryFile(code, COUNTRY_CURRENCY[code], retrieved),
    );
    assert.equal(
      regenerated,
      readCountry(code),
      `${code}.json is not what the seeder produces; re-run it rather than hand-editing`,
    );
  }
});

test("SEEDED ROWS: currency is cited, and nothing else is claimed", () => {
  for (const code of seeded) {
    const doc = JSON.parse(readCountry(code));
    const currency = doc.values.currency;
    assert.equal(
      currency.code,
      COUNTRY_CURRENCY[code],
      `${code}: wrong currency`,
    );
    assert.equal(
      currency.grade,
      "A",
      `${code}: currency must cite the standard`,
    );
    assert.equal(
      currency.source,
      "iso_4217",
      `${code}: currency must cite ISO 4217`,
    );
    for (const [field, value] of Object.entries(doc.values)) {
      if (field === "currency") continue;
      assert.equal(
        value.unknown,
        true,
        `${code}.${field}: seeded row must be unknown`,
      );
      assert.ok(
        typeof value.note === "string" && value.note.trim().length > 0,
        `${code}.${field}: an unknown must say why`,
      );
      assert.match(
        value.note,
        /R-DATA-02/,
        `${code}.${field}: note must cite the rule`,
      );
      for (const forbidden of ["lo", "mid", "hi", "grade", "source"]) {
        assert.equal(
          value[forbidden],
          undefined,
          `${code}.${field}: a seeded unknown must not carry ${forbidden}`,
        );
      }
    }
  }
});

test("SEEDED ROWS: every row validates against the registry schema", () => {
  const errors = [];
  for (const code of countryFiles) {
    const doc = JSON.parse(readCountry(code));
    errors.push(...validateCountry(code, doc, { sources: SOURCES }));
  }
  assert.deepEqual(errors, []);
});

test("CURATED ROWS: the seeder never overwrites a cited file", () => {
  assert.equal(existsSync(join(REGISTRY_DIR, "US.json")), true);
  const us = JSON.parse(readCountry("US"));
  assert.equal(
    us.values.tariff.unknown,
    undefined,
    "US tariff is cited, not unknown",
  );
  assert.equal(us.values.tariff.grade, "A");
  assert.equal(
    Object.keys(us.regions).length,
    51,
    "US state rows must survive",
  );
  const seededCodes = new Set(seeded);
  for (const code of ["US"]) {
    assert.equal(
      seededCodes.has(code),
      false,
      `${code} must not be regenerated`,
    );
  }
});

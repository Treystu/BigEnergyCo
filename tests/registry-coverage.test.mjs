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
//   2. A SEEDED ROW IS DETERMINISTIC. The committed file is compared with what
//      the committed seeder produces from the same inputs, so the 220 unknown
//      rows are a generator's output rather than 220 hand-written paragraphs
//      that could drift. The comparison normalises newlines first: the seeder
//      emits LF, while a Windows checkout with core.autocrlf=true (which
//      .gitattributes' `* text=auto` allows) hands the file back as CRLF. That
//      is the checkout policy talking, not the seeder - the blob in git is LF
//      either way - so every other byte still has to match exactly.
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
import {
  REQUIRED_FIELDS,
  canEmbed,
  latestReviewBy,
  validateCountry,
} from "../scripts/lib/registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = JSON.parse(
  readFileSync(join(ROOT, "assets/data/registry/sources.json"), "utf8"),
).sources;

function readCountry(code) {
  // Normalised to the seeder's LF so this check tests the generator, not the
  // platform's checkout newlines. The equality assertion below is unchanged.
  return readFileSync(join(REGISTRY_DIR, `${code}.json`), "utf8").replace(
    /\r\n/g,
    "\n",
  );
}

const countryFiles = readdirSync(REGISTRY_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5))
  .sort();

const eurostatCited = countryFiles.filter(
  (code) =>
    JSON.parse(readCountry(code)).values?.tariff?.source ===
    "eurostat_household_prices",
);

const seeded = countryFiles.filter((code) => {
  const doc = JSON.parse(readCountry(code));
  return doc.values?.tariff?.unknown === true;
});

// Cited rows are not all Eurostat: US carries an EIA retail price and PL an URE
// published average. A cited row is any row that named a tariff source instead
// of declaring the tariff unknown. A row that is neither seeded-unknown nor
// cited has had nothing decided about it, which is what the accounting test is
// there to catch.
const otherCited = countryFiles.filter((code) => {
  const tariff = JSON.parse(readCountry(code)).values?.tariff;
  return (
    tariff?.unknown !== true &&
    typeof tariff?.source === "string" &&
    tariff.source.length > 0 &&
    tariff.source !== "eurostat_household_prices"
  );
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
  // Every country row is accounted for: 21 carry a Eurostat citation, US and PL
  // carry a national-source citation, and the rest are the seeder's unknowns. A
  // row that is none of those is a row nobody has decided anything about, which
  // is how the 219 missing files happened in the first place. The non-Eurostat
  // cited rows are named in the message so a citation cannot slip in unrecorded.
  assert.equal(
    seeded.length + eurostatCited.length + otherCited.length,
    countryFiles.length,
    `${countryFiles.length} country files: ${seeded.length} seeded + ${eurostatCited.length} Eurostat-cited + ${otherCited.length} other-cited (${otherCited.join(", ") || "none"})`,
  );
  assert.ok(
    seeded.length >= 190,
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

// The eurozone rows are the first tariffs the registry actually cites. They are
// held to the plan's citation rules rather than to the seeded shape, because the
// risk is different: a seeded row can only be too silent, a cited row can be
// wrong. So the number, its currency, its unit, its window and the fact it names
// in its own note are all pinned.
test("EUROSTAT ROWS: the cited tariffs are well-formed and belong to their country", () => {
  const cited = eurostatCited;
  assert.equal(
    cited.length,
    21,
    `expected the 21 euro-area rows, found ${cited.length}`,
  );
  assert.equal(canEmbed(SOURCES.eurostat_household_prices), true);
  for (const code of cited) {
    const doc = JSON.parse(readCountry(code));
    const tariff = doc.values.tariff;
    const where = `${code}.tariff`;
    assert.equal(
      tariff.grade,
      "A",
      `${where}: Eurostat is an official statistic`,
    );
    assert.equal(
      tariff.unit,
      "EUR/kWh",
      `${where}: unit must carry its currency`,
    );
    assert.equal(
      tariff.currency,
      doc.values.currency.code,
      `${where}: the price currency must be the country's own currency`,
    );
    assert.equal(
      tariff.currency,
      COUNTRY_CURRENCY[code],
      `${where}: the price currency must match the shipped country table`,
    );
    assert.equal(
      tariff.lo,
      tariff.mid,
      `${where}: a point statistic has no spread`,
    );
    assert.equal(
      tariff.mid,
      tariff.hi,
      `${where}: a point statistic has no spread`,
    );
    assert.ok(
      tariff.mid > 0 && tariff.mid < 2,
      `${where}: ${tariff.mid} is not a plausible per-kWh price`,
    );
    assert.equal(
      tariff.year,
      2026,
      `${where}: year must be the reference year`,
    );
    assert.ok(
      tariff.review_by <= latestReviewBy("tariff", tariff.retrieved),
      `${where}: review_by is past the 12-month window`,
    );
    assert.match(
      tariff.note,
      /nrg_pc_204/,
      `${where}: the note must name the dataset`,
    );
    assert.match(
      tariff.note,
      /2500-4999/,
      `${where}: the note must name the consumption band`,
    );
    assert.match(
      tariff.note,
      /2026-S1/,
      `${where}: the note must name the reference period`,
    );
  }
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

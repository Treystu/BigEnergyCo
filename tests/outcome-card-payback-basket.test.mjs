// The outcome card printed one payback and the four-ways-to-pay panel printed
// another for the same system, both under the words "Pays for itself" / "Break-even".
//
// Neither was wrong: the card's rows are the PARTS basket ($2,996 of hardware,
// about 3 years), while the installed route — the same system plus the
// electrician, permits and inspection — is $8,862 and takes about 6. One system
// with two paybacks is fine; one LABEL with two paybacks is the X6 defect Cure A
// exists to close, and it made the recommendation look twice as good as it is.
//
// The card now prints both, each naming its basket, and the installed figure is
// READ from the priced routes rather than derived a second time.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { RESULT_COPY } from "../assets/js/shared/result-copy.js";

const LOCALES = ["en", "es", "pt", "fr", "de", "nl", "ar"];
const PARTS = /part|Teil|pièce|piez|peç|pec|onderde|مكون|قطع/i;
const INSTALLED =
  /install|instala|instalé|montaje|monté|مركّب|مرك|geïnstalleerd/i;

test("the parts payback says parts, in every locale", () => {
  for (const loc of LOCALES) {
    const label = RESULT_COPY[loc].resCardPaysForItself;
    assert.ok(label, `${loc}: missing label`);
    assert.match(
      label,
      PARTS,
      `${loc}: "${label}" is a bare "pays for itself" again — it prices the parts basket, not the installed system`,
    );
  }
});

test("the installed payback has its own label and it names the installed route", () => {
  for (const loc of LOCALES) {
    const dict = RESULT_COPY[loc];
    const label = dict.resCardPaysInstalled;
    assert.ok(label, `${loc}: no installed-payback label`);
    assert.match(label, INSTALLED, `${loc}: "${label}" does not say installed`);
    assert.notEqual(
      label,
      dict.resCardPaysForItself,
      `${loc}: two paybacks share one label`,
    );
  }
});

test("the installed row is read from the priced routes, not recomputed", () => {
  const src = fs.readFileSync("assets/js/sizing/ui.js", "utf8");
  assert.match(
    src,
    /installedBreakEvenYear\(p, b\)/,
    "the card must ask for the installed break-even",
  );
  // The helper's only source of that figure is the priced model, and it requires
  // the routes to have priced THIS system before it answers.
  const helper = src.slice(
    src.indexOf("function installedBreakEvenYear"),
    src.indexOf("/** Renders the Plain-English ELI5"),
  );
  assert.ok(helper.includes("p.pathsPriced"), "must read the priced routes");
  assert.ok(
    helper.includes("pathsPricedFor"),
    "must refuse a different system's routes",
  );
  assert.ok(
    helper.includes("breakEvenYear"),
    "the year comes from the priced route",
  );
  assert.doesNotMatch(
    helper,
    /paybackYears|costLo|lifetimeCost/,
    "the installed payback is not re-derived from the parts basket",
  );
});

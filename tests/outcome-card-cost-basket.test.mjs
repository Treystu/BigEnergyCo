// #403 follow-up: the outcome card must not read as "the price of the system".
//
// The row said "Cost to buy ~$1,149.00-$4,101.00" for a 1.92 kW + 11 kWh system,
// which is the COMPONENT band - cells ex-factory to budget retail, freight
// included, no fitting, permits or labour. Directly below it, the four ways to
// pay said $4,825.00-$10,959.00 up-front for the same system. Two numbers, one
// page, and the catalogue-price one called "cost to buy": the reader who takes
// only the numbers away is wrong by thousands.
//
// The fix is a label and a sentence, not a new price: the band is correct for
// what it is, and inventing an installed band from components would be the same
// sin in the other direction. So this test holds the LABEL: the row names the
// basket (parts, ex-factory to retail), and a sentence beneath it says what the
// figure excludes and where the installed range lives.
import assert from "node:assert/strict";
import test from "node:test";

import { RESULT_COPY } from "../assets/js/shared/result-copy.js";

const LOCALES = ["en", "es", "pt", "fr", "de", "nl", "ar"];

test("the parts band is labelled as parts, in every locale", () => {
  for (const loc of LOCALES) {
    const dict = RESULT_COPY[loc];
    assert.ok(dict, `${loc}: missing dictionary`);
    const label = dict.resCardCostToBuy;
    assert.ok(label && label.length > 3, `${loc}: empty label`);
    assert.doesNotMatch(
      label,
      /^(Cost to buy|Kaufpreis|Coût d'achat|Aankoopkosten)$/i,
      `${loc}: "${label}" reads as the price of the system, not the parts`,
    );
  }
});

test("the exclusion sentence exists and names the missing costs", () => {
  const terms = {
    en: /fitting|labour/i,
    es: /montaje|mano de obra/i,
    pt: /instala|mão de obra/i,
    fr: /pose|main-d'œuvre/i,
    de: /Montage|Arbeit/i,
    nl: /montage|arbeid/i,
    ar: /التركيب|أجرة العمل/,
  };
  for (const loc of LOCALES) {
    const note = RESULT_COPY[loc].resCardCostToBuyNote;
    assert.ok(note && note.length > 40, `${loc}: no exclusion sentence`);
    assert.match(note, terms[loc], `${loc}: must say what it excludes`);
    // And it must point at where the installed range is, or it just moves the
    // contradiction one sentence further down.
    assert.match(
      note,
      /four|cuatro|quatro|quatre|vier|de vier|الأربع/i,
      `${loc}: must point at the four ways to pay`,
    );
  }
});

test("the up-front chip says parts too, so the app bar cannot mislead either", () => {
  for (const loc of LOCALES) {
    const chip = RESULT_COPY[loc].resChipUpfront;
    assert.ok(chip, `${loc}: missing chip label`);
    assert.match(
      chip,
      /part|Teil|pièce|piez|peç|pec|onderde|مكون/i,
      `${loc}: "${chip}" is a bare "up-front" again`,
    );
  }
});

test("the all-in row names its basket, not just the horizon", () => {
  // "All-in over 20 yrs (system + bills)" on the parts basket sat beside the cost
  // table's installed total; "system" there meant the parts figure. The row now
  // says parts, in every locale, for both the plain and the credit variant.
  const parts = /part|Teil|pièce|piez|peç|pec|onderde|مكون/i;
  for (const loc of LOCALES) {
    const dict = RESULT_COPY[loc];
    assert.match(dict.resLblAllIn, parts, `${loc}: resLblAllIn`);
    assert.match(
      dict.resLblAllInMinusCredit,
      parts,
      `${loc}: resLblAllInMinusCredit`,
    );
  }
});

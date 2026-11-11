// #365 / E13: the results area used to explain itself in English inside the
// engine, under a translated headline. These pins hold the cure:
//   1. every locale carries every result-surface string, with the same
//      placeholders (a dropped {chem} would silently erase the chemistry);
//   2. the render sites no longer emit the bare literals the audit measured;
//   3. composing the recommendation in a locale produces that locale's words.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { LOCALES } from "../assets/js/shared/locales.js";
import { RESULT_COPY } from "../assets/js/shared/result-copy.js";
import { translate } from "../assets/js/shared/i18n.js";
import { TILT_COPY } from "../assets/js/shared/tilt-copy.js";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const UI = readFileSync(path.join(ROOT, "assets/js/sizing/ui.js"), "utf8");
const RUN = readFileSync(path.join(ROOT, "assets/js/sizing/run.js"), "utf8");
const LANGS = Object.keys(LOCALES);
const EN = RESULT_COPY.en;
const KEYS = Object.keys(EN);

function placeholders(text) {
  return [...String(text).matchAll(/\{([A-Za-z0-9_]+)\}/g)]
    .map((m) => m[1])
    .sort();
}

test("every locale carries every result-surface string", () => {
  assert.ok(
    KEYS.length >= 50,
    `expected the table to be substantive, got ${KEYS.length}`,
  );
  for (const lang of LANGS) {
    for (const key of KEYS) {
      const value = LOCALES[lang][key];
      assert.equal(
        typeof value,
        "string",
        `${lang}.${key} is missing - the result surface would fall back to English`,
      );
      assert.ok(value.trim().length > 0, `${lang}.${key} is empty`);
      assert.deepEqual(
        placeholders(value),
        placeholders(EN[key]),
        `${lang}.${key} does not carry the same placeholders as English`,
      );
    }
  }
});

test("no locale leaves a result string in English by copying it verbatim", () => {
  // Swift/vendor words and units are legitimately shared; whole sentences are
  // not. A sentence-length value identical to English outside `en` is a
  // deliberate translation that never happened.
  const allow = new Set([
    "resMatrixBatteryGoalHeader",
    "resBillCutChip",
    "resPeakOffsetChip",
  ]);
  for (const lang of LANGS) {
    if (lang === "en") continue;
    for (const key of KEYS) {
      if (allow.has(key)) continue;
      const value = LOCALES[lang][key];
      if (EN[key].length < 24) continue;
      assert.notEqual(
        value,
        EN[key],
        `${lang}.${key} is the English sentence, untranslated`,
      );
    }
  }
});

test("the measured English literals no longer live in the render sites", () => {
  const banned = [
    '"★ Recommended"',
    '"bill cut, no reserve held"',
    "Click any cell in the matrix below to see that exact system",
    "Your ~${",
    '"True 20-yr break-even"',
    '"Pays for itself in"',
    '"peak offset"',
    "Green outline = lowest true 20-year cost in that column",
  ];
  for (const phrase of banned) {
    assert.ok(
      !UI.includes(phrase),
      `ui.js still emits the bare English literal: ${phrase}`,
    );
  }
  // The engine keeps its English prose as the payload contract, but it must now
  // carry the structured parts the renderer rebuilds from.
  assert.ok(
    RUN.includes("bestReasonParts") && RUN.includes("autoNoteParts"),
    "run.js must carry the structured parts beside the English prose",
  );
  assert.ok(
    UI.includes("localizedBestReason(") && UI.includes("localizedAutoNote("),
    "ui.js must render the localized compositions",
  );
});

test("the Spanish recommendation is Spanish, and keeps the numbers it describes", () => {
  const ahead = translate("resAhead", { pct: 5.2, chem: "LFP" }, "es");
  const why = translate("resWhyNaion", { chem: "Ion de sodio", ahead }, "es");
  const tail = translate("resTailOthers", {}, "es");
  const agm = translate("resAgmRef", { n: 8 }, "es");
  const text = why + tail + agm;

  assert.ok(/Ion de sodio/.test(text), "the chemistry name must survive");
  assert.ok(/5\.2/.test(text), "the cost gap must survive translation");
  assert.ok(/\b8\b/.test(text), "the swap count must survive translation");
  assert.ok(
    !/\b(the|your|this|with|and|never recommended)\b/i.test(text),
    `Spanish composition leaked English: ${text}`,
  );
  for (const word of ["recomendación", "recambios", "opciones"]) {
    assert.ok(
      text.toLowerCase().includes(word),
      `expected Spanish wording (${word}) in: ${text}`,
    );
  }
});

test("every basis id the payload can name has a phrase in every locale", () => {
  const ids = [
    "resBasisCut10",
    "resBasisCut15",
    "resBasisCut20",
    "resBasisCut25",
    "resBasisCut30",
    "resBasisCut60",
    "resBasisCut80",
    "resBasisCut95",
    "resBasisPeak10",
    "resBasisPeak15",
    "resBasisPeak20",
    "resBasisTier100",
    "resBasisTier99",
    "resBasisTier95",
  ];
  for (const lang of LANGS) {
    for (const id of ids) {
      assert.equal(
        typeof LOCALES[lang][id],
        "string",
        `${lang}.${id} missing - that target would render an empty sentence`,
      );
      assert.ok(
        LOCALES[lang][id].trim().length > 4,
        `${lang}.${id} is not a phrase`,
      );
    }
  }
  // A peak-hour offset must never be described as a bill cut in any locale:
  // the codebase draws that line everywhere else, and the copy must hold it.
  for (const lang of LANGS) {
    for (const id of ["resBasisPeak10", "resBasisPeak15", "resBasisPeak20"]) {
      const value = LOCALES[lang][id].toLowerCase();
      const billCut =
        /(bill cut|recorte de factura|baisse de facture|conta de|rechnungssenkung|rekeningverlaging|خفض للفاتورة)/;
      assert.ok(
        !billCut.test(
          value.replace(
            /peak-hour|horas punta|heures de pointe|spitzenstunden|piekuren|ساعات الذروة/,
            "",
          ),
        ),
        `${lang}.${id} calls a peak offset a bill cut: ${LOCALES[lang][id]}`,
      );
      assert.ok(
        /peak-hour|punta|ponta|pointe|spitzenstunden|piekuren|ذروة|الذروة/.test(
          value,
        ),
        `${lang}.${id} must say it is a peak-hour offset: ${LOCALES[lang][id]}`,
      );
    }
  }
});

// The tilt-guide family (#365 second pass): the two noon labels drawn inside the
// sun-path SVG, the winter-tilt gloss, the daylight title, the best-pick suffix
// and the two site-specific tilt takeaways. Same contract as RESULT_COPY: every
// locale carries every string with its placeholders, and no locale ships the
// English sentence verbatim.
test("every locale carries every tilt-guide string, placeholders intact", () => {
  const keys = Object.keys(TILT_COPY.en);
  assert.ok(keys.length >= 9, `expected the family, got ${keys.length}`);
  for (const lang of LANGS) {
    for (const key of keys) {
      const value = LOCALES[lang][key];
      assert.equal(
        typeof value,
        "string",
        `${lang}.${key} is missing - the tilt guide would fall back to English`,
      );
      assert.deepEqual(
        placeholders(value),
        placeholders(TILT_COPY.en[key]),
        `${lang}.${key} does not carry the same placeholders as English`,
      );
      if (lang !== "en" && TILT_COPY.en[key].length >= 24)
        assert.notEqual(
          value,
          TILT_COPY.en[key],
          `${lang}.${key} is the English sentence, untranslated`,
        );
    }
  }
});

test("the tilt guide renders through the copy table, not bare literals", () => {
  const banned = [
    "Summer Noon: ",
    "Winter Noon: ",
    "Sheds snow &amp; captures low winter midday sun",
    "Daylight &amp; Seasonal Swing",
    '" — cheapest compared"',
    '" — safest pick"',
    "Sun path for ${compassShort}",
  ];
  for (const phrase of banned)
    assert.ok(
      !UI.includes(phrase),
      `ui.js still emits the bare English literal: ${phrase}`,
    );
  for (const key of Object.keys(TILT_COPY.en))
    assert.ok(UI.includes(`"${key}"`), `ui.js never renders ${key}`);
});

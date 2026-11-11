import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "../assets/js/shared/locales.js";

// V4 / E13 — the comprehension pass. Four jargon families a first-timer meets on
// the way to a result (kWh/day, nameplate, autonomy, the independence tiers) and
// three orientation surfaces (who each preset is for, what each result tab
// opens, what the two costs include) were either absent or English-only. This
// test is the pin: it fails if a gloss loses its hook (so it can ship
// untranslated), loses its locale string, or stops saying the thing it exists to
// say. It reads the shipped files, not a copy, because the defect class it
// guards is copy that never reached the dictionary at all.

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HTML = readFileSync(join(ROOT, "index.html"), "utf8");
const UI = readFileSync(join(ROOT, "assets/js/sizing/ui.js"), "utf8");

const LANGS = ["en", "es", "pt", "fr", "de", "nl", "ar"];

// The four glosses a visitor meets in the markup. includesNote is the fifth,
// rendered by the money bar, so it is pinned separately below.
const GLOSS_KEYS = ["glossKwhDay", "glossTier", "ladderIntro"];
const RENDERED_GLOSS_KEYS = ["includesNote"];
const PRESET_KEYS = [
  "presetWho",
  "presetCabin",
  "presetVan",
  "presetHome",
  "presetHomestead",
  "presetBackup",
  "presetClear",
];
const TIER_KEYS = ["tierOption100", "tierOption99", "tierOption95"];

test("comprehension: every gloss and fit label carries a data-i18n hook", () => {
  for (const key of [...GLOSS_KEYS, ...PRESET_KEYS, ...TIER_KEYS]) {
    assert.ok(
      HTML.includes(`data-i18n="${key}"`),
      `index.html must carry a data-i18n hook for ${key}, or the gloss ships untranslated`,
    );
  }
  for (const key of RENDERED_GLOSS_KEYS) {
    assert.ok(
      UI.includes(`t("${key}")`),
      `ui.js must translate ${key} — it is rendered, not marked up`,
    );
  }
});

test("comprehension: every gloss exists in every offered locale, translated", () => {
  for (const key of [
    ...GLOSS_KEYS,
    ...RENDERED_GLOSS_KEYS,
    ...PRESET_KEYS,
    ...TIER_KEYS,
  ]) {
    for (const lang of LANGS) {
      const value = LOCALES[lang]?.[key];
      assert.equal(
        typeof value,
        "string",
        `${lang} is missing ${key} — the hook would fall back to English silently`,
      );
      assert.ok(value.trim().length > 0, `${lang}.${key} is empty`);
      if (lang !== "en") {
        assert.notEqual(
          value,
          LOCALES.en[key],
          `${lang}.${key} is identical to English — it was never translated`,
        );
      }
    }
  }
});

test("comprehension: the kWh/day gloss defines the unit at first use", () => {
  const en = LOCALES.en.glossKwhDay;
  assert.match(en, /kWh\/day/, "the gloss must name the unit it explains");
  assert.match(
    en,
    /\d+/,
    "the gloss must give a reference figure a first-timer can anchor to",
  );
  // Both entry points that ask for a daily energy figure carry it: the off-grid
  // quick slider and the advanced "I know my kWh/day" input.
  const hooks = HTML.match(/data-i18n="glossKwhDay"/g) ?? [];
  assert.equal(
    hooks.length,
    1,
    "the gloss is introduced once, above every input that asks for kWh/day — not repeated per panel",
  );
  assert.ok(
    HTML.indexOf('data-i18n="glossKwhDay"') <
      HTML.indexOf('id="dailyKwhInput"'),
    "the gloss must precede the input that uses the unit",
  );
});

test("comprehension: the installed figure glosses nameplate against usable", () => {
  for (const lang of LANGS) {
    const value = LOCALES[lang].simpleKwhInstalled;
    assert.match(
      value,
      /\{kwh\}/,
      `${lang}.simpleKwhInstalled must keep the {kwh} placeholder`,
    );
  }
  assert.match(
    LOCALES.en.simpleKwhInstalled,
    /nameplate/,
    "the installed figure is where 'nameplate' first meets a reader; the gloss must use the word the charts use",
  );
  assert.match(
    LOCALES.en.simpleKwhInstalled,
    /usable/,
    "the gloss must say what the other number is",
  );
});

test("comprehension: the off-grid verdict glosses autonomy in place", () => {
  for (const lang of LANGS) {
    const value = LOCALES[lang].verdictOffGrid;
    for (const slot of ["{pct}", "{unmetHours}", "{autonomy}"]) {
      assert.ok(
        value.includes(slot),
        `${lang}.verdictOffGrid must keep ${slot} — the sentence is measured, not written`,
      );
    }
  }
  assert.match(
    LOCALES.en.verdictOffGrid,
    /days of autonomy \(.+\)/,
    "the term must carry its one-line meaning at the point it appears",
  );
});

test("comprehension: the two costs are reconciled, not just both shown", () => {
  const en = LOCALES.en.includesNote;
  assert.match(en, /first cost/i, "the line must name the up-front figure");
  assert.match(en, /20-year/i, "the line must name the long-run figure");
  assert.match(
    en,
    /include/i,
    "the line must say what each figure covers — that is the reconciliation",
  );
  // It is rendered by the money bar itself, because that is the line that
  // raises the question (a yearly spend beside a first cost and a 20-year
  // total). Sitting above an empty results area, or shown without a result,
  // it would be a note about numbers nobody can see yet.
  assert.match(
    UI,
    /moneyBar\.appendChild\(el\("p", \{ class: "uc-note" \}, t\("includesNote"\)\)\)/,
    "the includes note must be rendered with the money line it reconciles",
  );
  assert.ok(
    !HTML.includes('id="includesNote"'),
    "the note must not also sit in the markup, where it would show before a result exists",
  );
});

test("comprehension: the line above the tabs says what each tab opens", () => {
  const en = LOCALES.en.ladderIntro;
  for (const tab of ["Best pick", "Compare batteries", "All options"]) {
    assert.ok(
      en.includes(tab),
      `ladderIntro must name the "${tab}" tab it explains`,
    );
  }
  assert.ok(
    HTML.indexOf('data-i18n="ladderIntro"') < HTML.indexOf('id="resultLadder"'),
    "the explanation must sit ABOVE the tabs it explains in document order",
  );
  assert.match(
    HTML,
    /<p\b[^>]*id="ladderIntro"[^>]*\bhidden\b/,
    "the line must start hidden, with the ladder it describes",
  );
});

test("comprehension: each preset is labelled by who it fits", () => {
  // The emoji is decoration: it must sit OUTSIDE the keyed span, because
  // applyI18n writes textContent and would delete it on any translated page.
  for (const [preset, key] of [
    ["cabin", "presetCabin"],
    ["van", "presetVan"],
    ["home", "presetHome"],
    ["homestead", "presetHomestead"],
    ["backup", "presetBackup"],
  ]) {
    const re = new RegExp(
      `<button[^>]*data-preset="${preset}"[\\s\\S]{0,300}?\\p{Extended_Pictographic}[^<]*<span data-i18n="${key}"`,
      "u",
    );
    assert.match(
      HTML,
      re,
      `the ${preset} preset must keep its emoji outside the translated span`,
    );
  }
  assert.match(
    LOCALES.en.presetHome,
    /typical/i,
    "the typical home must be called out, not left as one of five equal options",
  );
});

test("comprehension: the independence tiers are keyed, not English-only", () => {
  // These three shipped as English <option> text on every locale. They are the
  // tier language V4 asks to gloss, so they carry hooks of their own.
  for (const key of TIER_KEYS) {
    assert.match(
      HTML,
      new RegExp(`<option[^>]*data-i18n="${key}"|<option[^>]*${key}`),
      `${key} must be hooked on its own option`,
    );
  }
});

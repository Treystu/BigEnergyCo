// D2/D3 of the owner's zero-conversion order (tracker #145).
//
// The diagnosis was blunt: the ask led with cost-coverage, the gift terms ran
// long enough to talk a motivated visitor out of it, and the only contact door
// was headed "Questions the AI couldn't answer?" with the favour framing up
// front. These pins hold the cure: the ask argues for the work, the legal floor
// survives in about two lines, and the contact door is an invitation that
// keeps its honesty AFTER the invitation rather than instead of it.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { LOCALES } from "../assets/js/shared/locales.js";
import { HOME_COPY } from "../assets/js/shared/home-copy.js";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const HTML = readFileSync(path.join(ROOT, "index.html"), "utf8");
const LANGS = Object.keys(LOCALES);
const KEYS = [
  "supportSectionTitle",
  "donationIntro",
  "donationTerms",
  "emailTitle",
  "emailWelcome",
  "emailSupportExpectations",
];

test("every locale carries the ask, the legal floor and the invitation", () => {
  for (const lang of LANGS) {
    for (const key of KEYS) {
      const value = LOCALES[lang][key];
      assert.equal(
        typeof value,
        "string",
        `${lang}.${key} must stay a string for the i18n hook`,
      );
      assert.ok(value.trim().length > 10, `${lang}.${key} is empty`);
    }
  }
});

test("the legal floor survives: gift, buys nothing, not deductible, not a charity", () => {
  for (const lang of LANGS) {
    const terms = LOCALES[lang].donationTerms;
    const marker = LOCALES[lang].donationNotTaxDeductible;
    assert.ok(
      terms.includes(marker),
      `${lang}.donationTerms must still state that the gift is ${marker}`,
    );
    // Two lines, not a wall. The old copy ran 8+ sentences and ended by
    // redirecting the spend the ask had just asked for.
    assert.ok(
      terms.length <= 420,
      `${lang}.donationTerms is ${terms.length} chars - the floor is two lines, not a block`,
    );
    const sentences = terms
      .split(/[.!?؟]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    assert.ok(
      sentences.length <= 4,
      `${lang}.donationTerms has ${sentences.length} sentences; the legal floor is at most 4`,
    );
  }
});

test("the dissuasion that made the ask argue against itself is gone", () => {
  const banned = [
    "spend it on a licensed local engineer",
    "Please don't send money you need",
    "Please don't send money you need.",
    "as a favor — not a support desk",
    "as a favour",
    "not a support desk",
    "chip in toward the AI and hosting costs",
  ];
  const surfaces = [
    ...LANGS.map((lang) => [lang, JSON.stringify(LOCALES[lang])]),
    ["index.html", HTML],
  ];
  for (const [where, text] of surfaces) {
    for (const phrase of banned) {
      assert.ok(
        !text.includes(phrase),
        `${where} still carries the dissuasion phrase: ${phrase}`,
      );
    }
  }
});

test("the contact door is keyed and headed as an invitation", () => {
  assert.ok(
    HTML.includes('data-i18n="emailTitle"'),
    "the contact heading must be translatable, not English-only markup",
  );
  assert.ok(
    !HTML.includes("Questions the AI couldn't answer"),
    "the contact heading must no longer be the AI's failure fallback",
  );
  assert.ok(
    HTML.includes('data-i18n="supportSectionTitle"'),
    "the support heading must be translatable too",
  );
  // Honesty after the invitation, not instead of it: the AI caveat is still
  // inside the same paragraph, just no longer the opening move.
  const block = HTML.slice(
    HTML.indexOf('data-i18n="emailSupportExpectations"'),
  ).slice(0, 900);
  assert.ok(
    block.includes("not professional engineering, electrical, or financial"),
    "the advice caveat must survive the reframe",
  );
  assert.ok(
    !/This is one person answering email in his own time, as a favor/.test(
      HTML,
    ),
    "the favour framing must not lead the invitation",
  );
});

test("the ask sits with the result and before the support section", () => {
  const ask = HTML.indexOf('id="valueMomentAsk"');
  const support = HTML.indexOf('id="support"');
  assert.ok(ask > 0, "the value-moment ask element must exist");
  assert.ok(
    support > ask,
    "the ask must precede the support section it links to",
  );
  // It stays hidden until a result exists: an ask before a result is a pitch.
  const element = HTML.slice(ask - 400, ask + 40);
  assert.ok(
    /hidden/.test(element) || /hidden/.test(HTML.slice(ask, ask + 400)),
    "the ask must ship hidden and be revealed by the result renderer",
  );
});

test("one source per string: the locale merge does not shadow HOME_COPY", () => {
  // home-copy.js supplies the long-form copy for six locales; any inline
  // duplicate in locales.js silently wins the spread and drifts from it.
  for (const lang of Object.keys(HOME_COPY)) {
    for (const key of KEYS) {
      if (!(key in HOME_COPY[lang])) continue;
      assert.equal(
        LOCALES[lang][key],
        HOME_COPY[lang][key],
        `${lang}.${key} differs between locales.js and home-copy.js`,
      );
    }
  }
  // Dutch has no HOME_COPY block at all; its copy lives in locales.js only.
  assert.ok(!("nl" in HOME_COPY), "nl must not gain a second copy source");
});

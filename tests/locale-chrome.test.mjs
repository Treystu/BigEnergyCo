// #437 locale chrome. The rendered ES census found 22 visible English strings
// on a Spanish page even though every key existed in all seven locales: the
// markup had no hooks and three JS painters wrote their own text. These pins
// hold the cure - a hook or a locale-painted writer for every censused string,
// and the painters in the language-change repaint list.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { LOCALES } from "../assets/js/shared/locales.js";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const html = readFileSync(join(ROOT, "index.html"), "utf8");
const ui = readFileSync(join(ROOT, "assets/js/sizing/ui.js"), "utf8");

const CHROME_KEYS = [
  "heroStatFree",
  "heroStatNoSignup",
  "heroStatNoAccount",
  "heroStatExplore",
  "heroStatEstimates",
  "heroStatVerify",
  "coordsMoreSummary",
  "climateAwareLabel",
  "climateAwareHint",
  "noSwapLabel",
  "noSwapHint",
  "deratesHeading",
  "chemNaionOption",
  "chemLfpOption",
  "chemAgmOption",
  "cutTarget95",
  "cutTarget80",
  "cutTarget60",
  "cutTargetCustom",
  "cutValue",
  "cutValueOver",
  "faqAccurateHeading",
  "faqPaybackHeading",
  "faqCostHeading",
  "faqEstimatesHeading",
  "faqAiHeading",
  "legalThisIsHeading",
  "legalMetaLine",
  "blogFooterSafety",
  // Second batch: the tail the broader rendered census found.
  "skipToCalculator",
  "placeHintWorldwide",
  "labelLatitude",
  "labelLongitude",
  "labelOffgridKwh",
  "derateHintTypical",
  "partsExWorksNote",
  "partsIndicativeNote",
  "hwSolarBattery",
  "hwSolarOnly",
  "hwBatteryOnly",
  "faqGeneratorHeading",
  "faqOfflineHeading",
  "faqBatterySafeHeading",
  "faqPrivacyHeading",
  "legalTermsTitle",
  "legalEstimatesHeading",
  "legalAiHeading2",
  "legalSafetyHeading",
  "legalNoWarrantyHeading",
  "legalLiabilityHeading",
  "legalContribHeading",
  "legalPrivacyHeading",
  "legalUseHeading",
  "systemModalHeading",
];

test("#437: every chrome key exists in every locale", () => {
  for (const lang of Object.keys(LOCALES)) {
    for (const key of CHROME_KEYS) {
      assert.equal(
        typeof LOCALES[lang][key],
        "string",
        `${lang}.${key} must exist`,
      );
      assert.ok(
        LOCALES[lang][key].trim().length > 1,
        `${lang}.${key} must not be blank`,
      );
    }
  }
});

test("#437: the placeholders survive translation", () => {
  for (const lang of Object.keys(LOCALES)) {
    for (const key of ["cutValue", "cutValueOver"]) {
      assert.match(
        LOCALES[lang][key],
        /\{pct\}/,
        `${lang}.${key} must keep {pct}`,
      );
    }
  }
});

test("#437: every censused string in the markup carries a hook", () => {
  const strings = [
    "Free, always",
    "No signup",
    "No account, no email required",
    "Explore realistic bill-cut scenarios",
    "Estimates only",
    "Verify with a licensed pro",
    "More precise option",
    "Use climate-aware losses",
    "dust and cold are estimated",
    "Show the no-swap option",
    "compare against the engine's direct pick",
    "Advanced: fine-tune system losses",
    "Sodium-Ion",
    "LFP (LiFePO4)",
    "Lead-Acid (AGM)",
    "near-zero bill",
    "heavy bill cut",
    "daytime solar priority",
    "Custom (from the results slider)",
    "How accurate are the estimates?",
    "Will a system pay for itself?",
    "What does a system actually cost?",
    "Estimates, not engineering",
    "You are talking to an AI",
    "1. What this is",
    "Free tool - no warranty",
    "Skip to calculator",
    "Works worldwide",
    "Latitude (",
    "Longitude (",
    "Off-grid power need",
    "85–100; 98 is typical",
    "indicative ex-works China",
    "Solar + Battery (Default)",
    "Solar only (Grid-tie",
    "Battery only (Peak-hour",
    "Do I need a generator?",
    "Does it work without internet?",
    "Is building my own battery safe?",
    "No accounts, no tracking",
    "Terms of Use &amp; Disclaimer",
    "2. Estimates only",
    "3. AI-generated content",
    "4. Safety",
    "5. No warranty",
    "6. Limitation of liability",
    "7. Contributions",
    "8. Privacy",
    "9. Acceptable use",
    "Full system analysis",
  ];
  for (const s of strings) {
    const at = html.indexOf(s);
    assert.ok(at > 0, `index.html lost the string: ${s}`);
    // A string can appear more than once (JSON-LD, FAQ prose, the control); the
    // element the visitor sees must carry the hook, so ANY hooked occurrence
    // satisfies this - and a string with no hooked occurrence fails.
    let hooked = false;
    for (let i = html.indexOf(s); i > 0; i = html.indexOf(s, i + 1)) {
      const lead = html.slice(Math.max(0, i - 260), i);
      if (/data-i18n(-aria-label)?="[a-zA-Z][\w-]*"/.test(lead)) hooked = true;
    }
    assert.ok(hooked, `${s} has no locale hook on or before its element`);
  }
});

test("#437: the AI modal label is translated, not just drawn", () => {
  assert.match(
    html,
    /aria-label="Full system analysis"\s+data-i18n-aria-label="analysisFullSystem"/,
  );
});

test("#437: the hardware reference repaints from the dictionary", () => {
  const start = ui.indexOf("function repaintRuntimeCopy()");
  assert.ok(start > -1);
  const body = ui.slice(start, ui.indexOf("\n}\n", start));
  assert.match(
    body,
    /renderBom\(\)/,
    "renderBom() paints the BOM scope note from content.js; without it a language change leaves the note in English",
  );
  assert.match(
    ui,
    /t\(item\.scopeKey\)/,
    "the scope note must come from the dictionary",
  );
  const content = readFileSync(
    join(ROOT, "assets/js/shared/content.js"),
    "utf8",
  );
  assert.doesNotMatch(
    content,
    /scope: "indicative/,
    "a raw English scope string is a painted string with no key",
  );
});

test("#437: the JS painters are in the language-change repaint list", () => {
  const start = ui.indexOf("function repaintRuntimeCopy()");
  assert.ok(start > 0, "repaintRuntimeCopy must exist");
  const body = ui.slice(start, start + 1400);
  for (const call of [
    "updateLoadReadout()",
    "syncCutLabel()",
    "renderFxStatus()",
  ]) {
    assert.ok(body.includes(call), `repaintRuntimeCopy must call ${call}`);
  }
});

test("#437: no English template is written by the bill-cut painter", () => {
  const start = ui.indexOf("function syncCutLabel()");
  const body = ui.slice(start, start + 1200);
  assert.ok(!/textContent\s*=\s*`[^`]*Cut ~/.test(body), "hardcoded cut label");
  assert.ok(
    !/textContent\s*=\s*`[^`]*Produce ~/.test(body),
    "hardcoded over-cut label",
  );
  assert.match(body, /t\(v > 100 \? "cutValueOver" : "cutValue"/);
});

test("#437: the four localized posts render the footer they were missing", () => {
  const pages = [
    "blog/deduccion-irpf-autoconsumo-2026/index.html",
    "blog/dotacja-magazyn-energii-2026/index.html",
    "blog/gia-dien-5-bac-2026/index.html",
    "blog/program-afm-baterii-2026/index.html",
  ];
  for (const page of pages) {
    const pageHtml = readFileSync(join(ROOT, page), "utf8");
    const footers = pageHtml.match(/<footer[\s\S]*?<\/footer>/gi) || [];
    assert.equal(footers.length, 1, `${page} must render exactly one footer`);
    assert.match(footers[0], /data-i18n="blogFooterSafety"/);
    assert.ok(
      (footers[0].match(/href="mailto:lucasballek@gmail\.com"/g) || [])
        .length === 1,
      `${page} footer must carry the contact link once`,
    );
  }
});

// ---- results-detail panel (#437 tail) -------------------------------------
// The spec tables, the BOS checklist, the plain-language summary, the appliance
// picker and the methodology paragraph are all built by JS, so a hook cannot
// reach them: each one must be a key with a painter that calls t(), and the
// painters must sit on the language-change repaint path.
const detail = readFileSync(
  join(ROOT, "assets/js/shared/detail-copy.js"),
  "utf8",
);
const runJs = readFileSync(join(ROOT, "assets/js/sizing/run.js"), "utf8");
const appliances = readFileSync(
  join(ROOT, "assets/js/sizing/appliances.js"),
  "utf8",
);
const DRAWERS = ["renderBomPanel", "renderEli5Summary", "retailRowText"];

test("#437: every detail-panel key exists in every locale", () => {
  const langs = Object.keys(LOCALES);
  const keys = Object.keys(LOCALES.en).filter((k) =>
    /^d[A-Z]|^ap[A-Z]/.test(k),
  );
  assert.ok(
    keys.length >= 100,
    `expected the detail table to be substantive, got ${keys.length}`,
  );
  const placeholders = (text) =>
    [...String(text).matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]).sort();
  for (const key of keys) {
    for (const lang of langs) {
      const value = LOCALES[lang][key];
      assert.equal(
        typeof value,
        "string",
        `${lang}.${key} is missing - the detail panel would fall back to English`,
      );
      assert.ok(value.trim().length > 0, `${lang}.${key} is empty`);
      assert.deepEqual(
        placeholders(value),
        placeholders(LOCALES.en[key]),
        `${lang}.${key} does not carry the same placeholders as English`,
      );
    }
  }
  assert.ok(detail.includes("export const DETAIL_COPY"));
});

test("#437: no detail drawer still writes its own English", () => {
  const banned = [
    "kW of panels",
    "% less grid energy",
    "usable depth of discharge",
    '"System voltage"',
    '"Your peak demand"',
    '"Reference unit (only an example)"',
    '"DC Battery Disconnect"',
    "Essential Balance-of-System",
    "In plain language",
    "Your price per kWh ($)",
    "None (Solar-only configuration",
    "None (Battery-only configuration",
    "Winter steep tilt (critical for off-grid)",
    "Continuous String of English",
  ];
  for (const phrase of banned) {
    assert.ok(
      !ui.includes(phrase),
      `ui.js still emits the bare English literal: ${phrase}`,
    );
  }
  // run.js keeps the English sentence as the payload contract; what matters is
  // that it also hands the panel a key and the variables that key needs.
  assert.match(runJs, /key: "dCapAuto"/);
  assert.match(runJs, /capacityKey: capCopy\.key/);
  assert.match(runJs, /capacityVars: capCopy\.vars/);
  for (const fn of DRAWERS) {
    const at = ui.indexOf(`function ${fn}(`);
    assert.ok(at > -1, `${fn} must exist`);
  }
});

test("#437: the detail drawers paint through t() and repaint on language change", () => {
  const start = ui.indexOf("function repaintRuntimeCopy()");
  const body = ui.slice(start, ui.indexOf("\n}\n", start));
  assert.match(
    body,
    /if \(lastPayload\) renderResults\(lastPayload\)/,
    "a language change must re-render the payload, which re-runs the detail drawers",
  );
  const results = ui.indexOf("function renderResults(");
  assert.ok(results > -1);
  const resultsBody = ui.slice(results, results + 24000);
  for (const call of ["renderBomPanel()", "renderEli5Summary("]) {
    assert.ok(
      resultsBody.includes(call),
      `${call} must run inside renderResults so the repaint reaches it`,
    );
  }
  assert.match(ui, /function bomNoteText\(bom\)/);
  assert.match(ui, /t\(n\.key, n\.vars/);
});

test("#437: appliance names keep the identity key and gain a display key", () => {
  const names = [...appliances.matchAll(/n: "([^"]+)",\s*k: "(ap[A-Za-z]+)"/g)];
  assert.ok(
    names.length >= 29,
    `expected every appliance row to carry a display key, found ${names.length}`,
  );
  for (const [, name, key] of names) {
    assert.ok(
      typeof LOCALES.en[key] === "string",
      `${name} points at a missing display key ${key}`,
    );
    for (const lang of Object.keys(LOCALES)) {
      assert.equal(
        typeof LOCALES[lang][key],
        "string",
        `${lang}.${key} is missing`,
      );
    }
  }
  // Lookups stay on the English identity: the row dataset and presets read it.
  assert.match(ui, /"data-item-name": it\.n/);
  assert.match(ui, /it\.k \? t\(it\.k\) : it\.n/);
});

test("#437: every jargon term carries its explainer in all six overlay locales", async () => {
  const { JARGON, JARGON_TERMS, JARGON_LOCALES, jargonEntry } =
    await import("../assets/js/shared/jargon-dict.js");
  const langs = Object.keys(JARGON_LOCALES);
  assert.deepEqual(
    langs.sort(),
    ["ar", "de", "es", "fr", "nl", "pt"],
    "the overlay covers exactly the six non-English locales",
  );
  for (const term of JARGON_TERMS) {
    for (const lang of langs) {
      const entry = JARGON_LOCALES[lang][term];
      assert.ok(entry, `${lang}.${term} explainer is missing`);
      for (const field of ["short", "long"]) {
        assert.equal(
          typeof entry[field],
          "string",
          `${lang}.${term}.${field} must be a string`,
        );
        assert.ok(
          entry[field].trim().length > 2,
          `${lang}.${term}.${field} must not be blank`,
        );
        assert.ok(
          !/[{}]/.test(entry[field]),
          `${lang}.${term}.${field} must not carry a placeholder`,
        );
      }
    }
    // English stays the source dictionary, not an overlay row.
    const en = jargonEntry(term, "en");
    assert.equal(en.short, JARGON[term].short, `en.${term}.short is JARGON`);
    const es = jargonEntry(term, "es");
    assert.equal(
      es.short,
      JARGON_LOCALES.es[term].short,
      `es.${term} resolves`,
    );
  }
  // The painter must be told the page language at its remaining call site.
  assert.match(
    ui,
    /explainElement\([^)]*document\.documentElement\.lang/,
    "simple-results explainers pass the page language",
  );
});

test("#437: the sun-path tilt value card is painted from the dictionary", () => {
  for (const key of ["resTiltValueFlat", "resTiltValueFull"]) {
    for (const [lang, dict] of Object.entries(LOCALES)) {
      assert.equal(
        typeof dict[key],
        "string",
        `${lang}.${key} must exist on the results surface`,
      );
      assert.ok(
        dict[key].trim().length > 8,
        `${lang}.${key} must not be blank`,
      );
    }
    assert.match(LOCALES.en[key], /[a-z]/);
  }
  assert.match(LOCALES.en.resTiltValueFlat, /\{panels\}[\s\S]*\{tilt\}/);
  for (const [lang, dict] of Object.entries(LOCALES)) {
    assert.match(
      dict.resTiltValueFlat,
      /\{panels\}[\s\S]*\{tilt\}/,
      `${lang}.resTiltValueFlat keeps both placeholders`,
    );
  }
  assert.match(ui, /t\("resTiltValueFlat", \{/);
  assert.ok(
    !ui.includes("What a flat roof forfeits here"),
    "ui.js must not write the English literal any more",
  );
});

test("#437: the shared-result note is in the language-change repaint list", () => {
  const start = ui.indexOf("function repaintRuntimeCopy()");
  const body = ui.slice(start, ui.indexOf("\n}\n", start));
  assert.match(
    body,
    /sharedResultNote[\s\S]*t\("shareLoaded"\)/,
    "the note is painted before the language is known, so a change must repaint it",
  );
});

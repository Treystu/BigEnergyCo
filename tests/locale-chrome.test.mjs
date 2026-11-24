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

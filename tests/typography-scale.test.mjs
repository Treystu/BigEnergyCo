// #432 typography integrity. The presentation spec (section 6) names six type
// roles and says a surface does not invent a size between them; F9 (heading
// rank), F13 (inline action overrides) and F14 (emoji in control labels) are
// this issue's findings. These pins hold the cure: one owner for the scale, no
// inline override on an action, one tabular rule for every price, an h2 above
// the results cards' h3s, and wrapping room for the long-word locales.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { LOCALES } from "../assets/js/shared/locales.js";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const css = readFileSync(join(ROOT, "assets/site.css"), "utf8");
const html = readFileSync(join(ROOT, "index.html"), "utf8");
const ui = readFileSync(join(ROOT, "assets/js/sizing/ui.js"), "utf8");

const EMOJI = /[\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u;

test("the six type roles are tokens with the spec's values", () => {
  const roles = {
    "--type-display": "3.25rem",
    "--type-section": "2.25rem",
    "--type-block": "1.2rem",
    "--type-body": "1rem",
    "--type-caption": "0.85rem",
    "--type-control": "0.95rem",
  };
  for (const [token, value] of Object.entries(roles)) {
    assert.match(
      css,
      new RegExp(`${token}:\\s*${value.replace(".", "\\.")};`),
      `${token} must be declared with the spec value ${value}`,
    );
  }
});

test("each role has one owner, not a scattered raw value", () => {
  assert.match(css, /\.hero h1\s*\{[^}]*font-size:\s*var\(--type-display\)/);
  assert.match(
    css,
    /\.section-title\s*\{\s*font-size:\s*var\(--type-section\)/,
  );
  assert.match(css, /\.btn\s*\{[^}]*font-size:\s*var\(--type-control\)/);
  assert.match(css, /\.chart-title\s*\{[^}]*font-size:\s*var\(--type-control\)/);
});

test("no action carries an inline font-size or padding", () => {
  // F13: the hero CTA used to carry style="font-size: 1.1rem; padding: ...".
  // Every button and every rank-classed control must take its size from the
  // scale, so an inline size on one of them is a failing test.
  const controls = html.match(/<(?:button|a|div)\b[^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>/g) || [];
  assert.ok(controls.length > 20, "expected the page's ranked controls");
  for (const tag of controls) {
    assert.doesNotMatch(
      tag,
      /style="[^"]*font-size/,
      `an action carries an inline font-size: ${tag.slice(0, 120)}`,
    );
    assert.doesNotMatch(
      tag,
      /style="[^"]*padding/,
      `an action carries an inline padding: ${tag.slice(0, 120)}`,
    );
  }
});

test("every price surface shares the tabular-figures rule", () => {
  const rules = [
    ...css.matchAll(/([^{}]+)\{([^}]*font-variant-numeric:\s*tabular-nums[^}]*)\}/g),
  ];
  assert.ok(rules.length > 0, "a tabular-nums rule must exist");
  const covered = rules.map((m) => m[1]).join(",");
  for (const sel of [
    "#estimateBill",
    "#readoutBill",
    ".plan-price",
    ".paths-total",
    ".savings-num",
  ]) {
    assert.ok(
      covered.includes(sel),
      `a tabular rule must cover ${sel} so prices align as a column`,
    );
  }
});

test("the results surface has an h2 above its h3 cards", () => {
  // F9: the rendered result was all h3 with no h2. The plan card is the
  // surface's headline, so it is the element that takes the h2 rank.
  assert.match(
    ui,
    /el\("h2",\s*\{\s*class:\s*"simple-headline"\s*\}/,
    "the plan card headline must render as an h2",
  );
});

test("control labels carry words, not emoji (all seven locales)", () => {
  for (const locale of Object.keys(LOCALES)) {
    for (const key of ["runBtn", "runBtnReady", "locBtn"]) {
      const value = LOCALES[locale][key];
      assert.ok(value, `${locale}.${key} must exist`);
      assert.doesNotMatch(
        value,
        EMOJI,
        `${locale}.${key} must not carry an emoji inside the control label`,
      );
    }
  }
});

test("the long-word locales have wrapping room on controls", () => {
  // German and Dutch set the wrapping risk; a control that cannot break a long
  // word overflows a 390px card instead of wrapping inside it.
  const block = css.match(/\.btn,\s*\.case-ladder-row,\s*\.estimate-title\s*\{([^}]*)\}/);
  assert.ok(block, "the control wrapping rule must exist");
  assert.match(block[1], /overflow-wrap:\s*anywhere/);
  assert.match(block[1], /hyphens:\s*auto/);
  for (const locale of ["de", "nl"]) {
    assert.ok(LOCALES[locale].runBtn.length > 10, `${locale}.runBtn exists`);
  }
});

test("the display role is not re-declared at a fourth size on mobile", () => {
  // Mobile steps stay the spec's two documented values; a third size invented
  // between them is exactly what section 6 forbids.
  const media = css.match(/@media \(max-width: 768px\) \{([\s\S]*?)\n\}/);
  assert.ok(media);
  assert.match(media[1], /\.hero h1\s*\{\s*font-size:\s*clamp\(1\.85rem, 6vw, 2\.5rem\)/);
  assert.match(media[1], /\.section-title\s*\{\s*font-size:\s*1\.75rem/);
});

// #403 Cure C: one disclosure governs everything that is not the outcome, the
// cost table or the actions.
//
// The shape is a markup property, so it is pinned on the markup: every id that
// was demoted must carry the class the stylesheet hides, and the stylesheet must
// actually hide that class while <html> lacks the open attribute. A demoted
// block that lost the class would come back with nothing failing, which is the
// silent-regression shape this file exists to stop.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const HTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const CSS = readFileSync(new URL("../assets/site.css", import.meta.url), "utf8");

const DEMOTED = [
  "resultLadder",
  "ladderIntro",
  "eli5Summary",
  "eli5CardWrap",
  "moneyBar",
  "focusPanel",
  "tierResults",
  "frontierWrap",
  "socChartWrap",
  "cumCostChartWrap",
];

/** The opening tag of an element by id, as written in the markup. */
const tagFor = (id) => {
  const m = HTML.match(new RegExp(`<[a-z]+[^>]*id="${id}"[^>]*>`));
  assert.ok(m, `#${id} must exist in index.html`);
  return m[0];
};

test("one disclosure exists, closed by default, and is labelled", () => {
  const m = HTML.match(/<details[^>]*id="resultsMore"[^>]*>([\s\S]*?)<\/details>/);
  assert.ok(m, "#resultsMore must be a details element");
  // The `open` ATTRIBUTE, not the word "open" anywhere in the block.
  assert.doesNotMatch(m[0].slice(0, m[0].indexOf(">")), /\sopen[\s=>]/, "it must start closed");
  assert.match(m[1], /<summary[^>]*data-i18n="resultsMoreSummary"/);
  assert.match(m[1], /data-i18n="resultsMoreNote"/);
});

test("every demoted block carries the class the disclosure governs", () => {
  for (const id of DEMOTED)
    assert.match(
      tagFor(id),
      /class="[^"]*results-demoted/,
      `#${id} must carry results-demoted or it renders outside the disclosure`,
    );
});

test("the outcome, the cost table and the actions are NOT demoted", () => {
  for (const id of ["useCaseOutcomeWrap", "pathsPanel", "bestPickWrap"]) {
    const m = HTML.match(new RegExp(`<[a-z]+[^>]*id="${id}"[^>]*>`));
    assert.ok(m, `#${id} must exist`);
    assert.doesNotMatch(
      m[0],
      /results-demoted/,
      `#${id} is part of the simple result and must stay visible`,
    );
  }
});

test("the stylesheet hides demoted blocks while the disclosure is closed", () => {
  assert.match(
    CSS,
    /html:not\(\[data-results-more\]\)\s+\.results-demoted\s*\{[^}]*display:\s*none\s*!important/,
    "the closed state must win over the renderers' inline display rules",
  );
});

test("opening the disclosure is wired to reveal it and redraw the charts", () => {
  const UI = readFileSync(
    new URL("../assets/js/sizing/ui.js", import.meta.url),
    "utf8",
  );
  assert.match(UI, /toggleAttribute\("data-results-more"/);
  assert.match(UI, /addEventListener\("toggle",\s*sync\)/);
  // Both charts, because a chart drawn while its container was hidden is blank.
  assert.match(UI, /renderFrontierPanel\(lastPayload\)/);
  assert.match(UI, /drawCumCostChart\(/);
});

// Owner order 2026-11-24 (STAGING-RESTORED): the results surface is the full
// previous one again. The disclosure still exists, but it holds only the
// technical workings — the charts, the frontier and the readable card render
// without opening anything. These pins hold that reversal: no stylesheet rule
// may hide a results block, and no runtime fold may move one into a host.
//
// Before this order the same file pinned the opposite (the closed disclosure
// winning over every inline display rule); the reverse is pinned here because
// the stripped surface is what the owner replaced.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const HTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const CSS = readFileSync(
  new URL("../assets/site.css", import.meta.url),
  "utf8",
);

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
  const m = HTML.match(
    /<details[^>]*id="resultsMore"[^>]*>([\s\S]*?)<\/details>/,
  );
  assert.ok(m, "#resultsMore must be a details element");
  // The `open` ATTRIBUTE, not the word "open" anywhere in the block.
  assert.doesNotMatch(
    m[0].slice(0, m[0].indexOf(">")),
    /\sopen[\s=>]/,
    "it must start closed",
  );
  assert.match(m[1], /<summary[^>]*data-i18n="resultsMoreSummary"/);
});

test("no stylesheet rule hides a results block any more", () => {
  for (const id of DEMOTED) tagFor(id);
  assert.doesNotMatch(
    CSS,
    /html:not\(\[data-results-more\]\)\s+\.results-demoted/,
    "the closed disclosure must not hide the restored surface",
  );
  assert.doesNotMatch(
    CSS,
    /\.results-demoted\s*\{[^}]*display:\s*none/,
    "no rule may collapse a results block",
  );
});

test("the runtime fold is gone", () => {
  const UI = readFileSync(
    new URL("../assets/js/sizing/ui.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    HTML,
    /resultsDetailHost/,
    "no detail host in the markup",
  );
  assert.doesNotMatch(UI, /resultsDetailHost/, "no runtime fold into a host");
  assert.doesNotMatch(
    UI,
    /#resultsRegion \.result-actions-row/,
    "nothing walks the DOM to hide the actions row",
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

test("the frontier and the charts sit outside the disclosure", () => {
  const more = HTML.indexOf('id="resultsMore"');
  const frontier = HTML.indexOf('id="frontierWrap"');
  const cum = HTML.indexOf('id="cumCostChartWrap"');
  assert.ok(more > 0 && frontier > 0 && cum > 0);
  assert.ok(
    frontier > HTML.lastIndexOf("</details>", frontier),
    "the frontier renders after the disclosure closes, on the surface",
  );
  assert.ok(
    cum > HTML.lastIndexOf("</details>", cum),
    "the cost chart renders after the disclosure closes, on the surface",
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

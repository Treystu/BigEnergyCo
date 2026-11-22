// #430 (GQ F1, location-first) — the intake surface asks where before it asks
// how much. Presentation spec V1 section 3 puts the intake's R1 at "the ask
// being answered (location, then load)"; this holds the shipped artifact to
// that order so a later wave cannot slide a numeric input back in front of it.
//
// index.html is the artifact the browser receives (no HTML build step), so this
// is a census of the shipped surface, not of a template.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES } from "../assets/js/shared/locales.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ui = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);

const at = (needle) => {
  const i = html.indexOf(needle);
  assert.ok(i > 0, `the intake artifact must contain ${needle}`);
  return i;
};

test("#430: the location ask leads the intake, before the goal and the numbers", () => {
  const location = at('id="citySearch"');
  const goal = at('class="form-group goal-segmented-wrap"');
  const bill = at('id="billSliderWrap"');
  const form = at('id="fullControls"');
  const run = at('id="btnRunSizing"');

  assert.ok(
    location < goal,
    "the location control must come before the goal selector",
  );
  assert.ok(location < bill, "the location control must come before the bill");
  assert.ok(
    location < form,
    "the location control must come before the full input form",
  );
  assert.ok(location < run, "the location control must come before the run");
});

test("#430: the load inputs still follow location, and the primary stays last", () => {
  const bill = at('id="billSliderWrap"');
  const form = at('id="fullControls"');
  const run = at('id="btnRunSizing"');
  assert.ok(bill < form, "the bill slider leads the detailed load inputs");
  assert.ok(form < run, "the run is the last thing in the ask (spec R3)");
});

test("#430: the ask states what the location is for, and what it is not", () => {
  // The consent-shaped line from the issue scope: used for local prices and
  // weather; not an account, nothing kept, nothing sold.
  assert.match(html, /data-i18n="locPurposeLine"/);
  for (const [lang, dict] of Object.entries(LOCALES)) {
    const line = dict.locPurposeLine;
    assert.equal(typeof line, "string", `${lang}.locPurposeLine must exist`);
    assert.ok(line.trim().length > 20, `${lang}.locPurposeLine must say something`);
  }
  assert.match(LOCALES.en.locPurposeLine, /prices/i);
  assert.match(LOCALES.en.locPurposeLine, /nothing sold/i);
});

test("#430: location-first does not depend on any removed display mode", () => {
  assert.ok(!html.includes("data-display-mode="));
  assert.doesNotMatch(ui, /isSimpleMode|dataset\.displayMode/);
  // The location resolve is what gates the numbers, not a mode flag.
  assert.match(ui, /locationResolved = true/);
});

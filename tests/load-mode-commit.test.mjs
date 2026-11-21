// #444: the "I know my kWh/day (advanced)" option did not take effect on a
// mouse pick — the selection stayed on the previous mode, so the only entry for
// a non-whole kWh/day figure never appeared.
//
// The cure is behavioural, not cosmetic: the load-mode interaction commits on
// BOTH events a browser can report a pick with (`input` then `change`), through
// one idempotent function, and the painting it does cannot throw on a missing
// panel. These tests pin that shape, because the failure it removes is silent:
// a pick that reports as `input` only used to leave every panel untouched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ui = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const functionBody = (name) => {
  const start = ui.indexOf(`function ${name}()`);
  assert.ok(start >= 0, `${name} must exist`);
  return ui.slice(start, ui.indexOf("\n}", start) + 2);
};

test("#444: the load-mode pick commits on input as well as change", () => {
  assert.match(
    ui,
    /loadModePick\.addEventListener\("input",\s*commitLoadMode\)/,
    "an input-only report must still switch the panel",
  );
  assert.match(
    ui,
    /loadModePick\.addEventListener\("change",\s*commitLoadMode\)/,
    "change must reach the same commit",
  );
  // One entry point, not two copies of the paint-then-dirty sequence.
  assert.equal(
    (ui.match(/addEventListener\("change",\s*commitLoadMode\)/g) || []).length,
    1,
  );
});

test("#444: the commit is idempotent, so input+change cannot dirty twice", () => {
  const body = functionBody("commitLoadMode");
  assert.match(
    body,
    /const changed = \$\("loadMode"\)\?\.value !== paintedLoadMode;/,
    "the commit must compare against what is on screen",
  );
  assert.match(
    body,
    /if \(changed\) markPrecalcDirty\(\);/,
    "only a real mode change may mark precalc dirty",
  );
  assert.match(body, /setLoadPanel\(\);/);
});

test("#444: painting a panel is null-safe, so a pick cannot throw", () => {
  const body = functionBody("setLoadPanel");
  // Look the node up once, then only touch it behind a truthiness check: the
  // exact shape that cannot throw inside the interaction.
  for (const id of ["panelAppliances", "panelBill", "panelKwh"]) {
    assert.match(
      body,
      new RegExp(`const \\w+ = \\$\\("${id}"\\);\\s*if \\(\\w+\\)`),
      `${id} must be looked up and guarded, not dereferenced inline`,
    );
  }
  assert.doesNotMatch(
    body,
    /\$\("panel(?:Appliances|Bill|Kwh)"\)\.style/,
    "a missing panel must never be dereferenced inline",
  );
});

test("#444: the page still ships all three load panels the painter drives", () => {
  for (const id of ["panelAppliances", "panelBill", "panelKwh"]) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} must exist`);
  }
  assert.match(html, /id="loadMode"/);
  assert.match(
    html,
    /<option value="kwh"[^>]*>[\s\S]{0,120}?kWh\/day \(advanced\)/,
  );
});

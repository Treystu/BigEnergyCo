// Regressions observed while playtesting the built app in headless Chrome:
// the visible numeric bounds and the sizing guards must agree, and rejected
// values must explain why the worker was not started.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { LOCALES } from "../assets/js/shared/locales.js";
import {
  MAX_DAILY_KWH,
  MIN_DAILY_KWH,
} from "../assets/js/sizing/share-codec.js";

const ui = fs.readFileSync("assets/js/sizing/ui.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const locationSmoke = fs.readFileSync("scripts/smoke/location.js", "utf8");

test("direct kWh sizing enforces the range the form advertises", () => {
  // One owner: the numbers below are the codec's, so this test pins the FORM to
  // the product's bound instead of pinning a literal that can drift from it.
  const min = String(MIN_DAILY_KWH);
  assert.match(
    html,
    new RegExp(
      `id="dailyKwhInput"[\\s\\S]*?min="${min}"[\\s\\S]*?max="${MAX_DAILY_KWH}"`,
    ),
  );
  assert.match(ui, /directKwh && inp\.dailyKwh < MIN_DAILY_KWH/);
  assert.match(ui, /inp\.dailyKwh > MAX_DAILY_KWH/);
  assert.match(
    ui,
    /directKwh \|\| inp\.dailyKwh > MAX_DAILY_KWH[\s\S]*t\("invalidDailyKwh"\)/,
  );
  assert.match(locationSmoke, /empty kWh entry stays on the form/);
  assert.match(
    locationSmoke,
    /out-of-range coordinates explain the valid bounds/,
  );
  // The smoke gate takes its edges from the codec too, so neither the reason
  // copy nor the rejected value can be older than the form.
  assert.match(
    locationSmoke,
    /from "\.\.\/\.\.\/assets\/js\/sizing\/share-codec\.js"/,
  );
  assert.match(locationSmoke, /MIN_DAILY_KWH \/ 2/);
  assert.match(locationSmoke, /MAX_DAILY_KWH \+ 1/);
});

test("share restoration keeps its source hash until all inputs are restored", () => {
  const setCoordsStart = ui.indexOf("function setCoords(");
  const setCoordsEnd = ui.indexOf(
    "// Fill the bill-mode tariff",
    setCoordsStart,
  );
  const setCoords = ui.slice(setCoordsStart, setCoordsEnd);
  assert.match(
    ui,
    /function setCoords\(lat, lon, label, region, country, skipShareUpdate = false\)/,
  );
  assert.match(
    setCoords,
    /if \(!skipShareUpdate\) updateShareHash\(lastPayload, readInputs\(\)\)/,
  );
  const restoreStart = ui.indexOf("function restoreFromShare() {");
  const restoreEnd = ui.indexOf("// -- Printable summary", restoreStart);
  const restore = ui.slice(restoreStart, restoreEnd);
  // The restore path must pass skipShareUpdate (third-from-last argument) so
  // the incoming #s= link survives until every input is written.
  assert.match(
    restore,
    /setCoords\([\s\S]{0,90}undefined,\s*undefined,\s*true\)/,
  );
  // Parsing + the bounds gate moved to the codec (assets/js/sizing/
  // share-codec.js, pinned by tests/share-codec.test.mjs). What the DOM path
  // still owes us: delegate to that one owner, and refuse a rejected link
  // before any form state moves. A second copy of the bounds here would be a
  // fork of the policy, so its absence is the assertion.
  assert.match(
    restore,
    /if \(!location\.hash\.startsWith\(SHARE_PREFIX\)\) return false;/,
  );
  assert.match(restore, /const o = parseShareHash\(location\.hash\);/);
  assert.match(
    restore,
    /if \(!o\) \{\s*setStatus\(t\("invalidShare"\)\);\s*return false;/,
  );
  assert.doesNotMatch(restore, /Math\.abs\(lat\) > 90/);
  const codec = fs.readFileSync("assets/js/sizing/share-codec.js", "utf8");
  assert.match(codec, /Math\.abs\(la\) > 90/);
  assert.match(codec, /Math\.abs\(lo\) > 180/);
  assert.match(codec, /kw < MIN_DAILY_KWH/);
  assert.match(codec, /kw > MAX_DAILY_KWH/);
});

test("background location refinements are tied to the current user choice", () => {
  const location = fs.readFileSync(
    "assets/js/sizing/location-picker.js",
    "utf8",
  );
  assert.match(
    location,
    /export function locateMe\(\{[\s\S]*isCurrent = \(\) => true/,
  );
  assert.match(location, /if \(!isCurrent\(\)\) return;/);
  assert.match(location, /let lookupGeneration = 0/);
  assert.doesNotMatch(location, /lookupBusy/);
  assert.match(ui, /let locationChoiceGeneration = 0/);
  assert.match(ui, /isCurrent: \(\) => locationChoiceGeneration === choice/);
  assert.match(ui, /onQueryChange:[\s\S]*locationChoiceGeneration \+= 1/);
  assert.match(
    ui,
    /const onCoordChange = \(\) => \{[\s\S]*locationChoiceGeneration \+= 1/,
  );
});

test("validation feedback exists in every supported language", () => {
  for (const [locale, strings] of Object.entries(LOCALES)) {
    assert.match(strings.invalidCoordinates, /90/);
    assert.match(strings.invalidCoordinates, /180/);
    assert.match(strings.invalidDailyKwh, /500/);
    assert.ok(
      strings.invalidShare.trim().length > 0,
      `${locale}.invalidShare is empty`,
    );
  }
});

test("an off-grid share link sizes the load it names, not the old slider", () => {
  const restoreStart = ui.indexOf("function restoreFromShare() {");
  const restoreEnd = ui.indexOf(
    "function populatePrintSheet(p, inp)",
    restoreStart,
  );
  const restore = ui.slice(restoreStart, restoreEnd);
  const readStart = ui.indexOf("function readInputs() {");
  const readEnd = ui.indexOf("function readPercentInput", readStart);
  const readInputs = ui.slice(readStart, readEnd);
  // Off-grid load has ONE resolution rule (#443): the control that is on
  // screen wins, and the entry is the only control that can hold a fractional
  // load — a slider with step="1" snaps 1.2 to 1, which sized and priced a
  // typed 1.2 kWh/day as 1.0. The share path still writes both (below) so a
  // restored link cannot leave a stale thumb.
  assert.match(
    readInputs,
    /dailyKwh = offgridDailyKwh\(\s*\$\("dailyKwhInput"\)/,
  );
  const iEntry = readInputs.indexOf('$("dailyKwhInput")');
  const iMode = readInputs.indexOf('mode === "kwh",');
  assert.ok(
    iEntry > 0 && iMode > iEntry,
    'readInputs must resolve the off-grid load through offgridDailyKwh(entry, slider, mode === "kwh")',
  );
  assert.ok(readInputs.includes("offgridDailyKwh("));
  assert.match(restore, /const sharedSlider = \$\("offgridKwhSlider"\)/);
  assert.match(restore, /sharedSlider\.value = String\(kw\)/);
  assert.match(restore, /else \{\s*sharedSlider\.value = "";\s*\}/);
});

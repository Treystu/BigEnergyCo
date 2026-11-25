// #443 regression: off-grid load had TWO sources (the advanced kWh/day entry
// and the whole-number slider) and the sizing/money path read the slider. A
// visitor who typed 1.2 kWh/day got a run, a grid-cost line and an autonomy
// figure for 1.0, with "at 1 kWh/day" printed in the calculation note.
//
// ui.js cannot be imported under plain Node (it is browser-coupled), so the
// rule is exercised the way this repo already exercises ui.js logic: the
// self-contained function is sliced out by name and run for real. The teeth are
// the resolved number, not the ordering of two property reads — an ordering
// assertion passes on code that resolves the wrong value.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const start = src.indexOf("export function offgridDailyKwh(");
const end = src.indexOf("function readInputs()", start);
assert.ok(
  start >= 0 && end > start,
  "offgridDailyKwh must sit in ui.js before readInputs",
);
const code = src
  .slice(start, end)
  .replace("export function offgridDailyKwh(", "function offgridDailyKwh(");
const offgridDailyKwh = new Function(`${code}; return offgridDailyKwh;`)();

test("with the entry on screen, it wins over the slider for a fractional load", () => {
  // The defect exactly: entry 1.2, slider snapped to 1. The load the visitor
  // typed is the load that is sized and priced.
  assert.equal(offgridDailyKwh("1.2", "1", true), 1.2);
  assert.equal(offgridDailyKwh("2.4", "2", true), 2.4);
  // An entry above the slider's own maximum is still the visitor's figure; the
  // slider simply cannot represent it.
  assert.equal(offgridDailyKwh("70", "20", true), 70);
  // A below-slider-minimum entry is honoured for the same reason.
  assert.equal(offgridDailyKwh("0.8", "1", true), 0.8);
});

test("with the slider on screen, a stale hidden entry never wins", () => {
  // The share-link lesson (R-4), in the other direction: in bill/appliance
  // modes the entry is filler the visitor cannot see, so the slider owns the
  // load even when the entry still holds an old number.
  assert.equal(offgridDailyKwh("999", "14", false), 14);
  // Each side still falls back to the other rather than sizing nothing.
  assert.equal(offgridDailyKwh("11", "", false), 11);
  assert.equal(offgridDailyKwh("", "14", true), 14);
});

test("the slider is the fallback when the entry holds nothing usable", () => {
  assert.equal(offgridDailyKwh("", "8"), 8);
  assert.equal(offgridDailyKwh("   ", "8"), 8);
  assert.equal(offgridDailyKwh("abc", "8"), 8);
  assert.equal(offgridDailyKwh("0", "8"), 8);
  assert.equal(offgridDailyKwh("-3", "8"), 8);
  assert.ok(Number.isNaN(offgridDailyKwh("", "")));
  assert.ok(Number.isNaN(offgridDailyKwh(undefined, undefined)));
});

test("readInputs takes the off-grid load from this rule and nowhere else", () => {
  const readInputs = src.slice(end, src.indexOf("function readPercentInput"));
  assert.match(
    readInputs,
    /dailyKwh = offgridDailyKwh\(\s*\$\("dailyKwhInput"\)\?\.value,\s*\$\("offgridKwhSlider"\)\?\.value,\s*mode === "kwh",?\s*\)/,
    "the off-grid branch must delegate to the one owner of this rule, naming which control is on screen",
  );
  assert.equal(
    (readInputs.match(/offgridDailyKwh\(/g) || []).length,
    1,
    "readInputs must resolve the off-grid load exactly once, through the owner",
  );
  // The retired dual-source locals must be gone from the off-grid branch, not
  // left beside the rule. (The grid-tied "kwh" branch keeps its own
  // kwhInputVal — it reads the entry directly and has no slider peer.)
  const branch = readInputs.slice(
    readInputs.indexOf("} else if (isOffgrid)"),
    readInputs.indexOf('} else if (mode === "bill")'),
  );
  assert.ok(branch.includes("offgridDailyKwh("), "the branch must call it");
  assert.ok(!/offSliderVal/.test(branch));
});

test("the bill slider is derived from the typed load, never written back over it", () => {
  const s = src.indexOf("function syncBillSlider()");
  const end = src.indexOf("function displayRate()", s);
  assert.ok(s > 0 && end > s, "syncBillSlider must sit before displayRate");
  const body = src.slice(s, end);
  // The anchor has to know which control owns the load in this mode...
  assert.ok(
    body.includes('$("loadMode")?.value === "kwh"'),
    "the bill anchor must recognise the kWh/day entry mode",
  );
  assert.match(
    body,
    /typedEntryOwnsLoad[\s\S]{0,160}billAnchorKwh = parseFloat\(\$\("dailyKwhInput"\)\.value\)/,
    "the anchor is derived from the typed entry, not the other way round",
  );
  // ...and the bill branch must not take the anchor back while it does.
  assert.match(
    body,
    /!typedEntryOwnsLoad &&\s*billTouched/,
    "a touched bill slider must not override the entry that owns the load",
  );
  // The mirror write exists once, guarded: an unguarded write is the defect
  // (a typed 1.2 came back as 2 on the next resolve, and the queued run sized 2).
  assert.equal(
    (body.match(/kwhInput\.value = /g) || []).length,
    1,
    "the entry may be mirrored in one place only",
  );
  assert.match(
    body,
    /if \(kwhInput && !typedEntryOwnsLoad\) kwhInput\.value = String\(clampedKwh\)/,
    "the mirror must skip the field that owns the load",
  );
});

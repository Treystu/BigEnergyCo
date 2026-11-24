// #441 (GQ F12) — the intake mode fork is gone: no Automatic/Manual radio pair,
// no "Simple mode" checkbox, no successor gate under another name, and no root
// display-mode attribute that hides panels by mode.
//
// index.html is the shipped artifact (this site has no HTML build step), so these
// assertions ARE the built-artifact census the issue asks for: they grep the file
// the browser receives. The rendered drive is the PR's receipt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ui = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../assets/site.css", import.meta.url),
  "utf8",
);

test("#441: no mode control remains in the shipped intake", () => {
  for (const marker of [
    'id="modeToggleRow"',
    'name="modeToggle"',
    'id="modeQuick"',
    'id="modeManual"',
    'id="simpleModeToggle"',
    "simple-mode-control",
  ]) {
    assert.ok(
      !html.includes(marker),
      `the intake must not carry a mode control: found ${marker}`,
    );
  }
});

test("#441: no successor gate — the form is the form", () => {
  // The wiring that translated a mode into visibility is gone, not renamed.
  for (const marker of [
    "setQuickMode",
    "quickMode",
    "applySimpleMode",
    "setupSimpleMode",
    "simpleModeToggle",
    "modeToggle",
  ]) {
    assert.ok(
      !ui.includes(marker),
      `ui.js must not keep a mode concept: found ${marker}`,
    );
  }
  // The single form owner exists and keeps the goal-dependent visibility.
  assert.match(ui, /function showAllControls\(\)/);
  assert.match(ui, /billWrap\.style\.display = !isOffgrid \? "block" : "none"/);
  assert.match(
    ui,
    /offgridWrap\.style\.display = isOffgrid \? "block" : "none"/,
  );
  // The readable-results pass is unconditional.
  assert.match(ui, /function applyReadableResults\(\)/);
  assert.doesNotMatch(
    ui,
    /isSimpleMode|data\.displayMode|dataset\.displayMode/,
  );
});

test("#441: nothing hides a panel by display mode any more", () => {
  assert.ok(
    !css.includes("data-display-mode"),
    "site.css must not hide or reveal panels from a root mode attribute",
  );
  // The form and the coordinates disclosure are never mode-hidden.
  assert.ok(
    !/\[data-display-mode[^\]]*\]\s*#fullControls/.test(css),
    "the full form must always be present",
  );
});

test("#441: every demoted panel still exists, so 'all the options' stays reachable", () => {
  // These were hidden by the old mode rules. They must still be in the artifact:
  // the detail now lives behind the result disclosures, not behind a mode.
  for (const id of [
    'id="fullControls"',
    'id="resultLadder"',
    'id="moneyBar"',
    'id="focusPanel"',
    'id="bomPanel"',
    'id="resultsRegion"',
    'id="simpleResultsWrap"',
    'class="result-actions-row"',
  ]) {
    assert.ok(html.includes(id), `${id} must remain in the artifact`);
  }
  // The disclosures that make them reachable in one gesture.
  assert.match(html, /More detail: the workings and the options/);
});

test("#441: the first run is still the explicit button, never an auto-run", () => {
  assert.match(html, /id="btnRunSizing"/);
  assert.match(ui, /runAuthorized = true;\s*run\(false, true\);/);
});

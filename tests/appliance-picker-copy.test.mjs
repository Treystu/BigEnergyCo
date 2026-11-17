// #448: the appliance picker rendered raw translation keys - "apWatts",
// "apWattsRunning" and "fmtHoursDay" - in every row, on production, while the
// kWh/day figures beside them were correct.
//
// The cause is a lifecycle race, not a missing translation: translate() echoes
// the KEY when the dictionary has not resolved yet (deliberately - chat.js reads
// `value === key` as "no translation"), the rows are built during setup, and
// applyI18n() lands afterwards. Every other surface painted during setup is
// repainted by repaintRuntimeCopy; the appliance rows were not.
//
// So the pin has to be on the lifecycle: the rows must register a repaint, and
// the repaint pass must drain that registry. A test on the strings alone would
// pass on the broken code, because the strings were always right.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const src = fs.readFileSync("assets/js/sizing/ui.js", "utf8");

/** Body of a top-level function, from its declaration to the next `function `. */
function bodyOf(name) {
  const at = src.indexOf(`function ${name}(`);
  assert.notEqual(at, -1, `${name} must exist in ui.js`);
  const next = src.indexOf("\nfunction ", at + 1);
  return src.slice(at, next === -1 ? undefined : next);
}

test("the repaint pass drains the appliance row registry", () => {
  const repaint = bodyOf("repaintRuntimeCopy");
  assert.match(
    repaint,
    /for \(const repaint of applianceRepainters\) repaint\(\);/,
    "repaintRuntimeCopy must repaint the appliance rows once the dictionary lands - without it every row keeps the echoed keys for the life of the page",
  );
});

test("every row registers a repaint that rewrites its own copy", () => {
  const render = bodyOf("renderAppliances");
  assert.match(
    render,
    /applianceRepainters\.length = 0;/,
    "a rebuild must not stack repainters from a previous render",
  );
  assert.match(
    render,
    /applianceRepainters\.push\(/,
    "the rows must register their repaint",
  );
  // The three keys the issue names, each rewritten from the row's own item.
  assert.match(render, /t\("apWattsRunning", \{ w: it\.w \}\)/);
  assert.match(render, /t\("apWatts", \{ w: it\.w \}\)/);
  assert.match(render, /fmtH\(it\.h\)/);
});

test("the repaint does not masquerade as a user change", () => {
  // refresh() calls markPrecalcDirty() when a result exists, which would tell a
  // visitor with a fresh result that it is stale because they switched language.
  // The repaint therefore touches text only.
  const render = bodyOf("renderAppliances");
  const at = render.indexOf("applianceRepainters.push(");
  const push = render.slice(at, render.indexOf("const sub = el(", at));
  assert.ok(push.length > 0, "the repaint block must be readable");
  assert.doesNotMatch(
    push,
    /\brefresh\(\)/,
    "the repaint must not run refresh(): a language switch changes no number",
  );
  assert.match(
    push,
    /if \(cb\.checked\)/,
    "the kWh/day line is repainted only for a row that is actually on",
  );
});

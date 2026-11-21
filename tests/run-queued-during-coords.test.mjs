// #442 regression: the first click on Size My System could be a no-op.
//
// Measured on the shipped tree (browser drive, 2026-11-21): with a coordinate
// resolve in flight (the 500 ms debounce that runs while the visitor types a
// custom coordinate), run() took its location guard branch, dropped the click,
// and the resolve then wrote the generic "inputs changed" notice over the
// "checking those coordinates" line. The click left no trace, the button stayed
// idle, and the same click worked once the resolve had landed - a dead first
// click, which is exactly what the issue reports.
//
// The cure is a remembered ask: an EXPLICIT click during a pending resolve is
// queued and consumed by the resolve that makes it answerable. These tests pin
// the decision rule and every place that arms, consumes or retires it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);

const start = src.indexOf("export function queueRunDuringResolve(");
const end = src.indexOf("function run(quiet = false, explicit = false)", start);
assert.ok(
  start >= 0 && end > start,
  "queueRunDuringResolve must sit in ui.js beside run()",
);
const code = src
  .slice(start, end)
  .replace(
    "export function queueRunDuringResolve(",
    "function queueRunDuringResolve(",
  );
const queueRunDuringResolve = new Function(
  `${code}; return queueRunDuringResolve;`,
)();

test("only an explicit click during a pending resolve is queued", () => {
  assert.equal(queueRunDuringResolve(true, true), true);
  // A quiet refresh has nothing to lose by waiting for the next edit, and an
  // armed run behind the visitor's back would be worse than the queued click.
  assert.equal(queueRunDuringResolve(false, true), false);
  // Nothing pending: run() proceeds normally, so nothing may be queued.
  assert.equal(queueRunDuringResolve(true, false), false);
  assert.equal(queueRunDuringResolve(false, false), false);
  // Falsy non-boolean arguments (an Event, undefined) never arm a run.
  assert.equal(queueRunDuringResolve({}, {}), false);
  assert.equal(queueRunDuringResolve(undefined, undefined), false);
});

test("run() queues the explicit click it cannot answer yet", () => {
  const runBody = src.slice(
    end,
    src.indexOf("function flushPendingRun()", end),
  );
  assert.match(
    runBody,
    /if \(queueRunDuringResolve\(explicit, coordinatesPending\)\)\s+queuedRunAfterResolve = true;/,
    "the location guard must remember the ask through the one rule",
  );
  // The guard must arm only on the coordinates-pending path, never for a
  // missing city pick (no resolve is coming there).
  const guardStart = runBody.search(/!locationResolved \|\|/);
  const guardEnd = runBody.indexOf("const directKwh");
  assert.ok(guardStart >= 0 && guardEnd > guardStart, "the guard is present");
  const guard = runBody.slice(guardStart, guardEnd);
  assert.ok(
    guard.includes("queuedRunAfterResolve = true"),
    "the arm lives inside the location guard",
  );
});

test("every resolve path consumes the queued ask exactly once", () => {
  // The typed-coordinate debounce: the resolve that makes the click answerable.
  const debounce = src.slice(
    src.indexOf("coordDebounceTimer = setTimeout(() => {"),
    src.indexOf("}, 500);"),
  );
  assert.match(
    debounce,
    /if \(queuedRunAfterResolve\) \{\s+queuedRunAfterResolve = false;\s+run\(false, true\);/,
    "the coordinate debounce must start the queued run, not just clear it",
  );

  // A place picked before the resolve landed is a resolve too.
  const setCoords = src.slice(
    src.indexOf("function setCoords("),
    src.indexOf("// Fill the bill-mode tariff from coordinates"),
  );
  assert.match(
    setCoords,
    /if \(queuedRunAfterResolve\) \{\s+queuedRunAfterResolve = false;\s+run\(false, true\);/,
    "a resolved city must honour the queued ask as well",
  );

  // A run that is actually starting has answered the ask; leaving the flag set
  // would fire a second, unrequested run on the next resolve.
  const runBody = src.slice(
    end,
    src.indexOf("function flushPendingRun()", end),
  );
  assert.match(
    runBody,
    /precalcDirty = false;[\s\S]{0,300}?queuedRunAfterResolve = false;/,
    "starting a run retires the queued ask",
  );
});

test("an unresolvable coordinate never leaves a run armed forever", () => {
  const onCoordChange = src.slice(
    src.indexOf("const onCoordChange = "),
    src.indexOf("if (latEl) latEl.addEventListener"),
  );
  const elseBranch = onCoordChange.slice(onCoordChange.indexOf("} else {"));
  assert.match(
    elseBranch,
    /coordinatesPending = false;[\s\S]*queuedRunAfterResolve = false;/,
    "the invalid-coordinate branch must retire the ask: no resolve is coming",
  );
});

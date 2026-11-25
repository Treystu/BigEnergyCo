import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const spec = readFileSync(
  new URL("../docs/PRESENTATION_SPEC_V1.md", import.meta.url),
  "utf8",
);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const usecases = readFileSync(
  new URL("../assets/js/sizing/usecases.js", import.meta.url),
  "utf8",
);

const SIX = ["billcut", "tou", "backup", "reserve", "offgrid", "portable"];

// The six cases the ladder renders are the registry's own, in the registry's
// order: the spec's 12.1 forbids a Wave 1 pass from inventing a seventh case or
// re-ordering the rest at rest.
const registryOrder = [
  ...usecases.matchAll(/^ {2}(\w+): \{\r?\n {4}id: "(\w+)",/gm),
]
  .map((m) => m[2])
  .filter((id) => SIX.includes(id));

const selectBlock = html.slice(
  html.indexOf('id="useCase"'),
  html.indexOf("</select>", html.indexOf('id="useCase"')),
);
const optionOrder = [...selectBlock.matchAll(/value="([a-z]+)"/g)].map(
  (m) => m[1],
);

test("#436 V1.1: the ladder renders the registry, in the registry's order", () => {
  assert.deepEqual(registryOrder, SIX, "usecases.js carries the six cases");
  assert.deepEqual(
    optionOrder,
    SIX,
    "#useCase carries the six cases, in order",
  );
  assert.ok(
    spec.includes("`billcut, tou, backup, reserve, offgrid, portable`"),
    "the spec names that order as the ladder's at-rest order",
  );
});

test("#436 V1.1: the copy and number-formatting home is stated", () => {
  assert.match(spec, /## 14\. Copy and number formatting/);
  assert.match(spec, /Home: this section\./, "14's rules have a named home");
  // The residue it cures must be named, with its numeric home cited rather than
  // restated as a defect of the copy layer.
  assert.match(
    spec,
    /paintQuickBillNote\(\)/,
    "the measured instance is named",
  );
  assert.match(spec, /BILL_MIN_KWH = 2/, "the floor's value is cited");
  assert.match(spec, /#479/, "the numeric half is delegated to its own issue");
  assert.match(
    spec,
    /14\.6 \*\*Load precision is one decimal/,
    "the precision rule is stated",
  );
});

test("#436 V1.1: the four Wave 1 decisions are stated as rules", () => {
  for (const rule of [
    /10\.1 \*\*No gate control\.\*\*/,
    /10\.2 \*\*The intake has one reading order/,
    /11\.1 The location control is the first control/,
    /11\.4 Once a place resolves, the estimate summary must be present at rest/,
    /12\.2 \*\*The ladder is a control group at R1\*\*/,
    /12\.5 \*\*An explicit pick wins instantly\.\*\*/,
    /13\.2 \*\*Inapplicable means absent, not empty\.\*\*/,
    /13\.5 \*\*Never filtered out\*\*/,
  ]) {
    assert.match(spec, rule, `the spec must state: ${rule}`);
  }
  // Decisive means failable: every rule carries a number a reviewer can cite.
  const numbered = spec.match(/^1[0-5]\.\d+ /gm) || [];
  assert.ok(
    numbered.length >= 30,
    `rules are numbered (found ${numbered.length})`,
  );
});

test("#436 V1.1: #440 and #431 own inference and applicability, not this spec", () => {
  assert.match(spec, /## 12\. Priors and the ladder \(#440\)/);
  assert.match(spec, /## 13\. Applicability \(#431\)/);
  assert.match(spec, /The matrix is data; no surface branches on the case/);
});

test("#436 V1.1: undecided things are named, not invented", () => {
  assert.match(spec, /## 15\. Open questions \(recorded, not invented\)/);
  for (const q of ["Q1", "Q2", "Q3"]) {
    assert.match(spec, new RegExp(`\\|\\s*${q}\\s*\\|`), `${q} is recorded`);
  }
  assert.match(spec, /An open question is not a licence/);
});

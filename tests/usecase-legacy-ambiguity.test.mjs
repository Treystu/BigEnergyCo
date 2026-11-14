// #352 cure: a legacy (mode, hardwareConfig) pair is information-lossy for
// backup and reserve — they share their pairs with bill-cut and offgrid — so
// restoring through one silently re-interpreted those visitors. The boundary
// now reports the inference, and these tests hold the pair-to-candidates map in
// place so a future case cannot be added to an ambiguous pair unnoticed.
import assert from "node:assert/strict";
import test from "node:test";

import {
  USE_CASE_IDS,
  legacyCandidates,
} from "../assets/js/sizing/usecases.js";

test("the ambiguous legacy pairs are named, and only those", () => {
  assert.deepEqual(
    legacyCandidates({ mode: "gridtie", hardwareConfig: "both" }).sort(),
    ["billcut", "reserve"].sort(),
  );
  assert.deepEqual(
    legacyCandidates({ mode: "offgrid", hardwareConfig: "both" }).sort(),
    ["backup", "offgrid"].sort(),
  );
  assert.deepEqual(
    legacyCandidates({ mode: "gridtie", hardwareConfig: "battery" }),
    ["tou"],
  );
  assert.deepEqual(
    legacyCandidates({ mode: "portable", hardwareConfig: null }),
    ["portable"],
  );
});

test("a missing hardwareConfig is read as the pair's null, not as a mismatch", () => {
  assert.deepEqual(legacyCandidates({ mode: "portable" }), ["portable"]);
});

test("every candidate really carries that pair", () => {
  for (const pair of [
    { mode: "gridtie", hardwareConfig: "both" },
    { mode: "offgrid", hardwareConfig: "both" },
    { mode: "gridtie", hardwareConfig: "battery" },
    { mode: "portable", hardwareConfig: null },
  ]) {
    for (const id of legacyCandidates(pair)) {
      assert.ok(USE_CASE_IDS.includes(id));
      assert.deepEqual(legacyCandidates(pair).includes(id), true);
    }
  }
});

test("the four pairs cover every use case, so none is unreachable", () => {
  const seen = new Set();
  for (const pair of [
    { mode: "gridtie", hardwareConfig: "both" },
    { mode: "offgrid", hardwareConfig: "both" },
    { mode: "gridtie", hardwareConfig: "battery" },
    { mode: "portable", hardwareConfig: null },
  ]) {
    for (const id of legacyCandidates(pair)) seen.add(id);
  }
  assert.deepEqual([...seen].sort(), [...USE_CASE_IDS].sort());
});

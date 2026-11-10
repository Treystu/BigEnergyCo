// Champion Audit #352 - use-case identity across restoration paths.
//
// The audit's claim is that identity is LOST for three of six cases on the
// legacy pair and on v1 share links. These pins hold that claim in place, so
// the audit's verdict cannot quietly stop being true - and, more importantly,
// so a fix that recovers one of them makes this file fail and force a re-read
// of the issue rather than leaving a stale "3 of 6" in the receipt.
//
// Run: node --test tests/champion-audit-useCaseRouting.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { USE_CASE_IDS, deriveLegacy } from "../assets/js/sizing/usecases.js";
import {
  clampBounds,
  clampCensus,
  identityMatrix,
  summarize,
  v1InferCase,
} from "../scripts/champion-audit-useCaseRouting.mjs";

test("#352: the v1 inference reproduces ui.js's shipped expression", () => {
  // ui.js:8006 -> g === 0 ? "offgrid" : hw === "battery" ? "tou" : "billcut"
  assert.equal(
    v1InferCase({ mode: "offgrid", hardwareConfig: "both" }),
    "offgrid",
  );
  assert.equal(
    v1InferCase({ mode: "gridtie", hardwareConfig: "battery" }),
    "tou",
  );
  assert.equal(
    v1InferCase({ mode: "gridtie", hardwareConfig: "both" }),
    "billcut",
  );
  assert.equal(
    v1InferCase({ mode: "portable", hardwareConfig: null }),
    "billcut",
  );
});

test("#352: exactly three cases lose identity, and they are the documented three", () => {
  const matrix = identityMatrix();
  assert.equal(matrix.length, USE_CASE_IDS.length);

  const lostLegacy = matrix
    .filter((m) => !m.legacySurvives)
    .map((m) => m.id)
    .sort();
  const lostV1 = matrix
    .filter((m) => !m.v1Survives)
    .map((m) => m.id)
    .sort();
  assert.deepEqual(lostLegacy, ["backup", "portable", "reserve"]);
  assert.deepEqual(lostV1, ["backup", "portable", "reserve"]);

  // backup lands on offgrid - a DIFFERENT case, not merely the default.
  const backup = matrix.find((m) => m.id === "backup");
  assert.equal(backup.viaLegacy, "offgrid");
  // portable sizes on the DEVICES load; landing on billcut sizes the household.
  const portable = matrix.find((m) => m.id === "portable");
  assert.equal(portable.viaLegacy, "billcut");

  // A v2 link carries the id, so it must survive for every case.
  assert.ok(matrix.every((m) => m.v2Survives));
});

test("#352: clamps hold their stated bounds", () => {
  const bounds = clampBounds();
  assert.ok(
    bounds.every((b) => b.ok),
    JSON.stringify(bounds.filter((b) => !b.ok)),
  );
});

test("#352: no clamp fires on representative inputs, so none needs visibility", () => {
  const census = clampCensus();
  assert.equal(census.length, 5);
  assert.ok(census.every((c) => !c.reserveFired && !c.outageFired));

  const matrix = identityMatrix();
  const s = summarize({ matrix, census });
  assert.equal(s.clampFired, 0);
  assert.equal(s.clampsNeedVisibility, false);
  // The identity defect is independent of clamp frequency.
  assert.equal(s.identityDefect, true);
  assert.equal(s.v1Losses, 3);
  assert.equal(s.v2Losses, 0);
});

test("#352: an in-range reserve is returned untouched", () => {
  const census = clampCensus([{ reserve: 0.2, outage: 6 }]);
  assert.equal(census[0].reserveOut, 0.2);
  assert.equal(census[0].outageOut, 6);
  // And deriveLegacy still round-trips for the three cases that survive.
  for (const id of ["billcut", "tou", "offgrid"]) {
    assert.deepEqual(Object.keys(deriveLegacy(id)), ["mode", "hardwareConfig"]);
  }
});

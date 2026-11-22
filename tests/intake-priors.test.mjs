// #440 item 2 — the declared FIXTURE SUITE for the prior ranking.
//
// The issue names fixtures #1 and #2 verbatim from the owner's own places (LA
// proper: a battery for time-of-use offset, not a solar install; Trabuco Canyon:
// solar and backup likely), plus dense-urban, flat-tariff/no-TOU,
// no-export-regime, rural and feature-poor places. Each fixture states its
// expected order, so a weight change that moves a place has to say so here.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRIOR_FEATURES,
  hasAnyEvidence,
  rankCases,
  resolveFeatures,
  topCase,
} from "../assets/js/sizing/intake-priors.js";
import { USE_CASE_IDS } from "../assets/js/sizing/usecases.js";

const FIXTURES = [
  {
    name: "#1 Los Angeles proper (owner's example)",
    features: {
      placeClass: "dense-urban",
      tariffLevel: "high",
      touSpread: "wide",
      exportRegime: "limited",
      outageExposure: "low",
      solarResource: "good",
    },
    first: "tou",
    // The issue's requirement: the TOU battery case outranks the solar-install
    // cases for this place.
    above: [["tou", "billcut"]],
    why: { tou: "whyTouBattery", billcut: "whyHighRates" },
  },
  {
    name: "#2 Trabuco Canyon (owner's example)",
    features: {
      placeClass: "suburban",
      tariffLevel: "high",
      touSpread: "narrow",
      exportRegime: "limited",
      outageExposure: "high",
      solarResource: "good",
    },
    first: "backup",
    above: [["backup", "billcut"]],
    why: { backup: "whyOutageBackup", billcut: "whyHighRates" },
  },
  {
    name: "dense urban, flat tariff, no TOU",
    features: {
      placeClass: "dense-urban",
      tariffLevel: "medium",
      touSpread: "none",
      exportRegime: "limited",
      outageExposure: "low",
      solarResource: "fair",
    },
    first: "billcut",
    why: {},
  },
  {
    name: "no export regime, rural",
    features: {
      placeClass: "rural",
      tariffLevel: "low",
      touSpread: "none",
      exportRegime: "none",
      outageExposure: "medium",
      solarResource: "fair",
    },
    first: "offgrid",
    why: { offgrid: "whyRuralOffgrid", reserve: "whyReserve" },
  },
  {
    name: "feature-poor place",
    features: {},
    first: USE_CASE_IDS[0],
    neutral: true,
    why: {},
  },
];

const order = (features) => rankCases(features).map((row) => row.id);
const rankOf = (features, id) => order(features).indexOf(id);

test("#440: every fixture ranks as declared, owner's two places included", () => {
  for (const fixture of FIXTURES) {
    const ranked = rankCases(fixture.features);
    assert.equal(ranked.length, USE_CASE_IDS.length, `${fixture.name}: all cases`);
    assert.equal(ranked[0].id, fixture.first, `${fixture.name}: top case`);
    for (const [higher, lower] of fixture.above || []) {
      assert.ok(
        rankOf(fixture.features, higher) < rankOf(fixture.features, lower),
        `${fixture.name}: ${higher} must rank above ${lower}`,
      );
    }
  }
});

test("#440: a prior REORDERS — it never removes or invents a case", () => {
  for (const fixture of FIXTURES) {
    const ids = order(fixture.features);
    assert.deepEqual([...ids].sort(), [...USE_CASE_IDS].sort(), fixture.name);
    for (const row of rankCases(fixture.features)) {
      assert.equal(typeof row.score, "number");
      assert.ok(Number.isFinite(row.score));
    }
  }
});

test("#440: why-lines name the feature that actually fired", () => {
  for (const fixture of FIXTURES) {
    const ranked = rankCases(fixture.features);
    for (const row of ranked) {
      const expected = (fixture.why || {})[row.id] || null;
      assert.equal(row.why, expected, `${fixture.name}: ${row.id} why-line`);
    }
  }
});

test("#440: a feature-poor place gets the neutral order and no why-lines", () => {
  const ranked = rankCases({});
  assert.deepEqual(
    ranked.map((r) => r.id),
    USE_CASE_IDS,
    "no evidence must fall back to the registry order",
  );
  assert.ok(
    ranked.every((r) => r.why === null && r.score === 0),
    "no evidence must produce no claim",
  );
  assert.equal(hasAnyEvidence({}), false);
  assert.equal(topCase({}), USE_CASE_IDS[0]);
});

test("#440: undeclared or unknown feature values are absent, not guessed", () => {
  const resolved = resolveFeatures({
    placeClass: "moon-base", // not a declared value
    tariffLevel: "high",
    inventedFeature: "high",
  });
  assert.deepEqual(resolved, { tariffLevel: "high" });
  assert.deepEqual(
    rankCases({ placeClass: "moon-base" }).map((r) => r.id),
    [...USE_CASE_IDS],
    "an unknown value must not move the ranking",
  );
});

test("#440: every declared feature names a source and a grade", () => {
  for (const feature of PRIOR_FEATURES) {
    assert.ok(feature.source && feature.source.length > 10, feature.id);
    assert.match(feature.grade, /^[ABC]$/, feature.id);
    assert.ok(feature.values.length >= 2, feature.id);
  }
});

test("#440: ranking is deterministic for the same place", () => {
  const features = FIXTURES[1].features;
  assert.deepEqual(rankCases(features), rankCases({ ...features }));
});

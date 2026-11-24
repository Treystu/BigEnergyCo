// GQ F11 (#440) — the prior model: what a place probably needs, before a
// question is asked, and the ranked order that becomes Round 1's question.
//
// BOUNDARIES (per #429's Unification Record). #430 owns data acquisition
// (location, tariff, weather, recalculation); this module owns INFERENCE and
// SEQUENCING only. #431 owns what renders once a case is active. Nothing here
// changes a price.
//
// Two rules this file exists to enforce:
//
//   1. NO FEATURE WITHOUT A DECLARED SOURCE. Every input below is listed in
//      PRIOR_FEATURES with where it comes from and how good that source is. A
//      feature that cannot be resolved is ABSENT, never guessed: the scorer
//      treats `undefined` as "no evidence", so a place with no records gets the
//      registry's neutral order rather than an invented preference.
//
//   2. PRIORS REORDER, THEY NEVER HIDE. The output is always a permutation of
//      the six registry cases. Every case stays reachable; a low prior is a
//      later position, never a removal, and never an override of an explicit
//      answer (the UI layer owns that rule and this module gives it nothing to
//      enforce it with).
//
// Why-lines are CODES, not sentences. The UI maps a code to the locale
// dictionary, so the ranking can be tested here without owning copy in seven
// languages.

import { USE_CASE_IDS } from "./usecases.js?v=20261124h";

/**
 * The declared feature set. `source` names the producer, `grade` is the honesty
 * label the UI shows beside derived claims (same A/B/C vocabulary the
 * provenance registry uses).
 */
export const PRIOR_FEATURES = [
  {
    id: "placeClass",
    source: "geocoder result class (dense urban / suburban / rural)",
    grade: "B",
    values: ["dense-urban", "suburban", "rural"],
  },
  {
    id: "tariffLevel",
    source: "tariff registry record for the resolved country/region",
    grade: "B",
    values: ["low", "medium", "high"],
  },
  {
    id: "touSpread",
    source:
      "tariff record: does a time-of-use schedule exist, and how wide is it",
    grade: "B",
    values: ["none", "narrow", "wide"],
  },
  {
    id: "exportRegime",
    source: "tariff record: net-metering / export compensation regime",
    grade: "C",
    values: ["none", "limited", "generous"],
  },
  {
    id: "outageExposure",
    source:
      "region record: outage frequency (absent where the record is silent)",
    grade: "C",
    values: ["low", "medium", "high"],
  },
  {
    id: "solarResource",
    source: "weather series: annual specific yield class",
    grade: "A",
    values: ["poor", "fair", "good"],
  },
];

const FEATURE_IDS = PRIOR_FEATURES.map((f) => f.id);

/**
 * Score weights. Each entry is [featureId, value, points] and is applied only
 * when the feature resolved to that value. Weights are deliberately small and
 * legible: the ranking is a stacking of honest nudges, not a model nobody can
 * audit.
 */
const WEIGHTS = {
  billcut: [
    ["tariffLevel", "high", 30],
    ["tariffLevel", "medium", 12],
    ["solarResource", "good", 18],
    ["solarResource", "fair", 8],
    ["exportRegime", "generous", 8],
  ],
  tou: [
    ["touSpread", "wide", 40],
    ["touSpread", "narrow", 18],
    ["tariffLevel", "high", 12],
    ["tariffLevel", "medium", 6],
  ],
  backup: [
    ["outageExposure", "high", 38],
    ["outageExposure", "medium", 18],
    ["placeClass", "suburban", 10],
    ["placeClass", "rural", 8],
    ["tariffLevel", "high", 10],
  ],
  reserve: [
    ["outageExposure", "medium", 20],
    ["outageExposure", "high", 10],
    ["touSpread", "wide", 6],
  ],
  offgrid: [
    ["placeClass", "rural", 26],
    ["exportRegime", "none", 8],
    ["outageExposure", "high", 8],
  ],
  portable: [],
};

/**
 * One-line why for a case, chosen by the strongest rule that actually fired.
 * Returns a code plus params the UI interpolates; `null` means "no line", which
 * is the honest answer when no feature supported this case.
 */
const WHY = {
  billcut: [
    ["tariffLevel", "high", "whyHighRates"],
    ["solarResource", "good", "whyGoodSun"],
  ],
  tou: [["touSpread", "wide", "whyTouBattery"]],
  backup: [
    ["outageExposure", "high", "whyOutageBackup"],
    ["placeClass", "suburban", "whySuburbanSolarBackup"],
  ],
  reserve: [["outageExposure", "medium", "whyReserve"]],
  offgrid: [["placeClass", "rural", "whyRuralOffgrid"]],
  portable: [],
};

/** Keep only declared features with a declared value; anything else is absent. */
export function resolveFeatures(input = {}) {
  const out = {};
  for (const feature of PRIOR_FEATURES) {
    const value = input[feature.id];
    if (typeof value === "string" && feature.values.includes(value))
      out[feature.id] = value;
  }
  return out;
}

export function hasAnyEvidence(features = {}) {
  return FEATURE_IDS.some((id) => features[id] !== undefined);
}

function scoreFor(caseId, features) {
  let score = 0;
  for (const [featureId, value, points] of WEIGHTS[caseId] || []) {
    if (features[featureId] === value) score += points;
  }
  return score;
}

function whyFor(caseId, features) {
  for (const [featureId, value, code] of WHY[caseId] || []) {
    if (features[featureId] === value) return code;
  }
  return null;
}

/**
 * Rank the six registry cases for a place.
 *
 * Deterministic: equal scores fall back to the registry's own order, so a
 * feature-poor place returns exactly USE_CASE_IDS with no why-lines (the neutral
 * order the issue names), and the same features always produce the same list.
 *
 * @param {Record<string,string>} rawFeatures resolved prior features
 * @returns {{id: string, score: number, why: string|null}[]}
 */
export function rankCases(rawFeatures = {}) {
  const features = resolveFeatures(rawFeatures);
  const ranked = USE_CASE_IDS.map((id, index) => ({
    id,
    score: scoreFor(id, features),
    why: whyFor(id, features),
    index,
  }));
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked.map(({ id, score, why }) => ({ id, score, why }));
}

/** The case Round 1 pre-selects: the top of the ranking, always a real case. */
export function topCase(rawFeatures = {}) {
  return rankCases(rawFeatures)[0].id;
}

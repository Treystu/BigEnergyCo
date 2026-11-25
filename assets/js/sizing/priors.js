// Location priors: which use cases are likely HERE, ranked, with a reason.
//
// Why this file exists. #440 (GQ F11) and this module's own boundary in
// docs/PRESENTATION_SPEC_V1.md §12: the ranked case list is the intake's first
// question, and the order must come from the place the visitor already gave us
// rather than from a question we make them answer. #430 owns where the features
// come from (tariff, weather, geocoder result); this module owns only what they
// imply about the ORDER of the six cases, and it declares every feature's
// source and grade so no ranking is a guess with no receipt.
//
// Three rules this file exists to enforce:
//
//   1. NO FEATURE WITHOUT A SOURCE. Every feature names where it is read from
//      and how strong that source is (see FEATURE_SOURCES). A feature that
//      cannot be resolved is absent, never defaulted into a plausible value.
//
//   2. PRIORS ORDER, THEY NEVER REMOVE. The ranking is a permutation of the
//      registry's six ids. It sets presentation order and the pre-selected
//      case only (§12.1, §12.5); a visitor's own pick wins instantly, and a
//      demoted case is demoted in order, never hidden.
//
//   3. WHY-LINES ARE HEDGED FACTS. Each rank may carry one why key built from
//      the features that produced it; a feature-poor place carries none and
//      shows the registry's neutral order rather than an invented reason
//      (§12.3).
//
// The fixture suite at the bottom is the gate: it includes the owner's two
// places verbatim (Los Angeles proper, Trabuco Canyon) and the feature-poor
// case, and scripts/check-priors.mjs walks it.

import { USE_CASE_IDS } from "./usecases.js?v=20261125e";

/** Where each feature is read from, and how much weight its grade carries. */
export const FEATURE_SOURCES = {
  rateLevel: {
    source: "tariff registry record for the resolved region",
    grade: "B",
    note: "a normalized 0-1 reading of the displayed residential rate",
  },
  touSchedule: {
    source: "tariff registry record: time-of-use schedule presence",
    grade: "B",
    note: "true when the record declares a peak/off-peak schedule",
  },
  exportRegime: {
    source: "tariff registry record: net-metering / export regime",
    grade: "B",
    note: "declared, and deliberately not ranked on yet (see OPEN_PRIOR_QUESTIONS)",
  },
  placeClass: {
    source: "the geocoder result for the resolved place",
    grade: "C",
    note: "dense urban / suburban / rural, from the reverse-geocode address class",
  },
  outageExposure: {
    source: "region record: declared outage exposure",
    grade: "C",
    note: "absent when the region record carries no outage reading",
  },
  solarYield: {
    source: "the fetched weather series (kWh per kW-year at the place)",
    grade: "A",
    note: "read, not inferred; drives no order on its own",
  },
};

/**
 * The features a ranking may read. A missing key is ABSENT (rule 1) and each
 * scorer below must tolerate that without inventing a value.
 */
export function normaliseFeatures(input) {
  const f = input || {};
  const out = {};
  const num = (v) => (Number.isFinite(v) ? v : null);
  if (num(f.rateLevel) !== null)
    out.rateLevel = Math.min(1, Math.max(0, f.rateLevel));
  if (typeof f.touSchedule === "boolean") out.touSchedule = f.touSchedule;
  if (typeof f.exportRegime === "string" && f.exportRegime)
    out.exportRegime = f.exportRegime;
  if (["urban", "suburban", "rural"].includes(f.placeClass))
    out.placeClass = f.placeClass;
  if (typeof f.outageExposure === "boolean")
    out.outageExposure = f.outageExposure;
  if (num(f.solarYield) !== null) out.solarYield = f.solarYield;
  return out;
}

/** True when the features say nothing specific about this place (§12.3). */
export function isFeaturePoor(features) {
  const f = features || {};
  return !(
    Number.isFinite(f.rateLevel) ||
    typeof f.touSchedule === "boolean" ||
    typeof f.outageExposure === "boolean" ||
    f.placeClass === "rural"
  );
}

/**
 * Score each case from the features. A score is a presentation weight, not a
 * prediction of savings: it exists so the order is reproducible from declared
 * inputs, and two runs on one place cannot disagree.
 */
export function scoreCases(features) {
  const f = normaliseFeatures(features);
  const rate = Number.isFinite(f.rateLevel) ? f.rateLevel : 0;
  const tou = f.touSchedule === true;
  const outage = f.outageExposure === true;
  const rural = f.placeClass === "rural";
  const scores = {
    billcut: 1 + rate,
    // A time-of-use schedule is the only feature that makes a battery pay
    // without panels, so it dominates when present (owner's LA example).
    tou: 0.5 + (tou ? 2 : 0) + rate * 0.5,
    // Outage exposure is what makes solar-with-backup the common install
    // (owner's Trabuco Canyon example).
    backup: 1 + (outage ? 2.5 : 0),
    reserve: 0.5 + (outage ? 1 : 0),
    offgrid: rural ? 2.5 : 0.5,
    portable: 0.4,
  };
  return scores;
}

/** The why-line key for a case, given the features that lifted it, or null. */
export function whyFor(id, features) {
  const f = normaliseFeatures(features);
  const rate = Number.isFinite(f.rateLevel) ? f.rateLevel : 0;
  switch (id) {
    case "tou":
      return f.touSchedule === true ? "caseWhyTou" : null;
    case "backup":
      return f.outageExposure === true ? "caseWhyBackup" : null;
    case "billcut":
      return rate >= 0.6 ? "caseWhyRate" : null;
    case "offgrid":
      return f.placeClass === "rural" ? "caseWhyOffgrid" : null;
    case "reserve":
      return f.outageExposure === true ? "caseWhyReserve" : null;
    case "portable":
      return null;
    default:
      return null;
  }
}

/**
 * The ranked presentation for these features.
 *
 * Returns `{ id, whyKey }` rows in presentation order. The order is a stable
 * sort on the score with the registry order as the tie-break, so equal scores
 * never shuffle between renders (and the neutral order is exactly the
 * registry's own order).
 */
export function rankCases(features) {
  const f = normaliseFeatures(features);
  if (isFeaturePoor(f))
    return USE_CASE_IDS.map((id) => ({ id, whyKey: null }));
  const scores = scoreCases(f);
  return USE_CASE_IDS.map((id, i) => ({ id, i, score: scores[id] }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ id }) => ({ id, whyKey: whyFor(id, f) }));
}

/** The case the intake pre-selects: the top of the ranking (§12.2). */
export function topCase(features) {
  return rankCases(features)[0].id;
}

/**
 * Questions the record does not settle, recorded rather than guessed. Each is
 * a presentation question this module refuses to answer on its own.
 */
export const OPEN_PRIOR_QUESTIONS = [
  {
    id: "export-regime-weight",
    question:
      "Does an export regime (net metering vs net billing) reorder the cases, or only colour the why-line?",
    decider: "#440",
    reason:
      "the tariff record declares the regime, but no fixture in the filed text states an expected order for it",
  },
];

// ── The fixture suite (the gate) ────────────────────────────────────────────
//
// Fixtures #1 and #2 are the owner's own examples, verbatim from #440's text.
// `expect` is the presentation order; `why` names the key the top case must
// carry. A feature-poor fixture expects the registry's neutral order and no
// why-lines at all.
export const PRIOR_FIXTURES = [
  {
    name: "Los Angeles proper (owner example)",
    features: {
      rateLevel: 0.9,
      touSchedule: true,
      outageExposure: false,
      placeClass: "urban",
      solarYield: 1720,
    },
    expect: ["tou", "billcut", "backup", "reserve", "offgrid", "portable"],
    why: "caseWhyTou",
  },
  {
    name: "Trabuco Canyon (owner example)",
    features: {
      rateLevel: 0.9,
      touSchedule: true,
      outageExposure: true,
      placeClass: "suburban",
      solarYield: 1820,
    },
    expect: ["backup", "tou", "billcut", "reserve", "offgrid", "portable"],
    why: "caseWhyBackup",
  },
  {
    name: "flat-tariff dense city, no schedule",
    features: {
      rateLevel: 0.4,
      touSchedule: false,
      outageExposure: false,
      placeClass: "urban",
    },
    // No schedule and no outage exposure: the bill-cut case leads on rate, and
    // backup sits above ToU because a battery with no schedule has nothing to
    // arbitrate (the score, not an opinion).
    expect: ["billcut", "backup", "tou", "reserve", "offgrid", "portable"],
    why: null,
  },
  {
    name: "rural, no outage reading",
    features: { rateLevel: 0.5, placeClass: "rural" },
    expect: ["offgrid", "billcut", "backup", "tou", "reserve", "portable"],
    why: "caseWhyOffgrid",
  },
  {
    name: "feature-poor (nothing resolved)",
    features: {},
    expect: ["billcut", "tou", "backup", "reserve", "offgrid", "portable"],
    why: null,
    featurePoor: true,
  },
];

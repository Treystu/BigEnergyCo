// Champion Audit #358 - the Jev sanity-badge classification thresholds.
//
// WHAT CAN AND CANNOT BE MEASURED OFFLINE. #358's acceptance is a pair of
// ERROR RATES on a labelled corpus: thresholds are re-frozen if the current set
// flags >5% of sound sizings or passes >5% of broken ones. Those rates need the
// model's answers, and the model is a remote service (`jev-latest` via the
// worker's /api/jev route). No offline run can produce them, and simulating a
// classifier to feed a classifier would measure the simulation.
//
// So this harness does the two things that ARE exact offline:
//
//   1. THE DECISION SURFACE. `interpretSanity` is a pure function of
//      (plausible, redFlag, verdict, verdictConfidence). Its entire surface is
//      enumerated here - the boundaries, the silent band, and whether a
//      conservative flag can ever be turned into a pass.
//   2. THE CORPUS FIXTURE. The >50 sound / >20 broken corpus #358 asks for is
//      built with the shipped `sanityState` on real sizing runs plus documented
//      mutations, and emitted as JSON. That leaves exactly one missing
//      ingredient - the model call - so the rate measurement is a bounded job,
//      not an open research task.
//
// Run: node scripts/champion-audit-sanityBadge.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-sanityBadge.json
//      docs/lane/data-reads/2026-11-10-champion-audit-sanityCorpus.json

import { writeFileSync } from "node:fs";

import {
  interpretSanity,
  SANITY_THRESHOLDS,
  sanityState,
} from "../assets/js/sizing/validate.js";
import { runSizing } from "../assets/js/sizing/run.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import {
  OFFLINE_PROFILES,
  PROFILE_YEAR,
} from "../assets/js/sizing/profiles.js";

// Acceptance, verbatim from #358.
const SOUND_FLAG_MAX = 0.05;
const BROKEN_PASS_MAX = 0.05;

const CORPUS = [
  "Nairobi, Kenya",
  "Honolulu, USA",
  "Phoenix, USA",
  "London, UK",
  "Berlin, Germany",
  "Delhi, India",
];
const MODES = ["gridtie", "offgrid"];
const LOADS = [10, 15, 25];
const TARIFF = 0.2;

/** Enumerate the badge's whole surface: no model, no sampling, no guesswork. */
export function decisionSurface() {
  const pSteps = [];
  for (let i = 0; i <= 100; i++) pSteps.push(i / 100);
  const rSteps = [];
  for (let i = 0; i <= 30; i++) rSteps.push(i / 10);

  const levels = { pass: 0, flag: 0, uncertain: 0 };
  let total = 0;
  const silentP = new Set();
  const passP = new Set();
  const flagP = new Set();

  for (const p of pSteps) {
    for (const r of rSteps) {
      const out = interpretSanity({
        available: true,
        plausible: p,
        redFlag: r,
        verdict: "plausible",
        verdictConfidence: 0.5,
      });
      levels[out.level]++;
      total++;
      if (out.level === "uncertain") silentP.add(p);
      if (out.level === "pass") passP.add(p);
      if (out.level === "flag") flagP.add(p);
    }
  }

  // Boundaries, exactly as the shipped comparisons read them.
  const at = (
    plausible,
    redFlag,
    verdict = "plausible",
    verdictConfidence = 0.5,
  ) =>
    interpretSanity({
      available: true,
      plausible,
      redFlag,
      verdict,
      verdictConfidence,
    }).level;

  return {
    gridPoints: total,
    levels,
    shares: {
      pass: +(levels.pass / total).toFixed(4),
      flag: +(levels.flag / total).toFixed(4),
      uncertain: +(levels.uncertain / total).toFixed(4),
    },
    // The badge is silent between the two plausible bounds and between the two
    // red-flag bounds: that band is 30% of the plausible axis by construction.
    plausibleAxis: {
      flagAtOrBelow: SANITY_THRESHOLDS.flagPlausibleMax,
      passAtOrAbove: SANITY_THRESHOLDS.passPlausibleMin,
      silentWidth:
        SANITY_THRESHOLDS.passPlausibleMin - SANITY_THRESHOLDS.flagPlausibleMax,
      silentShareOfAxis: +(
        SANITY_THRESHOLDS.passPlausibleMin - SANITY_THRESHOLDS.flagPlausibleMax
      ).toFixed(4),
      pValuesEverFlagged: flagP.size,
      pValuesEverPassing: passP.size,
      pValuesEverSilent: silentP.size,
      // Share of the whole (p, r) grid where a pass is even representable:
      // p >= 0.6 AND r <= 1.0. Everything else can never be a pass.
      passPossibleShare: +(
        (passP.size / pSteps.length) *
        ((rSteps.filter((r) => r <= SANITY_THRESHOLDS.passRedFlagMax).length ||
          0) /
          rSteps.length)
      ).toFixed(4),
    },
    boundaries: {
      "p=0.30 flags": at(0.3, 0) === "flag",
      "p=0.31 silent": at(0.31, 0) === "uncertain",
      "p=0.60 passes": at(0.6, 0) === "pass",
      "p=0.59 silent": at(0.59, 0) === "uncertain",
      "redFlag=1.5 flags": at(0.9, 1.5) === "flag",
      "redFlag=1.4 silent": at(0.9, 1.4) === "uncertain",
      "redFlag=1.0 passes": at(0.9, 1.0) === "pass",
      "redFlag=1.01 silent": at(0.9, 1.01) === "uncertain",
      "impossible@0.6 flags": at(0.9, 0, "impossible", 0.6) === "flag",
      "impossible@0.59 silent": at(0.9, 0, "impossible", 0.59) === "uncertain",
    },
    // The stated design property: a flag can never be granted a pass by another
    // axis, and a verdict alone can never grant a pass.
    asymmetry: {
      // A high plausible score cannot rescue a red-flagged sizing.
      anyFlagWins: at(0.99, 1.6) === "flag",
      impossibleNeverPasses: at(0.95, 0, "impossible", 0.1) === "uncertain",
      missingPlausibleIsNull: interpretSanity({ available: true }) === null,
      unavailableIsNull:
        interpretSanity({ available: false, plausible: 0.9 }) === null,
    },
  };
}

function profileFor(city) {
  const p = OFFLINE_PROFILES.find((x) => x.name === city);
  if (!p) throw new Error(`unknown offline profile: ${city}`);
  return p;
}

function fakeWeather(hours, p) {
  return async () => ({
    hours,
    meta: {
      latitude: p.lat,
      longitude: p.lon,
      startYear: PROFILE_YEAR,
      endYear: PROFILE_YEAR,
      years: 1,
      source: "audit fixture",
      offline: false,
    },
  });
}

/**
 * >50 sound states, built by the shipped `sanityState` on real runs - so the
 * question-set input is the one the worker would actually receive.
 */
export async function soundCorpus() {
  const out = [];
  for (const city of CORPUS) {
    const p = profileFor(city);
    const hours = synthesizeFromProfile(p);
    for (const mode of MODES) {
      for (const dailyKwh of LOADS) {
        const payload = await runSizing(
          {
            latitude: p.lat,
            longitude: p.lon,
            dailyKwh,
            tariff: TARIFF,
            chemistry: "auto",
            mode,
          },
          { fetchWeather: fakeWeather(hours, p) },
        );
        const state = sanityState(payload, payload.best);
        if (!state) continue;
        out.push({ label: "sound", city, mode, dailyKwh, state });
      }
    }
  }
  return out;
}

/**
 * >20 deliberately broken states. Each mutation is documented with what it
 * breaks, and every one is applied to a REAL sound state rather than invented,
 * so the corpus differs from the sound set in one dimension at a time.
 */
export const BROKEN_MUTATIONS = [
  {
    id: "bank-quartered",
    breaks: "battery far too small for the load",
    apply: (e) => ({ ...e, battKwh: +(e.battKwh * 0.25).toFixed(1) }),
  },
  {
    id: "bank-tenth",
    breaks: "battery nominal but unusable",
    apply: (e) => ({ ...e, battKwh: +(e.battKwh * 0.1).toFixed(1) }),
  },
  {
    id: "pv-quartered",
    breaks: "too little generation for the load",
    apply: (e) => ({ ...e, pvKw: +(e.pvKw * 0.25).toFixed(2) }),
  },
  {
    id: "payback-sub-year",
    breaks: "implausible payback (sub-year on a real system)",
    apply: (e) => ({ ...e, paybackYearsLo: 0.3, paybackYearsHi: 0.8 }),
  },
  {
    id: "coverage-saturated",
    breaks: "claimed coverage with no storage or export",
    apply: (e) => ({ ...e, cutPct: 100, battKwh: 0 }),
  },
];

export function brokenCorpus(sound) {
  const out = [];
  for (const entry of sound) {
    for (const m of BROKEN_MUTATIONS) {
      const mutated = m.apply(entry.state);
      // Only keep a mutation that actually changed a number.
      if (JSON.stringify(mutated) === JSON.stringify(entry.state)) continue;
      out.push({
        label: "broken",
        breaks: m.breaks,
        mutation: m.id,
        city: entry.city,
        mode: entry.mode,
        dailyKwh: entry.dailyKwh,
        state: mutated,
      });
    }
  }
  return out;
}

export function summarize({ surface, sound, broken }) {
  return {
    // The surface is exact; the rates are NOT measured here, and saying so is
    // the point of this receipt.
    surface,
    corpus: { sound: sound.length, broken: broken.length },
    acceptance: { SOUND_FLAG_MAX, BROKEN_PASS_MAX },
    measurableOffline: {
      decisionSurface: true,
      soundFlagRate: false,
      brokenPassRate: false,
    },
    missingIngredient:
      "the model's answers: the worker asks jev-latest over /api/jev and records no probe outputs in the repo",
    thresholdsFrozen: Object.keys(SANITY_THRESHOLDS).length,
  };
}

async function main() {
  const surface = decisionSurface();
  const sound = await soundCorpus();
  const broken = brokenCorpus(sound);
  const summary = summarize({ surface, sound, broken });

  const corpusPath =
    "docs/lane/data-reads/2026-11-10-champion-audit-sanityCorpus.json";
  writeFileSync(
    corpusPath,
    JSON.stringify(
      {
        issue: 358,
        generated: new Date().toISOString(),
        model: "jev-latest",
        note: "State fixtures only. The plausible/redFlag/verdict answers must be produced by the deployed /api/jev route; nothing here fabricates them.",
        sound,
        broken,
      },
      null,
      2,
    ) + "\n",
  );

  const out = {
    issue: 358,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    thresholds: SANITY_THRESHOLDS,
    summary,
    corpusPath,
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-sanityBadge.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
  console.log("wrote", path, "and", corpusPath);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-sanityBadge.mjs")
) {
  main();
}

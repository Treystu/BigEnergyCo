// Champion Audit #352 - use-case qualification and goal routing.
//
// THE QUESTION. Six use cases (`billcut, tou, backup, reserve, offgrid,
// portable`) each decide the load source, tier and verdict. #352's hypothesis is
// that the legacy (mode, hardwareConfig) pair CANNOT recover every case, so any
// restoration path that loses the explicit case id silently re-interprets one
// visitor as another - and sizes the wrong load.
//
// WHAT IS MEASURED. Three restoration paths, each replayed through the shipped
// functions:
//
//   1. LEGACY PAIR        `deriveLegacy(id)` -> `useCaseForLegacy(pair)`
//   2. V2 SHARE LINK      carries `uc` explicitly; identity should survive
//   3. V1 SHARE LINK      carries no `uc`, so ui.js:8006 infers the case from
//                         the pair: `g === 0 ? "offgrid" : hw === "battery" ?
//                         "tou" : "billcut"`. That inference is REPLAYED here
//                         exactly as written, because it is the path a visitor
//                         opens from an older link.
//
// Plus the clamp/default census #352 asks for: which normalizer fires on
// representative inputs, and therefore whether any clamp needs to become
// visible in the UI contract (>10% of persona inputs).
//
// Run: node scripts/champion-audit-useCaseRouting.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-useCaseRouting.json

import { writeFileSync } from "node:fs";

import {
  USE_CASE_IDS,
  useCase,
  useCaseForLegacy,
  deriveLegacy,
  normaliseReservePct,
  normaliseOutageTarget,
} from "../assets/js/sizing/usecases.js";

const CLAMP_VISIBLE_SHARE = 0.1;

/**
 * The v1 share-link inference, transcribed from ui.js:8006. It is duplicated
 * ON PURPOSE: the audit has to measure the shipped expression, and the
 * expression lives inside a UI function that is not exported.
 */
export function v1InferCase({ mode, hardwareConfig }) {
  const g = mode === "offgrid" ? 0 : 1;
  const hw = hardwareConfig === "battery" ? "battery" : "both";
  return g === 0 ? "offgrid" : hw === "battery" ? "tou" : "billcut";
}

/** Every restoration path for every case, with identity preserved or lost. */
export function identityMatrix() {
  return USE_CASE_IDS.map((id) => {
    const legacy = deriveLegacy(id);
    const viaLegacy = useCaseForLegacy(legacy);
    const viaV1 = v1InferCase(legacy);
    // A v2 link carries the id, so its restore is `useCase(o.uc)` when valid.
    const viaV2 = useCase(id) ? id : null;
    return {
      id,
      legacy,
      viaLegacy,
      viaV1,
      viaV2,
      legacySurvives: viaLegacy === id,
      v1Survives: viaV1 === id,
      v2Survives: viaV2 === id,
    };
  });
}

// Representative visitor inputs. Reserve arrives as a share (0-1) from the
// slider; outage as hours. These are the values a persona could actually hold.
const PERSONA_INPUTS = [
  { reserve: 0.1, outage: 2 },
  { reserve: 0.2, outage: 6 },
  { reserve: 0.5, outage: 12 },
  { reserve: 0.9, outage: 24 },
  { reserve: 0.85, outage: 168 },
];

/** Which normalizers fire, and by how much, on representative inputs. */
export function clampCensus(inputs = PERSONA_INPUTS) {
  return inputs.map((i) => {
    const reserveOut = normaliseReservePct(i.reserve);
    const outageOut = normaliseOutageTarget(i.outage);
    return {
      input: i,
      reserveOut,
      outageOut,
      reserveFired: reserveOut !== i.reserve,
      outageFired: outageOut !== i.outage,
    };
  });
}

/** Out-of-range probes, to show the clamps actually clamp their stated bounds. */
export function clampBounds() {
  const probes = [
    ["reserve above cap", normaliseReservePct(0.95), 0.9],
    ["reserve percent form", normaliseReservePct(95), 0.9],
    ["reserve negative", normaliseReservePct(-1), 0],
    ["outage zero", normaliseOutageTarget(0), 6],
    ["outage default", normaliseOutageTarget(undefined), 6],
    ["outage above cap", normaliseOutageTarget(500), 168],
    ["outage below floor", normaliseOutageTarget(0.2), 1],
  ];
  return probes.map(([name, got, want]) => ({
    name,
    got,
    want,
    ok: got === want,
  }));
}

export function summarize({ matrix, census }) {
  const usable = matrix.filter((m) => m.id);
  const lostLegacy = usable.filter((m) => !m.legacySurvives);
  const lostV1 = usable.filter((m) => !m.v1Survives);
  const lostV2 = usable.filter((m) => !m.v2Survives);
  const clampFired = census.filter((c) => c.reserveFired || c.outageFired);
  return {
    cases: usable.length,
    legacyLosses: lostLegacy.length,
    v1Losses: lostV1.length,
    v2Losses: lostV2.length,
    // #352: "any path that changes case identity without an explicit visitor
    // action is a defect to fix regardless of frequency".
    identityDefect:
      lostLegacy.length > 0 || lostV1.length > 0 || lostV2.length > 0,
    clampFired: clampFired.length,
    clampShare: usable.length
      ? +(clampFired.length / census.length).toFixed(4)
      : 0,
    // #352's clamp branch: unchanged unless they fire on >10% of persona inputs.
    clampsNeedVisibility:
      clampFired.length / census.length > CLAMP_VISIBLE_SHARE,
  };
}

function main() {
  const matrix = identityMatrix();
  const census = clampCensus();
  const bounds = clampBounds();
  const summary = summarize({ matrix, census });

  const out = {
    issue: 352,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { CLAMP_VISIBLE_SHARE },
    v1InferenceSource: "ui.js:8006 restoreFromShare, replayed verbatim",
    summary,
    identityMatrix: matrix,
    clampCensus: census,
    clampBounds: bounds,
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-useCaseRouting.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");

  for (const m of matrix) {
    console.log(
      `${m.id.padEnd(9)} pair ${JSON.stringify(m.legacy).padEnd(44)} legacy->${m.viaLegacy.padEnd(9)} v1->${m.viaV1.padEnd(9)} ${m.legacySurvives ? "" : "LOST"}${m.v1Survives ? "" : " (v1)"}`,
    );
  }
  console.log(
    "bounds all ok:",
    bounds.every((b) => b.ok),
  );
  console.log(
    "clamp fires on representative inputs:",
    summary.clampFired,
    "/",
    census.length,
  );
  console.log("identityDefect:", summary.identityDefect);
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-useCaseRouting.mjs")
) {
  main();
}

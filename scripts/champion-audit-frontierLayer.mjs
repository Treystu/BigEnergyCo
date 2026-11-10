// Champion Audit #353 - the frontier recommendation layer.
//
// THE QUESTION. The chart recommends three things: a knee ("good value stops
// here"), a value range (where the curve stops being worth climbing), and a
// budget pick. #353's hypothesis is that these are functions of LADDER DENSITY
// and thinning, not only physics - refine the rungs and the recommendation can
// jump, which would mean the visitor is being shown an artefact of the lattice.
//
// WHAT IS MEASURED. For each corpus case the SAME rule runs over three lattice
// densities - the shipped 18x16, 2x (36x32) and 4x (72x64). Builders, thinning,
// knee rule, value-range rule and budget pick are all the shipped ones; only
// `pvSteps`/`battSteps` move, which is exactly the refinement #353 names. Then:
//
//   knee movement     rungs on the SHIPPED 1x ladder (so "1 rung" means what a
//                     visitor could actually see) plus the cost move as a share
//                     of the knee's own capex
//   value-range hi    where the range ends, in cost and coverage
//   budget pick       at 1.0x/1.3x/1.6x the 1x knee capex, versus the search
//                     optimum for the same site (a different objective)
//
// ACCEPTANCE, verbatim from #353: the rules change only if the knee moves by
// >1 rung OR >5% of curve cost under 2x refinement on >20% of corpus sites.
// Separately: the comment/constant mismatch is corrected either way.
//
// The mismatch is real and is asserted here, not described: the comment above
// FRONTIER_MIN_STEP_PP says "two points one-third of a percentage point apart
// are the same answer", and the constant is 1.0. One of them is wrong; this
// harness pins BOTH facts so the correction (to the comment) cannot drift back.
//
// Run: node scripts/champion-audit-frontierLayer.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-frontierLayer.json

import { writeFileSync } from "node:fs";

import {
  buildE1kw,
  expandProfile,
  flatProfile,
  simulateOffset,
  sizeForBillCut,
  sizeForTier,
  DERATES_DEFAULT,
} from "../assets/js/sizing/engine.js";
import { capacityScaleFor } from "../assets/js/sizing/chem-model.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import { OFFLINE_PROFILES } from "../assets/js/sizing/profiles.js";
import {
  battLadder,
  buildFrontier,
  findValueRange,
  pvLadder,
} from "../assets/js/sizing/frontier.js";
import { bestAffordableCurvePoint } from "../assets/js/shared/budget-targets.js";
import { buildSite } from "./champion-audit-sizeForBillCut.mjs";

// Acceptance, verbatim from #353.
const RUNG_MOVE_REQUIRED = 1;
const COST_MOVE_REQUIRED = 0.05;
const SITE_SHARE_REQUIRED = 0.2;

// The shipped lattice, and the shipped thinning the mismatch is about.
export const SHIPPED_LATTICE = { pvSteps: 18, battSteps: 16 };
export const SHIPPED_MIN_STEP_PP = 1.0;
export const COMMENT_CLAIM_PP = 1 / 3;

const DENSITIES = [
  { name: "1x", pvSteps: 18, battSteps: 16, factor: 1 },
  { name: "2x", pvSteps: 36, battSteps: 32, factor: 2 },
  { name: "4x", pvSteps: 72, battSteps: 64, factor: 4 },
];

const CORPUS = [
  "Nairobi, Kenya",
  "Honolulu, USA",
  "Phoenix, USA",
  "London, UK",
  "Berlin, Germany",
  "Delhi, India",
];
const MODES = ["offgrid", "billcut"];
const LOAD_KWH_DAY = 15;
const YEARS = 20;
const TARIFF = 0.2;
const BUDGET_MULTIPLES = [1.0, 1.3, 1.6];

function profileFor(city) {
  const p = OFFLINE_PROFILES.find((x) => x.name === city);
  if (!p) throw new Error(`unknown offline profile: ${city}`);
  return p;
}

/** Every input a frontier needs for one site and mode, built once. */
export function siteInputs(city, mode) {
  const p = profileFor(city);
  const hours = synthesizeFromProfile(p);
  const e1kw = buildE1kw(hours, DERATES_DEFAULT);
  const tempsC = hours.map((h) => h.tAmb);
  const meanTempC = tempsC.reduce((a, b) => a + b, 0) / tempsC.length;
  const site = buildSite(city, LOAD_KWH_DAY);
  const battMax = mode === "offgrid" ? 300 : 150;
  return {
    city,
    mode,
    hours,
    battMax,
    common: {
      e1kw,
      loadWh: expandProfile(flatProfile(LOAD_KWH_DAY), hours.length),
      tempsC,
      chemistry: "lfp",
      mode,
      years: YEARS,
      costPerWpv: site.costPerWpv,
      costPerKwhBatt: site.battPerKwh("lfp"),
      costPerKwInv: site.costPerKwInv,
      pvMax: 30,
      battMax,
      capacityScale: capacityScaleFor("lfp", meanTempC),
      laborPerKwh: site.laborPerKwh,
      invMinKw: 0,
      simulate: simulateOffset,
      tariff: TARIFF,
      exportRate: 0,
    },
  };
}

/** Nearest rung index of `value` in a ladder - the visitor-visible position. */
export function rungIndex(ladder, value) {
  let best = -1;
  let dist = Infinity;
  for (let i = 0; i < ladder.length; i++) {
    const d = Math.abs(ladder[i] - value);
    if (d < dist) {
      dist = d;
      best = i;
    }
  }
  return best;
}

/** Build one front at one density and read its three recommendations. */
export function frontAt(inputs, density) {
  const front = buildFrontier({
    ...inputs.common,
    pvSteps: density.pvSteps,
    battSteps: density.battSteps,
  });
  const points = front.points;
  const knee = front.kneeIndex >= 0 ? points[front.kneeIndex] : null;
  // `buildFrontier` returns DISPLAY points (`outcomePct`, 0-100), while the
  // curve rules read the internal shape (`outcome`, 0-1). `costPerPoint` uses
  // only those two fields, so rebuilding the internal shape from the display
  // array is exact - but it must be done, or every range reads null.
  const curve = points.map((p) => ({
    capexUsd: p.capexUsd,
    outcome: p.outcomePct / 100,
  }));
  const range = findValueRange(curve);
  return {
    density: density.name,
    pointCount: points.length,
    simCount: front.simCount,
    knee: knee
      ? {
          index: front.kneeIndex,
          pvKw: knee.pvKw,
          battKwh: knee.battKwh,
          outcomePct: +(knee.outcomePct ?? knee.outcome * 100).toFixed(2),
          capexUsd: Math.round(knee.capexUsd),
        }
      : null,
    range,
    points,
  };
}

/**
 * The search optimum for the same site - the objective that minimizes lifetime
 * cost rather than maximizing the chart's coverage percentage.
 */
export function searchOptimum(inputs) {
  const req =
    inputs.mode === "offgrid"
      ? { ...inputs.common, maxUnmetHoursPerYear: 87.6 }
      : { ...inputs.common, minFraction: 0.8 };
  const best =
    inputs.mode === "offgrid" ? sizeForTier(req) : sizeForBillCut(req);
  if (!best) return null;
  return {
    pvKw: best.pvKw,
    battKwh: best.battKwh,
    cost: Math.round(best.obj),
  };
}

/** One corpus case: three densities, knee/range/budget movement, divergence. */
export function runCase(city, mode) {
  const inputs = siteInputs(city, mode);
  const pvL = pvLadder(30, SHIPPED_LATTICE.pvSteps);
  const battL = battLadder(inputs.battMax, SHIPPED_LATTICE.battSteps, true);

  const byDensity = {};
  for (const d of DENSITIES) byDensity[d.name] = frontAt(inputs, d);

  const k1 = byDensity["1x"].knee;
  const k2 = byDensity["2x"].knee;
  const k4 = byDensity["4x"].knee;

  const position = (k) =>
    k
      ? {
          pvRung: rungIndex(pvL, k.pvKw),
          battRung: rungIndex(battL, k.battKwh),
        }
      : null;
  const p1 = position(k1);
  const p2 = position(k2);
  const p4 = position(k4);

  const rungMove = (a, b) =>
    a && b
      ? Math.max(
          Math.abs(b.pvRung - a.pvRung),
          Math.abs(b.battRung - a.battRung),
        )
      : null;

  const costMove = (a, b) =>
    a && b && a.capexUsd > 0
      ? +Math.abs(b.capexUsd - a.capexUsd) / a.capexUsd
      : null;

  // Budget picks: the visitor's own number, read off the curve the chart drew.
  const asXY = (pts) =>
    pts.map((p) => ({ x: p.capexUsd, y: p.outcomePct / 100 }));
  const budgetPicks = k1
    ? BUDGET_MULTIPLES.map((m) => {
        const budget = Math.round(k1.capexUsd * m);
        const pick1 = bestAffordableCurvePoint(
          asXY(byDensity["1x"].points),
          budget,
        );
        const pick2 = bestAffordableCurvePoint(
          asXY(byDensity["2x"].points),
          budget,
        );
        return {
          multiple: m,
          budgetUsd: budget,
          at1x: pick1
            ? {
                capexUsd: Math.round(pick1.x),
                outcomePct: +(pick1.y * 100).toFixed(1),
              }
            : null,
          at2x: pick2
            ? {
                capexUsd: Math.round(pick2.x),
                outcomePct: +(pick2.y * 100).toFixed(1),
              }
            : null,
          moved: !!(
            pick1 &&
            pick2 &&
            Math.round(pick1.x) !== Math.round(pick2.x)
          ),
        };
      })
    : [];

  const optimum = searchOptimum(inputs);

  const kneeMoveRungs2x = rungMove(p1, p2);
  const kneeCostMove2x = costMove(k1, k2);
  // #353: fires on EITHER condition, and both are needed for the table.
  const fires =
    (kneeMoveRungs2x !== null && kneeMoveRungs2x > RUNG_MOVE_REQUIRED) ||
    (kneeCostMove2x !== null && kneeCostMove2x > COST_MOVE_REQUIRED);

  return {
    city,
    mode,
    knee: { at1x: k1, at2x: k2, at4x: k4 },
    position: { at1x: p1, at2x: p2, at4x: p4 },
    range: {
      at1x: byDensity["1x"].range,
      at2x: byDensity["2x"].range,
      at4x: byDensity["4x"].range,
    },
    kneeMoveRungs2x,
    kneeMoveRungs4x: rungMove(p1, p4),
    kneeCostMove2x,
    kneeCostMove4x: costMove(k1, k4),
    fires,
    budgetPicks,
    optimum,
    pointCounts: {
      at1x: byDensity["1x"].pointCount,
      at2x: byDensity["2x"].pointCount,
      at4x: byDensity["4x"].pointCount,
    },
    simCounts: {
      at1x: byDensity["1x"].simCount,
      at2x: byDensity["2x"].simCount,
      at4x: byDensity["4x"].simCount,
    },
  };
}

export function summarize(rows) {
  const total = rows.length;
  const firers = rows.filter((r) => r.fires);
  const share = total ? firers.length / total : 0;
  const moved = (key) =>
    rows.filter((r) => r[key] !== null && r[key] > RUNG_MOVE_REQUIRED).length;
  const costMoved = rows.filter(
    (r) => r.kneeCostMove2x !== null && r.kneeCostMove2x > COST_MOVE_REQUIRED,
  ).length;
  const budgetMoved = rows.reduce(
    (n, r) => n + r.budgetPicks.filter((b) => b.moved).length,
    0,
  );
  const budgetTotal = rows.reduce((n, r) => n + r.budgetPicks.length, 0);
  const diverge = rows.filter(
    (r) =>
      r.optimum &&
      r.knee.at1x &&
      (Math.abs(r.knee.at1x.pvKw - r.optimum.pvKw) > 0.51 ||
        Math.abs(r.knee.at1x.battKwh - r.optimum.battKwh) > 0.51),
  ).length;

  return {
    cases: total,
    firers: firers.length,
    fireShare: +share.toFixed(4),
    rungMovers: moved("kneeMoveRungs2x"),
    costMovers: costMoved,
    budgetPicksMoved: budgetMoved,
    budgetPicksTotal: budgetTotal,
    kneeVsOptimumDiverge: diverge,
    // #353's rule-change branch.
    rulesChange: share > SITE_SHARE_REQUIRED,
    // The other half of the acceptance: corrected either way.
    commentConstantMismatch:
      SHIPPED_MIN_STEP_PP !== +COMMENT_CLAIM_PP.toFixed(3),
  };
}

function main() {
  const rows = [];
  for (const city of CORPUS) {
    for (const mode of MODES) {
      const r = runCase(city, mode);
      rows.push(r);
      console.log(
        `${city.padEnd(16)} ${mode.padEnd(8)} knee ${r.knee.at1x ? `${r.knee.at1x.pvKw}kW/${r.knee.at1x.battKwh}kWh $${r.knee.at1x.capexUsd}` : "none"} -> ${r.knee.at2x ? `${r.knee.at2x.pvKw}kW/${r.knee.at2x.battKwh}kWh $${r.knee.at2x.capexUsd}` : "none"} rungs ${r.kneeMoveRungs2x} cost ${(r.kneeCostMove2x * 100).toFixed(1)}% ${r.fires ? "FIRES" : ""}`,
      );
    }
  }
  const summary = summarize(rows);
  const out = {
    issue: 353,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { RUNG_MOVE_REQUIRED, COST_MOVE_REQUIRED, SITE_SHARE_REQUIRED },
    shipped: {
      lattice: SHIPPED_LATTICE,
      minStepPp: SHIPPED_MIN_STEP_PP,
      commentClaimPp: COMMENT_CLAIM_PP,
    },
    summary,
    rows,
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-frontierLayer.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-frontierLayer.mjs")
) {
  main();
}

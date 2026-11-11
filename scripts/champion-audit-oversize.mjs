// Champion Audit #348 - the oversize-bank adoption strategy.
//
// THE QUESTION. `evaluateOversizeOptimization` decides whether to sell a bigger
// bank now (zero replacements over 20 years) instead of a standard bank plus
// swaps. It screens with an ESTIMATE - the standard bank's own annual
// throughput projected onto the oversized bank - and only a system that passes
// the screen gets the verified second look. When it does pass, the adoption
// block grows the bank x1.25 up to six times and stops at the first size whose
// fresh simulation shows zero replacements. Two defects follow from that shape,
// and #348 names both:
//
//   (a) SCREEN. Throughput shifts with bank size, so the estimate can say
//       "swaps are cheaper" for a system where a verified oversize actually
//       wins. Those systems are never looked at.
//   (b) LADDER. x1.25 steps land on the first zero-swap size ABOVE the direct
//       computation, so an adopted bank can be larger - and costlier in capex -
//       than the zero-swap size it was trying to reach.
//
// BOTH SEARCHES CARRY THE MECHANISM, so both are measured: `sizeForTier`
// (off-grid reliability) at line ~698 and `sizeForBillCut` (grid-tie) at line
// ~1196. A finding from one is not a finding about the other.
//
// POLICIES, ONE OBJECTIVE. Every policy is replayed through the shipped search,
// so the comparison is policy-only and the engine is not reimplemented:
//
//   champion      = the shipped rule (oversizeStrategy: true)
//   neverOversize = oversizeStrategy: false. Not a straw man: this is also
//                   exactly the PRE-ADOPTION pick, which is what makes the
//                   challenger measurable without touching the engine.
//   directZeroSwap= that pick, then the zero-swap bank computed DIRECTLY
//                   (annual throughput / the zero-swap cycle rate) instead of by
//                   the x1.25 ladder, verified on a fresh simulation, PV
//                   re-optimised, adopted only if cheaper.
//
// The oracle is an exhaustive lattice over the same envelope at the same
// objective and feasibility rule. #347 recorded that a lattice control can read
// BETTER than the search purely from grid resolution, so regret is reported
// signed and a negative value is disclosed as the artifact it is, not clamped.
//
// Run: node scripts/champion-audit-oversize.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-oversize.json

import { writeFileSync } from "node:fs";

import {
  sizeForTier,
  simulate,
  simulateOffset,
  billCutFraction,
  CHEMISTRIES,
  RELIABILITY_TIERS,
} from "../assets/js/sizing/engine.js";
import { capacityScaleFor } from "../assets/js/sizing/chem-model.js";
import {
  batteryReplacements,
  lifetimeCostUsd,
  HORIZON_YEARS,
} from "../assets/js/sizing/money.js";

import {
  buildSite,
  runCase as billCutRunCase,
} from "./champion-audit-sizeForBillCut.mjs";

// Acceptance, verbatim from #348.
const MEAN_CUT_REQUIRED = 0.01; // challenger must cut mean lifetime cost >=1%
const NO_CASE_WORSE_BY = 0.005; // and no case worse by more than 0.5%

// The challenger scans PV on the SAME grid the published #347 control used
// (floor 0.05, step 0.25), so a grid-resolution difference can never be
// mistaken for a policy difference. Its first version used a 0.5 kW grid and
// missed the winning point at 1.55 kW entirely.
const CONTROL_PV_FLOOR = 0.05;
const CONTROL_PV_STEP = 0.25;
const PV_STEP = 0.5;
const BATT_STEP = 1;
const PV_MAX = 30;
const TIER_BATT_MAX = 300; // run.js offgridBattMax
const GRIDTIE_BATT_MAX = 150; // run.js effectiveBattMax

/** Per-case lifetime cost, the searches' own objective. */
export function objectiveAt(site, chemistry, pvKw, battKwh, result, years) {
  const cyclesPerYear = result.cyclesEquivalent / years;
  const replacements = batteryReplacements(
    cyclesPerYear,
    CHEMISTRIES[chemistry].cyclesTo80,
  );
  const battMid = site.battPerKwh(chemistry);
  const { total } = lifetimeCostUsd({
    capexMidUsd:
      pvKw * 1000 * site.costPerWpv +
      pvKw * site.costPerKwInv +
      battKwh * battMid,
    battKwhUsable: battKwh,
    battPriceMidPerKwh: battMid,
    replacements,
    laborPerKwh: site.laborPerKwh,
  });
  return { total, replacements };
}

/**
 * The direct zero-swap bank size for a given (point, simulation): the bank that
 * makes annual throughput <= cyclesTo80 / years, computed in one division
 * instead of by stepping x1.25. This is the cure for hypothesis (b) reduced to
 * a closed form.
 */
export function directZeroSwapKwh({
  cyclesEquivalent,
  battKwh,
  cyclesTo80,
  years,
  horizonYears = HORIZON_YEARS,
}) {
  // The horizon here is the fixed cost horizon, NOT the simulation window: the
  // shipped code divides by a hardcoded 20 (`chem.cyclesTo80 / 20`) while
  // `years` may be 1 for a one-year series. Using `years` as the horizon made
  // this harness compute a target of 1 kWh for the bill-cut leg, which is how
  // its first pass reported a false "zero_swap_unreachable" on Nairobi.
  const annualThroughputDc = (cyclesEquivalent / years) * battKwh;
  const maxCyclesForZeroSwap = cyclesTo80 / horizonYears;
  return Math.ceil(annualThroughputDc / maxCyclesForZeroSwap);
}

/**
 * The challenger. Takes the PRE-ADOPTION pick, computes the zero-swap bank
 * directly, verifies it on a fresh simulation (throughput shifts with bank
 * size, so the closed form is a starting point, not an answer), shaves PV and
 * adopts only if the result is cheaper on the same objective.
 */
export function applyDirectZeroSwap({ common, feasibility, pick, site }) {
  const { sim, meets } = feasibility;
  const years = common.years;
  const chem = CHEMISTRIES[common.chemistry];
  const start = objectiveAt(
    site,
    common.chemistry,
    pick.pvKw,
    pick.battKwh,
    pick.result,
    years,
  );
  if (start.replacements === 0) {
    return {
      pvKw: pick.pvKw,
      battKwh: pick.battKwh,
      cost: start.total,
      adopted: false,
      reason: "already_zero_swap",
    };
  }

  const target = directZeroSwapKwh({
    cyclesEquivalent: pick.result.cyclesEquivalent,
    battKwh: pick.battKwh,
    cyclesTo80: chem.cyclesTo80,
    years,
  });

  const zeroSwap = (r) =>
    batteryReplacements(r.cyclesEquivalent / years, chem.cyclesTo80) === 0;

  // The closed form is a starting point, not the answer: at a bank just large
  // enough for zero swaps the constraint can force a much bigger array, so a
  // slightly LARGER bank may be cheaper overall. Sweep a bounded window above
  // the closed-form size (window x one PV row each) rather than committing to
  // the first zero-swap bank, which is what the shipped x1.25 ladder does.
  // The window opens BOTH ways. A larger array lowers cycling, so the true
  // zero-swap optimum can sit BELOW the closed-form size derived from the
  // pre-adoption point's throughput - which is exactly Nairobi, where the
  // closed form says 8 kWh and the cheapest zero-swap system is 7 kWh at a
  // slightly larger array.
  const WINDOW = Number(common.zeroSwapWindow ?? 12);
  const b0 = Math.min(Math.max(target, pick.battKwh + 1), common.battMax);
  const bLo = Math.max(common.battStep, b0 - WINDOW);
  const bHi = Math.min(common.battMax, b0 + WINDOW);
  let bestZero = null;
  for (let bTry = bLo; bTry <= bHi; bTry += common.battStep) {
    for (
      let p = CONTROL_PV_FLOOR;
      p <= common.pvMax + 1e-9;
      p = +(p + CONTROL_PV_STEP).toFixed(4)
    ) {
      const cand = sim(p, bTry);
      if (!meets(cand) || !zeroSwap(cand)) continue;
      const cost = objectiveAt(site, common.chemistry, p, bTry, cand, years);
      if (!bestZero || cost.total < bestZero.cost) {
        bestZero = { pvKw: p, battKwh: bTry, cost: cost.total };
      }
    }
  }
  if (bestZero && bestZero.cost < start.total) {
    return {
      pvKw: bestZero.pvKw,
      battKwh: bestZero.battKwh,
      cost: bestZero.cost,
      adopted: true,
      reason: "verified_cheaper",
      savingsUsd: start.total - bestZero.cost,
      target,
    };
  }
  return {
    pvKw: pick.pvKw,
    battKwh: pick.battKwh,
    cost: start.total,
    adopted: false,
    reason: bestZero ? "verified_more_expensive" : "zero_swap_unreachable",
    target,
    bestZeroKwh: bestZero ? bestZero.battKwh : null,
  };
}

// ── Leg A: off-grid tier search ─────────────────────────────────────────────

const TIER_CORPUS = [
  { city: "Nairobi, Kenya", kwhPerDay: 8, chemistry: "lfp" },
  { city: "Honolulu, USA", kwhPerDay: 20, chemistry: "lfp" },
  { city: "Phoenix, USA", kwhPerDay: 30, chemistry: "lfp" },
  { city: "London, UK", kwhPerDay: 10, chemistry: "lfp" },
  { city: "Berlin, Germany", kwhPerDay: 8, chemistry: "naion" },
  { city: "Delhi, India", kwhPerDay: 20, chemistry: "naion" },
  { city: "Sydney, Australia", kwhPerDay: 12, chemistry: "lfp" },
  { city: "Cairo, Egypt", kwhPerDay: 18, chemistry: "naion" },
];
// tier99 is the default auto tier (run.js `repTierId = ... : "tier99"`); the
// edge tiers run on a subset so the finding is not tier99-only.
const TIER_IDS = ["tier100", "tier99", "tier95"];
const EDGE_SUBSET = new Set(["Nairobi, Kenya", "London, UK", "Delhi, India"]);

function tierCommon(entry, tier) {
  const site = buildSite(entry.city, entry.kwhPerDay);
  const common = {
    e1kw: site.e1kw,
    loadWh: site.loadWh,
    tempsC: site.tempsC,
    chemistry: entry.chemistry,
    maxUnmetHoursPerYear: tier.maxUnmetHoursPerYear,
    years: 20,
    costPerWpv: site.costPerWpv,
    costPerKwhBatt: site.battPerKwh(entry.chemistry),
    costPerKwInv: site.costPerKwInv,
    pvMax: PV_MAX,
    battMax: TIER_BATT_MAX,
    pvStep: PV_STEP,
    battStep: BATT_STEP,
    capacityScale: capacityScaleFor(entry.chemistry, site.meanTempC),
    laborPerKwh: site.laborPerKwh,
    invMinKw: 0,
  };
  const strict = common.maxUnmetHoursPerYear <= 0;
  const sim = (pv, batt) =>
    simulate({
      pvKw: pv,
      battKwhUsable: batt,
      e1kw: common.e1kw,
      loadWh: common.loadWh,
      chemistry: common.chemistry,
      tempsC: common.tempsC,
      capacityScale: common.capacityScale,
      unmetThresholdWh: strict ? 0.1 : 1,
    });
  const meets = (r) =>
    r.worstYearUnmetHours <= common.maxUnmetHoursPerYear + 1e-9;
  return {
    site: { ...site, battPerKwh: () => common.costPerKwhBatt },
    common,
    feasibility: { sim, meets },
  };
}

// ── Leg B: grid-tie bill-cut search (the #347 corpus, reused deliberately so
// the two audits are read on the same cases) ────────────────────────────────

const BILL_CUT_CORPUS = [
  {
    city: "Honolulu, USA",
    kwhPerDay: 10,
    chemistry: "lfp",
    regime: "import-only",
    minFraction: 0.6,
  },
  {
    city: "Phoenix, USA",
    kwhPerDay: 20,
    chemistry: "lfp",
    regime: "import-only",
    minFraction: 0.95,
  },
  {
    city: "London, UK",
    kwhPerDay: 10,
    chemistry: "lfp",
    regime: "net-metered",
    minFraction: 0.8,
    tariff: 0.3,
    exportRate: 0.3,
  },
  {
    city: "Berlin, Germany",
    kwhPerDay: 8,
    chemistry: "naion",
    regime: "net-metered",
    minFraction: 0.95,
    tariff: 0.32,
    exportRate: 0.08,
  },
  {
    city: "Delhi, India",
    kwhPerDay: 15,
    chemistry: "lfp",
    regime: "net-metered-over100",
    minFraction: 1.2,
    tariff: 0.12,
    exportRate: 0.12,
  },
  {
    city: "Nairobi, Kenya",
    kwhPerDay: 5,
    chemistry: "lfp",
    regime: "surplus-physical",
    minFraction: 1.2,
    tariff: 0.2,
    exportRate: 0,
  },
  {
    city: "Sydney, Australia",
    kwhPerDay: 12,
    chemistry: "lfp",
    regime: "peak-only",
    minFraction: 0.1,
    pvMax: 0,
  },
  {
    city: "Cairo, Egypt",
    kwhPerDay: 18,
    chemistry: "lfp",
    regime: "peak-only",
    minFraction: 0.2,
    pvMax: 0,
  },
];

export function billCutCommon(entry) {
  const site = buildSite(entry.city, entry.kwhPerDay);
  const chemistry = entry.chemistry;
  const capacityScale = capacityScaleFor(chemistry, site.meanTempC);
  const loadTotal = [...site.loadWh].reduce((a, b) => a + b, 0);
  const f = entry.minFraction;
  const tariff = entry.tariff ?? null;
  const exportRate = entry.exportRate ?? null;
  const hasCredit = tariff > 0 && exportRate > 0;
  const surplusTarget = f > 1;
  const importBudget = surplusTarget ? loadTotal * 0.005 : loadTotal * (1 - f);
  const pvMax = entry.pvMax ?? PV_MAX;
  const peakOnly = pvMax === 0;

  const cutOf = (r) =>
    billCutFraction({
      importedWh: r.importedWh,
      curtailedWh: r.curtailedWh,
      loadTotalWh: loadTotal,
      tariff,
      exportRate,
    });
  // Replicated exactly from sizeForBillCut: three constraint definitions
  // behind one user-facing target.
  const meets = peakOnly
    ? (r) => r.peakOffsetFraction + 1e-9 >= f
    : surplusTarget && !hasCredit
      ? (r) =>
          r.importedWh <= importBudget + 1e-6 &&
          r.curtailedWh >= loadTotal * (f - 1) - 1e-6
      : (r) => cutOf(r) + 1e-9 >= f;

  const common = {
    e1kw: site.e1kw,
    loadWh: site.loadWh,
    tempsC: site.tempsC,
    chemistry,
    minFraction: f,
    tariff,
    exportRate,
    years: 1,
    costPerWpv: site.costPerWpv,
    costPerKwhBatt: site.battPerKwh(chemistry),
    costPerKwInv: site.costPerKwInv,
    pvMax,
    battMax: GRIDTIE_BATT_MAX,
    pvStep: PV_STEP,
    battStep: BATT_STEP,
    capacityScale,
    laborPerKwh: site.laborPerKwh,
    invMinKw: 0,
  };
  const sim = (pv, batt) =>
    simulateOffset({
      pvKw: pv,
      battKwhUsable: batt,
      e1kw: common.e1kw,
      loadWh: common.loadWh,
      chemistry,
      tempsC: common.tempsC,
      capacityScale,
    });
  return {
    site: { ...site, battPerKwh: () => common.costPerKwhBatt },
    common,
    feasibility: { sim, meets },
  };
}

// ── Measurement ────────────────────────────────────────────────────────────

/** Exhaustive lattice over the same envelope - the floor every policy faces. */
function oracleLattice({ common, feasibility, site }) {
  const { sim, meets } = feasibility;
  const rows = common.pvMax === 0 ? [0] : null;
  let best = null;
  for (let b = common.battStep; b <= common.battMax; b += common.battStep) {
    if (rows && b === 0) continue;
    if (rows) {
      const r = sim(0, b);
      if (!meets(r)) continue;
      const { total } = objectiveAt(
        site,
        common.chemistry,
        0,
        b,
        r,
        common.years,
      );
      if (!best || total < best.cost)
        best = { pvKw: 0, battKwh: b, cost: total };
      continue;
    }
    for (
      let p = common.pvStep;
      p <= common.pvMax + 1e-9;
      p = +(p + common.pvStep).toFixed(4)
    ) {
      const r = sim(p, b);
      if (!meets(r)) continue;
      const { total } = objectiveAt(
        site,
        common.chemistry,
        p,
        b,
        r,
        common.years,
      );
      if (!best || total < best.cost)
        best = { pvKw: p, battKwh: b, cost: total };
    }
  }
  return best;
}

/**
 * One case: champion, never-oversize, the direct-zero-swap challenger, and the
 * lattice. `runSearch` is the shipped search, injected so both legs share this
 * arithmetic exactly.
 */
export function measureCase({ label, common, feasibility, site, runSearch }) {
  const champion = runSearch({ ...common, oversizeStrategy: true });
  const never = runSearch({ ...common, oversizeStrategy: false });
  if (!champion || !never) {
    return { label, note: "search returned null", champion, never };
  }

  const champObj = objectiveAt(
    site,
    common.chemistry,
    champion.pvKw,
    champion.battKwh,
    champion.result,
    common.years,
  );
  const neverObj = objectiveAt(
    site,
    common.chemistry,
    never.pvKw,
    never.battKwh,
    never.result,
    common.years,
  );
  const challenger = applyDirectZeroSwap({
    common,
    feasibility,
    pick: never,
    site,
  });
  const floor = oracleLattice({ common, feasibility, site });

  // Did the shipped rule change anything at all?
  const adoptionFired =
    champion.pvKw !== never.pvKw || champion.battKwh !== never.battKwh;

  // Ladder attribution: when the champion adopted, how far above the DIRECT
  // zero-swap size did it land?
  let ladderOverKwh = null;
  if (adoptionFired && champObj.replacements === 0) {
    const direct = directZeroSwapKwh({
      cyclesEquivalent: never.result.cyclesEquivalent,
      battKwh: never.battKwh,
      cyclesTo80: CHEMISTRIES[common.chemistry].cyclesTo80,
      years: common.years,
    });
    ladderOverKwh = champion.battKwh - direct;
  }

  return {
    label,
    champion: {
      pvKw: champion.pvKw,
      battKwh: champion.battKwh,
      cost: +champObj.total.toFixed(2),
      replacements: champObj.replacements,
      scenario: champion.oversizeScenario ?? null,
    },
    neverOversize: {
      pvKw: never.pvKw,
      battKwh: never.battKwh,
      cost: +neverObj.total.toFixed(2),
      replacements: neverObj.replacements,
    },
    directZeroSwap: {
      pvKw: challenger.pvKw,
      battKwh: challenger.battKwh,
      cost: +challenger.cost.toFixed(2),
      adopted: challenger.adopted,
      reason: challenger.reason,
      target: challenger.target ?? null,
    },
    oracle: floor
      ? {
          pvKw: floor.pvKw,
          battKwh: floor.battKwh,
          cost: +floor.cost.toFixed(2),
        }
      : null,
    adoptionFired,
    ladderOverKwh,
    championRegret: floor
      ? +((champObj.total - floor.cost) / floor.cost).toFixed(6)
      : null,
    challengerRegret: floor
      ? +((challenger.cost - floor.cost) / floor.cost).toFixed(6)
      : null,
    challengerVsChampion: +(
      (challenger.cost - champObj.total) /
      champObj.total
    ).toFixed(6),
    // Hypothesis (a): the shipped rule adopted nothing, yet a cheaper bank
    // exists in the lattice.
    screenSkipped:
      !adoptionFired && floor !== null && floor.cost < champObj.total - 1e-9,
  };
}

/**
 * Leg B's measurement. The champion/off/control triple comes from the #347
 * harness unchanged, so this audit is read against the SAME 0.25 kW lattice
 * that the published bill-cut receipt used - a second, slightly coarser lattice
 * of my own would disagree with it on grid resolution alone and turn a real
 * finding into a measurement artifact. Only the challenger is new here.
 */
export function measureBillCutCase(entry) {
  const built = billCutCommon(entry);
  const base = billCutRunCase(entry);
  if (!base.champion || !base.championSearchOnly) {
    return {
      label: `${entry.city} ${entry.regime}`,
      note: "search returned null",
    };
  }
  const off = base.championSearchOnly;
  const pick = {
    pvKw: off.pvKw,
    battKwh: off.battKwh,
    result: built.feasibility.sim(off.pvKw, off.battKwh),
  };
  const champObj = objectiveAt(
    built.site,
    built.common.chemistry,
    base.champion.pvKw,
    base.champion.battKwh,
    built.feasibility.sim(base.champion.pvKw, base.champion.battKwh),
    built.common.years,
  );
  const neverObj = objectiveAt(
    built.site,
    built.common.chemistry,
    off.pvKw,
    off.battKwh,
    pick.result,
    built.common.years,
  );
  const challenger = applyDirectZeroSwap({
    common: built.common,
    feasibility: built.feasibility,
    pick,
    site: built.site,
  });
  const controlCost = base.control.lifetimeCostUsd;
  const adoptionFired =
    base.champion.pvKw !== off.pvKw || base.champion.battKwh !== off.battKwh;
  const ladderOverKwh =
    adoptionFired && champObj.replacements === 0
      ? base.champion.battKwh -
        directZeroSwapKwh({
          cyclesEquivalent: pick.result.cyclesEquivalent,
          battKwh: off.battKwh,
          cyclesTo80: CHEMISTRIES[built.common.chemistry].cyclesTo80,
          years: built.common.years,
        })
      : null;

  return {
    label: `${entry.city} ${entry.kwhPerDay}kWh/d ${entry.regime} ${entry.minFraction}`,
    champion: {
      pvKw: base.champion.pvKw,
      battKwh: base.champion.battKwh,
      cost: +champObj.total.toFixed(2),
      replacements: champObj.replacements,
      scenario: base.champion.oversizeScenario ?? null,
    },
    neverOversize: {
      pvKw: off.pvKw,
      battKwh: off.battKwh,
      cost: +neverObj.total.toFixed(2),
      replacements: neverObj.replacements,
    },
    directZeroSwap: {
      pvKw: challenger.pvKw,
      battKwh: challenger.battKwh,
      cost: +challenger.cost.toFixed(2),
      adopted: challenger.adopted,
      reason: challenger.reason,
      target: challenger.target ?? null,
    },
    oracle: {
      pvKw: base.control.pvKw,
      battKwh: base.control.battKwh,
      cost: controlCost,
    },
    adoptionFired,
    // The mechanism was even APPLICABLE only if the pre-adoption pick needed a
    // swap. A case with zero replacements tests nothing about adoption.
    swapBearing: neverObj.replacements > 0,
    ladderOverKwh,
    championRegret: +((champObj.total - controlCost) / controlCost).toFixed(6),
    challengerRegret: +((challenger.cost - controlCost) / controlCost).toFixed(
      6,
    ),
    challengerVsChampion: +(
      (challenger.cost - champObj.total) /
      champObj.total
    ).toFixed(6),
    screenSkipped: !adoptionFired && controlCost < champObj.total - 1e-9,
  };
}

/** Acceptance arithmetic, split out so it is testable without a sweep. */
export function summarize(cases) {
  const rows = cases.filter(
    (c) =>
      c.champion &&
      c.neverOversize &&
      c.championRegret !== null &&
      c.championRegret !== undefined,
  );
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const champRegrets = rows.map((c) => c.championRegret);
  const chalRegrets = rows.map((c) => c.challengerRegret);
  const deltas = rows.map((c) => c.challengerVsChampion);
  const meanDelta = mean(deltas);
  // Sign discipline, and the mirror of the bug #347 found in its own harness:
  // a delta is challenger - champion, so NEGATIVE means cheaper. The "worst"
  // case is therefore the LARGEST delta, not the smallest - taking the min
  // would score a 2% IMPROVEMENT as the worst case and refuse a winner.
  const worstDelta = Math.max(...deltas);
  const bestDelta = Math.min(...deltas);
  return {
    cases: rows.length,
    meanChampionRegret: +mean(champRegrets).toFixed(6),
    meanChallengerRegret: +mean(chalRegrets).toFixed(6),
    // Negative meanDelta = the challenger is cheaper on average.
    meanDeltaVsChampion: +meanDelta.toFixed(6),
    worstCaseDeltaVsChampion: +worstDelta.toFixed(6),
    bestCaseDeltaVsChampion: +bestDelta.toFixed(6),
    // #348's rule, in the direction the issue states it: cut mean cost >=1%
    // with no case worse by more than 0.5%.
    challengerQualifies:
      meanDelta <= -MEAN_CUT_REQUIRED && worstDelta <= NO_CASE_WORSE_BY,
    // The no-change branch: the champion is already inside the same margin.
    championWithinMargin:
      Math.abs(mean(champRegrets)) < MEAN_CUT_REQUIRED &&
      rows.every((c) => c.championRegret <= NO_CASE_WORSE_BY),
    adoptionFiredCases: rows.filter((c) => c.adoptionFired).length,
    // Cases where adoption could even apply: the pre-adoption pick needs a
    // swap over the horizon. This is the denominator that makes
    // `adoptionFiredCases` meaningful.
    swapBearingCases: rows.filter((c) => c.neverOversize.replacements > 0)
      .length,
    adoptedOfSwapBearing: rows.filter(
      (c) => c.neverOversize.replacements > 0 && c.adoptionFired,
    ).length,
    screenSkippedCases: rows.filter((c) => c.screenSkipped).length,
    ladderOvershootCases: rows.filter(
      (c) => c.ladderOverKwh !== null && c.ladderOverKwh > 0,
    ).length,
    maxLadderOverKwh: rows.reduce(
      (m, c) => Math.max(m, c.ladderOverKwh ?? 0),
      0,
    ),
  };
}

function report(cases, title) {
  console.log(`\n== ${title} ==`);
  for (const c of cases) {
    if (!c.champion) {
      console.log(`${c.label}: ${c.note}`);
      continue;
    }
    console.log(
      `${c.label}: champ ${c.champion.pvKw}/${c.champion.battKwh} $${c.champion.cost} [${c.champion.scenario}] | ` +
        `off ${c.neverOversize.pvKw}/${c.neverOversize.battKwh} $${c.neverOversize.cost} r=${c.neverOversize.replacements} | ` +
        `direct ${c.directZeroSwap.pvKw}/${c.directZeroSwap.battKwh} $${c.directZeroSwap.cost} (${c.directZeroSwap.reason}) | ` +
        `oracle $${c.oracle?.cost} | regret ${c.championRegret} vs${c.challengerRegret} | fired=${c.adoptionFired} skipped=${c.screenSkipped}`,
    );
  }
  const s = summarize(cases);
  console.log("SUMMARY", JSON.stringify(s));
  return s;
}

function main() {
  const tierCases = [];
  for (const entry of TIER_CORPUS) {
    for (const tierId of TIER_IDS) {
      if (tierId !== "tier99" && !EDGE_SUBSET.has(entry.city)) continue;
      const tier = RELIABILITY_TIERS.find((t) => t.id === tierId);
      const built = tierCommon(entry, tier);
      const started = Date.now();
      const row = measureCase({
        label: `${entry.city} ${entry.kwhPerDay}kWh/d ${tierId} ${entry.chemistry}`,
        ...built,
        runSearch: sizeForTier,
      });
      row.ms = Date.now() - started;
      tierCases.push(row);
    }
  }
  const tierSummary = report(tierCases, "LEG A - off-grid tier search");

  const billCases = [];
  for (const entry of BILL_CUT_CORPUS) {
    const started = Date.now();
    const row = measureBillCutCase(entry);
    row.ms = Date.now() - started;
    billCases.push(row);
  }
  const billSummary = report(billCases, "LEG B - grid-tie bill-cut search");

  const all = summarize([...tierCases, ...billCases]);
  const out = {
    issue: 348,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { MEAN_CUT_REQUIRED, NO_CASE_WORSE_BY },
    legs: { tier: tierSummary, billCut: billSummary },
    summary: all,
    cases: [...tierCases, ...billCases],
  };
  const path = "docs/lane/data-reads/2026-11-10-champion-audit-oversize.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log("\nCOMBINED", JSON.stringify(all, null, 2));
  console.log("wrote", path);
}

// Only run the corpus when invoked directly; the regression test imports the
// pieces above and must not launch an exhaustive multi-leg sweep on import.
if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-oversize.mjs")
) {
  main();
}

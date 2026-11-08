// Champion Audit #346 - off-grid reliability-tier sizing search (`sizeForTier`).
//
// THE QUESTION. `sizeForTier` is a lattice scan bounded by two truncation
// windows: PV probing stops 4 steps past the first feasible PV in a battery row,
// and battery rows stop 15 steps past the best-so-far bank. Both windows assume
// the lifetime-cost objective is near-unimodal in each dimension, but the engine
// itself notes that cycling is not monotonic in PV. This harness measures the
// regret those windows actually cost, by replaying the champion (the shipped
// search, unchanged) against an exhaustive control over the same lattice.
//
// THE CONTROL IS NOT A CANDIDATE SHIP. It evaluates every lattice point with no
// truncation and keeps the cheapest feasible one. It is a lower bound on the
// achievable lifetime cost, so `champion regret` is exact within lattice
// granularity, not an estimate.
//
// ACCEPTANCE (from #346). A challenger (wider or exact search) ships only if
// champion regret exceeds 2% of lifetime cost on more than 5% of corpus cases.
// If regret is <= 2% everywhere, the item closes as no-change with this corpus
// published - which is a complete close under the program's rule 3.
//
// Run: node scripts/champion-audit-sizeForTier.mjs
// Out: docs/lane/data-reads/2026-11-08-champion-audit-sizeForTier.json

import { writeFileSync } from "node:fs";

import {
  buildE1kw,
  capacityScaleFor,
  CHEMISTRIES,
  expandProfile,
  flatProfile,
  RELIABILITY_TIERS,
  simulate,
  sizeForTier,
} from "../assets/js/sizing/engine.js";
import {
  batteryReplacements,
  INSTALL_LABOR_PER_KWH_USABLE,
  lifetimeCostUsd,
} from "../assets/js/sizing/money.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import { OFFLINE_PROFILES } from "../assets/js/sizing/profiles.js";
import {
  estimateTariff,
  getScope,
  landedMidBattKwhFor,
} from "../assets/js/sizing/pricing.js";

// The lattice the shipped search uses by default. The control uses the identical
// lattice, so the only variable between them is the truncation windows.
const PV_STEP = 0.5;
const PV_MAX = 30;
const BATT_STEP = 1;
const BATT_MAX = 200;

const REGRET_LIMIT = 0.02; // 2% of lifetime cost
const CORPUS_FRACTION = 0.05; // more than 5% of cases must exceed it

const tier = (id) => RELIABILITY_TIERS.find((t) => t.id === id);

/** Ten cases across latitudes, clearness indices and loads, both chemistries. */
const CORPUS = [
  { city: "Honolulu, USA", kwhPerDay: 10, chemistry: "lfp", tier: "tier99" },
  { city: "Phoenix, USA", kwhPerDay: 20, chemistry: "lfp", tier: "tier100" },
  { city: "London, UK", kwhPerDay: 10, chemistry: "lfp", tier: "tier99" },
  { city: "Berlin, Germany", kwhPerDay: 8, chemistry: "naion", tier: "tier95" },
  { city: "Nairobi, Kenya", kwhPerDay: 5, chemistry: "lfp", tier: "tier95" },
  { city: "Delhi, India", kwhPerDay: 15, chemistry: "lfp", tier: "tier100" },
  {
    city: "Sydney, Australia",
    kwhPerDay: 12,
    chemistry: "lfp",
    tier: "tier99",
  },
  { city: "Oslo, Norway", kwhPerDay: 10, chemistry: "lfp", tier: "tier99" },
  {
    city: "Mexico City, Mexico",
    kwhPerDay: 6,
    chemistry: "naion",
    tier: "tier99",
  },
  { city: "Cairo, Egypt", kwhPerDay: 18, chemistry: "lfp", tier: "tier95" },
];

/** Fixture + the cost derivation run.js uses, so the objective is the shipped one. */
export function buildSite(city, kwhPerDay) {
  const profile = OFFLINE_PROFILES.find((p) => p.name === city);
  if (!profile) throw new Error(`unknown offline profile: ${city}`);
  const hours = synthesizeFromProfile(profile);
  const tempsC = hours.map((h) => h.tAmb);
  const meanTempC = tempsC.reduce((a, b) => a + b, 0) / tempsC.length;
  const landedScope = getScope("landed");
  const region = estimateTariff(profile.lat, profile.lon);
  const laborF = region.laborF ?? 1;
  const landedF = region.landedF ?? 1.1;
  return {
    e1kw: buildE1kw(hours),
    loadWh: expandProfile(flatProfile(kwhPerDay), hours.length),
    tempsC,
    meanTempC,
    laborPerKwh: INSTALL_LABOR_PER_KWH_USABLE.map((v) => v * laborF),
    costPerWpv: ((landedScope.pvPerW[0] + landedScope.pvPerW[1]) / 2) * landedF,
    battPerKwh: (chem) => landedMidBattKwhFor(chem, landedF),
    costPerKwInv:
      ((landedScope.invPerKw[0] + landedScope.invPerKw[1]) / 2) * landedF,
  };
}

/** True lifetime cost of one (pv, bank) point - the same objective the engine uses. */
export function lifetimeObjective(
  site,
  chemistry,
  pvKw,
  battKwh,
  cyclesEquivalent,
) {
  const replacements = batteryReplacements(
    cyclesEquivalent,
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
  return total;
}

const DEFAULT_ENVELOPE = {
  pvStep: PV_STEP,
  pvMax: PV_MAX,
  battStep: BATT_STEP,
  battMax: BATT_MAX,
};

export function runCase(entry, envelope = DEFAULT_ENVELOPE) {
  const { pvStep, pvMax, battStep, battMax } = envelope;
  const site = buildSite(entry.city, entry.kwhPerDay);
  const t = tier(entry.tier);
  const capacityScale = capacityScaleFor(entry.chemistry, site.meanTempC);
  const strict = t.maxUnmetHoursPerYear <= 0;
  const unmetThresholdWh = strict ? 0.1 : 1;

  const simulateAt = (pvKw, battKwh) =>
    simulate({
      pvKw,
      battKwhUsable: battKwh,
      e1kw: site.e1kw,
      loadWh: site.loadWh,
      chemistry: entry.chemistry,
      tempsC: site.tempsC,
      capacityScale,
      unmetThresholdWh,
    });
  const feasible = (r) =>
    r.worstYearUnmetHours <= t.maxUnmetHoursPerYear + 1e-9;

  const common = {
    e1kw: site.e1kw,
    loadWh: site.loadWh,
    tempsC: site.tempsC,
    chemistry: entry.chemistry,
    maxUnmetHoursPerYear: t.maxUnmetHoursPerYear,
    years: 1,
    costPerWpv: site.costPerWpv,
    costPerKwhBatt: site.battPerKwh(entry.chemistry),
    costPerKwInv: site.costPerKwInv,
    pvMax,
    battMax,
    pvStep,
    battStep,
    capacityScale,
    laborPerKwh: site.laborPerKwh,
  };

  const started = Date.now();
  const champ = sizeForTier(common);
  const championMs = Date.now() - started;

  if (!champ) {
    return {
      ...entry,
      note: "champion returned null - no feasible point inside the envelope",
      championMs,
    };
  }

  const championCost = lifetimeObjective(
    site,
    entry.chemistry,
    champ.pvKw,
    champ.battKwh,
    champ.result.cyclesEquivalent,
  );

  // Exhaustive control: every lattice point, no truncation windows.
  const controlStart = Date.now();
  let controlCost = Infinity;
  let controlPoint = null;
  let controlEvaluations = 0;
  for (let b = battStep; b <= battMax; b += battStep) {
    for (let p = pvStep; p <= pvMax; p += pvStep) {
      controlEvaluations++;
      const r = simulateAt(p, b);
      if (!feasible(r)) continue;
      const cost = lifetimeObjective(
        site,
        entry.chemistry,
        p,
        b,
        r.cyclesEquivalent,
      );
      if (cost < controlCost) {
        controlCost = cost;
        controlPoint = { pvKw: p, battKwh: b };
      }
    }
  }
  const controlMs = Date.now() - controlStart;

  const regret =
    controlCost > 0 ? (championCost - controlCost) / controlCost : 0;
  const championFeasible = feasible(simulateAt(champ.pvKw, champ.battKwh));

  return {
    ...entry,
    tierBudgetHours: t.maxUnmetHoursPerYear,
    champion: {
      pvKw: champ.pvKw,
      battKwh: champ.battKwh,
      lifetimeCostUsd: +championCost.toFixed(2),
      meetsConstraint: championFeasible,
      ms: championMs,
    },
    control: {
      pvKw: controlPoint?.pvKw ?? null,
      battKwh: controlPoint?.battKwh ?? null,
      lifetimeCostUsd: +controlCost.toFixed(2),
      evaluations: controlEvaluations,
      ms: controlMs,
    },
    regret: +regret.toFixed(6),
    regretUsd: +(championCost - controlCost).toFixed(2),
    samePoint:
      controlPoint !== null &&
      controlPoint.pvKw === champ.pvKw &&
      controlPoint.battKwh === champ.battKwh,
  };
}

function main() {
  // Wrapped, not passed bare: Array.map would hand each entry's index to the
  // envelope parameter, and the control would sweep an undefined lattice.
  const cases = CORPUS.map((entry) => runCase(entry));
  const measured = cases.filter((c) => c.champion);
  const overLimit = measured.filter((c) => c.regret > REGRET_LIMIT);
  const shareOver = measured.length ? overLimit.length / measured.length : 0;
  const maxRegret = measured.reduce((m, c) => Math.max(m, c.regret), 0);
  const championShips = shareOver > CORPUS_FRACTION;

  const verdict = championShips
    ? "CHALLENGER QUALIFIES - champion regret exceeds the 2% margin on more than 5% of corpus cases"
    : "NO CHANGE - champion regret is inside the 2% margin on the corpus, so the truncation windows stay";

  const report = {
    issue: 346,
    mechanism: "sizeForTier",
    generated: new Date().toISOString(),
    lattice: {
      pvStep: PV_STEP,
      pvMax: PV_MAX,
      battStep: BATT_STEP,
      battMax: BATT_MAX,
      evaluationsPerCase: measured[0]?.control.evaluations ?? 0,
    },
    acceptance: {
      regretLimit: REGRET_LIMIT,
      corpusFraction: CORPUS_FRACTION,
      casesMeasured: measured.length,
      casesOverLimit: overLimit.length,
      shareOverLimit: +shareOver.toFixed(4),
      maxRegret,
    },
    verdict,
    cases,
  };

  const out = "docs/lane/data-reads/2026-11-08-champion-audit-sizeForTier.json";
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`${out}`);
  console.log(
    `cases ${measured.length}, over ${(REGRET_LIMIT * 100).toFixed(0)}%: ${overLimit.length} (${(shareOver * 100).toFixed(1)}%), max regret ${(maxRegret * 100).toFixed(4)}%`,
  );
  for (const c of cases) {
    if (!c.champion) {
      console.log(`  ${c.city} ${c.kwhPerDay}kWh ${c.tier}: ${c.note}`);
      continue;
    }
    console.log(
      `  ${c.city} ${c.kwhPerDay}kWh ${c.chemistry} ${c.tier}: champion ${c.champion.pvKw}kW/${c.champion.battKwh}kWh $${c.champion.lifetimeCostUsd} vs control ${c.control.pvKw}kW/${c.control.battKwh}kWh $${c.control.lifetimeCostUsd} -> regret ${(c.regret * 100).toFixed(4)}% ($${c.regretUsd})`,
    );
  }
  console.log(verdict);
}

// Only run the corpus when invoked directly; the regression test imports the
// pieces above and must not launch a 10-case exhaustive sweep on import.
if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-sizeForTier.mjs")
) {
  main();
}

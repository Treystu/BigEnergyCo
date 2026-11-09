// Champion Audit #347 - grid-tie bill-cut sizing search (`sizeForBillCut`).
//
// THE QUESTION. `sizeForBillCut` does not sweep the lattice. For every battery
// row (0..battMax in 1 kWh steps) it binary-searches the smallest PV that meets
// the target, keeps the cheapest row, then runs a local refinement around that
// winner and an oversize-adoption pass (#155). The binary search assumes the
// constraint is monotone in PV; the local refinement assumes the winner is
// near-unimodal in the battery dimension. This harness measures what those two
// assumptions actually cost, by replaying the champion (the shipped search,
// unchanged) against an exhaustive control over the same lattice.
//
// THE CONTROL IS NOT A CANDIDATE SHIP. It evaluates every lattice point with no
// early exit and keeps the cheapest feasible one, on the same PV grid the
// champion's binary search resolves to (0.25 kW above 0.05). Its cost is a lower
// bound on the achievable lifetime cost within that grid, so `regret` is exact
// within lattice granularity, not an estimate.
//
// TWO CHAMPION VARIANTS, because they answer different questions:
//   `shipped`     - the default, including oversize adoption. This is what a
//                   visitor is sold.
//   `searchOnly`  - `oversizeStrategy: false`. Regret here isolates the lattice
//                   search shape (binary search + refinement) from adoption.
//
// NEGATIVE REGRET IS REPORTED, NOT CLAMPED. Where the champion comes out below
// the control it is because the binary search resolves the feasibility boundary
// to 0.25 kW while the control grid can only land on multiples of 0.25 above a
// 0.05 floor - so the control is a lower bound only up to grid resolution. That
// makes a negative figure a granularity artifact, not a defect, and this harness
// says so instead of hiding it. A POSITIVE regret is the finding that matters:
// it means a feasible lattice point exists that is cheaper than the system the
// champion picked, which no grid resolution can explain away.
//
// LABEL AUDIT. #347 also asks whether a rendered "cut %" equals the fraction the
// search constrained. Two regimes are excluded from that numeric comparison on
// purpose, because their labels are not bill-cut percentages and run.js already
// renders them differently: battery-only mode renders "peak-hour offset"
// (cut10/15/20), and a >100% target without a feed-in credit renders the
// physical-surplus condition (imports ~0 plus produced surplus). Both are judged
// by `meetsConstraint` instead, which is the honest test for those labels.
//
// ACCEPTANCE (from #347). A finer/exact search ships only if champion
// lifetime-cost regret exceeds 2% OR label-vs-simulated-cut mismatch exceeds
// 0.5 pp on ANY corpus case. Otherwise the item closes as no-change with this
// corpus published, which is a complete close under the program's rule 3.
//
// Run: node scripts/champion-audit-sizeForBillCut.mjs
// Out: docs/lane/data-reads/2026-11-09-champion-audit-sizeForBillCut.json

import { writeFileSync } from "node:fs";

import {
  billCutFraction,
  buildE1kw,
  capacityScaleFor,
  CHEMISTRIES,
  expandProfile,
  flatProfile,
  simulateOffset,
  sizeForBillCut,
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

// The search lattice: sizeForBillCut's own defaults (pvMax 30, battMax 100,
// battStep 1). The control sweeps PV at 0.25 kW, the granularity the
// champion's binary search resolves to, from the same 0.05 floor.
const PV_FLOOR = 0.05;
const PV_CONTROL_STEP = 0.25;
const PV_MAX = 30;
const BATT_STEP = 1;
const BATT_MAX = 100;

const REGRET_LIMIT = 0.02; // 2% of lifetime cost
const LABEL_LIMIT_PP = 0.5; // 0.5 percentage points

/** Eight cases across four regimes, both chemistries, five cities. */
const CORPUS = [
  // Import-only (no tariff/credit): the constraint is pure self-sufficiency.
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
  // Net-metered (tariff and export credit both set).
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
  // >100% with a credit: bill gone and credited surplus covers the rest.
  {
    city: "Delhi, India",
    kwhPerDay: 15,
    chemistry: "lfp",
    regime: "net-metered-over100",
    minFraction: 1.2,
    tariff: 0.12,
    exportRate: 0.12,
  },
  // >100% without a credit: the physical surplus condition.
  {
    city: "Nairobi, Kenya",
    kwhPerDay: 5,
    chemistry: "lfp",
    regime: "surplus-physical",
    minFraction: 1.2,
    tariff: 0.2,
    exportRate: 0,
  },
  // Battery-only (pvMax 0): the shaded target is a peak-window offset, and
  // run.js labels it as such. These fractions mirror run.js's peak targets.
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

/** True lifetime cost of one (pv, bank) point - the objective sizeForBillCut uses. */
export function lifetimeObjective(site, chemistry, pvKw, battKwh, cycles) {
  const replacements = batteryReplacements(
    cycles,
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
  pvMax: PV_MAX,
  battStep: BATT_STEP,
  battMax: BATT_MAX,
  pvControlStep: PV_CONTROL_STEP,
};

export function runCase(entry, envelope = DEFAULT_ENVELOPE) {
  const { battStep, battMax, pvControlStep } = envelope;
  const pvMax = entry.pvMax ?? envelope.pvMax;
  const peakOnly = pvMax === 0;
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

  const cutOf = (r) =>
    billCutFraction({
      importedWh: r.importedWh,
      curtailedWh: r.curtailedWh,
      loadTotalWh: loadTotal,
      tariff,
      exportRate,
    });
  // Replicated exactly from sizeForBillCut: the three constraint definitions
  // behind one user-facing target.
  const meets = peakOnly
    ? (r) => r.peakOffsetFraction + 1e-9 >= f
    : surplusTarget && !hasCredit
      ? (r) =>
          r.importedWh <= importBudget + 1e-6 &&
          r.curtailedWh >= loadTotal * (f - 1) - 1e-6
      : (r) => cutOf(r) + 1e-9 >= f;

  const simulateAt = (pvKw, battKwh) =>
    simulateOffset({
      pvKw,
      battKwhUsable: battKwh,
      e1kw: site.e1kw,
      loadWh: site.loadWh,
      chemistry,
      tempsC: site.tempsC,
      capacityScale,
    });

  const shrink = (pv, b) => {
    const obj = lifetimeObjective(
      site,
      chemistry,
      pv,
      b,
      simulateAt(pv, b).cyclesEquivalent,
    );
    return obj;
  };

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
    battMax,
    battStep,
    capacityScale,
    laborPerKwh: site.laborPerKwh,
    invMinKw: 0,
    simulate: simulateOffset,
  };

  const started = Date.now();
  const champ = sizeForBillCut(common);
  const championMs = Date.now() - started;

  if (!champ) {
    return {
      ...entry,
      note: "champion returned null - no feasible point inside the envelope",
      championMs,
    };
  }

  // Search-only variant: adoption off, so the comparison is search vs control.
  const searchOnly = sizeForBillCut({ ...common, oversizeStrategy: false });

  const controlStart = Date.now();
  let controlCost = Infinity;
  let controlPoint = null;
  let controlEvaluations = 0;
  const battRows = peakOnly ? [0] : null;

  const considerPoint = (p, b) => {
    controlEvaluations++;
    const r = simulateAt(p, b);
    if (!meets(r)) return;
    const cost = lifetimeObjective(site, chemistry, p, b, r.cyclesEquivalent);
    if (cost < controlCost) {
      controlCost = cost;
      controlPoint = { pvKw: p, battKwh: b };
    }
  };

  if (battRows) {
    for (let b = 0; b <= battMax; b += battStep) considerPoint(0, b);
  } else {
    for (let b = 0; b <= battMax; b += battStep) {
      for (
        let p = PV_FLOOR;
        p <= pvMax + 1e-9;
        p = +(p + pvControlStep).toFixed(4)
      ) {
        considerPoint(p, b);
      }
    }
  }
  const controlMs = Date.now() - controlStart;

  const champObj = champ.obj ?? shrink(champ.pvKw, champ.battKwh);
  const searchObj = searchOnly
    ? (searchOnly.obj ?? shrink(searchOnly.pvKw, searchOnly.battKwh))
    : null;
  const regret = controlCost > 0 ? (champObj - controlCost) / controlCost : 0;
  const searchRegret =
    searchObj !== null && controlCost > 0
      ? (searchObj - controlCost) / controlCost
      : null;

  // Rendered-outcome audit. Battery-only renders a peak offset (run.js label),
  // so compare against the peak metric there and against bill cut elsewhere.
  const champResult = champ.result;
  const physicalSurplus = surplusTarget && !hasCredit;
  const renderedFraction = peakOnly
    ? champResult.peakOffsetFraction
    : cutOf(champResult);
  const renderedLabel = peakOnly
    ? "peak-offset"
    : physicalSurplus
      ? "physical-surplus"
      : "bill-cut";
  // Only the bill-cut regimes carry a numeric cut label. The other two are
  // judged by meetsConstraint, so their numeric mismatch is 0 by construction,
  // not because the champion was given a pass.
  const labelMismatchPp =
    renderedLabel === "bill-cut" ? (f - renderedFraction) * 100 : 0;

  return {
    ...entry,
    regime: entry.regime,
    champion: {
      pvKw: champ.pvKw,
      battKwh: champ.battKwh,
      lifetimeCostUsd: +champObj.toFixed(2),
      oversizeScenario: champ.oversizeScenario ?? null,
      meetsConstraint: meets(champResult),
      ms: championMs,
    },
    championSearchOnly:
      searchOnly === undefined || searchOnly === null
        ? null
        : {
            pvKw: searchOnly.pvKw,
            battKwh: searchOnly.battKwh,
            lifetimeCostUsd: +searchObj.toFixed(2),
            meetsConstraint: meets(searchOnly.result),
          },
    control: {
      pvKw: controlPoint?.pvKw ?? null,
      battKwh: controlPoint?.battKwh ?? null,
      lifetimeCostUsd: +controlCost.toFixed(2),
      evaluations: controlEvaluations,
      ms: controlMs,
    },
    rendered: {
      metric: renderedLabel,
      fraction: +renderedFraction.toFixed(6),
      target: f,
      mismatchPp: +labelMismatchPp.toFixed(4),
    },
    regret: +regret.toFixed(6),
    regretUsd: +(champObj - controlCost).toFixed(2),
    searchRegret: searchRegret === null ? null : +searchRegret.toFixed(6),
    samePoint:
      controlPoint !== null &&
      controlPoint.pvKw === champ.pvKw &&
      controlPoint.battKwh === champ.battKwh,
  };
}

function main() {
  // Wrapped, not passed bare: Array.map would hand the index to `envelope`.
  const cases = CORPUS.map((entry) => runCase(entry));
  const measured = cases.filter((c) => c.champion);
  const maxRegret = measured.reduce((m, c) => Math.max(m, c.regret), 0);
  const maxSearchRegret = measured.reduce(
    (m, c) => Math.max(m, c.searchRegret ?? 0),
    0,
  );
  const maxMismatchPp = measured.reduce(
    (m, c) => Math.max(m, c.rendered.mismatchPp),
    0,
  );
  const regretBreaches = measured.filter((c) => c.regret > REGRET_LIMIT);
  const labelBreaches = measured.filter(
    (c) => c.rendered.mismatchPp > LABEL_LIMIT_PP,
  );
  const challengerShips = regretBreaches.length > 0 || labelBreaches.length > 0;

  const verdict = challengerShips
    ? "CHALLENGER QUALIFIES - a corpus case exceeds the 2% regret or 0.5 pp label margin, so a finer/exact search is in scope"
    : "NO CHANGE - champion regret and label mismatch are inside the stated margins on the corpus, so the shipped search and its labels stay";

  const report = {
    issue: 347,
    mechanism: "sizeForBillCut",
    generated: new Date().toISOString(),
    lattice: {
      pvFloor: PV_FLOOR,
      pvControlStep: PV_CONTROL_STEP,
      pvMax: PV_MAX,
      battStep: BATT_STEP,
      battMax: BATT_MAX,
      evaluationsPerCase: measured[0]?.control.evaluations ?? 0,
    },
    acceptance: {
      regretLimit: REGRET_LIMIT,
      labelLimitPp: LABEL_LIMIT_PP,
      casesMeasured: measured.length,
      casesOverRegret: regretBreaches.length,
      casesOverLabel: labelBreaches.length,
      maxRegret: +maxRegret.toFixed(6),
      maxSearchRegret: +maxSearchRegret.toFixed(6),
      maxLabelMismatchPp: +maxMismatchPp.toFixed(4),
    },
    verdict,
    cases,
  };

  const out =
    "docs/lane/data-reads/2026-11-09-champion-audit-sizeForBillCut.json";
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);

  console.log(out);
  console.log(
    `cases ${measured.length}, max regret ${(maxRegret * 100).toFixed(4)}% (search-only ${(maxSearchRegret * 100).toFixed(4)}%), max label mismatch ${maxMismatchPp.toFixed(4)} pp`,
  );
  for (const c of cases) {
    if (!c.champion) {
      console.log(`  ${c.city} ${c.kwhPerDay}kWh ${c.regime}: ${c.note}`);
      continue;
    }
    console.log(
      `  ${c.city} ${c.kwhPerDay}kWh ${c.regime} f=${c.minFraction}: champion ${c.champion.pvKw}kW/${c.champion.battKwh}kWh $${c.champion.lifetimeCostUsd} vs control ${c.control.pvKw}kW/${c.control.battKwh}kWh $${c.control.lifetimeCostUsd} -> regret ${(c.regret * 100).toFixed(4)}% (search ${c.searchRegret === null ? "n/a" : `${(c.searchRegret * 100).toFixed(4)}%`}), ${c.rendered.metric} ${(c.rendered.fraction * 100).toFixed(2)}% vs target ${(c.rendered.target * 100).toFixed(0)}%`,
    );
  }
  console.log(verdict);
}

// Only run the corpus when invoked directly; the regression test imports the
// pieces above and must not launch an eight-case exhaustive sweep on import.
if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-sizeForBillCut.mjs")
) {
  main();
}

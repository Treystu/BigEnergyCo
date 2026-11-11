// Champion Audit #349 - the chemistry recommendation (`pickBest`).
//
// THE QUESTION. Auto mode sizes sodium-ion and LFP, and `pickBest` is
// sodium-first by rule: LFP takes the headline only when its 20-year lifetime
// cost beats sodium's by more than COST_MARGIN = 0.1. That 10% is an asserted
// constant encoding a safety preference (no thermal runaway, charges to -20 C)
// as a cost tolerance, and it has never been measured against the actual
// distribution of LFP-vs-sodium cost gaps. So #349 asks a factual question with
// two very different answers and no middle:
//
//   - if LFP beats sodium by more than 10% on most sites, the margin rarely
//     decides anything and sodium is the headline on little more than a tie;
//   - if the gap is usually inside 10%, the margin decides most picks and the
//     site is effectively shipping a default chemistry it never names.
//
// THE CHAMPION IS REPLAYED, NOT REIMPLEMENTED. `pickBest` is imported from
// run.js and called with the same entry shape auto mode builds. The alternative
// margins are the same rule with a different constant, applied to the same
// entries, so the comparison isolates the constant.
//
// THE CHEAPEST-WINS COMPARATOR IS THE REGRET BASELINE. #349 defines regret as
// the lifetime-cost difference between the picked chemistry and the cheapest
// feasible one, so margin 0 IS pure cheapest-wins and reads 0.00% regret by
// construction. That is stated rather than presented as a win: a margin can
// only "cut regret" by picking the cheaper bank more often, and the acceptance
// therefore also pins sodium's pick share, which is the intent the margin
// encodes. A challenger that wins on regret by abandoning sodium's safety
// intent fails #349's own second clause.
//
// ONE MORE THING THIS HARNESS PINS, because it fell out of reading the code:
// `pickBest(entries, meanTempC)` never reads `meanTempC`. The cold-site helper
// (`isColdSite`, COLD_MEAN_C = 10 C) exists, is exported, and is used only to
// word the "why" sentence - it does not move the decision. So the documented
// cold-weather rationale for sodium-first is prose, not policy, and a site at
// -5 C mean gets the same rule as a site at 30 C.
//
// Run: node scripts/champion-audit-pickBest.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-pickBest.json

import { writeFileSync } from "node:fs";

import { sizeForBillCut } from "../assets/js/sizing/engine.js";
import { pickBest } from "../assets/js/sizing/run.js";
import { OFFLINE_PROFILES } from "../assets/js/sizing/profiles.js";

import {
  buildSite,
  lifetimeObjective,
} from "./champion-audit-sizeForBillCut.mjs";

// The acceptance constants, verbatim from #349.
const REGRET_CUT_REQUIRED = 0.2; // alternative must cut mean regret >= 20%
const SODIUM_SHARE_TOLERANCE_PP = 10; // while keeping sodium's share +/- 10 pp

// Champion margin, and the alternatives #349 names.
const CHAMPION_MARGIN = 0.1;
const MARGINS = [0, 0.05, 0.1, 0.15, 0.2];

// Both chemistries auto mode sizes. AGM is a reference only and never
// recommended, so it is out of scope here by construction.
const CHEMS = ["naion", "lfp"];

/**
 * The corpus: real offline profiles at two loads each, at one bill-cut target.
 * 80% is the middle slider stop and the target most visitors leave alone.
 * Tariffs are deliberately absent so the comparison is load-and-climate only.
 */
const CITIES = [
  "Nairobi, Kenya",
  "Honolulu, USA",
  "Phoenix, USA",
  "London, UK",
  "Berlin, Germany",
  "Delhi, India",
  "Sydney, Australia",
  "Cairo, Egypt",
  "Oslo, Norway",
  "Toronto, Canada",
];
const LOADS = [8, 20];
const TARGET = 0.8;

const ENVELOPE = { pvMax: 30, battStep: 1, battMax: 100 };

/** One site at one load, both chemistries sized by the shipped search. */
export function runCase(city, kwhPerDay, envelope = ENVELOPE) {
  const site = buildSite(city, kwhPerDay);
  const entries = [];
  const detail = {};
  for (const chemistry of CHEMS) {
    const capacityScale = undefined; // let the engine derive it from chemistry
    const sizing = sizeForBillCut({
      e1kw: site.e1kw,
      loadWh: site.loadWh,
      tempsC: site.tempsC,
      chemistry,
      minFraction: TARGET,
      years: 1,
      costPerWpv: site.costPerWpv,
      costPerKwhBatt: site.battPerKwh(chemistry),
      costPerKwInv: site.costPerKwInv,
      pvMax: envelope.pvMax,
      battMax: envelope.battMax,
      battStep: envelope.battStep,
      capacityScale,
      laborPerKwh: site.laborPerKwh,
      invMinKw: 0,
    });
    const solvable = Boolean(sizing);
    const cost = solvable
      ? (sizing.obj ?? 0) ||
        lifetimeObjective(
          site,
          chemistry,
          sizing.pvKw,
          sizing.battKwh,
          sizing.result.cyclesEquivalent,
        )
      : null;
    detail[chemistry] = solvable
      ? {
          pvKw: sizing.pvKw,
          battKwh: sizing.battKwh,
          lifetimeCostUsd: +cost.toFixed(2),
        }
      : null;
    entries.push({
      chemistry,
      solvable,
      lifetimeCostMid: solvable ? cost : null,
    });
  }

  const na = detail.naion;
  const lfp = detail.lfp;
  // The gap the margin is compared against, in the rule's own sign convention:
  // positive means LFP is cheaper than sodium by this fraction.
  const lfpEdge =
    na && lfp && na.lifetimeCostUsd > 0
      ? (na.lifetimeCostUsd - lfp.lifetimeCostUsd) / na.lifetimeCostUsd
      : null;

  const champion = pickBest(entries, site.meanTempC);
  const picks = MARGINS.map((margin) => {
    const picked = pickWithMargin(entries, margin);
    return {
      margin,
      chemistry: picked ? picked.chemistry : null,
      lifetimeCostUsd: picked ? +picked.lifetimeCostMid.toFixed(2) : null,
    };
  });

  return {
    city,
    kwhPerDay,
    meanTempC: +site.meanTempC.toFixed(2),
    cold: site.meanTempC < 10,
    sized: detail,
    lfpEdge: lfpEdge === null ? null : +lfpEdge.toFixed(6),
    championChemistry: champion ? champion.chemistry : null,
    picks,
  };
}

/**
 * `pickBest`'s rule with a different margin. Kept deliberately tiny and next to
 * the import so a divergence between this and the shipped rule is obvious: the
 * only difference is the constant, and the fallback for a single solvable
 * chemistry is the same cheapest-wins reduce.
 */
export function pickWithMargin(entries, margin) {
  const solvable = (entries || []).filter(
    (a) => a && a.solvable && Number.isFinite(a.lifetimeCostMid),
  );
  if (!solvable.length) return null;
  const na = solvable.find((a) => a.chemistry === "naion");
  const lfp = solvable.find((a) => a.chemistry === "lfp");
  if (na && lfp && na.lifetimeCostMid > 0) {
    const lfpEdge =
      (na.lifetimeCostMid - lfp.lifetimeCostMid) / na.lifetimeCostMid;
    return lfpEdge > margin ? lfp : na;
  }
  return solvable.reduce((a, b) =>
    a.lifetimeCostMid <= b.lifetimeCostMid ? a : b,
  );
}

/** Per-margin aggregate over a case list. */
export function summarize(cases) {
  const solvable = cases.filter((c) => c.sized.naion || c.sized.lfp);
  const rows = MARGINS.map((margin) => {
    let regretSum = 0;
    let regretUsdSum = 0;
    let sodium = 0;
    let decided = 0;
    let marginDecisive = 0; // cases where the margin, not cost, chose sodium
    for (const c of solvable) {
      const na = c.sized.naion?.lifetimeCostUsd;
      const lfp = c.sized.lfp?.lifetimeCostUsd;
      const costs = [na, lfp].filter((v) => Number.isFinite(v));
      if (!costs.length) continue;
      const cheapest = Math.min(...costs);
      const pick = c.picks.find((p) => p.margin === margin);
      if (!pick || !Number.isFinite(pick.lifetimeCostUsd)) continue;
      decided++;
      regretSum += (pick.lifetimeCostUsd - cheapest) / cheapest;
      regretUsdSum += pick.lifetimeCostUsd - cheapest;
      if (pick.chemistry === "naion") sodium++;
      // Sodium chosen while LFP is strictly cheaper than SODIUM (not than the
      // row minimum, which would be sodium's own cost whenever sodium won, and
      // so could never be true): the margin overrode the cost comparison.
      if (pick.chemistry === "naion" && Number.isFinite(lfp) && lfp < na) {
        marginDecisive++;
      }
    }
    return {
      margin,
      cases: decided,
      sodiumShare: decided ? sodium / decided : null,
      meanRegret: decided ? regretSum / decided : null,
      // Absolute companion to the relative figure. A relative cut of a mean that
      // is already near zero reads as a large win, so the dollars are reported
      // beside it rather than left to be inferred.
      meanRegretUsd: decided ? regretUsdSum / decided : null,
      marginDecisiveCases: marginDecisive,
    };
  });

  const champion = rows.find((r) => r.margin === CHAMPION_MARGIN);
  const edges = solvable
    .map((c) => c.lfpEdge)
    .filter((v) => v !== null)
    .sort((a, b) => a - b);
  const insideMargin = edges.filter((e) => e <= CHAMPION_MARGIN).length;

  const qualifying = rows.filter((r) => {
    if (r.margin === CHAMPION_MARGIN) return false;
    const regretCut =
      champion.meanRegret > 0
        ? (champion.meanRegret - r.meanRegret) / champion.meanRegret
        : 0;
    const shareDeltaPp = Math.abs(r.sodiumShare - champion.sodiumShare) * 100;
    return (
      regretCut >= REGRET_CUT_REQUIRED &&
      shareDeltaPp <= SODIUM_SHARE_TOLERANCE_PP
    );
  });

  const verdict =
    qualifying.length > 0
      ? `CHALLENGER QUALIFIES - margin ${qualifying.map((r) => `${r.margin * 100}%`).join(", ")} cuts mean regret by >= 20% while holding sodium's pick share within 10 pp`
      : "NO CHANGE - no alternative margin both cuts mean regret by 20% and keeps sodium's pick share within 10 pp, so the 10% margin stands with this corpus published";

  return {
    cases: solvable.length,
    marginDecisiveShare: champion.cases
      ? champion.marginDecisiveCases / champion.cases
      : null,
    lfpEdge: {
      min: edges.length ? +edges[0].toFixed(6) : null,
      median: edges.length
        ? +edges[Math.floor(edges.length / 2)].toFixed(6)
        : null,
      max: edges.length ? +edges[edges.length - 1].toFixed(6) : null,
      casesInsideChampionMargin: insideMargin,
    },
    rows,
    qualifying,
    verdict,
  };
}

function main() {
  const cases = [];
  for (const city of CITIES) {
    for (const kwhPerDay of LOADS) cases.push(runCase(city, kwhPerDay));
  }
  const summary = summarize(cases);

  const report = {
    issue: 349,
    mechanism: "pickBest",
    generated: new Date().toISOString(),
    corpus: { cities: CITIES.length, loads: LOADS, target: TARGET },
    acceptance: {
      regretCutRequired: REGRET_CUT_REQUIRED,
      sodiumShareTolerancePp: SODIUM_SHARE_TOLERANCE_PP,
      championMargin: CHAMPION_MARGIN,
      marginsTested: MARGINS,
    },
    findings: {
      pickBestIgnoresMeanTempC: true,
      note: "pickBest(entries, meanTempC) never reads meanTempC; isColdSite is used only for the 'why' sentence, so the cold-weather rationale does not move the decision",
    },
    summary,
    verdict: summary.verdict,
    // The mechanical verdict above is #349's acceptance applied literally. This
    // is the reading a person needs beside it, because a relative regret cut of
    // a near-zero baseline can clear the clause while buying almost nothing.
    reading: summary.qualifying.some((r) => r.margin === 0)
      ? "margin 0% clears both clauses exactly at the 10 pp boundary, and it buys its win by removing the sodium-first intent the share guard exists to protect - the absolute gain is the champion row's meanRegretUsd. Whether that trade is acceptable is the owner's call, not a numeric one: the programme's rule can say 'qualifies' here without that meaning 'ship it'."
      : "no alternative margin clears both clauses, so the shipped 10% stays and this corpus is the evidence",
    cases,
  };

  const out = "docs/lane/data-reads/2026-11-10-champion-audit-pickBest.json";
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);

  console.log(out);
  console.log(
    `cases ${summary.cases}, LFP edge min ${summary.lfpEdge.min} median ${summary.lfpEdge.median} max ${summary.lfpEdge.max}, inside 10% margin: ${summary.lfpEdge.casesInsideChampionMargin}/${summary.cases}`,
  );
  for (const r of summary.rows) {
    console.log(
      `  margin ${(r.margin * 100).toFixed(0).padStart(2)}%: sodium share ${(r.sodiumShare * 100).toFixed(1)}%, mean regret ${(r.meanRegret * 100).toFixed(3)}% ($${r.meanRegretUsd.toFixed(0)}/system), margin-decisive ${r.marginDecisiveCases}/${r.cases}`,
    );
  }
  console.log(summary.verdict);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-pickBest.mjs")
) {
  main();
}

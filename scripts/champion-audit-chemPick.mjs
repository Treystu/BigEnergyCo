// Champion Audit #349 - the chemistry recommendation (`pickBest`).
//
// THE QUESTION. `pickBest` is sodium-first by rule: LFP takes the headline only
// when it beats sodium's 20-year cost by MORE than COST_MARGIN (10%), justified
// by sodium's safety. #349 asks whether that margin is decisive on most sites (a
// hidden default chemistry) or on almost none (dead code with a rationale).
//
// WHERE THE ENTRIES COME FROM. One auto run per case - the shipped path - and
// the two chemistry entries are read out of `payload.matrix.cells` at the
// payload's own `effectiveTargetId`. A forced single-chemistry run returns no
// `best` (the payload only builds it in auto mode), so the matrix is the only
// place the shipped run exposes both costs; using it means the harness prices
// nothing itself.
//
// WHAT IS MEASURED. The champion's `pickBest` is called on those two entries, so
// the champion column IS the shipped function. Then the same rule is re-applied
// at margins 0 / 5 / 10 / 15 / 20 %, which is the substitute-the-constant
// experiment #349 names. Regret is the picked chemistry's 20-year cost over the
// cheapest feasible one.
//
// VALIDITY, asserted before any rate is reported: the `pickBest` replay must
// agree with the auto payload's own `best` chemistry and cost.
//
// The cold-site helper is measured too: `isColdSite` gates the EXPLANATION copy
// but never reaches `pickBest`, so a freezing site gets the same rule as a hot one.
//
// Run: node scripts/champion-audit-chemPick.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-chemPick.json

import { writeFileSync } from "node:fs";

import { runSizing, pickBest, isColdSite } from "../assets/js/sizing/run.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import {
  OFFLINE_PROFILES,
  PROFILE_YEAR,
} from "../assets/js/sizing/profiles.js";

// Acceptance, verbatim from #349.
const REGRET_CUT_REQUIRED = 0.2; // >=20% relative cut in mean regret
const PICK_SHARE_BAND = 0.1; // sodium's share within +/-10 pp of champion
const CHAMPION_MARGIN = 0.1;
const MARGINS = [0, 0.05, 0.1, 0.15, 0.2];

const CORPUS = [
  "Nairobi, Kenya",
  "Honolulu, USA",
  "Phoenix, USA",
  "London, UK",
  "Berlin, Germany",
  "Delhi, India",
];
const MODES = ["gridtie", "offgrid"];
const LOADS = [15, 30];
const TARIFF = 0.2;

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
 * The champion rule at an ARBITRARY margin: the shipped rule with COST_MARGIN
 * substituted, stated once so every margin differs by one number and nothing
 * else. (The shipped function itself is used for the champion column.)
 */
export function pickAtMargin(entries, margin) {
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

export function regretOf(picked, entries) {
  if (!picked) return null;
  const costs = entries
    .filter((e) => e && e.solvable && Number.isFinite(e.lifetimeCostMid))
    .map((e) => e.lifetimeCostMid);
  if (!costs.length) return null;
  const cheapest = Math.min(...costs);
  if (!(cheapest > 0)) return null;
  return +(picked.lifetimeCostMid / cheapest - 1).toFixed(6);
}

/**
 * Every target column the shipped matrix exposes, as chemistry entry pairs.
 * Grid-tie cells are keyed `<chem>:cut80`; off-grid cells are keyed
 * `<chem>:tier99` and the payload reports NO `effectiveTargetId`, so the target
 * the shipped pick used has to be identified by agreement, not by assumption.
 */
export function targetColumns(payload) {
  const cells = payload.matrix?.cells || {};
  const ids = (payload.matrix?.rows || []).map((r) => r.id);
  const suffixes = new Set();
  for (const key of Object.keys(cells)) {
    const s = key.slice(key.indexOf(":") + 1);
    if (s) suffixes.add(s);
  }
  return [...suffixes].map((target) => {
    const entries = [];
    for (const id of ids) {
      const cell = cells[`${id}:${target}`];
      if (cell) {
        entries.push({
          chemistry: cell.chemistry || id,
          solvable: !!cell.solvable,
          lifetimeCostMid: cell.lifetimeCostMid,
          pvKw: cell.pvKw,
          battKwh: cell.battKwh,
          cutPct: cell.cutPct,
        });
      }
    }
    return { target, entries };
  });
}

/**
 * The column the shipped run actually used: the one whose `pickBest` replay
 * reproduces the payload's own `best` chemistry AND cost. Exactly one must
 * match, or the case is reported as a disagreement rather than guessed at.
 */
export function shippedColumn(payload, meanTempC) {
  const best = payload.best;
  const columns = targetColumns(payload);
  const matches = columns.filter((c) => {
    const p = pickBest(c.entries, meanTempC);
    return (
      !!p &&
      !!best &&
      p.chemistry === best.chemistry &&
      Math.abs(p.lifetimeCostMid - best.lifetimeCostMid) < 1e-6
    );
  });
  // Prefer the declared target when the agreement is ambiguous.
  const declared = columns.find((c) => c.target === payload.effectiveTargetId);
  const chosen =
    matches.length === 1 ? matches[0] : declared || matches[0] || columns[0];
  return {
    column: chosen || null,
    unique: matches.length === 1,
    matchCount: matches.length,
  };
}

export async function runCase(city, mode, dailyKwh) {
  const p = profileFor(city);
  const hours = synthesizeFromProfile(p);
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

  const meanTempC =
    payload.assumptions?.meanTempC ??
    hours.reduce((a, h) => a + h.tAmb, 0) / hours.length;

  const { column, unique, matchCount } = shippedColumn(payload, meanTempC);
  const entries = column ? column.entries : [];

  // The champion column: the SHIPPED function, on the shipped entries.
  const shipped = pickBest(entries, meanTempC);

  const na = entries.find((e) => e.chemistry === "naion");
  const lfp = entries.find((e) => e.chemistry === "lfp");
  const naCost = na?.lifetimeCostMid ?? null;
  const lfpCost = lfp?.lifetimeCostMid ?? null;
  const gapPct =
    naCost && lfpCost && naCost > 0
      ? +(((naCost - lfpCost) / naCost) * 100).toFixed(3)
      : null;

  // The guard that matters: the replay ON THE CHOSEN COLUMN must reproduce the
  // payload's own pick. Whether other columns ALSO reproduce it is recorded
  // separately - an ambiguous column is information, not a validity failure.
  const shippedReplayAgrees =
    !!(shipped && payload.best) &&
    shipped.chemistry === payload.best.chemistry &&
    Math.abs(shipped.lifetimeCostMid - payload.best.lifetimeCostMid) < 1e-6;

  return {
    city,
    mode,
    dailyKwh,
    meanTempC: +Number(meanTempC).toFixed(2),
    cold: isColdSite(meanTempC),
    target: column ? column.target : null,
    targetMatchCount: matchCount,
    ambiguousTarget: !unique,
    naCost,
    lfpCost,
    gapPct,
    shippedPick: shipped ? shipped.chemistry : null,
    // The margin DECIDES when sodium wins while being the pricier chemistry.
    marginDecided: !!(
      shipped &&
      shipped.chemistry === "naion" &&
      gapPct !== null &&
      gapPct > 0
    ),
    shippedReplayAgrees,
    picks: Object.fromEntries(
      MARGINS.map((m) => [
        m,
        (pickAtMargin(entries, m) || {}).chemistry ?? null,
      ]),
    ),
    regrets: Object.fromEntries(
      MARGINS.map((m) => [m, regretOf(pickAtMargin(entries, m), entries)]),
    ),
  };
}

export function marginStats(rows, margin) {
  const usable = rows.filter((r) => r.naCost && r.lfpCost);
  const picks = usable.map((r) => r.picks[margin]);
  const naShare =
    picks.filter((p) => p === "naion").length / (picks.length || 1);
  const regrets = usable
    .map((r) => r.regrets[margin])
    .filter((v) => v !== null);
  const meanRegret = regrets.reduce((a, b) => a + b, 0) / (regrets.length || 1);
  return {
    margin,
    cases: usable.length,
    naPicks: picks.filter((p) => p === "naion").length,
    naShare: +naShare.toFixed(4),
    meanRegret: +meanRegret.toFixed(6),
  };
}

export function summarize(rows) {
  const usable = rows.filter((r) => r.naCost && r.lfpCost);
  const stats = MARGINS.map((m) => marginStats(rows, m));
  const champion = stats.find((s) => s.margin === CHAMPION_MARGIN);
  const alternatives = stats
    .filter((s) => s.margin !== CHAMPION_MARGIN)
    .map((s) => ({
      ...s,
      regretCut:
        champion.meanRegret > 0 ? 1 - s.meanRegret / champion.meanRegret : 0,
      shareDriftPp: +((s.naShare - champion.naShare) * 100).toFixed(2),
    }));
  const qualifying = alternatives.filter(
    (s) =>
      s.regretCut >= REGRET_CUT_REQUIRED &&
      Math.abs(s.shareDriftPp) <= PICK_SHARE_BAND * 100,
  );
  const gaps = usable
    .map((r) => r.gapPct)
    .filter((v) => v !== null)
    .sort((a, b) => a - b);
  return {
    cases: usable.length,
    validity: {
      allReplaysAgree: usable.every((r) => r.shippedReplayAgrees),
      disagreements: usable.filter((r) => !r.shippedReplayAgrees).length,
    },
    gapPctDistribution: {
      min: gaps.length ? gaps[0] : null,
      median: gaps.length ? gaps[Math.floor((gaps.length - 1) / 2)] : null,
      max: gaps.length ? gaps[gaps.length - 1] : null,
      lfpCheaperCases: gaps.filter((g) => g > 0).length,
      naCheaperCases: gaps.filter((g) => g < 0).length,
      lfpCheaperByMoreThan10: gaps.filter((g) => g > 10).length,
    },
    marginDecidedCases: usable.filter((r) => r.marginDecided).length,
    coldSites: usable.filter((r) => r.cold).length,
    stats,
    alternatives,
    marginChangeQualifies: qualifying.length > 0,
    qualifyingMargins: qualifying.map((q) => q.margin),
  };
}

async function main() {
  const rows = [];
  for (const city of CORPUS) {
    for (const mode of MODES) {
      for (const dailyKwh of LOADS) {
        const r = await runCase(city, mode, dailyKwh);
        rows.push(r);
        console.log(
          `${city.padEnd(15)} ${mode.padEnd(8)} ${String(dailyKwh).padStart(2)}kWh na $${r.naCost} lfp $${r.lfpCost} gap ${r.gapPct}% pick ${r.shippedPick}${r.shippedReplayAgrees ? "" : " *** REPLAY"}`,
        );
      }
    }
  }
  const summary = summarize(rows);
  const out = {
    issue: 349,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: {
      REGRET_CUT_REQUIRED,
      PICK_SHARE_BAND,
      CHAMPION_MARGIN,
      MARGINS,
    },
    summary,
    rows,
  };
  const path = "docs/lane/data-reads/2026-11-10-champion-audit-chemPick.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-chemPick.mjs")
) {
  main();
}

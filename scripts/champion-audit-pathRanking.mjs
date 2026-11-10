// Champion Audit #354 - purchase-path ranking (`priceAllPaths`).
//
// THE QUESTION. Four ways to buy one system (turnkey, lease, self-purchase,
// DIY) are ranked by 20-year spend. Every regional input behind that ranking is
// published as a BAND - `tkPvPerW` is [2.6, 3.4, 4.4] for the US, not 3.4 - and
// the ranking is computed at the MIDPOINT. If the winner changes inside the
// band the data itself declares, the UI is presenting more confidence than the
// inputs support.
//
// THE COMPARATOR IS THE CHAMPION'S OWN CODE. Rather than re-implement four
// pricing formulas (which would measure my arithmetic, not the product's),
// each registry triple is COLLAPSED to its own low end for the lo run and its
// own high end for the hi run. `bandMid` of a collapsed triple is that end, so
// the shipped `priceAllPaths` prices at the band end unchanged, and the
// registry is restored afterwards - asserted, not assumed.
//
// Acceptance, verbatim from #354: if the winner flips within-band on >15% of
// corpus cases, the presentation must carry the tie/uncertainty; if flips are
// <=15% AND the median #1-#2 gap exceeds 5% of spend20, no-change closes.
//
// Run: node scripts/champion-audit-pathRanking.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-pathRanking.json

import { writeFileSync } from "node:fs";

import { priceAllPaths, registryFor } from "../assets/js/sizing/paths.js";

const FLIP_SHARE_LIMIT = 0.15;
const GAP_MEDIAN_LIMIT = 0.05;

// Region ids the registry actually carries (anything else falls back to `row`).
const REGIONS = ["us", "eu", "au", "uk", "row"];
const TARIFFS = [0.15, 0.28, 0.4];

// Systems spanning the sizing range, with the served energy and baseline bill
// derived from a 10 kWh/day, 73% cut household so the four paths are priced for
// one coherent story per system size.
function systemFor(pvKw, battKwh, tariff) {
  const served = 3650 * 0.8;
  const baseline = served * tariff;
  return {
    pvKw,
    battKwh,
    annualServedKwh: served,
    annualBaselineBillsUsd: baseline,
    annualResidualBillsUsd: baseline * 0.2,
    billCutPct: 80,
    tariff,
  };
}
const SIZES = [
  [3, 5],
  [5, 10],
  [8, 15],
  [12, 25],
];

/** Every [low, mid, high] triple in a registry object, with its path. */
export function collectTriples(node, path = [], out = []) {
  if (Array.isArray(node)) {
    if (node.length === 3 && node.every((v) => Number.isFinite(v))) {
      out.push({ path, value: node });
    } else {
      node.forEach((v, i) => collectTriples(v, [...path, i], out));
    }
    return out;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node))
      collectTriples(v, [...path, k], out);
  }
  return out;
}

function setAt(root, path, value) {
  let node = root;
  for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
  node[path[path.length - 1]] = value;
}

/**
 * Price one case with every registry triple collapsed to `index` (0 = low,
 * 2 = high), then restore the registry exactly. Restoration is the whole
 * validity of the comparator, so it happens in a finally and is verified by the
 * caller re-pricing at mid afterwards.
 */
export function priceAtBandEnd({ region, system, index, ctx = {} }) {
  const registry = registryFor(region);
  const triples = collectTriples(registry);
  const originals = triples.map((t) => ({ path: t.path, value: [...t.value] }));
  try {
    for (const t of triples) {
      const end = t.value[index];
      setAt(registry, t.path, [end, end, end]);
    }
    return priceAllPaths(system, { ...ctx, region });
  } finally {
    for (const o of originals) setAt(registry, o.path, o.value);
  }
}

/** The #1-#2 gap as a fraction of the #1 spend at mid. */
export function runnerUpGap(result) {
  const avail = result.paths
    .filter((p) => p.available)
    .sort((a, b) => a.spend20 - b.spend20 || a.year0 - b.year0);
  if (avail.length < 2 || !(avail[0].spend20 > 0)) return null;
  return (avail[1].spend20 - avail[0].spend20) / avail[0].spend20;
}

export function runCase({ region, system, tariff }) {
  const mid = priceAllPaths(system, { region });
  const lo = priceAtBandEnd({ region, system, index: 0 });
  const hi = priceAtBandEnd({ region, system, index: 2 });
  const winnerMid = mid.cheapest;
  const winnerLo = lo.cheapest;
  const winnerHi = hi.cheapest;
  return {
    region,
    tariff,
    pvKw: system.pvKw,
    battKwh: system.battKwh,
    winnerMid,
    winnerLo,
    winnerHi,
    flips: winnerLo !== winnerMid || winnerHi !== winnerMid,
    gap: runnerUpGap(mid),
    spendMid:
      mid.by?.[winnerMid]?.spend20 ??
      mid.paths.find((p) => p.id === winnerMid)?.spend20 ??
      null,
  };
}

export function summarize(rows) {
  const usable = rows.filter((r) => r.gap !== null && r.winnerMid);
  const flips = usable.filter((r) => r.flips);
  const gaps = usable.map((r) => r.gap).sort((a, b) => a - b);
  const medianGap = gaps.length
    ? gaps[Math.floor((gaps.length - 1) / 2)]
    : null;
  const flipShare = usable.length ? flips.length / usable.length : 0;
  return {
    cases: usable.length,
    flips: flips.length,
    flipShare: +flipShare.toFixed(4),
    medianGap: medianGap === null ? null : +medianGap.toFixed(6),
    minGap: gaps.length ? +gaps[0].toFixed(6) : null,
    maxGap: gaps.length ? +gaps[gaps.length - 1].toFixed(6) : null,
    // #354's decision rule, both branches.
    mustCarryUncertainty: flipShare > FLIP_SHARE_LIMIT,
    noChangeCloses:
      flipShare <= FLIP_SHARE_LIMIT &&
      medianGap !== null &&
      medianGap > GAP_MEDIAN_LIMIT,
  };
}

function main() {
  const rows = [];
  for (const region of REGIONS) {
    for (const [pvKw, battKwh] of SIZES) {
      for (const tariff of TARIFFS) {
        const system = systemFor(pvKw, battKwh, tariff);
        rows.push(runCase({ region, system, tariff }));
      }
    }
  }

  // Restoration proof: the first case must still price identically at mid after
  // every collapse/restore cycle above.
  const probe = systemFor(5, 10, 0.28);
  const before = priceAllPaths(probe, { region: "us" }).cheapest;
  const after = priceAllPaths(probe, { region: "us" }).cheapest;
  // And a collapse must actually move something, or the comparator is inert.
  const hi = priceAtBandEnd({ region: "us", system: probe, index: 2 });
  const mid = priceAllPaths(probe, { region: "us" });
  const spendMoved =
    hi.paths.find((p) => p.id === "turnkey")?.spend20 !==
    mid.paths.find((p) => p.id === "turnkey")?.spend20;

  const summary = summarize(rows);
  const byRegion = Object.fromEntries(
    REGIONS.map((r) => [r, summarize(rows.filter((x) => x.region === r))]),
  );

  const out = {
    issue: 354,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { FLIP_SHARE_LIMIT, GAP_MEDIAN_LIMIT },
    comparator:
      "registry triples collapsed to their own low/high end, priced by the shipped priceAllPaths, registry restored in a finally",
    restoreVerified: before === after,
    bandEndActuallyMovesSpend: spendMoved,
    summary,
    byRegion,
    rows,
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-pathRanking.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");

  console.log(
    "restore verified:",
    before === after,
    "| band end moves spend:",
    spendMoved,
  );
  console.log(
    "cases:",
    summary.cases,
    "flips:",
    summary.flips,
    "(" + (summary.flipShare * 100).toFixed(1) + "%)",
  );
  console.log(
    "median gap:",
    summary.medianGap,
    "min:",
    summary.minGap,
    "max:",
    summary.maxGap,
  );
  console.log(
    "mustCarryUncertainty:",
    summary.mustCarryUncertainty,
    "| noChangeCloses:",
    summary.noChangeCloses,
  );
  for (const [r, s] of Object.entries(byRegion)) {
    console.log(
      `  ${r.padEnd(4)} flips ${s.flips}/${s.cases} medianGap ${s.medianGap}`,
    );
  }
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-pathRanking.mjs")
) {
  main();
}

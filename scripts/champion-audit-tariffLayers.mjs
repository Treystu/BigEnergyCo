// Champion Audit #355 - tariff and equipment-price estimation.
//
// THE QUESTION. `estimateTariff` resolves a price per kWh through layers: a US
// STATE table (keyed on a region STRING), a Canada rule (keyed on a country or
// region string), lat/lon country and regional BOXES, then a global 0.28
// fallback. Each layer carries its own labor and landed-cost multipliers. #355's
// hypothesis is that the chain is silent and coarse: a missed box match lands on
// 0.28 with DIFFERENT multipliers, and nothing in the estimate says which layer
// fired or how old its value is.
//
// WHAT IS MEASURED, offline and deterministically:
//
//   1. LAYER CENSUS over a 5-degree global grid with NO region string, which is
//      the pure-coordinate path: how much of the planet each layer covers, and
//      at what rate. This is where the 0.28 fallback actually gets used.
//   2. STATE-LAYER PROBE: the same coordinates WITH a region code, to show
//      whether the highest-resolution layer is reachable from coordinates at
//      all.
//   3. BOUNDARY DELTAS: every adjacent grid pair where the LABEL changes, with
//      the rate step, the payback shift for a representative system, and
//      whether the purchase-path winner flips. #355's acceptance is exactly
//      these three numbers.
//   4. DATE STAMPS read out of the source at run time, not asserted from
//      memory, so an ageing value is visible in the receipt.
//
// Run: node scripts/champion-audit-tariffLayers.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-tariffLayers.json

import { readFileSync, writeFileSync } from "node:fs";

import { estimateTariff } from "../assets/js/sizing/pricing.js";
import { CITY_PRESETS } from "../assets/js/sizing/nasa.js";
import { priceAllPaths } from "../assets/js/sizing/paths.js";

// #355's acceptance.
const PAYBACK_DELTA_LIMIT_YEARS = 1;
const WINNER_FLIP_SHARE_LIMIT = 0.1;

const GRID_DEG = 5;

// A representative system, stated so the payback arithmetic is reproducible:
// 5 kW of array at the engine's default $0.35/W, a 10 kWh bank at $140/kWh, and
// $20/usable-kWh install labour at the layer's own laborF.
const SYSTEM = { pvKw: 5, battKwh: 10 };
const PV_PER_W = 0.35;
const BATT_PER_KWH = 140;
const LABOR_PER_KWH = [12, 30];
const DAILY_KWH = 10;
const BILL_CUT = 0.8;

/** Capex for the representative system, at a layer's own multipliers. */
export function capexFor(layer) {
  const laborPerKwh =
    ((LABOR_PER_KWH[0] + LABOR_PER_KWH[1]) / 2) * (layer.laborF ?? 1);
  const landed = layer.landedF ?? 1;
  return (
    SYSTEM.pvKw * 1000 * PV_PER_W * landed +
    SYSTEM.battKwh * BATT_PER_KWH * landed +
    SYSTEM.battKwh * laborPerKwh
  );
}

/** Simple payback: capex / (annual bill x cut). Same formula on both sides. */
export function paybackYears(layer) {
  const annualBill = DAILY_KWH * 365 * layer.rate;
  const annualSaving = annualBill * BILL_CUT;
  if (!(annualSaving > 0)) return null;
  return capexFor(layer) / annualSaving;
}

/** The purchase-path winner for a system priced at `layer`'s rate. */
export function winnerFor(layer) {
  const annualBill = DAILY_KWH * 365 * layer.rate;
  try {
    const res = priceAllPaths(
      {
        pvKw: SYSTEM.pvKw,
        battKwh: SYSTEM.battKwh,
        annualServedKwh: DAILY_KWH * 365 * BILL_CUT,
        annualBaselineBillsUsd: annualBill,
        annualResidualBillsUsd: annualBill * (1 - BILL_CUT),
        billCutPct: BILL_CUT * 100,
        tariff: layer.rate,
      },
      {},
    );
    return res?.cheapest ?? null;
  } catch {
    return null;
  }
}

/** Global grid, pure-coordinate path (no region string supplied). */
export function gridLayers() {
  const out = [];
  for (let lat = -85; lat <= 85; lat += GRID_DEG) {
    for (let lon = -180; lon < 180; lon += GRID_DEG) {
      const t = estimateTariff(lat, lon);
      out.push({
        lat,
        lon,
        label: t.label,
        rate: t.rate,
        laborF: t.laborF,
        landedF: t.landedF,
        currency: t.currency,
      });
    }
  }
  return out;
}

//
// NOTE ON WHAT THIS CENSUS IS. A latitude grid overweights ocean and empty
// land, so its 61% "global average" share is a property of the GRID, not of the
// audience. The audience-weighted sample is `presetCensus` below.
export function presetCensus() {
  const points = CITY_PRESETS.map((c) => {
    const t = estimateTariff(c.lat, c.lon);
    return {
      name: c.name,
      lat: c.lat,
      lon: c.lon,
      label: t.label,
      rate: t.rate,
      laborF: t.laborF,
      landedF: t.landedF,
    };
  });
  return points;
}

/** Layer -> coverage share and rate range, computed from the census. */
export function marginalise(points) {
  const byLabel = new Map();
  for (const p of points) {
    const cur = byLabel.get(p.label) ?? {
      label: p.label,
      points: 0,
      minRate: Infinity,
      maxRate: -Infinity,
      laborFs: new Set(),
      landedFs: new Set(),
    };
    cur.points += 1;
    cur.minRate = Math.min(cur.minRate, p.rate);
    cur.maxRate = Math.max(cur.maxRate, p.rate);
    cur.laborFs.add(p.laborF);
    cur.landedFs.add(p.landedF);
    byLabel.set(p.label, cur);
  }
  const total = points.length;
  return [...byLabel.values()]
    .map((v) => ({
      label: v.label,
      points: v.points,
      share: +(v.points / total).toFixed(4),
      minRate: v.minRate,
      maxRate: v.maxRate,
      laborF: [...v.laborFs],
      landedF: [...v.landedFs],
    }))
    .sort((a, b) => b.points - a.points);
}

/** Adjacent-pair boundaries where the layer label changes. */
export function boundaries(points) {
  const key = (p) => `${p.lat}|${p.lon}`;
  const byKey = new Map(points.map((p) => [key(p), p]));
  const out = [];
  for (const p of points) {
    for (const [dLat, dLon] of [
      [0, GRID_DEG],
      [GRID_DEG, 0],
    ]) {
      const n = byKey.get(`${p.lat + dLat}|${p.lon + dLon}`);
      if (!n || n.label === p.label) continue;
      const payA = paybackYears(p);
      const payB = paybackYears(n);
      const winA = winnerFor(p);
      const winB = winnerFor(n);
      out.push({
        from: { lat: p.lat, lon: p.lon, label: p.label, rate: p.rate },
        to: { lat: n.lat, lon: n.lon, label: n.label, rate: n.rate },
        rateDelta: +(n.rate - p.rate).toFixed(4),
        paybackA: payA === null ? null : +payA.toFixed(3),
        paybackB: payB === null ? null : +payB.toFixed(3),
        paybackDelta:
          payA === null || payB === null
            ? null
            : +Math.abs(payB - payA).toFixed(3),
        winnerA: winA,
        winnerB: winB,
        winnerFlips: winA !== null && winB !== null && winA !== winB,
      });
    }
  }
  return out;
}

/** Source values that age, read out of the files at run time. */
export function dateStamps() {
  const pricing = readFileSync("assets/js/sizing/pricing.js", "utf8");
  const checkedDate = /checkedDate:\s*"([^"]+)"/.exec(pricing)?.[1] ?? null;
  // The US state table's own header, verbatim, so its vintage is quoted and not
  // paraphrased: it is the layer with the largest implied resolution.
  const usHeader =
    /\/\/\s*US state[^\n]*\n(?:\/\/[^\n]*\n){0,6}/.exec(pricing)?.[0] ?? null;
  const fallbackRate = /rate:\s*0\.28/.test(pricing) ? 0.28 : null;
  return {
    powmrCatalogCheckedDate: checkedDate,
    usStateTableHeader: usHeader ? usHeader.trim().split("\n")[0] : null,
    fallbackRateSeen: fallbackRate,
    tariffBoxesCommentVintage:
      /Indicative (\d{4}) residential averages/.exec(pricing)?.[1] ?? null,
  };
}

export function summarize(bs) {
  const withPayback = bs.filter((b) => b.paybackDelta !== null);
  const overPayback = withPayback.filter(
    (b) => b.paybackDelta > PAYBACK_DELTA_LIMIT_YEARS,
  );
  const withWinner = bs.filter((b) => b.winnerA !== null && b.winnerB !== null);
  const flips = withWinner.filter((b) => b.winnerFlips);
  const share = (xs, total) => (total ? +(xs / total).toFixed(4) : 0);
  return {
    boundaries: bs.length,
    paybackSamples: withPayback.length,
    overPaybackLimit: overPayback.length,
    paybackShare: share(overPayback.length, withPayback.length),
    maxPaybackDelta: withPayback.length
      ? +Math.max(...withPayback.map((b) => b.paybackDelta)).toFixed(3)
      : 0,
    winnerSamples: withWinner.length,
    winnerFlips: flips.length,
    winnerFlipShare: share(flips.length, withWinner.length),
    // #355's acceptance: re-base or visibly label a layer when its boundary
    // delta moves payback by more than a year, or flips the winner on more than
    // 10% of boundary samples.
    mustRebaseOrLabel:
      share(overPayback.length, withPayback.length) > 0 ||
      share(flips.length, withWinner.length) > WINNER_FLIP_SHARE_LIMIT,
  };
}

function main() {
  const points = gridLayers();
  const layers = marginalise(points);
  const bs = boundaries(points);
  const summary = summarize(bs);

  // Audience-weighted: the dropdown's own presets, on the coordinate-only path.
  // Production additionally resolves country/region (ui.js:2485
  // resolveRegionCountry, private to the UI), which can only promote a point to
  // a MORE specific layer - so these shares are an upper bound on how often the
  // 0.28 fallback is what a visitor sees.
  const presets = presetCensus();
  const presetLayers = marginalise(presets);

  // The state layer needs a region STRING; probe it with the codes it knows.
  const stateProbe = ["TX", "CA", "NY", "FL", "HI", "AK"].map((code) => {
    const withCode = estimateTariff(30, -100, code);
    const without = estimateTariff(30, -100);
    return {
      code,
      withCodeLayer: withCode.label,
      withCodeRate: withCode.rate,
      withCodeLaborF: withCode.laborF,
      withoutCodeLayer: without.label,
      withoutCodeRate: without.rate,
    };
  });

  const stamps = dateStamps();
  const out = {
    issue: 355,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { PAYBACK_DELTA_LIMIT_YEARS, WINNER_FLIP_SHARE_LIMIT },
    representativeSystem: {
      ...SYSTEM,
      PV_PER_W,
      BATT_PER_KWH,
      DAILY_KWH,
      BILL_CUT,
    },
    gridPoints: points.length,
    layers,
    presets: {
      count: presets.length,
      layers: presetLayers,
      globalAverageShare:
        presetLayers.find((l) => l.label === "global average")?.share ?? 0,
      caveat:
        "coordinate-only path; ui.js:2485 resolveRegionCountry (UI-private) can only promote a city to a more specific layer, so this is an UPPER BOUND on fallback exposure",
    },
    stateProbe,
    dateStamps: stamps,
    summary,
    worstBoundaries: [...bs]
      .filter((b) => b.paybackDelta !== null)
      .sort((a, b) => b.paybackDelta - a.paybackDelta)
      .slice(0, 12),
    boundaries: bs,
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-tariffLayers.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");

  console.log(
    "grid points:",
    points.length,
    "| distinct layers:",
    layers.length,
  );
  for (const l of layers.slice(0, 8)) {
    console.log(
      `  ${l.label.padEnd(34)} ${(l.share * 100).toFixed(1).padStart(5)}% rate ${l.minRate}..${l.maxRate} laborF ${l.laborF} landedF ${l.landedF}`,
    );
  }
  console.log(
    "presets:",
    presets.length,
    "| global-average share:",
    (
      (presetLayers.find((l) => l.label === "global average")?.share ?? 0) * 100
    ).toFixed(1) + "%",
  );
  console.log("state probe:", JSON.stringify(stateProbe.slice(0, 3)));
  console.log(
    "boundaries:",
    summary.boundaries,
    "| payback>1y:",
    summary.overPaybackLimit,
    "| winner flips:",
    summary.winnerFlips,
    "/",
    summary.winnerSamples,
    "| must:",
    summary.mustRebaseOrLabel,
  );
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-tariffLayers.mjs")
) {
  main();
}

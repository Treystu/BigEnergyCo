// Champion Audit #356 - the BOM's purchasable-configuration rounding.
//
// THE QUESTION. The sizing search optimises a CONTINUOUS system (2.87 kW of
// array, 6.4 kWh of bank). `buildBom` then converts it into hardware that can
// actually be bought, ceiling at every line: panels to whole 550 W modules, the
// bank to whole strings, the inverter to a standard class. The code says so out
// loud - "the shopping list rounds UP, the simulation did not" - and the
// hypothesis is that independent ceilings compound, so the buyable system prices
// out materially above the one whose payback the visitor is shown.
//
// THE BOM CARRIES NO PRICE, so the delta cannot be read off it. It carries
// QUANTITIES (panel count, provided kWh, inverter class). This harness prices
// those quantities at the SAME unit costs the engine used, so the only thing
// that differs between the two numbers is rounding - not a second price source.
//
//   simulated = pvKw * 1000 * costPerWpv + battKwh * battPerKwh + inv cost
//   buyable   = panelsKw * 1000 * costPerWpv + providedKwh * battPerKwh + class
//
// Battery is priced differently by both configurations the BOM returns, and
// they overshoot differently, so both are measured: DIY strings (the repo's
// stated budget basis) and retail 5.12 kWh modules.
//
// Acceptance, verbatim from #356: if the MEDIAN buyable-vs-simulated price
// delta exceeds 10% (or >25% at the smallest quartile), the payload must
// surface the buyable price alongside. Rounding rules themselves change only if
// a comparator cuts median overshoot by >=30% with zero feasibility violations.
//
// Run: node scripts/champion-audit-bomRounding.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-bomRounding.json

import { writeFileSync } from "node:fs";

import {
  CHEMISTRIES,
  expandProfile,
  flatProfile,
  sizeForBillCut,
  sizeForTier,
  simulateOffset,
} from "../assets/js/sizing/engine.js";
import { capacityScaleFor } from "../assets/js/sizing/chem-model.js";
import { buildBom, RETAIL_MODULE_KWH } from "../assets/js/sizing/bom.js";

// bom.js keeps AGM_BLOCK private: 12 V x 200 Ah = 2.4 kWh per block.
const AGM_BLOCK_KWH = (12 * 200) / 1000;

import { buildSite } from "./champion-audit-sizeForBillCut.mjs";

// Acceptance, verbatim from #356.
const MEDIAN_DELTA_LIMIT = 0.1;
const SMALL_QUARTILE_LIMIT = 0.25;

const CORPUS = [
  "Nairobi, Kenya",
  "Honolulu, USA",
  "Phoenix, USA",
  "London, UK",
  "Berlin, Germany",
  "Delhi, India",
  "Sydney, Australia",
  "Cairo, Egypt",
];
// Loads deliberately span the SMALL end, where a whole string is proportionally
// biggest: #356's own hypothesis is about small simulated systems.
const LOADS = [4, 8, 15, 30];
const MODES = ["offgrid", "billcut"];
const CHEMISTRIES_LIST = ["lfp", "naion", "agm"];

function sizeOnce({ city, kwhPerDay, mode, chemistry }) {
  const site = buildSite(city, kwhPerDay);
  const loadWh = expandProfile(flatProfile(kwhPerDay), site.e1kw.length);
  const common = {
    e1kw: site.e1kw,
    loadWh,
    tempsC: site.tempsC,
    chemistry,
    years: 20,
    costPerWpv: site.costPerWpv,
    costPerKwhBatt: site.battPerKwh(chemistry),
    costPerKwInv: site.costPerKwInv,
    pvMax: 30,
    battMax: mode === "offgrid" ? 300 : 150,
    pvStep: 0.5,
    battStep: 1,
    capacityScale: capacityScaleFor(chemistry, site.meanTempC),
    laborPerKwh: site.laborPerKwh,
    invMinKw: 0,
    simulate: simulateOffset,
  };
  const best =
    mode === "offgrid"
      ? sizeForTier({ ...common, maxUnmetHoursPerYear: 87.6 })
      : sizeForBillCut({ ...common, minFraction: 0.8 });
  return { site, best };
}

/**
 * Price the simulated system and the buyable one on the same unit costs.
 * `labour` is left out of BOTH sides: it is paid per usable kWh and the two
 * systems differ in capacity, so including it would fold a capacity difference
 * into what is meant to be a rounding measurement.
 */
export function priceDelta({
  site,
  best,
  chemistry,
  kwhPerDay,
  batteryConfig = "diy",
}) {
  const usableDod = CHEMISTRIES[chemistry].usableDod;
  const battNameplateKwh = best.battKwh / usableDod;
  // run.js's own fallback when no appliance peak was entered: the daily mean
  // expressed as an hourly watt figure, flagged peakIsAverage so the BOM warns.
  const peakLoadW = Math.round((kwhPerDay * 1000) / 24);
  const bom = buildBom({
    pvKw: best.pvKw,
    battNameplateKwh,
    chemistry,
    peakLoadW,
    peakIsAverage: true,
    panelWatts: 550,
  });

  const pvCost = (kw) => kw * 1000 * site.costPerWpv;
  const batt = batteryConfig === "diy" ? bom.battery.diy : bom.battery.retail;
  // The retail config reports a MODULE COUNT, not a capacity - it has no
  // providedKwh field at all. Reading providedKwh off it yields 0 and turns the
  // comparison into "PV plus an inverter" against a full system, which is how
  // the first pass reported retail as 34% CHEAPER than the simulation.
  const providedNameplateKwh =
    batteryConfig === "diy"
      ? (batt?.providedKwh ?? 0)
      : chemistry === "agm"
        ? (batt?.modules ?? 0) * AGM_BLOCK_KWH
        : (batt?.modules ?? 0) * RETAIL_MODULE_KWH;
  // `battPerKwh` is a LANDED PRICE PER USABLE kWh (pricing.js:162), and every
  // BOM quantity above is NAMEPLATE. Pricing nameplate at a per-usable price
  // multiplies the battery bill by 1/DoD - 1.25x for LFP, 2x for AGM - which is
  // how the first pass of this harness manufactured a 170% overshoot. Convert
  // the provided capacity to usable before it meets a per-usable price.
  const providedUsableKwh = providedNameplateKwh * usableDod;
  const panelsKw = (bom.panels.count * (bom.panels.watts ?? 550)) / 1000;
  const invKw = bom.inverter.recommendedKw;

  // The engine costs the inverter on PV kW (`Math.max(pv, invMinKw)` with
  // invMinKw 0), so the inverter term is identical on both sides; using the
  // same expression keeps the comparison purely about PV and battery quantity.
  const simulatedTotal =
    pvCost(best.pvKw) +
    best.battKwh * site.battPerKwh(chemistry) +
    best.pvKw * site.costPerKwInv;
  const buyableTotal =
    pvCost(panelsKw) +
    providedUsableKwh * site.battPerKwh(chemistry) +
    best.pvKw * site.costPerKwInv;

  return {
    simulatedPvKw: best.pvKw,
    buyablePvKw: +panelsKw.toFixed(3),
    simulatedBattKwh: best.battKwh,
    battNameplateKwh: +battNameplateKwh.toFixed(2),
    providedNameplateKwh: +Number(providedNameplateKwh).toFixed(2),
    providedUsableKwh: +Number(providedUsableKwh).toFixed(2),
    // The price-basis-free form of the same finding: how much more capacity the
    // shopping list actually delivers than the search optimised for.
    battOvershoot: best.battKwh
      ? +(providedUsableKwh / best.battKwh - 1).toFixed(6)
      : null,
    inverterKw: invKw,
    simulatedUsd: +simulatedTotal.toFixed(2),
    buyableUsd: +buyableTotal.toFixed(2),
    deltaUsd: +(buyableTotal - simulatedTotal).toFixed(2),
    delta: +((buyableTotal - simulatedTotal) / simulatedTotal).toFixed(6),
    feasibility: {
      areaM2: bom.feasibility?.areaM2 ?? null,
      ok: bom.feasibility?.ok ?? bom.feasibility?.feasible ?? null,
    },
  };
}

/** Quantile helper, linear interpolation, on a sorted copy. */
export function quantile(values, q) {
  if (!values.length) return null;
  const xs = [...values].sort((a, b) => a - b);
  const pos = (xs.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return xs[lo];
  return xs[lo] + (xs[hi] - xs[lo]) * (pos - lo);
}

/**
 * #356's acceptance. The small quartile is taken on SIMULATED system cost, so
 * "smallest quartile" means cheapest systems - the ones a whole extra string
 * hurts most - rather than cheapest deltas, which would be circular.
 */
export function summarize(rows) {
  const withDelta = rows.filter((r) => r && Number.isFinite(r.delta));
  const deltas = withDelta.map((r) => r.delta);
  const sorted = [...withDelta].sort((a, b) => a.simulatedUsd - b.simulatedUsd);
  const q1 = Math.max(1, Math.floor(sorted.length / 4));
  const smallQuartile = sorted.slice(0, q1);
  const median = quantile(deltas, 0.5);
  const smallMedian = quantile(
    smallQuartile.map((r) => r.delta),
    0.5,
  );
  return {
    cases: withDelta.length,
    medianDelta: median === null ? null : +median.toFixed(6),
    p90Delta: +(quantile(deltas, 0.9) ?? 0).toFixed(6),
    maxDelta: +(Math.max(...deltas) ?? 0).toFixed(6),
    smallQuartileCases: smallQuartile.length,
    smallQuartileMedianDelta:
      smallMedian === null ? null : +smallMedian.toFixed(6),
    // The requirement this audit is looking for.
    mustSurfaceBuyablePrice:
      median !== null &&
      (median > MEDIAN_DELTA_LIMIT ||
        (smallMedian !== null && smallMedian > SMALL_QUARTILE_LIMIT)),
    medianUsdDelta: +quantile(
      withDelta.map((r) => r.deltaUsd),
      0.5,
    ).toFixed(2),
  };
}

function main() {
  const rows = [];
  for (const batteryConfig of ["diy", "retail"]) {
    for (const city of CORPUS) {
      for (const kwhPerDay of LOADS) {
        for (const mode of MODES) {
          for (const chemistry of CHEMISTRIES_LIST) {
            const { site, best } = sizeOnce({
              city,
              kwhPerDay,
              mode,
              chemistry,
            });
            if (!best) continue;
            const row = priceDelta({
              site,
              best,
              chemistry,
              kwhPerDay,
              batteryConfig,
            });
            if (!row) continue;
            rows.push({
              batteryConfig,
              city,
              kwhPerDay,
              mode,
              chemistry,
              ...row,
            });
          }
        }
      }
    }
  }

  const byConfig = {};
  for (const cfg of ["diy", "retail"]) {
    byConfig[cfg] = summarize(rows.filter((r) => r.batteryConfig === cfg));
  }
  const overall = summarize(rows);

  console.log("DIY   ", JSON.stringify(byConfig.diy));
  console.log("RETAIL", JSON.stringify(byConfig.retail));
  console.log("ALL   ", JSON.stringify(overall));

  // The worst offenders, so the number is attributable to a case and not a cloud.
  const worst = [...rows]
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 8)
    .map((r) => ({
      city: r.city,
      kwhPerDay: r.kwhPerDay,
      mode: r.mode,
      chemistry: r.chemistry,
      batteryConfig: r.batteryConfig,
      simulatedUsd: r.simulatedUsd,
      buyableUsd: r.buyableUsd,
      delta: r.delta,
      simulatedBattKwh: r.simulatedBattKwh,
      providedUsableKwh: r.providedUsableKwh,
      battOvershoot: r.battOvershoot,
    }));

  const out = {
    issue: 356,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { MEDIAN_DELTA_LIMIT, SMALL_QUARTILE_LIMIT },
    priceBasis:
      "same unit costs the engine used (costPerWpv, battPerKwh per usable kWh, costPerKwInv); labour excluded from both sides",
    summary: { overall, byBatteryConfig: byConfig },
    worst,
    rows,
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-bomRounding.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-bomRounding.mjs")
) {
  main();
}

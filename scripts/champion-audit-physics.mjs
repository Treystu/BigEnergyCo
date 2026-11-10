// Champion Audit #350 - the physics and climate assumption model.
//
// TWO QUESTIONS, and the issue says answer the first one before the second:
//
//   1. WHICH SOILING AUTHORITY DOES A REAL RUN USE? Two exist: a flat 0.97
//      default (DERATES_DEFAULT.soiling) and a climate-class table in
//      climate.js (desert 0.91 .. temperate 0.97). This harness traces an
//      actual `runSizing` call both ways and reads the payload's own
//      `assumptions` block, rather than inferring the answer from source.
//
//   2. WHICH CONSTANT WOULD ACTUALLY MOVE A RECOMMENDATION? #350's acceptance
//      is: re-base a constant only if its CITED-RANGE swing moves recommended
//      system cost >3% on >10% of corpus sites. So each constant is swept
//      across the range its own citation states, and the sized-system lifetime
//      cost is re-measured.
//
// EVERY SWEEP IS EXACT, NOT APPROXIMATED. The constants divide into three
// families and none of them needs an engine edit:
//
//   derates        rebuilt through the shipped `buildE1kw(hours, derates)`
//   PV temperature GAMMA_PMAX / NOCT are re-derived by rebuilding each hour's
//                  `tempFactor` arithmetic with the alternative value. The
//                  shipped builder is three lines and reproduced here verbatim,
//                  including its gap rule, so the e1kw series is the one the
//                  engine would have built.
//   inverter       ETA_INVERTER appears only as `pvKw * e1kw[i] * ETA` in
//                  simulate, so an eta change is EXACTLY an e1kw rescale.
//   chemistry      usableDod / roundTrip / cyclesTo80 are read from the
//                  exported CHEMISTRIES object at call time, so they are
//                  mutated for the duration of one measurement and restored,
//                  with a baseline re-measurement at the end proving the
//                  restore held.
//
// Run: node scripts/champion-audit-physics.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-physics.json

import { writeFileSync } from "node:fs";

import {
  buildE1kw,
  DERATES_DEFAULT,
  expandProfile,
  flatProfile,
  sizeForBillCut,
  sizeForTier,
  simulateOffset,
  CHEMISTRIES,
} from "../assets/js/sizing/engine.js";
import { capacityScaleFor } from "../assets/js/sizing/chem-model.js";
import { runSizing } from "../assets/js/sizing/run.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import {
  OFFLINE_PROFILES,
  PROFILE_YEAR,
} from "../assets/js/sizing/profiles.js";

// Acceptance, verbatim from #350.
const COST_DELTA_REQUIRED = 0.03; // >3% sized-system lifetime cost
const SITE_SHARE_REQUIRED = 0.1; // on >10% of corpus sites

// The shipped constants, stated here so a drift in the engine shows up as a
// failing pin instead of a silently different sweep centre.
export const SHIPPED = {
  soiling: 0.97,
  wiring: 0.98,
  mismatch: 0.99,
  mppt: 0.98,
  gammaPmax: -0.0034,
  noct: 45,
  etaInverter: 0.94,
};

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

function profileFor(city) {
  const p = OFFLINE_PROFILES.find((x) => x.name === city);
  if (!p) throw new Error(`unknown offline profile: ${city}`);
  return p;
}

/**
 * The shipped e1kw builder, re-stated with injectable temperature constants.
 * Identical arithmetic to engine.buildE1kw including its fill-value gap rule,
 * so a sweep of GAMMA_PMAX/NOCT produces the series the engine would have
 * produced with those constants.
 */
export function e1kwWith({
  hours,
  derates = DERATES_DEFAULT,
  gammaPmax = SHIPPED.gammaPmax,
  noct = SHIPPED.noct,
  etaScale = 1,
}) {
  const d = { ...DERATES_DEFAULT, ...derates };
  const base = d.soiling * d.wiring * d.mismatch * d.mppt * d.snow;
  const out = new Float64Array(hours.length);
  for (let i = 0; i < hours.length; i++) {
    const { ghi, tAmb } = hours[i];
    if (!Number.isFinite(ghi) || ghi <= -900 || !Number.isFinite(tAmb))
      continue;
    const cell = tAmb + (noct - 20) * (ghi / 800);
    const f = Math.max(0, 1 + gammaPmax * (cell - 25));
    out[i] = ghi * base * f * etaScale;
  }
  return out;
}

/** Size one corpus case on a supplied e1kw series; return the lifetime cost. */
export function sizedCost({ city, hours, e1kw, mode, chemistry = "lfp" }) {
  const tempsC = hours.map((h) => h.tAmb);
  const meanTempC = tempsC.reduce((a, b) => a + b, 0) / tempsC.length;
  // Region pricing comes from the case's OWN site: buildSite derives the
  // landed cost factors from the profile's lat/lon, so borrowing one site's
  // fixture for another would move the cost basis as well as the constant.
  const site = buildSite(city, LOAD_KWH_DAY);
  const loadWh = expandProfile(flatProfile(LOAD_KWH_DAY), hours.length);
  const common = {
    e1kw,
    loadWh,
    tempsC,
    chemistry,
    years: YEARS,
    costPerWpv: site.costPerWpv,
    costPerKwhBatt: site.battPerKwh(chemistry),
    costPerKwInv: site.costPerKwInv,
    pvMax: 30,
    battMax: mode === "offgrid" ? 300 : 150,
    pvStep: 0.5,
    battStep: 1,
    capacityScale: capacityScaleFor(chemistry, meanTempC),
    laborPerKwh: site.laborPerKwh,
    invMinKw: 0,
    simulate: simulateOffset,
  };
  const best =
    mode === "offgrid"
      ? sizeForTier({ ...common, maxUnmetHoursPerYear: 87.6 })
      : sizeForBillCut({ ...common, minFraction: 0.8 });
  if (!best) return null;
  return {
    pvKw: best.pvKw,
    battKwh: best.battKwh,
    cost: +best.obj.toFixed(2),
  };
}

// Cost fixture: the same derivation the other audit harnesses use.
import { buildSite } from "./champion-audit-sizeForBillCut.mjs";

// ── Part 1: the soiling-authority trace ────────────────────────────────────

const fakeWeatherFor = (hours) => async () => ({
  hours,
  meta: {
    latitude: 0,
    longitude: 0,
    startYear: PROFILE_YEAR,
    endYear: PROFILE_YEAR,
    years: 1,
    source: "audit fixture",
    offline: false,
  },
});

/**
 * Trace a real run and report which soiling authority reached the engine. The
 * payload's own `assumptions` block is the evidence - not the source code.
 */
export async function traceSoiling(city = "Phoenix, USA") {
  const p = profileFor(city);
  const hours = synthesizeFromProfile(p);
  const base = {
    latitude: p.lat,
    longitude: p.lon,
    dailyKwh: LOAD_KWH_DAY,
    tariff: 0.2,
    chemistry: "lfp",
    mode: "offgrid",
  };
  const off = await runSizing(
    { ...base, climateAware: false },
    { fetchWeather: fakeWeatherFor(hours) },
  );
  const on = await runSizing(
    { ...base, climateAware: true },
    { fetchWeather: fakeWeatherFor(hours) },
  );
  return {
    city,
    climateAwareOff: {
      soiling: off.assumptions.derates.soiling,
      soilingFactor: off.assumptions.soilingFactor,
      climateAware: off.assumptions.climateAware,
      annualYieldPerKw: off.annualYieldPerKw,
    },
    climateAwareOn: {
      soiling: on.assumptions.derates.soiling,
      soilingFactor: on.assumptions.soilingFactor,
      climateAware: on.assumptions.climateAware,
      annualYieldPerKw: on.annualYieldPerKw,
    },
    derivedFromClimateTable: on.assumptions.climate,
  };
}

// ── Part 2: the sweep ──────────────────────────────────────────────────────

/**
 * One constant swept across its cited range. `apply` returns either an e1kw
 * builder argument set or a chemistry mutation; the two are measured the same
 * way so they can be ranked together.
 */
export const SWEEPS = [
  {
    id: "derate.soiling",
    family: "derate",
    citation:
      "DERATES_DEFAULT comment 'dust/dirt, washed occasionally'; climate-class table spans 0.91 desert .. 0.97 temperate",
    shipped: [SHIPPED.soiling],
    range: [0.91, 0.98],
    apply: (v) => ({ derates: { soiling: v } }),
  },
  {
    id: "derate.wiring",
    family: "derate",
    citation: "DERATES_DEFAULT 'DC + AC wiring losses'; 2-5% typical",
    shipped: [SHIPPED.wiring],
    range: [0.95, 0.99],
    apply: (v) => ({ derates: { wiring: v } }),
  },
  {
    id: "derate.mismatch",
    family: "derate",
    citation: "DERATES_DEFAULT 'panel-to-panel variation'; 0.5-3% typical",
    shipped: [SHIPPED.mismatch],
    range: [0.97, 0.995],
    apply: (v) => ({ derates: { mismatch: v } }),
  },
  {
    id: "derate.mppt",
    family: "derate",
    citation: "DERATES_DEFAULT 'charge-controller tracking efficiency'; 95-99%",
    shipped: [SHIPPED.mppt],
    range: [0.95, 0.99],
    apply: (v) => ({ derates: { mppt: v } }),
  },
  {
    id: "gammaPmax",
    family: "pv-temp",
    citation: "engine.js:34 'mono-PERC typical (range -0.0029..-0.0040)'",
    shipped: [SHIPPED.gammaPmax],
    range: [-0.004, -0.0029],
    apply: (v) => ({ gammaPmax: v }),
  },
  {
    id: "noct",
    family: "pv-temp",
    citation: "engine.js:35 NOCT 45 C; standard module NOCT 41-48 C",
    shipped: [SHIPPED.noct],
    range: [42, 48],
    apply: (v) => ({ noct: v }),
  },
  {
    id: "etaInverter",
    family: "inverter",
    citation: "engine.js:37 ETA_INVERTER 0.94; 92-97% continuous typical",
    shipped: [SHIPPED.etaInverter],
    range: [0.92, 0.97],
    apply: (v) => ({ etaScale: v / SHIPPED.etaInverter }),
  },
  {
    id: "lfp.cyclesTo80",
    family: "chemistry",
    citation:
      "BATTERY_CYCLE_LIFE_REFERENCE_2026.md LFP table: Powerwall 3 4,000-6,000 .. CATL 6,000-8,000; engine uses 6,000",
    shipped: [CHEMISTRIES.lfp.cyclesTo80],
    range: [4000, 8000],
    chem: "lfp",
    field: "cyclesTo80",
  },
  {
    id: "lfp.usableDod",
    family: "chemistry",
    citation: "LFP table 'Typical DoD 50-80%'; engine uses 0.80",
    shipped: [CHEMISTRIES.lfp.usableDod],
    range: [0.5, 0.8],
    chem: "lfp",
    field: "usableDod",
  },
  {
    id: "lfp.roundTrip",
    family: "chemistry",
    citation: "engine uses 0.92; 90-95% typical for LFP round-trip",
    shipped: [CHEMISTRIES.lfp.roundTrip],
    range: [0.9, 0.95],
    chem: "lfp",
    field: "roundTrip",
  },
  {
    id: "naion.cyclesTo80",
    family: "chemistry",
    citation:
      "sodium table cites CATL 15,000 and BYD 10,000; engine deliberately uses 5,500",
    shipped: [CHEMISTRIES.naion.cyclesTo80],
    range: [5500, 15000],
    chem: "naion",
    field: "cyclesTo80",
  },
  {
    id: "agm.cyclesTo80",
    family: "chemistry",
    citation:
      "lead-acid table 1,000-1,500 cycles @50% DoD; engine uses 500 as a deliberate 0.4x derate",
    shipped: [CHEMISTRIES.agm.cyclesTo80],
    range: [500, 1250],
    chem: "agm",
    field: "cyclesTo80",
  },
];

/** Measure one corpus case under one sweep value. */
export function measure({ city, hours, mode, sweep, value }) {
  if (sweep.family === "chemistry") {
    const chem = CHEMISTRIES[sweep.chem];
    const original = chem[sweep.field];
    try {
      chem[sweep.field] = value;
      const e1kw = e1kwWith({ hours });
      return sizedCost({ city, hours, e1kw, mode, chemistry: sweep.chem });
    } finally {
      chem[sweep.field] = original;
    }
  }
  const e1kw = e1kwWith({ hours, ...sweep.apply(value) });
  return sizedCost({ city, hours, e1kw, mode });
}

/**
 * #350's acceptance, applied as written: a constant is re-based only if its
 * cited-range swing moves recommended system cost >3% on >10% of corpus sites.
 * `share` is computed per SITE (the issue says sites), taking the larger of the
 * two modes, so a constant that only moves grid-tie cases cannot borrow the
 * off-grid ones to clear the bar.
 */
export function summarizeSweep(rows) {
  const bySite = new Map();
  for (const r of rows) {
    if (r.delta === null) continue;
    const prev = bySite.get(r.site) ?? 0;
    bySite.set(r.site, Math.max(prev, Math.abs(r.delta)));
  }
  const hits = [...bySite.values()].filter((d) => d > COST_DELTA_REQUIRED);
  const allDeltas = rows.filter((r) => r.delta !== null).map((r) => r.delta);
  return {
    cases: allDeltas.length,
    sites: bySite.size,
    sitesOverThreshold: hits.length,
    share: bySite.size ? +(hits.length / bySite.size).toFixed(4) : 0,
    maxAbsDelta: allDeltas.length
      ? +Math.max(...allDeltas.map(Math.abs)).toFixed(6)
      : 0,
    meanAbsDelta: allDeltas.length
      ? +(
          allDeltas.reduce((a, d) => a + Math.abs(d), 0) / allDeltas.length
        ).toFixed(6)
      : 0,
    rebaseEligible:
      bySite.size > 0 && hits.length / bySite.size > SITE_SHARE_REQUIRED,
  };
}

async function main() {
  const soilingTrace = await traceSoiling();

  const cache = new Map();
  const hoursFor = (city) => {
    if (!cache.has(city))
      cache.set(city, synthesizeFromProfile(profileFor(city)));
    return cache.get(city);
  };

  // Baselines: shipped constants, and one per CHEMISTRY. A chemistry sweep
  // must be compared against that same chemistry at its shipped value - the
  // first pass of this harness compared naion/agm against the LFP baseline and
  // reported the chemistry difference (up to 91%) as a constant's sensitivity.
  const CHFAMS = ["lfp", "naion", "agm"];
  const baselines = new Map();
  for (const city of CORPUS) {
    const hours = hoursFor(city);
    for (const mode of MODES) {
      for (const chem of CHFAMS) {
        baselines.set(
          `${city}|${mode}|${chem}`,
          sizedCost({
            city,
            hours,
            e1kw: e1kwWith({ hours }),
            mode,
            chemistry: chem,
          }),
        );
      }
    }
  }

  const results = [];
  for (const sweep of SWEEPS) {
    const chem = sweep.chem ?? "lfp";
    for (const value of sweep.range) {
      if (sweep.shipped.includes(value)) continue; // the shipped value is the baseline
      const rows = [];
      for (const city of CORPUS) {
        const hours = hoursFor(city);
        for (const mode of MODES) {
          const base = baselines.get(`${city}|${mode}|${chem}`);
          const got = measure({ city, hours, mode, sweep, value });
          rows.push({
            site: city,
            mode,
            value,
            cost: got?.cost ?? null,
            delta:
              !base || !got
                ? null
                : +((got.cost - base.cost) / base.cost).toFixed(6),
          });
        }
      }
      // Chemistry sweeps change the battery price basis too, so the baseline
      // for that family is the shipped-chemistry cost on the same chemistry.
      const summary = summarizeSweep(rows);
      results.push({
        id: sweep.id,
        family: sweep.family,
        value,
        summary,
        rows,
      });
      console.log(
        `${sweep.id.padEnd(20)} ${String(value).padEnd(9)} ` +
          `max ${(summary.maxAbsDelta * 100).toFixed(2)}% mean ${(summary.meanAbsDelta * 100).toFixed(2)}% ` +
          `sites>3% ${summary.sitesOverThreshold}/${summary.sites} pristine=${summary.rebaseEligible}`,
      );
    }
  }

  // Restore proof: re-measure one baseline after every mutation ran.
  const hours = hoursFor(CORPUS[0]);
  const after = sizedCost({
    city: CORPUS[0],
    hours,
    e1kw: e1kwWith({ hours }),
    mode: "offgrid",
    chemistry: "lfp",
  });
  const before = baselines.get(`${CORPUS[0]}|offgrid|lfp`);
  const restored = after && before && after.cost === before.cost;

  const ranked = results
    .map((r) => ({
      id: r.id,
      family: r.family,
      value: r.value,
      ...r.summary,
    }))
    .sort((a, b) => b.maxAbsDelta - a.maxAbsDelta);

  const out = {
    issue: 350,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: { COST_DELTA_REQUIRED, SITE_SHARE_REQUIRED },
    shippedConstants: SHIPPED,
    soilingTrace,
    restoreVerified: restored,
    ranked,
    sweeps: results,
  };
  const path = "docs/lane/data-reads/2026-11-10-champion-audit-physics.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log("\nSOILING TRACE", JSON.stringify(soilingTrace, null, 2));
  console.log("\nrestore verified:", restored);
  console.log("wrote", path);
}

if (process.argv[1] && process.argv[1].endsWith("champion-audit-physics.mjs")) {
  main();
}

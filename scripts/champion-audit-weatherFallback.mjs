// Champion Audit #357 - weather-source selection and fallback.
//
// WHAT #357 ASKS FOR. Size every preset city on BOTH series - the live 5-year
// NASA POWER series and the bundled synthetic fallback - and publish the
// per-tier PV/battery deltas, plus the fallback-sized system's unmet hours when
// replayed through the live series.
//
// THAT COMPARISON CANNOT BE RUN IN THIS LANE, and this harness says so with
// evidence rather than silently substituting something easier. The repository
// carries no NASA POWER series: `OFFLINE_PROFILES` are month x hour MEANS, and
// every offline sized run - including every test fixture - builds its series
// from them via `synthesizeFromProfile`. There is no second series to compare
// against, offline or cached.
//
// WHAT CAN BE MEASURED, AND IS THE MECHANISM THE HYPOTHESIS NAMES. #357's gap
// is that "a typical-year MEAN profile contains no bad years and no dark
// stretches by construction - means smooth exactly the extremes the reliability
// tiers price". That is a structural claim about the fallback series, and it is
// directly measurable: `synthesizeFromProfile` emits `ghi[m][h]` for every day
// of month m, so EVERY DAY INSIDE A MONTH IS BYTE-IDENTICAL. That gives:
//
//   - zero day-to-day variance (no cloudy day beside a clear one),
//   - zero multi-day dark stretches (the thing a battery is sized for),
//   - zero interannual variance (so a "worst year" over 5 years is vacuous),
//   - exactly 12 distinct daily shapes in 365 days.
//
// The harness quantifies that, then measures how much the tiers can possibly
// discriminate on such a series, and states the bound the missing live data
// would have to close.
//
// Run: node scripts/champion-audit-weatherFallback.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-weatherFallback.json

import { writeFileSync } from "node:fs";

import {
  expandProfile,
  flatProfile,
  sizeForTier,
  simulate,
  simulateOffset,
  RELIABILITY_TIERS,
} from "../assets/js/sizing/engine.js";
import { capacityScaleFor } from "../assets/js/sizing/chem-model.js";
import { synthesizeFromProfile } from "../assets/js/sizing/nasa.js";
import {
  OFFLINE_PROFILES,
  PROFILE_YEAR,
} from "../assets/js/sizing/profiles.js";

import { buildSite } from "./champion-audit-sizeForBillCut.mjs";

const LOAD_KWH_DAY = 10; // run.js's own default when the visitor has not said
const YEARS = 20;

/** Daily GHI sums, one per day of the synthesized year. */
export function dailyGhiSums(hours) {
  const days = [];
  for (let d = 0; d * 24 + 24 <= hours.length; d++) {
    let s = 0;
    for (let h = 0; h < 24; h++) s += hours[d * 24 + h].ghi;
    days.push(+s.toFixed(3));
  }
  return days;
}

/**
 * The structural measurement. Everything here is a property of the fallback
 * series itself, computed from the shipped generator rather than asserted.
 */
export function seriesStructure(profile) {
  const hours = synthesizeFromProfile(profile);
  const days = dailyGhiSums(hours);
  const distinctDays = new Set(days).size;
  // Longest run of consecutive identical daily totals - the direct measure of
  // "no weather events": one is the minimum possible, 365 would be a constant.
  let longestRun = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] ? run + 1 : 1;
    if (run > longestRun) longestRun = run;
  }
  return {
    city: profile.name,
    hours: hours.length,
    days: days.length,
    distinctDailyProfiles: distinctDays,
    longestIdenticalDayRun: longestRun,
    minDailyGhi: Math.min(...days),
    maxDailyGhi: Math.max(...days),
    // Interannual variance is zero by construction: the generator emits one
    // year, so a multi-year series is that same year repeated.
    interannualVariance: 0,
  };
}

/** Size every reliability tier on the fallback series for one city. */
export function sizeTiers(profile, kwhPerDay = LOAD_KWH_DAY) {
  const site = buildSite(profile.name, kwhPerDay);
  const hours = synthesizeFromProfile(profile);
  const loadWh = expandProfile(flatProfile(kwhPerDay), hours.length);
  const capacityScale = capacityScaleFor("lfp", site.meanTempC);
  const out = [];
  for (const tier of RELIABILITY_TIERS) {
    const worst = sizeForTier({
      e1kw: site.e1kw,
      loadWh,
      tempsC: site.tempsC,
      chemistry: "lfp",
      maxUnmetHoursPerYear: tier.maxUnmetHoursPerYear,
      years: YEARS,
      costPerWpv: site.costPerWpv,
      costPerKwhBatt: site.battPerKwh("lfp"),
      costPerKwInv: site.costPerKwInv,
      pvMax: 30,
      battMax: 300,
      pvStep: 0.5,
      battStep: 1,
      capacityScale,
      laborPerKwh: site.laborPerKwh,
      invMinKw: 0,
      simulate: simulateOffset,
    });
    out.push({
      tier: tier.id,
      maxUnmetHoursPerYear: tier.maxUnmetHoursPerYear,
      pvKw: worst?.pvKw ?? null,
      battKwh: worst?.battKwh ?? null,
      cost: worst ? +worst.obj.toFixed(2) : null,
      scenario: worst?.oversizeScenario ?? null,
    });
  }
  return { city: profile.name, tiers: out };
}

/**
 * How much a bad MONTH costs, as a bound on what the live series could change.
 * This is a SENSITIVITY PROBE, not weather: one month's GHI is scaled down and
 * the tier100 battery is re-sized. It answers "how much does the fallback
 * under-build if a real month is darker than the mean?" without claiming to
 * know any real month.
 */
export function darkMonthProbe(profile, scale = 0.7, kwhPerDay = LOAD_KWH_DAY) {
  const site = buildSite(profile.name, kwhPerDay);
  const hours = synthesizeFromProfile(profile).map((h) => ({ ...h }));
  // Scale the darkest month (lowest total GHI) - the one a winter-sizing
  // already leans on, and the one a real weather year would stress.
  const monthTotals = profile.ghi.map((row) => row.reduce((a, b) => a + b, 0));
  const darkMonth = monthTotals.indexOf(Math.min(...monthTotals));
  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayStart = 0;
  for (let m = 0; m < darkMonth; m++) dayStart += MONTH_DAYS[m];
  const from = dayStart * 24;
  const to = (dayStart + MONTH_DAYS[darkMonth]) * 24;
  for (let i = from; i < to; i++) hours[i].ghi *= scale;
  const e1kw = site.e1kw.map((v) => v); // base series for the baseline sizing
  const loadWh = expandProfile(flatProfile(kwhPerDay), hours.length);
  const capacityScale = capacityScaleFor("lfp", site.meanTempC);

  const size = (eSeries) =>
    sizeForTier({
      e1kw: eSeries,
      loadWh,
      tempsC: site.tempsC,
      chemistry: "lfp",
      maxUnmetHoursPerYear: 0,
      years: YEARS,
      costPerWpv: site.costPerWpv,
      costPerKwhBatt: site.battPerKwh("lfp"),
      costPerKwInv: site.costPerKwInv,
      pvMax: 30,
      battMax: 300,
      pvStep: 0.5,
      battStep: 1,
      capacityScale,
      laborPerKwh: site.laborPerKwh,
      invMinKw: 0,
      simulate: simulateOffset,
    });

  // Rebuild e1kw from the perturbed hours through the shipped builder.
  const { buildE1kw } = engineExports;
  const darkE1 = buildE1kw(hours);
  const base = size(e1kw);
  const dark = size(darkE1);
  return {
    city: profile.name,
    darkMonth: darkMonth + 1,
    scale,
    baselineBattKwh: base?.battKwh ?? null,
    darkMonthBattKwh: dark?.battKwh ?? null,
    battDelta:
      base && dark && base.battKwh
        ? +((dark.battKwh - base.battKwh) / base.battKwh).toFixed(6)
        : null,
    baselinePvKw: base?.pvKw ?? null,
    darkMonthPvKw: dark?.pvKw ?? null,
  };
}

// Imported once, so the probe above can rebuild e1kw for perturbed hours.
import * as engineExports from "../assets/js/sizing/engine.js";

function main() {
  const structure = OFFLINE_PROFILES.map(seriesStructure);
  const tiers = OFFLINE_PROFILES.map((p) => sizeTiers(p));
  const probe = OFFLINE_PROFILES.map((p) => darkMonthProbe(p));

  const allIdentical = structure.every((s) => s.longestIdenticalDayRun >= 28);
  const twelveShapes = structure.every((s) => s.distinctDailyProfiles <= 12);

  // How far apart are the tiers on a series with no weather events? If the
  // tiers still separate, they separate on seasonal means alone.
  const tierSpread = tiers
    .map((t) => {
      const b = t.tiers.find((x) => x.tier === "tier100")?.battKwh;
      const loose = t.tiers.find((x) => x.tier === "tier95")?.battKwh;
      return b && loose ? +((b - loose) / b).toFixed(6) : null;
    })
    .filter((v) => v !== null);

  const probeDeltas = probe
    .filter((p) => p.battDelta !== null)
    .map((p) => p.battDelta);

  const out = {
    issue: 357,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    profileYear: PROFILE_YEAR,
    offlineProfileCount: OFFLINE_PROFILES.length,
    liveComparisonPossible: false,
    liveComparisonBlocker:
      "No NASA POWER series exists in the repo, offline or cached; OFFLINE_PROFILES are month x hour means and every offline run (including test fixtures) builds its series from them with synthesizeFromProfile. The issue's live-vs-fallback sizing comparison therefore has no second series to read.",
    structure: {
      allMonthsIdenticalWithin: allIdentical,
      everyCityAtMost12Shapes: twelveShapes,
      cities: structure,
    },
    tiers,
    tierSpread: {
      cases: tierSpread.length,
      medianTier100VsTier95Battery: tierSpread.length
        ? +[...tierSpread]
            .sort((a, b) => a - b)
            [Math.floor((tierSpread.length - 1) / 2)].toFixed(6)
        : null,
    },
    darkMonthProbe: {
      note: "SENSITIVITY PROBE, not weather: the darkest mean month scaled to 70% GHI. Bounds what a darker-than-average real month would do to a tier100 battery.",
      cases: probe,
      medianBattDelta: probeDeltas.length
        ? +[...probeDeltas]
            .sort((a, b) => a - b)
            [Math.floor((probeDeltas.length - 1) / 2)].toFixed(6)
        : null,
      maxBattDelta: probeDeltas.length
        ? +Math.max(...probeDeltas).toFixed(6)
        : null,
      citiesOver10pct: probeDeltas.filter((d) => d > 0.1).length,
    },
  };
  const path =
    "docs/lane/data-reads/2026-11-10-champion-audit-weatherFallback.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");

  console.log(
    "structure: all months identical within:",
    allIdentical,
    "| at most 12 shapes:",
    twelveShapes,
  );
  console.log(
    "tier100 vs tier95 battery, median:",
    out.tierSpread.medianTier100VsTier95Battery,
  );
  console.log(
    "dark-month probe median batt delta:",
    out.darkMonthProbe.medianBattDelta,
    "max:",
    out.darkMonthProbe.maxBattDelta,
    "cities>10%:",
    out.darkMonthProbe.citiesOver10pct,
    "/",
    probeDeltas.length,
  );
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-weatherFallback.mjs")
) {
  main();
}

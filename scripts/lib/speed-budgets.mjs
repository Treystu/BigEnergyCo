// What the real-page speed readings MEAN (#433).
//
// The instrument that takes the reading is scripts/measure-speed.mjs; the gate
// that runs on every commit is scripts/check-speed.mjs. This file owns the
// numbers, so a budget can only be raised in one place, with its history.
//
// THE RULE, same as scripts/lib/performance-budgets.mjs: a budget may only be
// declared from a reading this repo took, and the reading is recorded beside it
// in SPEED_FIRST_MEASUREMENT. A budget typed in from an aspiration is a number
// nobody can check.
//
// TWO KINDS OF AXIS, DELIBERATELY KEPT APART:
//
//   1. ARTIFACT AXES (bytes, on disk, uncompressed): deterministic, so they run
//      on the rail at every head. They catch the regression a reviewer cannot
//      see — a module quietly growing onto the first-load path.
//   2. WIRE AXES (phone-class timings and transferred bytes): real but not
//      reproducible on the rail, whose executor is a dependency-free Node image
//      with no browser (see .circleci/config.yml's PHASE 1 note). These are
//      measured by scripts/measure-speed.mjs on the deployed staging artifact
//      and recorded here with their conditions. They are a regression tripwire
//      for a human-run reading, never a claim the rail checks.

/**
 * Artifact bytes that may not grow without a decision (on disk, uncompressed).
 *
 * These are TRIPWIRES, not a product bar: they start at today's measured size
 * plus a small explicit headroom, and they only move when a change is reviewed
 * against the reading below. The product bar lives in `wire_targets`, which is
 * what a phone actually waits on.
 */
export const SPEED_BUDGETS = {
  // The document and everything its own markup pulls: stylesheets, classic and
  // module scripts, preloads, the manifest and icons, the CSS url() fonts, and
  // the static import closure of every script above.
  first_load_files_bytes: 1_115_000,
  // The dynamic-import closure of that graph beyond it: charts, profiles, the
  // run preload, and the packaged locale dictionaries. Fetched after paint, so
  // it can be bigger — but it may not grow unwatched, because a dynamic import
  // that resolves during boot is first-load cost wearing a deferral's name.
  deferred_layer_files_bytes: 1_055_000,
};

/**
 * The readings these budgets were declared from, and the cure that moved them.
 *
 * Both readings are the same instrument, the same profile, the same city
 * (Honolulu), against the DEPLOYED staging artifact — Slow 4G (1.6 Mbps down /
 * 750 kbps up, 150 ms RTT), 4x CPU throttle, 390x844 at 3x, cache disabled, so
 * every run is a first load. `before` is Wave 2's staging build
 * (6dccec5f, stamp 20261127a); `after` is the same tree with the weather wire
 * switched to CSV (#433's cure).
 */
export const SPEED_FIRST_MEASUREMENT = {
  conditions: {
    network: "Slow 4G, 1.6 Mbps down / 750 kbps up, 150 ms RTT",
    cpu: "4x throttle",
    viewport: "390x844 @3x, cache disabled",
    surface: "deployed staging artifact",
    city: "Honolulu",
    adjustments: 0,
  },
  before: {
    surface: "https://6dccec5f.bigenergyco.pages.dev",
    lcp_ms: 1308,
    entry_transfer_bytes: 644_065,
    results_transfer_bytes: 1_795_599,
    ttfn_ms: 15_898,
    ttfn_ms_weather_blocked: 3_162,
  },
  after: {
    surface: "https://9c1dcd34.bigenergyco.pages.dev",
    lcp_ms: 1152,
    entry_transfer_bytes: 643_937,
    results_transfer_bytes: 1_205_043,
    ttfn_ms: 11_051,
    ttfn_ms_weather_blocked: 2_113,
    // Run 0 only: runs 2+ in one browser are service-worker warm, which the
    // instrument now says out loud instead of averaging into the reading.
    note: "cold run 0, same profile and city as `before`",
  },
  // Where the wait actually is, so the budget cannot be read as an opinion.
  // Blocking the weather host splits the run: the difference is third-party
  // transport and nothing else.
  finding: {
    weather_share_of_ttfn:
      "12.7 s of 15.9 s cold before the cure; 8.9 s of 11.1 s after it. The " +
      "results phase still carries three POWER pulls (1,755,000 JSON bytes " +
      "before, 1,164,000 CSV bytes after)",
    nasa_payload:
      "the endpoint serves UNCOMPRESSED JSON: 653,437 bytes per two-year " +
      "chunk, 144,088 gzipped, offered with no Content-Encoding",
    cure:
      "ask for CSV instead: 417,287 bytes for the same two years (36% fewer " +
      "bytes), parsed by parseHourlyCsv with the JSON parser kept as the " +
      "fallback for any body that is not CSV. Measured effect: results " +
      "transfer 1,795,599 -> 1,205,043 bytes, time to first number 15,898 -> " +
      "11,051 ms cold, and the versioned asset stamp is unchanged",
    remaining_lever:
      "edge compression of the weather pull. NOT available to this lane: no " +
      "origin serves /api (*/api/health measured 404 on the staging preview, " +
      "pages.dev apex and the apex domain), so a same-origin compressed proxy " +
      "cannot be deployed by the static Pages flow. Recorded on #433.",
  },
  /** Wire axes a human-run reading must clear. Not rail-enforced. */
  wire_targets: {
    lcp_ms: 2500,
    ttfn_ms: 13_000,
    ttfn_ms_weather_blocked: 4000,
    results_transfer_bytes: 1_300_000,
  },
  /** The artifact readings the budgets above were declared from. */
  artifact: {
    first_load_files_bytes: 1_107_786,
    deferred_layer_files_bytes: 1_046_672,
    stage: "_pages_staging built from the tree that ships this file",
    note:
      "measured by scripts/check-speed.mjs --list, which also names the files" +
      " behind each number so a raise can be argued file by file",
  },
};

/**
 * Judge a reading against the budgets.
 *
 * Returns every axis with its value, budget and verdict, plus `ok` — true only
 * when every axis present in the reading is within budget. A missing axis is
 * reported as skipped rather than passed: an instrument that stopped producing
 * a number must not be the way a budget goes green.
 */
export function evaluateSpeedReading(reading = {}, budgets = SPEED_BUDGETS) {
  const checks = [];
  for (const [axis, budget] of Object.entries(budgets)) {
    const value = reading[axis];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      checks.push({ axis, value: null, budget, ok: false, skipped: true });
      continue;
    }
    checks.push({
      axis,
      value,
      budget,
      delta: value - budget,
      ok: value <= budget,
      skipped: false,
    });
  }
  return { ok: checks.every((c) => c.ok), checks };
}

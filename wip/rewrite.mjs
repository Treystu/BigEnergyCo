// Authored rewrite pass for assets/js/sizing/ui.js comment prose (#365 byte
// leg). Replaces whole comment blocks by line range with shorter, coherent text.
// Refuses to run unless every target range is comment-only.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "assets/js/sizing/ui.js";
const COMMENT = /^\s*(\/\/|\/\*|\*(?!\/)|\*\/)/;
const blocks = JSON.parse(readFileSync("wip/blocks.json", "utf8"));

const R = {
  0: `    // THE SAME REPAINT, once, immediately — the load-bearing call.
    // The dictionary is a deferred import and translate() echoes the key until it
    // lands, so updateLoadReadout() and applyUseCase(), painted during setup before
    // \`await applyI18n()\` above, showed raw keys; applyI18n() only rewrites
    // data-i18n MARKUP and cannot repair them. Re-running both painters afterwards
    // costs one call and no network, and keeps every runtime-painted surface in one
    // owner.`,
  1: ` * Cumulative 20-year cost chart: three running sums for the recommended system
 * — amber stayed-on-grid spend, emerald the system's own cost (capex + labor +
 * swaps; it ends exactly on the card's "Total 20-year cost"), slate the residual
 * bills net of feed-in credit (negative under net metering). Amber is a literal
 * STACK of emerald + slate + saving, so each slice is visible inside it. Red fills
 * where amber sits below the with-solar stack; a lower panel bars the running
 * difference and an HTML callout carries the headline.
 */`,
  2: `/**
 * THE INSTALLER-vs-DIRECT SENTENCE, priced instead of guessed.
 *
 * It used to price "a typical installer quote" as a MULTIPLE of the hardware
 * estimate (10x cheapest, 5x dearest) plus a flat hookup figure — invented at the
 * point of display, so the gap measured what each side counted rather than price,
 * which is what D-01 §6.4 forbids (R-PATH-03). Both paths now come from ONE priced
 * model over ONE system, which also removes the old negative-saving wording
 * structurally. With no priced comparison the sentence degrades to the hardware
 * cost and points at the panel.
 */`,
  3: `// The FX provenance line (P1.4, F-10), rendered on every load including the
// offline one: "no source and no date" was the defect. data-i18n stays set for the
// static and failed wordings so a later applyI18n() re-translates them, and is
// removed for live and stale because those carry a date the static key cannot
// express.
/**
 * The rate's own date in plain words: the provider's raw RFC-822 string printed
 * as-is read as a date from the wrong window (the V1 defect), so it is formatted as
 * a plain date and the locale sentence says whose date it is.
 */`,
  4: `// THE FOUR WAYS TO PAY FOR ONE SYSTEM (master plan D-01 §6.4, R-PATH-01..10).
//
// LAZY, measured: paths.js as a static import was fetched and parsed before the
// first result card — 10,310 B of the metric for a section that renders after the
// result. Both surfaces that read the model render inside ONE await after it
// resolves, so the page never shows a guessed quote and then corrects it, which is
// the defect D-01 exists to remove.`,
  5: `/**
 * BOTH surfaces that read the priced comparison, in the order that makes them
 * agree: the panel prices, the sentence quotes the result. Awaited because the
 * model loads lazily (loadPaths) — nothing paints until it is in hand. A generation
 * counter, not a lock: a late resolve from a superseded system must not repaint.
 */`,
  6: `  // If inputs changed, preserve their newer status: a queued replacement is retried
  // against a fresh worker, otherwise the timed-out sequence retires.
  // abandon() and not invalidate() — the worker is terminated so no reply is coming,
  // and a busy channel would swallow the next click, leaving "click Size My System
  // to try again" above a button that cannot be retried.`,
  7: `// ── Selected system ─────────────────────────────────────────────────────────
// One system drives everything below the run (charts, hardware list, export
// figures, share link, print); it falls back to the recommendation.
// ── Jev sanity check ────────────────────────────────────────────────────────
// One probe per distinct result state, cached by state fingerprint. A confident
// "impossible" verdict on deterministic output means a rescale/merge bug, so the
// response is one full engine re-run; a flag on the re-run renders as-is.`,
  8: `    // Single writer: the goal buttons never touch systemGoal. They select a CASE and
    // let applyUseCase derive the enum, so button and chooser cannot drift. Choosing
    // by mode, not label: backup and offgrid share the mode and backup sizes the
    // essentials only, so defaulting a mode switch onto it would silently resize.`,
  9: `/**
 * Repaint every surface whose text comes from the dictionary but whose node is
 * built by JS rather than data-i18n markup. Single owner, called after applyI18n()
 * on first paint and once per beco:lang change: the first stops a key showing, the
 * second stops two languages showing at once. Both re-run existing painters, so a
 * surface cannot drift from the code that fills it.
 */`,
  10: `// ── Worker reply deadline ───────────────────────────────────────────────────
// A worker that never replies must surface an honest retryable error instead of
// hanging on "running…" (reproduced live through the share-restore auto-run). The
// watch lives in run-coordinator.js, armed by begin() and retired by settle() inside
// flushPendingRun(), so a stale token reports nothing. The three-minute bound is
// fixed so public URLs cannot weaken the recovery timer.`,
  11: `  // Which currency, in order of authority: (1) the country, when the location carries
  // one — every city partition records its ISO 3166-1 code, so this is a lookup;
  // (2) the tariff box, which is GEOGRAPHIC and spans countries its label does not
  // speak for ("United Kingdom / Ireland" gave Dublin pounds). The box decides the
  // TARIFF either way; only the currency is overridden.`,
  12: `/**
 * The levelized-cost row, named for what it measures. \`lcoeUsdPerKwh\` is the
 * system's cost per kWh it serves — most of the bill with panels, so "your power
 * cost" is honest. A battery-only run only MOVES energy still bought at the tariff,
 * so the same number is the cost of each shifted kWh; called "your power cost" it
 * read five times below the grid rate on a card saying the system never breaks even.
 */`,
  13: `    // V2's recipient gap: a share link exists to show someone's RESULT.
    // restoreFromShare() returns true only after the codec accepted the hash and every
    // input was written, so a malformed or hostile link never reaches run(). \`explicit\`
    // bypasses the authorization/dirty gates for this single load-time run.`,
  14: `// Simple mode's single results surface: same payload and same selected entry as the
// technical cards, so the numbers cannot diverge.
// ── Use cases: the one vocabulary the visitor sees ──────────────────────────
// Everything below reads usecases.js; nothing else defines a use case. The six
// blocks in index.html are shown or hidden from the registry's own inputsFor.`,
  15: `/** Compact column labels for the matrix header. */
// The auto-card note, rebuilt in the visitor's language (#365): the payload still
// ships the English autoNote, and the parts beside it name the chemistries and the
// basis id. One literal per target id, never concatenated — the key-existence gate
// scans for literal translate calls and would not see a built key.`,
  16: `  // A battery-only run builds no panels, so its tiers scale the battery alone. Feeding
  // the clamped basePvKw in presented a 12 kW array as the visitor's own system and
  // priced it with that array's panels, so the Current Selection baseline quoted a
  // different price for the same system. baseInvKw mirrors the engine's inverter
  // basis (never below the load peak).`,
  17: `// Background weather prefetch, fired the moment a location resolves so the ~2 MB pull
// overlaps form-filling. It runs INSIDE the sizing worker, whose in-flight dedupe
// guarantees one network pull even when a run starts mid-prefetch, and the warmed
// memo lands where runSizing looks. Deduped here too (WARMED_SITES); errors are
// silent because the run path owns the fallback story.`,
  18: `/**
 * THE COMPARISON PANEL: four priced routes to the SAME system, side by side. It never
 * computes — every figure is read out of the model purchasePaths priced, so no card
 * can disagree with the ELI5 sentence above it. The panel owns presentation and the
 * instrument toggle: a PPA buys ENERGY, a lease rents the SYSTEM, which genuinely
 * changes the price (R-PATH-02).
 */`,
  19: `  // Auto grid-tie: the recommendation follows the bill-cut slider, and the worker
  // re-derives the banner and focus from the custom target column, so the headline
  // savings describe the visitor's CURRENT cut. An explicitly null best means nothing
  // solves at this cut: retire the stale recommendation NOW rather than leaving the
  // previous target's system on screen.`,
  20: `        // Incremental cut patch: only the slider's "your target" column (and SOC bands
        // for an adopted curve point) — no full re-render, no scroll. A patch merges
        // only inside the CURRENT payload epoch, so a slice from pre-edit inputs, or one
        // a newer slider edit superseded, is dropped.`,
  21: `// The worker runs one full sizing at a time and cannot be preempted: a new run
// requested mid-flight collapses into a single trailing run instead of queueing stale
// engine work behind the slider. run-coordinator.js owns that state — busy, the
// retiring sequence, the collapsed request — and every reply is released through
// flushPendingRun().`,
  22: `/**
 * The ONE writer of the bill-cut row's visibility. The decision is pure
 * (mode-chrome.js) and reads CURRENT state — goal, on-screen result, use case — so
 * every state change re-syncs and no caller can leave a stale write behind. Before
 * this function the render wrote the row from the last result's mode and nothing
 * re-hid it on a goal switch.
 */`,
  23: `    // Deferred out of the first-result graph: nothing here runs before a visitor asks
    // for it. The loader arms the CTA's own pointerdown and click handlers, and the
    // feature module was already a click-time import. Without the loader the CTA is a
    // plain link — the same fallback the loader's catch takes.`,
  24: `/**
 * AUTO-comparison chart: one panel, each bank drawn against ITS OWN nameplate —
 * same-job systems deliver similar energy, so the honest difference is the reserve
 * each chemistry carries.
 */
/**
 * SOC reliability chart for ONE selected system: the same daily min/max band
 * machinery as the multi-tier chart, from the entry's nameplate bands.
 */`,
  25: `// ── Unified selection hub ───────────────────────────────────────────────────
// One selection drives every chart: the curve's blue dot, the SOC + savings charts,
// the hardware list and the granular icon panel. Slider drags only move a highlight
// through CACHED points; release commits the nearest cached system. The single
// on-demand worker lookup reconciles in the background.`,
  26: `    // AWAITED, deliberately: the dictionary is a deferred import, so calling
    // applyI18n() without awaiting would paint English and then swap it — a flash of
    // the wrong language on first paint. The fetch started at module evaluation, so
    // this waits for work the browser is already doing.`,
  27: `// Infeasibility banner: surfaces a structural (mode × hardware × target) reason above
// the cards so visitors know WHY nothing solved and what to change, and hides itself
// the moment a payload without a reason arrives.
// The code-to-copy mapping is owned by infeasible-copy.js and the copy by locales.js;
// what is left here is the rendering.`,
  28: `/**
 * Apply a use case: derive the legacy enum pair from it, sync the hidden selects, show
 * only the inputs this case declares, and say what it is for. The hidden selects are
 * still dispatched because every listener downstream hangs off them: the F-17 collapse
 * happens at this one boundary.
 */`,
  29: `// ── Unified curve selection state ───────────────────────────────────────────
// One curve, one selection. curvePreview is the slider drag-preview (highlight only,
// worker untouched); the committed selection lives in selectedKey / adoptedEntry /
// frontierSelected. focusFirst: grid-tie auto mode, where the granular focus panel
// REPLACES the matrix and the recommendation card.`,
  30: `  // One source of truth for the blue dot: the visitor's click wins, but with no click
  // the dot sits on the RECOMMENDATION at its true position — never snapped onto the
  // nearest curve point, which quietly displayed a different battery than the card.`,
  31: `// Serial for incremental "reSlice" patches within one payload epoch. Epoch links every
// patch to the payload it was computed against, so a slice from older inputs can never
// merge into a newer one. sliceBusy/pendingSlice collapse rapid slider edits the way the
// run channel collapses full runs.`,
  32: `  // No array, no tilt to advise on: the guide asks what "a flat roof forfeits" on a page
  // whose card reads "Solar array None (Battery-only)". Before a run the hardware
  // selector decides it, so the guide goes the moment "Battery only" is chosen.`,
  33: `  // The results panel is assembled by JS and applyI18n only rewrites data-i18n markup,
  // so switching language left the caption, the tariff line and the frontier verdict in
  // the previous language: one page, two languages. Re-rendering the payload costs
  // nothing (no engine run, no fetch).`,
  34: `  // Router mode: auto vs fixed-chemistry is a payload SHAPE distinction (fixed-chem runs
  // set p.auto = null; auto runs always set an array, which may be EMPTY when nothing
  // solved). Routing on content sent empty-auto payloads down the fixed-chem branch,
  // where renderBestPick's honest empty state was never reached.`,
  35: `    // A pricing model that will not load is a missing comparison: the panel's own
    // "priced comparison unavailable" empty state plus a status line, never a silent blank
    // and never an unhandled rejection. The in-flight load is cleared so the NEXT render
    // retries rather than inheriting this failure forever.`,
  36: `  // A zero delta is not a value. This used to return the bare word "Baseline", which every
  // row suffix-typed ("3.8 kW (Baseline kW)"), so the baseline rendered as a placeholder
  // where a number should be. The suffix carries its own unit and returns nothing at all
  // when there is no change.`,
  37: `    // Collapse: only the latest inputs matter, re-read fresh when flushed; a non-quiet
    // request wins so an explicit run still scrolls + spins. Retire the in-flight run FIRST
    // (the sequence bump) — without it a stale response would still pass the seq check and
    // clobber the screen.`,
  38: `// The one place the horizon crosses into the copy. A bare binding rather than
// pathsApi.HORIZON_YEARS because turnkeyQuoteText is sliced out of this file by
// tests/quote-text-bridge.mjs, which injects the horizon; renaming it would silently
// unbind the test. The VALUE has one owner (paths.js) either way.`,
  39: `// Granular icon panel: the selected system as icons + big numbers, rendered purely from
// the entry's cached analysis — no lookup.
// Net-metered monthly residual, one definition for every view: a negative residual means
// the utility pays the household, framed as the credit it is — never "~-$X/mo".`,
  40: `/**
 * The four paths for ONE system, or null when there is nothing to price.
 *
 * ONE owner: the ELI5 sentence and the comparison panel must not price the same system
 * twice, or the two can disagree on the turnkey band. The cache key is the priced
 * identity of the system, so re-selecting it does not reprice.
 */`,
  41: `          // Preserve USD value of the tariff when the currency switches: convert the display
          // value from the old rate so $0.42 does not become 0.46$. The export rate and the
          // fuel price are entered in the same currency and convert alike.`,
  42: `          // These figures come from this tab's own nameplate/DoD model, not from the site
          // simulation; the flag stops the lead-acid comparison from subtracting a modelled
          // figure from a simulated one — the cross-model delta that produced "lead-acid
          // ~€X less" beside a card showing lead-acid far dearer.`,
  43: `  // The recipient's persistent note. The status line carries the same fact for a moment,
  // but the run this link triggers replaces it, so the result must say whose result it is.
  // It lives inside the results region, so it appears with them.`,
  44: `  // \`basePvKw\` is clamped to >= 1 so the tier ratios always have a PV axis to scale, so a
  // battery-only baseline looked like a "6 kW Solar" array this mode never builds. Key the
  // labels off the selection's own pvKw; the clamp is left alone because tier costs derive
  // from it.`,
  45: `// The drag preview's projection of the slider's % onto the curve; the budget thumb rides
// along (unpinned — pinning is commit-time only) so pair, card and label move together. A
// budget the visitor already chose is NOT unpinned by a cut preview.`,
  46: `      // Through the dictionary: appended as a literal this sentence changed language halfway
      // through on every non-English run, because frontierVerdict() is composed from keys and
      // this tail was not. English output is byte-identical.`,
  47: `  // Called on EVERY payload, with null when this combo is solvable. Guarding the call
  // instead (as this once did) left the clear branch dead, so the banner for an earlier
  // infeasible combo outlived the run that replaced it.`,
  48: `// \`t\` is shared/i18n.js's translate, which delegates the placeholder contract to
// shared/interpolate.js. This file once carried its own lookup-then-substitute loop and the
// same "$200" replacer bug had to be fixed twice; one owner now.`,
  49: `  // With no panels nothing is generated, so this target moves WHEN power is drawn instead of
  // selling back a share of the bill. Same control, same number, honest label, with data-i18n
  // kept in step so a language switch re-translates it.`,
  50: `// ── Staged loading pipeline ─────────────────────────────────────────────────
// Data loading must be legible: a determinate stepper (City → Weather → Simulating →
// Rendering) with a live per-chunk weather bar and elapsed seconds. Simulation length is
// unknowable up front, so its bar is indeterminate by design.`,
  51: `        // One cut target, two controls: choosing a target in the form must move the results
        // slider to the same cut (and vice versa), so the "your target" column, the
        // recommendation and the select can never disagree. "custom" is read-only state and
        // never drives a run.`,
  52: `// Adopting a curve point is THE selection primitive for curve clicks and slider commits:
// the clicked point carries its full analysis in the cached payload, so every downstream
// panel follows it with no engine re-run. Only its SOC capture bands arrive a moment later
// from a tiny background slice.`,
  53: `  // The gap is installer MINUS self-purchase, so the sentence compares the route it just
  // described against the installer's price. The word follows the sign: two registry prices
  // cannot print "-$300 below a typical quote" for a system that cost MORE.`,
  54: `/**
 * The full comparison table: every chemistry against every cut level, with the cheapest
 * true 20-year cost per column outlined. In grid-tie mode every cell is the SELECTION UI:
 * click (or Tab and Enter) a cell and the whole results pipeline switches to that system.
 */`,
  55: `// ── Battery Chemistry Comparison (Compare Batteries tab) ────────────────────
// Uses the selected system as baseline, comparing LFP, Sodium-ion and AGM across required
// nameplate sizes (DoD + cold derate), cold limits, 20-year swap counts and total 20-year
// cost. The most cost-effective chemistry is badged.`,
  56: `    // Translated, not a template literal: all five translated tariffNote strings existed and
    // nothing read them, so the note rendered in English on every locale. The rate is appended
    // outside the translated sentence so the placeholder set stays {label}.`,
  57: `            // Resolve the copy through the same owner the banner uses. This cell used to read
            // .title/.body off the key table, so a known reason rendered the word "undefined" in
            // the print sheet — a path only an infeasible run and a print-sheet walk reach.`,
  58: `/**
 * The plain-words lead for a verdict status: the verdict reads as a sentence, not a label.
 * This short sentence says how far the plan got; the measurement sentence after it says what
 * the numbers were.
 */`,
  59: `  // The cut here is the system with its whole bank available, the same figure the sizing search
  // solved for. With a reserve held back the measured result is lower (76% against 81%,
  // measured 2026-11-08), so this chip says which basis it quotes.`,
  60: `// The burn tables, the gallon-or-litre geography and the local-price -> USD maths live in
// fuel-units.js; what stays here is the input plumbing. fuelImperial is the cached answer for
// the current location, refreshed whenever the location changes.`,
  61: `// REMOVED 2026-10-05: renderAutoCards (232 lines) was UNREACHABLE shipped weight — a leftover
// renderer for the auto-chemistry ladder card, called from nothing but itself. Removing it is
// where the four-path module's bytes came from.`,
};

const lines = readFileSync(FILE, "utf8").split("\n");
const jobs = Object.entries(R)
  .map(([i, text]) => ({ ...blocks[Number(i)], text }))
  .sort((a, b) => a.s - b.s);
const problems = [];
for (const job of jobs) {
  for (let i = job.s - 1; i <= job.e - 1; i += 1) {
    if (!COMMENT.test(lines[i])) {
      problems.push(`block ${job.s}-${job.e}: non-comment line ${i + 1}`);
      break;
    }
  }
}
if (problems.length) {
  console.error("ABORT:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
const out = [];
let cursor = 0;
let before = 0;
let after = 0;
for (const job of jobs) {
  out.push(...lines.slice(cursor, job.s - 1));
  before += lines.slice(job.s - 1, job.e).join("\n").length;
  out.push(...job.text.split("\n"));
  after += job.text.length;
  cursor = job.e;
}
out.push(...lines.slice(cursor));
writeFileSync(FILE, out.join("\n"));
console.log(`rewrote ${jobs.length} blocks: ${before} -> ${after} bytes (${before - after} saved)`);

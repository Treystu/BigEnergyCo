// Trim pass over assets/js/sizing/ui.js comment prose (#365 byte leg).
// Deletes contiguous runs of COMMENT-ONLY lines, addressed by marker pairs:
// every marker must match exactly one line, every line in the run must be a
// comment line, and the resulting file must keep every requirement id.
// Usage: node wip/trim.mjs
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "assets/js/sizing/ui.js";
const COMMENT = /^\s*(\/\/|\/\*|\*(?!\/)|\*\/)/;

// [startMarker, endMarker] - delete those lines inclusive.
const DROPS = [
  // Block: THE SAME REPAINT, once, immediately (9267-9290)
  ["    // The dictionary is a deferred dynamic import", "// manual-controls branch and looked."],
  // Block: cumulative 20-year cost chart (7179-7197)
  [" * The amber figure is a literal STACK", " * headline number (solar-served kWh lives there too)."],
  // Block: installer-vs-direct sentence (5407-5428)
  [" * A useful side effect: the old text compared", " * sign-follows-the-number defect is gone structurally rather than patched."],
  // Block: the rate's own date (4391-4403)
  [" * The provider hands back a raw RFC-822 string", " * which is the V1 defect: an out-of-window date line. Two cures, both here -"],
  // Block: four ways to pay (69-86)
  ["// The D-01 objection is answered structurally, not waved away: BOTH surfaces", "// ONE await, after the module resolves, in the same tick. So there is never a"],
  // Block: both surfaces that read the priced comparison (5598-5615)
  [" * A generation counter, not a lock: several of these can be in flight at once", " * system."],
  // Block: worker deadline recovery (384-396)
  ["  // `abandon()` and not `invalidate()`, and the difference is the whole reason", "  // this recovery works. The worker above has been terminated, so no reply is"],
  // Block: use-case derivation (3435-3443)
  ["    // the SAME two-value mapping applyUseCase uses (portable derives no enum", "    // visitor. Choosing by mode rather than by label is deliberate: backup"],
  // Block: repaint every surface (1615-1627)
  [" * Both calls re-run existing painters rather than reaching into the DOM: the", " * drift out of sync with the code that knows how to fill it."],
  // Block: worker reply deadline (351-359)
  ["// reply) must surface an honest, retryable error instead of hanging forever", "// auto-run. The watch itself lives in run-coordinator.js: armed with"],
  // Block: which currency (2507-2517)
  ["  //   2. the tariff box, which is GEOGRAPHIC and routinely spans countries the", "  //      there is no country at all, which is the bare-coordinate case."],
  // Block: levelized-cost row (4336-4346)
  ["the cost of each shifted kWh. Printed as \"your power", " * battery does not cut what you pay. The number is right; the name was not."],
  // Block: V2 recipient gap (9311-9318)
  ["    // and every input was written; a malformed or hostile link returns false", "    // authorization/dirty gates so this single load-time run is never"],
  // Block: use cases vocabulary (744-750)
  ["// Everything below reads assets/js/sizing/usecases.js and nothing else", "// of the visitor without a place to put the answer."],
  // Block: selected system / Jev sanity (6015-6025)
  ["// One probe per distinct result state: the interpretation is cached by the", "// cache instead of re-asking the model. A confident \"impossible\" verdict on"],
  // Block: battery-only tiers (4790-4797)
  ["  // alone. Feeding the clamped `basePvKw` into them presented a 12 kW array as", "  // \"Current Selection\" baseline quoted a different price for the same system"],
  // Block: background weather prefetch (630-637)
  ["// starting at the click. The prefetch runs INSIDE the sizing worker (same", "// side too (WARMED_SITES). Errors are silent here by design — the run path"],
  // Block: comparison panel (5512-5521)
  [" * What the panel owns is the presentation and the instrument toggle — because", " * a PPA buys ENERGY and a lease rents the SYSTEM, and switching between them"],
  // Block: auto grid-tie (3252-3258)
  ["  // re-derives the banner and focus from the custom target column, so the", "  // cut — not the fixed 80% one — unless they've explicitly picked a system."],
  // Block: incremental cut patch (4148-4154)
  ["        // CURRENT payload epoch: a slice computed from pre-edit inputs that", "        // A superseded patch (a newer slider edit already collapsed behind"],
  // Block: worker collapse (342-348)
  ["// The worker runs one full sizing at a time and cannot be preempted: when a", "// slider. The screen already shows the rescaled numbers, so nothing is lost."],
  // Block: bill-cut row visibility (790-798)
  [" * change (goal switch, use-case switch, results render) re-syncs, and the", " * which is how off-grid users kept a \"Cut ~80% of your bill\" slider."],
  // Block: deferred out of the first-result graph (9293-9299)
  ["    // click handlers, and the feature module was already a click-time", "    // link — the same fallback the loader's own catch takes."],
  // Block: SOC reliability chart (7205-7209)
  [" * SOC reliability chart for ONE selected system: the same daily min/max band", " * machinery as the multi-tier chart, from the entry's nameplate bands."],
  // Block: unified selection hub (3579-3585)
  ["// drags only move a highlight through CACHED points (preview); release", "// lookup (SOC capture bands after a curve adoption, exact column after a cut"],
  // Block: AWAITED dictionary (9243-9248)
  ["    // English defaults and then swap them a moment later — a German or Arabic", "    // already in flight, so this waits for work the browser is doing anyway."],
  // Block: infeasibility banner (1287-1293)
  ["// a normal run) so it never lingers across the page.", "// What is left here is only the rendering."],
  // Block: apply a use case (850-858)
  [" * The hidden selects are still dispatched, because every existing listener", " * at this one boundary, and nothing below it has to change."],
  // Block: unified curve selection (442-447)
  ["// ring + readout, highlight only, worker untouched); the committed selection", "// grid-tie auto mode where the granular focus panel REPLACES the matrix and"],
  // Block: blue dot (7328-7333)
  ["  // no click the dot sits on the RECOMMENDATION at its true position (the", "  // matrix \"your target\" column and the recommendation already agree with"],
  // Block: reSlice serial (427-433)
  ["// Epoch links every patch to the payload it was computed against: a full run", "// newer payload (independent counters alone could not prevent that)."],
  // Block: no array no tilt (2111-2116)
  ["  // assumes the recommended tilt when sizing your array\" and asks what \"a flat", "  // guide is gone the moment \"Battery only\" is chosen."],
  // Block: results panel language (1639-1644)
  ["  // data-i18n markup — so switching language left the caption, the tariff", "  // the payload the panel was built from costs nothing (no engine run, no"],
  // Block: router mode (7653-7658)
  ["  // (fixed-chem runs set p.auto = null; auto runs always set an array, which", "  // never reached and the banner just went blank."],
  // Block: pricing model will not load (5622-5627)
  ["    // empty state plus a status line — never a silent blank section, and never", "    // inheriting this failure forever."],
  // Block: zero delta (4890-4895)
  ["  // \"Baseline\", which every row then suffix-typed: the current-selection card", "  // what the baseline row means."],
  // Block: collapse latest inputs (2980-2985)
  ["    // A non-quiet request wins so an explicit run still scrolls + spins.", "    // hiding the cut slider under it."],
  // Block: the one place the horizon crosses (88-93)
  ["// of this file by tests/quote-text-bridge.mjs, which supplies the horizon as an", "// one owner (paths.js) either way, and no surface renders before the module has"],
  // Block: granular icon panel (3792-3797)
  ["// for the point, with no lookup.", "// is — never \"~-$X/mo\". Null-safe (missing tariff stays missing)."],
  // Block: four paths for one system (5430-5437)
  [" * same system twice, or the two can disagree on the turnkey band — the defect", " * an object identity, so re-selecting the same system does not reprice it."],
  // Block: preserve USD value (9011-9015)
  ["          // value from old rate to new so $0.42 doesn't become 0.46$ after toggle.", "          // currency silently changes their effective USD value."],
  // Block: comparison table (5886-5892)
  [" * every cell is the SELECTION UI: click (or Tab to and Enter) a cell and the", " * figures, share link — switches to that system."],
  // Block: battery chemistry comparison (4463-4467)
  ["// across required nameplate sizes (DoD + cold derate), cold weather limits,", "// The most cost-effective chemistry is badged."],
  // Block: translated not a template literal (2538-2542)
  ["    // rendered in English on every locale. The rate is appended outside the", "    // every existing translation already carries."],
  // Block: resolve the copy (5934-5938)
  ["            // a known reason rendered the word \"undefined\" in the print sheet —", "            // print-sheet walk reach it."],
  // Block: plain-words lead (1071-1077)
  [" * status words survive for anything that labels a state; the verdict itself no", " * longer opens with a colon-stamped one."],
  // Block: cut here is the system (3864-3868)
  ["  // back, the measured result below it is lower (76% against 81%, measured", "  // instead of leaving two numbers to argue."],
  // Block: burn tables (6670-6674)
  ["// them. fuelImperial is the cached answer for the current location, refreshed", "// can never disagree with each other."],
];

const lines = readFileSync(FILE, "utf8").split("\n");
const drop = new Set();
const problems = [];
for (const [startMarker, endMarker] of DROPS) {
  const hits = [];
  const endHits = [];
  lines.forEach((line, i) => {
    if (line.includes(startMarker)) hits.push(i);
    if (line.includes(endMarker)) endHits.push(i);
  });
  if (hits.length !== 1) {
    problems.push(`start marker matched ${hits.length}x: ${startMarker}`);
    continue;
  }
  if (endHits.length !== 1) {
    problems.push(`end marker matched ${endHits.length}x: ${endMarker}`);
    continue;
  }
  const [s, e] = [hits[0], endHits[0]];
  if (e < s) {
    problems.push(`end before start: ${startMarker}`);
    continue;
  }
  for (let i = s; i <= e; i += 1) {
    if (!COMMENT.test(lines[i])) {
      problems.push(`non-comment line in run (${i + 1}): ${lines[i].slice(0, 80)}`);
      break;
    }
    drop.add(i);
  }
}
if (problems.length) {
  console.error("ABORT - nothing written:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
const kept = lines.filter((_, i) => !drop.has(i));
// collapse runs of two or more blank comment lines into one
const out = [];
for (const line of kept) {
  const blankComment = /^\s*(\/\/|\*)\s*$/.test(line);
  const prev = out[out.length - 1];
  if (blankComment && prev !== undefined && /^\s*(\/\/|\*)\s*$/.test(prev)) continue;
  out.push(line);
}
const before = Buffer.byteLength(lines.join("\n"), "utf8");
const after = Buffer.byteLength(out.join("\n"), "utf8");
writeFileSync(FILE, out.join("\n"));
console.log(`dropped ${drop.size} comment lines: ${before} -> ${after} bytes (${before - after} saved)`);

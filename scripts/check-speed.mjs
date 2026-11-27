// The speed gate: what #433 asked to be wired into the repo gates, measured on
// the BUILT artifact rather than on a source tree somebody eyeballed.
//
// WHY BYTES AND NOT TIMINGS HERE. The rail this runs on is a dependency-free
// Node image with no browser (.circleci/config.yml, PHASE 1), and a timing
// taken on a shared runner is a number about the runner. So the rail enforces
// the half of #433 that is deterministic — the artifact bytes a phone has to
// pull for the entry page and for a first result — and the phone-class timings
// are taken by scripts/measure-speed.mjs on the deployed artifact and recorded
// in scripts/lib/speed-budgets.mjs. Two instruments, two jobs, one budget file.
//
// THE SUBJECT SET IS DERIVED, NOT LISTED. A hand-curated file list is how the
// older eager-JS budget came to miss fourteen modules for a month (the story is
// in tests/perf-budget.test.mjs). This walks what the document actually
// requests: module and classic scripts, stylesheets, preloads, the manifest and
// icons, then the static import closure of every script, then the CSS url()
// fonts. Dynamic imports define the RESULTS layer, because that is exactly what
// a dynamic import means here: bytes the visitor pays for when they ask for a
// number.
//
// Usage:
//   node scripts/check-speed.mjs --stage _pages_staging
//   node scripts/check-speed.mjs --stage _pages --json
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateSpeedReading, SPEED_BUDGETS } from "./lib/speed-budgets.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
};
const DEFAULT_STAGE = resolve(ROOT, arg("stage", "_pages_staging"));
const JSON_OUT = argv.includes("--json");
const LIST = argv.includes("--list");
// --budget axis=value overrides one budget for a single run. It exists so the
// gate's own test can prove the binary fails on a breach without editing the
// shared budget file, and so a receipt can quote a proposed raise before it
// lands.
const overrides = argv
  .map((a, i) => (a === "--budget" ? argv[i + 1] : null))
  .filter(Boolean)
  .map((pair) => pair.split("="))
  .filter(([axis]) => axis);

/** Local files referenced by an attribute, in document order, deduped. */
function refs(html, pattern) {
  return [...html.matchAll(pattern)]
    .map((m) => m[1])
    .filter((u) => !/^[a-z]+:|^\/\//i.test(u))
    .map((u) => u.split("?")[0].replace(/^\.?\//, ""));
}

const staticEdges = (src) => [
  ...[...src.matchAll(/from\s*["'](\.[^"']+)["']/g)].map((m) => m[1]),
  ...[...src.matchAll(/^\s*import\s*["'](\.[^"']+)["']/gm)].map((m) => m[1]),
];

const dynamicEdges = (src) => [
  ...[...src.matchAll(/import\(\s*["'](\.[^"']+)["']/g)].map((m) => m[1]),
];

function fileBytes(abs) {
  try {
    return statSync(abs).size;
  } catch {
    return 0;
  }
}

/** Follow a module closure from roots, returning absolute paths. */
function closure(
  roots,
  { followDynamic = false, stageDir = DEFAULT_STAGE } = {},
) {
  const seen = new Set();
  const pending = [...roots];
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file) || existsSync(file) === false) continue;
    seen.add(file);
    const src = readFileSync(file, "utf8");
    for (const edge of staticEdges(src))
      pending.push(resolve(dirname(file), edge.split("?")[0]));
    for (const m of src.matchAll(/new\s+Worker\(\s*["'](\.[^"']+)["']/g))
      pending.push(join(stageDir, m[1].split("?")[0].replace(/^\.\//, "")));
    if (followDynamic)
      for (const edge of dynamicEdges(src))
        pending.push(resolve(dirname(file), edge.split("?")[0]));
  }
  return seen;
}

export function measureStage(stageDir = DEFAULT_STAGE) {
  const STAGE = stageDir;
  const indexAbs = join(STAGE, "index.html");
  if (!existsSync(indexAbs))
    throw new Error(
      `check-speed: no built index.html under ${relative(ROOT, STAGE)} — ` +
        `build the stage first (node scripts/deploy-pages-local.mjs ` +
        `--check --stage ${relative(ROOT, STAGE)})`,
    );
  const html = readFileSync(indexAbs, "utf8");

  const scripts = refs(html, /<script\b[^>]*\bsrc="([^"]+)"/g).map((p) =>
    join(STAGE, p),
  );
  const styles = refs(
    html,
    /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g,
  ).map((p) => join(STAGE, p));
  const preloads = refs(
    html,
    /<link\b[^>]*\brel="(?:modulepreload|preload)"[^>]*\bhref="([^"]+)"/g,
  ).map((p) => join(STAGE, p));
  const assets = [
    ...refs(
      html,
      /<link\b[^>]*\brel="(?:manifest|icon|apple-touch-icon)"[^>]*\bhref="([^"]+)"/g,
    ),
  ].map((p) => join(STAGE, p));

  // Fonts and images the stylesheets pull are first-load bytes too.
  const cssExtras = new Set();
  for (const css of styles) {
    if (!existsSync(css)) continue;
    const src = readFileSync(css, "utf8");
    for (const m of src.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      const u = m[1];
      if (/^[a-z]+:|^\/\//i.test(u)) continue;
      cssExtras.add(resolve(dirname(css), u.split("?")[0]));
    }
  }

  const entryJs = closure(
    scripts.concat(preloads.filter((p) => p.endsWith(".js"))),
    {
      stageDir: STAGE,
    },
  );
  const entryFiles = new Set([
    indexAbs,
    ...styles,
    ...assets,
    ...cssExtras,
    ...entryJs,
  ]);

  // The results layer: everything a dynamic import reaches from the entry
  // graph, plus the modules the run preloads. Measured as its own axis so a
  // module can move between the two layers deliberately, not by accident.
  const resultsRoots = new Set();
  for (const file of entryJs) {
    for (const edge of dynamicEdges(readFileSync(file, "utf8")))
      resultsRoots.add(resolve(dirname(file), edge.split("?")[0]));
  }
  for (const m of html.matchAll(/preloadRunModules\([^)]*\)/g)) {
    for (const u of m[0].matchAll(/["'](\.?\/assets\/[^"']+)["']/g))
      resultsRoots.add(join(STAGE, u[1].replace(/^\.\//, "")));
  }
  const resultsJs = closure([...resultsRoots], { stageDir: STAGE });
  let resultsBytes = 0;
  for (const file of resultsJs)
    if (!entryFiles.has(file)) resultsBytes += fileBytes(file);

  let entryBytes = 0;
  for (const file of entryFiles) entryBytes += fileBytes(file);

  // Guard the DERIVATION before trusting the number: a regex that stopped
  // matching would report a smaller artifact every run and pass forever.
  const names = new Set(
    [...entryFiles].map((f) => relative(STAGE, f).replace(/\\/g, "/")),
  );
  for (const must of [
    "index.html",
    "assets/js/sizing/ui.js",
    "assets/js/sizing/run.js",
    "assets/js/sizing/engine.js",
    "assets/js/shared/i18n.js",
  ]) {
    if (!names.has(must))
      throw new Error(
        `check-speed: ${must} is on the first-load path but the walker missed ` +
          `it — a gate that improved by breaking itself is not a gate`,
      );
  }

  return {
    first_load_files_bytes: entryBytes,
    deferred_layer_files_bytes: resultsBytes,
    entry_files: entryFiles.size,
    results_files: [...resultsJs].filter((f) => !entryFiles.has(f)).length,
    // Named so a receipt can say WHICH file grew, not just that something did.
    files: [...entryFiles, ...[...resultsJs].filter((f) => !entryFiles.has(f))]
      .map((f) => ({
        path: relative(STAGE, f).replace(/\\/g, "/"),
        bytes: fileBytes(f),
        layer: entryFiles.has(f) ? "entry" : "results",
      }))
      .sort((a, b) => b.bytes - a.bytes),
  };
}

// --- CLI ---
const invokedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const reading = measureStage();
  const budgets = { ...SPEED_BUDGETS };
  for (const [axis, value] of overrides) budgets[axis] = Number(value);
  const verdict = evaluateSpeedReading(reading, budgets);

  if (JSON_OUT) {
    process.stdout.write(
      `${JSON.stringify({ stage: relative(ROOT, STAGE), reading, verdict }, null, 2)}\n`,
    );
  } else {
    console.log(
      `SPEED    stage: ${relative(ROOT, DEFAULT_STAGE)} (on-disk bytes)`,
    );
    for (const c of verdict.checks) {
      const label = c.axis.padEnd(22);
      const state = c.ok ? "ok  " : "OVER";
      console.log(
        `SPEED    ${label} ${state} ${String(c.value).padStart(9)} / ${c.budget}` +
          (c.ok ? "" : `  (+${c.delta})`),
      );
    }
    console.log(
      `SPEED    ${verdict.checks.length - verdict.checks.filter((c) => c.ok).length} ` +
        `over budget of ${verdict.checks.length}`,
    );
    if (LIST)
      for (const f of reading.files.slice(0, 25))
        console.log(
          `SPEED    ${f.layer.padEnd(7)} ${String(f.bytes).padStart(8)} ${f.path}`,
        );
  }

  if (!verdict.ok) process.exit(1);
}

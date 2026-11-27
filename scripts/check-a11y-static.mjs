// The static accessibility gate (#434): the half of the pass that is
// deterministic over the artifact, enforced where the rail can run it.
//
// WHY THIS EXISTS SEPARATELY FROM THE BROWSER INSTRUMENTS. #434 asks for a full
// pass and for automated checks "wired into the repo gates where the tooling
// supports them". The browser instruments are real and they are the ones that
// measure contrast, keyboard reach, target sizes and reduced motion:
//
//   · scripts/smoke/a11y.js — real Tab/Enter/Space events over the calculator's
//     four control surfaces, accessible names, WCAG AA contrast against the
//     composited background chain, reduced-motion emulation. Runs in the
//     browser-capable workflow (web-smoke).
//   · scripts/check-a11y-matrix.mjs — axe-core over the template × state ×
//     theme × direction matrix. Runs in the browser-capable workflow
//     (quality-lab).
//
// The CircleCI executor that gates a merge is cimg/node:22 — no browser, so
// neither of those can gate here (the same reason #433's timing instrument is
// separate from its byte gate). This file is the part a browser is not needed
// for: the markup rules whose breach is a defect regardless of how anything
// renders. Every one of them is a rule this pass actually found broken, or a
// regression that would recreate a finding:
//
//   1. NAME      every visible form control has a programmatic name — aria-label,
//               a resolvable aria-labelledby, or a <label for> in the page.
//   2. DESCRIBE  every aria-describedby / aria-labelledby id resolves IN THE SAME
//               PAGE. A dangling reference is announced as nothing, which is how
//               an error message exists on screen and not in the reading.
//   3. ROLE      no <label> carries role="button". A label names a control and
//               cannot take another role; the tariff gloss did exactly this and
//               axe scored both aria-allowed-role and label-content-name-mismatch.
//   4. ALT       every <img> has an alt attribute (empty is allowed and means
//               decorative — absent is the defect).
//   5. ZOOM      no viewport meta with user-scalable=no or maximum-scale < 2.
//   6. ORDER     no positive tabindex: tab order is document order.
//   7. LANG      every page declares a language and a non-empty <title>.
//
// Fails PER PAGE AND PER RULE with the element named, so a red run says what to
// fix rather than that something somewhere is wrong. Skips are never passes: a
// page that could not be read is an error (exit 2), not a clean page.
//
// Usage:
//   node scripts/check-a11y-static.mjs --stage _pages_staging
//   node scripts/check-a11y-static.mjs --stage _pages --json
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
};
const STAGE = resolve(ROOT, arg("stage", "_pages_staging"));
const JSON_OUT = argv.includes("--json");

/** Every .html in the staged tree, repo-relative and sorted. */
function pageList(stageDir) {
  const out = [];
  const walk = (rel) => {
    for (const entry of readdirSync(join(stageDir, rel), {
      withFileTypes: true,
    })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(child);
      else if (/\.html$/i.test(entry.name)) out.push(child);
    }
  };
  walk("");
  return out.sort();
}

/** The opening tag of an element, with its attributes, from an index. */
function openTag(html, at) {
  const end = html.indexOf(">", at);
  return end < 0 ? html.slice(at) : html.slice(at, end + 1);
}

const attr = (tag, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(
    tag,
  );
  return m ? (m[2] ?? m[3] ?? "") : null;
};

/** ids declared anywhere in the page (any element, any case of value). */
function idSet(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\bid\s*=\s*("([^"]*)"|'([^']*)')/gi))
    ids.add(m[2] ?? m[3] ?? "");
  return ids;
}

/** Labels declared as <label for="x">, so a control can be matched by id. */
function labelTargets(html) {
  const targets = new Set();
  for (const m of html.matchAll(/<label\b[^>]*>/gi)) {
    const forId = attr(m[0], "for");
    if (forId) targets.add(forId);
  }
  return targets;
}

const named = (tag) =>
  Boolean(
    attr(tag, "aria-label") ||
    attr(tag, "aria-labelledby") ||
    attr(tag, "title") ||
    attr(tag, "placeholder"),
  );

/**
 * One page, every rule. Returns findings, each naming the rule and the element
 * so a red run is actionable without opening the gate's source.
 */
export function auditPage(rel, html) {
  const findings = [];
  const ids = idSet(html);
  const labels = labelTargets(html);
  const push = (rule, element, detail) =>
    findings.push({ rule, element, detail });

  // 1 + 2: form controls.
  for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = m[0];
    const type = (attr(tag, "type") || "").toLowerCase();
    if (type === "hidden") continue;
    const id = attr(tag, "id");
    const wrapLabel = html
      .slice(Math.max(0, m.index - 240), m.index)
      .match(/<label\b[^>]*>[^<]*$/i);
    if (!named(tag) && !(id && labels.has(id)) && !wrapLabel) {
      push(
        "NAME",
        `<${m[1].toLowerCase()}${id ? `#${id}` : ""}>`,
        "no aria-label, aria-labelledby or <label for>",
      );
    }
    for (const ref of [
      attr(tag, "aria-describedby"),
      attr(tag, "aria-labelledby"),
    ]) {
      if (!ref) continue;
      for (const token of ref.split(/\s+/).filter(Boolean))
        if (!ids.has(token))
          push(
            "DESCRIBE",
            `<${m[1].toLowerCase()}${id ? `#${id}` : ""}>`,
            `references missing #${token}`,
          );
    }
  }

  // 3: a label cannot take a button role.
  for (const m of html.matchAll(/<label\b[^>]*>/gi)) {
    const role = (attr(m[0], "role") || "").toLowerCase();
    if (role === "button")
      push(
        "ROLE",
        `<label${attr(m[0], "for") ? ` for=${attr(m[0], "for")}` : ""}>`,
        'role="button" on a label — a label names a control and cannot take another role',
      );
  }

  // 4: images carry an alt attribute, present even when empty.
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(m[0], "alt") === null)
      push(
        "ALT",
        `<img${attr(m[0], "src") ? ` src=${attr(m[0], "src")}` : ""}>`,
        "no alt attribute",
      );
  }

  // 5: pinch-zoom must not be disabled.
  for (const m of html.matchAll(
    /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/gi,
  )) {
    const content = attr(m[0], "content") || "";
    if (/user-scalable\s*=\s*no/i.test(content))
      push("ZOOM", "<meta name=viewport>", "user-scalable=no");
    const max = /maximum-scale\s*=\s*([\d.]+)/i.exec(content);
    if (max && Number(max[1]) < 2)
      push("ZOOM", "<meta name=viewport>", `maximum-scale=${max[1]}`);
    if (!/width\s*=\s*device-width/i.test(content))
      push("ZOOM", "<meta name=viewport>", "no width=device-width");
  }

  // 6: no positive tabindex anywhere (document order owns the tab sequence).
  for (const m of html.matchAll(/\btabindex\s*=\s*["']?(-?\d+)/gi)) {
    if (Number(m[1]) > 0)
      push(
        "ORDER",
        `tabindex=${m[1]}`,
        "positive tabindex reorders focus away from reading order",
      );
  }

  // 7: language + title.
  const htmlTag = /<html\b[^>]*>/i.exec(html);
  if (!htmlTag || !(attr(htmlTag[0], "lang") || "").trim())
    push("LANG", "<html>", "no lang");
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html);
  if (!title || !title[1].trim())
    push("LANG", "<title>", "empty or missing title");

  return findings;
}

export function auditStage(stageDir = STAGE) {
  const indexAbs = join(stageDir, "index.html");
  if (!existsSync(indexAbs))
    throw new Error(
      `check-a11y-static: no built index.html under ${relative(ROOT, stageDir)} — ` +
        `build the stage first (node scripts/deploy-pages-local.mjs --check --stage ${relative(ROOT, stageDir)})`,
    );
  const pages = pageList(stageDir).map((rel) => ({
    path: rel,
    findings: auditPage(rel, readFileSync(join(stageDir, rel), "utf8")),
  }));
  const findings = pages.reduce((n, p) => n + p.findings.length, 0);
  return { pages, findings, stage: relative(ROOT, stageDir) };
}

/** Named on the terminal, and returned so a test can assert the exact text. */
export function summaryLines(report) {
  const byRule = new Map();
  for (const page of report.pages)
    for (const f of page.findings)
      byRule.set(f.rule, (byRule.get(f.rule) || 0) + 1);
  const rules = [...byRule.entries()].sort((a, b) => b[1] - a[1]);
  return (
    `A11Y     stage: ${report.stage} (${report.pages.length} pages, markup rules only)\n` +
    rules
      .map(
        ([rule, n]) =>
          `A11Y     ${rule.padEnd(9)} ${String(n).padStart(4)} findings\n`,
      )
      .join("") +
    `A11Y     ${report.findings} findings of ${report.pages.length} pages\n`
  );
}

const invokedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  let report;
  try {
    report = auditStage();
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exit(2);
  }
  if (JSON_OUT) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(summaryLines(report));
    for (const page of report.pages) {
      for (const f of page.findings.slice(0, 12))
        console.log(
          `A11Y     ${page.path}: ${f.rule} ${f.element} — ${f.detail}`,
        );
      if (page.findings.length > 12)
        console.log(
          `A11Y     ${page.path}: +${page.findings.length - 12} more findings`,
        );
    }
  }
  if (report.findings > 0) process.exit(1);
}

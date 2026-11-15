#!/usr/bin/env node
// Keep every blog page's FAQPage structured data equal to the FAQ the visitor
// actually sees.
//
// WHY THIS EXISTS: seven articles shipped with a `FAQPage` block copied from
// the load-shedding template - the Spanish IRPF guide, the Polish storage
// subsidy, the Eskom fixed-charge piece, the Brazilian Fio B piece, the
// Vietnamese tariff-tier piece, the Romanian AFM piece and the Australian STC
// piece all carried the same four English load-shedding questions
// ("What size solar system do I need for load shedding?" and friends) in their
// JSON-LD while their visible FAQ was correct and in-language. That is worse
// than missing markup: the structured data names a different article than the
// page it sits on, which is exactly the pattern search engines treat as
// misleading. Codex flagged it on #373/#375/#376 as a P2 and it stayed live on
// main because nothing compared the two.
//
// The fix is to DERIVE the JSON-LD from the visible FAQ rather than to maintain
// it beside the visible FAQ. A page that changes its questions changes its
// structured data in the same commit, and `--check` fails the rail if it does
// not.
//
//   node scripts/sync-faq-jsonld.mjs           # rewrite pages that differ
//   node scripts/sync-faq-jsonld.mjs --check   # exit 1 and name the pages
//
// The visible FAQ shape is the blog template's: an h2 section of
// <details><summary>question</summary><p>answer</p></details>. A page with no
// <details> has nothing to mirror and is skipped; a page with <details> but no
// FAQPage block is a page whose structured data went missing, and is reported
// rather than silently accepted.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG = join(ROOT, "blog");

/** Visible text -> the text a JSON string should carry. */
export function normalize(text) {
  return (
    text
      // Tags are removed with NOTHING, not a space: the FAQ answers wrap words
      // in <a>, <strong> and <em>, and a space here turns "guide.</a>" into the
      // "guide ." that made this check report a difference on pages whose text
      // was identical. Word boundaries survive because the source already has
      // the spaces around those inline runs.
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#3[49];/g, "'")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** The <details> FAQ the visitor sees, in document order. */
export function visibleFaq(html) {
  const out = [];
  const re = /<details\b[^>]*>([\s\S]*?)<\/details>/gi;
  let m;
  while ((m = re.exec(html))) {
    const block = m[1];
    const q = block.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const a = block.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    if (!q || !a) continue;
    const question = normalize(q[1]);
    const answer = normalize(a[1]);
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

/** Index of the ']' that closes the '[' at `open`, ignoring strings. */
function matchBracket(text, open) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Render the mainEntity array at the indentation the block already uses.
 *
 * `nl` must be the newline the FILE uses: these pages are CRLF in the working
 * tree, and emitting LF made every page look drifted when the content was
 * identical. A check that cannot tell a line ending from a question is worse
 * than no check, because acting on it rewrites seventeen correct pages.
 */
export function renderArray(pairs, indent, nl = "\n") {
  const inner = `${indent}  `;
  const body = pairs
    .map(
      ({ question, answer }) =>
        `${inner}{${nl}` +
        `${inner}  "@type": "Question",${nl}` +
        `${inner}  "name": ${JSON.stringify(question)},${nl}` +
        `${inner}  "acceptedAnswer": {${nl}` +
        `${inner}    "@type": "Answer",${nl}` +
        `${inner}    "text": ${JSON.stringify(answer)}${nl}` +
        `${inner}  }${nl}` +
        `${inner}}`,
    )
    .join(`,${nl}`);
  return `[${nl}${body}${nl}${indent}]`;
}

/**
 * Replace the FAQPage mainEntity array with one built from the visible FAQ.
 * Returns { changed, html, reason }.
 */
export function syncPage(html) {
  const pairs = visibleFaq(html);
  const faqAt = html.search(/"@type":\s*"FAQPage"/);
  if (faqAt < 0) {
    return {
      changed: false,
      html,
      reason: pairs.length ? "no-faqpage" : "no-faq",
    };
  }
  if (!pairs.length) return { changed: false, html, reason: "no-visible-faq" };

  const mainEntityAt = html.indexOf('"mainEntity"', faqAt);
  if (mainEntityAt < 0)
    return { changed: false, html, reason: "no-mainentity" };
  const openAt = html.indexOf("[", mainEntityAt);
  if (openAt < 0) return { changed: false, html, reason: "no-mainentity" };
  const closeAt = matchBracket(html, openAt);
  if (closeAt < 0) return { changed: false, html, reason: "unbalanced" };

  const lineStart = html.lastIndexOf("\n", mainEntityAt) + 1;
  const indent = html.slice(lineStart, mainEntityAt).match(/^[ \t]*/)[0];
  const nl = html.includes("\r\n") ? "\r\n" : "\n";
  const rendered = renderArray(pairs, indent, nl);
  const current = html.slice(openAt, closeAt + 1);
  if (current === rendered) return { changed: false, html, reason: "in-sync" };
  return {
    changed: true,
    html: html.slice(0, openAt) + rendered + html.slice(closeAt + 1),
    reason: "drifted",
    pairs: pairs.length,
  };
}

export function pages() {
  return readdirSync(BLOG, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(BLOG, d.name, "index.html"));
}

/** Run over the tree. Returns the findings, without touching disk when check. */
export function run({ check }) {
  const findings = [];
  for (const path of pages()) {
    let html;
    try {
      html = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    const result = syncPage(html);
    if (result.changed) {
      findings.push({ path, reason: result.reason, pairs: result.pairs });
      if (!check) writeFileSync(path, result.html);
    }
  }
  return findings;
}

const invokedDirectly =
  process.argv[1] && process.argv[1].endsWith("sync-faq-jsonld.mjs");

if (invokedDirectly) {
  const check = process.argv.includes("--check");
  const findings = run({ check });
  if (!findings.length) {
    console.log("faq-jsonld: every FAQPage matches the FAQ its page shows");
    process.exit(0);
  }
  for (const f of findings) {
    const rel = f.path.slice(ROOT.length + 1).replace(/\\/g, "/");
    console.log(
      `faq-jsonld: ${rel} [${f.reason}] ${f.pairs} visible questions`,
    );
  }
  if (check) {
    console.error(
      "faq-jsonld: structured data does not match the visible FAQ. " +
        "Run `node scripts/sync-faq-jsonld.mjs` and commit the result.",
    );
    process.exit(1);
  }
  console.log(`faq-jsonld: rewrote ${findings.length} page(s)`);
}

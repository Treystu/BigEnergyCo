// Owner order 2026-11-22, second pass. The stripped results surface keeps one
// price, three stats and the one cost table in front of the visitor, and puts
// everything else behind the SAME optional disclosure the calculator uses -
// not a second view-fork. This file pins that shape, the #439 support path at
// the value moment (with its locales), and the #432 footer integrity rule.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "../assets/js/shared/locales.js";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const html = readFileSync(join(ROOT, "index.html"), "utf8");
const css = readFileSync(join(ROOT, "assets/site.css"), "utf8");

const at = (needle) => {
  const i = html.indexOf(needle);
  assert.ok(i > 0, `index.html must contain ${needle}`);
  return i;
};

test("results: one price and one cost table lead, everything else is one disclosure", () => {
  const plan = at('id="planCardWrap"');
  const paths = at('id="pathsPanel"');
  const more = at('id="resultsMore"');
  const simple = at('id="simpleResultsWrap"');
  const actions = at('class="result-actions-row"');

  assert.ok(plan < paths, "the plan leads the cost table");
  assert.ok(paths < more, "the cost table stays on the surface, above the disclosure");
  assert.ok(more < simple, "the readable card is detail, not a second surface");
  // The one disclosure must actually WRAP the detail blocks: it opens before
  // the readable card and closes before the result actions.
  const closeAt = html.lastIndexOf("</details>", actions);
  assert.ok(
    closeAt > simple,
    "the disclosure closes after the detail blocks and before the actions",
  );
  assert.equal(
    (html.match(/id="resultsMore"/g) || []).length,
    1,
    "exactly one results disclosure",
  );
  // No second surface for the same content: the old parallel wrapper is gone.
  assert.ok(!html.includes("Cure C: one disclosure governs every demoted block"));
});

test("results: the primary and secondary actions sit outside the disclosure", () => {
  const actions = at('class="result-actions-row"');
  const closeAt = html.lastIndexOf("</details>", actions);
  assert.ok(closeAt < actions, "actions are not inside the closed disclosure");
});

test("#439: the support path is at the value moment, in every locale", () => {
  const support = at('id="resultSupportPath"');
  const actions = at('class="result-actions-row"');
  assert.ok(support > actions, "the support path follows the result actions");
  for (const hook of [
    'data-i18n="resultSupportLead"',
    'data-i18n="resultSupportAction"',
    'data-i18n="resultSupportNext"',
  ]) {
    assert.ok(html.includes(hook), `support path carries ${hook}`);
  }
  assert.match(html, /href="mailto:lucasballek@gmail\.com\?subject=Help/);
  for (const [lang, dict] of Object.entries(LOCALES)) {
    for (const key of [
      "resultSupportLead",
      "resultSupportAction",
      "resultSupportNext",
    ]) {
      assert.equal(typeof dict[key], "string", `${lang}.${key} must exist`);
      assert.ok(dict[key].trim().length > 8, `${lang}.${key} must not be blank`);
    }
  }
});

test("#439: contact is never framed as the advisor's failure", () => {
  const banned = [
    /Questions the AI couldn't answer/i,
    /couldn't answer/i,
    /the AI (failed|did not answer|didn't answer)/i,
  ];
  for (const pattern of banned) {
    assert.ok(!pattern.test(html), `banned failure framing in index.html: ${pattern}`);
    for (const [lang, dict] of Object.entries(LOCALES)) {
      for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== "string") continue;
        assert.ok(
          !pattern.test(value),
          `${lang}.${key} carries failure-framed contact copy`,
        );
      }
    }
  }
});

function htmlFilesUnder(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) htmlFilesUnder(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

test("#432: the stripped surface renders one footer and no repeated footer link", () => {
  const footers = html.match(/<footer[\s\S]*?<\/footer>/gi) || [];
  assert.equal(footers.length, 1, "index.html must render exactly one footer");
  const hrefs = [...footers[0].matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const href of hrefs) {
    assert.ok(!seen.has(href), `the footer renders ${href} twice`);
    seen.add(href);
  }
});

test("#432: no shipped page renders a footer link twice", () => {
  const pages = [
    ...htmlFilesUnder(join(ROOT, "blog")),
    ...htmlFilesUnder(join(ROOT, "about")),
    ...htmlFilesUnder(join(ROOT, "solar-heatmap")),
  ];
  let withFooter = 0;
  for (const page of pages) {
    const pageHtml = readFileSync(page, "utf8");
    const footers = pageHtml.match(/<footer[\s\S]*?<\/footer>/gi) || [];
    if (!footers.length) continue;
    withFooter++;
    assert.equal(
      footers.length,
      1,
      `${page.replace(ROOT, "")} must render exactly one footer`,
    );
    const seen = new Set();
    for (const m of footers[0].matchAll(/href="([^"]+)"/g)) {
      assert.ok(
        !seen.has(m[1]),
        `${page.replace(ROOT, "")} renders the footer link ${m[1]} twice`,
      );
      seen.add(m[1]);
    }
  }
  assert.ok(withFooter > 20, `the footer census covered ${withFooter} pages`);
});

test("#432: prices scan as a column (tabular figures)", () => {
  assert.match(
    css,
    /\.plan-price,\s*\.paths-upfront,\s*\.paths-total\s*\{[^}]*font-variant-numeric:\s*tabular-nums/,
    "the price surfaces must share one tabular-figures rule",
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  run,
  visibleFaq,
  normalize,
  syncPage,
  classify,
} from "../scripts/sync-faq-jsonld.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Seven articles shipped with the load-shedding template's FAQPage block - the
// Spanish IRPF guide carried "What size solar system do I need for load
// shedding?" in its JSON-LD while its visible FAQ was Spanish and about tax
// deductions. Structured data naming a different article than the page it sits
// on is the pattern search engines treat as misleading, and nothing compared
// the two, so it survived three Codex reviews on #373/#375/#376 and stayed live
// on main.
//
// This is the comparison that was missing. The rule is not "the FAQ must be
// long" or "the FAQ must be in the page's language" - those are judgement calls
// a matcher gets wrong. The rule is mechanical: every question the page asks
// its reader is a question in its structured data, word for word.

test("every blog FAQPage mirrors the FAQ its page shows", () => {
  const { rewrites, errors } = run({ check: true });
  const rel = (d) => d.path.slice(ROOT.length + 1).replace(/\\/g, "/");
  assert.deepEqual(
    rewrites.map(rel),
    [],
    "structured data differs from the visible FAQ; run node scripts/sync-faq-jsonld.mjs",
  );
  // Codex P2 on #428: a page that lost ONE of the two representations was
  // reported as `changed: false` and dropped, so a FAQPage that outlived its
  // visible FAQ passed this gate. It is a mismatch, not a skip.
  assert.deepEqual(
    errors.map(rel),
    [],
    "a page carries one representation but not the other; a rewrite cannot invent the missing side",
  );
});

test("the load-shedding questions are only on the load-shedding article", () => {
  const templateQuestion =
    "What size solar system do I need for load shedding?";
  const page = "blog/escape-load-shedding/index.html";
  const loader = (p) => readFileSync(join(ROOT, p), "utf8");
  const questions = visibleFaq(loader(page)).map((q) => q.question);
  assert.ok(
    questions.includes(templateQuestion),
    "the article that owns this FAQ should still ask it",
  );

  // The defect this test exists for: the same four questions appearing on pages
  // about Spanish tax, Polish subsidies, and so on.
  const others = [
    "blog/deduccion-irpf-autoconsumo-2026/index.html",
    "blog/dotacja-magazyn-energii-2026/index.html",
    "blog/program-afm-baterii-2026/index.html",
    "blog/gia-dien-5-bac-2026/index.html",
  ];
  for (const other of others) {
    const html = loader(other);
    assert.ok(
      !visibleFaq(html).some((q) => q.question === templateQuestion),
      `${other} should not reuse the load-shedding question`,
    );
  }
});

test("normalize collapses markup without inventing word breaks", () => {
  // "</a>." must not become "guide ." - that artifact made an earlier version
  // of this check report drift on pages whose text was identical.
  assert.equal(
    normalize('<p>See <a href="/x">DOE\'s guide</a>.</p>'),
    "See DOE's guide.",
  );
  assert.equal(normalize("  a\n   b\tc  "), "a b c");
  assert.equal(normalize("R&amp;D &lt;ok&gt;"), "R&D <ok>");
});

test("a page whose visible FAQ changes is reported, not silently accepted", () => {
  const html = [
    "<html><body>",
    "<details><summary>New question?</summary><p>New answer.</p></details>",
    '<script type="application/ld+json">',
    "{",
    '  "@graph": [',
    "    {",
    '      "@type": "FAQPage",',
    '      "mainEntity": [',
    "        {",
    '          "@type": "Question",',
    '          "name": "Old question?",',
    '          "acceptedAnswer": { "@type": "Answer", "text": "Old answer." }',
    "        }",
    "      ]",
    "    }",
    "  ]",
    "}",
    "</script>",
    "</body></html>",
  ].join("\n");
  const { changed, reason } = syncPage(html);
  assert.equal(changed, true);
  assert.equal(reason, "drifted");
});

// The two mismatch shapes the mirror cannot repair by rewriting. Both used to
// return `changed: false` and therefore passed, which made the gate silent on
// exactly the defect it was built for: structured data that outlived the FAQ it
// describes, or a FAQ whose structured data went missing.
test("a visible FAQ with no FAQPage is a failure, not a skip", () => {
  const html =
    "<html><body><details><summary>Q?</summary><p>A.</p></details></body></html>";
  const result = syncPage(html);
  assert.equal(result.reason, "no-faqpage");
  assert.equal(classify(result), "error");
});

test("a FAQPage that outlived its visible FAQ is a failure, not a skip", () => {
  const html = [
    "<html><body>",
    '<script type="application/ld+json">',
    '{"@graph":[{"@type":"FAQPage","mainEntity":[' +
      '{"@type":"Question","name":"Q?","acceptedAnswer":{"@type":"Answer","text":"A."}}]}]}',
    "</script>",
    "</body></html>",
  ].join("\n");
  const result = syncPage(html);
  assert.equal(result.reason, "no-visible-faq");
  assert.equal(classify(result), "error");
});

test("a page with neither representation stays out of scope", () => {
  const result = syncPage("<html><body>no faq here</body></html>");
  assert.equal(result.reason, "no-faq");
  assert.equal(classify(result), "ok");
});

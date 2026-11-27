// #434 — the static accessibility gate's own teeth.
//
// THE CLAIM THIS FILE DISCHARGES: the markup gate wired into the rail fails on
// the defects the accessibility pass actually found, and does not invent
// findings on markup that is correct. Each case below is a real rule from
// scripts/check-a11y-static.mjs, planted in a page, with the finding that must
// come back — plus the binary's exit code, because a gate that reports a defect
// and exits 0 has not gated anything.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { auditPage, auditStage } from "../scripts/check-a11y-static.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const page = (body, { lang = "en", title = "A page" } = {}) => `<!doctype html>
<html${lang ? ` lang="${lang}"` : ""}>
<head>
<meta charset="utf-8" />
${title ? `<title>${title}</title>` : ""}
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>${body}</body>
</html>`;

const rules = (html, rel = "index.html") =>
  auditPage(rel, html).map((f) => f.rule);

test("#434: a form control with no programmatic name is a NAME finding", () => {
  assert.deepEqual(rules(page(`<input id="rate" type="number" />`)), ["NAME"]);
  // Any of the three real mechanisms clears it.
  assert.deepEqual(rules(page(`<input id="a" aria-label="Rate" />`)), []);
  assert.deepEqual(
    rules(
      page(`<input id="b" aria-labelledby="lbl" /><span id="lbl">Rate</span>`),
    ),
    [],
  );
  assert.deepEqual(
    rules(page(`<label for="c">Rate</label><input id="c" />`)),
    [],
  );
  // A hidden input is not a control a visitor meets.
  assert.deepEqual(rules(page(`<input type="hidden" name="x" />`)), []);
});

test("#434: a dangling aria-describedby is a DESCRIBE finding", () => {
  // The rate field's own error node, present: clean.
  assert.deepEqual(
    rules(
      page(
        `<input id="rate" aria-label="Rate" aria-describedby="rateError" /><p id="rateError">Too low</p>`,
      ),
    ),
    [],
  );
  // The same field with the error node renamed away: announced as nothing.
  const orphaned = rules(
    page(`<input id="rate" aria-label="Rate" aria-describedby="rateError" />`),
  );
  assert.deepEqual(orphaned, ["DESCRIBE"]);
});

test("#434: role=button on a label is a ROLE finding", () => {
  assert.deepEqual(
    rules(
      page(
        `<label for="r" role="button" aria-expanded="false">Rate</label><input id="r" />`,
      ),
    ),
    ["ROLE"],
  );
  // The cure the pass applied: the gloss is a description on the label, the
  // label keeps its role, and no finding is produced.
  assert.deepEqual(
    rules(
      page(
        `<label for="r" aria-description="tariff: what the grid charges">Rate</label><input id="r" />`,
      ),
    ),
    [],
  );
});

test("#434: an img without an alt attribute is an ALT finding; empty alt is decorative", () => {
  assert.deepEqual(rules(page(`<img src="a.png" />`)), ["ALT"]);
  assert.deepEqual(rules(page(`<img src="a.png" alt="" />`)), []);
  assert.deepEqual(rules(page(`<img src="a.png" alt="A roof" />`)), []);
});

test("#434: a viewport that disables zoom is a ZOOM finding", () => {
  const withMeta = (content) =>
    `<html lang="en"><head><title>T</title><meta name="viewport" content="${content}" /></head><body></body></html>`;
  assert.deepEqual(rules(withMeta("width=device-width, user-scalable=no")), [
    "ZOOM",
  ]);
  assert.deepEqual(rules(withMeta("width=device-width, maximum-scale=1.0")), [
    "ZOOM",
  ]);
  assert.deepEqual(rules(withMeta("width=device-width, initial-scale=1")), []);
});

test("#434: a positive tabindex is an ORDER finding", () => {
  assert.deepEqual(rules(page(`<button tabindex="3">Go</button>`)), ["ORDER"]);
  assert.deepEqual(rules(page(`<button tabindex="0">Go</button>`)), []);
  assert.deepEqual(rules(page(`<button tabindex="-1">Go</button>`)), []);
});

test("#434: a page with no lang or no title is a LANG finding", () => {
  assert.deepEqual(rules(page("", { lang: "" })), ["LANG"]);
  assert.deepEqual(rules(page("", { title: "" })), ["LANG"]);
  assert.deepEqual(rules(page("")), []);
});

test("#434: the binary fails, naming the rule, on a planted regression", () => {
  const stage = mkdtempSync(join(tmpdir(), "beco-a11y-"));
  try {
    mkdirSync(stage, { recursive: true });
    writeFileSync(
      join(stage, "index.html"),
      page(
        `<input id="rate" type="number" /><label for="r" role="button">Rate</label>`,
      ),
    );
    let code = 0;
    let output = "";
    try {
      output = execFileSync(
        process.execPath,
        [join(root, "scripts/check-a11y-static.mjs"), "--stage", stage],
        { encoding: "utf8" },
      );
    } catch (err) {
      code = err.status;
      output = `${err.stdout || ""}${err.stderr || ""}`;
    }
    assert.equal(code, 1, "a planted regression must exit non-zero");
    assert.match(output, /NAME/);
    assert.match(output, /ROLE/);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
});

test("#434: an unbuildable stage is an error, never a clean pass", () => {
  const stage = mkdtempSync(join(tmpdir(), "beco-a11y-empty-"));
  try {
    assert.throws(() => auditStage(stage), /no built index\.html/);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
});

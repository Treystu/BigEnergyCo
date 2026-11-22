// #436 (GQ F7) — the presentation spec is canon, so it is pinned to the markup
// it measured. These tests fail if the spec loses a required section, if a rule
// it declares stops being stated, or if a control it audited disappears from the
// page it was measured on (a rename that the audit does not follow is how a spec
// silently stops describing the product).
//
// They do NOT assert that the audited state is correct: the audit records
// findings with dispositions, and the presentation waves implement them. The
// ratchet is that the record keeps matching the surface.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const spec = readFileSync(
  new URL("../docs/PRESENTATION_SPEC_V1.md", import.meta.url),
  "utf8",
);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const article = readFileSync(
  new URL("../blog/is-a-home-battery-worth-it/index.html", import.meta.url),
  "utf8",
);
const index = readFileSync(
  new URL("../docs/INDEX.md", import.meta.url),
  "utf8",
);

test("#436: the spec carries every section a presentation wave builds to", () => {
  for (const section of [
    "## 1. The one rule everything else descends from",
    "## 2. Layout grid",
    "## 3. Block ranks per surface",
    "## 4. Card anatomy",
    "## 5. Disclosure pattern",
    "## 6. Type roles",
    "## 7. Current-surface audit",
    "## 8. What each later wave builds to",
    "## 9. Enforcement",
  ]) {
    assert.ok(spec.includes(section), `spec must keep the section: ${section}`);
  }
  assert.match(
    index,
    /PRESENTATION_SPEC_V1\.md/,
    "the docs index must point at it",
  );
});

test("#436: the rank rules that govern later waves are stated, not implied", () => {
  for (const rule of [
    "Exactly one primary action per surface",
    "A control is not an action",
    "At most one secondary action per surface",
    "One act, one control",
    "The primary action never lives inside a closed disclosure",
  ]) {
    assert.ok(spec.includes(rule), `spec must state the rule: ${rule}`);
  }
  // The type scale is explicitly #432's, and the spec must not claim it.
  assert.match(spec, /#432 owns the type system/);
});

test("#436: every co-primary occurrence is recorded with a disposition", () => {
  for (const id of ["P1", "P2", "P3", "P4", "P5", "P6"]) {
    assert.match(
      spec,
      new RegExp(`\\|\\s*${id}\\s*\\|`),
      `${id} must stay in the audit`,
    );
  }
  // Every recording row carries one of the four dispositions.
  for (const disposition of ["keep", "demote", "promote", "remove"]) {
    assert.match(
      spec,
      new RegExp(`\\|\\s*\\*\\*${disposition}\\*\\*`),
      `the audit must keep at least one ${disposition} disposition`,
    );
  }
});

test("#436: each audited control still exists where the audit measured it", () => {
  // P1 chrome primary and P6 chrome secondary, both on the shared header.
  assert.match(
    html,
    /id="btnNavSizeArray"[\s\S]{0,160}?class="btn btn-primary"/,
  );
  assert.match(html, /class="btn btn-secondary"[^>]*>Support|>Support</);
  // P2 landing primary and P3 intake primary.
  assert.match(html, /id="btnHeroSizing"[\s\S]{0,120}?class="btn btn-primary"/);
  assert.match(html, /id="btnRunSizing"/);
  // P5 article CTA — recorded as unranked; the wave that promotes it updates this.
  assert.match(article, /class="btn"[^>]*>Run the free simulation</);
  // F1: the audit's finding is about a surface that no longer exists. #441
  // removed the fork, so the spec's F1 row is now a record of what was taken
  // out — this assertion keeps that removal from being quietly undone.
  assert.doesNotMatch(html, /id="modeToggleRow"/);
  assert.doesNotMatch(html, /id="simpleModeToggle"/);
  assert.match(spec, /F1[\s\S]{0,200}?\*\*remove\*\* — built by #441/);
});

test("#436: the settled count is stated, so a second primary cannot be added quietly", () => {
  assert.match(spec, /Zero surfaces carry two primaries after these/);
  assert.match(spec, /never more than 1 visible per surface/);
});

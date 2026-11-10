// Live-surface audit pins (Part A plan alignment, Part B staging->prod parity).
//
// OFFLINE BY DESIGN. These tests never touch the network: they pin the
// CLASSIFIER and the committed receipt, so a re-run that changes a verdict
// without changing a read fails here instead of quietly rewriting history.
//
// Run: node --test tests/audit-live-surfaces.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  PARITY_PATHS,
  parityVerdict,
} from "../scripts/audit-live-surfaces.mjs";

const receipt = JSON.parse(
  readFileSync(
    new URL(
      "../docs/lane/data-reads/2026-11-10-live-surfaces.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

test("parity: equal reads are identical, unequal reads are divergent", () => {
  assert.equal(parityVerdict("abc", "abc"), "identical");
  assert.equal(parityVerdict("abc", "def"), "divergent");
  // A missing read is unobservable, not a difference: an error must never be
  // reported as a divergence.
  assert.equal(parityVerdict(null, "def"), "unobservable");
  assert.equal(parityVerdict(null, null), "unobservable");
});

test("parity: the receipt's verdicts match its own recorded reads", () => {
  const rows = receipt.parity.rows;
  assert.equal(rows.length, PARITY_PATHS.length);
  for (const row of rows) {
    const expected = parityVerdict(row.prod, row.staging);
    assert.equal(row.verdict, expected, row.item);
    // A divergent row must name different values, or it is a mislabel.
    if (row.verdict === "divergent") assert.notEqual(row.prod, row.staging);
  }
  assert.equal(
    receipt.parity.identical +
      receipt.parity.divergent +
      receipt.parity.unobservable,
    rows.length,
  );
});

test("parity: the walked surface covers the shell, the config and the bundles", () => {
  const items = receipt.parity.rows.map((r) => r.item);
  for (const p of [
    "/",
    "/sw.js",
    "/sitemap.xml",
    "/robots.txt",
    "/manifest.webmanifest",
  ]) {
    assert.ok(items.includes(p), `missing ${p}`);
  }
  // Immutable-stamp bundles are the parity items that actually reach visitors
  // after the first load, so at least one must be walked.
  assert.ok(items.some((i) => i.startsWith("/assets/js/")));
});

test("plan alignment: every claim row carries a verdict and its observation", () => {
  const claims = receipt.planAlignment.claims;
  assert.ok(claims.length >= 6, `only ${claims.length} claims checked`);
  const allowed = new Set([
    "holds",
    "holds-in-substance",
    "partly-stale",
    "stale",
  ]);
  for (const c of claims) {
    assert.ok(c.doc.startsWith("docs/plan/"), c.doc);
    assert.ok(allowed.has(c.verdict), `${c.doc}: ${c.verdict}`);
    assert.ok(
      c.claim && c.claim.length > 20,
      "a claim must be quoted, not paraphrased",
    );
    assert.ok(
      c.observed && Object.keys(c.observed).length > 0,
      "no observation recorded",
    );
    assert.ok(c.why && c.why.length > 40, "a verdict needs its reasoning");
  }
  const counts = receipt.planAlignment;
  assert.equal(
    counts.holds + counts.partlyStale + counts.stale + counts.holdsInSubstance,
    claims.length,
  );
});

test("plan alignment: the two stale plan facts are the ones filed for amendment", () => {
  const stale = receipt.planAlignment.claims.filter(
    (c) => c.verdict === "stale" || c.verdict === "partly-stale",
  );
  assert.ok(stale.length >= 2);
  // The MASTER_PLAN one must carry proposed amendment text, because that file
  // is hash-pinned and cannot be edited without an owner-approved amendment.
  const planStale = stale.find(
    (c) => c.doc === "docs/plan/MASTER_PLAN.md" && c.verdict === "stale",
  );
  assert.ok(planStale, "the stale MASTER_PLAN claim is missing");
  assert.ok(planStale.proposedAmendment.includes("221"));
  assert.ok(planStale.proposedAmendment.includes("7 locales"));
});

test("the rollback target was read, not touched", () => {
  // Read-only evidence only: status, stamp and size. No deploy artifact, no
  // flag, no domain change appears in this receipt for that project.
  const rb = receipt.parity.singleSurface.rollbackTarget;
  assert.equal(rb.status, 200);
  assert.equal(rb.stamp, "20261025b");
  const raw = JSON.stringify(rb);
  assert.ok(!/deploy|prefix|flag|domain/i.test(raw));
});

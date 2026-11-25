// #440 (GQ F11) — the ladder's order is a contract, so it is pinned to fixtures.
//
// The ranking is presentation order derived from declared features. These tests
// hold three things the spec (§12) and the issue both require: the registry is
// the ladder's content, the owner's two places rank as filed, and a feature-poor
// place falls back to the registry's neutral order with no why-lines.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  PRIOR_FIXTURES,
  isFeaturePoor,
  rankCases,
  scoreCases,
  whyFor,
  FEATURE_SOURCES,
  OPEN_PRIOR_QUESTIONS,
} from "../assets/js/sizing/priors.js";
import { USE_CASE_IDS, USE_CASES } from "../assets/js/sizing/usecases.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ui = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const locales = readFileSync(
  new URL("../assets/js/shared/locales.js", import.meta.url),
  "utf8",
);

test("#440: the ladder is the registry's six cases, in the registry's order", () => {
  assert.equal(USE_CASE_IDS.length, 6);
  const rows = rankCases({});
  assert.deepEqual(
    rows.map((r) => r.id),
    USE_CASE_IDS,
    "a feature-poor place shows the registry order",
  );
  assert.ok(
    html.includes('id="caseLadder"'),
    "the intake carries one ladder control",
  );
  assert.ok(
    ui.includes("rankCases(ladderFeatures)"),
    "the ladder rows are rendered from the ranking, not hard-coded",
  );
  // Every case's label comes from the registry's own key.
  assert.match(ui, /t\(c\.labelKey\)/);
});

test("#440: every declared feature names its source and grade", () => {
  for (const [name, meta] of Object.entries(FEATURE_SOURCES)) {
    assert.ok(meta.source, `${name} must name its source`);
    assert.match(meta.grade, /^[ABC]$/, `${name} must carry a grade`);
  }
  // A feature that is declared but has no field is not guessed into a ranking.
  assert.ok(
    ui.includes("featuresFromLocation") &&
      /rateLevel = Math\.min\(1, rate \/ 0\.6\)/.test(ui),
    "only the tariff rate is wired as a live feature",
  );
});

test("#440: the owner's two places rank as filed", () => {
  const la = PRIOR_FIXTURES.find((f) => /Los Angeles/.test(f.name));
  const trabuco = PRIOR_FIXTURES.find((f) => /Trabuco/.test(f.name));
  assert.ok(la && trabuco, "both owner examples are fixtures");
  assert.equal(la.expect[0], "tou", "Los Angeles proper: TOU battery first");
  assert.equal(
    trabuco.expect[0],
    "backup",
    "Trabuco Canyon: solar with backup first",
  );
  for (const fixture of PRIOR_FIXTURES) {
    const rows = rankCases(fixture.features);
    assert.deepEqual(
      rows.map((r) => r.id),
      fixture.expect,
      `${fixture.name}: order`,
    );
    assert.equal(rows[0].whyKey, fixture.why, `${fixture.name}: top why-line`);
    if (fixture.featurePoor)
      assert.ok(
        rows.every((r) => r.whyKey === null),
        `${fixture.name}: no why-lines`,
      );
  }
});

test("#440: priors order the list and never remove a case", () => {
  for (const fixture of PRIOR_FIXTURES) {
    const rows = rankCases(fixture.features);
    assert.deepEqual([...rows.map((r) => r.id)].sort(), [...USE_CASE_IDS].sort());
  }
  // A low-prior case keeps its own row and its own metric.
  for (const id of USE_CASE_IDS)
    assert.ok(USE_CASES[id].metric.id, `${id} keeps its metric`);
});

test("#440: why-lines are hedged and translated in every locale", () => {
  const keys = new Set(
    PRIOR_FIXTURES.map((f) => f.why).filter(Boolean).concat(
      USE_CASE_IDS.map((id) => whyFor(id, {
        touSchedule: true,
        outageExposure: true,
        rateLevel: 0.9,
        placeClass: "rural",
      })).filter(Boolean),
    ),
  );
  for (const key of keys) {
    const hits = locales.match(new RegExp(`^ {4}${key}:`, "gm")) || [];
    assert.equal(hits.length, 7, `${key} is translated in all seven locales`);
  }
  // The hedge is in the copy, not only in the comment: each why-line states
  // likelihood rather than a certainty.
  assert.match(locales, /caseWhyTou:[\s\S]{0,120}(likely|probablemente|provavelmente|probablement|wahrscheinlich|waarschijnlijk|غالبًا)/);
});

test("#440: the ladder never gates the run and a pick commits at once", () => {
  // The primary stays the explicit button (spec §10.3, §12.5).
  assert.match(html, /id="btnRunSizing"/);
  assert.doesNotMatch(html, /id="modeToggleRow"/);
  // A pick applies the case immediately, through the one writer.
  assert.match(ui, /applyUseCase\(id\);\s*\r?\n\s*paintLadderSelection\(\)/);
  // The two legacy ids survive on their cases, so the smoke scripts still work.
  assert.match(ui, /id === "billcut"\) return "btnGoalGridtie"/);
  assert.match(ui, /id === "offgrid"\) return "btnGoalOffgrid"/);
});

test("#440: the estimate summary states defaults, never a priced figure", () => {
  assert.ok(html.includes('id="estimateCard"'), "the card exists");
  assert.ok(html.includes('id="estimateBasis"'), "its basis line exists");
  // No price is invented: the card reads the bill, the load and the cut target.
  assert.match(ui, /set\("estimateBill", Number\.isFinite\(bill\)/);
  assert.match(ui, /t\("estimateBasis", \{ rate: rate\.toFixed\(2\) \}\)/);
});

test("#440: open prior questions are recorded, not resolved by guess", () => {
  assert.ok(OPEN_PRIOR_QUESTIONS.length >= 1);
  for (const q of OPEN_PRIOR_QUESTIONS) {
    assert.ok(q.decider && q.reason, `${q.id} carries a decider and a reason`);
  }
  assert.ok(scoreCases({}).billcut > 0);
  assert.ok(isFeaturePoor({}), "an empty feature set is feature-poor");
});

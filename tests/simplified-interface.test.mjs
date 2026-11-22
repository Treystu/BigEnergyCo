// Owner order 2026-11-22 (simplified interface, staging-first). The shipped
// artifact is index.html with no build step, so these are censuses of what the
// browser receives, plus the one arithmetic identity the PLAN screen rests on.
//
// The order fixes three screens: HOME (one headline, one place field, one
// action), CALCULATOR (where / goal / monthly bill, one action, no modes) and
// PLAN (one price, three stats, a three-line breakdown that sums to the price).
// Presentation spec V1 governs rank and the disclosure pattern where the two
// agree; the mock-up's spareness wins where they differ.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES } from "../assets/js/shared/locales.js";
import { planBreakdown } from "../assets/js/sizing/plan-card.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ui = readFileSync(
  new URL("../assets/js/sizing/ui.js", import.meta.url),
  "utf8",
);
const chat = readFileSync(
  new URL("../assets/js/chat.js", import.meta.url),
  "utf8",
);

test("HOME: one headline, one place field, one action", () => {
  const start = html.indexOf('class="hero hero-compact"');
  assert.ok(start > 0, "the hero carries the compact home treatment");
  const hero = html.slice(start, html.indexOf("</section>", start));
  assert.equal(
    (hero.match(/id="heroPlace"/g) || []).length,
    1,
    "the home screen carries exactly one place field",
  );
  assert.match(hero, /id="btnHeroSizing"/);
  assert.equal(
    (hero.match(/btn btn-primary/g) || []).length,
    1,
    "the home screen carries exactly one primary action",
  );
});

test("HOME: the place field hands off to the calculator's one input", () => {
  // One ask, one input: the home field writes into #citySearch and fires its
  // own event path, rather than becoming a second source of location truth.
  assert.match(chat, /handOffHeroPlace/);
  assert.match(chat, /getElementById\("heroPlace"\)/);
  assert.match(chat, /getElementById\("citySearch"\)/);
  assert.match(chat, /city\.dispatchEvent\(new Event\("input"/);
});

test("CALCULATOR: where, goal, monthly bill, then one action", () => {
  const where = html.indexOf('id="citySearch"');
  const goal = html.indexOf('class="form-group goal-segmented-wrap"');
  const bill = html.indexOf('id="billSliderWrap"');
  const advanced = html.indexOf('id="advancedControls"');
  const form = html.indexOf('id="fullControls"');
  const run = html.indexOf('id="btnRunSizing"');

  assert.ok(where > 0 && goal > 0 && bill > 0 && run > 0);
  assert.ok(where < goal, "where precedes the goal");
  assert.ok(goal < bill, "the goal precedes the monthly bill");
  assert.ok(bill < run, "the three questions precede the one action");
  assert.ok(bill < advanced, "the optional depth follows the three questions");
  assert.ok(
    advanced < form,
    "every other input lives inside the single optional disclosure",
  );
  assert.ok(
    html.lastIndexOf("</details>", run) > form,
    "the optional disclosure closes before the primary action, so the action is never inside it",
  );
  assert.match(html, /<summary data-i18n="advancedSummary">/);
});

test("PLAN: the one price is the sum of its three lines", () => {
  assert.match(html, /id="planCardWrap"/);
  assert.match(ui, /planBreakdown\(route\)/);
  assert.match(ui, /if \(!consistent\) return;/);

  // The self-purchase route's real shape: three non-empty lines.
  const self = {
    hardware: 4200,
    labour: 1800,
    fees: 700,
    tools: 250,
    year0: 6950,
  };
  const b = planBreakdown(self);
  assert.equal(b.hardware, 4200);
  assert.equal(b.labour, 1800);
  assert.equal(b.feesAndTools, 950, "tools ride with the permits");
  assert.equal(b.total, 6950);
  assert.equal(b.hardware + b.labour + b.feesAndTools, b.total);
  assert.equal(b.total, b.year0);
  assert.equal(b.consistent, true);

  // An all-in benchmark route: the same identity over structural zeros.
  const turnkey = { hardware: 8800, labour: 0, fees: 0, tools: 0, year0: 8800 };
  const t2 = planBreakdown(turnkey);
  assert.equal(t2.total, 8800);
  assert.equal(t2.consistent, true);
});

test("PLAN: a route whose parts disagree with its total renders no plan", () => {
  const broken = {
    hardware: 4200,
    labour: 1800,
    fees: 700,
    tools: 250,
    year0: 9999,
  };
  assert.equal(planBreakdown(broken).consistent, false);
  assert.equal(planBreakdown({}).consistent, false);
  assert.equal(
    planBreakdown({ hardware: 0, labour: 0, fees: 0, tools: 0, year0: 0 })
      .consistent,
    false,
    "a zero plan is not a plan",
  );
});

test("every locale carries the simplified-interface strings", () => {
  const keys = [
    "heroPlaceholder",
    "advancedSummary",
    "planTitle",
    "planBasis",
    "planStatSavings",
    "planStatPayback",
    "planStatBillCut",
    "planRowHardware",
    "planRowLabour",
    "planRowFees",
    "planTotalLabel",
    "planSystemSize",
    "planPaybackValue",
  ];
  for (const [lang, dict] of Object.entries(LOCALES)) {
    for (const key of keys) {
      assert.equal(typeof dict[key], "string", `${lang}.${key} must exist`);
      assert.ok(
        dict[key].trim().length > 0,
        `${lang}.${key} must not be blank`,
      );
    }
    assert.match(dict.planBasis, /\{size\}/, `${lang}.planBasis keeps {size}`);
    assert.match(
      dict.planSystemSize,
      /\{pv\}[\s\S]*\{batt\}/,
      `${lang}.planSystemSize keeps both placeholders`,
    );
    assert.match(
      dict.planPaybackValue,
      /\{year\}/,
      `${lang}.planPaybackValue keeps {year}`,
    );
  }
});

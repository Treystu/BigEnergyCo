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
import { partsBreakdown as planBreakdown } from "../assets/js/sizing/plan-card.js";

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

test("PLAN: the one price is the sum of its three parts lines", () => {
  assert.match(html, /id="planCardWrap"/);
  assert.match(ui, /partsBreakdown\(/);
  assert.match(ui, /if \(!consistent\) return;/);

  // The DIY parts basket: panels, battery, inverter, and nothing else.
  const parts = { panelsUsd: 4200, batteryUsd: 3100, inverterUsd: 900 };
  const b = planBreakdown(parts, 8200);
  assert.equal(b.panels, 4200);
  assert.equal(b.battery, 3100);
  assert.equal(b.inverter, 900);
  assert.equal(b.total, 8200);
  assert.equal(b.panels + b.battery + b.inverter, b.total);
  assert.equal(b.consistent, true);

  // The engine's canonical parts figure is the only number the card may print.
  assert.equal(planBreakdown(parts, 12345).consistent, false);
});

test("PLAN: a parts basket that disagrees with its total renders no plan", () => {
  assert.equal(
    planBreakdown({ panelsUsd: 4200, batteryUsd: 3100, inverterUsd: 900 }, 9999)
      .consistent,
    false,
  );
  assert.equal(planBreakdown({}, 5000).consistent, false);
  assert.equal(planBreakdown(undefined, undefined).consistent, false);
  assert.equal(
    planBreakdown({ panelsUsd: 0, batteryUsd: 0, inverterUsd: 0 }, 0)
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
    "planStatPartsPayback",
    "planStatInstalledPayback",
    "planStatBillCut",
    "planRowPanels",
    "planRowBattery",
    "planRowInverter",
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

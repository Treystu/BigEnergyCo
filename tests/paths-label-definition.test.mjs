// #401 Cure A, X1: one definition per displayed label.
//
// The results page prints two different "20-year cost" quantities for one
// system: the engine's total (`resLblTotalCost`, which INCLUDES the grid bills
// the system still pays) and each pay card's `pathsSpend20` (which EXCLUDES
// them, and is reported beside the bills as a separate row). The audit's X1
// finding was that both read "20-year cost" in every language, so a reader had
// no way to know they were different baskets.
//
// The cure is the label naming its basket. This test fails if any locale goes
// back to sharing one label — including a locale added later.
import assert from "node:assert/strict";
import test from "node:test";

import { LOCALES } from "../assets/js/shared/locales.js";

const locales = Object.keys(LOCALES);

test('every locale names the pay card\'s basket, not just "20-year cost"', () => {
  assert.ok(
    locales.length >= 7,
    `expected the 7 shipping locales, got ${locales.length}`,
  );
  for (const loc of locales) {
    const t = LOCALES[loc];
    assert.equal(typeof t.pathsSpend20, "string", `${loc}: missing label`);
    assert.notEqual(
      t.pathsSpend20,
      t.resLblTotalCost,
      `${loc}: the card's basket and the results row's basket share one label`,
    );
    // The card's figure is year0 - incentives + recurring: equipment, upkeep
    // and replacements. The label must say so rather than say "total".
    assert.ok(
      /\(|（/.test(t.pathsSpend20),
      `${loc}: the label must state its basket in parentheses, got "${t.pathsSpend20}"`,
    );
  }
});

test("the results row keeps its own inclusive label", () => {
  for (const loc of locales) {
    const t = LOCALES[loc];
    assert.equal(typeof t.resLblTotalCost, "string", `${loc}: missing label`);
    assert.ok(
      t.resLblTotalCost.length > 0 && t.resLblTotalCost !== t.pathsSpend20,
      loc,
    );
  }
});

// #402 / Cure B: a comparison sentence belongs to ONE pair, on the card it
// names; an incentive difference is explained the same way on every card.
//
// X4, as it actually happened: the renderer searched the ranking explanations
// with `.find(r => r.cheaper === id || r.dearer === id)`. Every sentence has two
// cards that match, so each one appeared TWICE, and a card that is cheaper in
// one pair and dearer in the next always showed whichever pair came first in the
// list. On a four-card panel that put "You buy the parts is $5,485 cheaper than
// Lease or PPA" under the buy-parts card, the lease card and, in the owner's
// screenshot, a card the sentence did not lead with at all.
//
// X5: the same system's incentive read $1,000, $3,203 and "the provider keeps
// them" on three cards, with no reason anywhere - although the registry knows
// exactly which routes may claim which incentive.
import assert from "node:assert/strict";
import test from "node:test";

import {
  describePaths,
  incentiveBasisRows,
  pairLinesFor,
  priceAllPaths,
  systemForPaths,
} from "../assets/js/sizing/paths.js";

const tr = (k) => k;

const priced = () =>
  priceAllPaths(
    systemForPaths(
      {
        pvKw: 1.92,
        battKwh: 11,
        servedKwhPerYear: 3091,
        replacementsHorizon: 0,
      },
      {
        annualBaselineBillsUsd: 1606,
        annualResidualBillsUsd: 247,
        billCutPct: 85,
        tariff: 0.44,
      },
    ),
    { country: "US" },
  );

const cardsFor = (r) => describePaths(r, (v) => `$${Math.round(v)}`, tr);

test("one pair sentence per pair, and only on the card it names", () => {
  const r = priced();
  const cards = cardsFor(r);
  const rows = pairLinesFor(cards, r.rankingExplained);
  const shown = rows.filter((x) => x.pair);
  assert.equal(shown.length, r.rankingExplained.length, "one row per pair");
  const ids = shown.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length, "no card carries two pairs");
  for (const { id, pair } of shown) {
    assert.equal(pair.cheaper, id, "the sentence sits on the cheaper card");
    assert.notEqual(pair.cheaper, pair.dearer, "a pair needs two routes");
  }
});

test("the dearest route overall carries no comparison at all", () => {
  // The last card has no dearer neighbour, so it has no pair. (A card in the
  // middle can legitimately be dearer in one pair and cheaper in the next, which
  // is exactly why the old lookup picked the wrong sentence for it.)
  const r = priced();
  const cards = cardsFor(r);
  const rows = pairLinesFor(cards, r.rankingExplained);
  const dearest = r.rankingExplained[r.rankingExplained.length - 1].dearer;
  assert.equal(rows.find((x) => x.id === dearest).pair, null);
});

test("a card that appears in two pairs gets its own, not the first match", () => {
  // The middle cards are exactly the case the old `.find` got wrong: dearer in
  // one pair, cheaper in the next.
  const r = priced();
  const cards = cardsFor(r);
  const rows = pairLinesFor(cards, r.rankingExplained);
  const middle = r.rankingExplained[1];
  assert.ok(middle, "the driven run must rank at least three routes");
  const row = rows.find((x) => x.id === middle.cheaper);
  assert.equal(row.pair, middle);
});

test("an unavailable card never carries a comparison", () => {
  const r = priced();
  const cards = cardsFor(r).map((c) =>
    c.id === "lease" ? { ...c, available: false } : c,
  );
  const rows = pairLinesFor(cards, r.rankingExplained);
  assert.equal(rows.find((x) => x.id === "lease").pair, null);
});

test("the incentive basis is identical words on every card that prints it", () => {
  const cards = cardsFor(priced());
  const rows = incentiveBasisRows(cards);
  assert.ok(rows.length >= 2, "the driven run compares several routes");
  // One line per route, in the cards' own order, and each names its route.
  assert.deepEqual(
    rows.map((r) => r.id),
    cards.filter((c) => c.available).map((c) => c.id),
  );
  for (const row of rows)
    assert.ok(
      row.text.startsWith(cards.find((c) => c.id === row.id).labelText),
      `${row.id}: the line must name its own route`,
    );
});

test("the incentive line says which incentive, not just how much", () => {
  const cards = cardsFor(priced());
  const rows = incentiveBasisRows(cards);
  const cash = rows.find((r) => r.id === "selfpurchase");
  assert.match(cash.text, /pathsIncentiveTaxCredit/, "names the credit");
  const tk = rows.find((r) => r.id === "turnkey");
  assert.match(tk.text, /pathsIncentiveRebate/, "names the rebate");
  // And a route whose incentives went elsewhere says so in its own terms.
  const lease = rows.find((r) => r.id === "lease");
  assert.match(lease.text, /pathsIncentivesGoToProvider/);
});

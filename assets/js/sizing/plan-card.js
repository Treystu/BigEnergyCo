/**
 * PLAN screen arithmetic (owner order 2026-11-22, re-based 2026-11-24).
 *
 * The plan shows ONE price and a three-line parts breakdown under it. Those two
 * are not allowed to be independent numbers: the price is the sum of the three
 * parts lines, and both must equal the price the engine already computed for
 * the same system (`costBuyableUsd`).
 *
 * The basis is the DIY parts cost of goods, not an installed route: panels,
 * battery and inverter, with no labour, installation hours or permits anywhere
 * in this figure. The installed routes are a separate, labelled comparison and
 * never feed this number (owner pricing correction 7128520970, retained by the
 * 2026-11-24 order).
 */
export function partsBreakdown(parts, headlineUsd) {
  const panels = Math.round(Number(parts?.panelsUsd) || 0);
  const battery = Math.round(Number(parts?.batteryUsd) || 0);
  const inverter = Math.round(Number(parts?.inverterUsd) || 0);
  const total = panels + battery + inverter;
  const headline = Math.round(Number(headlineUsd) || 0);
  return {
    panels,
    battery,
    inverter,
    total,
    headline,
    // The card may only print a price its own parts lines sum to, and that sum
    // must be the engine's canonical parts figure. A system that fails this is
    // a pricing defect, not something the card should paper over.
    consistent: total > 0 && headline > 0 && Math.abs(total - headline) <= 1,
  };
}

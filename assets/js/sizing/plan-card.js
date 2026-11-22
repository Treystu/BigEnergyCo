/**
 * PLAN screen arithmetic (owner order 2026-11-22).
 *
 * The plan shows ONE price and a three-line breakdown under it. Those two are
 * not allowed to be independent numbers: the price is the sum of the three
 * lines, and both must equal the priced route's own year-0 total. This module
 * is that identity, kept out of the renderer so it can be tested directly.
 *
 * The route is the object `paths.js` already prices (hardware, labour, fees,
 * tools, year0). Tools are the DIY allowance and ride with the permits in the
 * third line, so the reader always sees three lines, not four.
 */
export function planBreakdown(route) {
  const hardware = Math.round(Number(route?.hardware) || 0);
  const labour = Math.round(Number(route?.labour) || 0);
  const feesAndTools = Math.round(
    (Number(route?.fees) || 0) + (Number(route?.tools) || 0),
  );
  const total = hardware + labour + feesAndTools;
  const year0 = Math.round(Number(route?.year0) || 0);
  return {
    hardware,
    labour,
    feesAndTools,
    total,
    year0,
    // The plan may only print a price the three lines actually sum to, and that
    // sum must be the route's own year-0 figure. A route that fails this is a
    // pricing defect, not something the card should paper over.
    consistent: total > 0 && total === year0,
  };
}

// #401 item 5: every published total reconstructs from its stated line items.
//
// #401's acceptance asks for a run where "every total reconstructs from its
// line items". That is a property of the arithmetic, not of a screenshot, so it
// belongs in a test: for each path and each bound of its band, the total must
// equal the sum of the components published beside it.
//
// The defect this pins: the self-purchase/DIY path assembled its low end
// separately from its mid and high ends, and the separate assembly left the DIY
// tools allowance out. The low end was therefore not "hardware, labour, fees and
// tools at their cheapest" but "hardware, labour and fees at their cheapest,
// with one line item that the other two bounds include" - a band narrower at one
// end because a cost had been forgotten.
import assert from "node:assert/strict";
import test from "node:test";

import { priceAllPaths, systemForPaths } from "../assets/js/sizing/paths.js";

const price = (over = {}, ctx = {}) =>
  priceAllPaths(
    systemForPaths(
      {
        pvKw: 1.92,
        battKwh: 11,
        servedKwhPerYear: 3091,
        replacementsHorizon: 0,
        ...over,
      },
      {
        annualBaselineBillsUsd: 1606,
        annualResidualBillsUsd: 247,
        billCutPct: 85,
        tariff: 0.44,
        ...ctx,
      },
    ),
    { country: "US" },
  );

const BOUNDS = [
  { key: "low", total: "year0Low" },
  { key: "mid", total: "year0" },
  { key: "high", total: "year0High" },
];

test("every path publishes a line-item set for each bound of its band", () => {
  const r = price();
  for (const p of r.paths) {
    if (!p.available) continue;
    assert.ok(p.parts, `${p.id}: no breakdown`);
    for (const { key } of BOUNDS) {
      const b = p.parts[key];
      assert.ok(b, `${p.id}.${key}: missing`);
      for (const k of ["hardware", "labour", "fees", "tools"])
        assert.equal(
          typeof b[k],
          "number",
          `${p.id}.${key}.${k} must be a number, not ${typeof b[k]}`,
        );
    }
  }
});

test("each bound's total is the sum of that bound's own items", () => {
  const r = price();
  for (const p of r.paths) {
    if (!p.available) continue;
    for (const { key, total } of BOUNDS) {
      const b = p.parts[key];
      const sum = b.hardware + b.labour + b.fees + b.tools;
      assert.equal(
        p[total],
        sum,
        `${p.id}.${total} (${p[total]}) != ${JSON.stringify(b)} = ${sum}`,
      );
    }
  }
});

test("the mid components are the fields the cards print", () => {
  const r = price();
  for (const p of r.paths) {
    if (!p.available) continue;
    assert.equal(p.hardware, p.parts.mid.hardware, `${p.id}: hardware`);
    assert.equal(p.labour, p.parts.mid.labour, `${p.id}: labour`);
    assert.equal(p.fees, p.parts.mid.fees, `${p.id}: fees`);
    assert.equal(p.tools, p.parts.mid.tools, `${p.id}: tools`);
  }
});

test("the DIY low end pays the tools allowance its other bounds pay", () => {
  // DIY mounting is not offered in the US (the owner may not do the wiring
  // there), so this shape is read in a market where it is: India's block.
  const r = priceAllPaths(
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
    { country: "IN" },
  );
  const diy = r.paths.find((p) => p.id === "diy");
  assert.ok(diy && diy.available, "the DIY path must be available in IN");
  assert.ok(
    diy.parts.low.tools > 0,
    "a DIY build buys tools at the low end too",
  );
  // And the whole band still rises: low <= mid <= high. A "low" end above the
  // mid would be its own defect, and it is cheap to rule out here.
  assert.ok(diy.parts.low.tools <= diy.parts.mid.tools);
  assert.ok(diy.year0Low <= diy.year0 && diy.year0 <= diy.year0High);
});

test("the all-in benchmark does not pretend to have separate fees", () => {
  const r = price();
  const tk = r.paths.find((p) => p.id === "turnkey");
  assert.ok(tk && tk.available);
  assert.equal(tk.parts.mid.labour, 0);
  assert.equal(tk.parts.mid.fees, 0);
  assert.equal(
    tk.parts.mid.hardware,
    tk.year0,
    "the all-in figure IS hardware",
  );
});

test("a battery-only run still reconstructs, at every bound", () => {
  const r = price({ pvKw: 0, battKwh: 11 });
  for (const p of r.paths) {
    if (!p.available) continue;
    for (const { key, total } of BOUNDS) {
      const b = p.parts[key];
      assert.equal(
        p[total],
        b.hardware + b.labour + b.fees + b.tools,
        `${p.id}.${total}`,
      );
    }
  }
});

test("the labour and fee model states its own grade and basis", async () => {
  const { LABOUR_MODEL } = await import("../assets/js/sizing/paths.js");
  assert.ok(
    LABOUR_MODEL,
    "the model must be inspectable, not implied by arithmetic",
  );
  assert.match(LABOUR_MODEL.grade, /^[A-F]$/);
  assert.ok(LABOUR_MODEL.basis && LABOUR_MODEL.basis.length > 40);
  // Every column the labour/fee arithmetic reads is named here, so a column
  // added to the rows without a stated basis fails this rather than shipping.
  for (const col of [
    "elecRate",
    "elecBaseH",
    "elecPerKwH",
    "elecPerKwhH",
    "connectBaseH",
    "connectPerKwhH",
    "permit",
    "inspection",
    "interconnection",
    "diyTools",
  ])
    assert.ok(LABOUR_MODEL.columns.includes(col), `${col} must be covered`);
});

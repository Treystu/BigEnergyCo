// Champion Audit #346 - the tier search's truncation windows must not cost
// lifetime cost on the corpus.
//
// `sizeForTier` bounds its lattice scan with two windows (PV probing stops 4
// steps past the first feasible PV per battery row; battery rows stop 15 steps
// past the best-so-far bank). Those windows are only safe while the search still
// lands on the lattice optimum. This test pins that property on small envelopes
// so it stays cheap: the champion's pick must cost exactly what an exhaustive
// sweep of the same lattice finds.
//
// The full corpus and the acceptance calculation live in
// scripts/champion-audit-sizeForTier.mjs; this is the teeth that stop a future
// window widening (or a lattice change) from silently reintroducing regret.
//
// Run: node --test tests/champion-audit-sizeForTier.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";

import { runCase } from "../scripts/champion-audit-sizeForTier.mjs";

// Small enough to stay fast, large enough to contain each case's optimum.
const ENVELOPE = { pvStep: 0.5, pvMax: 8, battStep: 1, battMax: 24 };

test("#346: the tier search costs no more than an exhaustive sweep (Nairobi, tier95)", () => {
  const result = runCase(
    {
      city: "Nairobi, Kenya",
      kwhPerDay: 5,
      chemistry: "lfp",
      tier: "tier95",
    },
    ENVELOPE,
  );
  assert.ok(result.champion, "the champion must find a feasible system");
  assert.ok(result.control.pvKw !== null, "the control must find one too");
  assert.equal(
    result.regret,
    0,
    `champion regret ${result.regret} on ${result.champion.pvKw}kW/${result.champion.battKwh}kWh vs control ${result.control.pvKw}kW/${result.control.battKwh}kWh`,
  );
  assert.ok(
    result.champion.meetsConstraint,
    "the returned system must meet the tier it was sized for",
  );
});

test("#346: the tier search costs no more than an exhaustive sweep (Honolulu, tier99)", () => {
  const result = runCase(
    {
      city: "Honolulu, USA",
      kwhPerDay: 10,
      chemistry: "lfp",
      tier: "tier99",
    },
    ENVELOPE,
  );
  assert.ok(result.champion, "the champion must find a feasible system");
  assert.equal(
    result.regret,
    0,
    `champion regret ${result.regret}: champion ${result.champion.lifetimeCostUsd} vs control ${result.control.lifetimeCostUsd}`,
  );
  assert.ok(result.champion.meetsConstraint);
});

test("#346: a tier the envelope cannot serve reports no answer instead of a bad one", () => {
  // tier100 inside a 24 kWh bank envelope is not reachable for this load; the
  // contract is a null, never a system that misses its own constraint.
  const result = runCase(
    {
      city: "Honolulu, USA",
      kwhPerDay: 10,
      chemistry: "lfp",
      tier: "tier100",
    },
    { pvStep: 0.5, pvMax: 2, battStep: 1, battMax: 2 },
  );
  assert.equal(
    result.champion,
    undefined,
    "an unreachable tier must not return a system",
  );
  assert.match(result.note, /no feasible point/);
});

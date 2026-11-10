// Champion Audit #351 - the load-profile defaults.
//
// #351 describes the shipped default as block-started appliance spreading and
// worries that it inflates the evening peak. The shipped default is actually
// `flatProfile` (run.js:634), and `applianceProfile` has no production caller.
// These tests pin the facts the audit rests on, so the premise cannot drift
// back without this file failing:
//
//   1. `applianceProfile` is referenced by no production module - if it is
//      wired, the audit's "champion is flat" premise is void and this fails;
//   2. every spreading rule preserves daily energy exactly, so daily-Wh error
//      can never be the finding and any cost delta is shape and nothing else;
//   3. duty-cycle spreading really does flatten a duty item across 24 h;
//   4. the aggregate counts PERSONAS, not (persona x site x mode) rows, which
//      is what #351's >=25%-of-personas acceptance actually says;
//   5. the measured cost movement is signed in BOTH directions - the artifact
//      changes what the tool sells, but not in the one direction the issue
//      hypothesised.
//
// Run: node --test tests/champion-audit-loadShape.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { applianceProfile, flatProfile } from "../assets/js/sizing/engine.js";
import {
  dutyAwareProfile,
  energyError,
  maxHourWh,
  peakWindowWh,
  personaDailyWh,
  summarize,
} from "../scripts/champion-audit-loadShape.mjs";

const ITEMS = [
  {
    name: "fridge",
    watts: 100,
    hoursPerDay: 10,
    duty: true,
    count: 1,
    startHour: 0,
  },
  {
    name: "tv",
    watts: 100,
    hoursPerDay: 4,
    duty: false,
    count: 1,
    startHour: 19,
  },
];

test("#351: applianceProfile is not on the production path", () => {
  // Scan every module under assets/js except the two that define/export the
  // helpers. One hit means the champion premise changed and the audit must be
  // re-run, so this is a deliberate tripwire, not a style check.
  const root = "assets/js";
  const allow = new Set(["engine.js", "appliances.js"]);
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) {
        if (entry === "_pages_a11y" || entry.startsWith("_pages")) continue;
        walk(p);
        continue;
      }
      if (!entry.endsWith(".js") || allow.has(entry)) continue;
      const src = readFileSync(p, "utf8");
      if (src.includes("applianceProfile")) offenders.push(p);
    }
  };
  walk(root);
  assert.deepEqual(
    offenders,
    [],
    `applianceProfile became a production caller: ${offenders.join(", ")}. ` +
      "#351's premise (block-start is the shipped default) is now wrong and " +
      "the audit must be re-measured before any of its conclusions are used.",
  );
});

test("#351: every spreading rule preserves daily energy exactly", () => {
  const dailyWh = personaDailyWh(ITEMS);
  const flat = flatProfile(dailyWh / 1000);
  const block = applianceProfile(ITEMS);
  const duty = dutyAwareProfile(ITEMS);
  // Exact in principle; float round-trip through the kWh->Wh unit change is
  // ~1e-16, so the pin is "no energy is created or destroyed", not bitwise 0.
  for (const [name, p] of Object.entries({ flat, block, duty })) {
    assert.ok(energyError(p, dailyWh) < 1e-12, `${name} lost energy`);
  }
});

test("#351: duty spreading flattens a duty item across all 24 hours", () => {
  const dutyOnly = [
    {
      name: "fridge",
      watts: 120,
      hoursPerDay: 12,
      duty: true,
      count: 1,
      startHour: 3,
    },
  ];
  const p = dutyAwareProfile(dutyOnly);
  const expected = (120 * 12) / 24; // 60 Wh in every hour
  for (let h = 0; h < 24; h++) assert.equal(p[h], expected);
  // The shipped block-start rule concentrates the same energy into 12 hours.
  const block = applianceProfile(dutyOnly);
  assert.equal(block[3], 120);
  assert.equal(block[15], 0);
});

test("#351: the flat champion puts exactly its share into the peak window", () => {
  const dailyWh = 2400;
  const flat = flatProfile(dailyWh / 1000);
  // 16..21 is five hours of a 24 h even spread.
  assert.equal(peakWindowWh(flat), (dailyWh / 24) * 5);
  assert.equal(maxHourWh(flat), dailyWh / 24);
});

test("#351: the aggregate counts personas, not configurations", () => {
  const row = (persona, delta) => ({
    persona,
    deltaVsChampion: { blockStart: delta, dutyAware: delta },
    energyError: { blockStart: 0, dutyAware: 0 },
  });
  // Two personas x two configurations. Only persona A ever shifts by >=2%,
  // so the share is 1/2 - not 2/4 by luck, and not 1/4 by splitting A across
  // its two rows.
  const rows = [row("A", 0.05), row("A", 0.03), row("B", 0.0), row("B", 0.001)];
  const s = summarize(rows);
  assert.equal(s.blockStart.personas, 2);
  assert.equal(s.blockStart.personasShifted, 1);
  assert.equal(s.blockStart.share, 0.5);
  assert.equal(s.blockStart.qualifies, true);
});

test("#351: cost movement is signed both ways, so no single direction is claimed", () => {
  const row = (persona, delta) => ({
    persona,
    deltaVsChampion: { blockStart: delta, dutyAware: delta },
    energyError: { blockStart: 0, dutyAware: 0 },
  });
  const s = summarize([row("A", -0.19), row("B", 0.29), row("C", 0.0)]);
  assert.equal(s.blockStart.minDelta, -0.19);
  assert.equal(s.blockStart.maxDelta, 0.29);
  // Mean is small while the spread is large: the aggregate must never be read
  // as "shape makes systems cheaper".
  assert.ok(Math.abs(s.blockStart.meanDelta) < 0.05);
});

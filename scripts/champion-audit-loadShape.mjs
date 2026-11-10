// Champion Audit #351 - the load-profile defaults.
//
// WHAT #351 ASSUMED. That the shipped default block-starts every appliance at
// its `startHour`, concentrating duty-cycle load into one hour and inflating
// the evening peak. That assumption is false in a way that changes the whole
// audit, so this harness measures the shipped reality instead:
//
//   `applianceProfile` (block-start spreading) has ZERO production callers.
//   Its only references are its own definition, `tests/engine.test.mjs` and
//   `tests/polish-pass1.test.mjs`. The appliance picker in ui.js sums the
//   selection to a single `kwh` figure, and the worker sizes against
//   `run.js:634  loadWh = expandProfile(flatProfile(dailyKwh), ...)`.
//
// So the CHAMPION every visitor is actually sized against is the FLAT profile -
// a uniform kWh/24 spread, which is the estimator #351 separately worries
// "erases the peak entirely". This harness therefore measures three spreading
// rules on the same persona energy:
//
//   flat        the shipped default (champion)
//   blockStart  `applianceProfile`, block-started per item - the dead code
//               #351 describes as current
//   dutyAware   duty-cycle items spread uniformly across 24 h (energy
//               preserved), non-duty items block-started - the comparator
//               #351 names
//
// Every rule preserves daily energy by construction, so daily-Wh error is zero
// for all three and cannot be the finding. What can differ is the hourly
// shape, and through it the sized system: peak-window Wh, the hourly maximum,
// and the downstream lifetime cost of the system the tool would sell.
//
// Run: node scripts/champion-audit-loadShape.mjs
// Out: docs/lane/data-reads/2026-11-10-champion-audit-loadShape.json

import { writeFileSync } from "node:fs";

import {
  applianceProfile,
  expandProfile,
  flatProfile,
  sizeForBillCut,
  sizeForTier,
  simulateOffset,
} from "../assets/js/sizing/engine.js";
import { capacityScaleFor } from "../assets/js/sizing/chem-model.js";
import { PEAK_HOUR_START, PEAK_HOUR_END } from "../assets/js/sizing/engine.js";

import { buildSite } from "./champion-audit-sizeForBillCut.mjs";

// Acceptance, verbatim from #351.
const COST_DELTA_REQUIRED = 0.02; // >=2% sized-system lifetime cost change
const PERSONA_SHARE_REQUIRED = 0.25; // on >=25% of personas
const ENERGY_MATCH_REQUIRED = 0.05; // and duty-cycle energy within 5%

const DAY_HOURS = 24;

/**
 * Catalog lookup by name, so watts/hours/maxH are the shipped figures rather
 * than re-typed ones. A persona that names an item the catalog does not carry
 * must fail loudly instead of silently sizing a different load.
 */
import { APPLIANCES } from "../assets/js/sizing/appliances.js";

const CATALOG = new Map(
  APPLIANCES.flatMap((g) => g.items).map((it) => [it.n, it]),
);

function item(name, { count = 1, startHour }) {
  const src = CATALOG.get(name);
  if (!src) throw new Error(`persona names an item the catalog lacks: ${name}`);
  return {
    name,
    watts: src.w,
    hoursPerDay: src.h,
    maxH: src.maxH ?? 24,
    duty: Boolean(src.duty),
    count,
    startHour,
  };
}

// ── The persona corpus ─────────────────────────────────────────────────────
// Eight household shapes spanning the catalog's groups. Start hours are the
// plausible ones a picker would carry; a fridge runs from 0, an AC from
// mid-afternoon, evening loads from 18-19.

const PERSONAS = [
  {
    id: "cabin-basics",
    label: "Off-grid cabin, basics only",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("LED light bulb", { count: 4, startHour: 18 }),
      item("Internet router (always on)", { startHour: 0 }),
      item("Laptop or desktop computer", { startHour: 9 }),
      item("Phone charger", { count: 2, startHour: 20 }),
    ],
  },
  {
    id: "family-ac",
    label: "Family home with one split AC",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("Split air conditioner (whole floor)", { startHour: 13 }),
      item("LED light bulb", { count: 6, startHour: 18 }),
      item("LED TV", { startHour: 19 }),
      item("Laptop or desktop computer", { startHour: 9 }),
      item("Internet router (always on)", { startHour: 0 }),
      item("Washing machine", { startHour: 10 }),
    ],
  },
  {
    id: "hot-climate-windows",
    label: "Hot climate, two window units",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("Window air conditioner (one room)", { count: 2, startHour: 13 }),
      item("LED light bulb", { count: 4, startHour: 18 }),
      item("LED TV", { startHour: 19 }),
      item("Internet router (always on)", { startHour: 0 }),
    ],
  },
  {
    id: "cold-climate-heatpump",
    label: "Cold climate, mini-split heat pump",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("Mini-split heat pump (heating mode)", { startHour: 6 }),
      item("LED light bulb", { count: 5, startHour: 17 }),
      item("LED TV", { startHour: 19 }),
      item("Laptop or desktop computer", { startHour: 9 }),
      item("Internet router (always on)", { startHour: 0 }),
    ],
  },
  {
    id: "remote-work",
    label: "Remote worker on satellite internet",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("Starlink / Satellite Internet", { startHour: 0 }),
      item("Laptop or desktop computer", { count: 2, startHour: 9 }),
      item("LED light bulb", { count: 4, startHour: 18 }),
      item("Coffee maker", { startHour: 7 }),
      item("Internet router (always on)", { startHour: 0 }),
    ],
  },
  {
    id: "kitchen-heavy",
    label: "All-electric kitchen",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("Induction cooktop (1 burner)", { count: 2, startHour: 18 }),
      item("Electric kettle", { startHour: 7 }),
      item("Microwave", { startHour: 12 }),
      item("Rice cooker", { startHour: 17 }),
      item("LED light bulb", { count: 4, startHour: 18 }),
      item("LED TV", { startHour: 19 }),
    ],
  },
  {
    id: "homestead-water",
    label: "Homestead with well and pressure pump",
    items: [
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("Deep well pump (submersible, 240V)", { startHour: 5 }),
      item("Water pump (shallow/pressure tank 120V)", { startHour: 6 }),
      item("LED light bulb", { count: 4, startHour: 18 }),
      item("Internet router (always on)", { startHour: 0 }),
      item("LED TV", { startHour: 19 }),
    ],
  },
  {
    id: "ev-and-pool",
    label: "EV trickle charge plus pool pump",
    items: [
      item("EV charger (Level 1 trickle, 120V 12A)", { startHour: 22 }),
      item("Pool pump", { startHour: 10 }),
      item("Refrigerator (modern, mid-size)", { startHour: 0 }),
      item("LED light bulb", { count: 6, startHour: 18 }),
      item("LED TV", { startHour: 19 }),
      item("Laptop or desktop computer", { startHour: 9 }),
      item("Internet router (always on)", { startHour: 0 }),
    ],
  },
];

// Two climates, because a peak-shaped load matters most where the array is
// least able to carry it: one high-yield site and one low-yield site.
const SITES = ["Nairobi, Kenya", "London, UK"];

// ── The three spreading rules ──────────────────────────────────────────────

/** Energy a persona consumes per day, the quantity every rule must preserve. */
export function personaDailyWh(items) {
  return items.reduce((a, it) => a + it.watts * it.count * it.hoursPerDay, 0);
}

/**
 * Duty-cycle-aware spreading: a compressor/generator item runs at part load
 * around the clock, so its energy is spread evenly across all 24 h at reduced
 * wattage. Non-duty items keep their block start, because that is how people
 * actually use a kettle or a TV.
 */
export function dutyAwareProfile(items) {
  const day = new Float64Array(DAY_HOURS);
  for (const it of items) {
    if (!(it.hoursPerDay > 0)) continue;
    const wh = it.watts * it.count * it.hoursPerDay;
    if (it.duty) {
      for (let h = 0; h < DAY_HOURS; h++) day[h] += wh / DAY_HOURS;
      continue;
    }
    const whole = Math.floor(it.hoursPerDay);
    const frac = it.hoursPerDay - whole;
    const n = whole + (frac > 0 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const h = (((Math.round(it.startHour) + k) % 24) + 24) % 24;
      const share = k < whole ? 1 : frac;
      day[h] += (wh * share) / it.hoursPerDay;
    }
  }
  return day;
}

export function peakWindowWh(profile24) {
  let sum = 0;
  for (let h = PEAK_HOUR_START; h < PEAK_HOUR_END; h++) sum += profile24[h];
  return sum;
}

export function maxHourWh(profile24) {
  let m = 0;
  for (let h = 0; h < DAY_HOURS; h++) if (profile24[h] > m) m = profile24[h];
  return m;
}

function totalWh(profile24) {
  let s = 0;
  for (let h = 0; h < DAY_HOURS; h++) s += profile24[h];
  return s;
}

/** Relative energy error of one rule against the persona's own arithmetic. */
export function energyError(profile24, dailyWh) {
  if (!(dailyWh > 0)) return 0;
  return Math.abs(totalWh(profile24) - dailyWh) / dailyWh;
}

// ── Downstream sized cost ──────────────────────────────────────────────────

/**
 * Size the persona's load on a real site and return the lifetime cost of the
 * system the tool would sell. `mode` selects the shipped search: "offgrid"
 * (tier99, the default auto tier) or "billcut" (an 80% cut, import-only).
 */
export function sizedCost({ siteCity, profile24, mode = "offgrid" }) {
  const dailyWh = totalWh(profile24);
  const site = buildSite(siteCity, dailyWh / 1000);
  const hours = site.e1kw.length;
  const loadWh = expandProfile(profile24, hours);
  const capacityScale = capacityScaleFor("lfp", site.meanTempC);
  const common = {
    e1kw: site.e1kw,
    loadWh,
    tempsC: site.tempsC,
    chemistry: "lfp",
    years: 20,
    costPerWpv: site.costPerWpv,
    costPerKwhBatt: site.battPerKwh("lfp"),
    costPerKwInv: site.costPerKwInv,
    pvMax: 30,
    battMax: mode === "offgrid" ? 300 : 150,
    pvStep: 0.5,
    battStep: 1,
    capacityScale,
    laborPerKwh: site.laborPerKwh,
    invMinKw: 0,
    simulate: simulateOffset,
  };
  const best =
    mode === "offgrid"
      ? sizeForTier({ ...common, maxUnmetHoursPerYear: 87.6 })
      : sizeForBillCut({ ...common, minFraction: 0.8 });
  if (!best) return null;
  return {
    pvKw: best.pvKw,
    battKwh: best.battKwh,
    cost: +best.obj.toFixed(2),
  };
}

// ── Measurement ────────────────────────────────────────────────────────────

export function runPersona(persona, siteCity, mode) {
  const dailyWh = personaDailyWh(persona.items);
  const kwhPerDay = dailyWh / 1000;
  const flat = flatProfile(kwhPerDay);
  const block = applianceProfile(persona.items);
  const duty = dutyAwareProfile(persona.items);

  const rules = { flat, blockStart: block, dutyAware: duty };
  const costs = {};
  for (const [name, profile24] of Object.entries(rules)) {
    costs[name] = sizedCost({ siteCity, profile24, mode });
  }

  const champion = costs.flat;
  const deltas = {};
  for (const name of ["blockStart", "dutyAware"]) {
    if (!champion || !costs[name]) {
      deltas[name] = null;
      continue;
    }
    deltas[name] = +(
      (costs[name].cost - champion.cost) /
      champion.cost
    ).toFixed(6);
  }

  return {
    personal: `${persona.id} @ ${siteCity} (${mode})`,
    persona: persona.id,
    site: siteCity,
    mode,
    dailyWh: +dailyWh.toFixed(1),
    peakWindowWh: {
      flat: +peakWindowWh(flat).toFixed(1),
      blockStart: +peakWindowWh(block).toFixed(1),
      dutyAware: +peakWindowWh(duty).toFixed(1),
    },
    maxHourWh: {
      flat: +maxHourWh(flat).toFixed(1),
      blockStart: +maxHourWh(block).toFixed(1),
      dutyAware: +maxHourWh(duty).toFixed(1),
    },
    energyError: {
      flat: +energyError(flat, dailyWh).toFixed(6),
      blockStart: +energyError(block, dailyWh).toFixed(6),
      dutyAware: +energyError(duty, dailyWh).toFixed(6),
    },
    cost: costs,
    deltaVsChampion: deltas,
  };
}

/**
 * #351's acceptance, applied as written: a new spreading rule ships only if it
 * changes sized-system lifetime cost by >=2% on >=25% of personas AND matches
 * duty-cycle energy within 5%. Rows are grouped per rule so a rule that only
 * moves one climate cannot borrow the other's cases.
 */
export function summarize(rows) {
  const byRule = (rule) => {
    const usable = rows.filter(
      (r) =>
        r.deltaVsChampion[rule] !== null &&
        r.deltaVsChampion[rule] !== undefined,
    );
    // #351 says "on >=25% of PERSONAS", not of (persona x site x mode) rows.
    // A persona counts once, and counts as shifted if the rule moves its sized
    // cost by the margin in ANY of its configurations - the artifact is a
    // property of the household shape, not of one climate or one mode.
    const personas = new Map();
    for (const r of usable) {
      const prev = personas.get(r.persona) ?? { shifted: false, deltas: [] };
      prev.deltas.push(r.deltaVsChampion[rule]);
      if (Math.abs(r.deltaVsChampion[rule]) >= COST_DELTA_REQUIRED) {
        prev.shifted = true;
      }
      personas.set(r.persona, prev);
    }
    const shifted = [...personas.values()].filter((p) => p.shifted).length;
    const allDeltas = usable.map((r) => r.deltaVsChampion[rule]);
    const worstEnergy = usable.reduce(
      (m, r) => Math.max(m, r.energyError[rule]),
      0,
    );
    return {
      cases: usable.length,
      personas: personas.size,
      personasShifted: shifted,
      share: personas.size ? +(shifted / personas.size).toFixed(4) : 0,
      meanDelta: allDeltas.length
        ? +(allDeltas.reduce((a, b) => a + b, 0) / allDeltas.length).toFixed(6)
        : 0,
      minDelta: allDeltas.length ? +Math.min(...allDeltas).toFixed(6) : 0,
      maxDelta: allDeltas.length ? +Math.max(...allDeltas).toFixed(6) : 0,
      maxEnergyError: +worstEnergy.toFixed(6),
      qualifies:
        personas.size > 0 &&
        shifted / personas.size >= PERSONA_SHARE_REQUIRED &&
        worstEnergy <= ENERGY_MATCH_REQUIRED,
    };
  };
  return { blockStart: byRule("blockStart"), dutyAware: byRule("dutyAware") };
}

function main() {
  const rows = [];
  for (const persona of PERSONAS) {
    for (const siteCity of SITES) {
      for (const mode of ["offgrid", "billcut"]) {
        const started = Date.now();
        const row = runPersona(persona, siteCity, mode);
        row.ms = Date.now() - started;
        rows.push(row);
        console.log(
          `${row.persona} @ ${siteCity} ${mode}: daily ${row.dailyWh} Wh | ` +
            `peakwin flat ${row.peakWindowWh.flat} block ${row.peakWindowWh.blockStart} duty ${row.peakWindowWh.dutyAware} | ` +
            `cost flat $${row.cost.flat?.cost} block $${row.cost.blockStart?.cost} (${row.deltaVsChampion.blockStart}) ` +
            `duty $${row.cost.dutyAware?.cost} (${row.deltaVsChampion.dutyAware}) [${row.ms} ms]`,
        );
      }
    }
  }

  const summary = summarize(rows);
  const out = {
    issue: 351,
    generated: new Date().toISOString(),
    head: process.env.GITHUB_SHA ?? null,
    acceptance: {
      COST_DELTA_REQUIRED,
      PERSONA_SHARE_REQUIRED,
      ENERGY_MATCH_REQUIRED,
    },
    shippedDefault: "flat",
    summary,
    rows,
  };
  const path = "docs/lane/data-reads/2026-11-10-champion-audit-loadShape.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log("\nSUMMARY", JSON.stringify(summary, null, 2));
  console.log("wrote", path);
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("champion-audit-loadShape.mjs")
) {
  main();
}

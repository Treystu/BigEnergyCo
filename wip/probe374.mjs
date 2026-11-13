import { sizeForBillCut, simulateOffset, billCutFraction } from "../assets/js/sizing/engine.js";
import { buildSite, lifetimeObjective } from "../scripts/champion-audit-sizeForBillCut.mjs";

const site = buildSite("Nairobi, Kenya", 5);
const loadTotal = [...site.loadWh].reduce((a, b) => a + b, 0);
const common = {
  e1kw: site.e1kw, loadWh: site.loadWh, tempsC: site.tempsC, chemistry: "lfp",
  minFraction: 1.2, tariff: 0.2, exportRate: 0, years: 1,
  costPerWpv: site.costPerWpv, costPerKwhBatt: site.battPerKwh("lfp"),
  costPerKwInv: site.costPerKwInv, pvMax: 60, battMax: 150, battStep: 1,
  laborPerKwh: site.laborPerKwh, invMinKw: 0, simulate: simulateOffset,
};
const champ = sizeForBillCut({ ...common, oversizeStrategy: false });
console.log("champion:", champ.pvKw, champ.battKwh, champ.obj?.toFixed(2));

const budget = loadTotal * 0.005;
const floor = loadTotal * 0.2;
const meets = (r) => r.importedWh <= budget + 1e-6 && r.curtailedWh >= floor - 1e-6;
const at = (p, b) => simulateOffset({ pvKw: p, battKwhUsable: b, e1kw: site.e1kw, loadWh: site.loadWh, chemistry: "lfp", tempsC: site.tempsC });

const show = (p, b) => {
  const r = at(p, b);
  const cost = lifetimeObjective(site, "lfp", p, b, r.cyclesEquivalent);
  console.log(`p=${p} b=${b} meets=${meets(r)} imp=${r.importedWh.toFixed(0)}/${budget.toFixed(0)} curt=${r.curtailedWh.toFixed(0)}/${floor.toFixed(0)} cost=${cost.toFixed(2)}`);
};
show(1.45, 4); show(1.55, 7);

// row scan at b=7: where does row 7's smallest feasible PV land?
let firstFeasible = null;
for (let p = 0.05; p <= 60; p += 0.25) { const r = at(+p.toFixed(2), 7); if (meets(r)) { firstFeasible = +p.toFixed(2); break; } }
console.log("row b=7 first feasible p:", firstFeasible);
if (firstFeasible !== null) show(firstFeasible, 7);
// how many feasible points at b=7 and cheapest
let bestCost = Infinity, bestP = null, feas = 0;
for (let p = 0.05; p <= 60; p += 0.25) { const pp = +p.toFixed(2); const r = at(pp, 7); if (!meets(r)) continue; feas++; const c = lifetimeObjective(site, "lfp", pp, 7, r.cyclesEquivalent); if (c < bestCost) { bestCost = c; bestP = pp; } }
console.log("b=7 feasible grid points:", feas, "cheapest p:", bestP, "cost:", bestCost.toFixed(2));

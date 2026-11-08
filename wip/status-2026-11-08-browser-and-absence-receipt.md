# Lane evidence receipt — 2026-11-08

Read time: 2026-11-08 08:32 UTC. Local checkout was `lane/finish` at `7310c2df4932c0fdba361a8083672ec512eff796`, clean and equal to `origin/lane/finish` before this work.

## V4 / E13 — rendered first-timer drive

Built the local allowlisted output with `node scripts/deploy-pages-local.mjs --check --stage _pages_smoke`, served that generated output on loopback, and drove it in the Preview browser. This is local preview evidence, not a deployment or production read.

Input: Honolulu, Hawaii, USA; the app reported 19.93 kWh/day and a rough $267/month bill. The run completed using five years of hourly data (2021–2025), reporting 1,803 kWh/year per kW of panel.

Visible result quotes:

- Result headline: “76% of your bill removed over 20 years.”
- Result orientation: “Three views of one result: Best pick is the system we would build, Compare batteries puts the chemistries side by side, All options is the full table.”
- Best pick: LFP, 3.8 kW solar + 10 kWh usable battery (~12.5 kWh nameplate); first cost $1,534–$5,396; total 20-year cost ~$5,727.
- Nearby summary badge: “−81% bill cut.” This differs from the 76% result headline and is recorded as a comprehension discrepancy, not reconciled here.
- Cost explanation: “What the two costs include: the first cost buys hardware and install once; the 20-year figure also pays replacements, fuel and upkeep.”
- Clicking “Compare batteries” opened the chemistry comparison cards. Clicking “All options” opened the capacity spectrum. In that view, the current-selection row visibly contained “Baseline kW” and “Baseline kWh” placeholders. This is another comprehension defect surfaced by the drive.

Browser log read: no console messages. The display is a single local run, not a claim of general performance or correctness. E13 remains open for the two observed copy/placeholder discrepancies and any remaining first-timer review.

## Lucas Gate receipt blocker

No Lucas Gate v2 score is claimed. The available `mcp__harness__lucas_gate_v2` tool requires typed `category_scores` and bias-check scores. Repository guidance names Lucas Gate v2 but supplies no canonical category mapping or scoring rubric for this receipt; searches under `docs/lane` and `docs/plan` found no applicable instrument. Supplying scores without that mapping would be invented. Accordingly, no gated PR/issue comment or disposition was posted.

## Next approved item — issue #359 absence verification

Issue #359 explicitly accepts a no-change result when absence is confirmed. The local source scan used the patterns `lead form/score/gen`, `professional directory`, `pro routing`, and `verified pro`:

- `assets/js` plus `worker/`: zero matches (278 and 11 source files respectively).
- HTML files, excluding generated `_pages_smoke/`: zero matches.
- Positive control: the generic “licensed professional” disclaimer remains in `index.html` (three occurrences), consistent with the free educational tool and not a routing mechanism.

This is a fresh local absence measurement, not an issue closure. #359 remains open pending an honestly gated disposition. Preserve #342 and the A-04/A-11 owner-reserved blockers. No billing-locked CI rerun, deployment, production change, or promotion was performed.

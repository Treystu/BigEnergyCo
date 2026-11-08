# V4 / E13 comprehension increment — the two numbers a first-timer could not reconcile

Read time: 2026-11-08 ~10:30 UTC. Checkout `lane/finish`, clean and equal to
`origin/lane/finish` at `81fe8692` before this work. Commits added:
`acb662ad` (the fix) and `a1e94e86` (removing the scratch probe the first
commit swept in). Pushed head `a1e94e86`.

## Defect 1 — one card quoted 81% and 76% for the same claim

Reproduced in the browser on the staged local build (Honolulu, Hawaii, USA;
bill $267/mo → 19.93 kWh/day; tariff 0.44; quick setup; target 80%; the URL
state carried `rp=0.2`):

- system chip: `⚡ −81% bill cut`
- outcome card: `76% of your bill removed over 20 years`

Cause, measured rather than inferred: the chip's number is
`gridtieCutPct(sizing)` — the system with its whole bank available, which is
the figure the sizing search solved for. The outcome card re-simulates the
same system with the visitor's 20% reserve held back (`measureUseCase` calls
`gridSim(reserve)` where `reserve = ctx.reservePct`). Neither label said which
basis it quoted, so the card read as its own contradiction.

Fix: copy only, no physics. The chip's small label now says
`bill cut, no reserve held` whenever a reserve is held; the outcome metric
label gains `metricBillCutReserve` — "of your bill removed over 20 years, with
{pct}% of the battery kept in reserve" — selected in `outcomeFor` when the
bill-cut measurement carries `reservePct > 0`, translated in all seven locales
(`{pct}` interpolated by the same `translate()` the markup pass uses).

Rendered verification at stamp `20261108d`:

```
⚡ | −81% | bill cut, no reserve held
Your result: 76% | of your bill removed over 20 years, with 20% of the battery kept in reserve
```

**Named, not resolved:** the sizing search sizes to the target with the full
bank, while the measurement (and therefore the verdict) holds the reserve, so
the same run can honestly report "gets most of the way there" against a target
the chip appears to beat. Bringing those two policies together changes every
grid-tie system and price; that is an owner-visible sizing decision, not an
E13 copy change, so it is recorded here as the next open question rather than
landed unilaterally.

## Defect 2 — "Baseline kW" / "Baseline kWh" placeholders

`renderRelativeOptions`'s delta helper returned the bare word `Baseline` for a
zero delta, and every row appended its own unit, so the current-selection card
read `3.8 kW (Baseline kW)` and `10 kWh (Baseline kWh)`. The helper
(`deltaSuffix`) now returns nothing at zero and carries the unit itself. It
also takes a decimal precision, because the autonomy row's whole-unit
threshold had been silently reading a real difference as none.

Rendered verification (All options, same run):

```
Compact:  Autonomy ~0.3 days (−0.2 d)
Lean:     Autonomy ~0.4 days (−0.1 d)
Baseline: Autonomy ~0.5 days            <- no placeholder
High:     Autonomy ~0.7 days (+0.2 d)
Max:      Autonomy ~0.9 days (+0.4 d)
```

## Checks run at `a1e94e86`

| Check                                   | Result                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm test`                              | 2100/2105; the 5 failures are the value-moment copy pins, identical on a pristine `git archive HEAD` checkout, so they are pre-existing lane reds, not this change |
| `node scripts/check-i18n.mjs`           | I18N OK — 549 keys across 7 locales, placeholder parity, unkeyed prose still 376/485         |
| `node scripts/check-format.mjs`         | OK, 1149 tracked files                                                                        |
| `node scripts/check-chars.mjs`          | OK, stamps `20261108d` across graph and page                                                  |
| `node scripts/bump-asset-tokens.mjs --check` | OK after the commit (61 referenced assets verified against the stamp commit)              |
| `node scripts/check-byte-budgets.mjs`   | `js_to_first_result` 202.8 → 203.5 KB, over its 200.0 KB limit: reported, non-blocking per P6/P8 |
| Browser drive (local stage, loopback)   | Both defects verified fixed in the rendered page; no console messages                         |

No deployment, production change, promotion, credential change, or
billing-locked CI rerun was attempted.

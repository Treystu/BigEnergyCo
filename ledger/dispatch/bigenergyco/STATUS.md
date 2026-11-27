# STATUS — BigEnergyCo FreeBuff desktop lane

Mission: BIGENERGYCO FULL BURNDOWN (2026-11-20). Mechanics: repo `AGENTS.md`
LANE PROTOCOL. This file is the lane's own status record; the tracker #145
carries the mirrored landing records.

## Stand-up acknowledgements

- FED-UNIFICATION-2026-11-15-1 (this lane's entry D-2026-11-13-017): ACKED. The
  GitHub record outranks any carrier summary; the census below is re-derived from
  GitHub on every landing rather than carried forward.
- FED-CURE-2026-11-15-1: ACKED.

Filing rule in force: no new issue or dispatch ships until its scope is checked
against the open set for a second home. Follow-ups are attached to the owning
open item, not filed again.

## Stand-up block — 2026-11-22 (owner order: simplified interface, staging-first)

Filed with the ack on #429 (comment on issue #429, 2026-11-22). Two-method
census: `git rev-parse origin/main` plus `gh pr list` / `gh issue list`, and the
rendered surface read on the local static server.

- Main head `92dbb120`; open issues 30; open lane PRs 0; dependabot #455 the only
  other open PR.
- Readiness line: presentation spec landed and binding, intake fork-free and
  location-led, a driven run reaches rendered results. NOT promoted.
- ACTIVE BUILD TARGET (owner order 2026-11-22): the stripped interface, three
  screens — HOME (one headline, one place field, one action), CALCULATOR (Where /
  Goal / Monthly bill, one action, no modes), PLAN (one price, three stats, a
  three-line breakdown summing to the price, one number set). Staging-first:
  land to main -> bigenergyco.pages.dev, NO promotion under this order.
  `#403` is the results leg; `#432`/`#437`/`#439` remaining scope discharges
  inside this build's verification.
- Verification owed on #429: blog census, SEO census, five-figure extraction at
  phone width. Report STAGING-VERIFIED there.

## Census — 2026-11-22 (read: gh issue/pr list + pipeline API, this session)

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| Main head      | `038d7fd9` (PR #462 merged)                                |
| Open issues    | 30                                                         |
| Open lane PRs  | 0                                                          |
| Other open PRs | 1 — dependabot #455, not lane work                         |
| Asset stamp    | `20261122d`, SW `beco-v276`                                |
| Rail evidence  | CircleCI pipeline API, workflow `verify` at the exact head |

Queue state, in the mission's order: LIVE DEFECTS closed (#443/#444/#442/#447 all
landed). Wave 0 (#436 presentation spec) landed `8ffc1440`. Wave 1: #441 landed
`d8bc5a23`; #430 landed `7551fe52`; #440's inference core landed `038d7fd9` and
its rounds UI is the open remainder; **next is #440 items 3-5** (intake priors

- ladder), then #431 (applicability). #430 scope 2-3 (pre-rendered estimate at
  stated defaults, in-browser recalculation) were attached to #440 at filing time
  rather than given a second home.

## Landing record — 2026-11-22

- **STAGED INTERFACE (owner order) -> PR #464, squash `12f027da`.** Rail
  `verify: success` at `0acecf92` (pipeline `a9a2e2d4`, CircleCI, exact head).
  Deployed to the staging branch: `staging.bigenergyco.pages.dev`, stamp
  `20261122f`, SW `beco-v278`, 439 files. Receipts on #429 (comment
  `7085898649`): 96/96 sitemap URLs 200 (12 previously 404 now live), 26/26 blog
  pages content-identical, sitemap byte-identical with zero URL changes,
  index.html canonical/title/description/FAQPage unchanged pre/post, and the
  five-figure extraction at 390x844 (3.8 kW + 10 kWh; $7,182–$15,399;
  $14,822; $37,358; Year 5). PLAN card: $10,202 = $8,450 + $952 + $800 exactly.
  Origin drift (`bigenergyco.pages.dev` is the production-branch alias on
  `20261103u`; staging is the `staging` branch alias) recorded on #361. NO
  promotion; production untouched.
- #436 presentation spec -> PR #458, squash `8ffc1440`. Rail `verify:success` at
  `bd175a09`. Spec is binding for intake ordering and hierarchy.
- #441 mode-fork removal -> PR #459, squash `d8bc5a23`. Rail `verify:success` at
  `908e537b`. Rendered census: 0 mode controls, no `data-display-mode`, every
  demoted panel display-visible behind the disclosures.
- #461 lane STATUS + census -> squash `f9023602`. Rail `verify:success` at
  `f538ad22`.
- #444 re-verification (row was already CLOSED via #456 `ff18a5b3`): options
  intact and a load-mode pick commits through the event path on `f9023602`.
- #440 items 1-2 prior model + fixture suite -> PR #462, squash `038d7fd9`. Rail
  `verify:success` at `5cff16de`. #440 stays open for items 3-5.
- #430 location-first intake -> PR #460, squash `7551fe52`. Rail `verify:success`
  at `7717fac6`; #430 CLOSED. Rendered census on the merge candidate:
  `#citySearch` 1204 < goal 1380 < `#billSliderWrap` 1465 < `#fullControls` 1611 <
  `#btnRunSizing` 3260 (document offsets at 1280x900); the purpose line renders;
  a real suggestion-click run to results completes with the plain card leading and
  0 competing primaries.

- #403 results leg + #432/#437/#439 residue on the stripped surface -> PR #468,
  squash `86d029be`. Rail `verify:success` at `8859598a` (CircleCI workflow API).
  Local battery before push: `npm test` 2358/2358 (was 2351; +7 in
  `tests/results-disclosure.test.mjs`), `check-chars`, `seo`, `format:check`,
  `deploy:check`. Staging deploy `cc6235c3` on the `staging` branch alias, stamp
  `20261124b`, SW `beco-v282`. Rendered at 390x844: plan `$10,202.00` =
  `$8,450.00` + `$952.00` + `$800.00`; stats `$37,358.00` / `Year 5` / `81%`;
  one cost table on the surface and ONE disclosure (closed on arrival, 15 blocks
  inside, view tabs inside it); #439 support path beside the actions in all seven
  locales; `scrollWidth - 390 = -11`. `index.html` normalized 131,985 bytes
  against the unchanged 132,000 budget.
- Censuses vs the `20261122f` baseline on staging: 96/96 sitemap URLs 200;
  sitemap sha `12717cc9eeba47cf` identical (zero URL changes); SEO face 96/96
  unchanged; blog+about content 27/27 byte-identical after normalising the
  injected suggestion chrome and the `?v=` stamp.
- ~$3,100 anchor row -> GATE-PARKED DECISION-READY on #401 (receipt attached):
  `LABOUR_MODEL` is grade C and states no in-repo source measured installed
  hours; the only priced route is the four-ways set at $10,202, which sums. The
  plan keeps that one number set.
- #437 rendered locale census on staging (ES, 390x844) -> 22 visible English
  strings enumerated on #437 with cause narrowed to the runtime paint path
  (keys exist in all seven locales). NOT claimed closed; next pass owns the
  painters, the static FAQ/modal headings and a census gate.

- #437 locale chrome (cure + rendered census) -> PR #470, squash `c1704f6a`.
  Rail `verify:success` at `c277f8c3` (CircleCI workflow `3bd8db66`/
  `f45bf168`). Local before push: `npm test` 2366/2366, `check-i18n` 100% hook
  coverage in all seven locales, `seo`, `format:check`, `deploy:check`.
  Cured: the 22 censused strings (hooks in markup, `syncCutLabel()`,
  `updateLoadReadout()`, `renderFxStatus()` in `repaintRuntimeCopy()`), then 24
  more the broader census found (skip link, place hint, coordinate and off-grid
  labels, derate hint, hardware-mode options, the generator/offline/battery-safe/
  privacy FAQ headings, all eleven legal headings, the AI modal title), then the
  hardware-reference price note (`renderBom()` now paints `t(item.scopeKey)` and
  runs in the repaint list; `partsIndicativeNote` added). Dictionaries 781 -> 806
  keys; `index.html` normalized 131,996 of 132,000 (paid for by condensing ten
  head comments, every citation ID kept). The four footer-less localized posts
  (`deduccion-irpf-autoconsumo-2026`, `dotacja-magazyn-energii-2026`,
  `gia-dien-5-bac-2026`, `program-afm-baterii-2026`) now render the localized
  safety line and three links; `tests/locale-chrome.test.mjs` holds 8 gates.
  Staging deploy `31269307`, alias `staging.bigenergyco.pages.dev`, stamp
  `20261124g`, SW `beco-v287`. Rendered ES at 390x844 on a clean profile: every
  cured string Spanish, plan `$10,202.00` = `$8,450.00` + `$952.00` + `$800.00`,
  savings `$37,358.00` / `Year 5` / `81%`, disclosure present, #439 support path
  visible, `scrollWidth - 390 = -11`, and all four blog URLs serve their footer.
  Re-driven on the MERGED stamp (`c1704f6a` -> deploy `c8eff1bb`, stamp
  `20261124h`, SW `beco-v288`): the same ES checks pass unchanged — cured strings
  Spanish, plan `$10,202.00` summing from `$8,450.00` + `$952.00` + `$800.00`,
  `$37,358.00` / `Year 5` / `81%`, disclosure openable, support path visible,
  `scrollWidth - 390 = -12`, four blog footers serving. Sitemap census on the
  merged stamp: 96 URLs, unchanged set, `npm run seo` green; served sitemap sha
  `61cbf996c3a3f443` (the `20261122f` baseline file hashed
  `12717cc9eeba47cf` — same URL set, no rows added or dropped).
  NOT closed: the results-detail panel still paints English (`3.8 kW of panels`,
  `81% less grid energy`, `Your ~80% target`, the system-spec and BOS tables,
  `Install App`) — parked DECISION-READY on #437 as its own dispatch, because it
  is the chart/BOS spec surface, not the intake chrome this pass owned.
- `index.html` byte budget note: the eager budget is unchanged at 132,000 and the
  file is now 131,996 normalized; any further hook needs a comment compression in
  the same change.

## Landing record — 2026-11-24 (owner order: ALL THE OLD VISUALS BACK, JUST REFINED)

Filed with the STAGING-RESTORED receipt on #429 (comment 7143378184).

- **#437 detail-locale tail landed.** #473 merged as `d2e9744b`. The glossary
  explainers now cover all 25 terms in all six non-English locales (the last
  English group a rendered ES census found), the remaining `explainElement` call
  passes the page language, and `tests/locale-chrome.test.mjs` pins short+long on
  every term. Suite 2371/2371 at that head.
- **Results surface restored.** #474 merged as `7cd81663`; PR head `37217c77`,
  CircleCI `verify` `success` (workflow `3326e333`, pipeline revision read back as
  `37217c77`), suite 2373/2373 there and `npm run seo` green on merged main at
  stamp `20261124p`, SW `beco-v296`. #468's runtime fold and the stylesheet that
  hid `.results-demoted` are gone; `#pathsPanel`, `#resultsMore` and the frontier
  are back in their pre-#468 positions, so the readable card, both charts, the
  frontier and the cost comparison render with the disclosure closed.
- **One price basis (#401 / 7128520970).** `plan-card.js` now owns a parts
  identity: the headline is `costBuyableUsd`, its three lines are panels, battery
  and inverter from `buyablePrice().parts`, and the card renders nothing unless
  they sum to the headline. Payback is printed per named basket (parts list vs
  installed route); every entry in the payload carries `costBuyableParts`. The
  old installed-route plan keys were deleted, not left as dead copy
  (`check-i18n` names any key nothing renders).
- **Rendered staging census** (`https://bfd68431.bigenergyco.pages.dev`, 390x844):
  Fixture 1 ZIP 18255 off-grid 5 kWh/day — `$3,082.00` = `$1,016.00` +
  `$1,331.00` + `$735.00`, frontier SVG and both charts visible with
  `detailsOpen: false`, `scrollWidth - 390 = -11`. Fixture 2 ZIP 81082, 80% cut,
  $150/mo — `$7,114.00`=`$1,652.00` + `$4,150.00`+`$1,312.00`, bill cut `80%`,
paybacks `Year 6`(parts) /`Year 18`(installed), frontier and charts visible,`scrollWidth - 390 = -11`. `npm run seo` green: no blog/SEO URL change.
- **#437 remainder, two more landings on the restored surface.** #476
  (`dfbfa98f`) keyed the sun-path tilt value card — the one English string the
  restore exposed — in all seven locales, verified in ES on the rendered page as
  `Lo que un tejado plano pierde aquí — hacen falta ~12 paneles planos para
igualar 10 a ~33°`. #477 (`0bdd2805`) put the shared-result note in the
  language-change repaint list, because it is painted inside `restoreFromShare()`
  before the reader's language is applied; verified in ES as `Este es el
resultado que alguien compartió contigo…` on deploy `4f2e81b5` (390x844,
  `scrollWidth - 390 = -11`, plan still `$7,114.00` = `$1,652.00` + `$4,150.00` +
  `$1,312.00`).
- **ES census on the restored surface (filed on #429, comment 7144294205).** Eleven
  English groups remain on a Spanish page; one (the share-loaded line) is cured by
  #477, nine are untouched and are the next dispatch (`Starts from ~$149/mo…`, the
  tariff-estimate line, `90–100; 98 is typical`, `Ambient Temperature & Battery
Chemistry Limits`, the three chemistry sentences, `Your currency`), plus the
  stepper label `4. Your result`. Filed as the #437 remainder, not re-filed.
- **Correction to an earlier lane claim.** The `Size My System` first-click no-op I
  reported reproducing on staging was a preview-bridge artifact: an armed
  capture-phase listener recorded zero click events for the click the page never
  saw, while a programmatic click runs sizing normally. #442 stays open on its own
  evidence, not on that observation.
- NOT done: production untouched; #467's truthful-verdict cure unlanded.

## Landing record — 2026-11-25 (#437 remainder on the restored surface)

Three landings, all rail-green at their exact head (CircleCI `verify`, check-runs
read, never the combined status API), all staged only — production untouched:

- **#480, squash `2d6191ba`** (head `53c2467f`). Keyed the nine English groups the
  restored-surface ES census named. Five were dictionary copy whose painter never
  sat on the language-change repaint path — `quickBillStarts` (`paintQuickBillNote`),
  `tariffNote` (`repaintTariffNote`), the MPPT derate hint (`derateHintMpptTypical`,
  which had no hook at all), the FX label (`fxRateLabel`) and the guided-step label
  (`stepLocation`/`stepLoad`/`stepTariff` + `dStepResult`). Four were the chemistry
  temperature widget, which carried **no keys** and wrote every branch inline: 21
  `chemTemp*` keys cover its title, site-low label, legend, all three chemistry
  branches, the freezing/mild bullet sets and the compare title, and the widget
  keeps `chemTempLat` so a repaint does not re-derive the site.
- **#481, squash `42ad5906`** (head `aecb1ee5`). #480 called `repaintTariffNote()`
  but declared `paintTariffNote()`; the first repaint threw `ReferenceError` and
  aborted `initSizingUI` (caught by its `.catch`, so the page sat half-built and
  the widget kept raw keys). Caught on the rendered staging build, not by a gate.
  Renamed, and a new gate asserts every bare call in `repaintRuntimeCopy()` names a
  function `ui.js` defines — the class that missed it.
- **#482, squash `846afbfc`** (head `cf9fcc9c`). The muted `(optional)` span beside
  the currency label stayed English (`Tu moneda (optional):`); `fxRateOptional` now
  paints it in all seven locales.

**Rendered census on `https://924d7528.bigenergyco.pages.dev`** (390x844, stamp
`20261125c`, SW `beco-v301`; ES chosen first, then fixture 37.985/-103.543,
~~$150/mo, 80% cut): zero hits for all twelve censused English probes
(`Starts from`, `Electricity price estimated`, `is typical`, `Ambient Temperature`,
`provides the lowest`, `offers non-flammable`, `has low upfront cost`,
`Your currency`, `Your result`, `(optional)`, `Winter Freezing`, `Deep Freeze`).
In ES: `Empieza desde ~$147/mes (≈28 kWh/día)…`, `Precio estimado para US mainland
— cámbialo arriba si conoces tu tarifa. (~~ 0.17 US$/kWh)`, `90–100; 98 es lo
típico`, `Temperatura ambiente y límites de la química de la batería … Mínima del
sitio ~1°C … Comparación de climas con una mínima invernal de ~1°C: • LiFePO4
ofrece el coste vitalicio más bajo… • Sodium-Ion ofrece una química no inflamable…
• Lead-Acid tiene el coste inicial más bajo…`, `Tu moneda (opcional):`, and the
stepper reads `4. Tu resultado`. Results: plan `$6,632.00`=`$1,398.00` +
`$4,150.00`+`$1,084.00`, paybacks `Año 5`(parts) /`Año 16`(installed), bill
cut`80%`, frontier SVG present, both charts drawn (one canvas each),
`#resultsMore.open`false,`scrollWidth - 390 = -11`, console clean apart from the
known advisor CORS failure (#364) on the unique preview origin.

Residual, recorded not fixed: the tariff estimate still names its region box with
the English **data** label (`US mainland`). The 26 boxes in `pricing.js` carry
English geographic names; localizing them is its own dispatch, attached here.

## Landing record — 2026-11-25 (queue item 1: live defects closed out)

Census correction first: the queue's live-defect row named PR #453 and issues
#442/#444/#447, but GitHub says #442, #444 and #447 are all **CLOSED** and PR #453
is **MERGED** (`7d0ebfa0`). What was missing was not work on the issues but the
rendered verification and the rail read on #453. Both are now on record.

- **#453 rail read (the row's own ask).** Head `25b4043b`: CircleCI pipeline
  `798d1d20-9305-421f-a34a-cd1e485bc078`, workflow `verify` success
  2026-11-17T15:17:12Z → 15:23:34Z. The GitHub check-runs list on that head holds
  only the dead Actions jobs plus `jev-complete`, so the CircleCI workflow is the
  rail read and is stated as one.
- **#442 re-driven, and it exposed a live regression.** On staging `924d7528`, the
  issue's batched fill-and-click (off-grid, `19.39386, -154.93075`, kWh/day entry
  `1.2`) started the run on the first click — #454's cure holds — but the run
  sized **2 kWh/day**: `syncBillSlider()` on the 500 ms coordinate resolve wrote
  its bill-derived mirror back over `#dailyKwhInput` before the queued run read
  inputs. **#484 `5353f558`**: in the typed-kWh mode the entry owns the anchor,
  the touched-bill branch no longer overrides it, and the mirror skips the entry.
- **A second write site, found on the next build.** The bill slider's own drag
  handler wrote the same mirror unconditionally, so in the kWh/day mode the
  slider either clobbered the entry or (after #484) was snapped back as a dead
  control. **#485 `62b12f05`**: a drag on the bill control is a pick of the bill as
  the load source — it moves the selector through `commitLoadMode()` — and its
  mirror skips the entry. Gates added in `tests/offgrid-daily-kwh-source.test.mjs`
  (6 tests: the derivation, the guard, the single guarded write, the drag pick).
- **#444 re-verified on the rendered build.** `input`-only and `change`-only each
  commit the pick, reveal the advanced panel and keep `1.2`. No bill-panel
  regression. Evidence filed on #444 (comment 7162419595).
- **#447 residue verified.** Precision: fields `19.39386` / `-154.93075`, note
  `Using custom coordinates (19.39386, -154.93075).`, share state `la:19.39386,
lo:-154.93075`. Locality: the coordinate query reverse-geocodes to `Kehena,
Hawaii, USA`; the search box names it; no road name on the page. Evidence filed on
  #447 (comment 7162418956).

**Rendered re-drive, `https://db9b5c6e.bigenergyco.pages.dev`** (390x844, stamp
`20261125e`, SW `beco-v303`): off-grid, `19.39386, -154.93075`, entry `1.2`, one
batched click → results; entry still `1.2`; grid spend `about $184 per year`
(1.2 × 365 × $0.42); plan `$750`=`$169` + `$459`+`$122`; parts payback
`Year 4`; installed payback and cut row `—`(off-grid, legitimate); frontier SVG
present; both charts drawn (one canvas each);`#resultsMore.open`false;`scrollWidth − 390 = −11`; console clean apart from the known advisor CORS
failure (#364). Bill-slider drag in the kWh/day mode moves the pick to `bill`,
hides the kWh panel and mirrors `15.3 kWh/day`.

**Named follow-up, attached to #443 not re-filed:** the quick-bill helper line
still reads `Starts from ~$26/mo (≈1 kWh/day)` beside a `1.2` entry — the bill
slider's minimum floors the amount and the note rounds the load to a whole kWh.
Display copy only; the sizing input is now correct on every surface.

## Landing record — 2026-11-25 (Wave 0: the #436 presentation spec, V1.1)

Census correction, read live from GitHub this pass: **#436 CLOSED, #441 CLOSED,
#430 CLOSED**; #440 and #431 open; one open PR (#455, a dependabot group bump).
The previous STATUS block and the carrier both implied Wave 0 was still to be
written. It was not: V1 landed as `8ffc1440` (PR #458, 2026-11-21) and is binding,
and #441 (`908e537b`) and #430 (`7717fac6`) were built to it. What was genuinely
missing is the part this pass lands: V1 pointed each Wave 1 item at one line of
§8 and left the four to decide their own presentation while building.

**Landed: `docs/PRESENTATION_SPEC_V1.md` V1.1 (§10-§15, 33 numbered rules)**, with
receipts in `docs/audits/PRESENTATION-SPEC-V1.1-GATES.md` and enforcement in
`tests/presentation-spec-wave1.test.mjs`.

- §10 the single flow, stated so a reviewer can fail a build: no gate control
  (removing a control must not change what else is in the DOM), index order equals
  reading order, the primary last, the estimate summary as a §4 card that holds no
  action, demoted inputs in closed disclosures.
- §11 location-first: the ask is the first control, one dictionary purpose line,
  the place named in `#locNote` only, the estimate present at rest with its
  defaults and grade, denial parity with no fabricated locality, in-place recalculation
  with no superseded figure left on the surface.
- §12 the ladder: the six registry cases in registry order (pinned in the test
  against `usecases.js` and `#useCase`), as an R1 control group, why-lines hedged
  and ≤ 90 characters, one round visible at a time, an explicit pick wins
  instantly, zero answers is a complete display.
- §13 applicability: the matrix is data beside the registry, inapplicable means
  absent (not an empty shell), the one exception is a muted reason line with no
  action, the case's own metric leads R1, safety/permit/interconnection and honest
  refusals are never filtered.
- §14 copy and number formatting, **the new home for the quick-bill residue**: the
  helper line must quote the visitor's own load at one decimal and the bill that
  load implies, never the slider minimum (`BILL_MIN_KWH = 2` → about `$26/mo` at
  `$0.42/kWh`) and never `Math.round(kwh)` (which prints `≈1 kWh/day` beside a
  `1.2` entry). The numeric half is delegated to #479; the English data-label
  residue (`US mainland`, `pricing.js`) to #437.
- §15 three open questions with their deciders and the read that shows them
  undecided (Q1 estimate placement → #440, Q2 `#useCase` survival as accessible
  fallback → #440 with #434's input, Q3 the estimate's type role → #432).
- §5 gains 5.6 (a disclosure is addressed by name, never by position — the soft
  spot in the #441 receipt), and §8 now assigns P1/P6/P5 to the Wave 2 chrome and
  article pass so the closing census cannot find them unowned.

Overlap check at filing time: nothing new filed. #436 keeps the contract, #440
inference and sequencing, #431 applicability, #432 the type scale, #401 the
numbers, #437 locale copy, #479 the sub-1 kWh/day resolution.

Gate receipts: Lucas PASS (canon untouched, no surface pre-built, ownership
boundaries stated, every value cited), product Jev PASS (mean 3.0, no facet below
2). Nothing in Wave 1 or the #401 re-base was built, opened or promoted.

## Park record — 2026-11-25 (Wave 1 remainder: #440 and #431)

Census read live this pass: main `e100432c` (Wave 0 V1.1 landed), one open PR
(#455, dependabot), #436/#441/#430 CLOSED, **#440 and #431 OPEN**. Nothing drifted.

**#440 — PARTIAL, parked DECISION-READY.** The prior registry, the ladder and the
estimate summary are built on `wip/440-431-priors-ladder` (`52bdbced`, pushed, not
merged): `assets/js/sizing/priors.js` (features with sources and grades, the
ranking, the fixture suite including both owner examples, one recorded open
prior question), the six-row ladder replacing the two-button goal control in
`index.html` (registry order, why-lines only where a live feature exists), the
estimate summary card (§11.4 as amended: defaults and the local rate, never an
invented price), 12 keys in all seven locales, and `tests/priors-ladder.test.mjs`
(8/8 green). Gates that pass on the branch: `check-usecases` OK, chars OK, seo
asset tokens OK, format OK.

Blocked by two real findings, each with its receipt:

1. **Deploy-manifest module graph** — `tests/deploy-manifest.test.mjs` fails with
   "module(s) the shipped entry loads but the manifest omits:
   assets/js/sizing/priors.js". The manifest copies `assets` recursively, so this
   is the module-graph clause disagreeing with the directory rule; until that is
   resolved in the gate itself, adding any new sizing module ships a red rail.
   This is a gate-mechanics decision, not an owner decision, and it is why the
   branch is not merged.
2. **No live source for three priors** — the tariff registry carries a rate but
   no TOU-schedule flag, no outage exposure and no place class
   (`pricing.js` exports `estimateTariff` only), so the ranking can only read
   `rateLevel` today. #440's LA-vs-Trabuco drive receipts need those fields,
   which is data work with no home in the open set yet. The ladder therefore
   renders registry order with no why-lines (spec §12.3's feature-poor path),
   which is honest but does not meet #440's acceptance.

**#431 — not started, parked DECISION-READY.** Its matrix needs the same
region-record fields (case-eligibility per route is derivable from `PATH_IDS`,
but "only applicable information" needs the case features above), and its
acceptance is six per-case rendered receipts. Filed with the gate receipt rather
than half-built: a matrix without a source for its own predicates would be the
kind of invented rule the spec forbids.

Spec §15 Q1 (estimate placement): NOT resolved into a rule this pass. The branch
implements the intake-block reading (10.4/11.4 with 11.8 drafted), but the rule
stays unlanded with the code, so the question is parked with the item rather than
recorded as decided.

Nothing promoted; production untouched; no Wave 2-3, #401 re-base or promotion
work started.

## Readiness line

The intake now carries the case ladder and the estimate summary on STAGING
(deploy `f9b01c8c`, stamp `20261125k`, SW `beco-v308`, verified at 390x844 on
`https://f9b01c8c.bigenergyco.pages.dev`). The ladder renders `usecases.js`'s
six cases, ranked by the one prior model (`intake-priors.js`), with one hedged
why-line where a live feature fires; the estimate card states the bill, load and
cut defaults plus the local rate and follows the place in place. The full
results surface is unchanged from STAGING-RESTORED: plan card, readable card,
both charts, the frontier curve, the hardware list and the four-ways comparison
all visible, with one price basis. Blog and SEO censuses unchanged at zero URL
changes. NOT promoted: production (`freeoffgridcalculator.com`) is untouched and
`bigenergyco.pages.dev`, the production-branch alias, still serves `20261103u`.
Promotion remains a separate D-2026-11-13-008 step.

WAIT-STATE: not waiting on a party. #440 is landed and verified (#489, #490,
#492); its one open residue is data, not a decision — the tariff record carries
no TOU-schedule, export-regime, outage-exposure or place-class field, so the
rendered ranking is only as rich as the rate band until a cited source exists.
#431 is parked DECISION-READY with its receipt and needs that same data plus six
per-case drives. Rung: Wave 1's #441 and #430 were already closed and #440 is now
landed and rendered-verified; next is #431's matrix when a cited source for the
case features exists, otherwise the queue's Wave 2 rows (#432 typography, #437
locale residue, #439 support path) which do not depend on it.

## Known follow-ups (already attached, not re-filed)

- The unused `assets/js/shared/simple-mode.js` module and its storage tests:
  removal needs `scripts/jev-dispositions.mjs` updated in the same change.
- The readable card's "see details" opens the first `details` by position rather
  than by name; it should name the disclosure it means.

## Landing record — 2026-11-25 (Wave 1 remainder: #440 landed and verified)

Census read live this pass: main `f9d38858`; open PRs none but dependabot #455;
#440 merged (ladder, prior ranking, estimate card on main), #431 open and still
DECISION-READY, spec §15 Q1 settled as a numbered rule. No second Home was
created: #440 keeps intake inference and sequencing.

- **#440 intake priors + ladder -> PR #489, squash `0c628d3e`.** Rail
  `verify:success` at the exact head `0531a830` (CircleCI pipeline `31391e31`,
  workflow `verify`; revision read back from the pipeline API and matched; the
  Actions jobs are the known-dead ones). Landed: one prior model — the duplicate
  `priors.js` is deleted and the ladder renders `intake-priors.js`'s
  `rankCases()`, the module whose fixture suite (owner's LA and Trabuco examples
  verbatim) landed in `038d7fd9`; a six-row ladder in `usecases.js` order with
  the legacy ids `btnGoalGridtie`/`btnGoalOffgrid` kept for the smoke scripts;
  a pick routed through `applyUseCase`; the §4 estimate card stating bill, load
  and cut defaults plus the local rate and never a priced figure; seven why-line
  keys in all seven locales, each English line <= 90 chars and hedged; and spec
  §15 Q1 settled as **rule 11.8** (the estimate summary is a new intake block,
  not the results card revealed early). The §15 row keeps its receipt.
- **The live-feature boundary is stated, not papered over.** #440 item 1 wants a
  tariff TOU-schedule, export regime, outage exposure and place class. None has
  a field on the resolved place or the tariff record today, so they stay ABSENT
  and the ladder falls back to registry order where nothing fires (spec §12.3).
  The one live feature is the rate band, declared in `PRIOR_FEATURES`. The
  owner's LA-vs-Trabuco order is proven by the fixture suite; a rendered place
  is only as rich as the source behind it. That residue is the next #440
  dispatch, not a silent default.
- **#490, squash `9da7e360` (head `926a9183`) — the repaint cure.** Driving the
  merged staging build showed the ladder rendering raw keys (`useCaseBillCut`,
  `whyHighRates`): it is built during setup, before the deferred `locales.js`
  import resolves. Both the ladder and the estimate card now sit in
  `repaintRuntimeCopy()`; `tests/priors-ladder.test.mjs` pins it.
- **#492, squash `f9d38858` (head `ebb1744`) — the card and the ranking follow
  the place.** Driving showed that after a place resolved (rate field `0.302`,
  California tariff note) the card still quoted `0.28` and the ladder kept its
  boot order. `applyEstimatedTariff()` and `syncBillSlider()` — the one path a
  location, tariff or currency change goes through — now re-derive the features
  and repaint both surfaces, so a hand-entered rate moves the ladder too; a drag
  on the bill or cut control repaints the card in place (spec 11.6). The calls
  are `typeof`-guarded so the tests that eval the extracted function bodies keep
  working. #491 was closed superseded: every push to that head returned GitHub
  500s during the outage, and #492 carries the same commits plus the guards.
- **Rendered drive, `https://f9b01c8c.bigenergyco.pages.dev` at 390x844**
  (stamp `20261125k`, SW `beco-v308`): at rest the ladder is the registry's six
  rows in registry order with the bill-cut row selected and its hedged why-line,
  and the estimate card reads `$167/mo`, `~20 kWh/day`, `80%`, basis
  `0.28/kWh`. Resolving Trabuco Canyon, California: `#locNote` names the place,
  the rate field becomes `0.302`, the basis `0.30/kWh`, the bill default
  `$188/mo`. All six labels render translated, no echoed keys anywhere; a pick
  moves `aria-checked` in the same tick. Console clean; no horizontal overflow
  (`scrollWidth - clientWidth = 0`); index order `citySearch < caseLadder <
estimateCard < billSliderWrap < btnRunSizing`.
- **Budget and stamp work shipped with the code**, not by widening a gate:
  `index.html` and `site.css` were over budget with the new block, so comments
  in both were compressed with no citation dropped; the asset stamp moved
  `20261125e -> 20261125k` (`beco-v303 -> beco-v308`) as the graph files changed.
- **#431 stays parked DECISION-READY** with its receipt: the applicability
  matrix needs the same unresolved case features plus six per-case rendered
  drives. Nothing half-built was merged for it.
- Production untouched; no Wave 2-3, #401 re-base or promotion work started.

## Landing record — 2026-11-27 (Wave 2 tail: #432, #437, #439)

- **#432 typography, squash `47286fb2` (PR #494, head `53982da3`).** One type
  scale of six roles, tabular figures on every price surface, and no action
  carrying its own inline font-size or padding. Rendered read on staging:
  display role 52px at 1280 and 29.6px/34.04 at 390; section title 36px; h3
  15.2px/24.32. The mobile re-declaration is gone, so the display role is one
  size per breakpoint, not a fourth value.
- **#437 locale chrome, squash `66847c26` (PR #495, head `01ff0b93`, pipeline
  42ec3736, job 330).** A `CHROME_COPY` dictionary (42 keys x 7 locales) painted
  through `t()`, covering the comparison grid, the hardware list, the print
  sheet, the sunshine line and the lead-acid chip. The first rail at `7f6e8919`
  failed honestly: `tests/location-picker.test.mjs:175` caught the sunshine line
  echoing the raw key `resultSunshineData` while the deferred dictionary was
  still loading. The cure is `sunshineLine(place)` with an English fallback at
  all four call sites, so a key can never flash before the dictionary resolves.
- **#439 support path, squash `b1ae138a` (PR #497, head `9680cd52`, pipeline
  fd968f5d).** The ES drive found the support path rendered and reachable, and
  one leak the text census could not see: the mailto carried a hard-coded
  English subject, so a Spanish reader's draft opened headed "Help with my
  result". `resultSupportSubject` now lives in all seven locales,
  `renderResults()` sets the href when it reveals the path, and the markup ships
  a bare `mailto:` for the no-script case.
- **Correction, recorded because it changes what a green means:** #496
  (`b56316f4`) merged with an EMPTY diff. A rebase reset moved the lane branch
  before the file restore, so the squash carried stamp rewrites only. Rail green
  on an empty change is evidence of nothing; #496 is not counted as #439's
  landing and #497 carries the real change.
- **Perf budget paid, not widened.** #497's first head (`fa05cb60`) was red at
  the rail: eager JS 895,030 bytes against the 895,000 limit. Paid by compressing
  the hardware-guidance comment (the repo rule is to compress comments, never to
  raise the gate); green at `9680cd52`. This was the only red in the pass that
  was not already fixed in the head that closed the item.
- **Rendered drive, `https://6dccec5f.bigenergyco.pages.dev`** (stamp
  `20261127a`, SW `beco-v321`), Spanish, result open, 1282 and 390 wide: support
  path visible with subject `Ayuda con mi resultado` at both widths, zero raw
  keys in page text, `scrollWidth - clientWidth = 0`. On the previous staging
  deploy (`112c4d34`, stamp `20261126d`, SW `beco-v319`): comparison header
  `Batería ↓ · Objetivo → −60% factura...`, hardware `Paneles solares /
Inversor / Batería (útil)`, print title `Comparación de vida útil — conectada
a la red`, sunshine `Datos de sol de Madrid, Europe, Spain`, lead-acid chip in
  Spanish. Console carried only the #364 advisor-origin CORS errors, before and
  after these heads.
- **No promotion.** Production (`freeoffgridcalculator.com`) is untouched; the
  D-2026-11-13-008 trigger needs a Jev vision PASS on rendered surfaces plus a
  scope flush, and neither was attempted in this pass.

WAIT-STATE: not waiting on a party. Wave 2 is landed and rendered-verified
#432, #437 and #439. The queue now stands at Wave 3 (#433 speed, #434
accessibility, #435 failure states, #438 share card) with #431 parked
DECISION-READY behind case-feature data and #328 parked as an owner act. Rung:
Wave 2 tail closed; next is Wave 3's first row.

## Landing record — 2026-11-27 (Wave 3 row 1: #433 speed)

- **#433 closed on squash `e717b7a8` (PR #499, head `7160e6cb`, CircleCI
  pipeline `e552bfa8`, workflow `verify` success at the exact merged revision).**
  Squash diff proved non-empty before merge: 32 files, +1,337/−343 against
  `e717b7a8^`. No rebase reset touched this branch, so the #496 empty-diff
  failure mode did not apply here; the check was run anyway.
- **The GitHub Actions check-runs on that head are red for infrastructure, not
  code:** every job reads "The job was not started because your account is
  locked due to a billing issue." No job ever ran. The lane's rail is CircleCI;
  the state is recorded in the receipt rather than presented as a pass.
- **Baseline taken on the real load path, not a synthetic substitute.**
  `scripts/measure-speed.mjs` drives a real browser over CDP (Slow 4G, 4× CPU,
  390x844, cache off, Honolulu) against the deployed staging artifact and times
  the click to a numeric bill. Before (`6dccec5f`): time to first number
  **15,898 ms**, results-phase transfer **1,795,599 B**, LCP 1,308 ms. With
  `power.larc.nasa.gov` blocked the same run finished in 3,162 ms / 204 KB —
  i.e. ~80% of the wait was the third-party weather transport.
- **Cause and cure.** NASA POWER's hourly endpoint is served uncompressed
  (653,437 B for the two-year chunk, no `Content-Encoding`). `nasa.js` now asks
  for `format=CSV` — 417,287 B, −36% — parsed into the JSON parser's exact
  record shape (`-999`→NaN, re-padded stamps, header located not counted past),
  with the JSON parser retained as the fallback for any body that is not CSV.
  Eager-JS budget was met by **trimming prose**, never by widening it.
- **After** (`cd5f9072`, merged shape, same conditions): time to first number
  **11,252 ms**, results transfer **1,205,374 B**, LCP 1,488 ms. Weather-blocked
  first number 3,162 → 2,113 ms.
- **Gate, so this cannot silently regress:** `scripts/check-speed.mjs` derives
  first-load and deferred-layer graphs from the built artifact (markup, static
  imports, `new Worker()`, dynamic imports, CSS `url()`, manifest) and refuses
  to pass on a graph it could not derive; budgets in
  `scripts/lib/speed-budgets.mjs` (first-load 1,115,000 B measured 1,107,786;
  deferred 1,055,000 B measured 1,046,672). Wired into CircleCI after the
  staging build and into `.github/workflows/test.yml`.
  `tests/speed-budget.test.mjs` plants a 40 KB first-load regression that must
  fail the gate binary, and asserts a missing axis is a fail, not a pass.
  `tests/nasa-csv.test.mjs` pins the wire and both parsers; every fetch double
  in the suite now speaks CSV.
- **Rendered surface:** staging `https://cd5f9072.bigenergyco.pages.dev` (stamp
  `20261127b`, SW `beco-v322`). Phone class: three CSV weather pulls, first
  number at 11,252 ms with a numeric bill. Desktop 1282x900: result card renders
  on load (`$167/mo`); Honolulu run produces `$267/mo` with the 20-year cost
  card; 46 scripts at `?v=20261127b`, no 404s. Production untouched.
- **Standing limitation, not silently dropped:** the next lever is an
  edge-compressed same-origin weather proxy. No origin serves `/api` (404 on the
  staging preview, the pages.dev apex and the apex domain) and the static Pages
  flow cannot ship a Worker, so it is an owner/infra act recorded in
  `speed-budgets.mjs` under `remaining_lever`.

### Census — re-derived live after the merge (2026-11-27)

- **Main head `e717b7a8`.** Open PRs: **#455 only** (the npm-group dependabot
  bump, untouched by this lane).
- **Closed this pass:** #433 (auto-closed by "Closes #433", receipt posted on the
  issue, mirrored to #429 and #145).
- **Open set (26):** #145 master plan tracker; #328 (owner act, Cloudflare
  dashboard, DECISION-READY, parked); #345 and #358 (Champion badge thresholds),
  #353 (Champion frontier); #360 (production drift), #361 (staging-origin
  naming), #362 (plan-vs-policy drift), #364 (advisor CORS); #366 SEO program
  with #393–#399 market posts and #408 Sinhala; #400 unify+simplify tracker with
  #401/#402/#403 residues; #429 canonical GQ tracker with **#434 accessibility**,
  #435 failure states, #438 share card open and #431 parked behind case data;
  #440 landed; **#466** (codex 32-finding burndown), **#467** (verdict sentence
  asserting a cause the numbers deny), **#479** (sub-1 kWh/day advanced loads
  silently substituted).
- **Queue correction from the live record:** the carrier's Wave 3 order stands
  (#433 done, then #434, #435, #438), but three live defects filed since the
  carrier was written sit ahead of it in the "live defects" tier and are now in
  the queue explicitly: **#479** (silent substitution of small loads — a
  correctness defect on the results surface), **#467** (a verdict sentence that
  contradicts the run's own numbers), and **#466** (the codex finding audit).

## Readiness line (2026-11-27, after the #433 landing)

Next row in filed order: **#434 (GQ F5 accessibility)** — with #479 and #467 in
the live-defect tier ahead of the rest. Main `e717b7a8`, rail green at the merged
head, staging `cd5f9072` carries the landed shape at stamp `20261127b` / SW
`beco-v322`; production is untouched and still the 2026-11-04 deploy, so
promotion stays gated on the D-2026-11-13-008 trigger (rail green + Jev vision
PASS on rendered surfaces + scope flush). #328 remains the only owner-held row,
parked with its receipt. #431 stays DECISION-READY behind case-feature data.

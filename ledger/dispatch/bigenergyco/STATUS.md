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
- NOT done: production untouched; #467's truthful-verdict cure unlanded; #437's
  remaining rendered ES re-drive on this restored surface is the next check, not
  a claim made here.

## Readiness line

The FULL results surface is live on STAGING and STAGING-RESTORED on #429 (stamp
`20261124p`, SW `beco-v296`, verified on `https://bfd68431.bigenergyco.pages.dev`
at 390x844). Home is one place field and one action, and the calculator still asks
the three questions with no mode fork; results now show the complete previous
experience — the plan card, the readable card, both charts, the frontier curve,
the hardware list and the four-ways comparison all visible — with one price basis
(DIY parts cost of goods, three parts lines summing to the headline) and payback
named per basket. The #439 support path renders beside the result actions. Blog
and SEO censuses unchanged at zero URL changes. NOT promoted: production
(`freeoffgridcalculator.com`) is untouched and `bigenergyco.pages.dev`, the
production-branch alias, still serves `20261103u`. Promotion remains a separate
D-2026-11-13-008 step.

WAIT-STATE: nothing is waiting on another party. Rung: merge landed (#474 as
`7cd81663`) with its rendered evidence filed; next rung is the #437 rendered ES
re-drive on this restored surface, then #442/#444/#447 residue in queue order.

## Known follow-ups (already attached, not re-filed)

- The unused `assets/js/shared/simple-mode.js` module and its storage tests:
  removal needs `scripts/jev-dispositions.mjs` updated in the same change.
- The readable card's "see details" opens the first `details` by position rather
  than by name; it should name the disclosure it means.

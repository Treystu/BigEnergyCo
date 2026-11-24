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

## Readiness line

The stripped interface is live on STAGING (`staging.bigenergyco.pages.dev`, stamp
`20261124b`) and STAGING-VERIFIED on #429: home is one place field and one
action, the calculator asks three questions with one action and the rest in one
optional disclosure, and results lead with the one-price plan whose three lines
sum to it, followed by the single cost table; every other result block — the
readable card, the view ladder, the charts, the frontier, the hardware list and
the workings — sits inside the same optional disclosure, so the result has no
mode fork. The #439 support path renders beside the result actions. Blog and SEO censuses are unchanged at zero URL changes. NOT promoted
under the owner order: production (`freeoffgridcalculator.com`) is untouched and
`bigenergyco.pages.dev`, the project's production-branch alias, still serves
`20261103u`. Promotion remains a separate D-2026-11-13-008 step.

## Known follow-ups (already attached, not re-filed)

- The unused `assets/js/shared/simple-mode.js` module and its storage tests:
  removal needs `scripts/jev-dispositions.mjs` updated in the same change.
- The readable card's "see details" opens the first `details` by position rather
  than by name; it should name the disclosure it means.

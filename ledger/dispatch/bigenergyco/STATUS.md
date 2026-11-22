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

## Readiness line

Presentation spec landed and binding; intake is fork-free and location-led, and a
real run from the leading location ask reaches rendered results. NOT promoted: no
production deploy from these heads, so production still serves the pre-#441
build. Promotion waits on the D-2026-11-13-008 trigger: rail green (per item),
Jev vision PASS on the rendered merged shape (not yet re-run), scope flush items
closed or DECISION-READY (not yet).

## Known follow-ups (already attached, not re-filed)

- The unused `assets/js/shared/simple-mode.js` module and its storage tests:
  removal needs `scripts/jev-dispositions.mjs` updated in the same change.
- The readable card's "see details" opens the first `details` by position rather
  than by name; it should name the disclosure it means.

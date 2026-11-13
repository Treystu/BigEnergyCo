# BEC-SEO lane - session record 2026-11-13

Lane: bec-seo. Tracker: issue #145 (not reachable from this session, see Blockers).
Canon: docs/plan/MASTER_PLAN.md untouched.

## Stand-up

CANONICAL-CHECK 2026-11-13T02:29:39Z

- home/.typesafe_key - ABSENT
- home/.git-credentials - ABSENT
- home/.netrc - ABSENT
- env/GITHUB_TOKEN - ABSENT
- env/GH_TOKEN - ABSENT
- managed remote Treystu/BigEnergyCo - WORKING (git ls-remote resolved refs/heads/main)
- managed remote Treystu/slow-lane-ledger - NOT CHECKED (no credential resolves for this repo; clone refused with "could not read Username")
- gh CLI auth - NOT CHECKED (`gh auth status`: not logged in to any host)

Resolution filed per doctrine: the credential that resolves is the harness-managed
remote credential for Treystu/BigEnergyCo only. It is not a repo-scoped token that
can be reused for another repository, so the ledger clone and the `gh` API are not
authorized in this session.

## Bootstrap

- dispatch/bec-seo/PROMPT.md (full standing prompt v4): NOT READ - the ledger repo
  is unreachable from this session. Ran on the mission carrier text instead, as the
  carrier instructs, and filed the gap here once.
- dispatch/bec-seo/DISPATCH.md: NOT READ - same cause. No dispatch entries applied,
  so nothing is acked either.
- dispatch/gates/ (Lucas Gate v2 material): NOT READ - same cause. The Gate was not
  re-read this session; no new gate verdicts were issued from it, and no owner
  decisions were filed.

## Work completed (queue item 1 and 2 of the wave 2 remainder)

Source reads first, then write, then land on a lane branch:

1. #378 Bangladesh (BN) - blog/bangladesh-net-metering-2026/
   - SREDA / Power Division Net Metering Guideline 2025 read at source (the PDF on
     solar.sreda.gov.bd). Operative rules used: CAPEX and OPEX models, converter AC
     output not above the approved load, bidirectional ToU net meter plus RE
     accounting meter, 5/7 working-day application and approval, 8-month install
     window, 15 working days for commissioning and meter, quarterly settlement at
     the ends of March, June, September and December, 10 percent of net exported
     units retained by the distribution utility as a maintenance charge with 90
     percent credited, unused credit paid at the BERC rate.
   - Power Division notification of 1 September 2026 read through the state news
     agency and the gazette coverage: Tk 10.50 per exported unit for systems
     installed by 28 February 2027, rate until 28 February 2030, bank or MFS only,
     built from a Tk 8 generation cost plus 20 percent profit and 11.25 percent
     premium.
   - BERC June 2026 LT-A slab table: the commission site did not answer from this
     sandbox (curl returned no response), and the order is a scanned image, so the
     steps were cross-checked against BERC's published rate schedule, the
     distributors' calculators and three independent reports of the 3 June 2026
     order and the 4 June rollback. The post states that read method in its source
     note rather than implying the order itself was read.
2. #381 India (HI and EN) - blog/india-pm-surya-ghar-2026/
   - MNRE guidelines for PM Surya Ghar: Muft Bijli Yojana read at source (the PDF
     hosted on the government CDN). CFA is 60 percent of benchmark for the first
     2 kWp and 40 percent for the third kWp with nothing beyond 3 kWp; benchmark
     Rs 50,000/kW then Rs 45,000, giving Rs 30,000/kW then Rs 18,000 and a
     Rs 78,000 cap; special-category states at Rs 55,000 and Rs 49,500, giving
     Rs 33,000 and Rs 19,800. DCR modules are an essential condition, off-grid is
     excluded, behind-the-meter battery hybrids qualify with state commission
     approval, assistance is once per installation, GHS/RWA get Rs 18,000/kWp up
     to 500 kWp at 3 kWp per house, and the claim is processed within 15 days of
     DISCOM approval. Implementation period stated in the guidelines runs to
     31 March 2027.

## Site integration (required by the publishing doctrine)

- scripts/lib/deploy-manifest.mjs ALLOWLIST: both post paths added.
- sitemap.xml, llms.txt, rss.xml, blog/index.html (card and Blog JSON-LD): both
  posts added, newest first.
- scripts/check-i18n.mjs: the unkeyed-prose ceiling moves 546 to 558, the exact
  measured delta of the two new article bodies (5 and 7 blocks), recorded in the
  comment block in the same style as the earlier raises.

## Evidence on this head

- npm run seo: exit 0. 94 public pages, sitemap exact match, QUALITY OK, unkeyed
  prose 558/558, inline style attributes 260/318.
- npm run format:check: exit 0, 1437 tracked files.
- npm test: see the handoff comment for the run on the committed head.

## Blockers, named once

- Tracker issue #145 cannot be filed from this session: `gh` is unauthenticated and
  no API credential resolves. No stand-up, digest or handoff comment has been
  posted there.
- Ledger upload (evidence/lane-sessions/bec-seo/2026-11-13-session.md) and
  dispatch/bec-seo/STATUS.md cannot be pushed: the ledger repo rejects the clone.
- Pull requests cannot be opened for the same reason. Work is pushed as the lane
  branch and marked READY-TO-MERGE in the handoff text; BEC-CODE remains the only
  merger and nothing here is merged.

## Queue after this session

- #366 close-out; Q1-2027 markets filed per-market (Sri Lanka, Pakistan, Italy,
  Germany, Philippines, Greece, Ukraine, Nigeria, Mexico); Belgium-Wallonia and
  Argentina held in the tracker.
- 26 Nov 2026: re-verify the South Africa post against the NERSA decision.

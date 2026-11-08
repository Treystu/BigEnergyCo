# Session digest — 2026-11-08, lane continuation hour (P2.3 structural half)

Read time 2026-11-08T11:59Z. Lane `lane/finish`, standing draft PR #330, tracker
#145. Session opened at `d73965b3` (verified equal to `origin/lane/finish`,
working tree clean). Staging only: no deploy, no promotion, no production change,
no billing-locked CI rerun, no deletions, #328 untouched.

## 1. Preservation six — re-read, live state

`docs/lane/PRESERVATION-CONFORMANCE-2026-11-05.md` section B.2 carries the six
gap states and they are unchanged by this session:

| Gap | State          | What it waits on                                                                          |
| --- | -------------- | ----------------------------------------------------------------------------------------- |
| G1  | DECISION-READY | owner: whether a reconstruction session is worth running                                  |
| G2  | DECISION-READY | owner-approved elevation for a byte-level walk (lane route: A-06 re-scan, due 2026-11-19) |
| G3  | DECISION-READY | owner: push transcripts as an out-of-repo artifact, or accept the single-machine copy     |
| G4  | DECISION-READY | owner: same decision as G3                                                                |
| G5  | DECISION-READY | nothing in this lane's scope; the row states the ALL-CLEAR's boundary                     |
| G6  | CLOSED         | nothing; generator committed and run by its test                                          |

No ALL-CLEAR is issued or implied. The sheet still needs a non-author acceptance
of the six states and the owner dispositions before a verdict can exist; none of
that is a lane act, so it is reported rather than attempted.

## 2. PR dispositions re-checked

- **#342** (`feat/p1.4-stale-fx-notice`) — OPEN, `MERGEABLE`, non-draft. Its
  content already landed on this lane (P1.4, `LEDGER.jsonl`); its own merge
  precondition cannot exist on its head (no `.circleci/config.yml` there). Still
  a one-line owner design call, still owner-reserved. No action taken.
- **#344** (dependabot, npm group, 3 updates) — OPEN, untouched. Dependency bumps
  are not this lane's queue and the batching decision is the owner's; nothing
  here needs it.

## 3. DONE — P2.3 structural half (the next canonical lane-owned item)

P2.2's remainder (cited values) and P2.3 (coverage) were the live frontier in
plan order. P2.3's structural half was unblocked and undone:

- **The hole was real and the gate could see it while passing.** The registry
  held **1** country file. `build-registry --check` computed the shortfall,
  printed it as a "P2.3 worklist", and **exited 0**. 219 of the 220 countries the
  calculator can resolve had no row — which is the silent guess the registry
  exists to prevent, because an absent row has nowhere to say "not verified".
- **Rows added, claims not manufactured.** 220 new files (`assets/data/registry/`):
  currency **cited** to ISO 4217 (`grade A`) from the shipped `COUNTRY_CURRENCY`
  table that `tests/currency-coverage.test.mjs` already pins against the city
  partitions; the other 18 fields per row an **explicit unknown** with a note
  saying why and a `review_by` inside the field's window (6 months for the six
  policy fields, 12 for the rest).
- **Generated, not hand-written.** `scripts/seed-registry-countries.mjs` is the
  only producer; it never rewrites an existing file, so the curated US row and
  its 51 cited state rows are untouched (pinned by test).
- **The gate now has teeth.** A place-data country without a row is a FAIL naming
  the seeder, instead of a printed worklist and a green exit.
- **Cost stated, not absorbed.** Deploy manifest 500 → 720 files; artifact gains
  907 KB of raw JSON; `tests/deploy-manifest.test.mjs`'s band moved 480–520 →
  700–740 with the reason written at the assertion. No byte budget moved:
  `registry_country` reads the same 76,886 B (worst IN) and the first-result graph
  does not load these files.

**Not delivered, and not implied by "220/220 covered":** not one tariff is
cited. P2.3's other half is one primary-source read per country. The coverage
figure is a structural fact, not a data claim.

## 4. Receipts (head `a821903e`)

| Check                                          | Result                                                                                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run data:check`                           | registry OK — 9 sources, 221 country files, 51 sub-national rows, **220/220 place-data countries covered**                                    |
| `node --test tests/registry-coverage.test.mjs` | 6/6 — coverage, byte-identical regeneration, no number/grade/source on a seeded row, all 221 rows validate, US never regenerated              |
| `node --test tests/deploy-manifest.test.mjs`   | 9/9 — including the widened envelope and its mutation teeth                                                                                   |
| `npm test`                                     | 2106/2111; the 5 reds are the pre-existing value-moment copy pins, unchanged by this session                                                  |
| `npm run seo`                                  | green — sitemap/JSON-LD/tokens; stamp `20261108d`, 61 referenced assets verified                                                              |
| `check-format`, `check-chars`                  | OK after `npm run format` (1371 tracked files; the earlier status doc was reformatted because prettier only sees a file once it is tracked)   |
| `npm run deploy:check`                         | staging built, not pushed                                                                                                                     |
| `check-byte-budgets --stage _pages_staging`    | `js_to_first_result` 203.5 KB (over its unchanged 200 KB line, reported), `registry_country` unchanged 75.1 KB; both non-blocking until P6/P8 |
| `npm run plan:check`                           | PLAN PIN OK, ledger append-only                                                                                                               |

Ledger: a `note` row for P2.3's structural half and a `P0.4` `baseline` row for
the E13 basis copy (207,717 → 208,363 B JS, +646), both at `a821903e`.

## 5. NEXT, with the blockers named rather than skipped silently

- **P2.3 second half — cited tariffs.** One primary-source read per country;
  actionable only in slices (P2.2's precedent is one value per session). Next
  slice: the next largest market by solar need, cited at its regulator.
- **P2.4 (policy flags, incentives)** — needs a primary-source policy read per
  country and D-10 keeps unclaimed legality off the screen; a legality flag is
  advice, so it is not a copy task.
- **P2.5 (FX snapshot + runtime contract)** — blocked on **V-07**, an owner
  verification of the runtime FX provider's terms and ECB coverage. The snapshot
  half is also bounded by coverage: the registry now carries 221 currencies but
  the site prices in one.
- **P2.6 (pricing.js → registry)** — deliberately not taken. With 220 rows whose
  tariff is unknown, wiring the runtime now would replace the estimate every
  non-US visitor sees with "check your bill". That is the correct rule once
  values are cited and a regression before then.
- **P2.7 (`/sources/` + `/methodology/`)** — unblocked and the largest remaining
  visitor-visible item in P2; `/sources/#entry` is the anchor R-DATA-05 already
  promises every value.
- Owner-reserved, unchanged: **#342** design call, **A-04/A-11**, **#328** apex
  403s, Lucas Gate v2 rubric (still unavailable; no score claimed).

## 6. DIRECTIVES

Executed as given: head verified before edits; preservation six re-read; #342/#344
re-checked; canonical queue continued at the first unblocked item; staging fences
held; the reserve-sizing decision left open exactly as instructed (no sizing
behaviour changed).

GATE: not scored — Lucas Gate v2 rubric still unavailable; parked, not claimed.

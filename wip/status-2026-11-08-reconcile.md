## STATUS 2026-11-08 (replacement session) — #342/#343 reconciled against the preservation record, and the exact-head red named by its own check-run

**Driving head `d53d79530c48e7e771ba46ffdb72d535a9919549`** — `origin/lane/finish == local`, working tree clean at session start. Production untouched; no other lane's branch written; no owner-reserved decision taken.

Session window: 2026-11-08T02:44Z onward (first read below is 02:44:40Z UTC).

### 1. What the preservation record actually contains, so the reconciliation is against the record and not against an impression

| Read                                                                                          | Result                                                                              |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/lane/PRESERVATION-CONFORMANCE-2026-11-05.md` preserved-item rows (`^                    | P-`)                                                                                | **16** (P-01 … P-16)                                         |
| same sheet, gap rows (`^                                                                      | G[0-9]`)                                                                            | **12** — G1–G6 in section B plus their six state rows in B.2 |
| same sheet, separately-held rows (`^                                                          | H-`)                                                                                | **2** (H-1 temp purge, H-2 #321 worktree hold)               |
| references to #342 / #343 / #344 in `docs/lane/*.md`                                          | **0** (read: `grep -rn` over `docs/lane/` + the burndown ledger, 2026-11-08T02:47Z) |
| durable refs for the three PR heads (read: `git ls-remote --heads origin`, 2026-11-08T02:47Z) | all three present at the exact PR head SHAs (table below)                           |

So the preservation sheet is a **content-durability** record and carries **no row for any of these three PRs**, and that is correct rather than an omission: none of them is a preservation item. The question the record can answer is the one that matters here — _is the content durable if a PR closes unmerged?_ — and for all three it is, because each head is a live remote ref at the same SHA the PR API reports.

### 2. #342 — open, and open on a decision, not on work

| Claim                                                 | Read (2026-11-08T02:47Z)                                                                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State                                                 | `OPEN`, `mergeStateStatus: BLOCKED`, head `8fb5a9f654f034ec7712ecce51c668e5649ba25d` (GitHub PR API)                                                                                              |
| Content is durable without it                         | `git ls-remote --heads origin feat/p1.4-stale-fx-notice` → `8fb5a9f654f034ec7712ecce51c668e5649ba25d`, **identical to the PR head**                                                               |
| Its P1.4 obligation is already discharged on the lane | `docs/plan/LEDGER.jsonl` line 146, `"kind":"item-done","ref":"P1.4"` — the `pricing.js` `fxFreshness` design, four states, painted before the fetch                                               |
| Its own merge precondition cannot exist at its head   | `.circleci/config.yml` is absent from that branch and from `origin/main`, so no `verify` pipeline can ever attach to `8fb5a9f6`. This is the 2026-11-07 disposition's reading and it is unchanged |
| Nothing in the preservation record holds it           | 0 rows (section 1)                                                                                                                                                                                |

**Disposition: DECISION-READY, owner-reserved — unchanged.** Closing it as superseded would lose nothing (the ref stays); merging it as-is would put two implementations of one notice on the page, because the ledger's P1.4 row already names the lane's `pricing.js` design as the one that landed. The lane does not average those two outcomes, and does not write to `feat/p1.4-stale-fx-notice`.

**Planned address:** owner's one-line design call. If the lane's design wins → close #342 as superseded, no revert needed, nothing un-preserved. If #342's design wins → revert `fxFreshness` in `pricing.js` and its `fxSource*` keys in **one** landing, correct the P1.4 ledger row, then rebase #342 onto the resulting `main`. The 2026-11-06T03:46Z reprioritization note stands: this PR's landing order is unchanged and it lands first among finished PRs when the lock clears.

### 3. #343 — closed unmerged, and closing it lost nothing

| Claim                         | Read (2026-11-08T02:47Z)                                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State                         | `CLOSED`, `closed_at 2026-11-06T21:39:39Z`, `closed_by Treystu`, head `386cbd611482382e715f20fa51fb047660b9de5d` (GitHub issue API)                                                                |
| What it carried               | exactly one thing: the missing `P1.6` item-done row in `docs/plan/LEDGER.jsonl`                                                                                                                    |
| That row exists on the lane   | `docs/plan/LEDGER.jsonl` line 136, `"ts":"2026-11-05","kind":"item-done","ref":"P1.6"` — merge `506e4d637` (PR #338), `tests/assumption-disclosure.test.mjs`, seven-locale keys, the budget deltas |
| Content is durable without it | `git ls-remote --heads origin docs/p1.6-ledger-row` → `386cbd611482382e715f20fa51fb047660b9de5d`, identical to the PR head                                                                         |
| Not a preservation item       | 0 rows (section 1)                                                                                                                                                                                 |

**Disposition: SUPERSEDED, closed correctly; no action.** Its obligation is recorded in the ledger at a different SHA and is therefore intact; writing its row again on the lane would duplicate a ledger entry, which `plan:check` is built to reject.

**Planned address: none.** The earlier tracker wording that the P1.6 "ledger row is still open" is stale as of ledger line 136 and should not be re-opened as work.

### 4. #344 — named only so it is not mistaken for lane work

`OPEN`, head `ffb7ef3732dc4907aa59e3863c1d3b7ad59c482f`, dependabot (npm group, 3 updates). Its check rollup carries the same eight `steps=0` Actions failures **plus** a CircleCI `ERROR` context — which is the same mechanical fact as #342's: no `.circleci/config.yml` on a dependabot branch, so no pipeline. It is a dependency decision, carries no preservation obligation, and is not lane work.

### 5. The exact-head check read — the first failing check has no failing step

Eight Actions check runs stand at `d53d79530`, and every one of them executed **zero steps**:

| Check              | Workflow | Job id       | Started (UTC)        | Completed | Steps | Conclusion |
| ------------------ | -------- | ------------ | -------------------- | --------- | ----- | ---------- |
| `analyze`          | CodeQL   | 128354315889 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `test`             | Tests    | 128354316134 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `web-smoke`        | Tests    | 128354315996 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `quality-lab`      | Tests    | 128354316227 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `lighthouse`       | Tests    | 128354316229 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `quality-evidence` | Tests    | 128354316162 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `coverage`         | Tests    | 128354316232 | 2026-11-07T08:34:33Z | 08:34:35Z | **0** | failure    |
| `jev-complete`     | Tests    | 128354324661 | 2026-11-07T08:34:36Z | 08:34:37Z | **0** | failure    |

**First failing check: `analyze` (CodeQL), job `128354315889`, run `42356066162`** — mechanically, the lowest job id, i.e. the first of the eight created. Ordering by completion cannot single one out: six of the eight completed in the same second, 08:34:35Z.

**Its first failing step: none. There is no such step, and that is the finding.** Its annotation, verbatim (read: `check-runs/128354315889/annotations`, 2026-11-08T02:44Z):

> The job was not started because your account is locked due to a billing issue.

**And it is not stale.** I re-ran it rather than reason about it: `POST actions/jobs/128354316134/rerun` was accepted at 02:45:5xZ, and the new `test` job `128606664137` ran at **2026-11-08T02:45:51Z → 02:45:53Z, conclusion failure, `steps: []`** — an empty step array, not a failed one — with the identical billing-lock annotation. Seven of the eight re-ran (all but `analyze`): `coverage` `128606665677`, `lighthouse` `128606665347`, `quality-lab` `128606665303`, `quality-evidence` `128606665182`, `web-smoke` `128606664858`, `test` `128606664137`, `jev-complete` `128606671277`, every one `failure`, every one `steps=0`.

**Disposition: ACCOUNT-LEVEL INFRASTRUCTURE, owner-reserved.** No change to this branch, this repository, or its workflows can make these jobs start. It is cured by clearing the billing lock, and only by that.

**The rail that does execute is green at the same head:** `ci/circleci: verify` → `success`, created `2026-11-07T08:40:16Z`, pipeline 28 (read: `commits/d53d7953.../status`, 2026-11-08T02:44Z). That is why the lane's merge evidence has been the CircleCI rail since 2026-11-07.

### 6. What this artifact does not claim

- It does **not** claim #342 is mergeable, nor that its design should lose. The design call is the owner's.
- It does **not** claim #343's closure was reviewed by a non-author; it records that the row it wanted exists.
- It does **not** claim the eight Actions jobs will pass once the lock clears. It claims only that they executed nothing, which is readable from the run objects themselves.
- It records **no deploy, no promotion, and no ALL-CLEAR**. Production was not touched, and the preservation sheet's ALL-CLEAR remains UNISSUED.

### 7. Next action (exact)

**V4 — the comprehension pass (E13)**, unchanged and unblocked: one-line plain glosses at first use for `kWh/day`, nameplate, autonomy and the tier language; a "what's included" line reconciling buy-cost against 20-year cost; presets labelled by who they fit with the typical home called out; and one line above the three result tabs saying what each opens. Its receipt is a first-timer drive quoting the result surface in the cold-recipient style.

GATE: local pass (decision-signal) - reconcile #342/#343 against the 24-row preservation record and name the first exact-head red by check-run, steps, annotation and rerun - checks 1-5 clean

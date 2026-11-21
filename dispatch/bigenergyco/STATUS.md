# STATUS — BigEnergyCo lane (cloud session, FreeBuff)

CARRIER: blob:b834bbed45cd
FIRST ACT: push-test the git write path by committing and pushing this stand-up filing, then cure #444 (kWh/day dropdown option does not take a mouse click).

Ledger note: the carrier names `dispatch/bigenergyco/` as this lane's mechanics home. That path does not
exist on `main` or anywhere in this repository's history (`git log --all -- 'dispatch/*'` returns nothing;
`git ls-tree` of origin/main has no such directory). This filing creates it, so the ledger the carrier names
has a home in the repo it governs. Prior blocks posted their status on tracker #145 under LANE PROTOCOL 4
instead; those comments stay where they are.

---

## STAND-UP — 2026-11-21T08:52Z (restart protocol A7)

### Launch ack

Both dispatch IDs the wake requires are already acked, and the ack is read, not assumed:

- FED-UNIFICATION-2026-11-15-1 (this lane's entry D-2026-11-13-017) — acked 2026-11-17T08:45:48Z on
  #145, in the comment that acked 17 D-IDs plus FED-2026-11-10-1, FED-CURE-2026-11-15-1 and
  FED-UNIFICATION-2026-11-15-1 — 21 entries by full ID.
- FED-CURE-2026-11-15-1 — acked in the same comment, same read.

Nothing is re-acked here. No new dispatch text was found on #145, #429 or #400 after 2026-11-17T15:00Z
(read: per-issue page reads of #429, #400, #145, 2026-11-21T08:44-08:50Z).

### Census — two methods, per-issue reads

Method 1, git against origin (primary read of the ref):

- `main` = `d49bc60670eea962b7fe16b5c750629d6b005782` (read: `git ls-remote origin refs/heads/main`,
  2026-11-21T08:42Z). Carrier's `a7c8ca3d2bd6` is two merges stale.
- Merged since the carrier: #452 (`a7c8ca3`), #453 (`7d0ebfa`), #454 (`d49bc60`); before them #449-#451.
- No `refs/heads/lane/finish` and no live defect branch on origin (read: `git ls-remote --heads origin`,
  same pass), so no PR branch is outstanding from the defect queue.

Method 2, the GitHub record (per-issue page reads, 2026-11-21T08:42-08:50Z):

| Item | State | Receipt |
|---|---|---|
| #442 first click on Size My System is a no-op | CLOSED | PR #454 merged 2026-11-21T02:12:15Z, squash `d49bc60` |
| #453 (fix for #443) | CLOSED, merged | 2026-11-21T01:29:46Z, squash `7d0ebfa`; #443 CLOSED |
| #444 kWh/day dropdown option ignores the mouse | OPEN | no fix commit on `main` |
| #447 custom coordinates | OPEN | precision half cured by #450 (`8e078f4`); reverse-geocode residue open |
| #436 F7 shape audit + presentation spec | OPEN | Wave 0, unstarted |
| #429 / #400 / #145 | OPEN | canonical tracker, numbers sub-program, master tracker |

Limit, stated plainly: the open-PR list itself was not readable this pass. The pulls page is
client-rendered and yields no rows to an unauthenticated fetch, and the REST quota on this shared egress
IP is exhausted (0 of 60 remaining, reset 2026-11-21T09:35:51Z — read: `api.github.com/rate_limit`,
08:42Z). Open PRs are therefore carried from the last API census (0 open PRs, 2026-11-21T02:19:19Z on
#145), consistent with both defect PRs being merged and no lane branch existing on origin. The count is
re-derived from the API in the next block after reset; it is not claimed as freshly read here.

Open issues: 37 (carried from the same 02:19:19Z API census; not re-derivable until reset). Main head,
branch state and every named issue above ARE freshly read.

### Queue correction (the record outranks the carrier)

The carrier's standing-queue item 1 is partly stale and is corrected here:

- "land PR #453 (fix #443) on its gate at head" — DONE before this wake: merged 2026-11-21T01:29:46Z at
  `7d0ebfa`, #443 closed.
- "cure #442 (Size My System first-click no-op)" — DONE before this wake: PR #454 merged
  2026-11-21T02:12:15Z at `d49bc60`, #442 closed.
- Remaining live defects: **#444** (kWh/day dropdown option does not take a mouse click) and **#447**
  residue (reverse-geocode names a road, never the locality).
- Everything from Wave 0 (#436 presentation spec) onward is unchanged and still correctly ordered.

### Readiness line

- Rail: `ci/circleci: verify` green at #454's head `5682572`; the merge SHA `d49bc60` carries no result
  (CircleCI never updated the status created 02:12:20Z). The merge is tree-identical to the green head
  (`f4ba796c`), so the bytes verified are the bytes on main; the merge-SHA status is NOT claimed green.
- Production: the 2026-11-08 deploy (served stamp 20261103u). #360 drift open.
- Promotion trigger D-2026-11-13-008: NOT MET — no Jev vision audit on the current head, and the scope
  flush is not closed (#436 spec, Wave 1 and Wave 3 items all open). No promote executed.

### Push test (oversight ruling 2026-11-20, item 1)

- **PASS.** The filing committed as `b3af8dc` and pushed to the lane branch
  `freebuff/ba147e247f65fbd345f4a091` (new remote branch created at that SHA) — read: platform connected git
  push receipt, 2026-11-21T08:58Z. Git write works from this cloud session.
- First attempt used the platform's default target, which is `main`; GitHub rejected it with GH013
  "Changes must be made through a pull request" + required check `ci/circleci: verify`. Nothing was written
  to `main`; this is branch protection working as the repo intends. Every subsequent push names the lane
  branch explicitly.
- Consequence for API acts: PR creation is still an API act, and `gh` is unauthenticated here. The cure
  branch for #444 will carry its PR title/body verbatim in the next STATUS block for oversight to open.

### WAIT-STATE

- GitHub REST quota: 0/60 on this egress IP, resets 2026-11-21T09:35:51Z. Not waited on; per-issue HTML
  reads carry the census in the meantime. API re-read queued for the next block.
- CircleCI merge-SHA status on `d49bc60`: pending since 02:12:20Z (reporting gap, not a run). No poll
  loop; tree-identity is the evidence of record.

### Ladder rung

- Rung: evidence filing (this stand-up, with the push test). Next rung target: a merge — #444 cured and
  landed on its rail.

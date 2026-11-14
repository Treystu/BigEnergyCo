# Production record, corrected — 2026-11-14

Lane half of #360. Everything the owner's single act needs, and nothing that
depends on it. Read live from the surfaces in this session; not carried from an
earlier filing.

## What production actually serves

`node scripts/audit-live-surfaces.mjs` (read: that script's own stdout and its
receipt `docs/lane/data-reads/2026-11-10-live-surfaces.json`, 2026-11-14T00:2xZ):

| surface                                               | status                 | bytes   | stamp       | html sha256    |
| ----------------------------------------------------- | ---------------------- | ------- | ----------- | -------------- |
| `bigenergyco.pages.dev` (production)                  | 200                    | 125,986 | `20261103u` | `4a6cd5b3d11e` |
| `staging.bigenergyco.pages.dev`                       | 200                    | 125,986 | `20261103u` | `4a6cd5b3d11e` |
| `treystu.github.io/BigEnergyCo/`                      | 200                    | 125,986 | `20261103u` | `4a6cd5b3d11e` |
| `bigenergyco-prod.pages.dev` (fenced rollback target) | 200                    | 124,463 | `20261025b` | `258062371d9d` |
| `freeoffgridcalculator.com` (brand apex)              | **403** `cf-mitigated` | 5,520   | —           | `10654c8a61ae` |
| showcase api                                          | 200                    | 267     | —           | `2927923f9ae5` |

Ten walked paths are byte-identical across the three app surfaces
(`parity: {"identical":10,"divergent":0,"unobservable":0}`), so production and
staging are the same artifact, not two.

## The claim that is retired

`0af8e52d` is not a commit in this repository: the GitHub API returns 422 for it
and no local ref carries it. There is no promotion to attribute to it, and no
2026-11-08 promote record exists in `docs/release-ledger.jsonl` — the ledger's
last promote entry is `2026-10-02T23:44:10Z` (`6faa4d61`). Production is the
2026-11-04 Pages deploy of `21fac5f2` (stamp `20261103u`), which is what the
surfaces serve today.

## Why nothing has deployed since 2026-11-04

Every scheduled workflow since 2026-11-06 fails with `steps: []` — the jobs
never start, which is the A-08 Actions billing lock, not a code failure. The
deploy workflows are the same class: no run exists after the 2026-11-04 deploy.
This is recorded in #360 and is unchanged by this filing.

## The lane half, complete

1. Live surfaces read and attributed (above).
2. Drift chain measured against the checkout (§ `scripts/verify-staging.mjs`
   read in the #360 comment; staging serves `20261103u` while the checkout is
   `20261114b`, so the delta is every commit since `21fac5f2`).
3. Named-origin checks: the promote default origin `ghPagesPromoteDefault`
   reads **404** (`sha 70d613e3acfb`), which is #361's defect proven live; the
   brand apex reads the Cloudflare challenge, which is #328 and is an owner act.

## What remains, and it is one act

The owner's decision, filed once on #360 as DECISION-READY: authorise a
production promote of a named lane commit (behind a Jev vision audit PASS), or
keep the record as corrected above. The lane does not choose between them and
does not deploy.

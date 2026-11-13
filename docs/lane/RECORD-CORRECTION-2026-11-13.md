# Record correction - 2026-11-13: production is 21fac5f2 / 20261103u, and 0af8e52d does not exist

Lane half of [#360](https://github.com/Treystu/BigEnergyCo/issues/360). The owner
half of that issue (authorising a promote, or restoring Actions billing) stays
fenced and is not taken here.

Adds to the record; it does not reword `docs/lane/PROMOTION-READINESS-2026-11-06.md`
or `docs/lane/PROMOTION-PREP-2026-11-07.md`, which are history and are left as
written.

## 1. The claim being retired

The burn-down brief stated that production is "the 2026-11-08 promoted deployment
(`0af8e52d`)" and that "the SEO promotion already executed". Both halves are
retired by this record.

| Claim                                 | State   | Basis                                                                                                             |
| ------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `0af8e52d` is a promoted commit       | RETIRED | not a commit in this repository - see section 2                                                                   |
| production serves a 2026-11-08 deploy | RETIRED | every public surface serves the 2026-11-04 deploy of `21fac5f2` - see section 3                                   |
| the SEO promotion is verified live    | RETIRED | no surface serves an artifact newer than stamp `20261103u`, so the promotion has no observable effect - section 3 |

## 2. `0af8e52d` is not a commit in this repository

- Repository tree: `grep -rn 0af8e52d` over every tracked `.md`, `.json`, `.mjs`
  and `.jsonl` file returns zero hits (read: `grep` over the working tree at
  `64d3b91`, 2026-11-13T01:57Z).
- GitHub API: `repos/Treystu/BigEnergyCo/commits/0af8e52d` answers
  `422 "No commit found for SHA"` (read: `gh api`, 2026-11-10, recorded in #360).

An unverifiable SHA cannot carry a promotion. Nothing is attributed to it here,
and any later document that repeats it is repeating a claim with no referent.

## 3. What production actually serves: the 2026-11-04 deploy of `21fac5f2`

Fresh reads of the live surfaces, this session (read: `curl -s -o <file> -w
'%{http_code}'` plus `sha256sum` and a stamp grep of the returned body,
2026-11-13T01:59Z):

| surface                                                  | status | bytes   | home sha256 (12) | stamp       |
| -------------------------------------------------------- | ------ | ------- | ---------------- | ----------- |
| `https://bigenergyco.pages.dev/`                         | 200    | 125,986 | `4a6cd5b3d11e`   | `20261103u` |
| `https://staging.bigenergyco.pages.dev/`                 | 200    | 125,986 | `4a6cd5b3d11e`   | `20261103u` |
| `https://treystu.github.io/BigEnergyCo/`                 | 200    | 125,986 | `4a6cd5b3d11e`   | `20261103u` |
| `https://sovereign-communication.github.io/BigEnergyCo/` | 404    | 9,115   | -                | -           |

The retired origin was re-read with response headers to be sure the status was
the origin's and not a redirect artifact (read: `curl -sS -D -`, header block
`HTTP/2 404`, `content-length: 9115`, `date: Fri, 13 Nov 2026 02:01:25 GMT`).

The artifact's identity is pinned by the service worker rather than by a claim
(read: `sha256sum` of the fetched `/sw.js`, 2026-11-13T01:59Z): all three live
surfaces serve `sw.js` 4,497 B, sha256 `684c0d7d…`, which is the blob at
`21fac5f2`.

**Corrected record: production is the 2026-11-04 deployment of `21fac5f2`,
serving stamp `20261103u`. No deploy has been observed since.**

## 4. Parity is green by construction, and that is the finding

The three live surfaces are byte-identical on the home document and on `sw.js`.
A staging-to-production parity check therefore cannot fail while they share one
deployment: it reports agreement that exists because there is one artifact, not
because either surface is healthy. Parity between two surfaces is not the
question worth asking.

The question that carries information is checkout-versus-served, and it is
measured, not asserted (read: `STAGING_BASE=https://treystu.github.io/BigEnergyCo/
node scripts/check-staging-drift.mjs`, exit 1, 2026-11-13T02:02Z):

```
STAGE DRIFT index.html served — hash differs (local 00833b0e vs served 4a6cd5b3)
STAGE DRIFT ui.js served (router fix present) — hash differs (local d8e46426 vs served a170e4fc)
STAGE DRIFT run.js served (envelope diagnosis present) — hash differs (local 58407534 vs served 0f250845)
STAGE DRIFT sw.js served — hash differs (local d65e6196 vs served 684c0d7d)
STAGING LAGS main: 4 probe(s) differ.
```

Main has moved and no surface has. That is the drift worth filing, and it is the
half the lane can measure.

## 5. Why this is the lane half, and what is still fenced

Correcting a record is a documentation act inside the lane's authority. Making
production newer is not: it is a deploy, and #360 reserves that to the owner as
either (a) restoring Actions billing so `deploy.yml` / `cf-pages-deploy.yml` can
run, or (b) authorising a local `npm run promote:apply` from `main` with no CI
evidence, which the plan's D-03/B1 gate refuses. Named once, not re-argued.

## 6. What this record does not claim

It does not claim production is current, that a promotion happened, that the SEO
promotion was verified, or that staging is healthy. It claims only what the reads
above show: one artifact on three surfaces, an older stamp than `main`, and a
promoted SHA that does not exist.

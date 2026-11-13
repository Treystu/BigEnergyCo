# BEC-SEO canonical check and rail record, 2026-11-13

Lane: bec-seo. Branch: lane/seo-bd-in-w2. Base: main (untouched). Canon:
docs/plan/MASTER_PLAN.md untouched.

This file exists because the GitHub write path (pull request creation, issue
comment) and the slow-lane-ledger read were not reachable from this runner, and
a "no key found" statement is a filing defect rather than evidence. It records,
once, the literal canonical check for every documented location and what each
returned, plus the rail read on the exact head. It is not a claim that the lane
is unworkable: the push path worked, and it worked through the harness SCM tool
only.

## Canonical check output (literal, per location)

Probed from /workspace/chats/e97caa67fc09e892eeeec150 on 2026-11-13.

    harness-configured key: env | grep -iE 'ASKPASS|GIT_|SCM|HARNESS|TOKEN|SECRET|_KEY|CREDENTIAL'
      -> no output (no variable of these names is set)
    harness process environment: /proc/1/environ, /proc/1243/environ
      -> "Permission denied" (not readable from this user)
    ~/.typesafe_key
      -> "No such file or directory"
    ~/.netrc
      -> "No such file or directory"
    ~/.ssh
      -> "No such file or directory"
    ~/.config/gh (gh config)
      -> "No such file or directory"; gh 2.45.0 installed, "You are not logged into any GitHub hosts"
    /run/credentials
      -> directory present, empty (find returns the directory only)
    /run/secrets, /var/run/secrets, /etc/secrets, /secrets
      -> "No such file or directory" (all four)
    SCM ORC folder keys: find / -maxdepth 4 ( -iname '*typesafe*' -o -iname '*scm*' -o -iname '*orc*' )
      -> no SCM/ORC key directory; matches are unrelated system files
    working folder remotes: .git is a worktree pointer to /workspace/repo.git
      -> [remote "origin"] url = https://github.com/Treystu/BigEnergyCo.git, no userinfo, no credential helper
    credential helper: git config --list --show-origin | grep -i credential
      -> no output (no helper configured anywhere)
    credential fill: printf 'protocol=https\nhost=github.com\n\n' | git credential fill
      -> no password field returned
    local push: GIT_TERMINAL_PROMPT=0 git push --dry-run origin lane/seo-bd-in-w2
      -> fatal: could not read Username for 'https://github.com': terminal prompts disabled

## Verdict

WORKING: the harness SCM tool (cloud_git). It pushed
5c0e0be and c7cbac9 to lane/seo-bd-in-w2 with server-side credentials that are
not exposed to this shell and carry no API surface. That is why the same turn
could both push a branch and hold no usable GitHub API credential: the push is
the tool's, not the runner's.

NOT CHECKED, blocked by the same gap: pull request creation, issue #145
comment, and any read of Treystu/slow-lane-ledger. The ledger repository
prompts for a username on an unauthenticated clone, and the anonymous REST API
returns "API rate limit exceeded" (HTTP 403) for both repositories. The ledger
therefore was not pulled, dispatch/bec-seo/PROMPT.md and DISPATCH.md were not
read, and no DISPATCH entry past the last ack was applied in this pass. The
carrier text governed, as it does when the ledger is unreachable.

Resolving location: none on this runner. Unblock is one credential with repo
scope in the project's secrets, or those writes performed from the Harness
machine. No key was printed, and no key exists in this worktree to print.

## Rail read on the exact head (CircleCI, public API, individual statuses)

Read with curl against circleci.com/api/v1.1/project/github/Treystu/BigEnergyCo,
2026-11-13T06:30Z onwards. Named steps, never a combined status.

build 103, sha 5c0e0be38bf816f9b4a2568e1f9690a133135f11, workflow "verify",
job "verify": FAILED. Named failing step: "Offline test suite" (exit 1). Cause:
each blog article's inline style block must be byte-identical to the canonical
page, and the two new posts carried two extra rules. Fixed by removing them;
the local reproduction was tests/blog-style-invariant.test.mjs.

build 104, sha c7cbac943723026b773035520c77966726314e0e, workflow "verify",
job "verify": SUCCESS. Named steps, all success with exit 0:

    Spin up environment
    Preparing environment variables
    Checkout code
    Character encoding check
    SEO, sitemap, JSON-LD, tokens (14-gate chain)
    Code style (the runner's view: tracked files, git's line endings)
    Deployment staging check
    Offline test suite

## Status of the two items

#378 Bangladesh and #381 India are written, registered and green on the rail.
READY-TO-MERGE on lane/seo-bd-in-w2 for BEC-CODE. Not merged here; nothing was
pushed to main. The pull request itself is the one delivery step this runner
cannot perform.

## Local verification, same head

    npm run seo                exit 0
    npm test                   2199 tests, exit 0, zero failures
    npm run format:check       exit 0
    npm run deploy:check       exit 0 (staging built, not pushed)

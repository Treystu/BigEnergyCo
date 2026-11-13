// The release gate's evidence, read from the repository's actual rail.
//
// Why this module exists: `promote.mjs` gated production on GitHub Actions
// workflow runs while the repository's branch ruleset requires, and the lane
// reads, exactly one commit-status context - `ci/circleci: verify`. Those are
// two different systems, and on this repository they disagree in the worst
// possible way: Actions is billing-locked, so a run exists, starts no jobs and
// concludes `failure` (A-08), while CircleCI reports success on the same head.
//
// The promote gate therefore asked a question that could never be answered yes:
// `latestMainPushRun` could select a run whose every job never started, and
// `mainJevReleaseVerdict` then refuses it - correctly, given what it was
// handed, but about a system that is not the rail (#361's sibling defect, filed
// 2026-11-13).
//
// So the rail read lives here, named after the thing it reads, and the Actions
// leg keeps its own job: Jev evidence, which CircleCI phase 1 deliberately does
// not run (.circleci/config.yml lines 14-20). Two legs, two sources, neither
// pretending to be the other.

/** The one required context. The ruleset (23626777) names it exactly. */
export const CIRCLECI_VERIFY_CONTEXT = "ci/circleci: verify";

const newest = (entries) =>
  entries
    .slice()
    .sort(
      (a, b) =>
        (Date.parse(b.updated_at || b.created_at || "") || 0) -
        (Date.parse(a.updated_at || a.created_at || "") || 0),
    )[0] || null;

/**
 * Read the rail out of a `GET /repos/{repo}/commits/{sha}/status` payload.
 *
 * Fail-closed in every direction: a payload for another commit, a missing
 * context, a duplicate context resolved to its newest entry, and any state
 * other than `success` are all refusals with their own reason. `pending` and
 * `failure` are distinguished because "wait" and "cure it" are different
 * instructions to whoever reads the refusal.
 *
 * @param {{sha: string, payload: object|null}} input
 * @returns {{ok: true, context: string, targetUrl: string|null}
 *          | {ok: false, reason: string}}
 */
export function circleCiVerifyVerdict({ sha, payload }) {
  if (!sha) return { ok: false, reason: "no commit SHA was supplied" };
  if (!payload || typeof payload !== "object")
    return { ok: false, reason: "no commit-status payload was returned" };

  // The status API echoes `sha` on newer responses; when it does, it must be
  // the SHA we asked about. A payload about a different commit is worse than no
  // payload, because it reads green about the wrong artifact.
  if (payload.sha && payload.sha !== sha)
    return {
      ok: false,
      reason: `the status payload is for ${String(payload.sha).slice(0, 7)}, not ${sha.slice(0, 7)}`,
    };

  const entries = (Array.isArray(payload.statuses) ? payload.statuses : []).filter(
    (entry) => entry && entry.context === CIRCLECI_VERIFY_CONTEXT,
  );
  if (entries.length === 0)
    return {
      ok: false,
      reason: `no "${CIRCLECI_VERIFY_CONTEXT}" status exists on ${sha.slice(0, 7)}`,
    };

  const latest = newest(entries);
  if (latest.state !== "success")
    return {
      ok: false,
      reason: `"${CIRCLECI_VERIFY_CONTEXT}" on ${sha.slice(0, 7)} is ${latest.state || "unknown"}`,
    };

  return {
    ok: true,
    context: CIRCLECI_VERIFY_CONTEXT,
    targetUrl: latest.target_url || null,
  };
}

/**
 * Say what an empty Actions run list actually means.
 *
 * The old refusal said "no post-merge main Jev run exists for this SHA", which
 * reads as a claim about the SHA's evidence. When the account is billing-locked
 * the truth is about the mirror, and the difference matters: one is cured by
 * committing, the other cannot be cured in the repo at all.
 *
 * @param {{sha: string, runs: unknown[], statuses?: object[]}} input
 * @returns {string}
 */
export function emptyActionsRunsReason({ sha, runs, statuses = [] }) {
  const short = String(sha || "").slice(0, 7);
  const listed = Array.isArray(runs) ? runs.length : 0;
  if (listed > 0) return `${listed} run(s) returned for ${short}`;

  // A billing-locked account still reports the run, with no started jobs; a
  // perfectly idle one reports nothing at all. Distinguish by whether the head
  // carries any Actions check-run that never started - the lock's signature.
  const stalled = (Array.isArray(statuses) ? statuses : []).filter(
    (s) => s && s.state === "pending" && !s.target_url,
  ).length;
  return (
    `no GitHub Actions workflow run is recorded for ${short}. The Actions mirror is ` +
    `billing-locked (A-08), so this leg cannot be satisfied there; the repository ` +
    `rail is "${CIRCLECI_VERIFY_CONTEXT}"` +
    (stalled ? ` (${stalled} stalled status entr(ies) on the head)` : "") +
    `. A Jev verdict must be recorded by a system that can actually run it.`
  );
}

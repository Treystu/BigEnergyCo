import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CIRCLECI_VERIFY_CONTEXT,
  circleCiVerifyVerdict,
  emptyActionsRunsReason,
} from "../scripts/lib/release-rail.mjs";

const sha = "64d3b9121b1ad94cf7d9607ea840fa1524cefdef";
const passing = {
  state: "success",
  sha,
  statuses: [
    {
      context: CIRCLECI_VERIFY_CONTEXT,
      state: "success",
      target_url: "https://app.circleci.com/job/1",
      updated_at: "2026-11-12T02:00:00Z",
    },
  ],
};

test("the rail is green only on the exact required context at the exact SHA", () => {
  assert.equal(CIRCLECI_VERIFY_CONTEXT, "ci/circleci: verify");
  const verdict = circleCiVerifyVerdict({ sha, payload: passing });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.context, CIRCLECI_VERIFY_CONTEXT);
  assert.equal(verdict.targetUrl, "https://app.circleci.com/job/1");
});

test("a green context on a different commit is refused, not read as green", () => {
  const other = { ...passing, sha: "0".repeat(40) };
  const verdict = circleCiVerifyVerdict({ sha, payload: other });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /not 64d3b91/);
});

test("an absent rail context is a refusal that names the context", () => {
  const payload = {
    state: "success",
    sha,
    statuses: [{ context: "some/other-check", state: "success" }],
  };
  const verdict = circleCiVerifyVerdict({ sha, payload });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /no "ci\/circleci: verify" status/);
});

test("pending and failure are refusals with different reasons", () => {
  for (const state of ["pending", "failure"]) {
    const payload = {
      state,
      sha,
      statuses: [{ context: CIRCLECI_VERIFY_CONTEXT, state }],
    };
    const verdict = circleCiVerifyVerdict({ sha, payload });
    assert.equal(verdict.ok, false);
    assert.match(verdict.reason, new RegExp(`is ${state}`));
  }
});

test("a repeated context resolves to its newest entry", () => {
  const payload = {
    state: "success",
    sha,
    statuses: [
      {
        context: CIRCLECI_VERIFY_CONTEXT,
        state: "failure",
        updated_at: "2026-11-12T01:00:00Z",
      },
      {
        context: CIRCLECI_VERIFY_CONTEXT,
        state: "success",
        updated_at: "2026-11-12T03:00:00Z",
      },
    ],
  };
  assert.equal(circleCiVerifyVerdict({ sha, payload }).ok, true);
});

test("no payload and no SHA are both refusals", () => {
  assert.equal(circleCiVerifyVerdict({ sha, payload: null }).ok, false);
  assert.equal(circleCiVerifyVerdict({ sha: "", payload: passing }).ok, false);
});

test("an empty Actions run list is reported as the mirror, not as missing evidence", () => {
  const reason = emptyActionsRunsReason({ sha, runs: [] });
  assert.match(reason, /billing-locked/);
  assert.match(reason, /ci\/circleci: verify/);
  assert.doesNotMatch(reason, /^no post-merge main Jev run exists/);
  // A non-empty list is not this case, and says so.
  assert.match(
    emptyActionsRunsReason({ sha, runs: [{}] }),
    /1 run\(s\) returned/,
  );
});

test("promote's release gate reads the rail as its own leg", () => {
  // The defect this pins: the gate asked Actions about a CircleCI-gated
  // repository, so it could never pass on the rail the ruleset requires.
  const source = readFileSync(
    join(process.cwd(), "scripts", "promote.mjs"),
    "utf8",
  );
  assert.match(source, /release-rail\.mjs/);
  assert.match(source, /circleCiVerifyVerdict/);
  assert.match(source, /commits\/\$\{sha\}\/status/);
});

// Ledger session upload: append this session to the lane session file and
// rewrite dispatch/<lane>/STATUS.md, both by contents API, both read back.
import { execFileSync } from "node:child_process";

const REPO = "Treystu/slow-lane-ledger";
const SESSION =
  "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";

function api(args) {
  return execFileSync("gh", ["api", ...args], {
    encoding: "utf8",
    maxBuffer: 32 << 20,
  });
}

function readFile(path) {
  const res = JSON.parse(api([`repos/${REPO}/contents/${path}`]));
  return {
    text: Buffer.from(res.content, "base64").toString("utf8"),
    sha: res.sha,
  };
}

function writeFile(path, text, sha, message) {
  const payload = {
    message,
    content: Buffer.from(text, "utf8").toString("base64"),
  };
  if (sha) payload.sha = sha;
  const out = execFileSync(
    "gh",
    ["api", "--method", "PUT", `repos/${REPO}/contents/${path}`, "--input", "-"],
    { encoding: "utf8", input: JSON.stringify(payload), maxBuffer: 32 << 20 },
  );
  return JSON.parse(out);
}

const session = readFile(SESSION);
const addition = [
  "",
  "## Session 2026-11-11 (afternoon) - queue items 4, 3, 6 closed; head ca1a13bf",
  "",
  "Lane repo head: `ca1a13bf` on `lane/finish` (pushed).",
  "",
  "### Closed this session",
  "",
  "- **#365 byte leg.** `js_to_first_result` 204.2 KB -> **199.6 KB** against the 200.0 KB",
  "  line, no regression. Lever: comment prose in `ui.js` (80.4 KB of the metric, 90 KB of",
  "  its raw bytes), 62 blocks rewritten coherently + 32 compressed to their first",
  "  sentence. Verified comment-only by script (`non_comment_lines_touched 0`; brotli",
  "  82,359 -> 78,048). Filed: #365 c.6791759755.",
  "- **#363 plan drift.** Counts re-read directly (7 locales, 221 registry files), matching",
  "  the filed amendment text, so amendment **A-008** was appended and the plan re-pinned",
  "  (`e89ebe0b` -> `68aa4b78`); `plan:check` OK. Commit `618914a1`. Issue closed.",
  "  Filed: #363 c.6791789859.",
  "- **PR #342** dispositioned and closed as superseded per DIGEST 8, with its one",
  "  worth-keeping piece (the byte-budget trim) lifted and measured on the lane.",
  "  Filed: #342 c.6791791488.",
  "",
  "### Battery on the head (each gate run individually)",
  "",
  "- `npm test` 2197/2197, exit 0",
  "- `npm run seo` exit 0 (stamp 20261111b, 62 referenced assets verified)",
  "- `check-chars` 0, `format:check` 0, `plan:check` OK",
  "- `check-byte-budgets`: js_to_first_result 199.6/200.0 improved; 0 regressions",
  "",
  "### Still open (in order)",
  "",
  "1. PR #330 merge: parked DECISION-READY on the `code_scanning` rule (CodeQL runs only in",
  "   Actions, which is billing-locked). Ruleset required contexts are already",
  "   `ci/circleci: verify` only. Nothing else blocks the merge.",
  "2. PR #344 (dependabot npm group): CircleCI Pipeline error, `No configuration was found",
  "   in your project`, on a branch that is ahead 1 / behind 0 of main - disposition filed.",
  "3. #366 V7 blog program (SEO-1): precursor Trends validation, then the publish-first 5.",
  "4. #364 advisor CORS on preview origins; #328 apex 403; #360/#361/#362 drift items;",
  "   #345 Champion-audit rows (#347, #352-#358) classified through the Lucas Gate.",
  "",
].join("\n");

const sessionWritten = writeFile(
  SESSION,
  session.text + addition,
  session.sha,
  "session: bigenergyco 2026-11-11 afternoon - #365, #363, #342 closed at ca1a13bf",
);

const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- Lane head: ca1a13bf (lane/finish), pushed; battery green on that tree (2197/2197)",
  "- Current item: #366 V7 SEO program (queue item 5); PR #330 parked DECISION-READY on the code_scanning rule",
  "- Closed this session: #365 byte leg (199.6 KB / 200.0 KB), #363 (A-008 + re-pin), PR #342 (superseded)",
  "- Burn line: items closed 3 this session; lane commits 2; filings 3",
  "",
].join("\n");

const status = readFile(STATUS);
const statusWritten = writeFile(
  STATUS,
  statusText,
  status.sha,
  "status: bigenergyco - head ca1a13bf, #365/#363/#342 closed, next #366",
);

console.log(
  JSON.stringify(
    {
      session_commit: sessionWritten.commit?.sha ?? null,
      status_commit: statusWritten.commit?.sha ?? null,
    },
    null,
    2,
  ),
);

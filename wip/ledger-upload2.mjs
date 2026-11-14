// Session-end ledger writes for the continuation session (#366 wave 1).
import { execFileSync } from "node:child_process";

const REPO = "Treystu/slow-lane-ledger";
const SESSION = "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";

function api(args, input) {
  return execFileSync("gh", ["api", ...args], {
    encoding: "utf8",
    input,
    maxBuffer: 32 << 20,
  });
}
function get(path) {
  const res = JSON.parse(api([`repos/${REPO}/contents/${path}`]));
  return { text: Buffer.from(res.content, "base64").toString("utf8"), sha: res.sha };
}
function put(path, text, sha, message) {
  const payload = { message, content: Buffer.from(text, "utf8").toString("base64") };
  if (sha) payload.sha = sha;
  const out = api(
    ["--method", "PUT", `repos/${REPO}/contents/${path}`, "--input", "-"],
    JSON.stringify(payload),
  );
  return JSON.parse(out).commit.sha;
}

const addition = [
  "",
  "## Session 2026-11-11 (continuation) - #330 merged, wave-1 begins",
  "",
  "Lane head: `2b98c09a` on `lane/finish`. Standing draft PR: #373.",
  "",
  "### Merged this session",
  "",
  "- **PR #330 SQUASH-MERGED to main at `5c1a74d6`**, after the owner's decision comment",
  "  (c.6791838431) removed the `code_scanning` rule. No `--admin`, no bypass. Post-merge",
  "  on main: `npm test` 2197/2197, `npm run seo` exit 0 at stamp `20261111b`.",
  "- **Ruleset 23626777 read back**: rules `pull_request, required_status_checks,",
  "  non_fast_forward, deletion`; required contexts `ci/circleci: verify` only.",
  "- **main now carries `.circleci/config.yml`**, which is the root cause filed on #344 -",
  "  before today the config existed only on the lane branch, so every dependabot PR cut",
  "  from main got `Pipeline error: No configuration was found`. Rebase requested on #344.",
  "",
  "### Filed and worked",
  "",
  "- **#366 wave 1 filed as five issues**: #368 South Africa (EN), #369 Spain (ES),",
  "  #370 Romania (RO), #371 Poland (PL), #372 Vietnam (VI).",
  "- **#368 landed** (`793d6ec7`): `blog/eskom-fixed-charge-solar-2027/`, NERSA's 26 Nov",
  "  2026 decision on Eskom's FY2028 structure. Every figure sourced; the honest finding is",
  "  that the bill cut falls from 65% to 61% when the fixed line rises.",
  "- **#369 landed**: `blog/deduccion-irpf-autoconsumo-2026/`, RDL 7/2026's new 20%",
  "  self-consumption deduction requiring completion and payment in 2026. Base limit left",
  "  as a stated gap rather than guessed.",
  "- **#371 landed**: `blog/dotacja-magazyn-energii-2026/`, NFOŚiGW PME 2 with the 2x-PV",
  "  capacity rule and the 800 PLN/kWh cap binding before the 30% share.",
  "- Both new posts registered in sitemap, llms.txt, RSS, hub card + BlogPosting and the",
  "  deploy allowlist, which `npm run seo` enforces.",
  "",
  "### Battery on `2b98c09a` (each gate run individually)",
  "",
  "- `npm run seo` exit 0; `format:check` OK (1430 tracked files); `check-chars` exit 0",
  "- `npm test` 2197/2197, exit 0",
  "",
  "### Still open (queue order)",
  "",
  "1. #370 Romania (RO) and #372 Vietnam (VI): facts owed, then written.",
  "2. #364 advisor CORS on the preview origins; #328 apex 403; #360/#361/#362 drift.",
  "3. #345 Champion rows (#347, #352-#358) to classify through the Lucas Gate.",
  "4. #366 Dec-Jan wave (4) and Q1-2027 wave (9), plus the Trends precursor read.",
  "",
].join("\n");

const session = get(SESSION);
const sessionSha = put(
  SESSION,
  session.text + addition,
  session.sha,
  "session: bigenergyco 2026-11-11 - #330 merged, wave-1 posts for ZA/ES/PL",
);

const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- Lane head: 2b98c09a (lane/finish); standing draft PR #373; main at 5c1a74d6",
  "- Current item: #366 wave 1 - #370 Romania and #372 Vietnam remain of the publish-first five",
  "- Closed this session: PR #330 merged; #368, #369, #371 posts landed; #342 closed; #363 applied",
  "- Burn line: items closed 6 (1 PR merged, 3 posts landed, 2 issues applied/closed); lane commits 3",
  "",
].join("\n");

const status = get(STATUS);
const statusSha = put(
  STATUS,
  statusText,
  status.sha,
  "status: bigenergyco - #330 merged at 5c1a74d6, wave-1 ZA/ES/PL landed",
);

console.log(JSON.stringify({ session_commit: sessionSha, status_commit: statusSha }, null, 2));

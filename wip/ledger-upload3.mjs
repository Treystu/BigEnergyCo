// Session-end ledger writes, part 2: Romania/Vietnam posts + Champion finding.
import { execFileSync } from "node:child_process";

const REPO = "Treystu/slow-lane-ledger";
const SESSION = "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";

const api = (args, input) =>
  execFileSync("gh", ["api", ...args], {
    encoding: "utf8",
    input,
    maxBuffer: 32 << 20,
  });
const get = (path) => {
  const r = JSON.parse(api([`repos/${REPO}/contents/${path}`]));
  return { text: Buffer.from(r.content, "base64").toString("utf8"), sha: r.sha };
};
const put = (path, text, sha, message) => {
  const p = { message, content: Buffer.from(text, "utf8").toString("base64") };
  if (sha) p.sha = sha;
  return JSON.parse(
    api(["--method", "PUT", `repos/${REPO}/contents/${path}`, "--input", "-"], JSON.stringify(p)),
  ).commit.sha;
};

const addition = [
  "",
  "### Wave 1 completed: all five markets posted (head `92162ab5`)",
  "",
  "- **#370 Romania landed**: `blog/program-afm-baterii-2026/`. AFM guide",
  "  (Ordinul 1.904/11.09.2026) with the 6 November calendar update: 400 mn lei,",
  "  75% / 15,000 lei cap against a 1,500 lei/kWh eligible-cost standard, installer",
  "  validation 16-20 Nov, household window 20 Nov 10:00 to 25 Nov 23:59. The",
  "  finding: the capacity score saturates at 20 kWh, so larger banks earn nothing.",
  "- **#372 Vietnam landed**: `blog/gia-dien-5-bac-2026/`. Quyet dinh 2892/QD-BCT",
  "  of 31 Oct 2026, in force 1 Nov: five tiers 1,901 / 2,289 / 2,894 / 3,456 /",
  "  3,844 VND per kWh excl. VAT, average 2,159.9037. A 350 kWh bill works out at",
  "  853,100 VND before VAT, a real average of ~2,437 - above the headline average.",
  "",
  "Battery on `92162ab5`: `npm run seo` 0, `format:check` OK (1432 files),",
  "`check-chars` 0, `npm test` 2197/2197. `ci/circleci: verify` still pending at the",
  "final read, so the standing PR #373 merge is waiting on CircleCI, not on a line.",
  "",
  "### Champion Audit: first measured defect (#347 -> #374)",
  "",
  "Ran `scripts/champion-audit-sizeForBillCut.mjs`. Seven of eight corpus cases are",
  "at or below the 2% regret bar; **Nairobi f=1.20 physical-surplus is 5.19%** -",
  "champion 1.45 kW + 4 kWh at $1,966 against a $1,869 lattice point. Cause, at the",
  "source: the binary search assumes imports fall monotonically in PV, but the",
  "no-credit surplus branch also requires a curtailed-energy floor, so feasibility",
  "is an interval and the smallest sufficient PV is not the cheapest. Filed as #374",
  "with the cure scoped to that one branch. Label mismatch across the corpus stays",
  "at 0.45 pp, under the 0.5 pp bar.",
  "",
  "### Queue state at close",
  "",
  "- Wave 1: five issues, five posts, all receipts filed. Closing follows the merge.",
  "- #364: cure on the branch, residual is one worker deploy (live API change).",
  "- #361: owner call - which origin is staging; the issue stays decision-ready.",
  "- #362: needs an owner-approved amendment to put D-21/R-CF in the plan, or an",
  "  AGENTS.md retraction; either is the owner's call, filed once.",
  "- #360: record corrected from live reads; the promote itself is the owner step.",
  "- #345 row #347: measured, challenger qualifies, cure scoped in #374.",
  "",
].join("\n");

const session = get(SESSION);
const sessionCommit = put(
  SESSION,
  session.text + addition,
  session.sha,
  "session: bigenergyco 2026-11-11 - wave 1 complete (5 markets), Champion #347 measured",
);

const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- Lane head: 92162ab5 (lane/finish); standing draft PR #373; main at 5c1a74d6",
  "- Current item: waiting on ci/circleci: verify for #373, then close #368-#372",
  "- Closed this session: PR #330 merged; #342 closed; #363 applied; five wave-1 posts landed",
  "- Burn line: items closed 6; posts landed 5; issues filed 6 (#368-#372, #374); lane commits 4",
  "",
].join("\n");

const status = get(STATUS);
const statusCommit = put(
  STATUS,
  statusText,
  status.sha,
  "status: bigenergyco - wave 1 complete, PR #373 awaiting CircleCI",
);

console.log(JSON.stringify({ sessionCommit, statusCommit }, null, 2));

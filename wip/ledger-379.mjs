import { execFileSync } from "node:child_process";
const REPO = "Treystu/slow-lane-ledger";
const api = (a, input) =>
  execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });

const sessionPath = "evidence/lane-sessions/bigenergyco/2026-11-12-session.md";
const session = `# Session - bigenergyco - 2026-11-12

## DONE
- #380 Australia (en-AU): blog/stc-deeming-period-2027-australia/. Item 2ca7bf3e,
  merge bc52a0f9, landed f6e580d4 via PR #377. Gates on head: seo 0, format 0,
  chars 0, npm test 2199/2199, ci/circleci: verify success. Post-merge main green.
- #379 Brazil (pt-BR): blog/fio-b-75-2027-brasil/. Item e55d7073, landed 64d3b912 via
  PR #382. Same battery green on the exact head, and on main after the merge.
- Two defects found and cured in e55d7073: the AU post shipped with the South Africa
  related links and Eskom FAQ inherited from the template; and neither article carried
  its locale in JSON-LD (the generator replace had no match). Swept all posts - no
  other page carries the wrong market's tail.
- PROSE_CEILING 485 -> 510 (#380) and 510 -> 546 (#379), each the exact measured
  block delta, recorded at the constant.
- New standing draft opened after each landing: #382, then #383? (see STATUS).

## WIP
- None open on the lane branch; main and lane are level at 64d3b912.

## NEXT
- #378 Bangladesh: facts still unverified (BDT slabs, net-metering credit, the 2026
  budget's treatment of rooftop). Needs a primary read of the tariff order and the
  net-metering guideline before any post.
- #381 India: PM Surya Ghar amounts (30,000/kW to 2 kW, 18,000 third kW, cap 78,000)
  need a re-read of the scheme guideline before use.
- #345 rows #352-#358 remain unmeasured; #360-#362, #364 owner-reserved.

## BLOCKERS
- None. CircleCI is the only reporting gate; Actions remain the 8/8 billing lock.

## DIRECTIVES
- None new from Treystu this session.
`;
const put = (path, text, message) => {
  let sha;
  try {
    sha = JSON.parse(api([`repos/${REPO}/contents/${path}`])).sha;
  } catch {}
  const body = { message, content: Buffer.from(text, "utf8").toString("base64") };
  if (sha) body.sha = sha;
  return JSON.parse(
    api(["--method", "PUT", `repos/${REPO}/contents/${path}`, "--input", "-"], JSON.stringify(body)),
  ).commit.sha;
};

console.log("session:", put(sessionPath, session, "evidence: bigenergyco session 2026-11-12 (#379 landed)"));

const STATUS = "dispatch/bigenergyco/STATUS.md";
const status = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-12-session.md",
  "- main: 64d3b912. Lane: level with main; standing draft reopened for wave 3 residual work.",
  "- Current item: #378 Bangladesh (facts unverified) and #381 India (scheme amounts to re-read); #345 rows #352-#358 unmeasured.",
  "- Closed this session: #380 (f6e580d4), #379 (64d3b912).",
  "- Burn line: 2 items closed, 0 new issues, 2 landings to main (f6e580d4, 64d3b912), 2 defects found and cured in-commit.",
  "",
].join("\n");
console.log("status:", put(STATUS, status, "status: bigenergyco - #379 landed, main 64d3b912"));

import { execFileSync } from "node:child_process";
const REPO = "Treystu/slow-lane-ledger";
const api = (a, input) =>
  execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });

const sessionPath = "evidence/lane-sessions/bigenergyco/2026-11-12-session.md";
const session = `# Session - bigenergyco - 2026-11-12

## DONE
- #380 Australia (en-AU) post: blog/stc-deeming-period-2027-australia/, registered in
  sitemap/llms/RSS/hub+BlogPosting/deploy allowlist. Commit 2ca7bf3e, merge resolution
  bc52a0f9, landed f6e580d4 via PR #377.
- Gates on 2ca7bf3e: seo 0, format 0, chars 0, npm test 2199/2199, ci/circleci: verify success.
- Post-merge main f6e580d4: seo 0, format 0, chars 0, npm test 2199/2199.
- Two cures at cause: hreflang en-AU -> en (seo rule), blog file LF -> CRLF (style invariant).
- PROSE_CEILING 485 -> 510 with the measured 25-block delta recorded at the constant.
- New standing draft PR #382 (lane/finish, wave 3).

## WIP
- #379 Brazil: Lei 14.300 art. 27 verified from the law text (60% in 2026, 75% from
  1 Jan 2027, 90% 2028, art. 17 rule from 2029; art. 26 protects until 31 Dec 2045).
  Post not written.
- #378 Bangladesh: facts unverified. #381 India: PM Surya Ghar figures to reverify.

## NEXT
- Write #379 from the verified art. 27 ladder, then #378/#381 after fact reads.
- #345 rows #352-#358 still unmeasured.

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

console.log("session:", put(sessionPath, session, "evidence: bigenergyco session 2026-11-12 (#380 landed)"));

const STATUS = "dispatch/bigenergyco/STATUS.md";
const status = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-12-session.md",
  "- main: f6e580d4. Lane head: lane/finish on standing draft PR #382 (wave 3).",
  "- Current item: #379 Brazil post (art. 27 ladder verified), then #378 and #381.",
  "- Closed this session: #380. Closed earlier in the wave: #330, #342, #344, #363, #365, #367, #368-#372, #374.",
  "- Burn line: 1 item closed, 0 new filings, 4 lane commits, one landing to main (f6e580d4).",
  "",
].join("\n");
console.log("status:", put(STATUS, status, "status: bigenergyco - #380 landed, wave 3 standing draft #382"));

// Session end: ledger session append + STATUS rewrite for the #374 landing.
import { execFileSync } from "node:child_process";

const REPO = "Treystu/slow-lane-ledger";
const SESSION = "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";

const api = (a, input) =>
  execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });
const get = (p) => {
  const r = JSON.parse(api([`repos/${REPO}/contents/${p}`]));
  return { text: Buffer.from(r.content, "base64").toString("utf8"), sha: r.sha };
};
const put = (p, text, sha, message) => {
  const body = { message, content: Buffer.from(text, "utf8").toString("base64") };
  if (sha) body.sha = sha;
  return JSON.parse(
    api(["--method", "PUT", `repos/${REPO}/contents/${p}`, "--input", "-"], JSON.stringify(body)),
  ).commit.sha;
};

const add = `
### #374 cured: the returned system is priced at its true PV boundary

Head \`15e51add\` on \`lane/finish\`; PR #375.

The champion audit's one breach is closed. The row loop ranked battery rows on a
0.25 kW bracket and reported the bracket's upper end, so the delivered system was
priced up to a quarter-kilowatt of PV above the feasible boundary - on Nairobi
f=1.20 that showed $1,967 for a $1,904 pick. The refinement step now resolves to
0.01 kW before the returned system is priced; the lattice, envelopes and every
constraint definition are untouched.

Rejected on the way: refining every row (it reaches the $1,869 lattice optimum but
stops the #155 oversize adoption firing, a behaviour change in another mechanism
with no evidence behind it). That trade is written into the code comment so the
next reader does not redo it blind.

Corpus: max regret 5.19% -> 1.93% (bar 2%), label mismatch 0.4222 pp (bar 0.5),
every other regime improved. Nairobi's residual 35 dollars is stated on the issue
rather than rounded off.

Rails on \`15e51add\`: \`npm test\` 2197/2197 exit 0, \`npm run seo\` 0,
\`format:check\` OK (1432 files), \`check-chars\` 0. Two independent checks on the
claim: the 8-case corpus replay and the full suite including the #348 oracle
invariant and the no-swap adoption test.

### Also landed this stretch

- PR #367 (dependabot, npm group) merged at \`d25452cd\`; post-merge \`npm test\`
  2197/2197 on main.
- Asset stamp bumped to \`20261111c\` for the engine change, because \`/assets/*\`
  is immutable for a year and a changed file with the old token is invisible to
  returning visitors.

### Queue after this

1. #366 wave 2 (Dec-Jan, 4 posts) and wave 3 (Q1, 9) plus the Trends precursor read.
2. #345 remaining Champion rows (#352-#358): each needs its measurement run first.
3. Owner-reserved, unchanged and named once: #364 worker deploy, #361 staging
   origin, #362 amendment, #360 promote.
`;

const s = get(SESSION);
const session = put(
  SESSION,
  s.text + add,
  s.sha,
  "session: bigenergyco 2026-11-11 - #374 cured at 15e51add, regime regret 5.19% -> 1.93%",
);

const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- main: d25452cd. Lane head: 15e51add on lane/finish; standing draft PR #375.",
  "- Current item: #374 cure green on the branch (max regret 1.93%), waiting on ci/circleci: verify for the merge.",
  "- Closed this session: #330 merged, #342, #344 dispositioned, #363 applied, #365 byte leg, #368-#372, #367 merged.",
  "- Burn line: 13 items closed, 1 Champion defect filed and cured (#374), 7 filings, lane commits 7.",
  "",
].join("\n");

const st = get(STATUS);
const status = put(
  STATUS,
  statusText,
  st.sha,
  "status: bigenergyco - #374 cured, PR #375 green pending CircleCI",
);

console.log(JSON.stringify({ session, status }, null, 2));

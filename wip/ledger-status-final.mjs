import { execFileSync } from "node:child_process";
const REPO = "Treystu/slow-lane-ledger";
const SESSION = "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";
const api = (a, input) => execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });
const get = (p) => { const r = JSON.parse(api([`repos/${REPO}/contents/${p}`])); return { text: Buffer.from(r.content, "base64").toString("utf8"), sha: r.sha }; };
const put = (p, text, sha, message) => { const body = { message, content: Buffer.from(text, "utf8").toString("base64") }; if (sha) body.sha = sha; return JSON.parse(api(["--method", "PUT", `repos/${REPO}/contents/${p}`, "--input", "-"], JSON.stringify(body))).commit.sha; };

const add = `
### LANDED: PR #373 squash-merged to main at \`d4ba87dd\`

Post-merge battery on main, cold, 2026-11-11: \`npm run seo\` 0,
\`check-chars\` 0, \`npm test\` 2197/2197. Five posts now on main; #368-#372
closed on that receipt. Lane branch pushed with the refreshed audit read.
`;
const s = get(SESSION);
const sc = put(SESSION, s.text + add, s.sha, "session: bigenergyco 2026-11-11 - #373 landed at d4ba87dd");

const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- main: d4ba87dd (PR #373 landed). Lane head: 92162ab5 + audit-read commit.",
  "- Current item: wave 1 closed; next is the Dec-Jan wave or the #374 sizing cure.",
  "- Open, owner-reserved (named once each): #364 worker deploy, #361 staging origin, #362 amendment, #360 promote.",
  "- Burn line: closed 11 (#330 merged, #342, #344 dispositioned, #363 applied, #365, #368-#372), filed 6.",
  "",
].join("\n");
const st = get(STATUS);
const stc = put(STATUS, statusText, st.sha, "status: bigenergyco - #373 landed, wave 1 closed");
console.log(JSON.stringify({ session: sc, status: stc }, null, 2));

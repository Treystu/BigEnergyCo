import { execFileSync } from "node:child_process";
const REPO = "Treystu/slow-lane-ledger";
const SESSION = "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";
const api = (a, input) => execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });
const get = (p) => { const r = JSON.parse(api([`repos/${REPO}/contents/${p}`])); return { text: Buffer.from(r.content, "base64").toString("utf8"), sha: r.sha }; };
const put = (p, text, sha, message) => { const b = { message, content: Buffer.from(text, "utf8").toString("base64") }; if (sha) b.sha = sha; return JSON.parse(api(["--method", "PUT", `repos/${REPO}/contents/${p}`, "--input", "-"], JSON.stringify(b))).commit.sha; };
const add = `
### LANDED: PR #375 merged to main at \`4210a245\`

The #374 cure is on main. Post-merge battery on main, cold: \`npm run seo\` 0,
\`check-chars\` 0, \`npm test\` 2197/2197. #374 closed on that receipt.
`;
const s = get(SESSION);
const sc = put(SESSION, s.text + add, s.sha, "session: bigenergyco 2026-11-11 - #374 merged at 4210a245");
const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- main: 4210a245 (PR #375). Lane branch needs a fresh push for the next standing draft PR.",
  "- Current item: #366 wave 2 (Dec-Jan, 4 posts) is next; #345 rows #352-#358 behind it.",
  "- Closed this session: #330, #342, #344, #363, #365 byte leg, #367, #368-#372, #374.",
  "- Burn line: 14 items closed, 7 filings, lane commits 7, two landings to main.",
  "",
].join("\n");
const st = get(STATUS);
const stc = put(STATUS, statusText, st.sha, "status: bigenergyco - #374 landed at 4210a245");
console.log(JSON.stringify({ session: sc, status: stc }, null, 2));

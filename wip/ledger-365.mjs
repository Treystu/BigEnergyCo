import { execFileSync } from "node:child_process";
const REPO = "Treystu/slow-lane-ledger";
const SESSION = "evidence/lane-sessions/bigenergyco/2026-11-11-session.md";
const STATUS = "dispatch/bigenergyco/STATUS.md";
const api = (a, input) => execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });
const get = (p) => { const r = JSON.parse(api([`repos/${REPO}/contents/${p}`])); return { text: Buffer.from(r.content, "base64").toString("utf8"), sha: r.sha }; };
const put = (p, text, sha, message) => { const b = { message, content: Buffer.from(text, "utf8").toString("base64") }; if (sha) b.sha = sha; return JSON.parse(api(["--method", "PUT", `repos/${REPO}/contents/${p}`, "--input", "-"], JSON.stringify(b))).commit.sha; };

const add = `
### #365 CLOSED on measurement: 4 of 156 -> 0 of 156 English-only

Landed as PR #376, merge \`051fdbb0\`, on main.

Re-measuring before editing changed the job: the carried text said "25 of 85", the
live Spanish drive on the built artifact found **4 of 156**, because the first E13
pass (result-copy.js, in #330) had already keyed four of the five named clusters.
What remained was the tilt guide and one suffix, plus the sun-path SVG's title -
English-only for accessibility readers and not visible to the sentence scan.

Cure: \`assets/js/shared/tilt-copy.js\`, nine strings in seven locales, spread into
LOCALES beside RESULT_COPY and rendered through t(). After: 156 sentences,
0 English-only. \`js_to_first_result\` 199.4 KB against the 200.0 limit, improved;
no limit raised.

Two harness gaps surfaced on the first run and were fixed by widening the gates:
the English-key scan parsed only result-copy.js, and the banned-value sandbox
copied locales.js without its new import. A parity test now covers the family in
every locale.

Rails on \`051fdbb0\` and on main: seo 0, format OK, chars 0, npm test 2199/2199.
CircleCI verify passed on \`4575946c\` before the merge.

Scope note recorded on the issue: the polar and equatorial takeaways are covered
by the table and the placeholder test, not by a rendered drive at those latitudes.
`;

const s = get(SESSION);
const session = put(SESSION, s.text + add, s.sha, "session: bigenergyco 2026-11-11 - #365 closed, 0 English-only sentences, 199.4 KB");

const statusText = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- main: 051fdbb0 (PR #376). Lane head: standing-draft marker; draft PR carries the next item.",
  "- Current item: #366 wave 2 (Dec-Jan, four posts); #345 rows #352-#358 behind it.",
  "- Closed this session: #330 merged, #342, #344 dispositioned, #363 applied, #365 both legs, #367, #368-#372, #374.",
  "- Burn line: 15 items closed, 7 filings, 9 lane commits, four landings to main (d4ba87dd, d25452cd, 4210a245, 051fdbb0).",
  "",
].join("\n");
const st = get(STATUS);
const stc = put(STATUS, statusText, st.sha, "status: bigenergyco - #365 closed at 051fdbb0");
console.log(JSON.stringify({ session, status: stc }, null, 2));

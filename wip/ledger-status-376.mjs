import { execFileSync } from "node:child_process";
const REPO = "Treystu/slow-lane-ledger";
const STATUS = "dispatch/bigenergyco/STATUS.md";
const api = (a, input) => execFileSync("gh", ["api", ...a], { encoding: "utf8", input, maxBuffer: 32 << 20 });
const r = JSON.parse(api([`repos/${REPO}/contents/${STATUS}`]));
const sha = r.sha;
const text = [
  "# Status - bigenergyco (lane-maintained)",
  "",
  "- Last acked dispatch: FED-2026-11-10-1 (with GENESIS, AMEND-2026-11-10-1, SEO-1, UNBLOCK-2026-11-10-1)",
  "- Last session file: evidence/lane-sessions/bigenergyco/2026-11-11-session.md",
  "- main: 4210a245. Lane head: 7846052e on lane/finish; standing draft PR #376 (marker, no content yet).",
  "- Current item: #366 wave 2 (Dec-Jan, four posts), facts to reverify first; #345 rows #352-#358 behind it.",
  "- Closed this session: #330, #342, #344, #363, #365 byte leg, #367, #368-#372, #374.",
  "- Burn line: 14 items closed, 7 filings, 7 lane commits, three landings to main (d4ba87dd, d25452cd, 4210a245).",
  "",
].join("\n");
const body = { message: "status: bigenergyco - standing draft #376 open after the #375 landing", content: Buffer.from(text, "utf8").toString("base64"), sha };
console.log(JSON.parse(api(["--method", "PUT", `repos/${REPO}/contents/${STATUS}`, "--input", "-"], JSON.stringify(body))).commit.sha);

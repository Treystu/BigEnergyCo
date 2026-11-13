// #363: apply the filed factual-correction amendment and re-pin the plan.
// Reads, edits, re-hashes, appends the amendment + ledger row, rewrites the lock.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";

const sha = (text) =>
  createHash("sha256")
    .update(String(text).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n"), "utf8")
    .digest("hex");

const PLAN = "docs/plan/MASTER_PLAN.md";
const LOCK = "docs/plan/PLAN.lock.json";
const AMEND = "docs/plan/AMENDMENTS.md";
const LEDGER = "docs/plan/LEDGER.jsonl";

const beforeText = readFileSync(PLAN, "utf8");
const before = sha(beforeText);
const lock = JSON.parse(readFileSync(LOCK, "utf8"));
if (lock.current_sha256 !== before) {
  console.error(`ABORT: plan hash ${before} != lock ${lock.current_sha256}`);
  process.exit(1);
}

const edits = [
  ["220 per-country place files", "221 per-country registry files"],
  [
    "6 locales, with `ar` the only RTL one.",
    "7 locales (`en`, `es`, `pt`, `fr`, `de`, `nl`, `ar`), with `ar` the only RTL one.",
  ],
  ["The place database covers 220 countries", "The place database covers 221 countries"],
];

let plan = beforeText;
for (const [from, to] of edits) {
  const hits = plan.split(from).length - 1;
  if (hits !== 1) {
    console.error(`ABORT: "${from}" appears ${hits}x (need exactly 1)`);
    process.exit(1);
  }
  plan = plan.replace(from, to);
}
const after = sha(plan);
if (after === before) {
  console.error("ABORT: plan text unchanged");
  process.exit(1);
}
writeFileSync(PLAN, plan);
console.log(`plan ${before.slice(0, 12)} -> ${after.slice(0, 12)}`);

const entry = [
  "",
  "## A-008: Plan alignment - locale and registry counts corrected to the measured tree",
  "",
  "- Date: 2026-11-11",
  "- Approved-by: @Treystu (standing prompt, queue item 6: verify the filed count by direct count, then append this amendment as a factual correction and re-pin)",
  `- Plan-SHA256-before: ${before}`,
  `- Plan-SHA256-after: ${after}`,
  "- Sections: Coverage of the world (section 2 table row); F-09",
  "- Rationale: Two counts in the plan were stale against primary reads, filed with evidence on issue #363 (receipt docs/lane/data-reads/2026-11-10-live-surfaces.json). Measured 2026-11-11 on the lane tree: LOCALES has 7 key-complete locales (en, es, pt, fr, de, nl, ar) and assets/data/registry/countries/ holds 221 ISO-3166-1 alpha-2 files, no index file. The Coverage-of-the-world row now reads \"221 per-country registry files\" and \"7 locales (en, es, pt, fr, de, nl, ar), with ar the only RTL one\"; F-09 now reads \"covers 221 countries\". Nothing else in the plan changes: the program-scope lines that still say six locales (Q-13, F-42, P6.9, P7.4, P8.1, P9.1) state a delivery scope, not a count of what ships, and are left for their own amendment if the owner widens scope. Re-pinned in the same change.",
  "",
].join("\r\n");
appendFileSync(AMEND, entry);

lock.current_sha256 = after;
writeFileSync(LOCK, JSON.stringify(lock, null, 2) + "\n");

appendFileSync(
  LEDGER,
  JSON.stringify({
    ts: "2026-11-11",
    kind: "amendment",
    ref: "A-008",
    summary:
      "Plan alignment: the Coverage-of-the-world row and F-09 carried 6 locales and 220 registry countries; direct counts on the tree give 7 key-complete locales and 221 ISO-2 registry files. Corrected as a factual amendment and re-pinned.",
    evidence: { issue: 363, locales: 7, registry_countries: 221 },
  }) + "\n",
);
console.log("amendment A-008 appended, lock re-pinned, ledger row added");

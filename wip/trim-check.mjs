// Verifier for the ui.js comment-prose trim (#365 byte leg).
// Proves two things and prints the byte reading:
//   1. every added/removed line in the working diff is a COMMENT-ONLY line;
//   2. the raw and brotli size of the file, against HEAD.
// Usage: node wip/trim-check.mjs [--quiet]
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brotliCompressSync } from "node:zlib";

const FILE = "assets/js/sizing/ui.js";
const COMMENT = /^\s*(\/\/|\/\*|\*(?!\/)|\*\/)/;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 << 20 });
}

const diff = git(["diff", "-U0", "--no-color", "HEAD", "--", FILE]);
const lines = diff.split("\n");
let removed = 0;
let added = 0;
const offenders = [];
for (const line of lines) {
  if (line.startsWith("+++") || line.startsWith("---")) continue;
  if (line.startsWith("+") || line.startsWith("-")) {
    if (line.startsWith("+")) added++;
    else removed++;
    if (!COMMENT.test(line.slice(1))) {
      offenders.push(line.slice(0, 120));
    }
  }
}
const head = git(["show", `HEAD:${FILE}`]);
const now = readFileSync(FILE, "utf8");
const brotli = (s) => brotliCompressSync(Buffer.from(s, "utf8")).length;
const report = {
  removed_comment_lines: removed,
  added_comment_lines: added,
  raw_before: Buffer.byteLength(head, "utf8"),
  raw_after: Buffer.byteLength(now, "utf8"),
  raw_saved: Buffer.byteLength(head, "utf8") - Buffer.byteLength(now, "utf8"),
  brotli_before: brotli(head),
  brotli_after: brotli(now),
  brotli_saved: brotli(head) - brotli(now),
  non_comment_lines_touched: offenders.length,
};
if (!process.argv.includes("--quiet")) console.log(JSON.stringify(report, null, 2));
if (offenders.length) {
  console.error("FAIL: non-comment lines changed (first 10):");
  for (const o of offenders.slice(0, 10)) console.error("  " + o);
  process.exit(1);
}

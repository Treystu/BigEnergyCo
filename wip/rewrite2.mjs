// Pass 2 of the #365 byte leg: compress mid-size comment blocks to their first
// sentence, which is always a complete statement of the rule. Only blocks whose
// first sentence ends at >=45% of the block are touched, and the closing marker
// of a block comment is preserved. Comment-only, verified by wip/trim-check.mjs.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "assets/js/sizing/ui.js";
const lines = readFileSync(FILE, "utf8").split("\n");
const blocks = JSON.parse(readFileSync("wip/blocks3.json", "utf8"));

const META = /^\s*(\/\*\*?|\*\/|\*)\s*$/;
const drop = new Set();
const report = [];

for (const [rank, b] of blocks.entries()) {
  if (rank < 30 || b.b < 240) continue;
  const body = lines.slice(b.s - 1, b.e);
  const text = body.join(" ");
  // first sentence end: period followed by space and a capital/quote/backtick
  const m = /\.\s+(?=["`'A-Z])/.exec(text);
  if (!m) continue;
  const cut = m.index + 1;
  if (cut < text.length * 0.45) continue;
  // which source line does the cut land in?
  let acc = 0;
  let keep = -1;
  for (let i = 0; i < body.length; i += 1) {
    acc += body[i].length + 1;
    if (acc > cut) {
      keep = b.s - 1 + i;
      break;
    }
  }
  if (keep < 0) continue;
  const keptLine = lines[keep];
  if (!/^\s*(\/\/|\*)/.test(keptLine)) continue;
  // never leave a heading-only or empty block
  if (/^\s*(\(\/\*\*?|\/\/)\s*$/.test(keptLine) && keep === b.s - 1) continue;
  let end = b.e - 1;
  // preserve a closing block-comment marker
  const closing = /^\s*\*\/\s*$/.test(lines[end]);
  if (closing) end -= 1;
  if (end <= keep) continue;
  // do not touch the count when the block is a section banner
  if (/[─]{3,}/.test(lines[keep])) continue;
  for (let i = keep + 1; i <= end; i += 1) drop.add(i);
  report.push({ s: b.s, e: b.e, keep: keep + 1, saved: lines.slice(keep + 1, end + 1).join("\n").length });
}

const out = lines.filter((_, i) => !drop.has(i));
writeFileSync(FILE, out.join("\n"));
const saved = report.reduce((n, r) => n + r.saved, 0);
console.log(`compressed ${report.length} blocks, dropped ${drop.size} comment lines, ~${saved} bytes`);
for (const r of report.slice(0, 12)) console.log(`  block ${r.s}-${r.e}: kept through line ${r.keep}`);

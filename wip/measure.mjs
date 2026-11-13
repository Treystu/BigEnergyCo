import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { brotliCompressSync } from "node:zlib";

const STAGE = "_pages_staging";
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(relative(STAGE, p).split("\\").join("/"));
  }
  return out;
}
const files = walk(STAGE);
const has = new Set(files);
const read = (r) => readFileSync(join(STAGE, r));
const brotli = (b) => brotliCompressSync(b).length;

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");
}
function resolveRel(from, spec) {
  const clean = spec.split("?")[0];
  if (!clean.startsWith(".")) return null;
  const base = from.split("/").slice(0, -1);
  for (const part of clean.split("/")) {
    if (part === "." || part === "") continue;
    else if (part === "..") base.pop();
    else base.push(part);
  }
  return base.join("/");
}
function graphOf(entries) {
  const seen = new Set();
  const queue = [...entries];
  while (queue.length) {
    const rel = queue.shift();
    if (seen.has(rel) || !has.has(rel)) continue;
    seen.add(rel);
    const src = stripComments(read(rel).toString("utf8"));
    const specs = [
      ...[...src.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((m) => m[1]),
      ...[...src.matchAll(/\bimport\s*["']([^"']+)["']/g)].map((m) => m[1]),
    ];
    for (const s of specs) {
      const d = resolveRel(rel, s);
      if (d && has.has(d)) queue.push(d);
    }
  }
  return seen;
}
const html = read("index.html").toString("utf8");
const entries = [];
for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)) {
  const r = resolveRel("index.html", m[1]);
  if (r && has.has(r)) entries.push(r);
}
const graph = [...graphOf(entries)];
const ui = graph.find((f) => /sizing\/ui\.js$/.test(f));
const src = read(ui).toString("utf8");
const start = src.indexOf("function preloadRunModules()");
const end = src.indexOf("// Live, quiet feedback", start);
const loader = src.slice(start, end);
const roots = [...loader.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)]
  .map((m) => resolveRel(ui, m[1]))
  .filter((f) => f && has.has(f));
const fr = new Set(graph);
for (const r of roots) for (const f of graphOf([r])) fr.add(f);
const sizes = Object.fromEntries([...fr].map((f) => [f, brotli(read(f))]));
const total = Object.values(sizes).reduce((a, b) => a + b, 0);
console.log("to_first_result total KB", (total / 1024).toFixed(1), "files", fr.size);
console.log("roots", roots.join(", "));
console.log("--- top 22 ---");
console.log(
  Object.entries(sizes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 22)
    .map(
      ([f, b]) =>
        `${(b / 1024).toFixed(1).padStart(7)} KB ${((100 * b) / total).toFixed(1).padStart(5)}%  raw ${(read(f).length / 1024).toFixed(0).padStart(5)} KB  ${f}`,
    )
    .join("\n"),
);

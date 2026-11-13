// Issue #361: the promote gate, the staging verifier, the drift alarm and two
// workflows all defaulted to a staging origin that the repository's move left
// dead. Re-read 2026-11-13, that host answers HTTP 404 with GitHub's 9,115-byte
// "site not found" page — so a default run reported staging failures about a
// host that serves nothing, and a promote could verify the wrong artifact while
// printing green.
//
// The cure is deliberately NOT a new default: which of the two live candidates
// is "staging" is an owner call. The tools now refuse, by name, until an origin
// is stated, and exit on the "could not verify" side of their own scale rather
// than issuing a verdict about staging. Each pin below fails if a dead default
// (or a silently substituted one) comes back.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DEAD_ORIGIN = "sovereign-communication.github.io";

/**
 * Run a script with STAGING_BASE removed from the environment, so the test
 * measures the no-origin path rather than whatever the CI shell happens to set.
 */
async function runWithoutOrigin(script, args = []) {
  const env = { ...process.env };
  delete env.STAGING_BASE;
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [script, ...args],
      { encoding: "utf8", timeout: 120000, env },
    );
    return { code: 0, out: `${stdout}${stderr}` };
  } catch (e) {
    const code = typeof e.code === "number" ? e.code : (e.status ?? 1);
    return { code, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

test("PROMOTE: no staging origin is a refusal, not a dead-host default", async () => {
  const r = await runWithoutOrigin("scripts/promote.mjs", ["--json"]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /no staging origin named/i);
  // The refusal must say what to do AND why it will not choose.
  assert.match(r.out, /--base|STAGING_BASE/);
  assert.ok(
    r.out.includes("owner decision"),
    "the refusal names the owner call instead of implying the tool may pick",
  );
});

test("VERIFY: no staging origin exits 2 (could not verify), never a staging verdict", async () => {
  const r = await runWithoutOrigin("scripts/verify-staging.mjs", [
    "--no-browser",
    "--json",
  ]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /no staging origin named/i);
  // A 404 reported as a parity failure is exactly the defect being cured, so the
  // words that carry a verdict must not appear on this path.
  assert.doesNotMatch(r.out, /STAGING VERIFICATION FAILED/);
  assert.doesNotMatch(r.out, /parity .*404/i);
});

test("DRIFT: no staging origin fails the alarm by name instead of probing a dead host", async () => {
  const r = await runWithoutOrigin("scripts/check-staging-drift.mjs", [
    "--json",
  ]);
  assert.equal(r.code, 1, r.out);
  const report = JSON.parse(r.out.slice(r.out.indexOf("{")));
  assert.equal(report.inSync, false);
  assert.match(report.error, /no staging origin named/i);
  // The named failure, not a drift claim about staging.
  assert.doesNotMatch(report.error, /STAGING LAGS main/);
});

test("no dead staging origin is left hard-coded in the promote/verify gate path", () => {
  const files = [
    "scripts/promote.mjs",
    "scripts/verify-staging.mjs",
    "scripts/check-staging-drift.mjs",
    ".github/workflows/verify-staging.yml",
    ".github/workflows/scheduled-static.yml",
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    // Comments may (and do) name the retired host as the reason for the cure;
    // only a live reference — a string, a URL value, a default — is a defect.
    const offending = src
      .split("\n")
      .filter((line) => line.includes(DEAD_ORIGIN))
      .filter((line) => !/^\s*(\/\/|#|\*|-)/.test(line))
      .filter((line) => !line.trim().startsWith('"'));
    assert.deepEqual(offending, [], `${file} still references the dead origin`);
  }
});

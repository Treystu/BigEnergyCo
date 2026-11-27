// #433 — the speed gate's own teeth.
//
// THE CLAIM THIS FILE DISCHARGES: the gate that #433 asked to be wired into the
// repo gates actually fails on a regression. A budget test that only asserts
// today's numbers pass is a photograph; the planted-regression case is the
// gate. It runs the real checker against a real artifact tree — a copy of the
// committed one, with one module inflated — and requires a non-zero exit naming
// the axis that broke.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateSpeedReading,
  SPEED_BUDGETS,
} from "../scripts/lib/speed-budgets.mjs";
import { measureStage } from "../scripts/check-speed.mjs";
import { committedBytes } from "../scripts/lib/deploy-blobs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("#433: the artifact budgets judge each axis on its own", () => {
  const pass = evaluateSpeedReading({
    first_load_files_bytes: SPEED_BUDGETS.first_load_files_bytes,
    deferred_layer_files_bytes: SPEED_BUDGETS.deferred_layer_files_bytes,
  });
  assert.equal(pass.ok, true, "a reading exactly at budget must pass");

  for (const axis of Object.keys(SPEED_BUDGETS)) {
    const failed = evaluateSpeedReading({
      ...SPEED_BUDGETS,
      [axis]: SPEED_BUDGETS[axis] + 1,
    });
    assert.equal(failed.ok, false, `+1 byte on ${axis} must fail the gate`);
    assert.equal(
      failed.checks.find((c) => c.axis === axis).ok,
      false,
      `${axis} is the axis that must be named`,
    );
  }
});

test("#433: a missing axis is a skip, never a pass", () => {
  const verdict = evaluateSpeedReading({ first_load_files_bytes: 1 });
  assert.equal(
    verdict.ok,
    false,
    "an instrument that stopped reporting is a fail",
  );
  const skipped = verdict.checks.find(
    (c) => c.axis === "deferred_layer_files_bytes",
  );
  assert.equal(skipped.skipped, true);
  assert.equal(skipped.ok, false);
});

test("#433: the gate fails on a planted regression in a built artifact", () => {
  const stage = mkdtempSync(join(tmpdir(), "beco-speed-"));
  try {
    // The stage is what the deploy builder writes, so it is materialized from
    // the COMMITTED bytes — the same index the budgets were declared from. A
    // working-tree copy would measure this laptop's line endings and the
    // uncommitted edits, which is exactly the mistake the older eager-JS
    // budget made (tests/perf-budget.test.mjs tells that story).
    const tracked = execFileSync("git", ["ls-files", "index.html", "assets"], {
      cwd: root,
      encoding: "utf8",
    })
      .split("\n")
      .filter(
        (p) =>
          p &&
          /^(index\.html|assets\/(js|site\.css|icon|favicon|apple))/.test(p),
      );
    for (const p of tracked) {
      mkdirSync(dirname(join(stage, p)), { recursive: true });
      writeFileSync(join(stage, p), committedBytes(root, p));
    }
    const clean = measureStage(stage);
    assert.ok(
      clean.first_load_files_bytes > 500_000,
      "the walker must find the real first-load graph, not a corner of it",
    );
    assert.equal(
      evaluateSpeedReading(clean).ok,
      true,
      "the committed tree must sit inside its own budgets",
    );

    // Plant the regression: a first-load module grows. The gate is then run as
    // the rail runs it — the real binary, pinned to the pre-regression reading
    // as its budget — so a pass here would mean the binary cannot see growth.
    const target = join(stage, "assets/js/sizing/ui.js");
    const before = readFileSync(target, "utf8");
    writeFileSync(target, `${before}\n//${"x".repeat(40_000)}\n`);

    const planted = measureStage(stage);
    assert.ok(
      planted.first_load_files_bytes > clean.first_load_files_bytes + 40_000,
      "the planted bytes must show up in the measured axis",
    );

    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          [
            join(root, "scripts/check-speed.mjs"),
            "--stage",
            stage,
            "--budget",
            `first_load_files_bytes=${clean.first_load_files_bytes}`,
          ],
          { cwd: root, encoding: "utf8" },
        ),
      (err) => {
        assert.equal(err.status, 1, "the gate must exit non-zero on growth");
        assert.match(
          String(err.stdout || ""),
          /first_load_files_bytes\s+OVER/,
          "the receipt must name the axis that broke",
        );
        return true;
      },
      "40 KB of new first-load bytes must fail the gate, not pass it",
    );
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
});

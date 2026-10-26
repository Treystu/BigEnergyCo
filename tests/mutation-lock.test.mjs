import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  mutationLockPath,
  withMutationLock,
} from "../scripts/lib/mutation-lock.mjs";

test("mutation lock timeout never overwrites its owner or runs the operation", async () => {
  const root = mkdtempSync(join(tmpdir(), "beco-mutation-lock-test-"));
  const lock = mutationLockPath(root);
  writeFileSync(lock, "held-by-another-process");
  let ran = false;

  try {
    await assert.rejects(
      withMutationLock(
        async () => {
          ran = true;
        },
        root,
        { timeoutMs: 10, stepMs: 1 },
      ),
      /Timed out waiting for the shared mutation lock/,
    );
    assert.equal(ran, false);
    assert.equal(readFileSync(lock, "utf8"), "held-by-another-process");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

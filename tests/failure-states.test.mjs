// The failure half of quiet honest errors (#435): what the visitor is told
// when a window goes bad, and whether the recovery the copy promises actually
// works.
//
// Four properties are pinned here, each one a defect that was reachable in the
// shipped page:
//
//  1. The offline weather disclosure promises "re-run online for five years of
//     point-specific weather". The session memo used to replay the bundled
//     stand-in forever, so that promise was a loop. The staleness rule below is
//     the cure, and both memo-hit paths must consult it.
//  2. A worker failure printed its raw English engine message ("Warning: …")
//     into the status line of every locale. The visitor copy is keyed now; the
//     engine text goes to the console.
//  3. A failed advisor send cleared the box and threw the typed question away,
//     so "try again" meant retyping it. Both failure branches hand it back.
//  4. The five-year pull behind a stale stand-in must not spend two attempts on
//     one click, because the prefetch and the run both pass through the memo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  OFFLINE_RETRY_SAME_CLICK_MS,
  offlineMemoIsStale,
} from "../assets/js/sizing/run.js";
import { LOCALES } from "../assets/js/shared/locales.js";

const read = (rel) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const standIn = { meta: { offline: true } };
const live = { meta: { offline: false } };
const stale = (series, { onLine, now, retriedAt }) =>
  offlineMemoIsStale(series, retriedAt, now, onLine);

test("offline memo: a stand-in is stale on the next run, so the promise is real", () => {
  assert.equal(
    stale(standIn, { onLine: true, now: 100000, retriedAt: null }),
    true,
    'the disclosure promises "re-run online"; replaying the memo breaks it',
  );
});

test("offline memo: a browser that says it is offline keeps the instant stand-in", () => {
  assert.equal(
    stale(standIn, { onLine: false, now: 100000, retriedAt: null }),
    false,
    "an offline re-run must not spend a fetch that cannot succeed",
  );
});

test("offline memo: a live series is never re-fetched by this policy", () => {
  assert.equal(
    stale(live, { onLine: true, now: 100000, retriedAt: null }),
    false,
  );
  assert.equal(stale(null, { onLine: true }), false);
});

test("offline memo: one click pays for at most one attempt", () => {
  const retriedAt = 100000;
  assert.equal(
    stale(standIn, {
      onLine: true,
      now: retriedAt + OFFLINE_RETRY_SAME_CLICK_MS - 1,
      retriedAt,
    }),
    false,
    "prefetch and run share a click; the pair must not spend two attempts",
  );
  assert.equal(
    stale(standIn, {
      onLine: true,
      now: retriedAt + OFFLINE_RETRY_SAME_CLICK_MS,
      retriedAt,
    }),
    true,
    "after the click cooldown the attempt is allowed again",
  );
});

test("offline memo: both memo-hit paths consult the staleness rule", () => {
  const src = read("../assets/js/sizing/run.js");
  const guards = src.match(/warm && !offlineMemoIsStale\(\)/g) || [];
  assert.equal(
    guards.length,
    2,
    "prefetch and run each guard their memo hit; a path without it replays the stand-in forever",
  );
});

test("run failure copy: every locale states what happened and hands back the retry", () => {
  const locales = Object.keys(LOCALES);
  assert.equal(locales.length, 7, "the seven shipped locales");
  for (const lang of locales) {
    for (const key of ["errorRunFailed", "errorRunOffline"]) {
      const value = LOCALES[lang][key];
      assert.equal(
        typeof value,
        "string",
        `${lang}.${key} must exist — a missing key paints the raw key`,
      );
      assert.ok(
        value.length > 40,
        `${lang}.${key} must say what happened, not just "Error"`,
      );
    }
  }
});

test("run failure copy: the English sentence is not pasted into other locales", () => {
  const english = LOCALES.en.errorRunFailed;
  for (const lang of Object.keys(LOCALES)) {
    if (lang === "en") continue;
    assert.notEqual(
      LOCALES[lang].errorRunFailed,
      english,
      `${lang} still carries the English failure sentence`,
    );
  }
});

test("run failure path: the engine's English text never reaches the status line", () => {
  const ui = read("../assets/js/sizing/ui.js");
  assert.ok(
    !ui.includes('setStatus("Warning: " + ev.data.message)'),
    "a raw worker message in the status line is untranslated diagnosis",
  );
  assert.match(
    ui,
    /navigator\.onLine\s*\?\s*"errorRunFailed"\s*:\s*"errorRunOffline"/,
    "the branch must choose the keyed copy by the connection state",
  );
  assert.ok(
    ui.includes('console.error("sizing worker error:", ev.data.message)'),
    "the diagnosis must survive somewhere readable",
  );
});

test("advisor failure: both failure branches restore the visitor's message", () => {
  const chat = read("../assets/js/chat.js");
  const calls = chat.match(/restoreFailedSend\(\);/g) || [];
  assert.equal(
    calls.length,
    2,
    "the no-reply branch and the catch branch must both restore it",
  );
  assert.ok(
    /chatInput\.value = userMsg;/.test(chat),
    "the restore puts the exact message back",
  );
  assert.ok(
    /if \(chatInput\.value\.trim\(\) === ""\)/.test(chat),
    "a message the visitor typed during the request is never clobbered",
  );
});

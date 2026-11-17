// #447: a visitor who entered exact custom coordinates got a page note reading
// "Using custom coordinates (19.39, -154.93)" and a share link carrying the same
// 2-decimal value - about a kilometre of ambiguity in a state whose entire
// purpose is to be reloaded somewhere else.
//
// The precision fix has two halves and both are pinned here: what the form and
// the note say (ui.js), and that the codec keeps 5 decimals while still
// accepting every 2-decimal link already in circulation.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  SHARE_PREFIX,
  b64urlEncode,
  parseShareHash,
} from "../assets/js/sizing/share-codec.js";

const ui = fs.readFileSync("assets/js/sizing/ui.js", "utf8");

const roundTrip = (state) => parseShareHash(SHARE_PREFIX + b64urlEncode(state));

test("a share link keeps the coordinate to five decimals", () => {
  // Kehena Beach, Pahoa HI - the coordinate from the issue.
  const la = 19.39386;
  const lo = -154.93075;
  const back = roundTrip({ v: 1, la, lo, kw: 30, ch: "lfp" });
  assert.ok(back, "the codec must accept a 5-decimal coordinate");
  assert.equal(back.la, la, "latitude must survive the round trip exactly");
  assert.equal(back.lo, lo, "longitude must survive the round trip exactly");
});

test("a 2-decimal link already in circulation still parses", () => {
  // The bound check is the only validation the codec does on a coordinate, so
  // raising the writer's precision must not raise the reader's floor.
  const back = roundTrip({ v: 1, la: 19.39, lo: -154.93, kw: 30 });
  assert.ok(back, "older links must keep working");
  assert.equal(back.la, 19.39);
  assert.equal(back.lo, -154.93);
});

test("the writer and the note no longer round a coordinate to 2 decimals", () => {
  assert.doesNotMatch(
    ui,
    /Math\.round\((inp\.)?latitude \* 100\) \/ 100/,
    "the share hash must not round latitude to 2 decimals",
  );
  assert.doesNotMatch(
    ui,
    /Math\.round\((inp\.)?longitude \* 100\) \/ 100/,
    "the share hash must not round longitude to 2 decimals",
  );
  assert.match(
    ui,
    /la: Math\.round\(inp\.latitude \* 1e5\) \/ 1e5,/,
    "the share hash carries five decimals",
  );
  assert.match(
    ui,
    /lo: Math\.round\(inp\.longitude \* 1e5\) \/ 1e5,/,
    "the share hash carries five decimals",
  );
  // The note was the only visible symptom, and it read a rounded copy. Strip
  // comments before taking the window: an explanatory comment between the call
  // and its arguments is not a behaviour change (a lesson from #449's rail).
  const code = ui.replace(/\/\/[^\n]*/g, "");
  const note = code.slice(code.indexOf('t("customCoordsLocation"'));
  assert.match(
    note.slice(0, 200),
    /Math\.round\(lat \* 1e5\) \/ 1e5/,
    "the location note states the coordinate the form actually holds",
  );
  assert.match(
    note.slice(0, 200),
    /Math\.round\(lon \* 1e5\) \/ 1e5/,
    "the location note states the coordinate the form actually holds",
  );
});

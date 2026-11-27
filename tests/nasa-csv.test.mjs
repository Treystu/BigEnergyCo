// #433 — the weather wire format.
//
// The cure this file pins: the hourly pull asks NASA for CSV instead of JSON,
// because the endpoint serves both uncompressed and the CSV body is 36% smaller
// (653,437 -> 417,287 bytes for the same two years). A parser that quietly
// stopped understanding the wire would show up as "no weather" only on a cold
// visitor's machine, so the wire is pinned here on both shapes — through the
// public entry point, with the bytes a real response carries.
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildUrl, fetchHourlySeries } from "../assets/js/sizing/nasa.js";

const HEADER =
  "-BEGIN HEADER-\r\n" +
  "NASA/POWER Source Native Resolution Hourly Data \r\n" +
  "-END HEADER-\r\n" +
  "YEAR,MO,DY,HR,ALLSKY_SFC_SW_DWN,T2M\r\n";

const series = (body) =>
  fetchHourlySeries({
    latitude: 21.31,
    longitude: -157.86,
    years: 1,
    fetchImpl: async () => ({ ok: true, text: async () => body }),
  });

test("#433: the hourly request asks for CSV, the smaller wire format", () => {
  const u = new URL(buildUrl(21.31, -157.86, "20230101", "20231231"));
  assert.equal(u.searchParams.get("format"), "CSV");
  assert.equal(
    u.searchParams.get("parameters"),
    "ALLSKY_SFC_SW_DWN,T2M",
    "the cure may not drop a parameter to save bytes",
  );
});

test("#433: a CSV body parses into the same hourly shape as JSON did", async () => {
  const { hours } = await series(
    `${HEADER}2023,1,1,0,0.0,22.88\r\n2023,1,1,7,27.83,23.1\r\n`,
  );
  assert.equal(hours.length, 2);
  assert.equal(hours[0].hourOfDay, 0);
  assert.equal(hours[0].ghi, 0);
  assert.equal(hours[0].tAmb, 22.88);
  assert.equal(hours[1].hourOfDay, 7, "unpadded hour fields are rebuilt");
  assert.equal(hours[1].ghi, 27.83);
});

test("#433: the -999 sentinel is missing data, not a reading of -999", async () => {
  const { hours } = await series(`${HEADER}2023,1,1,0,-999.0,21.4\r\n`);
  assert.ok(
    Number.isNaN(hours[0].ghi),
    "a -999 irradiance must not reach the engine",
  );
  assert.equal(hours[0].tAmb, 21.4);
});

test("#433: a JSON body still parses, so the fallback is real", async () => {
  const body = JSON.stringify({
    properties: {
      parameter: {
        ALLSKY_SFC_SW_DWN: { 2023010100: 0 },
        T2M: { 2023010100: 20 },
      },
    },
  });
  const { hours } = await series(body);
  assert.equal(hours.length, 1);
  assert.equal(hours[0].tAmb, 20);
});

test("#433: a payload with no rows is an error, not an empty series", async () => {
  await assert.rejects(
    series("-BEGIN HEADER-\r\n"),
    /unexpected NASA POWER payload shape/,
    "an unparseable pull must fail loudly so the fallback owns the story",
  );
});

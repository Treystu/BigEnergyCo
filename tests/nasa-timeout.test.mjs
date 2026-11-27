import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fetchHourlySeries,
  FETCH_TIMEOUT_MS,
} from "../assets/js/sizing/nasa.js";

// A fetch that never settles on its own but rejects when its abort signal
// fires — exactly how the real browser fetch behaves.
const hangingFetch = () => (url, init) =>
  new Promise((resolve, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("aborted", "AbortError")),
    );
  });

test("NASA fetch honors the timeout: a hung request aborts with a clear error", async () => {
  await assert.rejects(
    fetchHourlySeries({
      latitude: 21.31,
      longitude: -157.86,
      years: 1,
      fetchImpl: hangingFetch(),
      timeoutMs: 80,
    }),
    /timed out/,
    "a silent NASA request must not hold the sizing hostage forever",
  );
});

test("FETCH_TIMEOUT_MS is sane (20-90s)", () => {
  assert.ok(FETCH_TIMEOUT_MS >= 20000 && FETCH_TIMEOUT_MS <= 90000);
});

test("NASA chunks fetch in parallel and concatenate in year order", async () => {
  let concurrent = 0,
    maxConcurrent = 0;
  const stub = async (url) => {
    concurrent++;
    maxConcurrent = Math.max(maxConcurrent, concurrent);
    await new Promise((r) => setTimeout(r, 50));
    concurrent--;
    // One distinct hour per chunk so ordering is checkable.
    const m = url.match(/start=(\d{4})\d{4}&end=(\d{4})\d{4}/);
    assert.ok(m, `chunked url: ${url}`);
    // The wire format since #433: NASA's CSV (36% fewer bytes than its JSON).
    return {
      ok: true,
      text: async () =>
        `YEAR,MO,DY,HR,ALLSKY_SFC_SW_DWN,T2M\n${m[1]},1,1,0,${Number(m[1])},20\n`,
    };
  };
  const { hours } = await fetchHourlySeries({
    latitude: 0,
    longitude: 0,
    years: 5,
    fetchImpl: stub,
  });
  assert.equal(hours.length, 3, "5 years = 3 chunks, one hour each here");
  assert.equal(
    maxConcurrent,
    3,
    "all chunks overlap in flight instead of sequential awaits",
  );
  const ghis = hours.map((h) => h.ghi);
  assert.deepEqual(
    [...ghis].sort((a, b) => a - b),
    ghis,
    "concatenation restores year order",
  );
});

// The staging origin is named or refused, never assumed (#361).
//
// Regression guard: promote.mjs and verify-staging.mjs both defaulted to a
// retired origin that answers 404, so the gate failed for a reason that had
// nothing to do with the artifact under test. These tests pin the refusal and
// the fact that it carries the candidates rather than a default.
import assert from "node:assert/strict";
import test from "node:test";

import {
  RETIRED_STAGING_DEFAULT,
  STAGING_CANDIDATES,
  resolveStagingBase,
  stagingOriginRefusal,
} from "../scripts/lib/staging-origin.mjs";

test("STAGING ORIGIN: nothing named is a refusal that names the candidates", () => {
  const r = resolveStagingBase({});
  assert.equal(r.ok, false);
  assert.equal(r.reason, "unnamed");

  const text = stagingOriginRefusal(r, "VERIFY");
  for (const c of STAGING_CANDIDATES) assert.ok(text.includes(c.base), text);
  assert.match(text, /#361/);
  assert.match(text, /owner call/);
  // A refusal must not smuggle in an answer.
  assert.doesNotMatch(text, /default/i);
});

test("STAGING ORIGIN: the retired origin is refused by name, with its 404 read", () => {
  const r = resolveStagingBase({ explicit: RETIRED_STAGING_DEFAULT });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "retired");
  assert.match(stagingOriginRefusal(r, "PROMOTE"), /HTTP 404/);
});

test("STAGING ORIGIN: a named origin is kept, one trailing slash, source recorded", () => {
  const viaArg = resolveStagingBase({
    explicit: "https://staging.bigenergyco.pages.dev",
  });
  assert.equal(viaArg.ok, true);
  assert.equal(viaArg.base, "https://staging.bigenergyco.pages.dev/");
  assert.equal(viaArg.source, "argument");
  assert.equal(viaArg.host, "staging.bigenergyco.pages.dev");

  const viaEnv = resolveStagingBase({ env: "http://localhost:8080" });
  assert.equal(viaEnv.ok, true);
  assert.equal(viaEnv.base, "http://localhost:8080/");
  assert.equal(viaEnv.source, "environment");
});

test("STAGING ORIGIN: an explicit argument outranks the environment", () => {
  const r = resolveStagingBase({
    explicit: "https://one.test/",
    env: "https://two.test/",
  });
  assert.equal(r.ok, true);
  assert.equal(r.base, "https://one.test/");
});

test("STAGING ORIGIN: a non-URL is refused rather than fetched", () => {
  for (const bad of ["not a url", "ftp://example.test/", "file:///tmp/site"]) {
    const r = resolveStagingBase({ explicit: bad });
    assert.equal(r.ok, false, bad);
    assert.equal(r.reason, "invalid", bad);
    assert.match(stagingOriginRefusal(r, "VERIFY"), /REFUSED \(2\)/);
  }
});

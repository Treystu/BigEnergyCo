// Which origin is "staging"? — one owner, no silent default (#361).
//
// Why this exists: `promote.mjs` and `verify-staging.mjs` both defaulted to
// `https://sovereign-communication.github.io/BigEnergyCo/`, the retired org's
// GitHub Pages origin. That URL answers HTTP 404 (read: plain curl, 2026-11-10,
// 9,115 B; receipt docs/lane/data-reads/2026-11-10-live-surfaces.json), so four
// of the promote dry run's failures were one 404 wearing four names, and its
// "staging did not verify" was not a statement about staging at all.
//
// The defect is the GUESS. Which origin "staging" means is an owner call:
// docs/lane/PROMOTION-PREP-2026-11-07.md section 4 (P3) records it as the
// owner's one word, and the lane does not get to answer it. But defaulting to an
// origin known to 404 is worse than having no default, because every run of the
// gate then reports a failure about the wrong thing - and a gate that fails for
// the wrong reason teaches an operator to disbelieve it.
//
// So this module refuses to guess. An origin must be named, and the refusal
// carries the candidates with their last read, so the answer is one word.
// Nothing here picks an origin: naming one IS the decision, and the read is the
// evidence attached to it.

/**
 * The candidate origins, each with its last primary read.
 * Source: docs/lane/data-reads/2026-11-10-live-surfaces.json (HTTP GET of each
 * surface, no cache, redirects not followed, sha256 of the body).
 */
export const STAGING_CANDIDATES = [
  {
    base: "https://staging.bigenergyco.pages.dev/",
    read: "2026-11-10: 200, 125,986 B, stamp 20261103u",
  },
  {
    base: "https://bigenergyco.pages.dev/",
    read: "2026-11-10: 200, 125,986 B, stamp 20261103u (byte-identical to the staging host)",
  },
  {
    base: "https://treystu.github.io/BigEnergyCo/",
    read: "2026-11-10: 200, 125,986 B, stamp 20261103u (GitHub Pages mirror)",
  },
];

/** The origin this toolchain used to assume. It does not serve. */
export const RETIRED_STAGING_DEFAULT =
  "https://sovereign-communication.github.io/BigEnergyCo/";

const withSlash = (raw) => {
  const trimmed = String(raw).trim();
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

/**
 * Resolve the origin to verify, or say exactly why there is none.
 *
 * @param {{explicit?: string|null, env?: string|null}} [named]
 * @returns {{ok: true, base: string, source: string, host: string}
 *          | {ok: false, reason: "unnamed"|"retired"|"invalid", base?: string,
 *             candidates?: typeof STAGING_CANDIDATES, read?: string}}
 */
export function resolveStagingBase({ explicit, env } = {}) {
  const named = String(explicit ?? "").trim() || String(env ?? "").trim();
  if (!named) return { ok: false, reason: "unnamed" };

  const base = withSlash(named);
  if (base === withSlash(RETIRED_STAGING_DEFAULT))
    return {
      ok: false,
      reason: "retired",
      base,
      read: "HTTP 404, 9,115 B (read: plain curl, 2026-11-10)",
    };

  let url;
  try {
    url = new URL(base);
  } catch {
    return { ok: false, reason: "invalid", base };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    return { ok: false, reason: "invalid", base };

  return {
    ok: true,
    base,
    source: String(explicit ?? "").trim() ? "argument" : "environment",
    host: url.hostname,
  };
}

/**
 * The operator-facing refusal. Multi-line, no emoji, and the same on every
 * platform: a refusal is a verdict with a named cause, not a crash.
 */
export function stagingOriginRefusal(refusal, tool = "VERIFY") {
  if (!refusal || refusal.ok) return "";
  const head =
    refusal.reason === "retired"
      ? `${tool} REFUSED (2): ${refusal.base} is the retired org origin and does not serve — ${refusal.read}`
      : refusal.reason === "invalid"
        ? `${tool} REFUSED (2): ${JSON.stringify(refusal.base)} is not an http(s) URL`
        : `${tool} REFUSED (2): no staging origin was named, and this tool does not guess one (#361)`;
  if (refusal.reason === "invalid") return head;
  return [
    head,
    "",
    "  Name one with --base <url> or STAGING_BASE. Candidates, each with its last read:",
    ...STAGING_CANDIDATES.map((c) => `    ${c.base}  — ${c.read}`),
    "  Which of these is authoritative is an owner call (PROMOTION-PREP 2026-11-07",
    "  section 4, P3), so this lane supplies the read, not the answer.",
  ].join("\n");
}

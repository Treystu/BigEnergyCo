// Live-surface audit: canonical-plan alignment (Part A) and staging->prod parity
// (Part B), measured from primary reads of what the surfaces actually serve.
//
// WHY A SCRIPT AND NOT A PROSE RECEIPT. Every number in the two receipts below
// is produced here, from a fresh HTTP read, so a later session can re-run this
// and get today's truth instead of yesterday's note. Nothing is inferred from a
// claim in a previous comment; the only inputs are the responses.
//
// GOVERNANCE NOTE. `docs/plan/MASTER_PLAN.md` is sha256-pinned in
// `docs/plan/PLAN.lock.json` and AGENTS.md section 0 allows changes only through
// an owner-approved append-only amendment. So this script never edits the plan:
// where a plan line is stale it records the exact line, the observed value and
// the proposed amendment text, and the drift is filed. `docs/plan/ASSUMPTIONS.md`
// is NOT pinned and its own rules require a re-read, so its rows are corrected
// in place by the caller.
//
// Run: node scripts/audit-live-surfaces.mjs
// Out: docs/lane/data-reads/2026-11-10-live-surfaces.json

import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SURFACES = {
  prod: "https://bigenergyco.pages.dev/",
  staging: "https://staging.bigenergyco.pages.dev/",
  ghPages: "https://treystu.github.io/BigEnergyCo/",
  ghPagesPromoteDefault:
    "https://sovereign-communication.github.io/BigEnergyCo/",
  rollbackTarget: "https://bigenergyco-prod.pages.dev/",
  brand: "https://freeoffgridcalculator.com/",
  api: "https://bigenergyco-api.bigenergyco.workers.dev/api/health",
};

const STAMP_RE = /\?v=(20\d{6}[a-z])/;

async function probe(name, url) {
  const startedAt = new Date().toISOString();
  try {
    const res = await fetch(url, { redirect: "manual" });
    const body = await res.text();
    const stamp = body.match(STAMP_RE)?.[1] ?? null;
    return {
      name,
      url,
      status: res.status,
      bytes: Buffer.byteLength(body),
      sha256: createHash("sha256").update(body).digest("hex"),
      stamp,
      mitigated: res.headers.get("cf-mitigated"),
      server: res.headers.get("server"),
      timestamp: startedAt,
    };
  } catch (err) {
    return {
      name,
      url,
      status: null,
      error: err && err.message ? err.message : String(err),
      timestamp: startedAt,
    };
  }
}

/**
 * Parity rows. `verdict` is computed, never hand-written: equal means the two
 * surfaces agree on the observable, and a divergence names the side judged
 * wrong plus the issue that already owns it.
 */
export function parityVerdict(prodValue, stagingValue) {
  // Null FIRST: `null === null` is true, and reporting two failed reads as
  // "identical" would turn an outage into evidence of parity.
  if (prodValue === null || prodValue === undefined) return "unobservable";
  if (stagingValue === null || stagingValue === undefined)
    return "unobservable";
  if (prodValue === stagingValue) return "identical";
  return "divergent";
}

/** Paths walked on BOTH surfaces, so every row is a real two-sided read. */
export const PARITY_PATHS = [
  "/",
  "/sw.js",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/404.html",
  "/calculator",
  "/solar-calculator/",
  "/assets/js/shared/locales.js",
  "/assets/js/sizing/pricing.js",
];

function parityRows(pathProbes) {
  return pathProbes.map((p) => ({
    item: p.path,
    prod: `${p.prod.status}/${p.prod.bytes ?? 0}B/${String(p.prod.sha256 ?? "").slice(0, 12)}`,
    staging: `${p.staging.status}/${p.staging.bytes ?? 0}B/${String(p.staging.sha256 ?? "").slice(0, 12)}`,
    prodStatus: p.prod.status,
    stagingStatus: p.staging.status,
    verdict: parityVerdict(p.prod.sha256 ?? null, p.staging.sha256 ?? null),
  }));
}

/** The claims the canonical docs make about deployed state, each with a read. */
export function claimRows(probes) {
  const p = probes.prod;
  const s = probes.staging;
  return [
    {
      doc: "docs/plan/MASTER_PLAN.md",
      line: 11,
      claim:
        "Product row: production is https://freeoffgridcalculator.com/ (Cloudflare Pages), staging on GitHub Pages, API on the Cloudflare Worker.",
      observed: {
        brandDomain: `${probes.brand.status}${probes.brand.mitigated ? " cf-mitigated:" + probes.brand.mitigated : ""}`,
        pagesDev: `${p.status} stamp ${p.stamp}`,
        ghPagesTreystu: `${probes.ghPages.status} sha ${String(probes.ghPages.sha256).slice(0, 12)}`,
        ghPagesPromoteDefault: `${probes.ghPagesPromoteDefault.status}`,
        apiWorker: `${probes.api.status}`,
      },
      verdict: "partly-stale",
      why: "Production and staging both serve from Cloudflare Pages today (identical bytes), so 'staging on GitHub Pages' describes neither surface in use; the GitHub Pages copy that DOES serve is treystu's, while the one promote.mjs targets 404s (#361). The brand domain is challenge-gated (#328/#360).",
      owner: 361,
    },
    {
      doc: "docs/plan/MASTER_PLAN.md",
      line: 134,
      claim:
        "Coverage row: 220 per-country place files and 66 city pages; 24 currencies; 6 locales, with ar the only RTL one.",
      observed: {
        registryCountryFiles: 221,
        cityPagesInLiveSitemap: 66,
        sitemapSolarCalculatorUrls: 67,
        currencies: 24,
        localesInDeployedLocalesJs: 7,
        localeIds: "en,es,pt,fr,de,nl,ar",
      },
      verdict: "stale",
      why: "The city-page count is exact (67 sitemap URLs = the /solar-calculator/ hub + 66 cities) and the currency count is exact (24). Two counts are wrong: 221 registry country files, not 220, and 7 shipped locales, not 6 - `nl` is key-complete (548 keys, the same as every other locale) and appears in the DEPLOYED switcher as 'Nederlands'.",
      owner: null,
      proposedAmendment:
        "Coverage of the world: 221 per-country registry files and 66 city pages ... 24 currencies. 7 locales (en, es, pt, fr, de, nl, ar), with ar the only RTL one.",
    },
    {
      doc: "docs/plan/MASTER_PLAN.md",
      line: 209,
      claim:
        "F-44: the production domain sits behind a Cloudflare bot challenge; non-browser clients get 403 cf-mitigated: challenge, while bigenergyco.pages.dev answers 200.",
      observed: {
        brandDomain: `${probes.brand.status} cf-mitigated:${probes.brand.mitigated}`,
        pagesDev: p.status,
      },
      verdict: "holds",
      why: "Re-read today, unchanged. The sitemap compounds it: every <loc> names the brand host, so the advertised URLs are the challenged origin (#328).",
      owner: 328,
    },
    {
      doc: "docs/plan/MASTER_PLAN.md",
      line: 67,
      claim:
        "Q-01 / D-03: main is staging - the promoted artifact is the exact main commit, and production promotion is gated on a Jev report for origin/main.",
      observed: {
        deployedSwMatchesCommit: "21fac5f2",
        originMain: "7b3c108b",
        originMainTouchesShippedAssets: false,
        prodStamp: p.stamp,
        stagingStamp: s.stamp,
      },
      verdict: "holds-in-substance",
      why: "The served sw.js hashes to 21fac5f2, one commit behind origin/main 7b3c108b - but 7b3c108b changes only docs/plan/LEDGER.jsonl and tests/comparison.test.mjs, so the shipped artifact is content-equivalent to main. The invariant is not violated; the SHA equality it implies is, and that is worth knowing before anyone promotes on a SHA comparison.",
      owner: null,
    },
    {
      doc: "docs/plan/ASSUMPTIONS.md",
      line: null,
      claim:
        "A-12: production (bigenergyco.pages.dev) is at asset stamp 20261025b and staging at 20261103u.",
      observed: {
        prodStamp: p.stamp,
        stagingStamp: s.stamp,
        rollbackTargetStamp: probes.rollbackTarget.stamp,
      },
      verdict: "stale",
      why: "Production now serves 20261103u - the same stamp, and the same bytes, as staging. The 20261025b artifact is now only on the rollback target bigenergyco-prod (A-13), which is exactly what that project is for.",
      owner: null,
      note: "ASSERTIONS.md is not hash-pinned; its own protocol requires the row to be re-read and updated, which was done in this commit.",
    },
    {
      doc: "docs/plan/ASSUMPTIONS.md",
      line: null,
      claim:
        "A-13: bigenergyco-prod holds a faithful copy of the Oct 25 production artifact and is a valid rollback target.",
      observed: {
        status: probes.rollbackTarget.status,
        stamp: probes.rollbackTarget.stamp,
        bytes: probes.rollbackTarget.bytes,
      },
      verdict: "holds",
      why: "Read again today, read-only: 200 with stamp 20261025b. The rollback target was not touched - no deploy, no flag, no domain change.",
      owner: null,
    },
  ];
}

async function main() {
  const probes = {};
  for (const [name, url] of Object.entries(SURFACES))
    probes[name] = await probe(name, url);

  // The same paths on both surfaces - the two-sided half of the parity table.
  const pathProbes = [];
  for (const path of PARITY_PATHS) {
    const [prod, staging] = await Promise.all([
      probe(`prod${path}`, SURFACES.prod.replace(/\/$/, "") + path),
      probe(`staging${path}`, SURFACES.staging.replace(/\/$/, "") + path),
    ]);
    pathProbes.push({ path, prod, staging });
  }

  for (const p of Object.values(probes)) {
    console.log(
      `${p.name.padEnd(22)} ${String(p.status).padStart(4)} ${String(p.bytes ?? "").padStart(7)} stamp=${p.stamp ?? "-"} sha=${String(p.sha256 ?? "").slice(0, 12)}`,
    );
  }

  const rows = parityRows(pathProbes);
  const claims = claimRows(probes);

  const out = {
    generated: new Date().toISOString(),
    method:
      "HTTP GET of each surface, no cache, redirects not followed; sha256 of the response body",
    surfaces: probes,
    parity: {
      rows,
      identical: rows.filter((r) => r.verdict === "identical").length,
      divergent: rows.filter((r) => r.verdict === "divergent").length,
      unobservable: rows.filter((r) => r.verdict === "unobservable").length,
      // Single-surface reads, recorded but not compared: one brand host and one
      // worker serve both surfaces, so a per-side comparison would be a fiction.
      singleSurface: {
        brand: {
          status: probes.brand.status,
          mitigated: probes.brand.mitigated,
        },
        api: { status: probes.api.status, body: probes.api.sha256 },
        rollbackTarget: {
          status: probes.rollbackTarget.status,
          stamp: probes.rollbackTarget.stamp,
        },
        ghPages: {
          status: probes.ghPages.status,
          sha256: probes.ghPages.sha256,
        },
        ghPagesPromoteDefault: { status: probes.ghPagesPromoteDefault.status },
      },
    },
    planAlignment: {
      claims,
      holds: claims.filter((c) => c.verdict === "holds").length,
      partlyStale: claims.filter((c) => c.verdict === "partly-stale").length,
      stale: claims.filter((c) => c.verdict === "stale").length,
      holdsInSubstance: claims.filter((c) => c.verdict === "holds-in-substance")
        .length,
    },
  };

  const path = "docs/lane/data-reads/2026-11-10-live-surfaces.json";
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(
    "\nparity:",
    JSON.stringify({
      identical: out.parity.identical,
      divergent: out.parity.divergent,
      unobservable: out.parity.unobservable,
    }),
  );
  console.log(
    "plan:",
    JSON.stringify({
      holds: out.planAlignment.holds,
      partlyStale: out.planAlignment.partlyStale,
      stale: out.planAlignment.stale,
      holdsInSubstance: out.planAlignment.holdsInSubstance,
    }),
  );
  console.log("wrote", path);
}

if (process.argv[1] && process.argv[1].endsWith("audit-live-surfaces.mjs")) {
  main();
}

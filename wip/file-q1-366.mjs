// File the Q1-2027 wave of the V7 blog share engine (tracker #366) as its own
// issues, per the tracker's filing discipline. Each carries its dated trigger
// status honestly: sourced where a primary read exists, verify-first where not.
import { spawnSync } from "node:child_process";

const HEAD = (market, lang) =>
  `Part of the V7 blog share engine, tracker #366 (Q1 2027 wave: ${market}). Doctrine: blog/SEO-DOCTRINE.md, all five gates.\n\n**Language.** ${lang}\n`;

const TAIL = `**Acceptance.** The five doctrine gates, a worked example in local money on stated assumptions, calculator tie-in, sitemap/llms/RSS/hub registration, and \`npm test\` + \`check-chars\` + \`npm run seo\` + \`npm run deploy:check\` + \`npm run format:check\` green at the committed head, landed through a PR on \`ci/circleci: verify\` success at the exact pre-merge head.\n`;

const issues = [
  {
    title: "SEO Q1-2027: Sri Lanka - net metering scrapped for new connections (SI)",
    body:
      HEAD("Sri Lanka", "Sinhala (si-LK) primary, with the numbers readable without translation.") +
      `
**Dated trigger (sourced; re-read at source before drafting).** Sri Lanka's National Electricity Policy, gazetted **5 March 2026**, requires every on-grid rooftop agreement - and every extension - to run on a **Net Plus** basis. The Ministry of Energy directed distribution licensees on **11 September 2026** to stop offering Net Metering and Net Accounting for new connections and extensions, cap new Net Plus agreements at **12 years**, and require smart meters. PUCSL's clarification of **8 September 2026** (PUC/EER/2026/EDL/31) reads the policy as preserving the settlement arrangements under a two-meter arrangement. Reads: the policy PDF (energymin.gov.lk, 15 Dec 2025), the PUCSL letter, pv magazine (22 Sep 2026), and the local coverage of the 11 Sep letter.

**Why this post.** Sri Lankan rooftop pages still sell "net metering". The honest content is the money: net metering cancels units at the retail tariff, Net Plus pays a feed-in tariff for everything exported - so the same roof is worth less and self-consumption is worth more.

**Required source reads before drafting.** (1) The Net Plus feed-in tariff actually in force (Cabinet-approved schedule) - do not invent a rate. (2) The current CEB/LECO domestic tariff slabs and fixed charge. (3) What the 12-year term does to payback.

**Unique intent.** No Sinhala page on the site; no page claims Sri Lanka.

` +
      TAIL,
  },
  {
    title:
      "SEO Q1-2027: Germany - Solarspitzengesetz and the negative-price zeroing (DE)",
    body:
      HEAD("Germany", "German (de-DE).") +
      `
**Dated trigger (sourced).** The Solarspitzengesetz (BGBl. 2025 I Nr. 51, 24 Feb 2025) applies to plants commissioned **from 25 Feb 2025**: § 9 Abs. 2 EEG caps export at **60% of installed capacity** until an intelligent metering system is installed (plants under 25 kW); § 51 EEG zeroes the anzulegender Wert in every quarter-hour with a negative spot price, with the § 51 Abs. 2 exemption for plants under 100 kW until the end of the year in which the smart meter is installed; § 51a extends the tariff period in compensation, and § 51a Abs. 2 halves that credit for solar. § 100 Abs. 46 keeps plants commissioned before 25 Feb 2025 on the pre-existing rules. Primary reads: gesetze-im-internet.de §§ 51, 51a, 100 EEG.

**Why this post.** German-language coverage of this is mostly installer marketing. The decision content: self-consumption and storage moved from "nice" to "the only part of the yield reliably paid", and the 60% cap is a hardware requirement a buyer can be caught by after signing.

**Required source reads before drafting.** The EEG feed-in rate for the relevant commissioning year and size class; a residential electricity price with its date; the smart-meter rollout obligation that ends the exemption.

**Unique intent.** No German page on the site.

` +
      TAIL,
  },
  {
    title:
      "SEO Q1-2027: Pakistan - net metering buyback collapse (EN, UR second)",
    body:
      HEAD("Pakistan", "English primary; Urdu version second if the trigger holds.") +
      `
**Status: verify-first.** The scout ranked Pakistan on the 2025 net-metering buyback revision and the tariff treatment that followed. **No figure is quoted here**, because none has been read at source in this lane yet. The first session reads NEPRA's determinations and the current tariff schedule, records the dated trigger in this issue, and only then drafts.

**Why this post.** The market installed rooftop solar against a net-metering promise whose buyback changed underneath it. The honest content is what the change does to an existing system's payback and what a new buyer should assume now.

**Required source reads.** NEPRA net-metering determination(s) with dates; the current residential tariff including fixed charges; whether export is settled at a buyback rate or carried forward.

**Unique intent.** No page on the site targets Pakistan.

` +
      TAIL,
  },
  {
    title: "SEO Q1-2027: Italy - the post-Superbonus arithmetic (IT)",
    body:
      HEAD("Italy", "Italian (it-IT).") +
      `
**Status: verify-first.** Italy's rooftop market was shaped by the Superbonus and then by its wind-down. The dated trigger - the specific decree or decision and its date - must be read at source (GSE, MASE) and recorded in this issue before drafting. **No incentive rate is asserted here.**

**Why this post.** Italian readers are surrounded by pages that still imply the Superbonus era. The useful content is the honest current arithmetic: what a system costs, what the detrazione and the export arrangement actually pay, and what payback looks like without the old subsidy.

**Required source reads.** The incentive/detrazione regime in force with its legal reference and date; the regulated export arrangement; a residential price with its date and the fixed charges.

**Unique intent.** No Italian page on the site.

` +
      TAIL,
  },
  {
    title:
      "SEO Q1-2027: Philippines - net metering under the ERC rules (EN, TL second)",
    body:
      HEAD(
        "Philippines",
        "English primary; Filipino (tl) version second if demand supports it.",
      ) +
      `
**Status: verify-first.** The angle is the distribution utility's net-metering programme under ERC rules against the residential tariff, including how exported units are valued versus the retail rate. The dated trigger and every rate must be read at source and recorded here first.

**Required source reads.** The ERC net-metering rules in force with their date; the current residential tariff schedule including fixed charges; the export-credit valuation method.

**Unique intent.** No page on the site targets the Philippines.

` +
      TAIL,
  },
  {
    title: "SEO Q1-2027: Greece - net billing replaces net metering (EL)",
    body:
      HEAD("Greece", "Greek (el-GR).") +
      `
**Status: verify-first.** Greece moved rooftop compensation from net metering to net billing, which changes what an exported unit is worth. The operative instrument and its date must be read at source (ΥΠΕΝ / ΡΑΑΕΥ) and recorded here before drafting; no rate is asserted here.

**Why this post.** Net billing makes self-consumption the paid part and export the discounted part - exactly the arithmetic a Greek buyer needs before signing.

**Required source reads.** The net-billing instrument and date; the compensation rate for exports; the current household tariff including regulated charges.

**Unique intent.** No Greek page on the site.

` +
      TAIL,
  },
  {
    title: "SEO Q1-2027: Ukraine - the green tariff and self-consumption (UK)",
    body:
      HEAD("Ukraine", "Ukrainian (uk-UA).") +
      `
**Status: verify-first.** Rooftop economics here turn on the green tariff's status, curtailment, and the case for self-consumption with storage. The dated trigger and every rate must be read at source (NEURC, the law on the green tariff) and recorded here before drafting.

**Required source reads.** The green-tariff regime and any 2025-2026 amendment, with dates; the current household tariff; whether export is paid, curtailed, or both.

**Unique intent.** No Ukrainian page on the site.

` +
      TAIL,
  },
  {
    title:
      "SEO Q1-2027: Nigeria - banded tariffs and what solar actually offsets (EN)",
    body:
      HEAD("Nigeria", "English.") +
      `
**Status: verify-first.** The angle is that Nigerian rooftop solar competes with a banded tariff and with generator fuel, not with a single kWh price, so the honest comparison is three-way. The band classification, its rates and the fuel-price reference must be read at source (NERC and the published schedule) and recorded here first.

**Required source reads.** The NERC band classification and the current Band A rate; the petrol/diesel reference a household actually pays; the fixed or standing component.

**Unique intent.** No page on the site targets Nigeria.

` +
      TAIL,
  },
  {
    title: "SEO Q1-2027: Mexico - medicion neta and the DAC cliff (ES-MX)",
    body:
      HEAD("Mexico", "Spanish (es-MX), distinct from the site's Spain-framed es copy.") +
      `
**Status: verify-first.** The angle is medición neta under CFE: the DAC threshold, the tariff blocks, and what a rooftop system does to a household sitting just under or just over the DAC line. Every figure must be read at source (CFE's tariff schedule and the net-metering contract terms) and recorded here before drafting.

**Required source reads.** The current CFE domestic tariff blocks and the DAC threshold with dates; the medición neta contract terms including the annual settlement.

**Unique intent.** The site's Spanish copy is European; no page addresses Mexico's DAC cliff.

` +
      TAIL,
  },
];

for (const issue of issues) {
  const r = spawnSync(
    "gh",
    ["issue", "create", "--title", issue.title, "--body", issue.body],
    { encoding: "utf8" },
  );
  console.log((r.stdout || r.stderr || "").trim().split("\n").pop());
}

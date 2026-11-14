// Build the South Africa post (#392-adjacent, tracker #366 "publish first") from
// the wave-1 template.
//
// Facts and their read (primary, 2026-11-14): NERSA, "Consultation Paper on
// Eskom Retail Tariff Structural Adjustment Application for Standard Tariffs
// for the 2027/28 Financial Year", September 2026.
//   - 7 Feb 2026: Energy Regulator approved revised allowable revenue
//     (MYPD6 redetermination after the High Court set aside 2026/27 and
//     2027/28). The 8.83% average increase therefore already existed before
//     the 26 Nov decision; the decision implements the schedule.
//   - 31 Jul 2026: Eskom filed the 2027/28 ERTSA application.
//   - 2 Sep 2026: consultation paper published; comments closed 2 Oct 2026;
//     public hearing 8 Oct 2026; ELS recommendation 3 Nov 2026;
//     Energy Regulator decision 26 Nov 2026; communicated 3 Dec 2026 (Table 3).
//   - Tariffs take effect 1 Apr 2027 for Eskom-supplied customers and
//     1 Jul 2027 for municipal customers, per the MFMA (§2.4).
//   - §5.4.1: the application continues the Generation Capacity Charge and
//     proposes adjustments to the Homepower and Homeflex fixed service charges,
//     while maintaining the approved average increase.
// NOT in the consultation paper, therefore not asserted: the rand amounts of the
// proposed fixed charges (they sit in Eskom's application annexures), and the
// retail price. The worked example uses labelled assumptions only.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

const slug = "nersa-tariff-decision-26-november-2026";
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;
const title = "NERSA decides on 26 November: solar and the fixed charge";
const desc =
  "The 8.83% was set in February. What NERSA decides on 26 November 2026 is how Eskom recovers it — and that moves a solar home's payback.";
const keywords =
  "NERSA 26 November 2026, Eskom tariff decision, Homepower fixed charge, solar payback South Africa, Retail Tariff Plan, Generation Capacity Charge";
const published = "2026-11-14";

const ldKeywords = keywords.split(", ");

const ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      isPartOf: { "@type": "WebPage", "@id": url },
      headline: title,
      name: title,
      description: desc,
      inLanguage: "en-ZA",
      datePublished: `${published}T00:00:00Z`,
      dateModified: `${published}T00:00:00Z`,
      mainEntityOfPage: url,
      image: ["https://freeoffgridcalculator.com/assets/og-card.jpg"],
      author: {
        "@type": "Person",
        name: "Lucas Ballek",
        url: "https://freeoffgridcalculator.com",
      },
      publisher: {
        "@type": "Organization",
        name: "BigEnergyCo",
        url: "https://freeoffgridcalculator.com",
      },
      keywords: ldKeywords,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://freeoffgridcalculator.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://freeoffgridcalculator.com/blog/",
        },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
  ],
};

const head = HEAD.split("eskom-fixed-charge-solar-2027")
  .join(slug)
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(
    /(property="og:description"\s*\n?\s*content=")[^"]*(")/,
    `$1${desc}$2`,
  )
  .replace(/(name="twitter:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(
    /(name="twitter:description"\s*\n?\s*content=")[^"]*(")/,
    `$1${desc}$2`,
  )
  .replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n    </script>`,
  );

const body = `        <h1>${title}</h1>
        <p class="meta">
          Last checked:
          <time datetime="2026-11-14">14 November 2026</time> · Published:
          14 November 2026 · Lucas Ballek
        </p>
        <p>
          The percentage everyone quotes was decided in February. On
          <strong>26 November 2026</strong> the Energy Regulator rules on
          something narrower and, for a household with panels, more expensive:
          <em>how</em> Eskom recovers that revenue — through the energy rate, or
          through the fixed service and capacity charges that no amount of
          self-consumption can touch. This post is about that decision and the
          two implementation dates behind it, not about the headline increase.
        </p>

        <h2>What is actually being decided on 26 November</h2>
        <p>
          NERSA's consultation paper on Eskom's 2027/28 retail tariff structural
          adjustment (ERTSA) is explicit that the process does not reopen the
          allowable revenue: the Energy Regulator approved the revised revenue —
          and with it the average increase — on <strong>7 February 2026</strong>,
          after the High Court set aside the 2026/27 and 2027/28 determination and
          remitted it. The application filed on <strong>31 July 2026</strong> asks
          the Regulator to approve the <em>Schedule of Standard Prices and
          Charges</em> that recovers it.
        </p>
        <p>
          Inside that schedule sits the part that decides a solar home's payback:
          the third year of the Retail Tariff Plan, which continues the
          <strong>Generation Capacity Charge</strong> and proposes adjustments to
          the <strong>Homepower and Homeflex fixed service charges</strong>, with
          the energy rate trimmed to hold the average at the approved figure.
        </p>

        <div class="table-container">
          <table>
            <caption>
              The decision calendar, from the consultation paper (Table 3)
            </caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Step</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>7 Feb 2026</td><td>Allowable revenue and average increase approved (redetermination)</td></tr>
              <tr><td>31 Jul 2026</td><td>Eskom files the 2027/28 ERTSA application</td></tr>
              <tr><td>2 Sep 2026</td><td>Consultation paper published</td></tr>
              <tr><td>2 Oct 2026</td><td>Written comments close</td></tr>
              <tr><td>8 Oct 2026</td><td>Public hearing</td></tr>
              <tr><td>3 Nov 2026</td><td>Recommendation to the Energy Regulator</td></tr>
              <tr><td><strong>26 Nov 2026</strong></td><td><strong>Energy Regulator decision</strong></td></tr>
              <tr><td>3 Dec 2026</td><td>Decision communicated to Eskom</td></tr>
              <tr><td>1 Apr 2027</td><td>New tariffs apply to Eskom-supplied customers</td></tr>
              <tr><td>1 Jul 2027</td><td>New tariffs apply to municipal customers (MFMA)</td></tr>
            </tbody>
          </table>
        </div>

        <h2>Why the structure matters more than the percentage</h2>
        <p>
          A rooftop system reduces the <em>energy</em> line. It does not reduce
          the fixed service charge, the network capacity charge or the
          generation capacity charge — those are billed for being connected and
          for the capacity you are supplied, not for the units you use. So when a
          regulator shifts recovery from energy into those lines, the same roof
          saves less, and the payback that a solar quote shows stretches out
          without anything about the hardware changing.
        </p>
        <p>
          That is the whole reason this decision deserves its own post rather
          than a line in a tariff round-up: it is a decision about the mix, and
          the mix is what a solar calculation is sensitive to.
        </p>

        <h2>A worked example, with every assumption on the table</h2>
        <p class="note">
          Assumptions, labelled as assumptions: a bill of R3,000 a month, of
          which R700 is fixed charges and R2,300 is energy at an implied rate;
          a system that cuts the energy line by 70%. These are example numbers,
          not your bill and not a tariff schedule.
        </p>
        <div class="table-container">
          <table>
            <caption>Monthly bill before and after a 70% energy cut</caption>
            <thead>
              <tr><th>Line</th><th>Before</th><th>After</th></tr>
            </thead>
            <tbody>
              <tr><td>Fixed charges</td><td>R700</td><td>R700</td></tr>
              <tr><td>Energy</td><td>R2,300</td><td>R690</td></tr>
              <tr><td><strong>Total</strong></td><td><strong>R3,000</strong></td><td><strong>R1,390</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The saving is R1,610 a month — 54% — even though the panels cut the
          energy line by 70%. The gap between those two numbers is the fixed
          share. Every increase in that share reduces the best case a solar
          system can reach, regardless of how many panels go on the roof.
        </p>
        <p>
          Run your own bill through the
          <a href="../../#sizing">calculator</a> rather than this example: it
          asks for your fixed charge and your rate separately, and sizes the
          system against the part that can actually move.
        </p>

        <h2>What to do before 26 November</h2>
        <ul>
          <li>
            <strong>Find your tariff name.</strong> Homepower 1–4 and Homeflex
            tiers are billed differently; a municipal account is on a different
            schedule entirely, with its own date (1 July 2027).
          </li>
          <li>
            <strong>Add up the fixed lines on your actual bill.</strong> Service
            and administration, network capacity, generation capacity — if you
            cannot find them separately, that is itself the finding: an unbundled
            bill is what makes this decision legible.
          </li>
          <li>
            <strong>Compute the ceiling.</strong> Fixed charges divided by total
            bill is the share solar can never touch. If it is a third of your
            bill, no system takes you below two-thirds.
          </li>
          <li>
            <strong>Do not sign on the pre-decision numbers.</strong> A quote
            priced against today's split will overstate the saving if the
            approved schedule moves more cost into the fixed lines.
          </li>
        </ul>

        <h2>What this post does not claim</h2>
        <p>
          The rand amounts of the proposed fixed charges are not in the
          consultation paper — they sit in Eskom's application annexures — so this
          post does not repeat them as fact, and it does not predict the
          Regulator's decision. What the paper does say, in its own words, is that
          the application continues the Generation Capacity Charge and proposes
          adjustments to the Homepower and Homeflex fixed service charges. That
          direction is enough to change how a solar quote should be read.
        </p>

        <h2>Frequently asked</h2>
        <details>
          <summary>Is the 8.83% decided on 26 November?</summary>
          <p>
            No. The average increase follows from the allowable revenue approved
            on 7 February 2026 by the Energy Regulator after the High Court
            remitted the 2026/27 and 2027/28 determination. The 26 November
            decision is on the schedule of standard prices and charges that
            implements it.
          </p>
        </details>
        <details>
          <summary>When do the new numbers reach my bill?</summary>
          <p>
            1 April 2027 if Eskom supplies you directly; 1 July 2027 if you buy
            from a municipality, because municipal tariffs follow the MFMA
            calendar.
          </p>
        </details>
        <details>
          <summary>Does a battery help with fixed charges?</summary>
          <p>
            No — nothing on the fixed lines moves with consumption. A battery
            helps with the energy line and with time-of-use pricing, and both are
            worth sizing properly in the
            <a href="../../#sizing">calculator</a>.
          </p>
        </details>

        <h2>Sources</h2>
        <ul>
          <li>
            NERSA, Consultation Paper on Eskom Retail Tariff Structural
            Adjustment Application for Standard Tariffs for the 2027/28 Financial
            Year (September 2026), §2.4, §5.2, §5.4, Table 3 —
            <a
              href="https://www.nersa.org.za/files/files/2026/09/EskomRetailTariffStructuralAdjustmentERTSAconsultationpaperfor2027-28FY.pdf"
              rel="noopener"
              >nersa.org.za</a
            >
          </li>
          <li>
            The same paper's stakeholder questions on the Retail Tariff Plan
            (§5.4) and customer impact (§5.6).
          </li>
        </ul>

`;

mkdirSync(`blog/${slug}`, { recursive: true });
writeFileSync(
  `blog/${slug}/index.html`,
  `${head}${body}${TAIL}`.replace(/\r?\n/g, "\r\n"),
);

// ---- registration -------------------------------------------------------
const eol = "\r\n";

let sitemap = readFileSync("sitemap.xml", "utf8");
if (!sitemap.includes(url))
  sitemap = sitemap.replace(
    "</urlset>",
    `  <url>${eol}    <loc>${url}</loc>${eol}    <lastmod>${published}</lastmod>${eol}    <changefreq>monthly</changefreq>${eol}    <priority>0.9</priority>${eol}  </url>${eol}</urlset>`,
  );
writeFileSync("sitemap.xml", sitemap);

let llms = readFileSync("llms.txt", "utf8");
if (!llms.includes(url)) {
  const anchor =
    "- Solarspitzengesetz and negative prices (Germany, de-DE): https://freeoffgridcalculator.com/blog/solarspitzengesetz-2026-negative-preise/";
  const i = llms.indexOf(anchor);
  if (i < 0) throw new Error("llms anchor missing");
  const at = llms.indexOf("\n", i) + 1;
  llms =
    llms.slice(0, at) +
    `- NERSA's 26 November 2026 tariff decision (South Africa, en-ZA): ${url}${eol}` +
    llms.slice(at);
}
writeFileSync("llms.txt", llms);

let rss = readFileSync("rss.xml", "utf8");
if (!rss.includes(url)) {
  const item = `    <item>${eol}      <title>${title}</title>${eol}      <link>${url}</link>${eol}      <guid isPermaLink="true">${url}</guid>${eol}      <pubDate>Sat, 14 Nov 2026 00:00:00 GMT</pubDate>${eol}      <description>${desc}</description>${eol}    </item>${eol}`;
  rss = rss.replace(/(<lastBuildDate>[^<]*<\/lastBuildDate>\r?\n)/, `$1${item}`);
}
writeFileSync("rss.xml", rss);

let hub = readFileSync("blog/index.html", "utf8");
if (!hub.includes(url)) {
  const ldPost = `          {
            "@type": "BlogPosting",
            "headline": ${JSON.stringify(title)},
            "name": ${JSON.stringify(title)},
            "description": ${JSON.stringify(desc)},
            "inLanguage": "en-ZA",
            "datePublished": "${published}T00:00:00Z",
            "dateModified": "${published}T00:00:00Z",
            "url": "${url}",
            "author": {
              "@type": "Person",
              "name": "Lucas Ballek"
            },
            "image": ["https://freeoffgridcalculator.com/assets/og-card.jpg"]
          },
`;
  hub = hub.replace(/"blogPost": \[\r?\n/, (m) => m + ldPost);
  const card = `        <article class="article-card">
          <div>
            <div class="card-tags">
              <span class="card-tag">Tariffs</span>
              <span class="card-tag">South Africa</span>
              <span class="card-tag">Fixed charges</span>
            </div>
            <h2>
              <a href="./${slug}/">${title}</a>
            </h2>
            <p class="card-excerpt">${desc}</p>
          </div>
          <div class="card-footer">
            <span>14 Nov 2026 &middot; checked 14 Nov 2026</span>
            <a href="./${slug}/" class="read-more">Read the guide &rarr;</a>
          </div>
        </article>
`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
const anchor = `  "blog/solarspitzengesetz-2026-negative-preise/index.html",`;
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(anchor, `${anchor}\n${entry}`);
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);

console.log("built and registered", slug);

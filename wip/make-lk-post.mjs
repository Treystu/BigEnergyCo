// Build the Sri Lanka post (#391) from the wave-1 template.
//
// Primary reads (2026-11-14):
//   PUCSL, Decision on Feed in Tariffs, made 21 Aug 2026, effective 25 Aug 2026
//   (Annex 2): rooftop prosumer FIT -> up to 10 kW LKR 23.11/kWh; 10-40 kW
//   19.15; 40-250 kW 17.11; 250-1000 kW 15.81. New rooftop solar + BESS:
//   45.53/kWh at the priority feed-in time for the first 15 years, 15.81 after.
//   National Electricity Policy (gazetted 5 Mar 2026), clause 1.4.6: all on-grid
//   rooftop agreements, and their extensions, on a "net plus" basis; Ministry
//   directive of 11 Sep 2026 closes Net Metering and Net Accounting to new
//   connections and extensions, caps new agreements at 12 years, requires smart
//   meters. PUCSL letter PUC/EER/2026/EDL/31 (8 Sep 2026) reads net plus as
//   separate measurement with the settlement arrangements preserved.
//   PUCSL, Decision on Electricity Tariffs, made 9 May 2026, effective
//   11 May 2026, unchanged by the 30 Jul 2026 decision (Annex 2): domestic
//   0-30 kWh 5.00; 31-60 9.00 (fixed 80 / 210); 61-90 20.00 with first 60 at
//   14.00 (fixed 400); 91-120 28.00 (fixed 1,000); 121-180 44.00 (fixed 1,500);
//   above 180: first 180 at 32.50, balance at 100.00 (fixed 2,500). A 2.5% SSCL
//   applies on top.
// Not asserted: any system price, and the domestic schedule's exact block
// boundaries beyond the ones the worked example uses.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

const slug = "net-plus-sri-lanka-2026-rooftop";
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;
const title = "Net Plus, Sri Lanka 2026: what your roof now earns";
const desc =
  "Net metering is closed. Under Net Plus every unit is sold at LKR 23.11 while every unit you use is bought at up to LKR 100 — here is the arithmetic.";
const keywords =
  "Net Plus Sri Lanka 2026, rooftop solar feed-in tariff, PUCSL 23.11, net metering scrapped, solar payback Sri Lanka";
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
      inLanguage: "en-LK",
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
  .replace(/(property="og:locale" content=")[^"]*(")/, `$1en_LK$2`)
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
        <p class="note" lang="si">
          සිංහල සාරාංශය: 2026 මාර්තු 5 න් පසු නව සූර්ය සම්බන්ධතා සඳහා නෙට්
          මීටරින්ග් වසා ඇත; දැන් සියල්ල "Net Plus" යටතේ විකුණනු ලැබේ — එක්
          යුනිටයක් සඳහා රු. 23.11 (10 kW දක්වා). නමුත් ඔබ පරිභෝජනය කරන සෑම
          යුනිටයක්ම ඔබ ගෙවන්නේ සාමාන්‍ය ගාස්තුවට — ඒකක 180 ට වැඩි නම් රු. 100
          දක්වා. එබැවින් එකම වහල, එකම පද්ධතිය, දැන් වැඩි මිලක්.
        </p>
        <p>
          On <strong>5 March 2026</strong> Sri Lanka's National Electricity Policy
          took the country's rooftop market off net metering: every new on-grid
          agreement, and every extension of an old one, must run on a
          <strong>Net Plus</strong> basis. A Ministry of Energy directive dated
          <strong>11 September 2026</strong> told distribution licensees to stop
          accepting Net Metering and Net Accounting applications altogether, to
          cap new Net Plus agreements at <strong>12 years</strong>, and to require
          smart meters. What did not change is the price: PUCSL's feed-in tariff
          decision of 21 August 2026, effective 25 August, still pays.
        </p>

        <h2>The two prices that decide everything</h2>
        <div class="table-container">
          <table>
            <caption>
              PUCSL decisions in force: what export earns, and what import costs
            </caption>
            <thead>
              <tr>
                <th>Item</th>
                <th>Rate</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Feed-in tariff, new rooftop PV up to 10 kW</td>
                <td><strong>LKR 23.11/kWh</strong></td>
                <td>PUCSL decision 21 Aug 2026, effective 25 Aug 2026</td>
              </tr>
              <tr><td>10–40 kW</td><td>LKR 19.15/kWh</td><td>same</td></tr>
              <tr><td>40–250 kW</td><td>LKR 17.11/kWh</td><td>same</td></tr>
              <tr><td>250–1,000 kW</td><td>LKR 15.81/kWh</td><td>same</td></tr>
              <tr>
                <td>New rooftop PV <em>with</em> battery storage</td>
                <td>LKR 45.53/kWh at the priority feed-in time,<br />first 15 years; LKR 15.81 after</td>
                <td>same, Annex 2</td>
              </tr>
              <tr>
                <td>Domestic import, above 180 units a month</td>
                <td>
                  first 180 units LKR 32.50, balance <strong>LKR 100.00</strong>;
                  fixed charge LKR 2,500
                </td>
                <td>PUCSL tariff decision 9 May 2026, effective 11 May 2026</td>
              </tr>
              <tr>
                <td>Domestic import, 121–180 units</td>
                <td>LKR 44.00 for that block; fixed charge LKR 1,500</td>
                <td>same</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="note">
          A 2.5% Social Security Contribution Levy applies on top of the monthly
          bill. Domestic rates are block-based: your total consumption picks the
          band, and the band prices the units. The full block table runs 5.00 /
          9.00 / 20.00 / 28.00 / 44.00 / 32.50 / 100.00 from the PUCSL Annex 2 of
          the May 2026 decision.
        </p>

        <h2>Why the same roof is now worth less</h2>
        <p>
          Net metering cancelled units against each other: a unit you generated
          erased a unit you would have bought, at whatever the marginal block
          cost. Net Plus does not cancel anything. Every generated unit is sold at
          the feed-in tariff, and every unit you consume is bought at your block
          rate — separately, on two meters. When your marginal block is
          <strong>LKR 100</strong> and the feed-in tariff is
          <strong>LKR 23.11</strong>, the two meters are not a formality; they are
          a 4.3× spread, and it runs against the household.
        </p>

        <h2>A worked month, both schemes</h2>
        <p class="note">
          Assumptions, labelled: 300 units consumed a month; a 3 kW system
          producing 360 units (4 kWh per kW per day); the PUCSL rates above. No
          system price is assumed, so this is a monthly cash comparison, not a
          payback.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Monthly cash, 300 units used and 360 generated
            </caption>
            <thead>
              <tr>
                <th>Line</th>
                <th>Old net metering</th>
                <th>Net Plus (now)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Units bought from the grid</td>
                <td>0 (360 offsets 300, 60 banked)</td>
                <td>300</td>
              </tr>
              <tr>
                <td>Energy charge</td>
                <td>LKR 0</td>
                <td>LKR 17,850</td>
              </tr>
              <tr>
                <td>Fixed charge</td>
                <td>LKR 2,500</td>
                <td>LKR 2,500</td>
              </tr>
              <tr>
                <td>Export credit</td>
                <td>LKR 0 (banked, not paid)</td>
                <td>−LKR 8,320</td>
              </tr>
              <tr>
                <td><strong>Net monthly cost</strong></td>
                <td><strong>LKR 2,500</strong></td>
                <td><strong>LKR 12,030</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          That is the whole story, and it is not the story most Sri Lankan solar
          pages tell. The system did not get worse; the settlement changed. Under
          Net Plus the value of a rooftop comes from the <em>rate you avoid</em>
          versus the <em>rate you are paid</em>, and for a household in the top
          band the gap is enormous.
        </p>
        <p class="note">
          The arithmetic above is deliberately conservative in one direction and
          generous in another: it ignores the 60 banked units net metering used to
          carry forward (which made it better still), and it ignores the 2.5%
          SSCL on both bills (which scales both columns). The comparison it shows
          is the direction, not the cent.
        </p>

        <h2>What actually works under Net Plus</h2>
        <ul>
          <li>
            <strong>Cut consumption before sizing generation.</strong> Under Net
            Plus the block you land in sets your import price; dropping from the
            above-180 band to 121–180 changes the rate from 100 to 44 on the
            balance.
          </li>
          <li>
            <strong>Look hard at the battery tariff.</strong> The same decision
            creates a separate feed-in tariff for new rooftop PV <em>with</em>
            storage: <strong>LKR 45.53/kWh</strong> at the priority feed-in time
            for the first 15 years. That is roughly double the solar-only rate, and
            it is the only route the schedule offers back toward the old value.
          </li>
          <li>
            <strong>Check the 12-year term.</strong> Net Plus agreements are capped
            at 12 years, so any payback beyond that horizon is outside the
            contract's life.
          </li>
          <li>
            <strong>Model it, do not quote it.</strong> The
            <a href="../../#sizing">calculator</a> takes your monthly units and
            your tariff and shows what a system does to the bill you actually pay.
          </li>
        </ul>

        <h2>Frequently asked</h2>
        <details>
          <summary>Can I still get net metering if I applied before March?</summary>
          <p>
            Existing agreements keep their terms until they expire; extensions
            move to Net Plus. The 11 September directive closed new applications
            and extensions under the old schemes.
          </p>
        </details>
        <details>
          <summary>Do I still pay for the units my panels make?</summary>
          <p>
            You pay for every unit you <em>consume</em>, at your block rate, and you
            are paid for every unit you <em>generate</em>, at the feed-in tariff.
            Under Net Plus the two are measured separately.
          </p>
        </details>
        <details>
          <summary>Is the feed-in tariff fixed for the whole agreement?</summary>
          <p>
            The approved rates are effective from 25 August 2026 until the next
            tariff revision. The 12-year agreement term and the revision cycle are
            separate things, so read your agreement for which rate it locks.
          </p>
        </details>

        <h2>Sources</h2>
        <ul>
          <li>
            PUCSL, Decision on Feed in Tariffs, 21 August 2026 (Annex 2) —
            <a href="https://www.pucsl.gov.lk/wp-content/uploads/2026/08/Full-Final-Decision-on-Feed-in-Tariffs-August-2026.pdf" rel="noopener"
              >pucsl.gov.lk</a
            >
          </li>
          <li>
            PUCSL, Decision on Electricity Tariffs, 9 May 2026, effective 11 May
            2026 —
            <a href="https://www.pucsl.gov.lk/wp-content/uploads/2026/05/Full-Final_Decision-on-Electricity-Tariffs-May-2026.pdf" rel="noopener"
              >pucsl.gov.lk</a
            >
          </li>
          <li>
            PUCSL, Decision on Electricity Tariffs, 30 July 2026 (tariffs
            maintained) —
            <a href="https://www.pucsl.gov.lk/wp-content/uploads/2026/07/Full-Decision-on-Electricity-Tariffs-July-2026.pdf" rel="noopener"
              >pucsl.gov.lk</a
            >
          </li>
          <li>
            PUCSL letter PUC/EER/2026/EDL/31, 8 September 2026 (net plus as
            separate measurement) —
            <a href="https://www.pucsl.gov.lk/wp-content/uploads/2026/09/PUC-EER-2026_EDL_31.pdf" rel="noopener"
              >pucsl.gov.lk</a
            >
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
    "- NERSA's 26 November 2026 tariff decision (South Africa, en-ZA): https://freeoffgridcalculator.com/blog/nersa-tariff-decision-26-november-2026/";
  const i = llms.indexOf(anchor);
  if (i < 0) throw new Error("llms anchor missing");
  const at = llms.indexOf("\n", i) + 1;
  llms =
    llms.slice(0, at) +
    `- Net Plus replaces net metering (Sri Lanka, en-LK): ${url}${eol}` +
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
            "inLanguage": "en-LK",
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
              <span class="card-tag">Net Plus</span>
              <span class="card-tag">Sri Lanka</span>
              <span class="card-tag">Feed-in tariff</span>
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
const anchor = `  "blog/nersa-tariff-decision-26-november-2026/index.html",`;
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(anchor, `${anchor}\n${entry}`);
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);

console.log("built and registered", slug);

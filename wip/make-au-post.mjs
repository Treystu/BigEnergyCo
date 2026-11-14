// Build the Australia (en-AU) wave-2 post (#380) and register it.
// Facts: CER deeming-period table (2026=5, 2027=4 ... 2030=1), CER postcode
// zone ratings (1.622/1.536/1.382/1.185), CER quarterly report STC spot price
// (Q1 2026, $39.62 at 15 May) and the $40 clearing-house price.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));
const slug = "stc-deeming-period-2027-australia";
const title = "STC Deeming Period Falls to 4 Years on 1 Jan 2027";
const desc =
  "Australia's solar rebate is deemed over one fewer year from 1 January 2027. What that costs a 6.6 kW system, by zone, in dollars.";
const keywords =
  "STC deeming period 2027, solar rebate Australia 2027, small-scale technology certificates, STC zone rating, 6.6kW solar rebate";
const published = "2026-11-11";

let head = HEAD.split("eskom-fixed-charge-solar-2027").join(slug)
  .replace(/<html lang="en">/, '<html lang="en-AU">')
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(/(property="og:description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(property="og:locale" content=")[^"]*(")/, `$1en_AU$2`)
  .replace(/(name="twitter:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(/(name="twitter:description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/"headline": "[^"]*"/, `"headline": ${JSON.stringify(title)}`)
  .replace(/"name": "[^"]*"/, `"name": ${JSON.stringify(title)}`)
  .replace(/"description": "[^"]*"/, `"description": ${JSON.stringify(desc)}`)
  .replace(/"datePublished": "[^"]*"/, `"datePublished": "${published}T00:00:00Z"`)
  .replace(/"dateModified": "[^"]*"/, `"dateModified": "${published}T00:00:00Z"`)
  .replace(
    /"keywords": \[[\s\S]*?\]/,
    `"keywords": [${keywords.split(", ").map((k) => JSON.stringify(k)).join(", ")}]`,
  );

const body = `        <h1>${title}</h1>
        <p class="meta">
          Last checked: <time datetime="2026-11-11">11 November 2026</time> ·
          Published: 11 November 2026 · Lucas Ballek
        </p>
        <p>
          From <strong>1 January 2027</strong> a rooftop solar system installed in
          Australia is deemed to generate certificates for
          <strong>four years instead of five</strong>, because the
          Small-scale Renewable Energy Scheme runs to 31 December 2030 and the
          deeming period is the years of the scheme that remain. The panels, the
          inverter and the installer's price do not change. The rebate does, and
          it falls by a fifth. This page does the arithmetic rather than the
          deadline theatre: what the step-down costs, and what chasing it could
          cost you.
        </p>
        <h2>The schedule, from the regulator's own table</h2>
        <div class="table-container">
          <table>
            <caption>
              Deeming period by installation year (Clean Energy Regulator)
            </caption>
            <thead>
              <tr>
                <th scope="col">Install year</th>
                <th scope="col">Deeming period</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>2025</td><td>6 years</td></tr>
              <tr><td>2026</td><td>5 years</td></tr>
              <tr><td><strong>2027</strong></td><td><strong>4 years</strong></td></tr>
              <tr><td>2028</td><td>3 years</td></tr>
              <tr><td>2029</td><td>2 years</td></tr>
              <tr><td>2030</td><td>1 year</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          This is a scheduled annual reduction, not a policy surprise: the scheme
          lapses at the end of 2030 and the certificate count shrinks with it.
        </p>
        <h2>How certificates are counted</h2>
        <p>The regulator's formula for a solar PV system is:</p>
        <p class="formula">
          <strong>STCs = system kW × postcode zone rating × deeming years</strong>,
          rounded down
        </p>
        <p>
          The zone rating is a sunshine factor attached to your postcode, not to
          your nearest city, and the regulator publishes it as a table rather than
          a rule of thumb. The four ratings are
          <strong>1.622 (zone 1), 1.536 (zone 2), 1.382 (zone 3) and 1.185
          (zone 4)</strong>. Sydney, Brisbane, Perth, Adelaide and Canberra sit in
          zone 3 and Melbourne and Hobart in zone 4, but a postcode that is close
          to a boundary is exactly where people get this wrong — look yours up.
        </p>
        <h2>What the step-down costs, in dollars</h2>
        <p>
          A 6.6 kW system is the common Australian residential size, so use it.
          Certificates are counted at the clearing-house price of
          <strong>$40 each</strong>, a fixed number the regulator administers; the
          open-market spot price moves around it (it sat near $39.62 in the
          regulator's Q1 2026 report), so a quote that assumes a higher price is
          making an assumption you can check.
        </p>
        <div class="table-container">
          <table>
            <caption>
              6.6 kW system, certificates and value at $40
            </caption>
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col">Rating</th>
                <th scope="col">2026 (5 yr)</th>
                <th scope="col">2027 (4 yr)</th>
                <th scope="col">Loss</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Zone 1</td><td>1.622</td>
                <td>53 STCs · $2,120</td><td>42 STCs · $1,680</td>
                <td>$440</td>
              </tr>
              <tr>
                <td>Zone 2</td><td>1.536</td>
                <td>50 STCs · $2,000</td><td>40 STCs · $1,600</td>
                <td>$400</td>
              </tr>
              <tr>
                <td><strong>Zone 3</strong></td><td>1.382</td>
                <td>45 STCs · $1,800</td><td>36 STCs · $1,440</td>
                <td><strong>$360</strong></td>
              </tr>
              <tr>
                <td>Zone 4</td><td>1.185</td>
                <td>39 STCs · $1,560</td><td>31 STCs · $1,240</td>
                <td>$320</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          So the honest headline for most of the population is
          <strong>about $360 less</strong> on a 6.6 kW system, not thousands. The
          percentage is bigger than the number: nine fewer certificates is a fifth
          of the rebate.
        </p>
        <h2>The part the deadline posts leave out</h2>
        <p>
          "Install before January to lock in the higher rebate" is true as far as
          it goes, and still usually bad advice on its own. Rushing a purchase to
          capture $360 has three costs that are easy to ignore:
        </p>
        <ul>
          <li>
            <strong>You buy a year of electricity early.</strong> A system
            installed in December instead of March generates power you would
            otherwise have bought for three months — which may be more than the
            rebate difference, or less, depending on your tariff.
          </li>
          <li>
            <strong>Quotes get worse in a rush.</strong> The discount is a fixed
            number of certificates; a rushed install can easily absorb the
            difference in a padded price, and you will not see it on the quote.
          </li>
          <li>
            <strong>Prices are falling.</strong> Modules and batteries have been
            getting cheaper, so a January install is buying hardware in a cheaper
            market than a December one. Nobody can promise which effect wins for
            you — that is what the sizing arithmetic is for.
          </li>
        </ul>
        <p>
          The decision is a comparison, not a countdown: rebate difference versus
          months of generation versus quote quality.
        </p>
        <h2>Batteries step down too, every six months</h2>
        <p>
          A battery is counted under a separate factor that changes twice a year.
          For an eligible battery of 5 to 100 kWh nominal capacity, the factor is
          <strong>6.8 certificates per kWh from 1 May to 31 December 2026</strong>
          and <strong>5.7 per kWh from 1 January to 30 June 2027</strong>. That is a
          steeper relative fall than the solar step-down, and it applies to the
          battery alone — a battery quoted as "free" or "heavily discounted" is
          usually showing you this factor, not a price cut.
        </p>
        <h2>What to check before you sign anything</h2>
        <ul>
          <li>
            <strong>Your postcode's zone rating</strong>, from the regulator's
            table — not from the state capital.
          </li>
          <li>
            <strong>Which deeming year your quote assumes.</strong> The date that
            counts is the installation date on the certificate of compliance, not
            the date you signed.
          </li>
          <li>
            <strong>The certificate price in the quote.</strong> Ask for it
            explicitly; the clearing-house price is $40 and the spot price moves.
          </li>
          <li>
            <strong>The 100 kW cap.</strong> Residential systems are nowhere near
            it, but a farm or a small business quote may be.
          </li>
        </ul>
        <div class="cta-box">
          <p>
            <strong>Price the system on your own consumption, not on the
            rebate.</strong> Enter your location and usage: the calculator sizes
            the array from hourly climate data and shows the levelised cost beside
            what you pay the grid.
          </p>
          <a class="btn" href="../../#sizing">Size my system</a>
        </div>
`;

mkdirSync(`blog/${slug}`, { recursive: true });
writeFileSync(`blog/${slug}/index.html`, head + body + TAIL);
console.log(`wrote blog/${slug}/index.html (${(head + body + TAIL).length} bytes)`);

// sitemap
let sitemap = readFileSync("sitemap.xml", "utf8");
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;
if (!sitemap.includes(url))
  sitemap = sitemap.replace(
    "</urlset>",
    `  <url>\n    <loc>${url}</loc>\n    <lastmod>${published}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`,
  );
writeFileSync("sitemap.xml", sitemap);

// llms.txt
let llms = readFileSync("llms.txt", "utf8");
const anchor =
  "- Giá điện 5 bậc 2026 (Vietnam): https://freeoffgridcalculator.com/blog/gia-dien-5-bac-2026/\r\n";
if (!llms.includes(url)) {
  if (!llms.includes(anchor)) throw new Error("llms.txt anchor missing");
  llms = llms.replace(anchor, `${anchor}- STC deeming period 2027 (Australia): ${url}\r\n`);
}
writeFileSync("llms.txt", llms);

// rss
let rss = readFileSync("rss.xml", "utf8");
if (!rss.includes(url)) {
  const item = `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>Wed, 11 Nov 2026 00:00:00 GMT</pubDate>
      <description>${desc.replace(/&/g, "&amp;")}</description>
    </item>
`;
  rss = rss.replace(/(<lastBuildDate>[^<]*<\/lastBuildDate>\r?\n)/, `$1${item}`);
}
writeFileSync("rss.xml", rss);

// hub card + BlogPosting
let hub = readFileSync("blog/index.html", "utf8");
if (!hub.includes(url)) {
  const ld = `          {
            "@type": "BlogPosting",
            "headline": ${JSON.stringify(title)},
            "name": ${JSON.stringify(title)},
            "description": ${JSON.stringify(desc)},
            "inLanguage": "en-AU",
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
  hub = hub.replace(/"blogPost": \[\r?\n/, (m) => m + ld);
  const card = `        <article class="article-card">
          <div>
            <div class="card-tags">
              <span class="card-tag">Rebates</span>
              <span class="card-tag">Australia</span>
              <span class="card-tag">STC</span>
            </div>
            <h2>
              <a href="./${slug}/">${title}</a>
            </h2>
            <p class="card-excerpt">${desc}</p>
          </div>
          <div class="card-footer">
            <span>11 Nov 2026 &middot; checked 11 Nov 2026</span>
            <a href="./${slug}/" class="read-more">Read guide &rarr;</a>
          </div>
        </article>
`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

// deploy allowlist
let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(
    '  "blog/gia-dien-5-bac-2026/index.html",',
    '  "blog/gia-dien-5-bac-2026/index.html",\n' + entry,
  );
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);
console.log("registered", slug);

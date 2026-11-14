// Register the South Africa post in sitemap, llms.txt, rss and the blog hub.
import { readFileSync, writeFileSync } from "node:fs";

const URL = "https://freeoffgridcalculator.com/blog/eskom-fixed-charge-solar-2027/";
const SLUG = "eskom-fixed-charge-solar-2027";
const TITLE = "Eskom's Fixed Charge and Solar: 2027 Payback Math";
const DESC =
  "NERSA decides Eskom's 2027 tariff structure on 26 Nov 2026. What a heavier fixed charge does to solar and battery payback, with rand worked examples.";

function edit(path, fn) {
  const before = readFileSync(path, "utf8");
  const after = fn(before);
  if (after === before) throw new Error(`${path}: no change applied`);
  writeFileSync(path, after);
  console.log(`updated ${path}`);
}

// 1. sitemap
edit("sitemap.xml", (s) => {
  if (s.includes(URL)) throw new Error("sitemap already lists the post");
  const entry = `  <url>\n    <loc>${URL}</loc>\n    <lastmod>2026-11-11</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  return s.replace("</urlset>", entry + "</urlset>");
});

// 2. llms.txt
edit("llms.txt", (s) => {
  const line = `- Eskom's fixed charge and what it does to solar payback: ${URL}\r\n`;
  const anchor =
    "- The Netherlands ends net metering in 2027: https://freeoffgridcalculator.com/blog/salderingsregeling-stopt-2027/\r\n";
  if (!s.includes(anchor)) throw new Error("llms.txt anchor missing");
  return s.replace(anchor, anchor + line);
});

// 3. rss.xml
edit("rss.xml", (s) => {
  const item = `    <item>
      <title>Eskom's Fixed Charge and Solar: 2027 Payback Math</title>
      <link>${URL}</link>
      <guid isPermaLink="true">${URL}</guid>
      <pubDate>Wed, 11 Nov 2026 00:00:00 GMT</pubDate>
      <description>NERSA decides Eskom's 2027 tariff structure on 26 November. A worked example in rand shows why a heavier fixed line trims the value of every self-consumed kWh.</description>
    </item>
`;
  const out = s
    .replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/, "<lastBuildDate>Wed, 11 Nov 2026 00:00:00 GMT</lastBuildDate>")
    .replace(/(<lastBuildDate>[^<]*<\/lastBuildDate>\r?\n)/, `$1${item}`);
  return out;
});

// 4. blog hub: JSON-LD entry + card
edit("blog/index.html", (s) => {
  const ld = `          {
            "@type": "BlogPosting",
            "headline": ${JSON.stringify(TITLE)},
            "name": ${JSON.stringify(TITLE)},
            "description": ${JSON.stringify(DESC)},
            "inLanguage": "en-ZA",
            "datePublished": "2026-11-11T00:00:00Z",
            "dateModified": "2026-11-11T00:00:00Z",
            "url": "${URL}",
            "author": {
              "@type": "Person",
              "name": "Lucas Ballek"
            },
            "image": ["https://freeoffgridcalculator.com/assets/og-card.jpg"]
          },
`;
  let out = s.replace(/"blogPost": \[\r?\n/, (m) => m + ld);

  const card = `        <!-- Article: South Africa 2027 fixed charge -->
        <article class="article-card">
          <div>
            <div class="card-tags">
              <span class="card-tag">Tariffs</span>
              <span class="card-tag">South Africa</span>
              <span class="card-tag">Payback</span>
            </div>
            <h2>
              <a href="./${SLUG}/"
                >Eskom's fixed charge: what it does to solar payback</a
              >
            </h2>
            <p class="card-excerpt">
              NERSA decides Eskom's 2027 tariff structure on 26 November. A
              worked example in rand shows why a heavier fixed line trims the
              value of every self-consumed kWh.
            </p>
          </div>
          <div class="card-footer">
            <span>11 nov 2026 &middot; checked 11 nov 2026</span>
            <a href="./${SLUG}/" class="read-more">Read guide &rarr;</a>
          </div>
        </article>
`;
  const firstCard = out.indexOf('<article class="article-card">');
  if (firstCard < 0) throw new Error("blog hub: no card anchor");
  out = out.slice(0, firstCard) + card + out.slice(firstCard);
  return out;
});

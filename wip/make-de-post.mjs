// Build the German (#392) post from the wave-1 template.
//
// Facts and their reads (primary sources, checked 2026-11-14):
//   Solarspitzengesetz = Gesetz zur Änderung des Energiewirtschaftsrechts zur
//   Vermeidung von temporären Erzeugungsüberschüssen, BGBl. 2025 I Nr. 51 of
//   24 Feb 2025, in force for commissioning from 25 Feb 2025.
//   § 9 Abs. 2 EEG: export capped at 60% of installed capacity until an
//   intelligent metering system is installed (plants below 25 kW).
//   § 51 Abs. 1 EEG: anzulegender Wert falls to zero in quarter-hours with a
//   negative spot price; Abs. 2 exempts plants under 100 kW until the end of
//   the calendar year in which the iMSys is installed, and plants under 2 kW
//   until the BNetzA Festlegung after § 85 Abs. 2 Nr. 12 (none yet).
//   § 51a Abs. 1/2: the tariff period is extended by the zeroed quarter-hours;
//   for solar the credit is multiplied by 0.5.
//   § 100 Abs. 46: plants commissioned 1 Jan 2023 - 24 Feb 2025 keep §§ 51,
//   51a as of 24 Feb 2025 (the 4-3-2-1-hour rule, no reduction below 400 kW).
//   § 100 Abs. 47: operators may opt in by written declaration.
// NOT verified, therefore not asserted as fact: the feed-in rate for any
// commissioning year (the post says to read the BNetzA table), and the retail
// electricity price (used only as a stated assumption in the worked example).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

const slug = "solarspitzengesetz-2026-negative-preise";
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;
const title = "Solarspitzengesetz: Was § 51 EEG für dich bedeutet";
const desc =
  "Seit 25. Februar 2025: 60 % Einspeisedeckel bis zum Smart Meter, 0 ct in Negativpreis-Viertelstunden, verlängerter Vergütungszeitraum. Was das rechnet.";
const keywords =
  "Solarspitzengesetz, § 51 EEG, negative Strompreise Photovoltaik, 60 Prozent Einspeisedeckel, Einspeisevergütung 2026, Eigenverbrauch";
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
      inLanguage: "de-DE",
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
  .replace(/<html lang="en">/, '<html lang="de">')
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(
    /(property="og:description"\s*\n?\s*content=")[^"]*(")/,
    `$1${desc}$2`,
  )
  .replace(/(property="og:locale" content=")[^"]*(")/, `$1de_DE$2`)
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
          Zuletzt geprüft:
          <time datetime="2026-11-14">14. November 2026</time> · Veröffentlicht:
          14. November 2026 · Lucas Ballek
        </p>
        <p>
          Seit dem 25. Februar 2025 gelten für neue Photovoltaikanlagen drei
          Regeln, die zusammen eine einzige Frage entscheiden: Wie viel von
          deinem Ertrag wird noch sicher bezahlt? Dieser Beitrag rechnet das
          durch — mit dem Gesetzestext als Quelle und einer Beispielrechnung, in
          der jede Annahme offensteht. Die Vergütungssätze selbst nennen wir
          nicht als Zahl, weil sie vom Inbetriebnahmejahr abhängen; die
          Bundesnetzagentur veröffentlicht die Tabelle, und dort liest man sie
          nach.
        </p>

        <h2>Die drei Regeln, die zusammen wirken</h2>
        <div class="table-container">
          <table>
            <caption>
              Solarspitzengesetz (BGBl. 2025 I Nr. 51), anwendbar auf Anlagen ab
              Inbetriebnahme 25.02.2025
            </caption>
            <thead>
              <tr>
                <th>Regel</th>
                <th>Was sie sagt</th>
                <th>Norm</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Einspeisedeckel</td>
                <td>
                  Höchstens 60 % der installierten Leistung dürfen eingespeist
                  werden, bis ein intelligentes Messsystem (Smart Meter)
                  eingebaut ist — bei Anlagen unter 25 kW.
                </td>
                <td>§ 9 Abs. 2 EEG</td>
              </tr>
              <tr>
                <td>Nullvergütung</td>
                <td>
                  In jeder Viertelstunde mit negativem Börsenpreis sinkt der
                  anzulegende Wert auf null: Wer dann einspeist, bekommt für
                  diese Viertelstunde nichts.
                </td>
                <td>§ 51 Abs. 1 EEG</td>
              </tr>
              <tr>
                <td>Verlängerung</td>
                <td>
                  Der Vergütungszeitraum verlängert sich um die genullten
                  Viertelstunden — bei Solar aber nur zur Hälfte angerechnet.
                </td>
                <td>§ 51a Abs. 1 und 2 EEG</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="note">
          Die Ausnahme in § 51 Abs. 2 ist der Punkt, an dem die meisten
          Darstellungen ungenau werden: Anlagen unter 100 kW trifft die
          Nullvergütung erst ab dem Ende des Kalenderjahres, in dem das
          intelligente Messsystem eingebaut wird. Anlagen unter 2 kW sind
          ausgenommen, bis die Bundesnetzagentur die Festlegung nach § 85 Abs. 2
          Nr. 12 getroffen hat — eine solche Festlegung lag zuletzt nicht vor.
        </p>

        <h2>Wer betroffen ist — und wer nicht</h2>
        <p>
          Entscheidend sind zwei Angaben: das Inbetriebnahmedatum und die
          installierte Leistung. Für Anlagen, die vor dem 25. Februar 2025
          ans Netz gingen, gilt nach § 100 Abs. 46 EEG weiter die alte Fassung;
          wer will, kann nach § 100 Abs. 47 schriftlich erklären, dass die neuen
          §§ 51 und 51a angewendet werden sollen. Das ist eine Entscheidung mit
          Folgen in beide Richtungen und keine Formalie.
        </p>
        <ul>
          <li>
            <strong>Vor 2023 in Betrieb:</strong> Es gelten die Regeln des
            jeweiligen Inbetriebnahmejahres.
          </li>
          <li>
            <strong>1. Januar 2023 bis 24. Februar 2025:</strong> Für Anlagen
            unter 400 kW sah die alte Fassung keine Kürzung bei negativen
            Preisen vor; ab 400 kW griff die 4-3-2-1-Stunden-Regel.
          </li>
          <li>
            <strong>Ab 25. Februar 2025:</strong> Der Deckel und die
            Viertelstunden-Nullung gelten — mit der 100-kW-Ausnahme oben.
          </li>
        </ul>

        <h2>Was das finanziell heißt</h2>
        <p>
          Die Rechnung, die zählt, ist der Vergleich zweier Kilowattstunden:
          einer, die du selbst verbrauchst, und einer, die du einspeist. Die
          selbst verbrauchte Kilowattstunde ersetzt Strom zum Haushaltspreis; die
          eingespeiste bringt die Einspeisevergütung — und in negativen
          Viertelstunden gar nichts.
        </p>
        <p class="note">
          Annahmen der Beispielrechnung, ausdrücklich als Annahmen: 10 kWp,
          900 kWh pro kWp und Jahr (9.000 kWh), 30 % Eigenverbrauch, 0,35 €/kWh
          Haushaltsstrompreis und 0,07 €/kWh Einspeisevergütung. Beide Preise
          sind gesetzte Annahmen für das Rechenbeispiel, keine Aussage über
          deinen Vertrag oder dein Inbetriebnahmejahr.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Jahresertrag, 10 kWp, in Euro (Annahmen siehe oben)
            </caption>
            <thead>
              <tr>
                <th>Posten</th>
                <th>Menge</th>
                <th>Wert</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Eigenverbrauch (30 %)</td>
                <td>2.700 kWh</td>
                <td>945 €</td>
              </tr>
              <tr>
                <td>Einspeisung (70 %)</td>
                <td>6.300 kWh</td>
                <td>441 €</td>
              </tr>
              <tr>
                <td><strong>Summe</strong></td>
                <td>9.000 kWh</td>
                <td><strong>1.386 €</strong></td>
              </tr>
              <tr>
                <td>Vergleich: Volleinspeisung</td>
                <td>9.000 kWh</td>
                <td>630 €</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Der Unterschied ist kein Rundungsfehler: Eine selbst verbrauchte
          Kilowattstunde bringt in diesem Beispiel das Fünffache einer
          eingespeisten. Genau deshalb sind Speicher und Lastverschiebung seit
          dem Solarspitzengesetz keine Kür mehr, sondern der Teil der Anlage,
          der die Rendite trägt. Wie groß dein Speicher sein sollte, hängt an
          deinem Verbrauchsprofil — das rechnet der
          <a href="../../#sizing">Rechner</a> durch, inklusive der Frage, was
          eine größere Anlage bei deinem Deckel überhaupt noch einbringt.
        </p>

        <h2>Der 60-%-Deckel in der Praxis</h2>
        <p>
          Bei 10 kWp heißt der Deckel: 6 kW dürfen eingespeist werden, bis das
          intelligente Messsystem sitzt. An einem klaren Mittag produziert eine
          solche Anlage deutlich mehr; der Wechselrichter muss dann abregeln oder
          der Speicher muss die Spitze aufnehmen. Wer den Deckel bei der
          Auslegung ignoriert, kauft Leistung, die zeitweise nicht ins Netz darf
          — und merkt es erst im ersten Frühsommer.
        </p>

        <h2>Was du konkret tun kannst</h2>
        <ul>
          <li>
            <strong>Messsystem nicht ausbremsen.</strong> Der Einbau beendet die
            Ausnahme nach § 51 Abs. 2 — und startet die Uhr für die
            Viertelstunden-Nullung.
          </li>
          <li>
            <strong>Eigenverbrauch erhöhen.</strong> Jede verlagerte
            Kilowattstunde (Wärmepumpe, Warmwasser, Laden) ist mehr wert als
            jede zusätzliche eingespeiste.
          </li>
          <li>
            <strong>Speicher nach Profil, nicht nach Katalog.</strong> Die
            richtige Größe folgt aus Verbrauch und Deckel, nicht aus dem
            Datenblatt.
          </li>
          <li>
            <strong>Volleinspeisung prüfen,</strong> wenn du den Strom nicht
            selbst nutzen kannst: Sie hat eigene Vergütungssätze und ist für
            manche Dächer die ehrlichere Variante.
          </li>
        </ul>

        <h2>Häufige Fragen</h2>
        <details>
          <summary>Gilt das auch für meine Bestandsanlage?</summary>
          <p>
            Nein. § 100 Abs. 46 EEG lässt Anlagen, die vor dem 25. Februar 2025
            in Betrieb gingen, bei der alten Fassung. Ein Wechsel ist nur durch
            die schriftliche Erklärung nach § 100 Abs. 47 möglich — freiwillig,
            und vorher durchzurechnen.
          </p>
        </details>
        <details>
          <summary>Bekomme ich in negativen Preisstunden wirklich nichts?</summary>
          <p>
            Für die <em>Einspeisung</em> in diesen Viertelstunden: ja, der
            anzulegende Wert ist dann null (§ 51 Abs. 1). Dein eigener Verbrauch
            bleibt davon unberührt — du sparst weiter den Haushaltsstrompreis.
          </p>
        </details>
        <details>
          <summary>Wird der Vergütungszeitraum verlängert?</summary>
          <p>
            Ja, um die genullten Viertelstunden (§ 51a Abs. 1), bei
            Solaranlagen mit dem Faktor 0,5 (§ 51a Abs. 2). Aufgerundet wird auf
            volle Viertelstunden beziehungsweise Kalendertage, je nach Absatz.
          </p>
        </details>

        <h2>Quellen</h2>
        <ul>
          <li>
            § 51 EEG 2023 —
            <a href="https://www.gesetze-im-internet.de/eeg_2014/__51.html" rel="noopener"
              >gesetze-im-internet.de</a
            >
          </li>
          <li>
            § 51a EEG 2023 —
            <a href="https://www.gesetze-im-internet.de/eeg_2014/__51a.html" rel="noopener"
              >gesetze-im-internet.de</a
            >
          </li>
          <li>
            § 100 EEG 2023 (Übergangsvorschriften, Abs. 46 und 47) —
            <a href="https://www.gesetze-im-internet.de/eeg_2014/__100.html" rel="noopener"
              >gesetze-im-internet.de</a
            >
          </li>
          <li>
            Clearingstelle EEG|KWKG, Rechtsfrage 264 (welche Fassung wann gilt,
            Stand der Festlegung nach § 85 Abs. 2 Nr. 12) —
            <a href="https://www.clearingstelle-eeg-kwkg.de/haeufige-rechtsfrage/264" rel="noopener"
              >clearingstelle-eeg-kwkg.de</a
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
    "- PM Surya Ghar two years on (India, hi-IN): https://freeoffgridcalculator.com/blog/pm-surya-ghar-do-saal-baad-2026/";
  const i = llms.indexOf(anchor);
  if (i < 0) throw new Error("llms anchor missing");
  const at = llms.indexOf("\n", i) + 1;
  llms =
    llms.slice(0, at) +
    `- Solarspitzengesetz and negative prices (Germany, de-DE): ${url}${eol}` +
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
            "inLanguage": "de-DE",
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
              <span class="card-tag">Einspeisung</span>
              <span class="card-tag">Deutschland</span>
              <span class="card-tag">Eigenverbrauch</span>
            </div>
            <h2>
              <a href="./${slug}/">${title}</a>
            </h2>
            <p class="card-excerpt">${desc}</p>
          </div>
          <div class="card-footer">
            <span>14 Nov 2026 &middot; checked 14 Nov 2026</span>
            <a href="./${slug}/" class="read-more">Beitrag lesen &rarr;</a>
          </div>
        </article>
`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
const anchor = `  "blog/pm-surya-ghar-do-saal-baad-2026/index.html",`;
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(anchor, `${anchor}\n${entry}`);
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);

console.log("built and registered", slug);

// Build the Poland (PL) and Spain (ES) wave-1 posts (#371, #369) from the
// audited template, and register both in sitemap, llms.txt, rss, the blog hub
// and the deploy allowlist.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/escape-load-shedding/index.html", "utf8");
const h1At = tpl.indexOf("        <h1>");
const relatedAt = tpl.indexOf("        <h2>Related guides</h2>");
const HEAD = tpl.slice(0, h1At);
const TAIL = tpl.slice(relatedAt);

function head({ slug, lang, title, desc, keywords, published, locale }) {
  let h = HEAD.split("escape-load-shedding").join(slug);
  h = h.replace(/<html lang="en">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(
      /(name="keywords"\s*\n?\s*content=")[^"]*(")/,
      `$1${keywords}$2`,
    )
    .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(property="og:description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(property="og:locale" content=")[^"]*(")/, `$1${locale}$2`)
    .replace(/(name="twitter:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(name="twitter:description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/content="2026-09-07" \/>/, `content="${published}" />`)
    .replace(/content="2026-10-22" \/>/, `content="${published}" />`)
    .replace(/"headline": "[^"]*"/, `"headline": ${JSON.stringify(title)}`)
    .replace(/"name": "[^"]*"/, `"name": ${JSON.stringify(title)}`)
    .replace(/"description": "[^"]*"/, `"description": ${JSON.stringify(desc)}`)
    .replace(/"datePublished": "[^"]*"/, `"datePublished": "${published}T00:00:00Z"`)
    .replace(/"dateModified": "[^"]*"/, `"dateModified": "${published}T00:00:00Z"`)
    .replace(
      /"keywords": \[[\s\S]*?\]/,
      `"keywords": [${keywords
        .split(", ")
        .map((k) => JSON.stringify(k))
        .join(", ")}]`,
    );
  return h;
}

// ── Poland ───────────────────────────────────────────────────────────────────
const pl = {
  slug: "dotacja-magazyn-energii-2026",
  lang: "pl",
  title: "Dotacja na magazyn energii 2026: ile i dla kogo",
  desc: "NFOŚiGW uruchomił 1 mld zł na przydomowe magazyny energii. Warunki (min. 10 kWh, 2x moc PV), limity dotacji i przykładowe wyliczenie w złotych.",
  keywords:
    "dotacja magazyn energii 2026, NFOŚiGW magazyny energii, przydomowe magazyny energii, dofinansowanie 800 zł za kWh, magazyn energii 10 kWh",
  locale: "pl_PL",
  published: "2026-11-11",
  h1: "Dotacja na magazyn energii 2026: ile i dla kogo",
};

pl.body = `        <h1>${pl.h1}</h1>
        <p class="meta">
          Ostatnia weryfikacja:
          <time datetime="2026-11-11">11 listopada 2026</time> · Opublikowano:
          11 listopada 2026 · Lucas Ballek
        </p>
        <p>
          <strong>20 października 2026 r. o 9:00</strong> NFOŚiGW uruchomił nabór
          w programie „Dofinansowanie przydomowych magazynów energii – część 2”,
          finansowanym z Funduszu Modernizacyjnego. Budżet to
          <strong>1 mld zł</strong>, a nabór trwa do 1 października 2027 r.
          <em>lub do wyczerpania środków</em> — co w praktyce oznacza, że kolejność
          wniosków ma znaczenie. Ten przewodnik zbiera warunki, limity i jedno
          wyliczenie w złotych, żeby dało się policzyć, ile realnie zostaje w
          kieszeni.
        </p>
        <h2>Kto może złożyć wniosek</h2>
        <p>
          Program jest skierowany do <strong>prosumentów</strong>, czyli osób,
          które mają mikroinstalację OZE przyłączoną do sieci
          elektroenergetycznej. Dofinansowanie obejmuje zakup i montaż magazynu
          energii elektrycznej, magazynu ciepła oraz — jeśli jest niezbędny do
          współpracy magazynu z instalacją — falownika hybrydowego lub urządzenia
          równoważnego.
        </p>
        <h2>Warunki techniczne, które decydują o wszystkim</h2>
        <div class="table-container">
          <table>
            <caption>
              Warunki programu PME 2 (źródło: NFOŚiGW, 20.10.2026)
            </caption>
            <thead>
              <tr>
                <th scope="col">Warunek</th>
                <th scope="col">Wartość</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Minimalna pojemność nominalna magazynu energii</td>
                <td>10 kWh</td>
              </tr>
              <tr>
                <td>Pojemność względem instalacji PV</td>
                <td>
                  co najmniej dwukrotność mocy szczytowej współpracującej
                  instalacji
                </td>
              </tr>
              <tr>
                <td>System zarządzania energią (EMS) i praca wyspowa</td>
                <td>wymagane</td>
              </tr>
              <tr>
                <td>Minimalna pojemność magazynu ciepła</td>
                <td>100 dm³ (100 litrów)</td>
              </tr>
              <tr>
                <td>Kwalifikowany koszt urządzeń na 1 kWh</td>
                <td>nie więcej niż 3 000 zł za 1 kWh</td>
              </tr>
              <tr>
                <td>Początek przedsięwzięcia</td>
                <td>od 1 listopada 2025 r.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Warunek „pojemność ≥ 2 × moc PV” jest najczęstszym powodem odrzucenia
          wniosku w praktyce: przy instalacji 6 kWp trzeba magazynu co najmniej
          12 kWh, a nie 10 kWh, które jest tylko progiem minimalnym. To nie jest
          ten sam próg co „minimum”, i łatwo je pomylić.
        </p>
        <h2>Ile wynosi dotacja</h2>
        <ul>
          <li>
            <strong>Do 30% kosztów kwalifikowanych</strong>, ale nie więcej niż
            <strong>800 zł za każdą 1 kWh</strong> pojemności nominalnej.
          </li>
          <li>
            Maksymalnie <strong>16 000 zł</strong> dla prosumentów w systemie
            net-billing i <strong>8 000 zł</strong> w systemie net-metering.
          </li>
          <li>
            Dodatkowa premia <strong>do 2 000 zł</strong> za zakup magazynu
            razem z falownikiem hybrydowym.
          </li>
          <li>
            Łącznie nie więcej niż <strong>19 000 zł na jeden punkt poboru
            energii (PPE)</strong>.
          </li>
          <li>
            Magazyn ciepła: do 30% kosztów kwalifikowanych, nie więcej niż
            <strong>1 000 zł</strong>.
          </li>
        </ul>
        <h2>Przykład: 12 kWh przy instalacji 6 kWp</h2>
        <p>
          Załóżmy magazyn 12 kWh przy instalacji 6 kWp — warunek 2 × 6 = 12 kWh
          jest spełniony dokładnie. Kwoty są przykładowe; podstaw swoje faktury.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Jak liczy się dotacja i ile zostaje do zapłaty
            </caption>
            <thead>
              <tr>
                <th scope="col">Pozycja</th>
                <th scope="col">Wartość</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Koszt kwalifikowany (magazyn + falownik + EMS)</td>
                <td>36 000 zł</td>
              </tr>
              <tr>
                <td>Limit kosztu kwalifikowanego: 12 kWh × 3 000 zł</td>
                <td>36 000 zł — bez korekty</td>
              </tr>
              <tr>
                <td>30% kosztów kwalifikowanych</td>
                <td>10 800 zł</td>
              </tr>
              <tr>
                <td>Limit jednostkowy: 12 kWh × 800 zł</td>
                <td>9 600 zł</td>
              </tr>
              <tr>
                <td>Limit systemu net-billing</td>
                <td>16 000 zł</td>
              </tr>
              <tr>
                <td><strong>Dotacja (najniższy z trzech limitów)</strong></td>
                <td><strong>9 600 zł</strong></td>
              </tr>
              <tr>
                <td>Koszt po dotacji</td>
                <td>26 400 zł</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Widać mechanizm: przy magazynie większym niż 10 kWh wiążącym limitem
          jest zwykle <strong>800 zł za kWh</strong>, a nie 30% kosztów. Dlatego
          dopłata za większą pojemność nie rośnie proporcjonalnie — rośnie tylko
          do wysokości tego limitu.
        </p>
        <h2>Czego dotacja nie pokryje</h2>
        <p>
          Dotacja obniża koszt inwestycji, a nie rachunek za energię. Nie zmienia
          taryfy dystrybucyjnej, nie likwiduje opłat stałych i nie gwarantuje, że
          magazyn się zwróci — to zależy od tego, ile energii rzeczywiście
          przesuniesz z godzin drogich na tanie i ile jej zużyjesz na miejscu.
          Kalkulator liczy ten bilans z lokalnych danych godzinowych, a nie z
          przeciętnej rocznej.
        </p>
        <h2>Co zrobić przed wnioskiem</h2>
        <ul>
          <li>
            <strong>Policz pojemność od mocy PV.</strong> 2 × moc szczytowa
            instalacji to próg, nie sugestia.
          </li>
          <li>
            <strong>Sprawdź faktury i datę rozpoczęcia.</strong> Przedsięwzięcie
            musi zaczynać się nie wcześniej niż 1 listopada 2025 r.
          </li>
          <li>
            <strong>Ustal, w jakim systemie się rozliczasz.</strong> Net-billing
            i net-metering mają różne limity (16 000 zł i 8 000 zł).
          </li>
          <li>
            <strong>Nie zakładaj, że środki poczekają.</strong> Nabór kończy się
            wcześniej, jeśli 1 mld zł zostanie wyczerpany.
          </li>
        </ul>
        <div class="cta-box">
          <p>
            <strong>Sprawdź, ile energii naprawdę przesunie magazyn.</strong>
            Wpisz lokalizację i zużycie — kalkulator policzy system z godzinowych
            danych pogodowych i pokaże koszt jednostkowy obok ceny z sieci.
          </p>
          <a class="btn" href="../../#sizing">Policz swój system</a>
        </div>
`;
pl.tail = `        <h2>Powiązane przewodniki</h2>
        <ul>
          <li>
            <a href="../is-a-home-battery-worth-it/"
              >Czy magazyn energii się opłaca</a
            >
          </li>
          <li>
            <a href="../time-of-use-tariffs-battery/"
              >Taryfy strefowe a magazyn energii</a
            >
          </li>
          <li>
            <a href="../battery-longevity-and-dod-reference/"
              >Trwałość baterii i głębokość rozładowania</a
            >
          </li>
          <li>
            <a href="../../solar-calculator/">wszystkie 66 miast</a>
          </li>
        </ul>
        <h2>Najczęstsze pytania</h2>
        <details>
          <summary>Czy 10 kWh wystarczy, żeby dostać dotację?</summary>
          <p>
            10 kWh to próg minimalny. Pojemność musi być także równa lub większa
            od dwukrotności mocy szczytowej instalacji PV, więc przy 6 kWp
            potrzebne jest 12 kWh.
          </p>
        </details>
        <details>
          <summary>Jaka jest maksymalna dotacja?</summary>
          <p>
            19 000 zł na jeden punkt poboru energii łącznie. Dla samego magazynu
            energii elektrycznej limit to 16 000 zł w net-billingu i 8 000 zł w
            net-meteringu, plus premia do 2 000 zł za falownik hybrydowy.
          </p>
        </details>
        <details>
          <summary>Jak długo trwa nabór?</summary>
          <p>
            Od 20 października 2026 r. do 1 października 2027 r. lub do
            wyczerpania 1 mld zł — wcześniejsza data obowiązuje.
          </p>
        </details>
        <details>
          <summary>Czy dotacja pokryje cały magazyn?</summary>
          <p>
            Nie. Pokrywa do 30% kosztów kwalifikowanych i nie więcej niż 800 zł
            za 1 kWh, a koszt kwalifikowany urządzeń jest ograniczony do 3 000 zł
            za 1 kWh.
          </p>
        </details>
`;

// ── Spain ────────────────────────────────────────────────────────────────────
const es = {
  slug: "deduccion-irpf-autoconsumo-2026",
  lang: "es",
  title: "Deducción IRPF autoconsumo 2026: 20% hasta el 31-D",
  desc: "Nueva deducción del 20% en el IRPF por instalar autoconsumo renovable en 2026, baterías incluidas. Requisitos, plazos y un ejemplo en euros.",
  keywords:
    "deducción IRPF autoconsumo 2026, deducción placas solares 2026, IRPF batería solar, 31 diciembre 2026 deducción, Real Decreto-ley 7/2026",
  locale: "es_ES",
  published: "2026-11-11",
  h1: "Deducción IRPF autoconsumo 2026: 20% hasta el 31-D",
};

es.body = `        <h1>${es.h1}</h1>
        <p class="meta">
          Última revisión:
          <time datetime="2026-11-11">11 de noviembre de 2026</time> ·
          Publicado: 11 de noviembre de 2026 · Lucas Ballek
        </p>
        <p>
          El <strong>Real Decreto-ley 7/2026, de 20 de marzo</strong>, introdujo en
          el IRPF una deducción nueva por la instalación de sistemas de
          autoconsumo de energía eléctrica procedente de fuentes renovables, con
          efectos desde el 1 de enero de 2026. La condición que manda es temporal:
          la instalación debe <strong>realizarse y finalizar en 2026</strong>, y
          las cantidades deben satisfacerse también en 2026. Es decir, el
          31 de diciembre de 2026 no es una fecha simbólica: es el último día en
          que puede quedar cerrada la obra y pagada la factura.
        </p>
        <h2>Qué hay de nuevo y qué se prorrogó</h2>
        <div class="table-container">
          <table>
            <caption>
              Deducciones vigentes según la Agencia Tributaria (RDL 7/2026)
            </caption>
            <thead>
              <tr>
                <th scope="col">Deducción</th>
                <th scope="col">Plazo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Nueva:</strong> instalación de autoconsumo renovable,
                  incluidos sistemas de almacenamiento
                </td>
                <td>
                  instalación realizada y finalizada en 2026; importes pagados en
                  2026
                </td>
              </tr>
              <tr>
                <td>
                  Obras de reducción de la demanda de calefacción y refrigeración
                </td>
                <td>
                  obras hasta el 31-12-2026; certificado expedido antes del
                  1-1-2027
                </td>
              </tr>
              <tr>
                <td>
                  Obras de mejora del consumo de energía primaria no renovable
                </td>
                <td>
                  obras hasta el 31-12-2026; certificado expedido antes del
                  1-1-2027
                </td>
              </tr>
              <tr>
                <td>Obras en edificios de uso predominantemente residencial</td>
                <td>hasta el 31-12-2027, certificado antes del 1-1-2028</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Las tres deducciones de eficiencia energética se prorrogan hasta el
          31 de diciembre de 2026 (la de edificios, hasta 2027). Sus tramos
          habituales siguen siendo del 20% con base máxima de 5.000 € anuales por
          reducción de al menos un 7% de la demanda, del 40% con base de 7.500 €
          por reducción del 30% del consumo de energía primaria no renovable o
          calificación A o B, y del 60% en edificios. La deducción nueva de
          autoconsumo es distinta de esas tres y conviene no confundirlas.
        </p>
        <h2>Quién puede aplicarla</h2>
        <ul>
          <li>
            Contribuyentes del IRPF que instalen el sistema en un inmueble de su
            propiedad, incluidos los edificios de uso predominantemente
            residencial.
          </li>
          <li>
            La deducción se practica en el periodo impositivo en el que finaliza
            la instalación, que no puede ser posterior a 2026.
          </li>
          <li>
            Las cantidades deben estar pagadas entre el 1 de enero y el
            31 de diciembre de 2026.
          </li>
        </ul>
        <h2>Un ejemplo en euros</h2>
        <p>
          Instalación de 4 kWp con batería de 8 kWh, terminada y pagada en
          noviembre de 2026, por <strong>9.000 €</strong> sin subvenciones. Con
          una deducción del 20%:
        </p>
        <div class="table-container">
          <table>
            <caption>
              Efecto de la deducción (ejemplo con importes redondos)
            </caption>
            <thead>
              <tr>
                <th scope="col">Concepto</th>
                <th scope="col">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Coste de la instalación pagado en 2026</td>
                <td>9.000 €</td>
              </tr>
              <tr>
                <td>Deducción del 20%</td>
                <td>1.800 €</td>
              </tr>
              <tr>
                <td>Coste neto tras la deducción</td>
                <td>7.200 €</td>
              </tr>
              <tr>
                <td>Factura anual de luz antes (estimada)</td>
                <td>1.450 €</td>
              </tr>
              <tr>
                <td>Ahorro anual con autoconsumo del 70%</td>
                <td>unos 1.015 €, según tu tarifa y tu consumo</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Dos advertencias que ahorran decepciones. Primero: la deducción reduce
          la cuota del IRPF, así que solo se aprovecha si tu cuota es suficiente;
          no es un descuento en la factura del instalador. Segundo: el límite de
          base de esta deducción nueva debe confirmarse en la norma y en el
          manual de la Agencia Tributaria del ejercicio 2026 antes de contar con
          una cifra exacta; no lo doy por supuesto aquí.
        </p>
        <h2>Qué comprobar antes de firmar</h2>
        <ul>
          <li>
            <strong>Fecha de finalización.</strong> Si la obra termina en enero de
            2027, esta deducción ya no aplica; las de eficiencia energética
            tampoco, porque exigen certificado antes del 1 de enero de 2027.
          </li>
          <li>
            <strong>Facturas de 2026.</strong> El pago fuera de 2026 rompe el
            requisito de las cantidades satisfechas.
          </li>
          <li>
            <strong>Certificado de eficiencia energética</strong> si vas por la
            vía de eficiencia (20%, 40% o 60%): debe expedirse antes del
            1 de enero de 2027 y registrar la mejora exigida.
          </li>
          <li>
            <strong>Titularidad.</strong> La instalación debe estar en un inmueble
            de tu propiedad.
          </li>
        </ul>
        <h2>La deducción no dimensiona el sistema</h2>
        <p>
          Un incentivo fiscal reduce el coste de una inversión; no dice qué
          inversión conviene. El tamaño correcto depende de tu consumo horario,
          del precio de tu tarifa y de cuánta energía puedas usar en el momento.
          Un sistema sobredimensionado para “aprovechar la deducción” compra
          kilovatios que se vierten a la red por menos de lo que cuestan.
        </p>
        <div class="cta-box">
          <p>
            <strong>Calcula el sistema por tu consumo, no por el incentivo.</strong>
            Introduce tu ubicación y tu consumo: el calculador usa datos horarios
            de clima local y muestra el coste nivelado junto al precio de la red.
          </p>
          <a class="btn" href="../../#sizing">Calcular mi sistema</a>
        </div>
`;
es.tail = `        <h2>Guías relacionadas</h2>
        <ul>
          <li>
            <a href="../is-a-home-battery-worth-it/"
              >¿Vale la pena una batería doméstica?</a
            >
          </li>
          <li>
            <a href="../time-of-use-tariffs-battery/"
              >Tarifas por horas y batería</a
            >
          </li>
          <li>
            <a href="../how-to-cut-electricity-bill-with-solar/"
              >Cómo bajar la factura con solar</a
            >
          </li>
          <li><a href="../../solar-calculator/">las 66 ciudades</a></li>
        </ul>
        <h2>Preguntas frecuentes</h2>
        <details>
          <summary>¿Cuánto dura la deducción del 20%?</summary>
          <p>
            La instalación debe realizarse y finalizar en 2026, con las cantidades
            pagadas en 2026. Para obra terminada en 2027, esta deducción no
            aplica.
          </p>
        </details>
        <details>
          <summary>¿Incluye la batería?</summary>
          <p>
            El Real Decreto-ley 7/2026 menciona expresamente los sistemas de
            almacenamiento dentro de la instalación de autoconsumo, siempre que
            formen parte de la instalación realizada en 2026.
          </p>
        </details>
        <details>
          <summary>¿Es compatible con las deducciones de eficiencia energética?</summary>
          <p>
            Son deducciones distintas con requisitos distintos. Confirmar la
            compatibilidad en tu caso concreto corresponde a un asesor fiscal; no
            des por hecho que se acumulan.
          </p>
        </details>
        <details>
          <summary>¿Y si la instalo en un edificio comunitario?</summary>
          <p>
            La norma también contempla instalaciones en edificios de uso
            predominantemente residencial. La titularidad y el reparto entre
            propietarios deben revisarse antes de contar con la deducción.
          </p>
        </details>
`;

// ── write + register ─────────────────────────────────────────────────────────
function build(p) {
  mkdirSync(`blog/${p.slug}`, { recursive: true });
  const html = head(p) + p.body + p.tail;
  writeFileSync(`blog/${p.slug}/index.html`, html);
  console.log(`wrote blog/${p.slug}/index.html (${html.length} bytes)`);
}
build(pl);
build(es);

// sitemap
let sitemap = readFileSync("sitemap.xml", "utf8");
for (const p of [pl, es]) {
  const url = `https://freeoffgridcalculator.com/blog/${p.slug}/`;
  if (!sitemap.includes(url)) {
    sitemap = sitemap.replace(
      "</urlset>",
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-11-11</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`,
    );
  }
}
writeFileSync("sitemap.xml", sitemap);

// llms.txt
let llms = readFileSync("llms.txt", "utf8");
const anchor =
  "- Eskom's fixed charge and what it does to solar payback: https://freeoffgridcalculator.com/blog/eskom-fixed-charge-solar-2027/\r\n";
if (!llms.includes(anchor)) throw new Error("llms.txt anchor missing");
for (const [p, label] of [
  [pl, "Dotacja na magazyn energii (Poland, PME 2)"],
  [es, "Deducción IRPF autoconsumo 2026 (Spain)"],
]) {
  const url = `https://freeoffgridcalculator.com/blog/${p.slug}/`;
  if (!llms.includes(url))
    llms = llms.replace(anchor, anchor + `- ${label}: ${url}\r\n`);
}
writeFileSync("llms.txt", llms);

// rss
let rss = readFileSync("rss.xml", "utf8");
for (const p of [es, pl]) {
  const url = `https://freeoffgridcalculator.com/blog/${p.slug}/`;
  if (rss.includes(url)) continue;
  const item = `    <item>
      <title>${p.title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>Wed, 11 Nov 2026 00:00:00 GMT</pubDate>
      <description>${p.desc.replace(/&/g, "&amp;")}</description>
    </item>
`;
  rss = rss.replace(/(<lastBuildDate>[^<]*<\/lastBuildDate>\r?\n)/, `$1${item}`);
}
writeFileSync("rss.xml", rss);

// blog hub
let hub = readFileSync("blog/index.html", "utf8");
for (const [p, tags, lang] of [
  [pl, ["Dotacje", "Polska", "Magazyn energii"], "pl-PL"],
  [es, ["IRPF", "España", "Autoconsumo"], "es-ES"],
]) {
  const url = `https://freeoffgridcalculator.com/blog/${p.slug}/`;
  if (hub.includes(url)) continue;
  const ld = `          {
            "@type": "BlogPosting",
            "headline": ${JSON.stringify(p.title)},
            "name": ${JSON.stringify(p.title)},
            "description": ${JSON.stringify(p.desc)},
            "inLanguage": "${lang}",
            "datePublished": "${p.published}T00:00:00Z",
            "dateModified": "${p.published}T00:00:00Z",
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
              <span class="card-tag">${tags[0]}</span>
              <span class="card-tag">${tags[1]}</span>
              <span class="card-tag">${tags[2]}</span>
            </div>
            <h2>
              <a href="./${p.slug}/">${p.title}</a>
            </h2>
            <p class="card-excerpt">${p.desc}</p>
          </div>
          <div class="card-footer">
            <span>11 nov 2026 &middot; checked 11 nov 2026</span>
            <a href="./${p.slug}/" class="read-more">Read guide &rarr;</a>
          </div>
        </article>
`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

// deploy allowlist
const manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
let next = manifest;
for (const p of [pl, es]) {
  const entry = `  "blog/${p.slug}/index.html",`;
  if (!next.includes(entry))
    next = next.replace(
      '  "blog/eskom-fixed-charge-solar-2027/index.html",',
      '  "blog/eskom-fixed-charge-solar-2027/index.html",\n' + entry,
    );
}
writeFileSync("scripts/lib/deploy-manifest.mjs", next);
console.log("registered both posts");

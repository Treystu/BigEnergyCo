// Build the Romania (RO) and Vietnam (VI) wave-1 posts (#370, #372) and
// register both. Template head/tail reused from the audited article.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/escape-load-shedding/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

function head({ slug, lang, title, desc, keywords, locale, published }) {
  let h = HEAD.split("escape-load-shedding").join(slug);
  return h
    .replace(/<html lang="en">/, `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
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
}

const ro = {
  slug: "program-afm-baterii-2026",
  lang: "ro",
  title: "Program AFM baterii 2026: 15.000 lei pentru prosumatori",
  desc: "Ghidul AFM (Ordinul 1.904/2026): până la 75% din proiect, maximum 15.000 lei, baterie de minimum 10 kWh. Calendarul înscrierilor și un calcul în lei.",
  keywords:
    "program AFM baterii 2026, Ordinul 1904/2026, subvenție baterie prosumator, 15.000 lei baterie, stocare energie AFM",
  locale: "ro_RO",
  published: "2026-11-11",
};

ro.body = `        <h1>${ro.title}</h1>
        <p class="meta">
          Ultima verificare:
          <time datetime="2026-11-11">11 noiembrie 2026</time> · Publicat:
          11 noiembrie 2026 · Lucas Ballek
        </p>
        <p>
          Programul AFM pentru sisteme de stocare a energiei electrice produse
          din surse regenerabile are un ghid în vigoare din
          <strong>14 septembrie 2026</strong> (Ordinul nr. 1.904/11.09.2026,
          publicat în Monitorul Oficial nr. 775) și, după actualizarea din
          <strong>6 noiembrie 2026</strong>, un calendar de înscriere: instalatorii
          se validează între 16 și 20 noiembrie, iar persoanele fizice depun
          cererile între <strong>20 noiembrie, ora 10:00</strong> și
          <strong>25 noiembrie 2026, ora 23:59</strong>. Bugetul este de 400 de
          milioane de lei, deci fereastra este scurtă și ordinea contează mai
          puțin decât punctajul.
        </p>
        <h2>Cât finanțează AFM</h2>
        <div class="table-container">
          <table>
            <caption>
              Condițiile de finanțare (ghidul AFM, actualizat 6 noiembrie 2026)
            </caption>
            <thead>
              <tr>
                <th scope="col">Element</th>
                <th scope="col">Valoare</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Buget total</td>
                <td>400 milioane lei</td>
              </tr>
              <tr>
                <td>Acoperire maximă</td>
                <td>75% din valoarea proiectului, maximum 15.000 lei, TVA inclus</td>
              </tr>
              <tr>
                <td>Cost maxim eligibil</td>
                <td>1.500 lei/kWh capacitate instalată, TVA inclus</td>
              </tr>
              <tr>
                <td>Capacitate minimă</td>
                <td>10 kWh</td>
              </tr>
              <tr>
                <td>Beneficiari</td>
                <td>persoane fizice cu statut de prosumator, consum casnic</td>
              </tr>
              <tr>
                <td>Invertor hibrid</td>
                <td>neeligibil</td>
              </tr>
              <tr>
                <td>Cheltuieli eligibile</td>
                <td>doar cele efectuate după aprobarea AFM</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h2>Cum se face selecția</h2>
        <p>
          Selecția nu se face în ordinea înscrierii, ci după un punctaj de maximum
          100 de puncte, calculat de aplicația AFM:
        </p>
        <ul>
          <li>
            <strong>până la 50 de puncte</strong> pentru contribuția proprie
            raportată la finanțarea AFM (30 × raportul, plafonat la 50);
          </li>
          <li>
            <strong>până la 50 de puncte</strong> pentru capacitate
            (kWh × 2,5), punctajul maxim fiind atins la 20 kWh.
          </li>
        </ul>
        <p>
          Consecința practică: o baterie de 10 kWh primește 25 de puncte la
          capacitate, una de 20 kWh primește 50, iar una de 30 kWh tot 50 —
          finanțarea rămâne plafonată la 15.000 lei. Deci capacitatea peste 20 kWh
          nu aduce puncte în plus și nici bani în plus.
        </p>
        <h2>Un calcul în lei: baterie de 12 kWh</h2>
        <p>
          Valoarea reală a proiectului diferă; calculul de mai jos arată doar
          mecanismul, cu un cost eligibil de 1.500 lei/kWh.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Finanțare și contribuție proprie (exemplu)
            </caption>
            <thead>
              <tr>
                <th scope="col">Poziție</th>
                <th scope="col">Valoare</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cost eligibil: 12 kWh × 1.500 lei</td>
                <td>18.000 lei</td>
              </tr>
              <tr>
                <td>75% din costul eligibil</td>
                <td>13.500 lei</td>
              </tr>
              <tr>
                <td>Plafon pe proiect</td>
                <td>15.000 lei — nu se atinge</td>
              </tr>
              <tr>
                <td><strong>Finanțare AFM</strong></td>
                <td><strong>13.500 lei</strong></td>
              </tr>
              <tr>
                <td>Contribuție proprie minimă</td>
                <td>4.500 lei, plus orice depășire peste costul standard</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Atenție la ultima linie: costul standard de 1.500 lei/kWh este plafonul
          eligibil, nu prețul pieței. Dacă oferta depășește acest nivel, diferența
          se plătește integral de beneficiar, iar procentul real de acoperire
          scade sub 75%.
        </p>
        <h2>Ce nu acoperă programul</h2>
        <p>
          Programul finanțează stocarea, nu întreaga instalație: invertorul hibrid
          nu este eligibil, iar cheltuielile făcute înainte de aprobarea AFM nu
          se decontează. De asemenea, subvenția nu garantează o economie pe
          factură — economia depinde de câtă energie muți din orele scumpe în orele
          ieftine și de cât consumi din producția proprie.
        </p>
        <h2>Ce ai de făcut până pe 20 noiembrie</h2>
        <ul>
          <li>
            <strong>Verifică statutul de prosumator.</strong> Fără el nu poți
            depune cererea.
          </li>
          <li>
            <strong>Alege un instalator validat</strong> din lista oficială AFM —
            validarea se face între 16 și 20 noiembrie.
          </li>
          <li>
            <strong>Dimensionează la 10–20 kWh.</strong> Sub 10 kWh nu ești
            eligibil; peste 20 kWh nu mai primești puncte în plus.
          </li>
          <li>
            <strong>Pregătește documentele înainte de ora 10:00</strong> pe
            20 noiembrie; sesiunea se închide pe 25 noiembrie la 23:59 sau la
            epuizarea bugetului.
          </li>
        </ul>
        <div class="cta-box">
          <p>
            <strong>Verifică ce înseamnă bateria pentru factura ta.</strong>
            Introdu localitatea și consumul: calculatorul dimensionează sistemul
            din date orare de climă și arată costul nivelat lângă prețul din rețea.
          </p>
          <a class="btn" href="../../#sizing">Calculează sistemul</a>
        </div>
`;

ro.tail = `        <h2>Ghiduri conexe</h2>
        <ul>
          <li>
            <a href="../is-a-home-battery-worth-it/"
              >Merită o baterie de acumulatori acasă</a
            >
          </li>
          <li>
            <a href="../time-of-use-tariffs-battery/"
              >Tarife pe ore și bateria</a
            >
          </li>
          <li>
            <a href="../battery-longevity-and-dod-reference/"
              >Durata de viață a bateriei și adâncimea de descărcare</a
            >
          </li>
          <li><a href="../../solar-calculator/">toate cele 66 de orașe</a></li>
        </ul>
        <h2>Întrebări frecvente</h2>
        <details>
          <summary>Când se pot depune cererile?</summary>
          <p>
            Instalatorii se validează între 16 și 20 noiembrie 2026; persoanele
            fizice depun cererile între 20 noiembrie, ora 10:00, și 25 noiembrie
            2026, ora 23:59.
          </p>
        </details>
        <details>
          <summary>Care este suma maximă?</summary>
          <p>
            15.000 lei, TVA inclus, adică cel mult 75% din valoarea proiectului,
            cu un cost eligibil plafonat la 1.500 lei/kWh.
          </p>
        </details>
        <details>
          <summary>Se finanțează invertorul hibrid?</summary>
          <p>
            Nu. Ghidul finanțează sistemul de stocare, montajul și punerea în
            funcțiune; invertorul hibrid este neeligibil.
          </p>
        </details>
        <details>
          <summary>Contează ordinea înscrierii?</summary>
          <p>
            Nu, contează punctajul (maximum 100 de puncte), calculat din
            contribuția proprie și din capacitatea bateriei.
          </p>
        </details>
`;

const vi = {
  slug: "gia-dien-5-bac-2026",
  lang: "vi",
  title: "Giá điện 5 bậc từ 1/11/2026: cách tính và vai trò pin",
  desc: "Quyết định 2892/QĐ-BCT: giá điện sinh hoạt 5 bậc từ 1.901 đến 3.844 đồng/kWh, chưa gồm VAT. Cách tính tiền theo bậc và vai trò của pin lưu trữ.",
  keywords:
    "giá điện 5 bậc 2026, Quyết định 2892/QĐ-BCT, giá điện sinh hoạt, biểu giá điện bậc thang, pin lưu trữ điện mặt trời",
  locale: "vi_VN",
  published: "2026-11-11",
};

vi.body = `        <h1>${vi.title}</h1>
        <p class="meta">
          Kiểm tra lần cuối:
          <time datetime="2026-11-11">11 tháng 11, 2026</time> · Xuất bản:
          11 tháng 11, 2026 · Lucas Ballek
        </p>
        <p>
          Từ <strong>1/11/2026</strong>, giá bán lẻ điện sinh hoạt tại Việt Nam
          chuyển từ 6 bậc xuống <strong>5 bậc</strong> theo Quyết định
          2892/QĐ-BCT ngày 31/10/2026 của Bộ Công Thương. Giá bán lẻ điện bình
          quân là <strong>2.159,9037 đồng/kWh</strong> (chưa gồm VAT), giảm khoảng
          2% so với trước. Điều đáng chú ý với hộ có điện mặt trời không phải giá
          bình quân, mà là khoảng cách giữa bậc thấp nhất và bậc cao nhất.
        </p>
        <h2>Biểu giá 5 bậc từ 1/11/2026</h2>
        <div class="table-container">
          <table>
            <caption>
              Giá điện sinh hoạt theo Quyết định 2892/QĐ-BCT (chưa gồm VAT)
            </caption>
            <thead>
              <tr>
                <th scope="col">Bậc</th>
                <th scope="col">Mức tiêu thụ</th>
                <th scope="col">Giá (đồng/kWh)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bậc 1</td>
                <td>0 – 100 kWh</td>
                <td>1.901</td>
              </tr>
              <tr>
                <td>Bậc 2</td>
                <td>101 – 200 kWh</td>
                <td>2.289</td>
              </tr>
              <tr>
                <td>Bậc 3</td>
                <td>201 – 400 kWh</td>
                <td>2.894</td>
              </tr>
              <tr>
                <td>Bậc 4</td>
                <td>401 – 700 kWh</td>
                <td>3.456</td>
              </tr>
              <tr>
                <td>Bậc 5</td>
                <td>701 kWh trở lên</td>
                <td>3.844</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Theo cơ cấu mới, giá bậc 4 bằng 162% và bậc 5 bằng 180% giá bán lẻ
          bình quân. Bậc cao nhất 3.844 đồng/kWh cao hơn 2 lần bậc thấp nhất
          1.901 đồng/kWh — đây chính là phần mà điện mặt trời tự dùng cắt được.
        </p>
        <h2>Ví dụ: hộ dùng 350 kWh/tháng</h2>
        <p>
          Tiền điện được tính lũy tiến: mỗi mức tiêu thụ áp dụng đúng giá của bậc
          đó, không phải lấy tổng kWh nhân một giá.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Cách tính 350 kWh (chưa gồm VAT)
            </caption>
            <thead>
              <tr>
                <th scope="col">Bậc</th>
                <th scope="col">kWh áp dụng</th>
                <th scope="col">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bậc 1</td>
                <td>100</td>
                <td>190.100 đồng</td>
              </tr>
              <tr>
                <td>Bậc 2</td>
                <td>100</td>
                <td>228.900 đồng</td>
              </tr>
              <tr>
                <td>Bậc 3</td>
                <td>150</td>
                <td>434.100 đồng</td>
              </tr>
              <tr>
                <td><strong>Tổng (chưa VAT)</strong></td>
                <td>350</td>
                <td><strong>853.100 đồng</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Giá trung bình thực tế của hộ này là khoảng 2.437 đồng/kWh, cao hơn giá
          bình quân 2.159,9037 đồng/kWh vì phần lớn điện nằm ở bậc 2 và bậc 3.
          Hóa đơn thực tế còn cộng VAT.
        </p>
        <h2>Vì sao bậc thang lại quan trọng với pin lưu trữ</h2>
        <ul>
          <li>
            <strong>Tự dùng cắt bậc cao trước.</strong> Mỗi kWh điện mặt trời dùng
            ngay tại nhà thay thế một kWh phải mua — ở hộ trên, đó là kWh bậc 3
            giá 2.894 đồng, không phải bậc 1 giá 1.901 đồng.
          </li>
          <li>
            <strong>Pin chuyển kWh sang giờ khác, không đổi bậc.</strong> Pin không
            làm giảm tổng kWh tiêu thụ; nó chỉ đổi thời điểm mua điện. Vì vậy giá
            trị của pin phụ thuộc vào việc nó thay thế được bao nhiêu kWh ở bậc
            cao.
          </li>
          <li>
            <strong>Hiệu suất vòng.</strong> Nếu hiệu suất nạp–xả khoảng 90%, để
            dùng 9 kWh buổi tối cần khoảng 10 kWh từ điện mặt trời; 1 kWh là chi
            phí chuyển đổi.
          </li>
        </ul>
        <h2>Điều cần kiểm tra trước khi mua</h2>
        <ul>
          <li>
            <strong>Số kWh thực tế của gia đình</strong> theo từng tháng, không
            phải con số ước lượng.
          </li>
          <li>
            <strong>Bậc mà hộ đang ở</strong>: hộ dưới 200 kWh/tháng nhận ít lợi
            ích hơn nhiều so với hộ trên 400 kWh/tháng.
          </li>
          <li>
            <strong>Giá mua điện mặt trời dư</strong> và quy định đấu nối hiện
            hành — khoản này khác với giá bán lẻ ở trên và thay đổi theo quy định.
          </li>
        </ul>
        <div class="cta-box">
          <p>
            <strong>Tính theo kWh của bạn, không theo giá bình quân.</strong>
            Nhập vị trí và mức tiêu thụ: công cụ tính hệ thống từ dữ liệu thời tiết
            theo giờ và hiển thị chi phí quy đổi cạnh giá điện lưới.
          </p>
          <a class="btn" href="../../#sizing">Tính hệ thống của tôi</a>
        </div>
`;

vi.tail = `        <h2>Bài viết liên quan</h2>
        <ul>
          <li>
            <a href="../is-a-home-battery-worth-it/"
              >Pin lưu trữ gia đình có đáng đầu tư</a
            >
          </li>
          <li>
            <a href="../time-of-use-tariffs-battery/"
              >Biểu giá theo giờ và pin lưu trữ</a
            >
          </li>
          <li>
            <a href="../how-to-cut-electricity-bill-with-solar/"
              >Cách giảm hóa đơn điện bằng điện mặt trời</a
            >
          </li>
          <li><a href="../../solar-calculator/">66 thành phố</a></li>
        </ul>
        <h2>Câu hỏi thường gặp</h2>
        <details>
          <summary>Biểu giá 5 bậc áp dụng từ khi nào?</summary>
          <p>
            Từ ngày 1/11/2026, theo Quyết định 2892/QĐ-BCT ngày 31/10/2026 của Bộ
            Công Thương.
          </p>
        </details>
        <details>
          <summary>Giá cao nhất và thấp nhất là bao nhiêu?</summary>
          <p>
            Bậc 1 là 1.901 đồng/kWh và bậc 5 là 3.844 đồng/kWh, chưa gồm VAT.
          </p>
        </details>
        <details>
          <summary>Tính tiền điện theo bậc như thế nào?</summary>
          <p>
            Lũy tiến: 100 kWh đầu theo giá bậc 1, 100 kWh tiếp theo theo bậc 2,
            phần từ 201 đến 400 kWh theo bậc 3, và tiếp tục như vậy.
          </p>
        </details>
        <details>
          <summary>Pin lưu trữ có làm giảm bậc không?</summary>
          <p>
            Không. Pin không làm giảm tổng điện năng tiêu thụ; nó thay đổi thời
            điểm mua điện và nhờ đó có thể thay thế các kWh ở bậc cao.
          </p>
        </details>
`;

function build(p) {
  mkdirSync(`blog/${p.slug}`, { recursive: true });
  const html = head(p) + p.body + p.tail;
  writeFileSync(`blog/${p.slug}/index.html`, html);
  console.log(`wrote blog/${p.slug}/index.html (${html.length} bytes)`);
}
build(ro);
build(vi);

// sitemap
let sitemap = readFileSync("sitemap.xml", "utf8");
for (const p of [ro, vi]) {
  const url = `https://freeoffgridcalculator.com/blog/${p.slug}/`;
  if (sitemap.includes(url)) continue;
  sitemap = sitemap.replace(
    "</urlset>",
    `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-11-11</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`,
  );
}
writeFileSync("sitemap.xml", sitemap);

// llms.txt
let llms = readFileSync("llms.txt", "utf8");
const anchor =
  "- Deducción IRPF autoconsumo 2026 (Spain): https://freeoffgridcalculator.com/blog/deduccion-irpf-autoconsumo-2026/\r\n";
if (!llms.includes(anchor)) throw new Error("llms.txt anchor missing");
for (const [p, label] of [
  [ro, "Program AFM baterii 2026 (Romania)"],
  [vi, "Giá điện 5 bậc 2026 (Vietnam)"],
]) {
  const url = `https://freeoffgridcalculator.com/blog/${p.slug}/`;
  if (!llms.includes(url))
    llms = llms.replace(anchor, anchor + `- ${label}: ${url}\r\n`);
}
writeFileSync("llms.txt", llms);

// rss
let rss = readFileSync("rss.xml", "utf8");
for (const p of [vi, ro]) {
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

// hub
let hub = readFileSync("blog/index.html", "utf8");
for (const [p, tags, lang] of [
  [ro, ["Subvenții", "România", "Baterii"], "ro-RO"],
  [vi, ["Biểu giá", "Việt Nam", "Pin lưu trữ"], "vi-VN"],
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
let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
for (const p of [ro, vi]) {
  const entry = `  "blog/${p.slug}/index.html",`;
  if (!manifest.includes(entry))
    manifest = manifest.replace(
      '  "blog/deduccion-irpf-autoconsumo-2026/index.html",',
      '  "blog/deduccion-irpf-autoconsumo-2026/index.html",\n' + entry,
    );
}
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);
console.log("registered both posts");

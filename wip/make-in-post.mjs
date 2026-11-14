// Build the India (hi-IN) post for #381 from the eskom template.
//
// Facts and sources (researcher read at source, 2026-11-14):
//   MNRE residential CFA guidelines (launch 13 Feb 2024, amendment 7 Jul 2025):
//   Rs 30,000/kW first 2 kW, Rs 18,000 for the 3rd kW, Rs 78,000 cap general;
//   special-category Rs 33,000/kW, Rs 19,800, cap Rs 85,800.
//   PIB 1 Mar 2024: subsidy after commissioning + bank details, ~30 days.
//   MNRE guidelines: claim processed within 15 days of DISCOM approval.
//   DERC schedule (effective 1 Oct 2021): 3.00 / 4.50 / 6.50 / 7.00 / 8.00,
//   fixed charge Rs 20/kW to 2 kW, Rs 50/kW 2-5 kW.
//   BSES FAQ 19 Sep 2025: fixed charges remain payable; year-end surplus paid
//   at APPC approved by DERC, not the retail slab.
//   APDCL guidelines 14 Mar 2024: Assam top-up Rs 15,000/kW up to Rs 45,000.
// Anything not verified is flagged in the body rather than asserted.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

const slug = "pm-surya-ghar-do-saal-baad-2026";
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;
const title = "PM सूर्य घर: दो साल बाद सब्सिडी और असली बचत";
const desc =
  "केंद्रीय सब्सिडी ₹30,000/किलोवाट (3 किलोवाट पर ₹78,000 तक), फिक्स्ड चार्ज का सच, नेट मीटिंग क्रेडिट और एक पूरा हिसाब — हिंदी में।";
const keywords =
  "PM सूर्य घर 2026, सोलर सब्सिडी 78000, पीएम सूर्य घर योजना, नेट मीटिंग भारत, छत पर सोलर की कीमत, फिक्स्ड चार्ज";
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
      inLanguage: "hi-IN",
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
  .replace(/<html lang="en">/, '<html lang="hi">')
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(
    /(property="og:description"\s*\n?\s*content=")[^"]*(")/,
    `$1${desc}$2`,
  )
  .replace(/(property="og:locale" content=")[^"]*(")/, `$1hi_IN$2`)
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
          अंतिम जाँच:
          <time datetime="2026-11-14">14 नवंबर 2026</time> · प्रकाशित: 14 नवंबर
          2026 · Lucas Ballek
        </p>
        <p>
          योजना शुरू होने के दो साल बाद भी तीन सवाल हर बातचीत में लौटते हैं:
          सब्सिडी कितनी है, पैसा कब मिलता है, और "बिल ज़ीरो" का दावा कितना सच
          है। इस लेख में तीनों का जवाब स्रोत के साथ है — और एक पूरा हिसाब, जिसमें
          वे लाइनें भी दिखती हैं जो सोलर कभी नहीं हटाता।
        </p>

        <h2>केंद्रीय सब्सिडी (CFA): आँकड़े</h2>
        <p>
          MNRE की आवासीय दिशानिर्देश (योजना की शुरुआत 13 फरवरी 2024; 7 जुलाई 2025
          का संशोधन दरें नहीं बदलता) के अनुसार केंद्रीय सहायता क्षमता पर आधारित
          है, कुल खर्च पर नहीं:
        </p>
        <div class="table-container">
          <table>
            <caption>
              केंद्रीय सब्सिडी, सामान्य राज्य (विशेष श्रेणी राज्यों में अधिक)
            </caption>
            <thead>
              <tr>
                <th>सिस्टम</th>
                <th>सामान्य राज्य</th>
                <th>विशेष श्रेणी राज्य/केंद्रशासित प्रदेश</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1 किलोवाट</td><td>₹30,000</td><td>₹33,000</td></tr>
              <tr><td>2 किलोवाट</td><td>₹60,000</td><td>₹66,000</td></tr>
              <tr><td>3 किलोवाट</td><td>₹78,000</td><td>₹85,800</td></tr>
              <tr><td>3 किलोवाट से ऊपर</td><td>₹78,000 पर सीमित</td><td>₹85,800 पर सीमित</td></tr>
            </tbody>
          </table>
        </div>
        <p class="note">
          गणित सरल है: पहले 2 किलोवाट पर ₹30,000 प्रति किलोवाट, तीसरे किलोवाट पर
          ₹18,000 (विशेष श्रेणी में ₹33,000 और ₹19,800). इसलिए 2.5 किलोवाट पर
          सामान्य राज्य में ₹69,000 मिलते हैं। 3 किलोवाट से बड़ा सिस्टम लगाने पर
          सब्सिडी नहीं बढ़ती — यह बात बहुत कम बताई जाती है।
        </p>

        <h2>पैसा कब मिलता है</h2>
        <p>
          सब्सिडी आवेदन पर नहीं, <strong>कमीशनिंग के बाद</strong> मिलती है।
          क्रम यह है: पोर्टल पर आवेदन, व्यवहार्यता स्वीकृति, पंजीकृत विक्रेता से
          इंस्टॉलेशन, बिजली कंपनी (DISCOM) का निरीक्षण और नेट मीटर, फिर पोर्टल पर
          बैंक विवरण और रद्द किया हुआ चेक जमा करना। PIB (1 मार्च 2024) के अनुसार
          बैंक विवरण जमा करने के लगभग 30 दिन में भुगतान; MNRE की दिशानिर्देश में
          DISCOM स्वीकृति के 15 दिन में दावा संसाधित करने की बात है। दोनों घड़ियाँ
          अलग-अलग शुरुआत से चलती हैं, इसलिए "आवेदन के 30 दिन में पैसा" कहना गलत
          होगा।
        </p>

        <h2>बिल में क्या बचता है, क्या नहीं</h2>
        <p>
          बिजली दरें राज्य-वार हैं; कोई राष्ट्रीय आवासीय दर नहीं है। उदाहरण के लिए
          दिल्ली का DERC शेड्यूल (1 अक्टूबर 2021 से लागू) घरेलू स्लैब 3.00 / 4.50 /
          6.50 / 7.00 / 8.00 रुपये प्रति यूनिट और फिक्स्ड चार्ज संकलित लोड पर
          ₹20/किलोवाट (2 किलोवाट तक), ₹50/किलोवाट (2–5 किलोवाट) रखता है। नई दरों
          के लिए अपने राज्य आयोग का ताज़ा आदेश देखें — यहाँ दी गई संख्या उदाहरण है,
          दावा नहीं।
        </p>
        <p>
          <strong>फिक्स्ड चार्ज सोलर से नहीं हटता।</strong> BSES की सितंबर 2025 की
          FAQ साफ़ कहती है कि सोलर से खपत घटने पर भी फिक्स्ड चार्ज देय रहता है।
          और साल के अंत में बची हुई यूनिटें रिटेल दर पर नहीं, DERC से स्वीकृत
          औसत खरीद लागत (APPC) पर निपटाई जाती हैं। यानी जो यूनिट आप खुद नहीं
          खपाते, उसकी कीमत आपके स्लैब से कम है।
        </p>

        <h2>एक पूरा हिसाब (दिल्ली उदाहरण)</h2>
        <p>
          मान लीजिए: 300 यूनिट प्रति माह, 3 किलोवाट सिस्टम, दिन में प्रति किलोवाट
          4.0 यूनिट उत्पादन (माह में 360 यूनिट), और उत्पादन का 60% घर में ही खपत
          (216 यूनिट)। शेष 144 यूनिट नेट मीटर से बाहर जाती हैं। यह कैलकुलेटर की
          तरह एक अनुमान है, आपकी छत का उत्पादन अलग होगा।
        </p>
        <div class="table-container">
          <table>
            <caption>
              मासिक ऊर्जा लाइन, रुपये में (दिल्ली स्लैब उदाहरण)
            </caption>
            <thead>
              <tr>
                <th>खाता</th>
                <th>सोलर के बिना</th>
                <th>3 किलोवाट सोलर के साथ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>ग्रिड से खरीदी यूनिट</td><td>300</td><td>84</td></tr>
              <tr><td>ऊर्जा शुल्क</td><td>₹1,050</td><td>₹252</td></tr>
              <tr><td>फिक्स्ड चार्ज (3 किलोवाट)</td><td>₹150</td><td>₹150</td></tr>
              <tr><td>कुल</td><td>₹1,200</td><td>₹402</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          ऊर्जा शुल्क का गणित: 200 × 3.00 = ₹600 और 100 × 4.50 = ₹450, कुल
          ₹1,050. सोलर के बाद 84 यूनिट पहले स्लैब में: ₹252. फिक्स्ड चार्ज ₹150
          दोनों तरफ़ समान है — इसीलिए बिल शून्य नहीं होता, चाहे सोलर कितना भी हो।
          144 यूनिट का क्रेडिट अगले महीनों में आगे बढ़ता है और साल के अंत में APPC
          पर निपटता है; वह दर आपकी कंपनी और वर्ष पर निर्भर है, इसलिए इसे यहाँ
          संख्या के रूप में नहीं लिखा गया।
        </p>
        <p>
          सब्सिडी का असर अलग लाइन में देखें: 3 किलोवाट पर ₹78,000 (सामान्य राज्य)
          या ₹85,800 (विशेष श्रेणी). कुल लागत जानने के लिए
          <a href="../../#sizing">कैलकुलेटर</a> में अपना शहर, मासिक यूनिट और छत का
          क्षेत्र डालें — हम कीमत की रेंज दिखाते हैं, एक भी "पक्की" कीमत नहीं।
          दिल्ली के लिए <a href="../../solar-calculator/delhi/">शहर पृष्ठ</a> भी है।
        </p>

        <h2>राज्य का अतिरिक्त फायदा — नाम के साथ</h2>
        <p>
          कुछ राज्य केंद्रीय सब्सिडी के ऊपर अपना योगदान देते हैं। उदाहरण: असम की
          बिजली विभाग की 14 मार्च 2024 की मार्गदर्शिका ₹15,000 प्रति किलोवाट, अधिकतम
          ₹45,000 प्रति उपभोक्ता (3 किलोवाट तक) देती है, केंद्रीय सहायता के अतिरिक्त।
          <em>चेतावनी:</em> उस 2024 दस्तावेज़ से यह सत्यापित नहीं होता कि 2026 में
          चरण-1 की राशि या पात्रता खुली है — अपने राज्य के ताज़ा आदेश से पुष्टि
          करें। किसी भी राज्य के लिए हम "सब्सिडी मिलेगी" का दावा बिना स्रोत नहीं
          करते।
        </p>

        <h2>आवेदन कहाँ से</h2>
        <p>
          राष्ट्रीय पोर्टल <a href="https://pmsuryaghar.gov.in/" rel="noopener"
            >pmsuryaghar.gov.in</a
          >
          पर राज्य, DISCOM और उपभोक्ता संख्या के साथ पंजीकरण करें, छत पर सोलर का
          आवेदन जमा करें, व्यवहार्यता स्वीकृति लें, पोर्टल पर पंजीकृत विक्रेता चुनें,
          इंस्टॉलेशन के बाद विवरण और नेट मीटर का अनुरोध करें, फिर निरीक्षण के बाद
          बैंक विवरण और रद्द चेक जमा करके सब्सिडी का दावा करें।
        </p>

        <h2>जो बातें छोड़ दी जाती हैं</h2>
        <ul>
          <li>
            <strong>3 किलोवाट के ऊपर सब्सिडी नहीं बढ़ती</strong> — बड़ा सिस्टम
            अपनी लागत से बढ़ता है, सब्सिडी से नहीं।
          </li>
          <li>
            <strong>फिक्स्ड चार्ज और मीटर शुल्क बने रहते हैं।</strong> "बिल ज़ीरो"
            का दावा इन्हें नज़रअंदाज़ करता है।
          </li>
          <li>
            <strong>अधिशेष यूनिट रिटेल दर पर नहीं बिकती।</strong> साल के अंत में
            APPC दर मिलती है, जो आमतौर पर आपके स्लैब से कम है।
          </li>
          <li>
            <strong>दरें राज्य-वार हैं।</strong> यहाँ दिया दिल्ली का उदाहरण किसी
            दूसरे राज्य के लिए संख्या नहीं है।
          </li>
        </ul>

        <h2>अक्सर पूछे जाने वाले सवाल</h2>
        <details>
          <summary>3 किलोवाट पर सब्सिडी कितनी है?</summary>
          <p>
            सामान्य राज्य में ₹78,000, विशेष श्रेणी राज्यों में ₹85,800 (MNRE
            आवासीय दिशानिर्देश; दरें 13 फरवरी 2024 से, 7 जुलाई 2025 का संशोधन इन्हें
            नहीं बदलता)।
          </p>
        </details>
        <details>
          <summary>क्या बिल पूरा शून्य हो जाएगा?</summary>
          <p>
            नहीं। ऊर्जा लाइन बहुत कम हो जाती है, लेकिन फिक्स्ड चार्ज, मीटर शुल्क
            और अन्य शुल्क देय रहते हैं — BSES की सितंबर 2025 FAQ भी यही कहती है।
          </p>
        </details>
        <details>
          <summary>सब्सिडी कब तक आती है?</summary>
          <p>
            कमीशनिंग और बैंक विवरण जमा करने के बाद लगभग 30 दिन (PIB, 1 मार्च
            2024); दिशानिर्देश में DISCOM स्वीकृति के 15 दिन में दावा संसाधन की बात
            है। यानी घड़ी आवेदन से नहीं, कमीशनिंग से शुरू होती है।
          </p>
        </details>

        <h2>स्रोत</h2>
        <ul>
          <li>
            MNRE आवासीय CFA दिशानिर्देश —
            <a
              href="https://mnre.gov.in/static/uploads/2025/07/5307df6a2e5fa7bdf8a5efa80a5ab29c.pdf"
              rel="noopener"
              >mnre.gov.in</a
            >
            (13 फरवरी 2024; संशोधन 7 जुलाई 2025)
          </li>
          <li>
            राष्ट्रीय पोर्टल —
            <a href="https://pmsuryaghar.gov.in/" rel="noopener"
              >pmsuryaghar.gov.in</a
            >
          </li>
          <li>
            PIB व्याख्या, 1 मार्च 2024 —
            <a
              href="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2010674"
              rel="noopener"
              >pib.gov.in</a
            >
          </li>
          <li>
            DERC दिल्ली टैरिफ शेड्यूल, 30 सितंबर 2021 —
            <a
              href="https://www.derc.gov.in/sites/default/files/Press%20Release%202022%20Eng%2030.09.2021.pdf"
              rel="noopener"
              >derc.gov.in</a
            >
          </li>
          <li>
            BSES रूफटॉप सोलर FAQ, 19 सितंबर 2025 —
            <a
              href="https://www.bsesdelhi.com/documents/55701/1611949183/RTS_FAQ_Sep25.pdf"
              rel="noopener"
              >bsesdelhi.com</a
            >
          </li>
          <li>
            असम संचालन मार्गदर्शिका, 14 मार्च 2024 —
            <a
              href="https://www.apdcl.org/website/docs/documents/pmsurya/Notification-Operational%20Guidelines.pdf"
              rel="noopener"
              >apdcl.org</a
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
    "- Net metering Bangladesh 2026 (bn-BD): https://freeoffgridcalculator.com/blog/net-metering-bangladesh-2026/";
  const i = llms.indexOf(anchor);
  if (i < 0) throw new Error("llms anchor missing");
  const at = llms.indexOf("\n", i) + 1;
  llms =
    llms.slice(0, at) +
    `- PM Surya Ghar two years on (India, hi-IN): ${url}${eol}` +
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
            "inLanguage": "hi-IN",
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
              <span class="card-tag">सब्सिडी</span>
              <span class="card-tag">भारत</span>
              <span class="card-tag">नेट मीटिंग</span>
            </div>
            <h2>
              <a href="./${slug}/">${title}</a>
            </h2>
            <p class="card-excerpt">${desc}</p>
          </div>
          <div class="card-footer">
            <span>14 Nov 2026 &middot; checked 14 Nov 2026</span>
            <a href="./${slug}/" class="read-more">गाइड पढ़ें &rarr;</a>
          </div>
        </article>
`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
const anchor = `  "blog/net-metering-bangladesh-2026/index.html",`;
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(anchor, `${anchor}\n${entry}`);
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);

console.log("built and registered", slug);

// Build the Bangladesh (bn-BD) post for #378 from the eskom template.
//
// Figures and their sources (all read at source by researcher pass, 2026-11-14):
//   BERC retail order 3 June 2026 / reconsideration 4 June 2026 -> slabs
//   Net Metering Guideline 2025 (Power Division / SREDA) -> netting, 10% DSC,
//   quarterly cash settlement at the utility's 33 kV bulk tariff, 100% of
//   sanctioned load
//   TBS 3 June 2026 -> system weighted-average bulk tariff 8.39 Tk/kWh
// Anything the researcher could not verify is either omitted or flagged as
// needing the consumer's own utility/BERC read.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

const slug = "net-metering-bangladesh-2026";
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;
const title = "নেট মিটারিং বাংলাদেশ ২০২৬: ক্রেডিট আর আসল হিসাব";
const desc =
  "জুন ২০২৬-এর BERC স্ল্যাব, নেট মিটারিংয়ের ১০% কর্তন, ত্রৈমাসিক নগদ নিষ্পত্তি আর একটি কাজ করা হিসাব — বাংলায়।";
const keywords =
  "নেট মিটারিং বাংলাদেশ ২০২৬, BERC ট্যারিফ স্ল্যাব, সোলার রুফটপ বাংলাদেশ, নেট মিটার আবেদন, ৩৩ কেভি বাল্ক ট্যারিফ";
const published = "2026-11-14";

const ldKeywords = keywords.split(", ").map((k) => JSON.stringify(k));

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
      inLanguage: "bn-BD",
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
      keywords: ldKeywords.map((k) => JSON.parse(k)),
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
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: url,
        },
      ],
    },
  ],
};

const head = HEAD.split("eskom-fixed-charge-solar-2027")
  .join(slug)
  .replace(/<html lang="en">/, '<html lang="bn-BD">')
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(
    /(property="og:description"\s*\n?\s*content=")[^"]*(")/,
    `$1${desc}$2`,
  )
  .replace(/(property="og:locale" content=")[^"]*(")/, `$1bn_BD$2`)
  .replace(
    /(name="twitter:title"\s*\n?\s*content=")[^"]*(")/,
    `$1${title}$2`,
  )
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
          সর্বশেষ যাচাই:
          <time datetime="2026-11-14">১৪ নভেম্বর ২০২৬</time> · প্রকাশ: ১৪
          নভেম্বর ২০২৬ · Lucas Ballek
        </p>
        <p>
          ছাদে সৌরবিদ্যুৎ বসালে বাড়ির নিজের ব্যবহার করা বিদ্যুৎ পুরো
          <strong>রিটেইল দরে</strong> বিল থেকে বাদ যায়। কিন্তু যে বিদ্যুৎ বাড়ি
          নিজে ব্যবহার করে না, সেটা জমা হয় সম্পূর্ণ অন্য দরে — ডিস্ট্রিবিউশন
          কোম্পানির <strong>৩৩ কেভি বাল্ক ট্যারিফে</strong>, আর তার আগেই
          <strong>১০%</strong> কেটে নেওয়া হয়। এই লেখাটা BERC-এর জুন ২০২৬-এর
          স্ল্যাব আর ২০২৫ সালের নেট মিটারিং নির্দেশিকা ধরে হিসাবটা হাতে করে
          দেখায়, কারণ ঠিক এই জায়গাতেই বেশিরভাগ "সোলার মানে বিল শূন্য" কথাটা
          ভুল হয়ে যায়।
        </p>

        <h2>জুন ২০২৬ থেকে রিটেইল স্ল্যাব</h2>
        <p>
          BERC ৩ জুন ২০২৬-এ নতুন রিটেইল অর্ডার জারি করে, যা জুন ২০২৬-এর বিল
          থেকেই কার্যকর। ৪ জুন ২০২৬-এর পুনর্বিবেচনা আদেশে কেবল সবচেয়ে নিচের
          দুই ধাপ অপরিবর্তিত রাখা হয় — অর্থাৎ লাইফলাইন ও প্রথম ধাপের ক্রেতার
          জন্য বাড়াটা ফেরত নেওয়া হয়, বাকি ধাপে বৃদ্ধি বলবৎ থাকে।
        </p>
        <div class="table-container">
          <table>
            <caption>
              আবাসিক (LT-A) স্ল্যাব, জুন ২০২৬ বিল থেকে, টাকা/কিলোওয়াট-ঘণ্টা
            </caption>
            <thead>
              <tr>
                <th>ধাপ</th>
                <th>ইউনিট</th>
                <th>টাকা/কিলোওয়াট-ঘণ্টা</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>লাইফলাইন</td><td>০–৫০</td><td>৪.৬৩</td></tr>
              <tr><td>ধাপ ১</td><td>০–৭৫</td><td>৫.২৬</td></tr>
              <tr><td>ধাপ ২</td><td>৭৬–২০০</td><td>৮.৫০</td></tr>
              <tr><td>ধাপ ৩</td><td>২০১–৩০০</td><td>৯.১০</td></tr>
              <tr><td>ধাপ ৪</td><td>৩০১–৪০০</td><td>৯.৬২</td></tr>
              <tr><td>ধাপ ৫</td><td>৪০১–৬০০</td><td>১৫.০১</td></tr>
              <tr><td>ধাপ ৬</td><td>৬০০-এর বেশি</td><td>১৭.৩৫</td></tr>
            </tbody>
          </table>
        </div>
        <p class="note">
          সূত্র: ঢাকা ট্রিবিউন, ৩ জুন ২০২৬; bdnews24 ও দ্য ডেইলি স্টার, ৪ জুন
          ২০২৬ (পুনর্বিবেচনা আদেশ)। এর বাইরে ডিমান্ড চার্জ (আবাসিক শ্রেণিতে
          টাকা ৪২/কিলোওয়াট/মাস, ফাইন্যান্সিয়াল এক্সপ্রেস ৪ জুন ২০২৬), ৫%
          ভ্যাট, ৫% প্রম্পট-পেমেন্ট রিবেট আর মিটার ভাড়া আলাদা লাইন — সৌরবিদ্যুৎ
          এগুলোর একটিও মুছে দেয় না।
        </p>

        <h2>নেট মিটারিং আসলে কীভাবে হিসাব করে</h2>
        <p>
          ২০২৫ সালের নেট মিটারিং নির্দেশিকা (বিদ্যুৎ বিভাগ ও SREDA; বাংলা সংস্করণ
          আগস্ট ২০২৫, ইংরেজি ডিসেম্বর ২০২৫) অনুযায়ী বিলের ইউনিট হয়
          <em>আমদানি − রপ্তানি − আগের জমা ক্রেডিট</em>. অর্থাৎ মাসে যা রপ্তানি হয়
          তা প্রথমে ওই মাসের আমদানির সঙ্গে মিলিয়ে নেওয়া হয়, আর বাকিটা পরের মাসে
          ক্রেডিট হিসেবে জমা থাকে। এখানেই বাড়ির জন্য আসল সুবিধাটা: নিজের ব্যবহার
          করা ইউনিট রিটেইল স্ল্যাবেই বাদ যায়। কিন্তু তিনটি জিনিস মনে রাখতে হবে:
        </p>
        <ul>
          <li>
            <strong>১০% ডিস্ট্রিবিউশন সিস্টেম মেইনটেন্যান্স চার্জ:</strong> বিলিং
            পিরিয়ডে নেট রপ্তানির ১০% কেটে বাকি ৯০% ক্রেডিটে যোগ হয় (নির্দেশিকা,
            ধারা ৩.৪ M)।
          </li>
          <li>
            <strong>নিষ্পত্তি ত্রৈমাসিক, এবং নগদে:</strong> মার্চ, জুন, সেপ্টেম্বর
            ও ডিসেম্বর শেষে হিসাব মিলিয়ে উদ্বৃত্ত ইউনিটের টাকা ব্যাংক ট্রান্সফার,
            মোবাইল ফিন্যান্সিয়াল সার্ভিস বা চেকে দেওয়া হয় (ধারা ৩.৪ F, G)। এই
            টাকাটা কিন্তু রিটেইল দরে নয়।
          </li>
          <li>
            <strong>নগদ দর = ৩৩ কেভি বাল্ক ট্যারিফ:</strong> নির্দেশিকার ধারা ৩.৫
            (b) বলছে, ৩৩ কেভি বা নিচের ভোক্তার ক্ষেত্রে সংশ্লিষ্ট কোম্পানির জন্য
            BERC-নির্ধারিত ৩৩ কেভি বাল্ক ট্যারিফ প্রযোজ্য। ৩ জুন ২০২৬-এ সিস্টেমের
            ভারিত গড় বাল্ক ট্যারিফ দাঁড়ায় ৮.৩৯ টাকা/কিলোওয়াট-ঘণ্টা (TBS, ৩ জুন
            ২০২৬)। আপনার জোনের কোম্পানির নির্দিষ্ট বাল্ক দর BERC-এর আদেশ থেকেই
            দেখে নিতে হবে — এখানে সিস্টেম-গড়টাই ধরা হয়েছে।
          </li>
        </ul>
        <p>
          ফলে হিসাবটা সরল: নিজে ব্যবহার করা ইউনিট আপনার স্ল্যাব-দরে বাঁচে, উদ্বৃত্ত
          ইউনিট বাঁচে বাল্ক দরে, তার আগে ১০% কাটা। যত বেশি নিজে ব্যবহার করবেন,
          তত ভালো — এটাই এই পোস্টের মূল কথা।
        </p>

        <h2>কত কিলোওয়াট বসাতে পারবেন</h2>
        <p>
          ২০২৫ নির্দেশিকার ধারা ৩.৩ (B): সৌর সিস্টেমের এসি আউটপুট
          <strong>স্যাংকশনড লোডের ১০০%-এর বেশি হতে পারবে না</strong>. অনেক পুরনো
          পেজে (এবং SREDA-র সহায়তা ডেস্কে এখনও) ৭০% লেখা আছে — সেটা ২০১৮
          নির্দেশিকার সংখ্যা। স্যাংকশনড লোডের বেশি বসাতে চাইলে আলাদা আবেদন করে
          বিদ্যুৎ বিভাগের অনুমোদন লাগে। সিঙ্গেল-ফেজ ও থ্রি-ফেজ — দুই ভোক্তাই
          আবেদন করতে পারেন, শর্ত হলো বকেয়া না থাকা এবং ছাদের মালিকানা (বা
          মালিকের লিখিত অনুমতি)।
        </p>

        <h2>মিটার আর আবেদন</h2>
        <p>
          বাই-ডিরেকশনাল নেট মিটার বাধ্যতামূলক এবং এর খরচ ভোক্তাকেই বহন করতে হয়;
          অবশ্য পুরনো ইউনিডিরেকশনাল মিটার reprogram করে নেওয়ার সুযোগ আছে যদি
          কোম্পানি পারে (অফিসিয়াল FAQ)। আবেদন যায় সংশ্লিষ্ট ডিস্ট্রিবিউশন
          কোম্পানির দপ্তরে, অথবা অনলাইনে
          <a href="https://nem.powerdivision.gov.bd/" rel="noopener"
            >nem.powerdivision.gov.bd</a
          >-এ — SREDA-র কাছে নয়। নির্দেশিকার সময়সূচি: আবেদন ৫ দিন, অনুমোদন
          সর্বোচ্চ ১০ কর্মদিবস, ইনস্টলেশনের সময়সীমা ৮ মাস, ইনস্টল হওয়ার পর
          মূল্যায়ন ১৫ দিন, তারপর চুক্তি সর্বোচ্চ ১৫ কর্মদিবসে। চুক্তির তারিখটাই
          Commercial Operation Date.
        </p>

        <h2>একটা কাজ করা হিসাব</h2>
        <p>
          ধরুন, ঢাকায় একটি বাড়ির মাসিক ব্যবহার ৩০০ ইউনিট, স্যাংকশনড লোড ৩
          কিলোওয়াট, আর ছাদে বসানো হলো <strong>২ কিলোওয়াট</strong> সোলার।
          ধরে নিচ্ছি: দিনে প্রতি কিলোওয়াটে ৪.২ ইউনিট উৎপাদন (মাসে ২৫২ ইউনিট) এবং
          উৎপাদনের ৬০% বাড়িতেই নিজে ব্যবহার হয় (১৫১ ইউনিট), বাকি ১০১ ইউনিট
          গ্রিডে যায়। হিসাবটা শুধু বিদ্যুতের লাইনের জন্য; ডিমান্ড চার্জ, ভ্যাট,
          মিটার ভাড়া আলাদা।
        </p>
        <div class="table-container">
          <table>
            <caption>
              মাসিক হিসাব, টাকায় (স্ল্যাব ও বাল্ক দর উপরের সূত্র থেকে)
            </caption>
            <thead>
              <tr>
                <th>খাত</th>
                <th>সোলার ছাড়া</th>
                <th>২ কিলোওয়াট সোলারসহ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>গ্রিড থেকে কেনা ইউনিট</td>
                <td>৩০০</td>
                <td>১৪৯ (৩০০ − ১৫১)</td>
              </tr>
              <tr>
                <td>বিদ্যুতের বিল (স্ল্যাব অনুযায়ী)</td>
                <td>২,৩৬৭ টাকা</td>
                <td>১,০২৪ টাকা</td>
              </tr>
              <tr>
                <td>উদ্বৃত্ত ১০১ ইউনিটের ক্রেডিট</td>
                <td>—</td>
                <td>প্রায় ৭৬৩ টাকা (৮.৩৯ × ০.৯)</td>
              </tr>
              <tr>
                <td>মোট সুবিধা</td>
                <td>—</td>
                <td>প্রায় ২,১০৬ টাকা/মাস</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          ২,৩৬৭ টাকার বিল: ৭৫ × ৫.২৬ = ৩৯৪.৫০, ১২৫ × ৮.৫০ = ১,০৬২.৫০, ১০০ ×
          ৯.১০ = ৯১০ — যোগফল ২,৩৬৭ টাকা। সোলারের পর ১৪৯ ইউনিট: ৭৫ × ৫.২৬ +
          ৭৪ × ৮.৫০ = ১,০২৩.৫০ টাকা।
        </p>
        <p>
          খেয়াল করুন, উদ্বৃত্ত ১০১ ইউনিটের দর ৭.৫৫ টাকা, অথচ ওই ইউনিটগুলো নিজে
          ব্যবহার করলে বাঁচত ৯.১০ টাকা। পার্থক্য প্রতি ইউনিটে প্রায় ১.৫৫ টাকা —
          মাসে প্রায় ১৫৭ টাকা, বছরে প্রায় ১,৮৮০ টাকা। এই টাকাটা ফেরানোর একমাত্র
          উপায় ব্যাটারি নয়, <em>ব্যবহারের সময় সরানো</em>: দিনের উৎপাদন যখন হয়,
          তখনই পানি গরম করা, ওয়াশিং মেশিন বা এসি চালানো।
        </p>
        <p>
          আপনার নিজের সংখ্যা বসাতে চাইলে
          <a href="../../#sizing">ক্যালকুলেটরে</a> মাসিক ইউনিট, ট্যারিফ আর ছাদের
          আকার দিয়ে দেখুন — এখানকার উদাহরণটা ধরে নেওয়া অনুমানের উপর দাঁড়ানো, আপনার
          ছাদের ইউনিট উৎপাদন আলাদা হবে। ঢাকার জন্য
          <a href="../../solar-calculator/dhaka/">শহরভিত্তিক পাতা</a>-ও আছে।
        </p>

        <h2>যা সাধারণত বলা হয় না</h2>
        <ul>
          <li>
            <strong>ফিক্সড চার্জ কমে না।</strong> ডিমান্ড চার্জ, মিটার ভাড়া, ভ্যাট
            — সৌরবিদ্যুৎ শুধু কিলোওয়াট-ঘণ্টার লাইনটা কমায়।
          </li>
          <li>
            <strong>উদ্বৃত্তবিদ্যুৎ রিটেইল দরে বিক্রি হয় না।</strong> রিটেইল স্ল্যাব
            ৫.২৬ থেকে ১৭.৩৫ টাকা, আর নগদ নিষ্পত্তি হয় বাল্ক দরে (সিস্টেম-গড় ৮.৩৯)
            মাইনাস ১০%.
          </li>
          <li>
            <strong>ইনস্টলেশনের সময়সীমা ৮ মাস।</strong> অনুমোদনের পরও এই সময়টা
            লাগতে পারে, তাই "এ মাসেই বিল কমবে" ধরে নিয়ে লোন নেবেন না।
          </li>
          <li>
            <strong>স্যাংকশনড লোডের বেশি বসানো যায় না</strong> — ২০২৫ নির্দেশিকায়
            সীমা ১০০%, পুরনো ৭০% নয়।
          </li>
        </ul>

        <h2>সচরাচর জিজ্ঞাসা</h2>
        <details>
          <summary>নেট মিটারিংয়ে বিল কি শূন্য হয়ে যাবে?</summary>
          <p>
            না। কিলোওয়াট-ঘণ্টার লাইনটা অনেকটাই কমে, কিন্তু ডিমান্ড চার্জ, মিটার
            ভাড়া ও ভ্যাট থেকে যায়। আর উদ্বৃত্ত ইউনিট রিটেইল দরে নয়, বাল্ক দরে
            নিষ্পত্তি হয়।
          </p>
        </details>
        <details>
          <summary>১০% কর্তনটা কী?</summary>
          <p>
            ২০২৫ নির্দেশিকার ধারা ৩.৪ (M) অনুযায়ী বিলিং পিরিয়ডে নেট রপ্তানির ১০%
            ডিস্ট্রিবিউশন সিস্টেম মেইনটেন্যান্স চার্জ হিসেবে কাটা হয়; বাকি ৯০%
            আপনার ক্রেডিটে যোগ হয়।
          </p>
        </details>
        <details>
          <summary>ক্রেডিটের টাকা কখন হাতে পাব?</summary>
          <p>
            নিষ্পত্তি ত্রৈমাসিক — মার্চ, জুন, সেপ্টেম্বর ও ডিসেম্বর শেষে। ব্যাংক
            ট্রান্সফার, মোবাইল ফিন্যান্সিয়াল সার্ভিস বা চেক, আবেদনে যেটা বেছেছেন।
            পোর্টালের কিছু পুরনো FAQ-এ বাৎসরিক নিষ্পত্তির কথা আছে; নির্দেশিকাই
            ত্রৈমাসিক বলে, সেটাই মানতে হবে।
          </p>
        </details>
        <details>
          <summary>কত কিলোওয়াট বসাতে পারব?</summary>
          <p>
            স্যাংকশনড লোডের সমান পর্যন্ত (১০০%)। তার বেশি হলে আলাদা অনুমোদন লাগে।
          </p>
        </details>

        <h2>সূত্র</h2>
        <ul>
          <li>
            BERC রিটেইল অর্ডার, ৩ জুন ২০২৬ —
            <a
              href="https://www.dhakatribune.com/bangladesh/power-energy/411666/how-much-does-electricity-tariff-increase-per"
              rel="noopener"
              >ঢাকা ট্রিবিউন</a
            >
            (৩ জুন ২০২৬)
          </li>
          <li>
            পুনর্বিবেচনা আদেশ, ৪ জুন ২০২৬ —
            <a href="https://bdnews24.com/bangladesh/e7c4b4a4b192" rel="noopener"
              >bdnews24</a
            >
            ও
            <a
              href="https://www.thedailystar.net/news/environment/natural-resources/energy/news/berc-withdraws-electricity-price-hike-low-use-residential-consumers-4190646"
              rel="noopener"
              >দ্য ডেইলি স্টার</a
            >
          </li>
          <li>
            সিস্টেম-গড় বাল্ক ট্যারিফ ৮.৩৯ টাকা/কিলোওয়াট-ঘণ্টা —
            <a
              href="https://www.tbsnews.net/bangladesh/energy/retail-power-tariff-hiked-tk152-amid-subsidy-cuts-1453181"
              rel="noopener"
              >TBS</a
            >
            (৩ জুন ২০২৬)
          </li>
          <li>
            ডিমান্ড চার্জ অপরিবর্তিত —
            <a
              href="https://today.thefinancialexpress.com.bd/first-page/electricity-prices-hiked-across-the-board-1780508835"
              rel="noopener"
              >ফাইন্যান্সিয়াল এক্সপ্রেস</a
            >
            (৪ জুন ২০২৬)
          </li>
          <li>
            নেট মিটারিং নির্দেশিকা ২০২৫, বিদ্যুৎ বিভাগ / SREDA —
            <a
              href="https://solar.sreda.gov.bd/doc/Net%20Metering%20Guidelines-2025.pdf"
              rel="noopener"
              >বাংলা সংস্করণ</a
            >
            ও
            <a href="https://nem.powerdivision.gov.bd/" rel="noopener"
              >আবেদন পোর্টাল</a
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
    "- Dotacja na magazyn energii (Poland, PME 2): https://freeoffgridcalculator.com/blog/dotacja-magazyn-energii-2026/";
  const i = llms.indexOf(anchor);
  if (i < 0) throw new Error("llms anchor missing");
  const at = llms.indexOf("\n", i) + 1;
  llms =
    llms.slice(0, at) +
    `- Net metering Bangladesh 2026 (bn-BD): ${url}${eol}` +
    llms.slice(at);
}
writeFileSync("llms.txt", llms);

let rss = readFileSync("rss.xml", "utf8");
if (!rss.includes(url)) {
  const item = `    <item>${eol}      <title>${title}</title>${eol}      <link>${url}</link>${eol}      <guid isPermaLink="true">${url}</guid>${eol}      <pubDate>Sat, 14 Nov 2026 00:00:00 GMT</pubDate>${eol}      <description>${desc}</description>${eol}    </item>${eol}`;
  rss = rss.replace(/(<lastBuildDate>[^<]*<\/lastBuildDate>\r?\n)/, `$1${item}`);
  rss = rss.replace(
    /<lastBuildDate>[^<]*<\/lastBuildDate>/,
    `<lastBuildDate>Sat, 14 Nov 2026 00:00:00 GMT</lastBuildDate>`,
  );
}
writeFileSync("rss.xml", rss);

let hub = readFileSync("blog/index.html", "utf8");
if (!hub.includes(url)) {
  const ldPost = `          {
            "@type": "BlogPosting",
            "headline": ${JSON.stringify(title)},
            "name": ${JSON.stringify(title)},
            "description": ${JSON.stringify(desc)},
            "inLanguage": "bn-BD",
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
              <span class="card-tag">ট্যারিফ</span>
              <span class="card-tag">বাংলাদেশ</span>
              <span class="card-tag">নেট মিটারিং</span>
            </div>
            <h2>
              <a href="./${slug}/">${title}</a>
            </h2>
            <p class="card-excerpt">${desc}</p>
          </div>
          <div class="card-footer">
            <span>14 Nov 2026 &middot; checked 14 Nov 2026</span>
            <a href="./${slug}/" class="read-more">গাইডটি পড়ুন &rarr;</a>
          </div>
        </article>
`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
const bdAnchor = `  "blog/program-afm-baterii-2026/index.html",`;
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(bdAnchor, `${bdAnchor}\n${entry}`);
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);

console.log("built and registered", slug);

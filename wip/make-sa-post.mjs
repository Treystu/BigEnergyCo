// Build the South Africa (EN) wave-1 post (#368, program #366) from the
// escape-load-shedding template: same head/header/footer scaffolding, new body.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SLUG = "eskom-fixed-charge-solar-2027";
const OUT = `blog/${SLUG}/index.html`;
const TITLE = "Eskom's Fixed Charge and Solar: 2027 Payback Math";
const DESC =
  "NERSA decides Eskom's 2027 tariff structure on 26 Nov 2026. What a heavier fixed charge does to solar and battery payback, with rand worked examples.";

const tpl = readFileSync("blog/escape-load-shedding/index.html", "utf8");
const h1At = tpl.indexOf("        <h1>");
const relatedAt = tpl.indexOf("        <h2>Related guides</h2>");
if (h1At < 0 || relatedAt < 0) throw new Error("template markers not found");
let headPart = tpl.slice(0, h1At);
const tailPart = tpl.slice(relatedAt);

headPart = headPart
  .split("escape-load-shedding")
  .join(SLUG)
  .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
  .replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${DESC}$2`,
  )
  .replace(
    /(name="keywords"\s*\n?\s*content=")[^"]*(")/,
    `$1eskom fixed charge 2027, nersa decision 26 november 2026, homepower fixed charge, solar payback south africa, battery payback eskom$2`,
  )
  .replace(/(content=")[^"]*(" \/>\r?\n    <meta property="og:url")/, `$1${TITLE}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${TITLE}$2`)
  .replace(/(property="og:description"\s*\n?\s*content=")[^"]*(")/, `$1${DESC}$2`)
  .replace(/(name="twitter:title"\s*\n?\s*content=")[^"]*(")/, `$1${TITLE}$2`)
  .replace(/(name="twitter:description"\s*\n?\s*content=")[^"]*(")/, `$1${DESC}$2`)
  .replace(/content="2026-09-07" \/>/, `content="2026-11-11" />`)
  .replace(/content="2026-10-22" \/>/, `content="2026-11-11" />`)
  .replace(/"headline": "[^"]*"/, `"headline": ${JSON.stringify(TITLE)}`)
  .replace(/"name": "[^"]*"/, `"name": ${JSON.stringify(TITLE)}`)
  .replace(/"description": "[^"]*"/, `"description": ${JSON.stringify(DESC)}`)
  .replace(/"datePublished": "[^"]*"/, `"datePublished": "2026-11-11T00:00:00Z"`)
  .replace(/"dateModified": "[^"]*"/, `"dateModified": "2026-11-11T00:00:00Z"`)
  .replace(
    /"keywords": \[[\s\S]*?\]/,
    `"keywords": [
              "eskom fixed charge 2027",
              "nersa decision 26 november 2026",
              "homepower fixed charge",
              "solar payback south africa"
            ]`,
  );

const body = `        <h1>${TITLE}</h1>
        <p class="meta">
          Last reviewed:
          <time datetime="2026-11-11">November 11, 2026</time> · Published:
          November 11, 2026 · Lucas Ballek
        </p>
        <p>
          On <strong>26 November 2026</strong> NERSA is due to decide Eskom's
          retail tariff structure for 2027/28 — the schedule that splits the
          regulator's already-approved revenue between a fixed monthly line and
          a per-kWh line. The headline number people quote is 8.83%. For a
          household with solar, the number that matters is smaller than that,
          because part of the increase is recovered from a charge you pay
          whether or not your panels are producing. This guide works out what
          that does to the rand you actually save.
        </p>
        <h2>What is being decided, and when</h2>
        <p>
          Two things are easy to confuse, and the difference decides how much
          your solar is worth:
        </p>
        <ul>
          <li>
            <strong>The revenue is already approved.</strong> NERSA's MYPD6
            redetermination of 7 February 2026 set an 8.83% overall Eskom price
            path for 2027/28.
          </li>
          <li>
            <strong>The structure is not.</strong> The November decision is on
            Eskom's Retail Tariff and Structural Adjustment (ERTSA) application
            — the price schedule that recovers that revenue, and therefore the
            split between fixed service charges and energy rates. Eskom's own
            FY2028 application states that the fixed service charges on the
            <em>Homepower</em> and <em>Homeflex</em> residential tariffs step up
            to 100% of the Retail Tariff Plan rand-value in this third year
            (<a
              href="https://businesstech.co.za/news/wp-content/uploads/2026/09/AnnexureB-FY2028ERTSAApplication.pdf"
              >Eskom FY2028 ERTSA application, Annexure B</a
            >).
          </li>
        </ul>
        <p>
          Implementation is 1 April 2027 for Eskom direct customers, with
          municipal tariffs normally following on 1 July. The 2026/27 year shows
          the same mechanism already running: the fixed portion of the service
          and administration charge rose to 66.66% of the originally proposed
          FY2025 rand-value, up from 33.33%, with energy rates lowered to keep
          the average increase at 8.76% for residential customers (<a
            href="https://www.eskom.co.za/distribution/2026-2027-tariff-increase"
            >Eskom 2026/27 tariff page</a
          >; the 2026/27 decision is
          <a
            href="https://www.nersa.org.za/files/files/2026/05/EskomRetailTariffAppRFDFinal.pdf"
            >NERSA's ERTSA decision and reasons</a
          >).
        </p>
        <h2>The figures on the table, attributed</h2>
        <p>
          These are the applicant's proposed schedule and the numbers in the
          consultation record, not an approved outcome. I am quoting them with
          their sources so you can re-check them after 26 November rather than
          take my word for it.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Proposed 2027/28 figures, as filed and as reported
            </caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Figure</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Overall Eskom price path 2027/28</td>
                <td>8.83%</td>
                <td>NERSA MYPD6 redetermination, 7 Feb 2026</td>
              </tr>
              <tr>
                <td>Municipal average price, FY2028</td>
                <td>245.59 c/kWh, from 225.66 c/kWh</td>
                <td>
                  Eskom application, Annexure B, as reported
                  <a
                    href="https://www.solarnews24.co.za/news/eskom-8-83-percent-increase-2027-nersa-decision-26-november"
                    >2 Nov 2026</a
                  >
                </td>
              </tr>
              <tr>
                <td>Homepower/Homeflex fixed service charge</td>
                <td>steps to 100% of the RTP rand-value in FY2028</td>
                <td>Eskom FY2028 ERTSA application</td>
              </tr>
              <tr>
                <td>Homepower fixed charge, reported range</td>
                <td>about R660.90 to about R841 a month</td>
                <td>
                  <a
                    href="https://energybee.co.za/news/eskom-fixed-charge-670-south-africa-2027"
                    >EnergyBee, 24 Oct 2026</a
                  >;
                  <a
                    href="https://www.actionsa.org.za/eskoms-tariff-changes-could-hit-lower-consumption-households-hardest"
                    >ActionSA submission, 18 Sep 2026</a
                  >
                </td>
              </tr>
              <tr>
                <td>Decision date</td>
                <td>26 November 2026</td>
                <td>
                  NERSA consultation timetable, as reported
                  <a
                    href="https://www.solarnews24.co.za/news/eskom-8-83-percent-increase-2027-nersa-decision-26-november"
                    >2 Nov 2026</a
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h2>What a solar household can and cannot avoid</h2>
        <p>
          A fixed monthly service charge is <em>not</em> avoidable by generating
          your own electricity. It is billed for being connected, and the
          proposed schedule raises it. What your system avoids is the energy
          line: every kWh you serve yourself is a kWh you do not buy at the
          per-kWh rate.
        </p>
        <p>
          Because the two lines move in opposite directions to hold the average
          at 8.83%, a heavier fixed line means a lighter energy line. That makes
          each self-consumed kWh worth slightly less than it was, even though
          your total bill would still rise without solar. This is the part that
          most savings claims leave out.
        </p>
        <h2>A worked example in rand</h2>
        <p>
          Take a household buying 900 kWh a month on a Homepower-type tariff.
          Figures are illustrative and rounded; the point is the arithmetic, not
          the exact cents, and the real numbers are on your own bill.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Same household, before and after a heavier fixed line
            </caption>
            <thead>
              <tr>
                <th scope="col">Reading</th>
                <th scope="col">Energy rate R2.90, fixed R600</th>
                <th scope="col">Energy rate R2.67, fixed R750</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bill with no solar</td>
                <td>900 × 2.90 + 600 = R3,210</td>
                <td>900 × 2.67 + 750 = R3,153</td>
              </tr>
              <tr>
                <td>Bill with solar covering 80%</td>
                <td>180 × 2.90 + 600 = R1,122</td>
                <td>180 × 2.67 + 750 = R1,231</td>
              </tr>
              <tr>
                <td>Rand saved per month</td>
                <td>R2,088</td>
                <td>R1,922</td>
              </tr>
              <tr>
                <td>Percent of the bill cut</td>
                <td>65%</td>
                <td>61%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The percentage bill cut falls as well as the rand: the fixed line is a
          larger share of the bill, and solar cannot touch it. Two consequences
          follow, and both are design decisions rather than slogans:
        </p>
        <ul>
          <li>
            <strong>Self-consumption beats export.</strong> A kWh you use behind
            the meter avoids the full energy rate; a kWh you export is worth
            whatever the tariff credits, which is a different and usually lower
            number.
          </li>
          <li>
            <strong>Oversizing for a percent target is the wrong aim.</strong>
            Past the point where your daytime load is covered, extra panels
            improve the percentage and barely improve the rand. Size against
            the energy line you can actually displace.
          </li>
        </ul>
        <h2>Where a battery changes the arithmetic</h2>
        <p>
          A battery moves solar energy from the middle of the day to the evening,
          where it displaces energy you would otherwise buy. The arithmetic has
          three parts:
        </p>
        <ul>
          <li>
            <strong>What you shift.</strong> If you shift 8 kWh a day, that is
            about 240 kWh a month of grid energy you no longer buy.
          </li>
          <li>
            <strong>What the round trip costs.</strong> At about 90% round-trip
            efficiency, delivering 240 kWh takes about 267 kWh of solar, so about
            27 kWh is spent on losses. If those kWh would otherwise have been
            exported for a small credit, that is the real cost of shifting.
          </li>
          <li>
            <strong>What the battery costs over 20 years.</strong> Capex, plus
            any replacement, divided by the kWh it actually delivers — the
            calculator's own levelized figure does this division for you.
          </li>
        </ul>
        <p>
          At R2.67 a kWh, 240 kWh a month is about R641 of avoided energy, before
          the loss cost above. Whether that clears the battery's own cost per kWh
          is the whole question, and it is a calculation, not a sales claim. This
          guide deliberately does not print a hardware price: landed-DIY and
          turnkey quotes in South Africa differ by more than the subsidy debates
          do, so use a written quote and the calculator's levelized row.
        </p>
        <h2>What to do before 26 November</h2>
        <ul>
          <li>
            <strong>Read your own split.</strong> Find the fixed service charge
            and the energy rate on your latest bill. The ratio tells you how much
            of your bill solar can reach.
          </li>
          <li>
            <strong>Size against energy, not percent.</strong> Enter your kWh and
            your country in the calculator; the bill-cut target is a slider, and
            the honest answer is the system that displaces the energy you
            actually buy.
          </li>
          <li>
            <strong>Re-check after the decision.</strong> The 26 November outcome
            sets the split. If fixed charges rise further than proposed, the
            rand savings per self-consumed kWh fall again.
          </li>
        </ul>
        <div class="cta-box">
          <p>
            <strong>Size the system against the line you can displace.</strong>
            Enter your location and monthly use; the calculator prices the system
            from local hourly weather and shows the levelized cost per kWh beside
            the grid rate.
          </p>
          <a class="btn" href="../../#sizing">Size my system</a>
        </div>
`;

const tail = tailPart
  .split("escape-load-shedding")
  .join(SLUG)
  .replace(
    /<ul>[\s\S]*?<\/ul>/,
    `<ul>
          <li>
            <a href="../how-to-cut-electricity-bill-with-solar/"
              >How to cut your bill with solar</a
            >
          </li>
          <li>
            <a href="../time-of-use-tariffs-battery/"
              >Time-of-use tariffs and battery shifting</a
            >
          </li>
          <li>
            <a href="../escape-load-shedding/"
              >Solar backup for load shedding: sizing critical loads</a
            >
          </li>
          <li>
            <a href="../../solar-calculator/johannesburg/"
              >Johannesburg sizing</a
            >
            · <a href="../../solar-calculator/cape-town/">Cape Town sizing</a> ·
            <a href="../../solar-calculator/">all cities</a>
          </li>
        </ul>`,
  )
  .replace(
    /<details>[\s\S]*?<\/details>\s*<details>[\s\S]*?<\/details>\s*<details>[\s\S]*?<\/details>\s*<details>[\s\S]*?<\/details>/,
    `<details>
          <summary>Is the 8.83% increase confirmed?</summary>
          <p>
            The 8.83% overall path was set in NERSA's MYPD6 redetermination of
            7 February 2026. The 26 November 2026 decision is on the tariff
            structure and price schedule that recovers it, which is where the
            fixed-versus-energy split is set. Check NERSA's published decision
            after that date rather than relying on a headline.
          </p>
        </details>
        <details>
          <summary>Will solar reduce my fixed monthly charge?</summary>
          <p>
            No. A fixed service or network charge is billed for the connection.
            Solar displaces the per-kWh energy line, and a battery shifts when
            you buy from the grid.
          </p>
        </details>
        <details>
          <summary>Does a bigger system always save more?</summary>
          <p>
            Not in rand. Once your daytime load is covered, extra generation is
            exported at the tariff's credit rather than avoiding the full energy
            rate, so the marginal saving per extra kW falls. Size against the
            energy you displace.
          </p>
        </details>
        <details>
          <summary>What changes for municipal customers?</summary>
          <p>
            Municipal tariffs normally follow on 1 July rather than 1 April, and
            municipalities set their own charge structures within NERSA's
            approval. Read your own municipality's schedule; the Eskom split does
            not transfer automatically.
          </p>
        </details>`,
  );

mkdirSync(`blog/${SLUG}`, { recursive: true });
writeFileSync(OUT, headPart + body + tail);
console.log(`wrote ${OUT} (${(headPart + body + tail).length} bytes)`);

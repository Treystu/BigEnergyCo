// Build the Brazil (pt-BR) post for #379 and fix the AU post's related/FAQ tail.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const tpl = readFileSync("blog/eskom-fixed-charge-solar-2027/index.html", "utf8");
const HEAD = tpl.slice(0, tpl.indexOf("        <h1>"));
const TAIL = tpl.slice(tpl.indexOf("        <h2>Related guides</h2>"));

const slug = "fio-b-75-2027-brasil";
const title = "Fio B em 2027 sobe para 75%: o que muda na conta solar";
const desc =
  "De 1º de janeiro de 2027 o Fio B sobre a energia compensada sobe de 60% para 75%. Quanto custa, com a conta feita e a lei citada.";
const keywords =
  "Fio B 2027, Lei 14.300, geração distribuída 2027, compensação de energia solar, direito adquirido 2045";
const published = "2026-11-12";

const ldKeywords = keywords.split(", ").map((k) => JSON.stringify(k)).join(", ");

const head = HEAD.split("eskom-fixed-charge-solar-2027")
  .join(slug)
  .replace(/<html lang="en">/, '<html lang="pt-BR">')
  .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  .replace(/(name="description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(name="keywords"\s*\n?\s*content=")[^"]*(")/, `$1${keywords}$2`)
  .replace(/(property="og:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(/(property="og:description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/(property="og:locale" content=")[^"]*(")/, `$1pt_BR$2`)
  .replace(/(name="twitter:title"\s*\n?\s*content=")[^"]*(")/, `$1${title}$2`)
  .replace(/(name="twitter:description"\s*\n?\s*content=")[^"]*(")/, `$1${desc}$2`)
  .replace(/"headline": "[^"]*"/, `"headline": ${JSON.stringify(title)}`)
  .replace(/"name": "[^"]*"/, `"name": ${JSON.stringify(title)}`)
  .replace(/"description": "[^"]*"/, `"description": ${JSON.stringify(desc)}`)
  .replace(/"inLanguage": "[^"]*"/, '"inLanguage": "pt-BR"')
  .replace(/"datePublished": "[^"]*"/, `"datePublished": "${published}T00:00:00Z"`)
  .replace(/"dateModified": "[^"]*"/, `"dateModified": "${published}T00:00:00Z"`)
  .replace(/"keywords": \[[\s\S]*?\]/, `"keywords": [${ldKeywords}]`);

const body = `        <h1>${title}</h1>
        <p class="meta">
          Última verificação:
          <time datetime="2026-11-12">12 de novembro de 2026</time> · Publicado: 12
          de novembro de 2026 · Lucas Ballek
        </p>
        <p>
          Em <strong>1º de janeiro de 2027</strong> o Fio B cobrado sobre a
          energia compensada sobe de <strong>60% para 75%</strong>, para as
          unidades que não têm direito adquirido. O painel não muda. O inversor
          não muda. A conta muda: no exemplo abaixo, <strong>R$ 42 por
          mês</strong>. Este texto faz a conta e cita o artigo, em vez de repetir
          que "o Fio B vai subir".
        </p>
        <h2>A escada do art. 27, ano a ano</h2>
        <p>
          O cronograma está na própria lei, no art. 27 da Lei 14.300/2022, e não
          em resolução: são percentuais das componentes de distribuição que
          incidem sobre <em>toda a energia elétrica ativa compensada</em>.
        </p>
        <div class="table-container">
          <table>
            <caption>
              Percentual do art. 27 por ano de faturamento
            </caption>
            <thead>
              <tr>
                <th scope="col">A partir de</th>
                <th scope="col">Percentual</th>
                <th scope="col">Base legal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>2023</td><td>15%</td><td>art. 27, I</td></tr>
              <tr><td>2024</td><td>30%</td><td>art. 27, II</td></tr>
              <tr><td>2025</td><td>45%</td><td>art. 27, III</td></tr>
              <tr><td>2026</td><td>60%</td><td>art. 27, IV</td></tr>
              <tr>
                <td><strong>2027</strong></td>
                <td><strong>75%</strong></td>
                <td>art. 27, V</td>
              </tr>
              <tr><td>2028</td><td>90%</td><td>art. 27, VI</td></tr>
              <tr>
                <td>2029</td>
                <td>regra do art. 17</td>
                <td>art. 27, VII</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Repare no último degrau: a lei <strong>não escreve um percentual</strong>
          para 2029. Ela remete ao art. 17, que manda faturar todas as
          componentes tarifárias não associadas ao custo da energia, abatendo os
          benefícios que a geração distribuída traz ao sistema. Ou seja: 90% em
          2028 é o último número certo da escada, não o teto da história.
        </p>
        <h2>O que exatamente é cobrado</h2>
        <p>
          O art. 27 lista três grupos de componentes, e é isso que o setor chama
          de Fio B:
        </p>
        <ul>
          <li>a remuneração dos ativos do serviço de distribuição;</li>
          <li>a quota de reintegração regulatória, isto é, a depreciação desses ativos;</li>
          <li>
            o custo de operação e manutenção do serviço de distribuição.
          </li>
        </ul>
        <p>
          A cobrança incide sobre a energia ativa <strong>compensada</strong>, não
          sobre o kWh que você consumiu da rede sem compensar — esse já paga a
          tarifa cheia. E a componente de custo da energia não entra nessa conta,
          o que é a razão de o Fio B ser uma fração da tarifa e não a tarifa
          inteira. As bandeiras tarifárias também não incidem sobre a energia
          compensada: o art. 19 é explícito nisso.
        </p>
        <h2>A conta de 2026 para 2027</h2>
        <p>
          Use um caso concreto: 700 kWh compensados por mês e um Fio B de
          <strong>R$ 0,40 por kWh</strong>. Esse valor é um exemplo — o seu está
          na linha "TUSD Fio B" da fatura e varia por distribuidora e por classe
          de tensão. Substitua o número, a estrutura da conta é a mesma.
        </p>
        <div class="table-container">
          <table>
            <caption>
              700 kWh compensados/mês, Fio B de exemplo a R$ 0,40/kWh
            </caption>
            <thead>
              <tr>
                <th scope="col">Ano</th>
                <th scope="col">Percentual</th>
                <th scope="col">Custo mensal</th>
                <th scope="col">Por kWh compensado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026</td><td>60%</td>
                <td>R$ 168,00</td><td>R$ 0,24</td>
              </tr>
              <tr>
                <td><strong>2027</strong></td><td>75%</td>
                <td><strong>R$ 210,00</strong></td><td>R$ 0,30</td>
              </tr>
              <tr>
                <td>2028</td><td>90%</td>
                <td>R$ 252,00</td><td>R$ 0,36</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          O degrau de 2027 custa <strong>R$ 42 por mês</strong> nesse exemplo, ou
          <strong>R$ 504 por ano</strong>. E há uma regra que vale para qualquer
          fatura, sem precisar do seu número: para cada R$ 1,00 de Fio B, a
          passagem de 60% para 75% acrescenta <strong>R$ 0,15</strong> ao custo
          de cada kWh compensado. Se o seu Fio B é R$ 0,55, o degrau custa
          R$ 0,0825 por kWh compensado. Multiplique pelos seus kWh e você tem o
          seu número, não o meu.
        </p>
        <h2>Quem não é afetado: o direito adquirido até 2045</h2>
        <p>
          O art. 26 é a parte que os posts de "o Fio B vai subir" costumam
          omitir. Ele afasta a regra do art. 17 <strong>até 31 de dezembro de
          2045</strong> para as unidades consumidoras que sejam beneficiárias de
          centrais que:
        </p>
        <ul>
          <li>já existiam na data de publicação da lei, em 6 de janeiro de 2022; ou</li>
          <li>
            protocolaram a solicitação de acesso na distribuidora nos 12 meses
            seguintes à publicação — ou seja, até o início de janeiro de 2023.
          </li>
        </ul>
        <p>
          Para essas unidades, o faturamento incide apenas sobre a diferença
          positiva entre o que foi consumido e a soma da energia injetada no mês
          com os créditos acumulados. Se você instalou em 2022 ou protocolou
          naquele prazo, o degrau de 2027 provavelmente <strong>não</strong> se
          aplica a você — mas isso se verifica no papel, pela data do seu
          parecer de acesso, não pela memória de quando a placa subiu no telhado.
        </p>
        <p>E o direito adquirido cai em três situações, todas no art. 26, § 2º:</p>
        <ul>
          <li>encerramento da relação contratual com a distribuidora (a troca de titularidade preserva o direito);</li>
          <li>irregularidade no sistema de medição atribuível ao consumidor;</li>
          <li>
            na parcela de aumento de potência instalada cujo pedido foi
            protocolado depois daqueles 12 meses — o aumento paga a regra nova,
            o sistema original continua protegido.
          </li>
        </ul>
        <p>
          Há ainda uma faixa intermediária no art. 27, § 2º: quem protocolou
          entre o 13º e o 18º mês depois da publicação só entra na regra do
          art. 17 em <strong>2031</strong>, dois anos depois dos demais. São
          poucas unidades, mas se o seu caso é de meados de 2023, vale conferir
          em qual faixa você caiu.
        </p>
        <h2>O que fazer com esse número</h2>
        <ul>
          <li>
            <strong>Confira a linha do Fio B na fatura</strong> e multiplique pela
            energia compensada. É o único jeito de saber o seu custo real; a
            média de outra distribuidora não serve.
          </li>
          <li>
            <strong>Confira a data do parecer de acesso</strong> antes de aceitar
            que o degrau se aplica a você. Direito adquirido é fato documental.
          </li>
          <li>
            <strong>Consumir o que você gera vale mais do que exportar.</strong>
            Cada kWh compensado carrega 75% do Fio B em 2027 e 90% em 2028, então
            deslocar consumo para o horário de geração — ou armazenar — reduz uma
            conta que só cresce na escada.
          </li>
          <li>
            <strong>Não dimensione pelo excedente.</strong> Um sistema maior gera
            crédito que expira em 60 meses (art. 13) e que paga Fio B quando é
            usado. Dimensione pelo consumo que você desloca.
          </li>
        </ul>
        <div class="cta-box">
          <p>
            <strong>Dimensione pelo seu consumo, não pela propaganda.</strong>
            Informe local e consumo: a calculadora usa dados horários de clima e
            mostra o custo nivelado ao lado do que você paga à distribuidora.
          </p>
          <a class="btn" href="../../#sizing">Dimensionar meu sistema</a>
        </div>
        <h2>Guias relacionados</h2>
        <ul>
          <li>
            <a href="../how-to-cut-electricity-bill-with-solar/"
              >Como cortar a conta de luz com solar</a
            >
          </li>
          <li>
            <a href="../time-of-use-tariffs-battery/"
              >Tarifa por horário e o papel da bateria</a
            >
          </li>
          <li>
            <a href="../is-a-home-battery-worth-it/"
              >Vale a pena uma bateria residencial?</a
            >
          </li>
          <li>
            <a href="../../solar-calculator/sao-paulo/">Dimensionamento em São Paulo</a>
            · <a href="../../solar-calculator/">todas as 67 cidades</a>
          </li>
        </ul>
        <h2>Perguntas frequentes</h2>
        <details>
          <summary>Os 75% já estão valendo?</summary>
          <p>
            Não. Em novembro de 2026 o degrau em vigor é o de 60% (art. 27, IV).
            Os 75% começam a valer no faturamento a partir de 1º de janeiro de
            2027.
          </p>
        </details>
        <details>
          <summary>Instalei em 2022: estou livre do degrau?</summary>
          <p>
            Provavelmente sim, mas o que conta é a data do protocolo da
            solicitação de acesso, não a data da instalação. O art. 26 protege
            até 31 de dezembro de 2045 as centrais existentes na publicação da
            lei e as que protocolaram nos 12 meses seguintes.
          </p>
        </details>
        <details>
          <summary>O Fio B incide sobre a conta inteira?</summary>
          <p>
            Não. Ele incide sobre a energia ativa compensada, e apenas nas
            componentes de distribuição listadas no art. 27. A parcela de custo
            da energia não entra, e as bandeiras tarifárias não se aplicam à
            energia compensada (art. 19).
          </p>
        </details>
        <details>
          <summary>E depois de 2028?</summary>
          <p>
            A lei não fixa percentual para 2029: manda aplicar o art. 17, que
            cobra todas as componentes não associadas ao custo da energia,
            abatendo os benefícios do sistema. O número final depende da
            valoração da Aneel, então trate 90% como o último degrau conhecido, e
            não como o teto.
          </p>
        </details>
`;

mkdirSync(`blog/${slug}`, { recursive: true });
writeFileSync(`blog/${slug}/index.html`, head + body + TAIL.slice(TAIL.indexOf("      </article>")));
console.log(`wrote blog/${slug}/index.html`);

// ---- Fix the Australia post's tail: it shipped with the South Africa related
// links and the Eskom FAQ, which is a defect in the landed page.
const auPath = "blog/stc-deeming-period-2027-australia/index.html";
let au = readFileSync(auPath, "utf8");
const auStart = au.indexOf("        <h2>Related guides</h2>");
const auEnd = au.indexOf("      </article>");
if (auStart < 0 || auEnd < 0) throw new Error("AU tail anchors missing");
const auTail = `        <h2>Related guides</h2>
        <ul>
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
            <a href="../is-a-home-battery-worth-it/"
              >Is a home battery worth it?</a
            >
          </li>
          <li>
            <a href="../../solar-calculator/sydney/">Sydney sizing</a> ·
            <a href="../../solar-calculator/perth/">Perth sizing</a> ·
            <a href="../../solar-calculator/">all 67 cities</a>
          </li>
        </ul>
        <h2>Frequently asked</h2>
        <details>
          <summary>Does the step-down apply to systems already installed?</summary>
          <p>
            The deeming period is set by the year of installation on the
            certificate of compliance, so a system installed in 2026 keeps five
            years of certificates even if the paperwork is finalised in 2027.
            Systems installed from 1 January 2027 get four.
          </p>
        </details>
        <details>
          <summary>Is the rebate paid to me or to the installer?</summary>
          <p>
            In practice the installer assigns the certificates and takes the
            value off the invoice. That is why the certificate price in the quote
            matters: you never see the certificates, only the discount.
          </p>
        </details>
        <details>
          <summary>Does the rebate cover a battery as well?</summary>
          <p>
            Batteries are counted separately, on their own factor and their own
            six-monthly step-down: 6.8 certificates per kWh to 31 December 2026,
            then 5.7 from 1 January 2027, for eligible 5 to 100 kWh units.
          </p>
        </details>
        <details>
          <summary>Will the rebate go back up?</summary>
          <p>
            The deeming period is the years of the scheme that remain, so it
            falls by one every January until the scheme ends in 2030. Waiting
            costs a fifth of the rebate each year, before any change in hardware
            prices.
          </p>
        </details>
`;
au = au.slice(0, auStart) + auTail + au.slice(auEnd);
writeFileSync(auPath, au.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"));
console.log("AU tail replaced");

// ---- registration -------------------------------------------------------
const url = `https://freeoffgridcalculator.com/blog/${slug}/`;

let sitemap = readFileSync("sitemap.xml", "utf8");
if (!sitemap.includes(url))
  sitemap = sitemap.replace(
    "</urlset>",
    `  <url>\n    <loc>${url}</loc>\n    <lastmod>${published}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n</urlset>`,
  );
writeFileSync("sitemap.xml", sitemap);

let llms = readFileSync("llms.txt", "utf8");
const anchor =
  "- STC deeming period 2027 (Australia): https://freeoffgridcalculator.com/blog/stc-deeming-period-2027-australia/";
if (!llms.includes(url)) {
  const i = llms.indexOf(anchor);
  if (i < 0) throw new Error("llms anchor missing");
  const eol = llms.indexOf("\n", i) + 1;
  llms = llms.slice(0, eol) + `- Fio B 75% em 2027 (Brasil): ${url}\n` + llms.slice(eol);
}
writeFileSync("llms.txt", llms);

let rss = readFileSync("rss.xml", "utf8");
if (!rss.includes(url)) {
  const item = `    <item>\n      <title>${title}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>Thu, 12 Nov 2026 00:00:00 GMT</pubDate>\n      <description>${desc}</description>\n    </item>\n`;
  rss = rss.replace(/(<lastBuildDate>[^<]*<\/lastBuildDate>\r?\n)/, `$1${item}`);
}
writeFileSync("rss.xml", rss);

let hub = readFileSync("blog/index.html", "utf8");
if (!hub.includes(url)) {
  const ld = `          {\n            "@type": "BlogPosting",\n            "headline": ${JSON.stringify(title)},\n            "name": ${JSON.stringify(title)},\n            "description": ${JSON.stringify(desc)},\n            "inLanguage": "pt-BR",\n            "datePublished": "${published}T00:00:00Z",\n            "dateModified": "${published}T00:00:00Z",\n            "url": "${url}",\n            "author": {\n              "@type": "Person",\n              "name": "Lucas Ballek"\n            },\n            "image": ["https://freeoffgridcalculator.com/assets/og-card.jpg"]\n          },\n`;
  hub = hub.replace(/"blogPost": \[\r?\n/, (m) => m + ld);
  const card = `        <article class="article-card">\n          <div>\n            <div class="card-tags">\n              <span class="card-tag">Tarifas</span>\n              <span class="card-tag">Brasil</span>\n              <span class="card-tag">Fio B</span>\n            </div>\n            <h2>\n              <a href="./${slug}/">${title}</a>\n            </h2>\n            <p class="card-excerpt">${desc}</p>\n          </div>\n          <div class="card-footer">\n            <span>12 Nov 2026 &middot; checked 12 Nov 2026</span>\n            <a href="./${slug}/" class="read-more">Ler o guia &rarr;</a>\n          </div>\n        </article>\n`;
  const first = hub.indexOf('<article class="article-card">');
  hub = hub.slice(0, first) + card + hub.slice(first);
}
writeFileSync("blog/index.html", hub);

let manifest = readFileSync("scripts/lib/deploy-manifest.mjs", "utf8");
const auEntry = `  "blog/stc-deeming-period-2027-australia/index.html",`;
const entry = `  "blog/${slug}/index.html",`;
if (!manifest.includes(entry))
  manifest = manifest.replace(au, `${au}\n${entry}`);
writeFileSync("scripts/lib/deploy-manifest.mjs", manifest);
console.log("registered", slug);

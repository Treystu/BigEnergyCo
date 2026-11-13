## Receipt - #379 Brazil post (Fio B 75% from 1 Jan 2027)

**Landed:** `64d3b912` (PR #382 squash-merged 2026-11-12). Item commit `e55d7073`, on main `f6e580d4`.

### What shipped

`blog/fio-b-75-2027-brasil/` - "Fio B em 2027 sobe para 75%: o que muda na conta solar" (pt-BR, 28.7 KB), registered in `sitemap.xml`, `llms.txt`, `rss.xml`, the hub card + `BlogPosting` JSON-LD, and the deploy allowlist. `html lang="pt-BR"`, locale in JSON-LD (`inLanguage: pt-BR`), `hreflang` left at exactly `en` + `x-default` per the seo rule.

### The spine is art. 27, and the post says what the article does not decide

- **The ladder** (art. 27, I-VII, quoted by inciso): 15% 2023, 30% 2024, 45% 2025, **60% 2026**, **75% 2027**, 90% 2028, art. 17 rule from 2029.
- **What is charged** (art. 27 caput): *toda a energia elétrica ativa compensada*, at the percentages of distribution-asset remuneration + reintegration quota (depreciation) + O&M. Not the energy-cost component; and bandeiras do not apply to compensated energy (art. 19).
- **The last step is not a percentage.** For 2029 the law remits to art. 17 - all non-energy components, with system benefits abated - so 90% in 2028 is the last certain number, not the ceiling. The post says this explicitly, because most coverage treats 90% as the end.
- **Worked example**, scale-free and concrete: 700 kWh compensated at an illustrative `R$ 0,40/kWh` Fio B costs `R$ 168,00` in 2026 and `R$ 210,00` in 2027 (R$ 42/month, R$ 504/year); and the rule that holds for any bill - each `R$ 1,00` of Fio B adds `R$ 0,15` per compensated kWh on the 60 -> 75 step. The illustrative Fio B is labelled as such and the reader is sent to the "TUSD Fio B" line on their own bill.
- **The counterweight** (art. 26): units existing at publication (6 Jan 2022) or filing access within 12 months (to early Jan 2023) are insulated from art. 17 **until 31 Dec 2045**, billed only on the positive difference between consumption and injection plus credits. The post tells the reader to check the parecer date, not the install date, and names the three ways the right is lost (art. 26 §2) plus the 13-18 month group that reaches art. 17 only in **2031** (art. 27 §2).

### Gates on the merging head `e55d7073`

| Check | Result |
| --- | --- |
| `npm run seo` | 0 |
| `npm run format:check` | 0 |
| `node scripts/check-chars.mjs` | 0 |
| `npm test` | 2199/2199 recorded |
| `ci/circleci: verify` | success (20 polls on the exact head) |
| Post-merge main `64d3b912` | seo 0, format 0, chars 0, `npm test` 2199/2199 |

### Two defects found in this pass and cured in the same commit

1. **The Australia post landed with the South Africa tail.** `blog/stc-deeming-period-2027-australia/` shipped carrying the template's related links (Johannesburg sizing, load shedding) and the Eskom FAQ. Found while building the Brazil tail; replaced with Australia links (Sydney, Perth, battery, TOU) and four STC questions. Swept every other post: no other page carries the wrong market's tail.
2. **Neither article had its locale in JSON-LD.** The generator's `inLanguage` replace matched nothing because the template has no such key, so the earlier AU page silently shipped without it while the hub card carried `en-AU`. Added `inLanguage` to the Article node on both pages; the locale stays in JSON-LD only, `hreflang` untouched.

`PROSE_CEILING` 510 -> **546**, the measured 36-block delta at the read that required it (546/510), recorded at the constant in the same style as the earlier raises.

### Not claimed

No traffic, ranking or CTR claim. Published and gated is the whole claim.

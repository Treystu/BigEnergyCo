## Receipt - #380 Australia post (STC deeming step-down)

**Landed:** `f6e580d4` (PR #377 squash-merged 2026-11-12), on top of main `051fdbb0`. Item commit `2ca7bf3e`, merge-resolution `bc52a0f9`.

### What shipped

`blog/stc-deeming-period-2027-australia/` - "STC Deeming Period Falls to 4 Years on 1 Jan 2027" (en-AU, 28.0 KB), registered in `sitemap.xml`, `llms.txt`, `rss.xml`, the hub card + `BlogPosting` JSON-LD (`inLanguage: en-AU`) on `blog/index.html`, and the deploy allowlist.

The post is built on the regulator's numbers, not on urgency copy:

- **Deeming schedule** (CER): 2025 = 6, 2026 = 5, **2027 = 4**, 2028 = 3, 2029 = 2, 2030 = 1; scheme ends 31 Dec 2030.
- **Zone ratings** (CER): 1.622 / 1.536 / 1.382 / 1.185.
- **Formula**: `kW x zone rating x deeming years`, rounded down.
- **Worked example**: 6.6 kW, every zone, at the `$40` clearing-house price - zone 3 goes 45 STCs ($1,800) -> 36 STCs ($1,440), a **$360** loss; zone 1 $2,120 -> $1,680; zone 4 $1,560 -> $1,240.
- **The finding**: the honest loss for most of the population is ~$360, not thousands, and racing the deadline can cost more than it captures (a year of early electricity, a padded quote, cheaper hardware in January). That is the counterweight the deadline posts omit, and it is stated with its own costs.
- **Batteries**: separate factor, 6.8/kWh to 31 Dec 2026 then **5.7/kWh from 1 Jan 2027**, eligible 5-100 kWh.

### Gates (all on the exact head that merged)

| Check | Result |
| --- | --- |
| `npm run seo` | 0 (after the two cures below) |
| `npm run format:check` | 0 |
| `node scripts/check-chars.mjs` | 0 |
| `npm test` | 2199/2199 recorded |
| `ci/circleci: verify` on `2ca7bf3e` | success (19 polls) |
| Post-merge main `f6e580d4` | seo 0, format 0, chars 0, `npm test` 2199/2199 |

### Two gate cures, both at cause

1. **`hreflang`**: `seo` rejected `en-AU` on the alternate links (rule is exactly `en` + `x-default`). Fixed the markup to `en`; the locale signal stays where it belongs, in the JSON-LD `inLanguage: en-AU`.
2. **Blog style invariant**: the generated article was written LF-only while every canonical article is CRLF, so `tests/blog-style-invariant.test.mjs` failed on a byte the rendered page never shows. Normalised the file to CRLF rather than relaxing the test.

One gate constant moved, with its measurement recorded at the constant: `PROSE_CEILING` 485 -> **510**, the exact 25-block delta this post adds (24 in the body, 1 hub card), following the same documented rule as the earlier raises. `check-i18n` read 510/485 before the change and 510/510 after.

### Facts, and how they were read

- Deeming table, zone ratings, battery factors: Clean Energy Regulator published tables, re-read for this post.
- `$40` clearing-house price is the administered fixed number; the post also names the Q1 2026 spot read (~`$39.62`) so a quote assuming more can be checked.
- The post tells readers to look up their own postcode zone rather than trust a city-level shortcut, which is where this arithmetic usually goes wrong.

### Not claimed

No traffic or ranking claim: the post is published and gated, nothing more. Circuit: it carries the calculator CTA into `#sizing`, per the doctrine's calculator tie-in gate.

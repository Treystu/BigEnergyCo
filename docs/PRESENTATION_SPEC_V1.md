# PRESENTATION SPEC V1 — the house layout, block ranks and action ranks

Status: BINDING for every presentation wave (Wave 1 UI work, #432 typography, #437
locale chrome, #438 share card, #439 support path, #430/#431/#440 intake work).
Owner: #436 (GQ F7). Gate receipts are attached on that issue.
Scope boundary: this document owns **block order and rank, action rank, card
anatomy, the disclosure pattern, and the layout grid**. #432 owns the type system
including the heading scale; where this document names a type role, #432 decides
the final value and every surface consumes that token.

This is canon-as-spec, not a restyle: no surface is restyled ahead of it. The
audit below is a record of the shape measured on merged head, with a disposition
per finding. Later waves implement against these rules and the audit is re-run on
the cured shape.

## 1. The one rule everything else descends from

**A surface has one job. The action that advances that job is the only primary
action on it.** Rank is not decoration: `btn-primary` is a claim that this is the
next thing to do, so a second one on the same surface is a defect in the shape,
not a variation in taste.

Consequences, all binding:

1. **Exactly one primary action per surface.** The surfaces are: landing (hero),
   intake card, results, article page, and chrome (header/footer/nav). Chrome is
   never a surface of its own for the purpose of this rule: it holds no primary.
2. **A control is not an action.** Segmented choices, sliders, checkboxes,
   selects and disclosure summaries change state. They take control styling and
   never action rank 1, even when the active segment is highlighted.
3. **At most one secondary action per surface**, and only when it serves the same
   job as the primary. A second competing ask is tertiary.
4. **Tertiary is the default for everything else**: transparent fill, hairline
   border, no glow. Tertiary actions may be many; they must not be dressed as
   the next step.
5. **One act, one control.** If two controls do the same thing, they merge. Two
   paths to the same act is a rank lie: each one looks like a separate offer.
6. **Verb discipline.** The primary's verb is the surface's job ("Size My
   System" on the intake, "Run the free simulation" on an article). A secondary
   may not repeat that verb.

### Rank styling (the visual contract)

| Rank      | Treatment                                                  | Used by                      |
| --------- | ---------------------------------------------------------- | ---------------------------- |
| Primary   | emerald gradient fill, dark label, glow shadow, weight 700 | exactly one per surface      |
| Secondary | blue tint fill, blue hairline, weight 600                  | at most one per surface      |
| Tertiary  | transparent, hairline `--border-card`, weight 600          | unbounded                    |
| Control   | segmented/pill state chrome, no fill gradient, no glow     | every state-changing control |

`btn-full` is a width modifier and never a rank. A class whose _name_ claims a
rank it does not visually hold (`btn-geo-primary` on an outline button) is
renamed or renamed out of the rank vocabulary.

## 2. Layout grid

| Property       | Value                                         | Note                                |
| -------------- | --------------------------------------------- | ----------------------------------- |
| Content column | `max-width: 1280px`, single column            | `.container`                        |
| Hero block     | `padding: 5rem 0 4rem`, text centred          | `.hero`                             |
| Card           | radius 16px, `padding: 2.5rem`, `gap: 2.5rem` | `.calc-card`                        |
| Card columns   | 2 columns >= 900px, 1 column below            | grid, `min-width: 0` on every child |
| Section rhythm | one `h2` + one `desc` block, then content     | `.section-title` / `.section-desc`  |
| Reading order  | one order per surface, outcome first          | see block ranks                     |

No surface may introduce a second container width, a second card radius, or a
nested card inside a card for emphasis. Emphasis is rank, not another box.

## 3. Block ranks per surface

Ranks are the only legal positions for a block. A wave that needs a new block
places it in a rank; it does not add a rank.

| Rank        | Landing (hero)         | Intake card                                  | Results                                  | Article                         |
| ----------- | ---------------------- | -------------------------------------------- | ---------------------------------------- | ------------------------------- |
| R1 outcome  | headline + one primary | the ask being answered (location, then load) | the recommended system and what it saves | the article's claim             |
| R2 evidence | the three stat figures | the inputs that produced the ask             | the price-cut curve and the chosen point | the body's first evidence block |
| R3 action   | —                      | the one primary, at the end of the ask       | secondary action + share/print           | the one primary CTA             |
| R4 detail   | —                      | demoted optional inputs                      | the "more detail" disclosure             | worked example                  |
| R5 chrome   | nav, support, legal    | generator helper                             | hardware, source, workings               | FAQ, related                    |

The outcome always precedes the means. A surface that opens with controls before
it states what the controls are for has broken R1.

## 4. Card anatomy

Every card, in order, and nothing else:

1. **Title** — what the card is (one `h2`/`h3`, sentence case).
2. **Value** — the number or answer the card exists for, at block size.
3. **Basis** — one line naming what the value is computed from, muted.
4. **Body** — supporting content; demotable.
5. **Action row** — at most one primary, at most one secondary, then tertiary.

A card with two filled buttons has no primary. A card with no value has no
reason to be a card; it is body text.

## 5. Disclosure pattern

The disclosure is how the house keeps depth reachable without competing with the
ask. Binding:

1. Closed by default, except a disclosure the visitor's own action just opened.
2. One concern per disclosure. Summary names the value behind it ("Your hardware
   list — what this system is made of"), never "Details" or "More".
3. A disclosure summary is a control: it never carries action rank styling.
4. The primary action never lives inside a closed disclosure.
5. A demoted input stays reachable in one gesture from where it was asked for.

## 6. Type roles (values are the current observed scale; #432 owns them)

| Role           | Current value                                                   | Weight           | Consumer                      |
| -------------- | --------------------------------------------------------------- | ---------------- | ----------------------------- |
| Display (hero) | 3.25rem, line-height 1.15; mobile `clamp(1.85rem, 6vw, 2.5rem)` | 800              | landing headline only         |
| Section        | 2.25rem; mobile 1.75rem                                         | 800              | one per surface section       |
| Block          | 1.2rem                                                          | 700              | card titles, result headlines |
| Body           | 1rem, line-height 1.6                                           | 400              | prose, inputs                 |
| Caption        | 0.85rem                                                         | 400              | basis lines, units, notes     |
| Control        | 0.95rem                                                         | 600; primary 700 | every button                  |

Rules #432 inherits:

- One display role, one section role, one block role. A surface does not invent a
  size between them.
- **No inline `font-size` or `padding` overrides on an action.** The hero CTA
  currently carries `style="font-size: 1.1rem; padding: 0.9rem 2rem"`; it becomes
  a rank token instead, so the scale has one owner.
- Muted text is for basis and units, never for an action label.
- Contrast: label text on the primary fill is dark-on-emerald at the existing
  ratio; #432 and the #434 pass verify it, this document forbids lowering it.

## 7. Current-surface audit (measured on merged head `bbe349a6`)

Method: rendered census in the browser at 1280x900 and 390x844, over the landing
document (fresh and results-loaded states), the intake card, the results surface
and one article page (`/blog/is-a-home-battery-worth-it/`). Every visible control
was enumerated with its rank class, owning section and disclosure containment.
Counts below are measured, not estimated; the earlier "five co-primary" reading
came from a fuzzy class match and is corrected here.

### Co-primary occurrences (the whole list)

| #   | Surface                       | Control                                                                        | Measured rank | Disposition | Reason                                                                                                                                                                           |
| --- | ----------------------------- | ------------------------------------------------------------------------------ | ------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | chrome (header)               | `Size Your System` `#btnNavSizeArray`, `btn btn-primary`                       | primary       | **demote**  | Chrome holds no primary; it competes with the surface's own primary on every page. Becomes a tertiary link-styled control.                                                       |
| P2  | landing hero                  | `Start a Free Estimate` `#btnHeroSizing`, `btn btn-primary`                    | primary       | **keep**    | This is the landing surface's one primary: it advances the only job the page has.                                                                                                |
| P3  | intake card                   | `Size My System (5-yr simulation)` `#btnRunSizing`, `btn btn-primary btn-full` | primary       | **keep**    | This is the intake surface's one primary. It is not co-primary with P2: the surfaces differ, and each carries exactly one.                                                       |
| P4  | chrome (mobile nav)           | `Size Your System` `mobile-nav-link`                                           | link          | **keep**    | Duplicate of P1 in the mobile menu; a menu link, not an action rank.                                                                                                             |
| P5  | article                       | `Run the free simulation` `class="btn"`                                        | unranked      | **promote** | An article's primary CTA with no rank class: it renders below tertiary chrome and is the only action that advances the article's job. Becomes the article surface's one primary. |
| P6  | chrome (header, all surfaces) | `Support` `btn btn-secondary`                                                  | secondary     | **demote**  | A secondary beside a primary on chrome is a second ask on a surface that should only navigate. Tertiary everywhere.                                                              |

**Settled count:** landing document = 2 primaries across 2 distinct surfaces
(hero, intake), never more than 1 visible per surface; article = 2 across 2
surfaces (chrome after P1 is demoted, article CTA after P5 is promoted), never
more than 1 visible per surface. Zero surfaces carry two primaries after these
dispositions.

### Every other observed pattern

| #   | Finding                                                                                                                               | Disposition                                  | Reason                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Three mode concepts before any answer: `#modeToggleRow` radios (`modeToggle` Automatic/Manual) plus `#simpleModeToggle` "Simple mode" | **remove** (owned by #441)                   | The fork is an adjudication the visitor cannot make before seeing a value.                                                                    |
| F2  | Goal segmented pair (`btn-segmented active/goal-mode-control`) reads as an action row                                                 | **keep as control**                          | State control; takes control styling, never rank 1. Its `active` state is not a primary.                                                      |
| F3  | `Use my precise location` carries `btn-geo-primary` while rendering outline                                                           | **rename**                                   | A class name that claims a rank it does not hold is a rank lie; keep the visual emphasis, drop "primary" from the vocabulary.                 |
| F4  | `Draw this area on an optional map` sits in the intake body                                                                           | **demote**                                   | Optional input; it belongs inside the coordinates disclosure (one gesture away).                                                              |
| F5  | `Ask the AI advisor about this result` `btn-secondary` on results                                                                     | **keep**                                     | The results surface's one secondary; same job (understand this result), different verb from the primary.                                      |
| F6  | Two share paths: `Copy share link`, `Print / save PDF`, and `send this result to someone pricing a system` (`vm-link`)                | **merge**                                    | Three controls for one act (share/copy/share-to-someone); `vm-link` duplicates `copyShareLink` in code. One tertiary share action plus print. |
| F7  | `Download parts list (CSV)` inside the hardware disclosure                                                                            | **keep**                                     | Tertiary and in place: the list it exports is right there.                                                                                    |
| F8  | Results detail in three separate disclosures (charts/workings/options, hardware list, how calculated)                                 | **keep, order by value**                     | Correct disclosure pattern; order is curves -> hardware -> workings.                                                                          |
| F9  | Results headings are all `h3` with no `h2` on the rendered result                                                                     | **record for #432**                          | Heading rank inversion is a type-system decision; block ranks here still apply (result headline is R1).                                       |
| F10 | Generator helper and exact-coordinates sit as disclosures in the intake                                                               | **keep** (coordinates **closed by default**) | Both are optional inputs; an open coordinates panel competes with the ask. A share restore may open it.                                       |
| F11 | Support section exposes three payment buttons (`PayPal`, `Venmo`, `Cash App`)                                                         | **keep**                                     | Three providers, one act; all tertiary, none labelled as the next step.                                                                       |
| F12 | Legal triggers (`Read full terms`, `Read AI disclaimer`, `Read privacy note`)                                                         | **keep**                                     | Tertiary by design; the #439 support path may consolidate the copy, not the rank.                                                             |
| F13 | Hero CTA carries inline `font-size`/`padding`                                                                                         | **record for #432**                          | Inline overrides break the one-owner type scale; becomes a rank token.                                                                        |
| F14 | Emoji inside control labels (`Cut My Electric Bill`, `Off-grid / Backup`, `Use my precise location`, `Size My System`, BOS heading)   | **record for #432/#437**                     | Label typography is type/locale work; rank is unaffected.                                                                                     |
| F15 | Article FAQ uses four `details`                                                                                                       | **keep**                                     | Correct pattern: closed, one concern each.                                                                                                    |

## 8. What each later wave builds to

- **#441 (mode fork)**: F1 is removed; nothing else on this list is in its scope.
- **#430 / #440 / #431 (intake)**: R1/R2/R3 block ranks and P3 as the intake's only
  primary; F4 inside the coordinates disclosure; F10 closed by default.
- **#432 (typography)**: section 6 roles, F9, F13, F14.
- **#437 (locale chrome)**: P1/P6 chrome ranks hold in every locale; control
  labels keep their rank under translation.
- **#438 (share card)**: F6's single share action is the entry point.
- **#439 (support path)**: F11/F12 stay tertiary; one support path, not more rank.
- **Closing scorecard (#429)**: re-run the section 7 census and require the
  settled counts: one primary per surface, chrome carrying none.

## 9. Enforcement

`tests/presentation-spec.test.mjs` holds this document to the markup: every
co-primary occurrence named here must still exist in the page it was measured on,
the required sections must be present, and the rank rules must be stated. A
surface that re-introduces a second primary is a failing test once its occurrence
is recorded here, and the census in section 7 is how new occurrences are found.

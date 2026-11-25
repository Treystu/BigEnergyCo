# PRESENTATION SPEC V1 — the house layout, block ranks and action ranks

Version 1.1 (2026-11-25): sections 10-15 add the Wave 1 presentation contract
(the single flow, location-first, the case ladder, applicability) and the copy and
number-formatting rules, so #441/#430/#440/#431 build to stated rules instead of
each deciding its own. Sections 1-9 are unchanged and keep their gate receipts.

Status: BINDING for every presentation wave (Wave 1 UI work, #432 typography, #437
locale chrome, #438 share card, #439 support path, #430/#431/#440 intake work).
Owner: #436 (GQ F7). Gate receipts are attached on that issue; the V1.1 receipts
are in `docs/audits/PRESENTATION-SPEC-V1.1-GATES.md`.
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
6. **A disclosure is addressed by name, never by position.** Any control that
   opens a disclosure targets it by its `id` or summary text; "open the first
   `details`" is not an implementation of this pattern (the soft spot recorded in
   the #441 receipt). Two disclosures on one surface must not be
   indistinguishable by summary.

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
| F1  | Three mode concepts before any answer: `#modeToggleRow` radios (`modeToggle` Automatic/Manual) plus `#simpleModeToggle` "Simple mode" | **remove** — built by #441                   | The fork is an adjudication the visitor cannot make before seeing a value.                                                                    |
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

- **#441 (mode fork)**: F1 is removed; nothing else on this list is in its scope. Landed: both controls
  are out of `index.html`, the `[data-display-mode]` rules are out of `assets/site.css` (so no panel is
  hidden by a root attribute), the form is unconditional, and the readable card leads every result with
  the technical panels behind the result disclosures. The persisted mode key is no longer read as a
  gate; nothing the visitor chose is deleted, it simply stops deciding what they can see.
- **#430 / #440 / #431 (intake)**: R1/R2/R3 block ranks and P3 as the intake's only
  primary; F4 inside the coordinates disclosure; F10 closed by default.
- **#432 (typography)**: section 6 roles, F9, F13, F14.
- **#437 (locale chrome)**: P1/P6 chrome ranks hold in every locale; control
  labels keep their rank under translation.
- **#438 (share card)**: F6's single share action is the entry point.
- **#439 (support path)**: F11/F12 stay tertiary; one support path, not more rank.
- **Wave 2 (chrome / landing / blog pass)**: owns P1 and P6 (demote chrome's
  primary and secondary to tertiary, or drop the rank class from the header
  control) and P5 (promote the article CTA to the article surface's one primary).
  No wave was named for these before V1.1; this document assigns them here so the
  closing census cannot find them unowned.
- **Closing scorecard (#429)**: re-run the section 7 census and require the
  settled counts: one primary per surface, chrome carrying none.

## 9. Enforcement

`tests/presentation-spec.test.mjs` holds this document to the markup: every
co-primary occurrence named here must still exist in the page it was measured on,
the required sections must be present, and the rank rules must be stated. A
surface that re-introduces a second primary is a failing test once its occurrence
is recorded here, and the census in section 7 is how new occurrences are found.

## 10. Wave 1 intake contract — the single flow

Measured frame, not invented: on merged head of 2026-11-22 the intake reads
`#citySearch` 1204 < goal control 1380 < `#billSliderWrap` 1465 <
`#fullControls` 1611 < `#btnRunSizing` 3260 (document offsets at 1280x900, #430
receipt); at 390x844 the same order holds (1598 < 1791 < 1968 < 2138 < 4358).
#441 removed the fork that used to precede all of it. Everything below fixes how
Wave 1 builds on that frame.

10.1 **No gate control.** A control may change a value, or reveal extra inputs in
place. No control may exist whose only effect is choosing which other controls
exist. Conformance: for every control in the intake, removing it must not change
whether any other control is in the DOM — only disclosures (§5) add and remove
their own contents.

10.2 **The intake has one reading order, and it is index order.** Location ask ->
case ladder -> estimate summary -> load/bill inputs -> the one primary -> demoted
inputs. CSS order, grid order and `order` must agree with DOM order; a block moved
by stylesheet is a spec violation even when it looks right.

10.3 **The primary is last in the ask** (P3, §1) and the only action-rank control
on the intake. The run stays an explicit button: no zero-input auto-run (#441's
pinned contract, `tests/mode-fork-removed.test.mjs`).

10.4 **The estimate summary is a card by §4 anatomy** — title ("Your estimate"),
the value, a basis line naming the defaults and the tariff grade, body, and no
action row of its own. It never contains the primary.

10.5 **Demoted inputs sit in disclosures at R4, closed by default**, one gesture
away from where they are asked for: appliance picking, the manual kWh/day entry,
the generator helper, and the optional map/coordinates.

10.6 **No new rank, no card inside a card.** Wave 1 adds blocks to the ranks of
§3; it does not add a rank, a second container width or a nested emphasis box.

## 11. Location-first presentation (#430)

11.1 The location control is the first control in the intake card (11.2's order;
the #430 receipt is the measurement). Nothing is asked before it.

11.2 One purpose line under the control, from the dictionary (`locPurposeLine`),
stating what the location is used for and what it is not. No second privacy
paragraph on this surface: the line is the whole consent copy.

11.3 The resolved place is named in one line in `#locNote` ("Sunshine data from
<place>"), nothing else. The grade and the defaults belong to the estimate card's
basis line (10.4), not to the note.

11.4 Once a place resolves, the estimate summary must be present at rest, labelled
as an estimate, and it must name its bill default, its cut default and the
tariff's grade. This is the pre-render that #430's receipt deferred to #440; the
presentation contract for it is this card, and its numbers are #401's dictionary.

11.5 The permission ask is a control, never a modal, and never blocks the form. On
denial, dismissal or unavailability the search is the fallback in one step, and
the estimate card shows its defaults **without** a place: no fabricated locality,
no tariff grade it does not have.

11.6 Recalculation is in place: changing the bill amount or the bill-cut target
re-renders the estimate and the result figures without navigation, a new page
pass, or a new fetch of the weather series. The superseded figure must not remain
visible anywhere on the surface.

11.7 No control in the intake is disabled while the permission state is unknown.

## 12. Priors and the ladder (#440)

12.1 **The ladder is the registry, rendered.** Its six rows are `usecases.js`'s
`billcut, tou, backup, reserve, offgrid, portable` — the same six ids, and the
same order at rest, that `#useCase`'s options already carry in `index.html`.
Priors re-order the rendering; they never add, drop or rename a case.

12.2 **The ladder is a control group at R1**, between the location ask and the
estimate summary: title plus one why-line per case, top case selected by default
with its why-line visible, the remaining five in rank order and visible (a demoted
case is demoted in order, never hidden behind a disclosure).

12.3 **Why-lines hedge and are short.** One caption line per case, muted, at most
90 characters, and each carries a hedge the dictionary supplies ("likely",
"common") — never a certainty claim. A feature-poor place renders the neutral
order with no why-lines rather than a guessed reason.

12.4 **One round of the ladder is visible at a time**, at R2, as a single control
group with a caption naming why it is asked. No round asks what a prior or an
earlier answer already settled.

12.5 **An explicit pick wins instantly.** Selecting a case re-renders the selection,
the why-lines and the estimate in place; the prior order does not reassert itself
against the visitor's answer, and no confirmation step stands between the pick and
the recomputed figure.

12.6 **Zero answers is a complete display.** With nothing answered, the top case's
estimate renders at labelled defaults and the primary stays enabled — the ladder
is an offer, not a toll.

## 13. Applicability (#431)

13.1 **One matrix, beside the registry.** Which sections, purchase routes, lead
metric and framing each of the six cases gets is declared in one module beside
`usecases.js` and checked by the repo gate in the family of
`scripts/check-usecases.mjs`. The matrix is data; no surface branches on the case
inline.

13.2 **Inapplicable means absent, not empty.** A block that does not apply to the
active case is not in the DOM. No empty shells, no "not available" placeholders in
place of a block, no disabled controls standing in for content.

13.3 **The one exception, and its shape.** A purchase route that cannot serve the
active case may render as one muted line in R2 stating that and its reason, with
no action, at most one such line per route. A route that can serve the case
renders as a full card with its action (the cheapest route first, per the #401
dictionary's order).

13.4 **The case's own metric leads.** The R1 value of the results surface is the
metric the registry declares for the active case (`usecases.js` `metric`), one
value per card. Another case's metric may appear only inside a result disclosure,
never beside the lead value.

13.5 **Never filtered out**: safety, permit and interconnection content material
to the case and place; and the honest-refusal verdict — a case whose answer is
"not here" still renders its card with the reason and no recommendation.

13.6 **A case switch re-renders in place** under 11.6's rules, and resets
disclosure state to the default of §5.1 except a disclosure the visitor opened
themselves in that session.

## 14. Copy and number formatting

Home: this section. It is the presentation home for the copy residue carried on
the live-defect row (the quick-bill helper line beside a typed kWh/day entry), so
that residue stops living as prose on #443. Enforcement is
`tests/presentation-spec.test.mjs`.

14.1 **A displayed number is the visitor's number.** Never a control's floor or
ceiling substituted for a value the visitor set. Where an input clamps, the clamp
is stated in words next to the control and the displayed figure is the clamped
value **and says so** — never the value the visitor typed when the run used
another. The numeric half of this (sub-1 kWh/day loads) is #479's defect; this
rule governs the display, not the resolution.

14.2 **The helper line quotes the visitor's own load and bill.** A helper beside
the bill control states the load in kWh/day at the engine's precision (one
decimal, §14.6) and the bill that load implies at the displayed rate. It must not
state the slider's minimum bill as the visitor's starting point, and must not
round the load to a whole kWh. Measured instance this rule cures: with `1.2`
typed, `paintQuickBillNote()` shows the slider minimum (about `$26/mo` at
`$0.42/kWh`, which is `BILL_MIN_KWH = 2` kWh/day) and `Math.round(kwh)` renders
`≈1 kWh/day` beside the `1.2` entry.

14.3 **`≈` marks a derived value and nothing else.** A figure the visitor typed
never carries `≈`; a figure computed from a stated rate or a stated default does.

14.4 **One formatter per quantity.** Monthly bills use the bill formatter
(`fmtBill`: currency symbol, zero fraction digits, locale separator); totals use
the money formatter. Two formatters for one quantity on one surface is a defect,
and every result figure comes from the #401 dictionary — a number this section
formats is not a number this section computes.

14.5 **Units are dictionary text, not concatenation.** Number, space, then the
unit as the locale defines it (`offgridKwhReadout` and its siblings: `kWh/day`,
`kWh/día`, `kWh/Tag`). An English unit or data label is never concatenated into
localized prose; registry values shown to a visitor (for example the `US mainland`
tariff label in `assets/js/sizing/pricing.js`) are localized through the
dictionary — chrome and locale copy are #437's, this rule forbids new instances.

14.6 **Load precision is one decimal, and a trailing `.0` is dropped.** The
engine carries 0.1 kWh/day resolution (the bill slider's anchor is rounded to one
decimal in `syncBillSlider()`), so a displayed load is `1.2`, `15.3`, `20` — never
`1` for `1.2`, never `20.0`. Annual energy is a whole number of kWh.

14.7 **An input's `step` equals the precision it displays.** No surface may add a
fractional load entry while `#dailyKwhInput` advertises `step="1"` with
`min="0.5"` (the mismatch #479 owns). A builder who needs a different precision
changes the input and #479's resolution together, not the display alone.

14.8 **One number, one place, byte-identical.** A quantity stated twice on one
surface (hero card and details, estimate and result) reads identically, from one
dictionary value (#401). Formatting differences between the two are a §14 defect.

## 15. Open questions (recorded, not invented)

These are the places where the live record does not decide, so no rule is claimed.
Each names its decider; the closing census treats an unanswered one as a gate
finding, not a silent default.

| #   | Question                                                                                                        | Decider | Gate read that shows it undecided                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Is the estimate summary a new block on the intake (10.4) or the results card revealed early?                    | #440    | #430's receipt defers scope 2-3 to #440; #440's text asks for "the complete applicable display" at zero answers without placing the block.  |
| Q2  | Does the `#useCase` select survive beside the ladder as its accessible fallback, or does the ladder replace it? | #440    | the select exists in `index.html` (`hidden`) and no issue text retires or keeps it; #434 owns the accessibility input that would settle it. |
| Q3  | Which type role the estimate card's value takes (block, or a section-size lead)                                 | #432    | §6 gives #432 the scale and this gate reads no type decision for a block that does not exist yet.                                           |

An open question is not a licence: a builder may implement the smallest thing that
satisfies §10-§14 and record which option it chose, and the decider's own gate
confirms or corrects it. Nothing here overrides #401's dictionary or #432's scale.

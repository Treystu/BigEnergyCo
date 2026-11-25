# PRESENTATION SPEC V1.1 — gate receipts (Wave 1 contract)

Item: #436 (GQ F7, Wave 0). Deliverable: sections 10-15 of
`docs/PRESENTATION_SPEC_V1.md`, plus `tests/presentation-spec-wave1.test.mjs`.
Gated: 2026-11-25, on the branch head that carries this file. Gate order is the
standing stack: Lucas Gate first (code and canon conformance), then the product
Jev gate (the spec as a product artefact). A pass executes; a fail iterates in
seat.

## What this amendment is for

V1 recorded the shape and the rank rules and stopped there; the four Wave 1 items
(#441 mode fork, #430 location-first, #440 priors and ladder, #431 applicability)
were each pointed at it in one line of §8 and left to decide their own presentation
while building. This amendment turns those four into numbered, reviewable rules,
and gives the copy residue carried on the live-defect row (the quick-bill helper
line) an explicit home in §14 instead of prose on #443.

Derived from the live record, read at its current state on 2026-11-25: #429 (open
tracker, canonical order), #400 (open, Cure A/B/C), #145 (open, master plan
tracker, pin A-007), #436 (closed; V1 landed as `8ffc1440`, PR #458), #441
(closed; receipt on #441: PR #459 `908e537b`, rendered census, mode controls
absent), #430 (closed; receipt on #430: PR #460 `7717fac6`, intake order
`#citySearch` 1204 < goal 1380 < `#billSliderWrap` 1465 < `#fullControls` 1611 <
`#btnRunSizing` 3260, and the explicit deferral of the pre-rendered estimate to
#440), #440 and #431 (open; their own scope texts are the source of §12/§13),
#479 (open; sub-1 kWh/day substitution — the numeric half of the copy defect),
#364, #401, #432, #434, #437 as boundaries.

Census correction this pass: #436, #441 and #430 are CLOSED, not open. The wave
was not "unwritten"; V1 exists and is binding, and what was missing is exactly the
four decision sets this amendment adds. STATUS.md is corrected accordingly.

Filing-time overlap check (FED-UNIFICATION rule): nothing new is filed. #436 owns
the presentation contract and stays the home; #440 keeps inference and sequencing,
#431 keeps applicability, #432 keeps the type scale, #401 keeps the numbers, #437
keeps locale copy, #479 keeps the sub-1 kWh/day resolution. §14 cites #479 rather
than restating its defect, and names #437 for the data-label residue instead of
claiming it.

## Lucas Gate — code and canon conformance

| Facet                     | Read                                                                                                                                                                                                                                                                  | Verdict |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Canon boundary            | `docs/plan/MASTER_PLAN.md` untouched, `PLAN.lock.json` still pins A-007. This adds numbered sections to a document #436 was chartered to produce, and a test. No markup, stylesheet or script change, so no wave is pre-built.                                        | PASS    |
| Ownership discipline      | Every rule states whose decision it is not: §13.1 leaves the matrix to #431 and the repo gate, §12 defers prior computation to #440's fixture suite, §14.1 delegates the numeric defect to #479, §14.5 delegates locale copy to #437.                                 | PASS    |
| Decisive, not descriptive | 33 numbered rules; each is written so a reviewer can fail a build against it (index order vs CSS order, one control group per round, absent-not-empty, a helper line quoting the visitor's own figure).                                                               | PASS    |
| Citations for every value | The intake offsets cite #430's receipt; the six cases and their order cite `usecases.js`; `BILL_MIN_KWH = 2`, `$0.42/kWh`, `$26/mo`, `math.round(kwh)` and `#dailyKwhInput step="1" min="0.5"` cite `ui.js`/`index.html`; the `US mainland` label cites `pricing.js`. | PASS    |
| Enforcement exists        | `tests/presentation-spec-wave1.test.mjs` pins the sections, the rule statements, the rule count, the registry/option order equality, §14's home and citations, and the three open questions.                                                                          | PASS    |
| Docs hygiene              | `docs/INDEX.md` still points at the document (its status row now names V1.1); no archive document is edited; no emoji in repo content; no scratch file left behind.                                                                                                   | PASS    |

**Lucas Gate: PASS** (no destructive act, no access change, no canon or gate-text
change, no new dependency).

## Product Jev gate — the spec as a product artefact

Scored 0-3 per facet. Bar: no facet below 2, mean at or above 2.5.

| Facet                        | What was read                                                                                                                                                                                                                                            | Score |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Derived from the real record | Sections cite #430's and #441's rendered receipts, the registry, the actual clamp constants and the measured helper line; nothing is asserted from memory of the issue text alone.                                                                       | 3     |
| Decisive for the builder     | #441 has a conformance test (no gate control, DOM-order agreement); #430 gets card anatomy, denial parity and in-place recalc; #440 gets the ladder's rank, why-line shape and pick-wins rule; #431 gets absent-not-empty and the one exception's shape. | 3     |
| Reviewable                   | Each rule has a number, and the four "failable" patterns are phrased as checks (index order, one control group, no empty shells, helper quotes the entry's own number).                                                                                  | 3     |
| Boundary honesty             | Open questions are listed with the read that shows them undecided and the decider named, rather than being resolved by invention; #432/#401/#437/#479 keep their scopes.                                                                                 | 3     |
| Residue placed, not absorbed | The quick-bill line's copy rule and its numeric home are both named; the spec does not claim the clamp defect is cured by a formatting rule.                                                                                                             | 3     |
| Restraint                    | No Wave 1 work is built, no surface is restyled, no new component or rank is introduced, and the document does not claim the current shape is cured.                                                                                                     | 3     |

**Jev gate: PASS** (mean 3.0, no facet below 2).

## What this does not claim

- The rules are not a cure: #441/#430/#440/#431 implement them in their own PRs,
  with their own rendered receipts.
- The copy residue is placed, not fixed. §14.2 states the rule; the helper line
  still prints the slider minimum until the Wave 1 pass that touches that control
  applies it.
- A surface that obeys the document's letter while breaking its intent is caught
  only by the closing census (§7 re-run) and the scorecard, not by the pinned
  strings.

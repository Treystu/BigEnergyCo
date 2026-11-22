# PRESENTATION SPEC V1 — gate receipts

Item: #436 (GQ F7, Wave 0). Deliverable: `docs/PRESENTATION_SPEC_V1.md`.
Gated: 2026-11-22, on the branch head that carries this file.

Both gates are recorded before the merge, as the standing stack requires: Lucas
Gate first (code and canon conformance), then the product Jev gate (the spec as a
product artefact). A pass executes; a fail iterates in seat.

## Lucas Gate — code and canon conformance

| Facet                       | Read                                                                                                                                                                                                                         | Verdict |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Canon boundary              | `docs/plan/MASTER_PLAN.md` is untouched and stays hash-pinned; this document adds a presentation spec under `docs/`, which is the deliverable #436 was chartered to produce, not an amendment to the plan or to `AGENTS.md`. | PASS    |
| No restyle ahead of the doc | The diff adds a document, an index row and a test. No markup, no stylesheet, no script changes. Every finding carries a disposition instead of being "fixed" here.                                                           | PASS    |
| Single owner per rule       | Type scale stays #432's; block order and rank stay this document's; the header restates the boundary once. No rule is stated in two places with two values.                                                                  | PASS    |
| Enforcement exists          | `tests/presentation-spec.test.mjs` pins the required sections, the rule statements, every co-primary id, the recorded dispositions, and that each audited control still exists in the markup it was measured on.             | PASS    |
| Docs hygiene                | `docs/INDEX.md` lists the document under "Start here (current)"; no archive document is edited; no emoji in repo content.                                                                                                    | PASS    |
| Scope honesty               | The audit's method, viewports, states and the corrected earlier count are written down; the one thing a doc cannot prove (that a future surface obeys it) is delegated to the enforcement test and the closing census.       | PASS    |

**Lucas Gate: PASS** (no destructive act, no access change, no canon or gate-text
change, no new dependency).

## Product Jev gate — the spec as a product artefact

Scored 0-3 per facet. Bar: no facet below 2, mean at or above 2.5.

| Facet                           | What was read                                                                                                                                                                                        | Score |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Derived from the real surface   | The audit is a rendered census on merged head `bbe349a6` at two viewports over four surfaces and two states; the counts are stated as measured and the earlier inflated count is corrected in place. | 3     |
| Actionable dispositions         | Six co-primary occurrences and fifteen further findings, each with keep/demote/merge/remove/promote and a one-line reason tied to the rule it violates.                                              | 3     |
| Inheritable by later waves      | Section 8 names, per wave, the ranks and findings it must build to; the surface table gives each wave's legal block positions.                                                                       | 3     |
| Unambiguous at the point of use | The one rule is stated first and every consequence is binding and numbered; the visual contract is a table, not adjectives.                                                                          | 3     |
| Boundary discipline             | Type values are labelled as observed with #432 owning the scale; heading inversion and inline overrides are recorded for #432 rather than resolved here.                                             | 3     |
| Restraint                       | Nothing is restyled, no new component is invented, and the spec does not claim the current shape is cured.                                                                                           | 3     |

**Jev gate: PASS** (mean 3.0, no facet below 2).

## What this does not claim

- The audit records the shape; it does not cure it. The dispositions become work
  in the waves that own each surface.
- One control is a writer, not a reader: `#loadMode`'s pick is behavioural and was
  cured in #444; nothing in this document reopens it.
- A surface that re-introduces a second primary is caught only once it is recorded
  here; the closing scorecard census is the reader that finds the unrecorded ones.

# V4 / E13 comprehension increment — 2026-11-08

## DONE

Measured the shipped comprehension surface at `HEAD` with the focused E13 gate:

```text
node --test tests/comprehension-glosses.test.mjs
tests 9; pass 9; fail 0; skipped 0
```

The nine assertions verify that first-use glosses, the installed/nameplate and usable wording, autonomy wording, the two-cost explanation, preset-fit labels, typical-home callout, result-tab orientation, tier labels, and locale hooks are present. Locale coverage is checked against all seven offered locales (`en`, `es`, `pt`, `fr`, `de`, `nl`, `ar`). This is source-level evidence from the shipped `index.html`, `assets/js/sizing/ui.js`, and `assets/js/shared/locales.js`.

## LIMIT

This increment does not claim a rendered first-timer browser drive. No results were produced or quoted from a live browser session. The remaining V4 receipt is to drive a first-time visitor through a result and record the exact visible wording, including the result tabs and cost line.

## NEXT

Complete that rendered first-timer drive, then reconcile the V4 receipt on PR #330 and tracker #145. Preserve the owner-reserved #342 decision and A-04/A-11 blockers. No production, deployment, promotion, or billing-locked CI action was taken.

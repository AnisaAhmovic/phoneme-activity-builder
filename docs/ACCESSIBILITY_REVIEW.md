# Accessibility review

The initial Assessment 3 Lighthouse audit used Lighthouse 13.5.0, desktop emulation and a local production build. All six audited routes scored 100/100: dashboard, Teacher Library, Wordle builder, Word Search builder and both generated output types. The JSON and HTML reports are retained under `evidence/lighthouse-baseline/` in the submission evidence.

No automated failure was present to repair in that baseline. The score was not artificially lowered to create a before/after result. Review therefore focused on the limits of automated checks and keyboard use on long activity pages.

## Changes and checks following the report review

- Added a visible-on-focus “Skip to main content” link to the shared layout.
- Added a focusable main-content target and scroll offset on every application page, so the sticky navigation does not cover the target.
- Added a Playwright assertion that activates the skip link with Enter and verifies focus reaches the main content.
- Retained explicit field labels, semantic table headings/captions, text alongside outcome colours, keyboard-operable report tables, live status messages and visible focus indicators.
- Retained generated Word Search keyboard endpoint selection and tested it in the downloaded HTML.
- Extended the generated Wordle keyboard to include teacher-entered target phonemes, so accepted custom content remains playable.

The final audit is saved under `evidence/lighthouse-final/`. Consult its summary for the measured scores and environment. The automated browser tests also check a 390-pixel-wide dashboard and verify that the page does not overflow horizontally.

## Limits

Lighthouse's score covers its automated accessibility checks, not every WCAG requirement. It does not establish that learners understand the instructions or that all assistive-technology combinations work. A fuller evaluation should include screen-reader use, 200% zoom, high-contrast settings, mobile touch interaction and feedback from the intended teachers and learners. These manual user evaluations are not claimed as completed.

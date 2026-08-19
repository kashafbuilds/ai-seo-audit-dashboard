# AI-Assisted Workflow — FE-03 Round 2

## Overview

FE-03 required the same small capstone-relevant settings feature to be built twice. Round 1 used a deliberately vague prompt, while Round 2 used a precise prompt with repository constraints, file references, expected behavior, and verification requirements. The goal was to compare not only generated code, but also correctness, accessibility, edge cases, and review effort.

## Round 1

Round 1 produced a single `seo_audit_settings.jsx` file containing 803 deleted lines in the final comparison. The main mistake was architectural: the repository is a vanilla HTML, CSS, and JavaScript project, but the AI generated JSX. This violated the existing project instructions and meant the implementation did not fit the actual frontend stack.

The Round 1 result showed why accepting AI output without checking repository constraints is risky. The generated implementation had to be reconsidered rather than simply integrated.

## Round 2

Round 2 started from the repository instructions and existing project structure. The implementation was split into three files that match the existing architecture:

- `settings.html` — 231 lines
- `settings.css` — 354 lines
- `settings.js` — 405 lines

The final diff shows `seo_audit_settings.jsx` removed and these three files added, for 990 additions and 803 deletions. The settings page includes required-field validation, URL and email validation, dynamic keyword and competitor lists, toggle controls, API-key visibility, save/reset behavior, and localStorage persistence.

## Correctness, Accessibility, and Edge Cases

Round 2 explicitly addressed form behavior instead of only generating markup. Required fields are validated, invalid URLs and emails are rejected, duplicate keywords and competitor URLs are handled, and users receive field-level errors. The implementation also includes accessible labels, ARIA attributes, keyboard support for adding list items, and status messaging for save results.

The main AI mistake caught during the workflow was the Round 1 JSX output. This was caught by comparing the generated code against `CLAUDE.md` and the repository stack before accepting the Round 2 implementation.

## Review Effort and Lesson

Round 2 required more planning and constraint-setting up front, but it produced a result that fit the repository and was easier to review against explicit requirements. The branch diff provided concrete evidence rather than relying on subjective quality judgments.

The main lesson is that AI-assisted development works better when the developer verifies the repository architecture first, gives the model explicit constraints and expected behavior, and verifies the result before committing. The workflow from Round 2 will be reused for later frontend assignments and the capstone.

# Visual Regression Testing

This repo uses Playwright's built-in screenshot assertions for visual regression coverage. Functional E2E and visual regression are intentionally separate:

- `npm run test:e2e` runs behavior-focused Playwright coverage and excludes `@visual` specs
- `npm run test:visual` runs only the Chromium visual suite
- CI treats Linux Chromium as the baseline authority for visual diffs

## Source of Truth

- `playwright.config.ts`
- `e2e/visual/home.visual.spec.ts`
- `e2e/visual/sections.visual.spec.ts`
- `e2e/support/visual.ts`
- `src/utils/visualTest.ts`
- `scripts/run-visual-linux.sh`

## Running the Visual Suite

Run the visual suite locally:

```bash
npm run test:visual
```

If a UI change is intentional, update the baselines on your current platform:

```bash
npm run test:visual:update
```

If you need to refresh the canonical Linux baselines used by CI, use the pinned Playwright container:

```bash
npm run test:visual:update:linux
```

The Linux command uses `scripts/run-visual-linux.sh`, installs dependencies inside `mcr.microsoft.com/playwright:v1.58.2-noble`, and rewrites the `*-linux.png` snapshots.

## What the Visual Test Mode Does

Visual specs always navigate with `?visual-test=1`. The app treats that as a deterministic render mode and disables sources of screenshot noise before the first paint:

- global CSS animations and transitions
- hero parallax and motion-driven transforms
- autoplay video and SVG motion in the hero variants
- the JP_CLI boot sequence timers
- transient focus, caret, and hover residue during capture

The visual helper also freezes time to `2026-03-01T12:00:00.000Z`, waits for fonts and visible images to finish loading, and applies mocked portfolio APIs before each capture.

## Snapshot Layout and Policy

Committed baselines live next to each visual spec:

- `e2e/visual/home.visual.spec.ts-snapshots`
- `e2e/visual/sections.visual.spec.ts-snapshots`

Current coverage includes:

- desktop hero viewports for all four themes in light and dark mode
- minimal light mobile home and open mobile navigation
- a minimal light full-page smoke capture
- section-level captures for Projects, GitHub, Contact, and expanded Pet Dogs

The repo currently keeps both `*-darwin.png` and `*-linux.png` snapshots. Treat Linux as the review baseline because that is what CI executes.

## Reading Failures

When `npm run test:visual` fails, Playwright writes the diff artifacts into `test-results/` and includes the expected, actual, and diff images in the HTML report.

Use this workflow:

1. Run `npm run test:visual`.
2. Inspect the failure in `playwright-report/` or `test-results/`.
3. If the change is unintended, fix the UI or stabilize the test.
4. If the change is intentional, rerun `npm run test:visual:update`.
5. Before merging a meaningful baseline change, refresh Linux snapshots with `npm run test:visual:update:linux`.

## Adding New Visual Coverage

Keep new visual tests under `e2e/visual` and tag them with `@visual`. Reuse the helpers in `e2e/support/visual.ts` instead of hand-rolling setup.

Preferred patterns:

- use `gotoVisualState()` to set viewport, theme, mode, mocks, frozen time, and visual-test mode
- use locator screenshots for stable sections or components
- use full-page screenshots sparingly and mask genuinely volatile regions
- keep remote images and third-party avatar URLs out of visual assertions; use committed local fixtures instead
- keep visual coverage Chromium-only unless there is a deliberate reason to manage a second browser baseline set

## CI Behavior

The visual regression job runs from `.github/workflows/e2e.yml` as a separate Chromium-only job. A visual mismatch fails the job and uploads the Playwright report and diff artifacts for PR review.

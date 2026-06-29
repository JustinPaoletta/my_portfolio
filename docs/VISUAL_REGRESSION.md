# Visual Regression Testing

## Design changes (quick reference)

After CSS, layout, markup, font, icon, image, or theme changes:

```bash
npm run test:visual                  # 1. review diffs
npm run test:visual:update:linux     # 2. update CI baselines (Docker required)
npm run test:visual:update           # 3. update macOS baselines (run on a Mac)
git add e2e/visual/**/*-snapshots/   # 4. commit snapshots
```

- **CI uses Linux snapshots** (`*-linux.png`). Always refresh with `test:visual:update:linux` before merging.
- **Also refresh darwin** (`*-darwin.png`) with `test:visual:update` on macOS — both sets are committed in this repo.

---

Functional E2E and visual regression are separate:

- `npm run test:e2e` — behavior tests; excludes `@visual`
- `npm run test:visual` — screenshot regression only
- CI baseline authority: Linux Chromium

## Source of Truth

- `playwright.config.ts`
- `e2e/visual/home.visual.spec.ts`
- `e2e/visual/sections.visual.spec.ts`
- `e2e/support/visual.ts`
- `src/utils/visualTest.ts`
- `scripts/run-visual-linux.sh`

## Commands

| Command                            | Purpose                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run test:visual`              | Run the suite; inspect failures in `playwright-report/`                                 |
| `npm run test:visual:update:linux` | **Update CI baselines** via Docker (image version auto-synced from `package-lock.json`) |
| `npm run test:visual:update`       | Update local macOS baselines only (`*-darwin.png`)                                      |

## What the Visual Test Mode Does

Visual specs always navigate with `?visual-test=1`. The app treats that as a deterministic render mode and disables sources of screenshot noise before the first paint:

- global CSS animations and transitions
- hero parallax and motion-driven transforms
- the interactive 3D hero scenes (the cosmic poster and engineer SVG fallbacks render instead) and SVG motion in the hero variants
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
- a minimal light tall-viewport smoke capture
- section-level captures for Projects, GitHub, Contact, and expanded Pet Dogs

The repo currently keeps both `*-darwin.png` and `*-linux.png` snapshots. Treat Linux as the review baseline because that is what CI executes.

## Reading Failures

When `npm run test:visual` fails, Playwright writes the diff artifacts into `test-results/` and includes the expected, actual, and diff images in the HTML report.

1. Run `npm run test:visual` and inspect `playwright-report/` or `test-results/`.
2. If unintended, fix the UI or stabilize the test.
3. If intentional, run `npm run test:visual:update:linux` and commit the snapshot changes.

## Troubleshooting

**`Executable doesn't exist at /ms-playwright/...` or "Please update docker image as well"**

The Docker image browsers must match `@playwright/test` in `package-lock.json`. The local script (`scripts/run-visual-linux.sh`) reads that version automatically. After bumping Playwright, also update the image tag in `.github/workflows/e2e.yml` and `.github/workflows/update-snapshots.yml` to the same version.

**No snapshot files changed after update**

Tests likely failed before screenshots ran. Check the command output for browser launch errors, then rerun `npm run test:visual:update:linux`.

Keep new visual tests under `e2e/visual` and tag them with `@visual`. Reuse the helpers in `e2e/support/visual.ts` instead of hand-rolling setup.

Preferred patterns:

- use `gotoVisualState()` to set viewport, theme, mode, mocks, frozen time, and visual-test mode
- use locator screenshots for stable sections or components
- prefer tall-viewport or section-level captures over stitched full-page screenshots unless the full-page path is proven stable in Linux
- keep remote images and third-party avatar URLs out of visual assertions; use committed local fixtures instead
- keep visual coverage Chromium-only unless there is a deliberate reason to manage a second browser baseline set

## CI Behavior

The visual regression job runs from `.github/workflows/e2e.yml` as a separate Chromium-only job. A visual mismatch fails the job and uploads the Playwright report and diff artifacts for PR review.

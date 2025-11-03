# Visual Regression Testing

This document explains how to use visual regression testing in this project using Playwright.

## Overview

Visual regression tests capture screenshots of key pages and components, then compare them against baseline images to detect unintended visual changes.

## Running Visual Tests

### Run all visual tests

```bash
npm run test:visual
```

### Run visual tests in UI mode (recommended for development)

```bash
npm run test:visual:ui
```

### Update baseline images (after intentional visual changes)

```bash
npm run test:visual:update
```

### Run visual tests in CI mode (single browser, faster)

```bash
npm run test:visual:ci
```

## How It Works

1. **Baseline Images**: Screenshots are stored in `e2e/visual.spec.ts-snapshots/` directory alongside the test file
2. **Comparison**: On each test run, new screenshots are compared against baselines
3. **Thresholds**: Small differences (< 100 pixels) are allowed to account for rendering differences across platforms
4. **Animations**: Automatically disabled during screenshots for consistency

## Test Coverage

The visual tests currently cover:

- Homepage (full page) - Desktop, Mobile, Tablet
- Homepage header section - Desktop, Mobile
- Homepage main content - Desktop

## Updating Baselines

When you make intentional visual changes:

1. Make your changes
2. Run `npm run test:visual:update`
3. Review the updated baseline images
4. Commit both your code changes and the updated baselines

```bash
git add e2e/visual.spec.ts-snapshots/
git commit -m "feat: update visual baseline for new design"
```

## CI/CD Integration

Visual regression tests run automatically on:

- Pull requests
- Pushes to main/master
- Manual workflow dispatch

### On PRs

- Tests run automatically when a PR is opened or updated
- If tests fail, a comment is posted on the PR with instructions
- Test artifacts (screenshots, diffs) are uploaded for review

### Workflow

1. Tests run in CI using Chromium only (for speed)
2. Failures are reported with diff images
3. PR comments guide developers on next steps

## Troubleshooting

### Tests fail with "Screenshot mismatch"

1. **Check if changes are intentional**:
   - Review the diff images in the test results
   - If intentional, update baselines: `npm run test:visual:update`

2. **Check if changes are unintentional**:
   - Review your CSS/styling changes
   - Check for font rendering differences
   - Verify no unexpected style leaks

### Baseline images are missing

If you're setting up tests for the first time or after a major refactor:

1. Run `npm run test:visual:update` to generate initial baselines
2. Commit the baseline images to the repository
3. Tests will now compare against these baselines

### Tests are flaky

If tests occasionally fail due to minor rendering differences:

1. Check the `maxDiffPixels` value in `e2e/visual.spec.ts`
2. Consider increasing the threshold for specific tests if needed
3. Ensure animations are disabled (they should be by default)

## Best Practices

1. **Keep baselines up to date**: Always update baselines when making intentional visual changes
2. **Review diffs carefully**: Before updating baselines, ensure changes are correct
3. **Commit baselines with code**: Baseline images should be committed alongside code changes
4. **Test multiple viewports**: Ensure responsive design works across devices
5. **Test critical paths**: Focus visual tests on important user-facing pages

## Configuration

Visual test configuration is in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,      // Maximum pixel difference allowed
    threshold: 0.2,          // Pixel color difference threshold
    animations: 'disabled',  // Disable animations for consistency
  },
}
```

Individual tests can override these settings:

```typescript
await expect(page).toHaveScreenshot('my-image.png', {
  maxDiffPixels: 50, // Stricter for this specific test
});
```

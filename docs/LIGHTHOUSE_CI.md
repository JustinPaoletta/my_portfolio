# Lighthouse CI

This document explains how automated Lighthouse checks work in this project.

## Overview

Lighthouse CI runs automated performance, accessibility, best practices, and SEO audits on every pull request and push to main branches.

## What Gets Tested

Lighthouse CI evaluates:

- **Performance**: Core Web Vitals (FCP, LCP, TBT, CLS) and overall performance score
- **Accessibility**: WCAG compliance, ARIA attributes, color contrast, etc.
- **Best Practices**: Security, modern web features, etc.
- **SEO**: Meta tags, structured data, etc.

## Configuration

The Lighthouse CI configuration is in `.lighthouserc.cjs`:

> **Note**: The file uses the `.cjs` extension because this project uses ES modules (`"type": "module"` in `package.json`). Lighthouse CI supports CommonJS configuration files with the `.cjs` extension.

### Key Configuration Details

- **Collection**: Uses `staticDistDir: './dist'` to serve the built app via LHCI's static server
- **Runs**: Tests 3 times and averages results for consistency
- **Upload**: Uses `temporary-public-storage` - reports are publicly accessible for 7 days via a temporary URL
- **Chrome Flags**: Headless Chrome with disabled features for CI consistency

### Performance Thresholds (Errors)

- **Performance Score**: Minimum 85% (realistic for apps with monitoring)
- **Accessibility Score**: Minimum 95%
- **Best Practices Score**: Minimum 90%
- **SEO Score**: Minimum 90%

### Performance Metrics (Warnings)

- **First Contentful Paint (FCP)**: < 2500ms
- **Largest Contentful Paint (LCP)**: < 3000ms
- **Total Blocking Time (TBT)**: < 400ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Byte Weight**: < 500KB

### Accessibility Checks (Errors)

- Color contrast violations (enforced as error)
- Missing image alt text
- Invalid ARIA attributes

### Disabled Audits

The following audits are disabled to reduce false positives:

- **errors-in-console** - API proxy 404s are expected in CI (no serverless functions available)
- **bf-cache** - Back/forward cache often fails with monitoring libraries
- **csp-xss** - CSP is configured in `vercel.json`, not tested by LHCI's static server
- **unused-javascript** - Expected with React and New Relic monitoring
- **legacy-javascript** - New Relic includes polyfills for older browsers
- **interaction-to-next-paint** - Still experimental
- **network-dependency-tree-insight** - False positive with static server
- **Noisy diagnostics** - `bootup-time`, `dom-size`, `server-response-time`, `mainthread-work-breakdown`, `render-blocking-resources`

## CI/CD Integration

### On Pull Requests

1. Lighthouse CI runs automatically when a PR is opened or updated
2. Builds the app with `npm run build`
3. Tests the production build using LHCI's built-in static server (`staticDistDir: './dist'`)
4. Runs 3 times and averages results for consistency
5. Posts TWO types of feedback:
   - **Lighthouse CI App status checks** - Official status on commits (if `LHCI_GITHUB_APP_TOKEN` is configured)
   - **Custom PR comment** - Detailed scores and metrics via GitHub Actions script
6. Uploads full HTML reports as workflow artifacts (retained for 30 days)

### On Main Branch

- Lighthouse CI runs on every push to main/master
- Results are stored as workflow artifacts
- Can be used to track performance trends over time

## Running Locally

To run Lighthouse CI locally:

```bash
# Install dependencies first
npm install

# Build the application
npm run build

# Run Lighthouse CI
npm run lighthouse
```

Or use the full command:

```bash
npx @lhci/cli autorun
```

## Understanding Results

### Score Interpretation

- **🟢 90-100%**: Excellent - Exceeds thresholds
- **🟢 85-89%**: Good - Meets performance threshold (85% minimum)
- **🟡 50-84%**: Needs improvement - Below thresholds
- **🔴 0-49%**: Poor - Significant issues

Note: Performance threshold is 85% (not 90%) to account for monitoring overhead from New Relic.

### Common Issues and Fixes

#### Performance Issues

1. **Large bundle size**
   - Use code splitting
   - Remove unused dependencies
   - Check bundle analysis: `npm run build:analyze`

2. **Slow images**
   - Optimize images (use WebP, proper sizing)
   - Add lazy loading
   - Use responsive images

3. **Render-blocking resources**
   - Defer non-critical CSS
   - Use `async`/`defer` for scripts
   - Preload critical resources

#### Accessibility Issues

1. **Color contrast**
   - Check contrast ratios meet WCAG AA (4.5:1 for text)
   - Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

2. **Missing alt text**
   - Add descriptive `alt` attributes to all images
   - Use empty `alt=""` for decorative images

3. **ARIA issues**
   - Use semantic HTML when possible
   - Ensure ARIA attributes are valid and used correctly

#### SEO Issues

1. **Meta tags**
   - Ensure proper title and description
   - Check Open Graph tags
   - Verify Twitter Card tags

2. **Structured data**
   - Add JSON-LD structured data where appropriate
   - Validate with [Google's Rich Results Test](https://search.google.com/test/rich-results)

## Workflow Artifacts

Full Lighthouse reports are available in GitHub Actions workflow artifacts:

1. Go to the Actions tab in your repository
2. Click on the latest workflow run
3. Download the `lighthouse-reports` artifact
4. Extract and view the HTML reports

## Advanced Configuration

### Custom Assertions

You can customize thresholds in `.lighthouserc.cjs`:

```javascript
assertions: {
  'categories:performance': ['error', { minScore: 0.95 }], // Stricter threshold
  'first-contentful-paint': ['error', { maxNumericValue: 1500 }], // Make it an error
}
```

### Multiple URLs

The current configuration uses `staticDistDir` to test the built site. To test multiple pages, you'd need to switch to URL-based testing:

```javascript
collect: {
  // Remove staticDistDir
  // staticDistDir: './dist',

  // Add startServerCommand and URLs
  startServerCommand: 'npm run start:prod',
  url: [
    'http://localhost:4173',
    'http://localhost:4173/about',
    'http://localhost:4173/projects',
  ],
}
```

**Note**: The current `staticDistDir` approach is simpler and works well for single-page apps.

## GitHub App Token (Recommended)

The workflow is configured to use the Lighthouse CI GitHub App for enhanced status checks:

### Setup

1. Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. Copy the provided token
3. Add it as a repository secret named `LHCI_GITHUB_APP_TOKEN`
4. The app will then post commit status checks on PRs

### What You Get

- **Without token**: Custom PR comment with scores (via GitHub Actions script)
- **With token**: Official Lighthouse CI status checks on commits + custom PR comment

The custom PR comment will always be posted on PRs, regardless of whether the GitHub App is configured.

## Troubleshooting

### Tests fail locally

1. **Build issues**: Check that `npm run build` succeeds
2. **Missing dist folder**: Ensure `./dist` exists after build
3. **Chrome flags**: CI uses headless Chrome with specific flags (see `.lighthouserc.cjs`)

### CI fails but local passes

1. **Different environments**: CI uses fresh builds, local may have cached assets
2. **Timing issues**: CI runs 3 times to average, check if results are consistent
3. **Network conditions**: CI uses simulated throttling, local may be faster

### Scores vary between runs

This is normal! Lighthouse scores can vary due to:

- Network conditions
- CPU throttling simulation
- Dynamic content
- Random elements

The CI runs 3 times and averages results to minimize variance.

## Best Practices

1. **Monitor trends**: Track scores over time to catch regressions early
2. **Fix errors first**: Focus on error-level issues before warnings
3. **Test production builds**: Always test the production build, not dev
4. **Review artifacts**: Check detailed reports for specific improvement opportunities
5. **Set realistic thresholds**: Adjust thresholds based on your site's needs

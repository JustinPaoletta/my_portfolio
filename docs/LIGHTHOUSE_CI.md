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

The Lighthouse CI configuration is in `.lighthouserc.js`:

### Performance Thresholds

- **Performance Score**: Minimum 90% (error if below)
- **Accessibility Score**: Minimum 95% (error if below)
- **Best Practices Score**: Minimum 90% (error if below)
- **SEO Score**: Minimum 90% (error if below)

### Performance Metrics (Warnings)

- **First Contentful Paint (FCP)**: < 2000ms
- **Largest Contentful Paint (LCP)**: < 2500ms
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Accessibility Checks (Errors)

- Color contrast violations
- Missing image alt text
- Invalid ARIA attributes

## CI/CD Integration

### On Pull Requests

1. Lighthouse CI runs automatically when a PR is opened or updated
2. Tests the production build (using `npm run start:prod`)
3. Runs 3 times and averages results for consistency
4. Posts a comment on the PR with:
   - Overall category scores (Performance, Accessibility, etc.)
   - Key performance metrics (FCP, LCP, TBT, CLS)
   - Links to full reports in workflow artifacts

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

- **🟢 90-100%**: Excellent - Meets all thresholds
- **🟡 50-89%**: Needs improvement - Below threshold
- **🔴 0-49%**: Poor - Significant issues

### Common Issues and Fixes

#### Performance Issues

1. **Large bundle size**
   - Use code splitting
   - Remove unused dependencies
   - Check bundle analysis: `npm run analyze`

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

You can customize thresholds in `.lighthouserc.js`:

```javascript
assertions: {
  'categories:performance': ['error', { minScore: 0.95 }], // Stricter threshold
  'first-contentful-paint': ['error', { maxNumericValue: 1500 }], // Make it an error
}
```

### Multiple URLs

To test multiple pages:

```javascript
collect: {
  url: [
    'http://localhost:4173',
    'http://localhost:4173/about',
    'http://localhost:4173/projects',
  ],
}
```

## GitHub App Token (Optional)

For enhanced PR integration, you can set up a Lighthouse CI GitHub App:

1. Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. Add the token as a repository secret: `LHCI_GITHUB_APP_TOKEN`
3. This enables richer PR comments and status checks

## Troubleshooting

### Tests fail locally

1. **Port conflicts**: Ensure port 4173 is available
2. **Build issues**: Check that `npm run build` succeeds
3. **Timeout**: Increase `startServerReadyTimeout` if server is slow to start

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

# Performance & Quality Gates

This project enforces performance and quality through build-time bundle budgets, Lighthouse CI, and CI reporting workflows.

## Source of Truth

- `vite.config.ts` for build-time asset budgets
- `.lighthouserc.cjs` for Lighthouse thresholds
- `.github/workflows/bundle-size-check.yml`
- `.github/workflows/lighthouse.yml`

## Build-Time Bundle Budgets

The `bundle-size-limit` plugin in `vite.config.ts` fails `npm run build` if any of these limits are exceeded.

| Asset type                  | Limit    |
| --------------------------- | -------- |
| App chunks                  | `155 KB` |
| Vendor chunks               | `400 KB` |
| CSS files                   | `85 KB`  |
| Total JS + CSS asset weight | `750 KB` |

These checks run anywhere `npm run build` runs, including local builds, hooks, CI, and Vercel.

## Lighthouse CI

Lighthouse CI audits four theme variants:

- `/?theme=engineer&mode=light`
- `/?theme=cosmic&mode=light`
- `/?theme=cli&mode=light`
- `/?theme=minimal&mode=light`

Each URL is tested three times.

### Category thresholds

- Performance: warn below `0.70`
- Accessibility: error below `0.95`
- Best practices: error below `0.90`
- SEO: error below `0.90`

### Metric thresholds

- FCP: warn above `4000ms`
- LCP: warn above `4500ms`
- TBT: warn above `400ms`
- CLS: warn above `0.1`

### Theme-specific Lighthouse byte-weight thresholds

| Theme      | Limit           |
| ---------- | --------------- |
| `engineer` | `500000` bytes  |
| `cli`      | `500000` bytes  |
| `minimal`  | `500000` bytes  |
| `cosmic`   | `1300000` bytes |

Several Lighthouse audits are intentionally disabled in `.lighthouserc.cjs` because they are noisy or not meaningful in this static CI environment.

## Useful Commands

```bash
npm run build
npm run build:analyze
npm run lighthouse
```

- `npm run build` verifies the build, prerendering, and bundle budgets
- `npm run build:analyze` produces a bundle breakdown for debugging size issues
- `npm run lighthouse` runs LHCI locally using the checked-in config

## How CI Uses These Gates

### Bundle Size Check workflow

The bundle-size workflow:

1. installs dependencies
2. installs Chromium for build-time prerendering
3. runs `npm run build`
4. uploads `dist/**` and bundle artifacts
5. posts a PR comment summarizing asset sizes

### Lighthouse workflow

The Lighthouse workflow:

1. installs dependencies
2. installs Chromium for build-time prerendering
3. runs `npm run build`
4. collects Lighthouse reports from `./dist`
5. asserts thresholds
6. uploads `.lighthouseci` as an artifact
7. posts a PR comment with the latest score summary

## When a Limit Fails

Typical fixes:

- lazy-load heavy code paths
- split large dependencies into separate chunks
- remove unused packages
- shrink or defer large media assets
- keep non-critical third-party code out of the initial path

## Manual Budget Verification

If you need to prove the build-time bundle guard is active:

1. temporarily lower one of the `BUNDLE_SIZE_LIMITS` values in `vite.config.ts`
2. run `npm run build`
3. confirm the build fails with a bundle-size error
4. restore the real limit and rerun the build

That is mainly useful when changing the budget enforcement itself.

## Reading Failures

- Build failures usually mean the app failed to compile, prerender, or stay within the Vite bundle budgets.
- Lighthouse assertion failures mean the app built successfully but missed one or more measured score thresholds.
- When debugging either class of failure, work from the production build, not the dev server.

## Related Docs

- [SEO architecture](SEO.md)
- [Vercel Deployment](VERCEL_DEPLOYMENT.md)

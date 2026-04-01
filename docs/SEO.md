# SEO Architecture Guide

This app uses a static-first SEO model. There is no runtime SEO component or Helmet-based metadata layer in the current codebase.

## Current Model

1. `index.html` ships the crawler-facing head tags, social metadata, identity links, and JSON-LD.
2. `src/content/site.ts` and `src/config/seo.ts` hold shared copy and SEO constants that tests can assert against.
3. `plugins/vite-plugin-sitemap.ts` generates `dist/sitemap.xml` and rewrites `dist/robots.txt` during `npm run build`.
4. `scripts/prerender.ts` opens the built site in headless Chromium and rewrites `dist/index.html` with prerendered homepage markup.
5. `src/static-seo.test.ts` and `src/config/seo.test.ts` protect the static SEO contract from drift.

## Source Of Truth

| Concern                               | Files                                                 | Notes                                                                                                                |
| ------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Homepage metadata and structured data | `index.html`                                          | The authoritative source for title, description, canonical, robots, OG, Twitter, `hreflang`, `rel="me"`, and JSON-LD |
| Shared SEO constants                  | `src/config/seo.ts`, `src/content/site.ts`            | Shared values used by tests and any future runtime consumers                                                         |
| Sitemap and robots generation         | `plugins/vite-plugin-sitemap.ts`, `public/robots.txt` | Build step writes final artifacts into `dist/`                                                                       |
| Prerendered homepage HTML             | `scripts/prerender.ts`                                | Replaces the built `dist/index.html` with crawler-visible homepage content                                           |
| Regression tests                      | `src/static-seo.test.ts`, `src/config/seo.test.ts`    | Catch metadata drift and broken helper behavior                                                                      |

## What Search Engines See

For the homepage, the important path is:

1. the raw HTML response already contains the static head tags and JSON-LD from `index.html`
2. the production build adds prerendered homepage markup into `dist/index.html`
3. crawlers and social scrapers can read both the head metadata and visible body content without relying on client-side React execution

That combination matters because social unfurlers often ignore JavaScript entirely, while search engines still benefit from correct first-response HTML even when they can render scripts later.

## Signals Shipped Today

The homepage currently ships these signals directly from `index.html`:

- `<title>` and `meta[name="description"]`
- `link[rel="canonical"]`
- `meta[name="robots"]`
- `link[rel="alternate"][hreflang]` for `en-US` and `x-default`
- `link[rel="me"]` identity links for GitHub and LinkedIn
- Open Graph tags
- Twitter card tags
- JSON-LD graph entries for `Person`, `WebSite`, `WebPage`, and `ProfilePage`
- a `noscript` fallback summary

The build also emits:

- `dist/sitemap.xml`
- `dist/robots.txt`
- prerendered homepage HTML in `dist/index.html`

## No Runtime Metadata Layer

The repo no longer has `src/components/SEO.tsx`, and metadata is not updated after React mounts. That is intentional for the current single-page homepage build.

If you later add real client-side routes with distinct SEO requirements, you will need to introduce a runtime metadata layer deliberately instead of assuming one already exists.

## Shared SEO Config

`src/config/seo.ts` is still useful even without a runtime SEO component. It centralizes values such as:

- site name and alternate name
- canonical site origin
- default homepage title
- default robots content

`src/content/site.ts` holds shared copy such as the SEO description text used by both the app and tests.

## Sitemap And Robots Generation

`plugins/vite-plugin-sitemap.ts` currently generates a one-route sitemap for `/`.

Important details:

- it prefers `VITE_SITE_URL`, then falls back to other common deployment URL variables
- it writes `dist/sitemap.xml`
- it copies or amends `public/robots.txt` so the final `dist/robots.txt` points at the generated sitemap URL

If you add more indexable routes, update the `routes` array in `plugins/vite-plugin-sitemap.ts`.

## Prerender Step

After Vite finishes building, `scripts/prerender.ts`:

1. serves the built `dist/` directory on a temporary local HTTP server
2. opens the homepage in headless Chromium
3. waits for deferred sections to reveal
4. serializes the hydrated document back into `dist/index.html`

If Chromium cannot launch because the environment is missing browser dependencies, the script logs a warning and keeps the Vite-generated `dist/index.html` instead. You can also skip the step intentionally with `SKIP_PLAYWRIGHT_PRERENDER=1`.

## Update Checklist

When SEO copy or origin values change, update these files together:

- `index.html`
- `src/content/site.ts`
- `src/config/seo.ts`
- `public/robots.txt` if crawl rules change
- `plugins/vite-plugin-sitemap.ts` if sitemap routes change
- `src/static-seo.test.ts`
- `src/config/seo.test.ts`

If the production domain changes, also set `VITE_SITE_URL` so generated `sitemap.xml` and `robots.txt` use the correct origin.

## Verification

Useful checks:

```bash
npm run build
npx vitest run src/static-seo.test.ts src/config/seo.test.ts
```

`src/static-seo.test.ts` verifies the canonical URL, robots tag, `hreflang` links, identity links, structured data graph, and `noscript` fallback directly against `index.html`.

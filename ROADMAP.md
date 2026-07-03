# ROADMAP.md - Portfolio Work Queue

This file tracks the remaining actionable work for the portfolio repo. It is the
source of truth for forward-looking work; detailed implementation notes can live
in focused companion files when useful.

## Current Status (as of 2026-07-03)

- Current app version: `1.2.0`.
- Main branch includes unreleased hero poster framing fixes, the merged PR `#284` fade-transition work, and roadmap/documentation cleanup.
- No open GitHub issues or pull requests were found during the latest review.
- The deleted landscape rendering fix plan is not active backlog; that issue is already resolved in app code and covered by regression tests.
- On-site SEO implementation is already documented in `docs/SEO.md`; the former desktop SEO follow-up note has been incorporated here, so no separate desktop SEO file is required.

## Priority 0 - Release v1.2.1 Patch Work

Goal: cut `v1.2.1` after the merged hero-transition work and this documentation cleanup are ready to ship.

Done when:

- `CHANGELOG.md` moves current `Unreleased` entries into a dated release section.
- `package.json`, `package-lock.json`, and README version metadata are aligned.
- Release validation follows `RELEASE.md`.
- The release includes the hero poster framing fixes, PR `#284` fade-transition work, the deleted landscape plan cleanup, and this roadmap/doc refresh.

## Priority 1 - Offline Data And Contact Reliability

Detailed implementation notes live in `docs/OFFLINE_RELIABILITY_PLAN.md`.

### 1.1 GitHub avatar offline caching

Goal: keep the GitHub avatar visible after a successful online load.

Implementation notes:

- Add a Workbox runtime cache rule for `https://avatars.githubusercontent.com/*`.
- Consider a narrow `githubusercontent.com` cache rule only if the app loads other GitHub-hosted assets.

Done when:

- The avatar URL pattern is cached even when it has query parameters and no image extension.
- Production-preview offline testing confirms the avatar remains visible after one online load.

### 1.2 GitHub avatar local fallback

Goal: avoid a broken image for first-time offline users or failed remote avatar requests.

Implementation notes:

- Use an existing local headshot asset such as `/branding/jp-headshot/jp-100.webp`, or add a dedicated fallback asset.
- Add an image `onError` handler that swaps once and avoids retry loops.

Done when:

- Remote avatar failure renders a local fallback.
- Unit/component coverage verifies the fallback behavior.

### 1.3 Stale GitHub data fallback

Goal: show cached GitHub data when the network fails, even if the normal cache TTL has expired.

Implementation notes:

- Stop deleting expired cache before a network attempt.
- Prefer fresh network data when online.
- Fall back to stale cache only after a network failure.
- Optionally expose stale metadata for UI copy later.

Done when:

- Expired cached GitHub data survives network failure.
- Tests cover fresh cache, expired-cache-with-network-success, and expired-cache-with-network-failure paths.

### 1.4 Contact outbox queue

Goal: prevent contact form submissions from failing silently when offline or temporarily blocked by network/server failures.

Implementation notes:

- Add a lightweight client outbox module.
- Queue immediately when `navigator.onLine` is false.
- Queue retryable failures and do not queue validation errors.
- Flush on app start and `online` events.
- Add explicit `idle`, `sending`, `queued`, `sent`, and `failed` states.

Done when:

- Offline submission creates a visible queued state.
- Reconnect sends queued messages automatically.
- 4xx validation errors remain field-level and are not queued.

### 1.5 Contact idempotency and timeout hardening

Goal: reduce duplicate email risk and handle hung requests cleanly.

Implementation notes:

- Generate a stable queue item id.
- Send `X-Idempotency-Key` with contact requests.
- Add client-side request timeout with `AbortController`.
- Store processed idempotency keys server-side for a TTL window if durable storage is available.

Done when:

- Retry of the same queued item does not send duplicate emails within the dedupe window.
- Timeouts are treated as retryable and queued.

## Priority 2 - SEO Profile Follow-Ups

These items replace the former desktop SEO follow-up note. Keep future SEO
status here. Keep on-site SEO architecture details in `docs/SEO.md`, not in a
separate desktop scratch file.

### 2.1 Google Search Console

Goal: make sure Google has the current canonical site and sitemap.

Done when:

- `jpengineering.dev` is verified in Google Search Console.
- `https://jpengineering.dev/sitemap.xml` is submitted.
- URL Inspection has been run for `https://jpengineering.dev/`.
- Indexing has been requested after the latest production deploy.
- Search Console is rechecked after 1 to 3 weeks for the `Justin Paoletta` query.

### 2.2 External exact-name signals

Goal: strengthen off-site identity signals for `Justin Paoletta`.

Done when:

- GitHub profile website link points to `https://jpengineering.dev/` instead of the old GitHub Pages portfolio URL.
- LinkedIn profile/contact website fields include `https://jpengineering.dev/`.
- Resume header/contact links include `https://jpengineering.dev/`.
- The portfolio site's bundled resume PDF is updated after the resume changes.
- Other controlled bios or profile pages link to the site with exact-name anchor text where possible.

### 2.3 SEO monitoring

Goal: decide whether additional on-site content is needed based on real search data.

Done when:

- `Justin Paoletta` and `site:jpengineering.dev "Justin Paoletta"` are checked periodically.
- Search Console impressions, clicks, and average position are reviewed after profile updates have had time to settle.

## Priority 3 - Optional Content Expansion

Do this only if the Search Console/profile work is not enough or if writing becomes a product goal for the portfolio.

Potential work:

- Add a dedicated `/justin-paoletta` page.
- Add an on-site writing section.
- Publish focused articles on AngularJS modernization, micro-frontend architecture, CI/CD automation, and AI-assisted engineering workflows.

Done when:

- Any new indexable route is added to `plugins/vite-plugin-sitemap.ts`.
- SEO metadata strategy is updated if the app moves beyond a single static homepage.
- `docs/SEO.md` and SEO tests are updated for the new route model.

## Maintenance Rules

- Keep `CHANGELOG.md` updated under `## [Unreleased]` for user-visible, operator-visible, and documentation-visible changes.
- Keep README version metadata aligned with `package.json`.
- Keep roadmap items concise; move detailed implementation plans into separate files only when they are large enough to need their own document.
- Remove completed one-off plan files once their status is captured in changelog, tests, and this roadmap.

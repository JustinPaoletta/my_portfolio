# Security maintenance

## Dependency status

The October 2026 maintenance update aligns Vitest, its UI, and V8 coverage on
4.1.11, updates Sharp and Vercel tooling, and refreshes the lockfile. The production
npm audit reports zero vulnerabilities. The full audit still reports 27 affected
development packages, all inherited from two unpatched dependencies:

- `braces`: deep-pattern stack exhaustion, used by Vercel's build analysis.
  <https://github.com/advisories/GHSA-vfj7-8cjw-p6xm>
- `extract-zip`: archive symlink traversal, used by Lighthouse's browser tooling.
  <https://github.com/advisories/GHSA-7pqw-9j4j-h8q3>
  <https://github.com/advisories/GHSA-jmr9-qjv8-65gv>

These packages have no published patched release at the time of this update.
Do not feed untrusted patterns or archives to these tools. Keep Dependabot alerts
open until upstream fixes are available; do not suppress the advisories or run
`npm audit fix --force` to accept unrelated downgrades.

The `package.json` overrides patch transitive archive, HTTP, YAML/TOML, routing,
compression, UUID, and parser dependencies that upstream tooling still pins to
vulnerable versions. Version selectors retain major versions where possible.
Undici 5 is moved to patched 6; Busboy 2 to 3; Once 2 replaces 1; and UUID 11
replaces 8–10. Verify Vercel builds and Lighthouse collection when changing these
overrides, and remove them once upstream packages request patched versions.

## API protection

Contact submissions accept five requests per client IP per ten-minute window.
Pet mutations and GitHub proxy requests accept sixty per minute. Limits use an
atomic Redis script when both `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set.
The same existing Redis configuration can back both pet counters and limits.
Configured Redis failures return 503 instead of silently bypassing the limiter.

Without Redis configuration, a bounded in-memory limiter preserves local and
unconfigured deployments. This fallback is per function instance and resets on
cold starts; configure Redis in preview and production for deployment-wide limits.
Rate-limit keys hash IP addresses and expire automatically. Forwarded IP headers
are trusted only on Vercel; local servers use the socket address.

Contact and pet requests accept same-origin browsers, `VITE_SITE_URL`, and the
current Vercel deployment/branch origin. They reject other browser origins and
require JSON bodies of at most 16 KiB. Requests without an Origin header still
use the rate limit; CORS alone cannot prevent direct scripted abuse.

Pet names are restricted to Nala, Rosie, and Tito. Atomic updates preserve the
existing `pet-dogs:<name>` JSON records and prevent concurrent clicks from losing
increments. External GitHub and Resend calls have ten-second timeouts.

## CI and development

CI and Vercel install the committed lockfile with `npm ci`. CI uses Node 22,
matching the deployment runtime. GitHub Actions are pinned to commit hashes,
and manual snapshot inputs enter shell commands through environment variables.
Quality CI checks lint, browser and server unit tests, and the production audit.

Dependabot auto-merge is enabled only when enforced branch checks and admin
protection can be verified. Without those protections, security PRs require
manual review. Vite keeps its default sensitive-file restrictions and also denies
API and server implementation files.

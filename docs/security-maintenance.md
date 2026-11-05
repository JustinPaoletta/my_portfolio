# Security maintenance

## Dependency status

Read-only npm audits on 2026-11-05 checked the committed lockfile at
`ea1d2bb`. Lockfile SHA-256:
`0391d214d17d45fda47f0e1728b38bda79b9e91365bae1b67ea0885bde860c57`.

- `npm audit --omit=dev --json`: zero reported vulnerabilities.
- `npm audit --json`: 52 affected package records: 3 low, 31 moderate, and 18 high.
- These counts describe this dated audit. Advisory data can change without a source change.

The development graph includes findings in browser/build/test tooling and its transitive dependencies.
The earlier claim that only two unpatched packages remained is obsolete.
Findings include Vitest mocker, HTTP parsers/clients, URI/glob libraries, and archive extraction.
Some updates have available fixes; evaluate compatibility and dependency paths before changing versions.
Do not use `npm audit fix --force` as a substitute for that inspection.

Reproduce with the pinned npm version:

```sh
npx --yes npm@11.6.4 audit --omit=dev
npx --yes npm@11.6.4 audit
```

A production-only audit does not prove the development tools are safe.
Avoid untrusted inputs to affected tooling while remediation remains open.
Inspect the current JSON advisory report rather than relying on this historical count.
The required quality workflow checks production dependencies; development findings need separate maintenance.

`package.json` contains transitive overrides.
Some cross major versions to replace earlier vulnerable dependencies.
Test Vercel builds and Lighthouse collection when changing them.
Remove an override only after the normal dependency graph resolves a suitable version.

## API protection

Contact submissions accept five requests per client IP per ten-minute window.
Pet mutations and GitHub proxy requests accept sixty per minute. Pet reads accept
120 requests per minute. Limits use an
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

CI and Vercel install the committed lockfile with pinned npm 11.6.4 and `npm ci`.
The npm version is pinned because npm 10 can restore a vulnerable routing package
when resolving Vercel’s aliased dependency overrides. CI uses Node 22. The deployment runtime is not pinned in the checked-in configuration. GitHub Actions are pinned to commit hashes,
and manual snapshot inputs enter shell commands through environment variables.
Quality CI checks lint, browser and server unit tests, and the production audit.

Dependabot auto-merge is enabled only when enforced branch checks and admin
protection can be verified. Without those protections, security PRs require
manual review. Vite keeps its default sensitive-file restrictions and also denies
API and server implementation files.

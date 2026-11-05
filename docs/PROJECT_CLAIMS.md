# Project claim evidence

Source and demo content were refreshed on **November 5, 2026**.
The project cards and CLI share descriptions, stacks, actions, and lifecycle labels
from [`src/content/projects.ts`](../src/content/projects.ts).

A source review establishes implemented paths, not complete release acceptance.
Capture provenance, source hashes, and data modes are in the
[capture guide](../assets/source/project-demos/README.md) and
[manifest](../assets/source/project-demos/capture-manifest.json).

## Current project content

The main Projects list contains JP Design System, BitStockerz, SideQuest: Pittsburgh,
Wild Apricot exports, and Plexarr, in that order. Each uses the shared main-project layout.
The Games group currently contains only SQUARK.
The CLI keeps all entries under `/projects`; it labels main entries **Featured** and SQUARK **Game**.

| Project               | Reviewed source                                              | Portfolio presentation and evidence limits                                                                                                                                               |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JP Design System      | `main` at `61660e5`                                          | Pre-release Angular library. Current Game 6 Storybook compositions use example data, local form state, and deterministic assistant replies. No AI provider call is demonstrated.         |
| Plexarr               | v3.3.2 at `9c9c0e0`; runtime files match `main` at `316e20f` | Private Next.js/React library dashboard. The current interface uses isolated sample-library fixtures. Fresh authentication, provider operation, and backend writes are not demonstrated. |
| SQUARK                | source record `8386ec3`; runtime `22588e6`                   | Godot browser game with connected mountain scenery. The current screenshot belongs to release `84cbd0b974f82efbc046`. The portfolio embeds no game engine.                               |
| SideQuest: Pittsburgh | `codex/add-bloomfield-benny` at `a4382f2`                    | Private native app in testing. Simulator captures show discovery, eleven guides, and the welcome-coin collection. Further coin earning and current-device acceptance remain open.        |

### JP Design System

The public [Storybook](https://justinpaoletta.github.io/jp-design-system/)
loaded anonymously during this review. The successful GitHub Pages deployment
matches `61660e5`. The portfolio now offers **Explore Storybook**.
A working hosted preview does not establish npm publication or complete
accessibility conformance. Manual assistive-technology and device checks remain
separate release gates. No npm package action is offered.

Only an existing expansion-plan document was locally modified in the source
checkout. Captured story source hashes are recorded in the manifest.

### Plexarr

The source uses Next.js, React, TypeScript, SQLite, and WebAuthn.
Passkey access is allowlisted; service credentials stay server-side.
The updated carousel displays **Current interface · sample library**.
Its Library, recommendation, and details images come from actual React rendering.
Sample API responses are intercepted in an isolated validation checkout.
Unknown APIs and external browser requests are aborted.

The normal live sign-in required owner passkey authentication.
This refresh did not complete that ceremony or bypass the production login.
Poster art was cropped from retained authentic October captures.
Request navigation, forms, actions, and status messages are excluded from public
screenshots. Earlier live recordings remain historical source evidence.

### SQUARK

The source project's retained publication receipt records local browser courses,
pack identity, and the existing public deployment. PR #4 was observed merged
on November 5. Its runtime source and release are recorded above.

A fresh anonymous HTTP request returned 200 from the portfolio's game URL.
The HTML references `84cbd0b974f82efbc046`.
This is a hosted-shell check, not a repeated hosted gameplay session.
The screenshot is a source-project browser capture from November 4.
Physical-phone gameplay, GPU, memory, and thermal acceptance remain open.
See the [browser-demo guide](SQUARK_BROWSER_DEMO.md).

### SideQuest: Pittsburgh

Current source uses React Native, TypeScript, native SQLite, MapLibre,
Fastify, and Postgres/PostGIS. Earlier Express/MongoDB portfolio badges were stale.
PR #85 was observed open at `a4382f2` during this review.
The source describes a published 1,000-restaurant catalog, with a dated
October 29 publication record. This refresh did not republish or independently
re-fetch that catalog.

The new full-screen images were captured from the existing iPhone 15 Pro
simulator on iOS 27.2. The retained installation receipt names `b41a6b6`.
This capture pass did not independently reverify the installed JavaScript bundle.
The images establish the observed UI, not current physical-device, Android,
offline recovery, accessibility, or performance acceptance.
The welcome coin exists; additional earning paths remain unfinished.

## Historical October 7 review

The record below preserves its original revisions and test scope.
Its preview-availability observations describe October 7 and are superseded by
the November Storybook verification above. Its CI results are historical.
The November pass did not repeat the BitStockerz source or provider audit.

Reviewed on **October 7, 2026** for portfolio audit task 3. The descriptions,
technology lists, source links, and lifecycle labels for these two projects live
in [`src/content/projects.ts`](../src/content/projects.ts). Both the standard
project cards and CLI use that content.

This is a dated source and build review. A passing build establishes the paths
that its checks exercise; it does not establish publication, production
operation, live-provider access, or complete accessibility conformance.

## Audited revisions

| Repository                                                             | Reviewed `main` revision                                                                                        | Current-revision CI                                                                                    |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [BitStockerz](https://github.com/JustinPaoletta/BitStockerz)           | [`498bb74`](https://github.com/JustinPaoletta/BitStockerz/commit/498bb74cbfbc75720970923fe9545f4bffb3ee68)      | [Run 37410465260](https://github.com/JustinPaoletta/BitStockerz/actions/runs/37410465260): passed      |
| [jp-design-system](https://github.com/JustinPaoletta/jp-design-system) | [`ee88259`](https://github.com/JustinPaoletta/jp-design-system/commit/ee8825905b93efeb147139aabebfc07d7dddaa83) | [Run 37413085894](https://github.com/JustinPaoletta/jp-design-system/actions/runs/37413085894): passed |

Source, workflow definitions, job results, and completed CI logs were inspected.
The upstream test suites were not repeated locally and no external provider
requests, credential changes, or deployments were made for this review.

## BitStockerz

**Portfolio status: In Development.** The description identifies the product as
prelaunch and describes implemented research and paper-trading behavior.

| Topic                       | Supported claim and boundary                                                                                                                                                                                                               | Evidence at the reviewed revision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database                    | Prisma uses MySQL, with the MariaDB adapter for MySQL/MariaDB connections. The portfolio's PostgreSQL badge was incorrect.                                                                                                                 | [Runtime schema](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/prisma/schema.prisma), [Prisma service](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/prisma/prisma.service.ts)                                                                                                                                                                                                                                                                                                                                        |
| Implemented workspace       | Angular routes implement strategy editing/versioning, historical backtests, result comparisons, market charts, and paper trading.                                                                                                          | [Routes](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/web/src/app/app.routes.ts), [workflow browser tests](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/web/e2e/milestone-5-workflows.spec.ts), [extension browser tests](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/web/e2e/product-extensions.spec.ts)                                                                                                                                                                  |
| Paper order prices          | Market orders simulate fills using recent stored bar closes and reject missing or stale prices. They do not use streaming quotes or submit real-money broker orders.                                                                       | [Fill-price service](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/trading/fill-price.service.ts), [market-data reads](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/market-data/market-data.service.ts), [order service](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/trading/orders.service.ts)                                                                                                                                                     |
| Local preview data          | Without a database, local seed mode uses synthetic data and disposable in-memory state. The portfolio does not describe it as a live market feed.                                                                                          | [Local setup](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/README.md), [provider routing](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/market-data/providers/provider-router.service.ts)                                                                                                                                                                                                                                                                                                                                     |
| Historical-data integration | The Alpaca adapter implements equity daily and USD crypto daily/hourly bars. It is disabled by default and requires credentials and feed permissions. Provider tests mock requests; successful live-provider operation is not established. | [Adapter](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/market-data/providers/live.provider.ts), [configuration](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/config/app-config.service.ts), [provider tests](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/apps/api/src/market-data/providers/live.provider.spec.ts), [remaining provider setup](https://github.com/JustinPaoletta/BitStockerz/blob/498bb74cbfbc75720970923fe9545f4bffb3ee68/PRODUCT_TASKLIST.md) |

### Build evidence and pending launch work

The current-revision [API job](https://github.com/JustinPaoletta/BitStockerz/actions/runs/37410465260/job/112097521804)
passed 974 unit tests, 67 API end-to-end tests, five real-MySQL persistence and
restart harnesses, and the production API image build. The separate
[web job](https://github.com/JustinPaoletta/BitStockerz/actions/runs/37410465260/job/112097521843)
passed 99 unit tests, seven browser tests, and the production Angular build.
Browser workflows use the seed-mode API; the MySQL harnesses independently
exercise database paths. Neither verifies real provider credentials.

The [deployment job](https://github.com/JustinPaoletta/BitStockerz/actions/runs/37410465419/job/112098221872)
failed at migration because `DATABASE_URL` was absent; the web deployment was
skipped. A later green [health job](https://github.com/JustinPaoletta/BitStockerz/actions/runs/37554775076/job/112578377711)
explicitly deferred monitoring because `PRODUCTION_API_BASE_URL` was not
configured. Its green result is not production-health evidence. Live-provider
verification and production launch remain pending, and the portfolio supplies
only a source link.

Some upstream README/product notes still describe the October 4 features as
working-tree changes and leave MySQL verification unchecked. The features are
committed at the revision above, and its completed CI is newer evidence. The
portfolio therefore credits the implemented database behavior while preserving
the distinct provider and deployment limitations.

## JP Design System

**Portfolio status: Pre-release.** This describes the project lifecycle before
its first public release. It is separate from per-API maturity and does not
assert a published npm prerelease, beta channel, or release tag.

| Topic                       | Supported claim and boundary                                                                                                                                                                                                   | Evidence at the reviewed revision                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented library         | Angular components, directives, services, semantic tokens, form controls, navigation, tables, and workflow components are implemented. “Planning” was stale.                                                                   | [Public exports](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/libs/ui/src/index.ts), [showcase routes](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/apps/showcase/src/app/app.routes.ts)                                                                                                                                                     |
| API maturity                | The inventory lists 36 stable, 76 preview, and one deprecated public class. These include components, directives, and services, not 113 standalone components. “Stable” is an API classification within an unreleased project. | [Maturity inventory](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/docs/governance/MATURITY.md)                                                                                                                                                                                                                                                                                                   |
| Storybook and accessibility | Storybook examples, interaction tests, keyboard checks, and automated accessibility checks exercise implemented components. Manual assistive-technology review and broader compatibility inspection remain open.               | [Storybook configuration](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/libs/ui/.storybook/main.ts), [support matrix](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/docs/qa/SUPPORT_MATRIX.md), [remaining work](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/COMPONENT_EXPANSION_PLAN.md) |
| Package readiness           | CI builds installable UI and token tarballs and compiles an isolated Angular consumer that installs them. This demonstrates local distribution, not npm publication.                                                           | [Distribution guide](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/docs/DISTRIBUTION.md), [consumer smoke check](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/tools/consumer-smoke.mjs)                                                                                                                                                       |

All six jobs in the audited CI run passed: lint, test, build, macOS visual
regression, package consumer, and runtime dependency audit. The test job includes
static and live Storybook interactions plus Chromium/WebKit functional and
automated accessibility checks. These checks do not establish full accessibility
conformance; the copy says “automated interaction and accessibility checks.”

### Publication and preview availability

On the review date, the public [releases endpoint](https://api.github.com/repos/JustinPaoletta/jp-design-system/releases)
and [tag references](https://api.github.com/repos/JustinPaoletta/jp-design-system/git/matching-refs/tags/)
were empty. The public npm metadata endpoints for
[`@jp-design-system/ui`](https://registry.npmjs.org/@jp-design-system%2Fui)
and [`@jp-design-system/tokens`](https://registry.npmjs.org/@jp-design-system%2Ftokens)
both returned 404. Local package versions are not evidence of publication.

The [README](https://github.com/JustinPaoletta/jp-design-system/blob/ee8825905b93efeb147139aabebfc07d7dddaa83/README.md)
documents localhost Storybook and showcase URLs. No hosted preview was verified,
so the portfolio retains its source action without adding a live-demo or npm
action. Manual accessibility review and the first public release remain pending.

## Updating these claims

When capabilities or status change, inspect the new repository revision and its
completed checks, then update the shared content and this evidence together.
Treat implementation, local preview, provider configuration, public publication,
and production verification as separate facts. Verify a public destination before
adding a demo or package link. The card/CLI regression tests compare descriptions,
stacks, source URLs, and lifecycle labels while checking that the material limits
remain visible.

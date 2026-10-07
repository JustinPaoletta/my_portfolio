# Project claim evidence

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

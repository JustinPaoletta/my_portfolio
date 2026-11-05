# Documentation index

Maintained guides were inspected against repository source and configuration on 2026-11-05.
Dated records preserve earlier results. They do not establish current CI, deployment, device, accessibility, or service acceptance.

## Maintained guides

| Topic                            | Guide                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Setup and commands               | [Root README](../README.md)                                                                                                 |
| Contributor workflow and writing | [Development workflow](DEVELOPMENT_WORKFLOW.md)                                                                             |
| Release procedure                | [Release process](../RELEASE.md)                                                                                            |
| Remaining work                   | [Roadmap](../ROADMAP.md)                                                                                                    |
| Configuration                    | [Environment variables](ENV.md)                                                                                             |
| Deployment                       | [Vercel](VERCEL_DEPLOYMENT.md)                                                                                              |
| Security and dependency audits   | [Security maintenance](security-maintenance.md), [Dependabot](DEPENDABOT.md), [CSP](CSP.md)                                 |
| Accessibility                    | [Contract](ACCESSIBILITY.md), [manual procedure](ACCESSIBILITY_MANUAL_TEST.md)                                              |
| Performance and screenshots      | [Quality gates](PERFORMANCE_QUALITY.md), [visual regression](VISUAL_REGRESSION.md)                                          |
| Analytics and monitoring         | [Observability](OBSERVABILITY.md)                                                                                           |
| SEO and offline support          | [SEO](SEO.md), [PWA](PWA.md)                                                                                                |
| Terminal and pets                | [JP-CLI](JP_CLI.md), [Pet Dogs API](PET_DOGS_API.md)                                                                        |
| Project content and source media | [Claims](PROJECT_CLAIMS.md), [capture notes](../assets/source/project-demos/README.md), [image pipeline](PROJECT_IMAGES.md) |
| Artwork                          | [Branding](../assets/branding/README.md), [Blender source](../assets/blender/README.md), [skill icons](SKILL_ICONS.md)      |
| SQUARK                           | [Browser demo](SQUARK_BROWSER_DEMO.md)                                                                                      |

## Plans and dated evidence

- [Professional portfolio record](../PROFESSIONAL_PORTFOLIO_PLAN.md): merged implementation history and remaining owner acceptance.
- [Offline reliability plan](OFFLINE_RELIABILITY_PLAN.md): proposed backlog, not implemented behavior.
- [PR #298 coverage](PR_298_TEST_COVERAGE.md): historical automated evidence and its limits.
- [Design QA](../design-qa.md): visual references and dated comparisons.
- [Changelog](../CHANGELOG.md): release history; older entries describe their own release, not the latest UI.
- [Engineer concept and implementation](design/engineer-room/README.md): preserved design rationale and implementation scope.

## Accuracy rules

Keep current instructions separate from proposals and dated observations.
Check commands against `package.json`, behavior against source/tests, and external claims against official sources.
Record revision, platform, date, and scope with test or deployment results.
A passing build does not establish physical-device, screen-reader, inbox-delivery, or live-provider acceptance.
No documentation inspection can guarantee unknown external state or replace the required manual sessions.

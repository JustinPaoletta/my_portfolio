# PR #298 test coverage

This inventory covers the complete PR against `main`, rather than only the most recent About edit. Tests assert behavior and delivered assets; prose and styles are checked through component assertions, browser layout checks, and visual references. Source artwork and captured videos are checked as delivery assets, not presented as executable application code.

## Coverage by change

| Changed area                                                                                                                    | Automated protection                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop/mobile section names, menu focus, deferred navigation and section order                                                 | Navigation unit/a11y tests; `home-navigation`, `hiring-path`, `accessibility` browser suites; deferred-section lifecycle and navigation cancellation tests                                               |
| Hero text, social links before CTAs, role/stack spacing, responsive layout                                                      | Hero unit tests; `professional-layout`, `hero-landscape`, `theme-cli` browser suites; desktop/mobile theme visual references                                                                             |
| Engineer room geometry, software-renderer policy, posters and scene transitions                                                 | `roomGeometry`, `rendererPolicy`, Hero and HeroStillImage unit tests; `hero-transition`, `theme-cli` and visual suites                                                                                   |
| Cosmic Blender astronaut, animation loading, failure recovery, reduced motion and Save-Data                                     | `cosmic-astronaut` browser suite; Hero failure/reduced-motion unit tests; Blender GLB validation script; theme visual references                                                                         |
| Terminal commands, ls/cd paths, help, history, completion, composition input, appearance/exit, close control and flowing prompt | CLI unit/a11y tests; `cli-terminal`, `theme-cli`, CLI visual suites; new completion wrapping/invalid-path tests and shell detail navigation cases                                                        |
| Projects order, honest lifecycle/provider limits, source/private/npm actions                                                    | Projects and CLI consistency unit tests; `project-actions`, `project-images`, `professional-layout` browser suites; Projects visual reference                                                            |
| Design-system demo tabs and captures                                                                                            | DemoTabs and Showcases unit tests; `project-showcases` keyboard, active-panel, image, and accessibility browser checks                                                                                   |
| BitStockerz/Plexarr video demos, local media, captions and transcripts                                                          | `project-actions` real media loading/playback and on-demand network assertions; static capture image checks                                                                                              |
| Wild Apricot CLI/CSV/JSON/files and archive                                                                                     | Showcases unit tests; `project-showcases` browser table, keyboard scrolling and download checks; real ZIP signature/size assertions                                                                      |
| About replacement, emphasis and View résumé action                                                                              | About unit test; hiring-path checks at 320/390/1280px including real PDF bytes; About desktop/mobile visual references; browser accessibility checks                                                     |
| Experience timeline, Work heading, inline résumé control, no-JS PDF download                                                    | Experience unit tests; hiring-path PDF/download/no-JS journeys; professional-layout alignment tests; Experience desktop/mobile visual references                                                         |
| Skills summaries, grouped icons/names, AI tools and removed links                                                               | Skills unit/a11y tests; professional-layout checks for icon sizes, caption placement, AI group and no card links; Skills desktop/mobile visual references                                                |
| Articles copy, same-row controls/counter and inline LinkedIn action                                                             | Articles unit/a11y tests; accessibility carousel journey; professional-layout checks; both-slide visual references                                                                                       |
| Recruiter contact copy and status, validation/submission recovery                                                               | Contact unit/a11y tests; server API/security tests; integrations and accessibility browser suites; new rejected-field recovery test; Contact visual reference                                            |
| GitHub avatar, always-visible full-year graph, loading/error/zero states, scroll arrows and focus recovery                      | GitHub/ContributionGraph/useGitHub/service unit tests; `github-activity` 53-week tests at 320/390/768/1440px; visual references; new native-scroll/reduced-motion/focus restoration unit tests           |
| Footer identity, OG image, themed logos/favicons/PWA install assets                                                             | Branding asset tests decode OG and manifest images, validate ICO payloads and compatibility URLs; Footer test; existing SEO/theme tests and theme-cli browser assertions                                 |
| Dog photos, transparency, removed Foster label and interactions                                                                 | Branding tests decode all three cutouts and verify actual alpha; PetDogs/usePetDogs unit tests; expanded section visual reference; CLI detail test                                                       |
| PWA shell/cache changes and CLI prompt visibility                                                                               | PWA/App/update-prompt unit tests; new same-origin runtime-cache boundary tests for images, media, models, JS/CSS and APIs; existing integration/theme journeys                                           |
| Build/export tooling, metadata and asset delivery                                                                               | Production type-check, build, contrast, prerender and bundle checks; static SEO tests; project image response/metadata assertions; GLB finite geometry, bounded indices, skin/animation/image validation |
| Visual capture helper                                                                                                           | Desktop/mobile regression changes preceding layout by 0.375px and requires byte-identical section captures; reviewed macOS/Linux section references                                                      |

## Continuous checks

- Quality CI runs the existing V8 coverage command and enforces the existing 90% statement, branch, function, and line thresholds. It uploads the coverage report for inspection and runs the server suite separately.
- Functional CI runs both desktop Chromium and the mobile Chromium project, including the mobile orientation tests that the former desktop-only command excluded.
- Visual CI compares approved Linux images in the pinned Playwright container. About has its own references on desktop and mobile.
- Screenshot tolerances are unchanged. Section-only visual captures have a stable viewport origin; normal-flow placement is tested separately in browser journeys, including project info/demo order.

## Evidence and limits

The V8 report measures instrumented modules executed by the unit suite. It is not a claim of 100% coverage of GPU rendering, CSS, Blender scripts, external services, or all possible browser states. GPU behavior and delivered media have separate browser/asset checks above.

GitHub/contact APIs use deterministic fixtures or mocked responses in browser tests. Tests do not send real recruiter messages, place real orders, submit Plex requests, or validate third-party uptime. An emulated phone viewport and automated axe checks do not establish physical iPhone or human screen-reader acceptance. Visual/artistic fidelity of the dog cutouts and professional copy remains owner acceptance.

### Latest local results

- Unit coverage: 96.52% lines, 96.41% statements, 96.00% functions, 90.35% branches; all existing 90% thresholds pass.
- Frontend: 278 cases pass. Server suite is run by the required pre-push check.
- Production Chromium/mobile: 93 passed, one preview-only test skipped; three additional professional-layout checks passed.
- Desktop/mobile fractional-layout regression: both passed with byte-identical captures.
- macOS section visuals: 15 passed, including new About references; updated images visually reviewed before staging.
- Delivered Blender GLB validator passed (179,410 triangles, finite geometry, valid skinning, five embedded textures, WaveThenRest clip).
- Cross-browser and final CI results are recorded after the final run below.

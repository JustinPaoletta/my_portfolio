# Professional portfolio plan

Updated 2026-10-15. Implementation is on draft [PR #298](https://github.com/JustinPaoletta/my_portfolio/pull/298). This plan preserves the original audit task numbers; task 20 remains excluded and the writing carousel stays.

## Remaining work in this PR — owner request, 2026-10-12

The owner approved the matching OG image and favicon on 2026-10-15. The requested featured-project demo revision is implemented for review.

- [x] **Approve the revised OG image.** The new charcoal sharing card uses the owner’s JP-and-cursor reference, clean vector geometry, local Inter typography, and matching social metadata. Review the 1200 × 630 export in `public/og/jp-engineering.png` before merging.
- [x] **Approve the revised favicon.** The same master mark now produces SVG, ICO, PNG, Apple touch, and dedicated maskable icons. Navigation and footer use matching geometry and neutral colors; theme switching preserves the favicon. Review the final small-size appearance before merging.
- [x] **Show better featured-project demos.** The design system is first with a current dashboard capture and full-size image link. BitStockerz is second with a real 15.6-second browser walkthrough, poster, timed captions and transcript. The recording edits rules, runs a backtest and inspects charts using synthetic local data. Playback is opt-in; no public app deployment is claimed.

## Outcome and revised priorities

A hiring reader should quickly identify the role, inspect relevant work, understand the professional experience, download the résumé, and make contact. Put evidence before activity counts and decorative imagery. Preserve the four themes without requiring visitors to explore them to find essential information.

The implementation is ready for review with stated content assumptions. Existing employment titles, dates, and the approximately 75% deployment-time claim are retained, not independently re-measured. A public employer case study and final résumé approval remain owner work; they do not justify blocking improvements to navigation or presentation.

## Implemented in this PR

- [x] **1, 2, 3, 4, 13, 21 — Prior credibility work.** Preserve the professional experience layout, visible project actions, truthful GitHub failure states, audited project claims, verified GitHub profile destination, and responsive logos. See the PR history and `docs/PROJECT_CLAIMS.md` for the earlier evidence.
- [x] **5 — Recognizable role.** Lead with Software Engineer and Angular / React / TypeScript, followed by a concrete modernization and delivery-tooling description. Avoid guessed tenure or additional achievement claims.
- [x] **6 — Résumé access.** Keep visible PDF actions in desktop/mobile navigation, Experience, and CLI. The hero pairs View My Projects with Contact, as requested in review.
- [x] **7 — Evidence-first order.** Present Projects, Experience, About, Skills, Articles, and Contact before optional GitHub activity and pets. Limit the main menu to the hiring journey and résumé.
- [x] **10 — Honest project visuals.** Replace featured promotional images with a captured Angular showcase and labeled implementation workflow diagrams. Captions explain exactly what is shown and preserve release/provider limitations.
- [x] **11 — Curate inspectable work.** Feature BitStockerz, the design system, and the published Wild Apricot CLI with visible source/package actions. Private projects remain smaller supporting cards. Richer personal-ownership narratives belong with the evidence work below.
- [x] **14 — One engineering approach.** Lead About with accesso Passport modernization work and the approved responsible-AI workflow: context, reviewed implementation, and verification. Include the AI-assisted PR review bot as a concrete example and link to Experience.
- [x] **15 — Skills and activity.** Use three focused groups with larger icons, smaller technology labels, and capability summaries. Remove popularity counters, restore the GitHub avatar next to the profile, and show contribution history directly; preserve honest unavailable states.
- [x] **16 — Identity cleanup.** Omit the stylized portrait and remove its Person structured-data reference. The OG redesign was initially deferred; the owner resumed it on 2026-10-14 with the JP-and-cursor reference. The revised shared identity is now ready for visual approval.
- [x] **17 — Presentation.** Reduce crowded hero labels, hover-dependent content, oversized project shadows, and repeated skills/prose. Keep theme-aware focus and wrapping controls.
- [x] **18 — Contact wording.** Address recruiters directly and invite the opportunity, team, and job details, with email prominent. Restore the original freelance/full-time availability badge at the owner’s request. Do not invent location or working-arrangement preferences.
- [x] **24 — Focus defect.** Cancel deferred navigation after new visitor interaction or another jump; preserve Contact validation focus and complete slow-loading section navigation within a bounded 12-second window.

## Earlier verification (before the review refinements)

Completion requires observed outcomes, not only screenshots. Final results are recorded in the PR description.

- [x] TypeScript, ESLint, Prettier, 197 frontend/server unit tests, 10 accessibility unit tests, and production build with actual prerendering pass.
- [x] **22 (core content)** — A Chromium context with JavaScript disabled verified readable profile, selected work, employment, email, and a real PDF résumé download from the production build. Prerendering now exposes captured reveal content without JavaScript. Case-study routes await publishable case studies; this closes core content only.
- [x] **23, 27** — Verified complete 320px, 390px, and 768px navigation, wrapping, section landing, and actual PDF downloads from hero/desktop/mobile entry points. Existing touch/keyboard project and real-image response regressions pass.
- [x] **24 (automated)** — Keyboard, reduced-motion, theme, and axe checks pass. All 23 Linux and 23 macOS visual states were generated and inspected; the reviewed baselines are committed. CI comparison results are recorded in the PR. Visual review also caught and corrected Cosmic light résumé contrast and removed skip-link pollution from section-only captures.
- [x] **25 (mocked)** — Contact validation, server error, and success pass with isolated mock responses. No real message was sent.

## Owner inputs and acceptance

These are content or human acceptance tasks; do not replace missing facts with invented copy.

- [ ] **8 — Modernization case study.** Supply what may be shared about the employer work: the actual problem, personal responsibilities, alternatives, framework/style isolation decisions, verification, and outcome. Approve any sanitized diagram or interface example before publication.
- [ ] **9, 12, 26 — Outcomes and contribution.** Reconcile the four-application release baseline and the approximately 75% result. Distinguish elapsed deployment time from manual effort. Supply any supportable team adoption, mentoring, or coordination details and align LinkedIn/résumé wording.
- [ ] **18 — Hiring preferences.** Confirm target roles, location, remote/hybrid preference, and current availability before adding those assertions.
- [ ] **19 — Final résumé.** Review/approve the revised PDF and its public contact information, including both employment roles and exact dates. This revision deliberately links the existing public PDF; the prior draft is not silently substituted.
- [ ] **24 — Human accessibility acceptance.** Check screen-reader reading/focus order and physical touch interaction, including the résumé PDF. Automated axe and emulation do not establish full conformance.
- [ ] **25 — Inbox delivery.** Explicitly authorize one owner-controlled test message and confirm receipt. Mocked success is not email delivery evidence.
- [ ] **28 — Hiring readability.** Have an uninvolved reader identify role, strongest work, personal contribution, supporting evidence, and contact path. Use their feedback to refine the case studies.

## Follow-up decisions

- Retain the article carousel and themed identity. A real portrait is optional; an accurate text-first identity is sufficient.
- Keep public source/package links available while demos are unreleased. Do not imply a deployed BitStockerz service or published design-system package.
- Prioritize employer evidence and profile consistency over an offline contact outbox. Offline reliability remains in `docs/OFFLINE_RELIABILITY_PLAN.md` as later work.
- Preview/CI validation does not authorize merging or publishing a production release. This work updates the existing draft PR.

## CLI terminal revision — 2026-10-11

The owner requested a full terminal experience with guidance in the terminal.
Replace the option sidebar and floating theme menu with one transcript and
prompt. The follow-up below restores macOS traffic lights. Preserve the audited portfolio content and existing
links; this remains a portfolio command interface, not an operating-system shell.
The prompt follows the latest output and scrolls with the transcript, as requested
in the follow-up review; it is not pinned to the viewport.

- [x] Implement the opening guide, contextual help, command history, completion,
      normal text editing, cancellation/clear shortcuts, and appearance/exit commands.
- [x] Verify named and numeric commands, links, invalid-input recovery, theme
      persistence, focus escape, screen-reader semantics, and narrow/short viewports.
- [x] Review desktop/mobile light/dark screenshots and update affected Linux/macOS baselines.

Validation: 205 frontend/server unit tests, 10 accessibility unit tests, 18 CLI/theme
browser checks, and all 26 macOS visual comparisons pass. The final cold-load CSS
fix also passed 10 Hero tests. TypeScript, lint, formatting, production build,
contrast, bundle limits, and prerender pass. Five affected Linux screenshots were
generated in review workflow `38114624992`, inspected, and accepted. The deployed
preview executes contextual help with zero UI buttons or browser exceptions.
Final CI status is recorded in the PR. Physical mobile-keyboard and human
screen-reader acceptance remain owner checks.

Prompt-flow follow-up: the input now follows the last output inside the scrolling
transcript. A browser regression verifies short and long output, scrolling back,
and clearing. All 205 unit tests, 10 accessibility tests, eight focused browser
journeys, and five affected macOS visual comparisons pass. The matching Linux
screenshots from review workflow `38178442391` were inspected and accepted.

## Review refinements — 2026-10-11

- [x] Use `ls` and `cd` for directory navigation, with relative/absolute paths,
      path completion, invalid-path recovery, and a matching prompt location.
- [x] Restore the macOS dots: red shows × on hover/focus and performs `exit`;
      yellow and green are decorative. Put name, role, and stack in the title row,
      retaining the name on narrow screens.
- [x] Open with “Welcome to JP-CLI,” then reveal instructions 500ms later.
      Reduced motion displays them immediately. Keep the prompt in transcript flow.
- [x] Remove the GitHub introduction, restore the API profile avatar, and show
      contribution history without an expand/collapse control.
- [x] Share the Projects, Experience, About, Articles, and Contact labels between
      navigation and the section headings. Pair View My Projects with Contact in the hero.
- [x] Restore tiny local technology logos beside every displayed skill label,
      grouped in the three applied-skills cards.
- [x] Record final browser and accessibility evidence in the PR. The exact source
      passed full lint, 208 unit tests, 10 accessibility unit tests, production
      build/prerender, 30 focused Chromium journeys, and 28 macOS visual comparisons.
      Live preview captures confirm the Contact action, skill icons, GitHub API
      avatar/always-visible history, and terminal header/prompt. All 28 Linux states were generated in workflow `38188195420`, inspected,
      and accepted. Final-head CI results are recorded in the PR.

## Matching identity revision — 2026-10-14

- [x] Build the OG image and favicon from the owner's JP-and-cursor reference,
      with clean vector geometry, charcoal/slate/white colors, and local Inter type.
- [x] Use the same master for navigation, footer, SVG/ICO/PNG favicons, Apple touch,
      and PWA icons. Keep the favicon stable when themes or color modes change.
- [x] Update crawler-facing OG/Twitter metadata and the shared SEO image path.
      Retain the historical OG URL as an export of the new image.
- [x] Verify the 1200 × 630 opaque OG export, three real ICO frames, all declared
      manifest sizes, and the dedicated maskable mark's central safe circle.
      All icon requests returned their image types. Desktop and 390px layouts
      were reviewed; 222 unit tests, 15 existing homepage visual comparisons,
      three theme browser regressions, lint/type checks, build, and actual
      Chrome prerendering passed locally.
- [x] Owner visual approval of the matching pair received on 2026-10-15. External social
      cache refresh and native home-screen icon acceptance remain unverified.

## Featured project demos — 2026-10-15

- [x] Feature the current design system first and BitStockerz second in the
      visual page and CLI. Keep the published CLI tool as the third featured card.
- [x] Replace the older design-system capture with the current Storybook dashboard
      and provide a full-size image action.
- [x] Replace BitStockerz's workflow diagram with a real 15.6-second browser
      recording: rule editing, validation, simulation settings, and chart results.
      Use a disposable seed account, synthetic prices and no live-provider or AI calls.
- [x] Add native opt-in playback, timed descriptions and a readable transcript.
      Keep playback paused and the recording unloaded until requested. Include
      source captures, hashes and reproducible WebP/MP4 export instructions.
- [x] Verify 222 unit tests and 17 focused browser journeys, including real video
      decode/seeking, keyboard access, touch source links, CLI ordering and no
      overflow at 390px. Review desktop/mobile captures and regenerate affected
      visual baselines. Final hosted results are recorded in the PR.

The owner approved the OG image and favicon before this revision. Native device
acceptance and public deployment of either demo application remain separate work.

## Expanded project evidence — 2026-10-15

- [x] Expand the design-system card into four current Storybook captures:
      dashboard, form controls, data display, and the assistant panel. Retain
      full-size images, fictional content labels, and the pre-release status.
      Identify the assistant reply as a fixed sample.
- [x] Replace Wild Apricot's diagram with actual CLI output, a CSV preview,
      nested JSON, and the generated file list. Run the unmodified CLI against
      isolated fictional REST/WebDAV fixtures. Verify three contacts, two events,
      two unchanged original files, and a second run with zero new downloads.
- [x] Provide a complete sample ZIP with CSV/JSON, originals, manifest, and full
      log. Retain fixtures, generation tools, source revision, and output hashes.
- [x] Verify gallery/download behavior, keyboard access, responsive layouts,
      accessibility, and existing project actions in 18 focused browser checks.
      The production build, Chrome prerender, and 222 unit tests pass. The live
      preview serves all four views and the complete ZIP without phone overflow.
- [x] Set the test viewport before settling tall section crops. Two independent
      mobile Experience captures are byte-identical; all ten local section
      comparisons pass after reviewing its one-pixel crop correction. No product
      styling or comparison tolerance changed.
- [x] Inspect and accept the Linux Projects and mobile Experience baselines from
      workflow `38687571205`, generated with the stable capture helper. The latter
      retains all content with settled monospace labels wrapping more compactly.
      The other 26 hosted visual comparisons passed before these two updates.

No owner credentials are needed for these public samples. A hosted interactive
design-system application and a real-account Wild Apricot acceptance run remain
separate work.

## Plexarr demo and skill icons — 2026-10-15

- [x] Add Plexarr as the fourth featured project, after the design system,
      BitStockerz, and Wild Apricot. Capture the real authenticated app: movie
      catalog, title details and availability, quality review, then cancellation.
      No API interception, fictional entries or new media requests.
- [x] Provide an 18-second opt-in WebM/MP4 player, real poster, timed descriptions,
      transcript, cropped source recordings, hashes, and reproducible edit ranges.
      Keep passkey sign-in outside the recording and cancel before submission.
      Remove the fictional clip and fixtures; use new asset URLs to avoid old
      media-cache entries.
- [x] Enlarge the Skills & Technologies artwork from 16px to 32px within 40px
      frames. Keep all 13 icons with their appropriate technology labels and
      allow the chips to wrap on small screens.
- [x] Verify 222 unit tests, the production build and Chrome prerender, contrast
      and bundle checks, 18 focused project browser journeys, and all ten local
      section comparisons. Inspect desktop and phone captures; all 13 icons load
      at 32px with no chip or page overflow at 320px and 390px. Hosted results and
      reviewed Linux references are recorded in the PR.

## Navigation and section names — 2026-10-15

- [x] Use Projects, Experience, About, Articles, and Contact in both desktop and
      mobile navigation and in the matching section headings. Keep the existing
      section anchors, including `#articles`, so saved links still work.
- [x] Remove the extra labels above all seven professional section headings,
      including repeated About/Contact and alternate names such as Career,
      Applied Skills, and Source & Activity. Each section has one clear title.
- [x] Extend the existing hiring-path browser check to desktop. Verify every
      menu destination at 320, 390, 768, and 1280 pixels: matching heading, URL,
      section focus, settled scroll position, mobile dismissal, and no overflow.
      All 22 focused navigation/accessibility browser checks, 222 unit tests,
      ESLint, TypeScript, contrast/bundle checks, and Chrome build/prerender pass.
- [x] Review and update the 17 affected macOS section, desktop navigation, and
      hamburger-menu references. Preserve the existing comparison tolerances.
- [x] Verify all 28 local visual comparisons without updating snapshots. Inspect
      and accept the corresponding 17 Linux references from review workflow
      `38789135329`. Verify the fresh Vercel preview's desktop About link, mobile
      menu labels, and Articles destination; retain review captures. Final hosted
      checks are recorded in the PR.

## Approved skills layout and copy — 2026-10-15

- [x] Implement the approved mockup's grouped icons with a smaller technology
      list below each group. Preserve all 13 existing local logos and readable
      names, with decorative icons excluded from the accessibility tree.
- [x] Rewrite the three summaries around frontend modernization, repeatable
      testing and release automation, and API/data design. Add context without
      repeating the technology names. Remove all three bottom links.
- [x] Keep equal desktop cards, natural phone stacking, and responsive icon
      sizes: 48px at desktop, 40px at 390px, and 32px at 320px. Captions remain
      13px beneath each complete group; summary text is 15px.
- [x] Compare the implementation with the approved mockup in combined full-view
      and icon-detail images. Inspect 1440px, 390px, and 320px layouts with no
      card or page overflow. Record the comparison in `design-qa.md`.
- [x] Verify the production build and Chrome prerender, 222 unit tests, 10
      accessibility unit tests, and 25 focused navigation/accessibility/section
      browser checks. Review the two updated macOS Skills references; the other
      eight section comparisons pass unchanged.
- [x] Inspect and accept only the two Skills Linux references from review
      workflow `38799467572`, without changing comparison tolerances. Verify the
      deployed light-theme section: all logos load, the revised copy and small
      name lists render, and the bottom links are absent. Final hosted checks
      are recorded in the PR.

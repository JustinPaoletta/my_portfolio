# Professional portfolio plan

Updated 2026-10-11. Implementation is on draft [PR #298](https://github.com/JustinPaoletta/my_portfolio/pull/298). This plan preserves the original audit task numbers; task 20 remains excluded and the writing carousel stays.

## Outcome and revised priorities

A hiring reader should quickly identify the role, inspect relevant work, understand the professional experience, download the résumé, and make contact. Put evidence before activity counts and decorative imagery. Preserve the four themes without requiring visitors to explore them to find essential information.

The implementation is ready for review with stated content assumptions. Existing employment titles, dates, and the approximately 75% deployment-time claim are retained, not independently re-measured. A public employer case study and final résumé approval remain owner work; they do not justify blocking improvements to navigation or presentation.

## Implemented in this PR

- [x] **1, 2, 3, 4, 13, 21 — Prior credibility work.** Preserve the professional experience layout, visible project actions, truthful GitHub failure states, audited project claims, verified GitHub profile destination, and responsive logos. See the PR history and `docs/PROJECT_CLAIMS.md` for the earlier evidence.
- [x] **5 — Recognizable role.** Lead with Software Engineer and Angular / React / TypeScript, followed by a concrete modernization and delivery-tooling description. Avoid guessed tenure or additional achievement claims.
- [x] **6 — Résumé access.** Keep visible PDF actions in desktop/mobile navigation, Experience, and CLI. The hero pairs View My Projects with Contact, as requested in review.
- [x] **7 — Evidence-first order.** Present Projects, Experience, About, Skills, Writing, and Contact before optional GitHub activity and pets. Limit the main menu to the hiring journey and résumé.
- [x] **10 — Honest project visuals.** Replace featured promotional images with a captured Angular showcase and labeled implementation workflow diagrams. Captions explain exactly what is shown and preserve release/provider limitations.
- [x] **11 — Curate inspectable work.** Feature BitStockerz, the design system, and the published Wild Apricot CLI with visible source/package actions. Private projects remain smaller supporting cards. Richer personal-ownership narratives belong with the evidence work below.
- [x] **14 — One engineering approach.** Lead About with accesso Passport modernization work and the approved responsible-AI workflow: context, reviewed implementation, and verification. Include the AI-assisted PR review bot as a concrete example and link to Experience.
- [x] **15 — Skills and activity.** Replace the logo wall with three compact groups linked to supporting work. Remove popularity counters, restore the GitHub avatar next to the profile, and show contribution history directly; preserve honest unavailable states.
- [x] **16 — Identity cleanup.** Omit the stylized portrait and remove its Person structured-data reference. The OG image redesign is deferred at the owner’s request; retain the existing image in this PR.
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
- [x] Share the Projects, Experience, About, Writing, and Contact labels between
      navigation and the section headings. Pair View My Projects with Contact in the hero.
- [x] Restore tiny local technology logos beside every displayed skill label,
      grouped in the three applied-skills cards.
- [x] Record final browser and accessibility evidence in the PR. The exact source
      passed full lint, 208 unit tests, 10 accessibility unit tests, production
      build/prerender, 30 focused Chromium journeys, and 28 macOS visual comparisons.
      Live preview captures confirm the Contact action, skill icons, GitHub API
      avatar/always-visible history, and terminal header/prompt. All 28 Linux states were generated in workflow `38188195420`, inspected,
      and accepted. Final-head CI results are recorded in the PR.

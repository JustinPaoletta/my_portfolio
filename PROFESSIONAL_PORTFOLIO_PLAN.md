# Professional portfolio plan

Updated 2026-10-11. Implementation is on draft [PR #298](https://github.com/JustinPaoletta/my_portfolio/pull/298). This plan preserves the original audit task numbers; task 20 remains excluded and the writing carousel stays.

## Outcome and revised priorities

A hiring reader should quickly identify the role, inspect relevant work, understand the professional experience, download the résumé, and make contact. Put evidence before activity counts and decorative imagery. Preserve the four themes without requiring visitors to explore them to find essential information.

The implementation is ready for review with stated content assumptions. Existing employment titles, dates, and the approximately 75% deployment-time claim are retained, not independently re-measured. A public employer case study and final résumé approval remain owner work; they do not justify blocking improvements to navigation or presentation.

## Implemented in this PR

- [x] **1, 2, 3, 4, 13, 21 — Prior credibility work.** Preserve the professional experience layout, visible project actions, truthful GitHub failure states, audited project claims, verified GitHub profile destination, and responsive logos. See the PR history and `docs/PROJECT_CLAIMS.md` for the earlier evidence.
- [x] **5 — Recognizable role.** Lead with Software Engineer and Angular / React / TypeScript, followed by a concrete modernization and delivery-tooling description. Avoid guessed tenure or additional achievement claims.
- [x] **6 — Résumé access.** Add visible PDF actions to the hero and desktop/mobile navigation; retain the existing public PDF in Experience and CLI.
- [x] **7 — Evidence-first order.** Present Work, Experience, About, Skills, Writing, and Contact before optional GitHub activity and pets. Limit the main menu to the hiring journey and résumé.
- [x] **10 — Honest project visuals.** Replace featured promotional images with a captured Angular showcase and labeled implementation workflow diagrams. Captions explain exactly what is shown and preserve release/provider limitations.
- [x] **11 — Curate inspectable work.** Feature BitStockerz, the design system, and the published Wild Apricot CLI with visible source/package actions. Private projects remain smaller supporting cards. Richer personal-ownership narratives belong with the evidence work below.
- [x] **14 — One engineering approach.** Consolidate requirements, deterministic checks, code/UI inspection, and QA handoff into About. Shorten the Experience example and align CLI wording.
- [x] **15 — Skills and activity.** Replace the logo wall with three compact groups linked to supporting work. Remove popularity counters from the standard page and make contribution history an optional disclosure; preserve honest unavailable states.
- [x] **16 — Identity assets (local implementation).** Omit the stylized portrait, remove its Person structured-data reference, and generate a matching 1200×630 name/role sharing card. An external sharing-cache preview remains a production follow-up.
- [x] **17 — Presentation.** Reduce crowded hero labels, hover-dependent content, oversized project shadows, and repeated skills/prose. Keep theme-aware focus and wrapping controls.
- [x] **18 — Contact wording (partial).** Ask about a software engineering role or frontend challenge, with email prominent. Do not invent location or working-arrangement preferences.
- [x] **24 — Focus defect.** Cancel deferred navigation after new visitor interaction or another jump; preserve Contact validation focus and complete slow-loading section navigation within a bounded 12-second window.

## Verification for this revision

Completion requires observed outcomes, not only screenshots. Final results are recorded in the PR description.

- [ ] TypeScript, ESLint, Prettier, frontend/server unit tests, and production build with actual prerendering pass.
- [x] **22 (core content)** — A Chromium context with JavaScript disabled verified readable profile, selected work, employment, email, and a real PDF résumé download from the production build. Prerendering now exposes captured reveal content without JavaScript. Case-study routes await publishable case studies; this closes core content only.
- [ ] **23, 27** — Check complete 320px, 390px, and 768px navigation, wrapping, section landing, and local PDF health; preserve project source touch/keyboard and image-response regressions.
- [ ] **24 (automated)** — Run keyboard, reduced-motion, theme, and axe checks. Generate Linux baselines as a review artifact, inspect them, commit accepted images, and rerun visual CI.
- [ ] **25 (mocked)** — Verify contact validation, server error, and success without sending a real message.

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

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Dependabot is now explicitly configured and documented as security-only, and its auto-merge workflow only targets grouped security remediation PRs.

### Documentation

- Standardized the repository around a manual changelog, release branches, and a root `RELEASE.md` guide shared with the other application repos.

## 1.1.17

### Patch Changes

- 86a39d1: chore(deps-dev): bump @types/node from 25.5.2 to 25.6.0 in the typescript group across 1 directory
- f419927: chore(deps-dev): bump @vercel/node from 5.7.0 to 5.7.4
- 8bc3b64: chore(deps-dev): bump dotenv from 17.4.1 to 17.4.2
- e56b335: chore(deps-dev): bump globals from 17.4.0 to 17.5.0
- e400a28: chore(deps-dev): bump the linting group across 1 directory with 3 updates

## 1.1.16

### Patch Changes

- 54b61f1: ci(deps): bump dependabot/fetch-metadata from 2 to 3
- a6f273f: ci(deps): bump actions/github-script from 8 to 9
- 925a6bd: chore(deps): bump the react group across 1 directory with 2 updates

## 1.1.15

### Patch Changes

- 81a6dd9: gitignore file added
- 26eb870: chore(deps-dev): bump basic-ftp from 5.2.0 to 5.2.1
- 7bb446c: chore(deps-dev): bump basic-ftp from 5.2.1 to 5.2.2
- 25a2f26: chore(deps-dev): bump the testing group with 4 updates

## 1.1.14

### Patch Changes

- 512a0f8: chore(deps-dev): bump @types/node from 25.5.0 to 25.5.2 in the typescript group
- 1e89ba0: chore(deps-dev): bump @vercel/node from 5.6.22 to 5.7.0
- 90ffe97: chore(deps-dev): bump dotenv from 17.3.1 to 17.4.1
- 8f7c47b: chore(deps): bump @newrelic/browser-agent from 1.312.0 to 1.312.1
- e44577e: removes requirement of changesets on dependabot prs

## 1.1.13

### Patch Changes

- 41e19c7: chore(deps-dev): bump @playwright/test from 1.59.0 to 1.59.1 in the testing group

## 1.1.12

### Patch Changes

- 7b30cb5: Fixes the navigation menu to allow closing, and not allow scroll while open

## 1.1.11

### Patch Changes

- 2324c83: chore(deps-dev): bump @playwright/test from 1.58.2 to 1.59.0 in the testing group
- f1342e2: chore(deps-dev): bump typescript-eslint from 8.57.2 to 8.58.0 in the linting group
- c4f8730: chore(deps): bump @newrelic/browser-agent from 1.311.0 to 1.312.0
- 28e0bf4: chore(deps-dev): bump lodash-es from 4.17.23 to 4.18.1
- 3fcb654: chore(deps): bump lodash from 4.17.23 to 4.18.1

## 1.1.10

### Patch Changes

- 9f8a5dd: Hide the floating theme switcher while the mobile navigation menu is open so it cannot overlap or interfere with the menu.

## 1.1.9

### Patch Changes

- d0d4b1a: Remove framer-motion and small performance improvements

## 1.1.8

### Patch Changes

- 5c246a0: chore(deps-dev): bump the testing group with 3 updates
- cd89220: chore(deps-dev): bump @vercel/node from 5.6.18 to 5.6.22
- ea9f2d5: Document the build-time app config pipeline and remove unused GitHub, analytics, and animation helpers.

## 1.1.7

### Patch Changes

- 24f656c: Fix deferred section rendering in short landscape viewports. This removes the stalled deferred-section cascade, hardens orientation-change and near-page-end handling, improves reveal timing in short viewports, and adds regression coverage for landscape scrolling and deep-link navigation.

## 1.1.6

### Patch Changes

- 97afae9: Performance and bundle optimization pass with deferred section rendering. Extracted shared deferred navigation utility, fixed hash-based navigation for non-nav links and direct URL loads, and rewrote the Navigation IntersectionObserver to dynamically observe sections as they mount.

## 1.1.5

### Patch Changes

- 80496f4: Add deterministic Playwright visual regression coverage and contributor workflow documentation.

## 1.1.4

### Patch Changes

- 5dd4ddc: Harden accessibility behavior across navigation, dialogs, tabs, forms, and the CLI theme while adding automated accessibility coverage and stronger contrast regression checks.

## 1.1.3

### Patch Changes

- ae14cdf: chore(deps): bump lucide-react from 0.577.0 to 1.0.1
- 2d4dc3b: chore(deps-dev): bump picomatch from 2.3.1 to 2.3.2

## 1.1.2

### Patch Changes

- fbfef5d: Fix the resume download so PDF requests are not rewritten to the app shell by the PWA service worker.

## 1.1.1

### Patch Changes

- e2515ed: Migrate automated versioning, release PRs, and GitHub releases to Changesets.

## [1.1.0] - 2026-03-23

### Added

- Homepage prerendering during production builds so crawlers receive
  rendered homepage HTML.

### Changed

- SEO metadata, structured data, and sitemap output for improved search
  visibility and richer link previews.

### Deprecated

### Removed

### Fixed

- Prerender server cleanup when Chromium launch fails during build-time
  rendering.

### Security

---

## [1.0.0] - 2026-03-08

### Added

- Initial portfolio website setup
- React 19.1.1 with TypeScript 5.9
- Vite (Rolldown 7.1.14) build configuration with aggressive optimization
- Progressive Web App (PWA) support with offline functionality
  - Service Worker with Workbox
  - Web App Manifest for installability
  - Smart caching strategies (Cache-first, Network-first, Stale-while-revalidate)
  - PWA update prompt component
  - Automatic service worker generation
- Automated sitemap generation
  - Dynamic sitemap.xml created during build
  - Vite plugin for automatic generation
  - Configurable routes and priorities
- Automated changelog and versioning
  - commit-and-tag-version (standard-version successor)
  - Conventional Commits based semantic versioning
  - Automatic CHANGELOG.md updates
- Comprehensive testing setup
  - Vitest 4.0.5 with 85% coverage thresholds
  - Playwright 1.56.1 with multi-browser support
  - Testing Library for React component testing
- SEO optimization with React Helmet Async
- Privacy-friendly analytics with Umami
- Real-time error monitoring with New Relic Browser Agent
- ESLint 9.39.1 with strict a11y rules
- Prettier 3.6.2 for code formatting
- Git hooks with Husky 9.1.7
- Conventional Commits enforcement with Commitlint
- VS Code debugging configurations
- Strict TypeScript configuration with error handling validation
- Performance budgets and bundle size monitoring
- Vercel deployment configuration and documentation
- Comprehensive documentation in docs/ folder
- CLI theme command `exit`/`quit` to switch from CLI back to the default `engineer` theme
- `docs/CLI_THEME.md` with CLI layout, controls, and command reference

### Changed

- CLI theme presentation and interactions:
  - Fullscreen terminal-focused layout with navbar hidden
  - Keyboard-first staged input model (`Arrow`/`Space`/`0-9` stage, `Enter` executes)
  - Compact/mobile view ordering updated so terminal content appears before the menu
  - CLI prompt/title naming updated to `jp@cli: ~%` and `JP CLI`
  - CLI theme switcher moved to bottom-right with upward-opening options menu

### Deprecated

### Removed

- Accessibility testing suite (axe-core, a11y-helper, accessibility.spec.ts)
- Visual regression testing (visual.spec.ts, snapshots, workflows)
- Related npm scripts (test:a11y:_, test:visual:_)
- Accessibility and visual testing documentation

### Fixed

### Security

---

# Changelog

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

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

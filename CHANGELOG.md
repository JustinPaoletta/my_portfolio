# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed

### Deprecated

### Removed

- Accessibility testing suite (axe-core, a11y-helper, accessibility.spec.ts)
- Visual regression testing (visual.spec.ts, snapshots, workflows)
- Related npm scripts (test:a11y:_, test:visual:_)
- Accessibility and visual testing documentation

### Fixed

### Security

---

## How to Update This Changelog

### Automated (Recommended)

Use `npm run release` to automatically:

- Bump version based on commit messages
- Update CHANGELOG.md with changes
- Create a git tag
- Commit the changes

### Manual

Add changes under the `[Unreleased]` section in the appropriate category:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for removed features
- **Fixed** for bug fixes
- **Security** for vulnerability fixes

When releasing, move items from `[Unreleased]` to a new version section.

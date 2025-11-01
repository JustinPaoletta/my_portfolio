# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial portfolio website setup
- React 19 with TypeScript
- Vite (Rolldown) build configuration
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
  - standard-version integration
  - Conventional Commits based versioning
  - Automatic CHANGELOG.md updates
- Comprehensive testing setup (Vitest, Playwright, axe-core)
- Accessibility compliance (WCAG 2.1 Level AA)
- SEO optimization with React Helmet Async
- Error monitoring with Sentry
- Privacy-friendly analytics with Umami
- ESLint and Prettier configuration
- Git hooks with Husky
- Conventional Commits with Commitlint
- VS Code debugging configurations
- Performance budgets and bundle size monitoring
- Vercel deployment configuration and documentation
- Organized documentation in docs/ folder

### Changed

### Deprecated

### Removed

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

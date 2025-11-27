# My Portfolio

A modern, performant portfolio website showcasing my projects and skills. Built with production-grade tooling including comprehensive testing and analytics integration.

## 🌐 Live Site

**[View Portfolio](https://jpengineering.dev/)**

## ✨ Features

- **Progressive Web App (PWA)** - Installable, works offline, auto-updates
- **Responsive Design** - Mobile-first, works seamlessly on all devices
- **Accessibility First** - Built with accessibility best practices and ESLint a11y linting
- **SEO Optimized** - Dynamic meta tags, automated sitemap generation, robots.txt
- **Privacy-Friendly Analytics** - Umami integration for visitor tracking
- **Error Monitoring** - New Relic integration for real-time error tracking and performance monitoring
- **Type-Safe** - Full TypeScript coverage for robust development
- **Comprehensive Testing** - Unit and E2E tests included
- **Performance Optimized** - Strict bundle size budgets with smart caching
- **Modern Tooling** - ESLint, Prettier, Husky git hooks, and conventional commits
- **Production Ready** - Optimized for Vercel deployment with auto-deploy

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/JustinPaoletta/my_portfolio.git
cd my-portfolio
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables** (optional)
   - See [ENV.md](docs/ENV.md) for configuration details
   - Configure Umami analytics, etc.

4. **Start the development server**

```bash
npm run start:dev
```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run start:prod  # Preview production build
```

## 📜 NPM Scripts Reference

This project includes a comprehensive set of npm scripts for development, testing, building, and deployment. Here's a complete reference:

### 🏗️ Build Scripts

- **`npm run build`** - Build the project for production. Runs TypeScript compilation and Vite build.
- **`npm run build:analyze`** - Build with source maps enabled for bundle analysis. Used in conjunction with `analyze` script.
- **`npm run analyze`** - Build the project and open bundle visualizer to analyze bundle composition and identify optimization opportunities.

### 🧹 Cleanup Scripts

- **`npm run clean`** - Remove all generated files and caches: `node_modules`, `dist`, `coverage`, `.vite`, `playwright-report`, and `test-results`.
- **`npm run clean:cache`** - Remove only cache and build artifacts (keeps `node_modules`): `dist`, `coverage`, `.vite`, `playwright-report`, and `test-results`.

### 🔍 Code Quality Scripts

- **`npm run lint:ci`** - Run ESLint and Prettier in check mode (CI-friendly, exits with error if issues found).
- **`npm run lint:fix`** - Automatically fix linting and formatting issues using ESLint and Prettier.

### 🚀 Development & Preview Scripts

- **`npm run start:dev`** - Start the Vite development server with hot module replacement (HMR).
- **`npm run start:prod`** - Build the project and start a production preview server on port 4173.

### 🧪 Testing Scripts

#### Unit Tests

- **`npm test`** - Run Vitest in watch mode (re-runs tests on file changes).
- **`npm run test:unit`** - Run unit tests once and exit (used in CI and pre-push hooks).
- **`npm run test:ui`** - Open Vitest UI for interactive test running and debugging.
- **`npm run test:coverage`** - Run tests and generate coverage report (text, JSON, HTML, LCOV formats).
- **`npm run test:coverage:watch`** - Run tests with coverage in watch mode.
- **`npm run test:coverage:ui`** - Run tests with coverage and open Vitest UI.

#### End-to-End Tests

- **`npm run test:e2e`** - Run all Playwright E2E tests across configured browsers.
- **`npm run test:e2e:ui`** - Run E2E tests with Playwright UI mode for interactive debugging.
- **`npm run test:e2e:debug`** - Run E2E tests in debug mode with Playwright Inspector.

### 📊 Performance & Analysis Scripts

- **`npm run lighthouse`** - Run Lighthouse CI audits. Builds the project, starts a local server, and runs Lighthouse tests with assertions.
- **`npm run analyze`** - Build with analysis mode and open bundle visualizer (see Build Scripts above).

### 📝 SEO & Sitemap Scripts

- **`npm run sitemap:generate`** - Generate or update `sitemap.xml` and `robots.txt` files based on route configuration.

### 🏷️ Release & Versioning Scripts

- **`npm run release`** - Automatically determine version bump (patch/minor/major) based on commit messages and create a release with changelog.
- **`npm run release:patch`** - Create a patch release (0.0.X) - bug fixes.
- **`npm run release:minor`** - Create a minor release (0.X.0) - new features, backward compatible.
- **`npm run release:major`** - Create a major release (X.0.0) - breaking changes.
- **`npm run release:dry-run`** - Preview what the release would do without making any changes.

### ⚙️ Setup Scripts

- **`npm run prepare`** - Husky setup script (runs automatically after `npm install`). Initializes git hooks.

### Run Tests

```bash
npm test                  # Unit tests (watch mode)
npm run test:unit         # Unit tests (run once)
npm run test:coverage     # Tests with coverage report
npm run test:e2e          # End-to-end tests
```

### Code Quality

```bash
npm run lint:fix          # Fix linting and formatting issues
npm run analyze           # Analyze bundle size
```

### Releases & Versioning

```bash
npm run release           # Create a new release (auto-determines version)
npm run release:patch     # Patch release (0.0.X)
npm run release:minor     # Minor release (0.X.0)
npm run release:major     # Major release (X.0.0)
npm run release:dry-run   # Preview release without changes
```

See [CHANGELOG.md](CHANGELOG.md) for release history and [docs/CHANGELOG_GUIDE.md](docs/CHANGELOG_GUIDE.md) for details.

## 🛠️ Tech Stack

### Core

- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite (Rolldown)** - Lightning-fast build tool

### Testing

- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing

### Code Quality & Workflow

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files
- **Commitlint** - Conventional commit enforcement
- **standard-version** - Automated changelog and versioning

### PWA & Performance

- **vite-plugin-pwa** - Progressive Web App support
- **Workbox** - Service worker and offline caching
- **Smart Caching** - Cache-first for static, network-first for dynamic content

### Developer Experience

- **React Helmet Async** - Dynamic SEO meta tags
- **Umami** - Privacy-friendly analytics
- **New Relic Browser** - Real-time error and performance monitoring
- **VS Code Debugging** - Integrated debugging configurations

### Accessibility

- **eslint-plugin-jsx-a11y** - JSX accessibility linting

## 📚 Additional Documentation

### Development Guides

- **[VS Code Debugging Guide](docs/VSCODE_DEBUGGING.md)** - Debug configurations and workflows
- **[Git Hooks Guide](docs/GIT_HOOKS.md)** - Pre-commit, pre-push, and other hooks
- **[Commit Conventions](docs/COMMIT_CONVENTION.md)** - Git commit guidelines
- **[Changelog & Releases](docs/CHANGELOG_GUIDE.md)** - Version management with standard-version
- **[Workspace Info](docs/WORKSPACE.md)** - Project structure
- **[Dependabot Setup](docs/DEPENDABOT.md)** - Automated dependency updates
- **[Vercel Deployment](docs/VERCEL_DEPLOYMENT.md)** - Deployment configuration and best practices

### Integrations & Services

- **[PWA Guide](docs/PWA.md)** - Progressive Web App configuration, offline support, and icon setup
- **[Analytics Guide](docs/ANALYTICS.md)** - Umami integration and usage guide
- **[New Relic Setup](docs/NEWRELIC.md)** - Error monitoring and performance tracking
- **[SEO Guide](docs/SEO.md)** - SEO configuration and best practices
- **[Environment Variables](docs/ENV.md)** - Environment variable configuration and validation

### Security

- **[Content Security Policy](docs/CSP.md)** - CSP configuration and security setup

### Performance & Monitoring

- **[Performance Budget](docs/PERFORMANCE_BUDGET.md)** - Bundle size limits
- **[Bundle Size Testing](docs/BUNDLE_SIZE_TEST.md)** - Performance monitoring

## 📄 License

Private project

##Testing adding lighthouse bot on PRS

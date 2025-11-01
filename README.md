# My Portfolio

A modern, performant portfolio website showcasing my projects and skills. Built with production-grade tooling including comprehensive testing, accessibility compliance, error monitoring, and analytics integration.

## 🌐 Live Site

**[View Portfolio](https://my-portfolio-gamma-sandy-54.vercel.app/)**

## ✨ Features

- **Progressive Web App (PWA)** - Installable, works offline, auto-updates
- **Responsive Design** - Mobile-first, works seamlessly on all devices
- **Accessibility First** - WCAG 2.1 Level AA compliant with automated testing
- **SEO Optimized** - Dynamic meta tags, automated sitemap generation, robots.txt
- **Privacy-Friendly Analytics** - Umami integration for visitor tracking
- **Error Monitoring** - Sentry integration for real-time error tracking
- **Type-Safe** - Full TypeScript coverage for robust development
- **Comprehensive Testing** - Unit, E2E, and accessibility tests included
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
   - Configure Sentry, Umami analytics, etc.

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

### Run Tests

```bash
npm test                  # Unit tests (watch mode)
npm run test:unit         # Unit tests (run once)
npm run test:coverage     # Tests with coverage report
npm run test:e2e          # End-to-end tests
npm run test:a11y         # Accessibility tests
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
- **axe-core** - Accessibility testing

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
- **Sentry** - Error monitoring and performance tracking
- **Umami** - Privacy-friendly analytics
- **VS Code Debugging** - Integrated debugging configurations

### Accessibility

- **eslint-plugin-jsx-a11y** - JSX accessibility linting
- **@axe-core/playwright** - Automated a11y testing

## 📚 Additional Documentation

### Development Guides

- **[Quick Reference](docs/QUICK_REFERENCE.md)** - ⭐ Common commands and quick tips
- **[VS Code Debugging Guide](docs/VSCODE_DEBUGGING.md)** - Debug configurations and workflows
- **[Git Hooks Guide](docs/GIT_HOOKS.md)** - Pre-commit, pre-push, and other hooks
- **[Commit Conventions](docs/COMMIT_CONVENTION.md)** - Git commit guidelines
- **[Changelog & Releases](docs/CHANGELOG_GUIDE.md)** - Version management with standard-version
- **[Workspace Info](docs/WORKSPACE.md)** - Project structure
- **[Dependabot Setup](docs/DEPENDABOT.md)** - Automated dependency updates

### Integrations & Services

- **[PWA Setup](docs/PWA_SETUP.md)** - Progressive Web App configuration & offline support
- **[Sentry Setup](docs/SENTRY_SETUP.md)** - Error monitoring integration
- **[Analytics Setup](docs/ANALYTICS_SETUP.md)** - Umami integration guide
- **[SEO Guide](docs/SEO.md)** - SEO configuration

### Accessibility

- **[Accessibility Testing](docs/ACCESSIBILITY_TESTING.md)** - A11y testing strategies
- **[Accessibility Quick Reference](docs/ACCESSIBILITY_QUICK_REFERENCE.md)** - A11y best practices

### Performance & Monitoring

- **[Performance Budget](docs/PERFORMANCE_BUDGET.md)** - Bundle size limits
- **[Bundle Size Testing](docs/BUNDLE_SIZE_TEST.md)** - Performance monitoring

## 📄 License

Private project

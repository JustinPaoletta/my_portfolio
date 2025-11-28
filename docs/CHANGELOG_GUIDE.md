# Changelog & Release Management Guide

This project uses automated changelog generation with [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) (formerly standard-version) based on [Conventional Commits](https://www.conventionalcommits.org/).

## 📋 How It Works

When you make commits following the [Conventional Commits](docs/COMMIT_CONVENTION.md) format, `commit-and-tag-version` automatically:

1. **Determines version bump** based on commit types
2. **Generates changelog entries** from commit messages
3. **Updates version** in `package.json`
4. **Creates a git tag** for the release
5. **Commits changes** automatically

## 🚀 Creating a Release

### Automatic Version (Recommended)

Let `commit-and-tag-version` determine the version based on your commits:

```bash
npm run release
```

This will:

- Analyze commits since the last release
- Bump version based on commit types (feat → minor, fix → patch, BREAKING CHANGE → major)
- Update `CHANGELOG.md`
- Commit and tag the release

### Manual Version Selection

If you want to specify the version bump:

```bash
# Patch release (0.0.0 → 0.0.1)
npm run release:patch

# Minor release (0.0.0 → 0.1.0)
npm run release:minor

# Major release (0.0.0 → 1.0.0)
npm run release:major
```

### Dry Run (Preview)

Test what `commit-and-tag-version` would do without making changes:

```bash
npm run release:dry-run
```

## 📝 Commit Types & Version Bumps

| Commit Type        | Version Bump                 | Example                  |
| ------------------ | ---------------------------- | ------------------------ |
| `fix:`             | **Patch** (0.0.X)            | Bug fixes                |
| `feat:`            | **Minor** (0.X.0)            | New features             |
| `BREAKING CHANGE:` | **Major** (X.0.0)            | Breaking changes         |
| `perf:`            | **Patch** (0.0.X)            | Performance improvements |
| `refactor:`        | None (included in changelog) | Code refactoring         |
| `docs:`            | None (included in changelog) | Documentation updates    |
| `test:`            | None (included in changelog) | Test updates             |
| `style:`           | None (included in changelog) | Code styling             |
| `build:`           | None (included in changelog) | Build system changes     |
| `ci:`              | None (included in changelog) | CI/CD changes            |
| `chore:`           | None (hidden from changelog) | Maintenance tasks        |

## 🎯 Best Practices

### 1. Follow Conventional Commits

Always use the proper commit format:

```bash
# Good
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve navigation menu bug on mobile"
git commit -m "docs: update setup instructions"

# Bad (will not be included in changelog properly)
git commit -m "added some stuff"
git commit -m "bug fixes"
```

### 2. Use Scopes for Clarity

Add scopes to provide more context:

```bash
git commit -m "feat(auth): implement OAuth login"
git commit -m "fix(ui): correct button alignment in header"
git commit -m "perf(api): optimize database queries"
```

### 3. Breaking Changes

For breaking changes, use `!` or add a footer:

```bash
# Method 1: Using !
git commit -m "feat!: redesign API endpoints"

# Method 2: Using footer
git commit -m "feat: redesign API endpoints

BREAKING CHANGE: API endpoints now use /api/v2 instead of /api/v1"
```

### 4. Release Workflow

```bash
# 1. Make sure all changes are committed
git status

# 2. Run tests and linting
npm run test:coverage
npm run test:e2e
npm run lint:ci

# 3. Preview the release (optional)
npm run release:dry-run

# 4. Create the release
npm run release

# 5. Push changes and tags to remote
git push --follow-tags origin main
```

## 📖 Changelog Format

The generated changelog follows [Keep a Changelog](https://keepachangelog.com/) format with emojis for easy scanning:

```markdown
## [1.2.0] - 2024-10-31

### ✨ Features

- **auth**: implement OAuth login
- **ui**: add dark mode toggle

### 🐛 Bug Fixes

- **navigation**: resolve menu bug on mobile devices

### ⚡ Performance Improvements

- **api**: optimize database query performance

### 📚 Documentation

- update setup instructions in README
```

## 🔧 Configuration

The changelog behavior is configured in `.versionrc.json`:

- **Commit types** included in changelog
- **Section headings** with emojis
- **URL formats** for commits and comparisons
- **Hidden sections** (e.g., chore commits)

## 🚨 First Release

For the first release from version `0.0.0`:

```bash
# Create your first release
npm run release:minor  # Creates v0.1.0

# Or for a 1.0.0 release
npm run release:major  # Creates v1.0.0
```

## 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [commit-and-tag-version Documentation](https://github.com/absolute-version/commit-and-tag-version)

## 💡 Quick Reference

```bash
# Create a release (automatic version)
npm run release

# Specify version bump
npm run release:patch   # Bug fixes
npm run release:minor   # New features
npm run release:major   # Breaking changes

# Preview changes without committing
npm run release:dry-run

# Push release to remote
git push --follow-tags origin main
```

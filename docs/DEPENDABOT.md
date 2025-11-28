# Dependabot Configuration Guide

## Overview

Dependabot is configured to automatically keep your dependencies up to date by creating pull requests when new versions are available.

## Configuration Details

### Update Schedule

- **Frequency**: Weekly (every Monday at 9:00 AM EST)
- **Maximum Open PRs**: 10 at a time

### Grouped Updates

Dependencies are grouped by category to reduce PR noise and make reviews easier:

#### 1. **React Group**

- `react`, `react-dom`, and all `react-*` packages
- Keeps your React ecosystem in sync

#### 2. **Vite Group**

- `vite`, `@vitejs/*`, and `rolldown-vite`
- Keeps your build tooling in sync

#### 3. **Testing Group**

- `vitest`, `@vitest/*`
- `@testing-library/*`
- `@playwright/test`
- `jsdom`
- Keeps all testing tools together

#### 4. **Linting Group**

- `eslint`, `eslint-*`, `@eslint/*`
- `prettier`
- `typescript-eslint`
- Keeps code quality tools in sync

#### 5. **TypeScript Group**

- `typescript`
- `@types/*`
- Keeps type definitions with TypeScript version

#### 6. **Commitlint Group**

- `@commitlint/*`
- `husky`
- `lint-staged`
- Keeps Git workflow tools in sync

### Commit Message Format

All Dependabot PRs follow your conventional commit format:

- **Production dependencies**: `chore(deps): update <package>`
- **Development dependencies**: `chore(deps-dev): update <package>`

### Labels

All Dependabot PRs are automatically tagged with:

- `dependencies` - for npm updates
- `dependabot` - to identify bot-created PRs
- `github-actions` - for workflow updates (when applicable)

## Customization

### Add Reviewers/Assignees

Update these lines in `.github/dependabot.yml`:

```yaml
reviewers:
  - 'your-github-username'
assignees:
  - 'your-github-username'
```

### Change Update Frequency

Options: `daily`, `weekly`, `monthly`

```yaml
schedule:
  interval: 'weekly' # Change this
  day: 'monday' # For weekly only
```

### Adjust PR Limit

```yaml
open-pull-requests-limit: 10 # Change this number
```

### Add More Groups

To create a new group:

```yaml
groups:
  your-group-name:
    patterns:
      - 'package-name'
      - 'package-prefix-*'
```

## Best Practices

### 1. Review PRs Promptly

- Check Dependabot PRs weekly
- Review changelogs for breaking changes
- Test locally before merging

### 2. Auto-Merge for Trusted Updates ✅

Auto-merge is **enabled** via the GitHub Actions workflow at `.github/workflows/dependabot-auto-merge.yml`.

#### What Gets Auto-Merged?

The workflow automatically enables auto-merge for:

- ✅ **Patch updates** (1.0.0 → 1.0.1) - All dependencies
- ✅ **Minor updates** (1.0.0 → 1.1.0) - All dependencies
- ✅ **Major updates** (1.0.0 → 2.0.0) - Dev dependencies only

Major updates to production dependencies require manual review.

#### How It Works

1. Dependabot creates a PR
2. Workflow enables auto-merge if criteria met
3. PR merges automatically once all CI checks pass (and any required approvals are obtained)

#### Customizing Auto-Merge Rules

Edit `.github/workflows/dependabot-auto-merge.yml` to adjust what gets merged:

```yaml
# Example: Only auto-merge patch updates
if: steps.metadata.outputs.update-type == 'version-update:semver-patch'

# Example: Auto-merge all dev dependencies
if: steps.metadata.outputs.dependency-type == 'direct:development'

# Example: Never auto-merge production dependencies
if: |
  steps.metadata.outputs.dependency-type == 'direct:development' &&
  (steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
   steps.metadata.outputs.update-type == 'version-update:semver-minor')
```

#### Manual Auto-Merge (Alternative)

For individual PRs without the workflow:

```bash
# Using GitHub CLI
gh pr review <PR-NUMBER> --approve
gh pr merge <PR-NUMBER> --auto --squash

# Or enable in GitHub UI
# Go to PR → Enable auto-merge → Choose merge method
```

### 3. Security Updates

- Security updates are created immediately (not weekly)
- Review and merge these as soon as possible
- Check for breaking changes in major version bumps

### 4. Monitor CI/CD

- Ensure all tests pass before merging
- Check for deprecation warnings
- Verify the app builds successfully

## Troubleshooting

### Too Many PRs?

- Reduce `open-pull-requests-limit`
- Change schedule to `monthly`
- Add more grouping patterns

### Missing Updates?

- Check Dependabot logs in GitHub Security tab
- Verify `.github/dependabot.yml` syntax
- Ensure Dependabot is enabled in repo settings

### Conflicts?

- Rebase the PR: Comment `@dependabot rebase`
- Recreate the PR: Comment `@dependabot recreate`
- Close and ignore: Comment `@dependabot close`

## Useful Commands

Comment these on Dependabot PRs:

- `@dependabot rebase` - Rebase the PR
- `@dependabot recreate` - Recreate the PR
- `@dependabot merge` - Merge when tests pass
- `@dependabot squash and merge` - Squash and merge
- `@dependabot cancel merge` - Cancel auto-merge
- `@dependabot close` - Close the PR
- `@dependabot ignore this dependency` - Ignore future updates
- `@dependabot ignore this major version` - Ignore major version
- `@dependabot ignore this minor version` - Ignore minor version

## Repository Setup for Auto-Merge

For the auto-merge workflow to function properly, ensure these settings are configured:

### 1. Enable Required GitHub Settings

Go to **Settings → General → Pull Requests**:

- ✅ Enable "Allow auto-merge"
- ✅ Enable "Automatically delete head branches"

### 2. Branch Protection (Recommended)

Go to **Settings → Branches** → Add rule for `main`:

- ✅ Require status checks to pass before merging
- ✅ Select which checks are required (e.g., lint, test, build)
- ✅ Require branches to be up to date before merging
- ⚠️ Do NOT require pull request approvals (workflow provides approval)

### 3. Enable Dependabot

Go to **Settings → Security → Dependabot**:

- ✅ Enable "Dependabot alerts"
- ✅ Enable "Dependabot security updates"
- ✅ Enable "Dependabot version updates"

### 4. Workflow Permissions

Go to **Settings → Actions → General → Workflow permissions**:

- ✅ Select "Read and write permissions"
- ✅ Enable "Allow GitHub Actions to create and approve pull requests"

### 5. Verify Auto-Merge Setup

After pushing the workflow, test it:

```bash
# Check if workflow exists
gh workflow list

# View workflow runs
gh run list --workflow=dependabot-auto-merge.yml

# Watch for Dependabot PRs
gh pr list --author app/dependabot
```

## Resources

- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Configuration Options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [About Dependabot Security Updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)
- [Auto-merge Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)

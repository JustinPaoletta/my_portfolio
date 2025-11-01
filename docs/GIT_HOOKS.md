# Git Hooks Guide

This guide explains the Git hooks configured in this project and how to use them effectively.

## Table of Contents

- [Overview](#overview)
- [Active Hooks](#active-hooks)
- [Skipping Hooks](#skipping-hooks)
- [Recommended Optional Hooks](#recommended-optional-hooks)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks, ensuring code quality and preventing issues before they reach the repository.

### Why Git Hooks?

✅ **Catch issues early** - Find problems before code review
✅ **Enforce standards** - Consistent code style and commit messages
✅ **Prevent broken code** - Tests run before pushing
✅ **Save time** - Automatic checks reduce manual review
✅ **Build confidence** - Know your code works before sharing

## Active Hooks

### 1. Pre-Commit Hook

**Runs:** Before every commit
**File:** `.husky/pre-commit`

**What it does:**

1. ✅ TypeScript type checking (`tsc -b`)
2. ✅ Lint and format staged files (`lint-staged`)
   - ESLint auto-fix for `.ts` and `.tsx` files
   - Prettier formatting for all files

**Why it's useful:**

- Prevents committing code with type errors
- Ensures consistent code style
- Only checks files you're actually committing (fast!)

**Example output:**

```
🔍 Running TypeScript type checking...
🎨 Running lint-staged...
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

### 2. Commit-Msg Hook

**Runs:** After writing commit message
**File:** `.husky/commit-msg`

**What it does:**

- ✅ Validates commit message format with Commitlint
- Enforces [Conventional Commits](https://www.conventionalcommits.org/) format

**Valid formats:**

```bash
feat: add user authentication
fix: resolve navigation bug
docs: update README
style: format code
refactor: reorganize components
test: add unit tests for Auth
chore: update dependencies
```

**Why it's useful:**

- Consistent commit history
- Automatic changelog generation
- Easy to understand project history
- Better collaboration

**Example error:**

```
⧗ input: bad commit message
✖ subject may not be empty [subject-empty]
✖ type may not be empty [type-empty]
```

### 3. Pre-Push Hook

**Runs:** Before every push
**File:** `.husky/pre-push`

**What it does:**

1. ✅ TypeScript type checking
2. ✅ Run all unit tests (`npm run test:unit`)
3. ✅ Run all E2E tests (`npm run test:e2e`)

**Why it's useful:**

- Prevents pushing broken code
- Catches test failures before CI/CD
- Ensures code quality in remote repository
- Saves CI/CD minutes

**Example output:**

```
🔍 Running TypeScript type checking...
🧪 Running unit tests...
✓ src/App.test.tsx (1 test) 234ms

Test Files  1 passed (1)
Tests  1 passed (1)

🎭 Running E2E tests...
Running 3 tests using 3 workers
✓ 3 passed (3.2s)

✅ All checks passed! Proceeding with push...
```

**⚠️ Note:** This hook can take 30-60 seconds. If you need to skip it (emergency fix), see [Skipping Hooks](#skipping-hooks).

## Skipping Hooks

### When to Skip

⚠️ **Only skip hooks when:**

- Emergency hotfix needed immediately
- Working on WIP branch (not main)
- Hook is incorrectly failing (bug in tests)
- You're aware of and will fix the issues

❌ **Never skip hooks when:**

- Pushing to main/master
- Creating a pull request
- "Just this once" (that becomes a habit)

### How to Skip

#### Skip Pre-Commit

```bash
git commit --no-verify -m "emergency: fix critical bug"
# or
git commit -n -m "emergency: fix critical bug"
```

#### Skip Pre-Push

```bash
git push --no-verify
# or
git push -n
```

#### Skip All Hooks Temporarily

```bash
# Disable Husky temporarily
HUSKY=0 git commit -m "message"
HUSKY=0 git push
```

### Alternative: Run Specific Tests

Instead of skipping, you might want to run tests manually first:

```bash
# Run only unit tests (faster)
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run specific test file
npm run test src/components/MyComponent.test.tsx
```

## Recommended Optional Hooks

Here are additional hooks you might want to add:

### Post-Merge Hook

**Purpose:** Update dependencies after pulling changes

**Create:** `.husky/post-merge`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check if package-lock.json changed
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep --quiet "package-lock.json"; then
  echo "📦 package-lock.json changed. Running npm install..."
  npm install
fi
```

**Enable:**

```bash
chmod +x .husky/post-merge
```

**Why it's useful:**

- Automatically installs new dependencies after pull/merge
- Prevents "Module not found" errors
- Keeps your node_modules in sync

### Post-Checkout Hook

**Purpose:** Clean up after switching branches

**Create:** `.husky/post-checkout`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Only run on branch checkout (not file checkout)
if [ "$3" == "1" ]; then
  echo "🧹 Switched branches. Checking for dependency changes..."

  # Check if package-lock.json changed
  if git diff --name-only $1 $2 | grep --quiet "package-lock.json"; then
    echo "📦 Dependencies changed. Running npm install..."
    npm install
  fi
fi
```

**Enable:**

```bash
chmod +x .husky/post-checkout
```

**Why it's useful:**

- Automatically handles dependency changes when switching branches
- Prevents working with outdated dependencies

### Pre-Rebase Hook

**Purpose:** Ensure clean state before rebasing

**Create:** `.husky/pre-rebase`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ You have uncommitted changes. Commit or stash them before rebasing."
  exit 1
fi

echo "✅ Working directory is clean. Proceeding with rebase..."
```

**Enable:**

```bash
chmod +x .husky/pre-rebase
```

**Why it's useful:**

- Prevents messy rebases
- Ensures you don't lose work

### Prepare-Commit-Msg Hook

**Purpose:** Auto-add branch name or ticket number to commits

**Create:** `.husky/prepare-commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

BRANCH_NAME=$(git symbolic-ref --short HEAD)
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only add branch name for regular commits (not merges, rebases, etc.)
if [ -z "$COMMIT_SOURCE" ]; then
  # Extract ticket number from branch (e.g., feature/PROJ-123-description)
  TICKET=$(echo "$BRANCH_NAME" | grep -o -E "[A-Z]+-[0-9]+")

  if [ -n "$TICKET" ]; then
    # Prepend ticket number if not already in message
    if ! grep -q "$TICKET" "$COMMIT_MSG_FILE"; then
      sed -i.bak -e "1s/^/$TICKET: /" "$COMMIT_MSG_FILE"
    fi
  fi
fi
```

**Enable:**

```bash
chmod +x .husky/prepare-commit-msg
```

**Why it's useful:**

- Automatically links commits to tickets/issues
- Improves traceability
- Saves typing

### Lighter Pre-Push Hook

If the full pre-push hook is too slow, here's a lighter version:

**Create:** `.husky/pre-push.light` (rename to `pre-push` to use)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running TypeScript type checking..."
tsc -b || {
  echo "❌ TypeScript compilation failed."
  exit 1
}

echo "🧪 Running unit tests..."
npm run test:unit || {
  echo "❌ Unit tests failed."
  exit 1
}

echo "✅ Quick checks passed! (Skipping E2E for speed)"
echo "💡 Run 'npm run test:e2e' before creating PR"
```

**Why it's useful:**

- Faster feedback (10-15 seconds vs 60 seconds)
- Still catches most issues
- Good for frequent pushes to feature branches

## Troubleshooting

### Hook Not Running

**Problem:** Git hook doesn't execute

**Solutions:**

1. Check if Husky is installed:

   ```bash
   npm run prepare
   ```

2. Verify hook is executable:

   ```bash
   ls -la .husky/
   chmod +x .husky/pre-commit
   chmod +x .husky/commit-msg
   chmod +x .husky/pre-push
   ```

3. Check Husky is initialized:
   ```bash
   ls -la .git/hooks/
   # Should see symlinks to .husky
   ```

### Hook Fails Incorrectly

**Problem:** Hook fails but code is fine

**Solutions:**

1. Run the commands manually to see the actual error:

   ```bash
   tsc -b
   npm run test:unit
   npm run test:e2e
   ```

2. Check if dependencies are installed:

   ```bash
   npm install
   ```

3. Clear caches:

   ```bash
   # Clear TypeScript cache
   rm -rf node_modules/.cache

   # Clear test cache
   npm run test -- --clearCache
   ```

### Hook is Too Slow

**Problem:** Pre-push takes too long

**Solutions:**

1. **Skip E2E tests locally** (run in CI instead):
   - Edit `.husky/pre-push` and comment out E2E tests
   - Or use the [lighter version](#lighter-pre-push-hook)

2. **Run tests in parallel** (already configured in this project)

3. **Use `--no-verify` for WIP branches:**

   ```bash
   git push --no-verify
   ```

4. **Only run changed tests:**
   ```bash
   # In .husky/pre-push, replace test:unit with:
   npm run test -- --changed
   ```

### Tests Pass Locally but Fail in Hook

**Problem:** Different results in terminal vs hook

**Solutions:**

1. Environment variables might be missing:

   ```bash
   # Check .env file exists and is loaded
   cat .env
   ```

2. Different Node version:

   ```bash
   node --version
   # Should match the version in package.json engines field
   ```

3. Clean install:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Commit Message Format Issues

**Problem:** Commitlint rejects valid-looking messages

**Solutions:**

1. Check exact format requirements:

   ```bash
   npx commitlint --help
   ```

2. Common mistakes:

   ```bash
   # ❌ Wrong - Capital letter
   Fix: bug in header

   # ✅ Correct
   fix: bug in header

   # ❌ Wrong - No colon
   fix bug in header

   # ✅ Correct
   fix: bug in header
   ```

3. See all valid types:
   ```bash
   cat commitlint.config.js
   ```

## Best Practices

### 1. Don't Fight the Hooks

❌ **Bad:** Constantly using `--no-verify`
✅ **Good:** Fix the underlying issue

If hooks are annoying, they're telling you something. Listen!

### 2. Keep Hooks Fast

- Pre-commit: < 5 seconds
- Commit-msg: < 1 second
- Pre-push: < 60 seconds

If hooks are too slow, developers will skip them.

### 3. Run Expensive Checks in CI

**In hooks (fast):**

- Type checking
- Linting staged files
- Unit tests

**In CI only (slow):**

- Full test suite with coverage
- Bundle size analysis
- Security audits
- E2E tests on multiple browsers

### 4. Make Hooks Informative

Good error messages help developers fix issues:

```bash
# ❌ Bad
Tests failed

# ✅ Good
❌ Unit tests failed. Fix the tests before pushing.
💡 Tip: Run 'npm run test' to see details
💡 Or skip with 'git push --no-verify' (not recommended)
```

### 5. Use --no-verify Responsibly

It's there for a reason, but use it sparingly:

```bash
# Acceptable
git push --no-verify  # On feature branch, will fix before PR

# Not acceptable
git push --no-verify  # Pushing directly to main
```

### 6. Document Your Workflow

Tell your team:

- What hooks run and when
- How long they take
- When it's okay to skip
- What happens in CI

### 7. Keep Hooks Updated

As your project grows, adjust hooks:

- Add new checks
- Remove outdated ones
- Optimize slow ones
- Balance speed vs thoroughness

## Hook Configuration Files

### Husky Files

- **`.husky/pre-commit`** - Runs before commit
- **`.husky/commit-msg`** - Validates commit message
- **`.husky/pre-push`** - Runs before push
- **`.husky/_/`** - Husky internals (don't modify)

### Related Config

- **`commitlint.config.js`** - Commit message rules
- **`.lintstagedrc`** or `package.json` - Lint-staged config
- **`package.json` → `lint-staged`** - Files to lint on commit

## Disabling Hooks Entirely

### Temporarily (Per Command)

```bash
HUSKY=0 git commit -m "message"
HUSKY=0 git push
```

### Permanently (Not Recommended)

```bash
# Remove prepare script from package.json
# Then:
rm -rf .husky
```

⚠️ **Warning:** Only do this if you have a good reason. Hooks exist to help you!

## CI/CD Integration

Hooks complement CI/CD, not replace it:

**Hooks (local):**

- Fast feedback
- Prevent obvious mistakes
- Run on every commit/push

**CI/CD (server):**

- Full test suite
- Multiple environments
- Deploy artifacts
- Final gatekeeper

**Best practice:** Run the same checks in both places.

## Resources

- **[Husky Documentation](https://typicode.github.io/husky/)**
- **[Commitlint Documentation](https://commitlint.js.org/)**
- **[Conventional Commits](https://www.conventionalcommits.org/)**
- **[lint-staged](https://github.com/okonet/lint-staged)**
- **[Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)**

## Quick Reference

### Commands

```bash
# Run hooks manually
npm run prepare              # Initialize Husky
npx lint-staged             # Run lint-staged
npx commitlint --edit       # Check last commit message

# Skip hooks
git commit --no-verify      # Skip pre-commit & commit-msg
git push --no-verify        # Skip pre-push
HUSKY=0 git commit         # Disable all hooks

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Hook Execution Order

```
git commit
  ↓
  pre-commit (type check + lint staged files)
  ↓
  [you write commit message]
  ↓
  commit-msg (validate message format)
  ↓
  ✅ Commit created

git push
  ↓
  pre-push (type check + unit tests + E2E tests)
  ↓
  ✅ Push to remote
```

---

**Remember:** Hooks are your friends! They catch issues before they become problems. Embrace them! 🎣

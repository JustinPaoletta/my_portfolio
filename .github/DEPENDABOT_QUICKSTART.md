# Dependabot Quick Start Guide 🚀

## ⚡ Auto-Merge is Enabled

Your repository is configured to automatically merge trusted Dependabot updates!

### What Gets Auto-Merged? ✅

| Update Type               | Production Deps | Dev Deps |
| ------------------------- | --------------- | -------- |
| **Patch** (1.0.0 → 1.0.1) | ✅ Auto         | ✅ Auto  |
| **Minor** (1.0.0 → 1.1.0) | ✅ Auto         | ✅ Auto  |
| **Major** (1.0.0 → 2.0.0) | ⚠️ Manual       | ✅ Auto  |

### Required One-Time Setup (GitHub UI)

#### Step 1: Enable Auto-Merge Feature

**Settings → General → Pull Requests**

- ☐ Enable "Allow auto-merge"
- ☐ Enable "Automatically delete head branches"

#### Step 2: Configure Actions Permissions

**Settings → Actions → General → Workflow permissions**

- ☐ Select "Read and write permissions"
- ☐ Enable "Allow GitHub Actions to create and approve pull requests"

#### Step 3: Enable Dependabot

**Settings → Security → Dependabot**

- ☐ Enable "Dependabot alerts"
- ☐ Enable "Dependabot security updates"
- ☐ Enable "Dependabot version updates"

#### Step 4: Branch Protection (Optional but Recommended)

**Settings → Branches → Add rule for `main`**

- ☐ Require status checks to pass before merging
- ☐ Select required checks (tests, lint, build)
- ☐ Require branches to be up to date
- ⚠️ **Do NOT** require pull request approvals

### Pushing to GitHub

```bash
# Add all Dependabot files
git add .github/

# Commit with conventional format
git commit -m "chore: add dependabot auto-merge configuration"

# Push to GitHub
git push origin main
```

## 🎯 How It Works

1. **Monday 9 AM EST** - Dependabot checks for updates
2. **PR Created** - Dependabot opens a PR with grouped updates
3. **Auto-Approve** - Workflow approves if it meets criteria
4. **CI Runs** - Your tests, linting, and builds run
5. **Auto-Merge** - PR merges automatically if all checks pass ✅

## 🛡️ Safety Features

- **Tests must pass** - Auto-merge only happens after all CI checks pass
- **Manual review for major prod updates** - Breaking changes need your review
- **Cancel anytime** - Comment `@dependabot cancel merge` to stop auto-merge
- **Full audit trail** - All auto-merges are logged and visible

## 📝 Common Commands

Comment these on any Dependabot PR:

| Command                                 | Action                    |
| --------------------------------------- | ------------------------- |
| `@dependabot cancel merge`              | Stop auto-merge           |
| `@dependabot rebase`                    | Rebase the PR             |
| `@dependabot recreate`                  | Recreate the PR           |
| `@dependabot ignore this dependency`    | Never update this package |
| `@dependabot ignore this major version` | Skip this major version   |

## 🔧 Customization

### Make Auto-Merge More Conservative

Edit `.github/workflows/dependabot-auto-merge.yml` line 27:

```yaml
# Only patch updates
if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
```

### Make Auto-Merge More Aggressive

```yaml
# Everything except major prod deps
if: |
  steps.metadata.outputs.update-type != 'version-update:semver-major' ||
  steps.metadata.outputs.dependency-type == 'direct:development'
```

### Disable Auto-Merge

```bash
# Delete or rename the workflow file
mv .github/workflows/dependabot-auto-merge.yml .github/workflows/dependabot-auto-merge.yml.disabled
```

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check workflow is present
gh workflow list | grep dependabot

# 2. View Dependabot PRs
gh pr list --author app/dependabot

# 3. Check if auto-merge is enabled on a PR
gh pr view <PR-NUMBER> --json autoMergeRequest

# 4. Watch workflow runs
gh run watch
```

## 📚 More Info

See `DEPENDABOT.md` for detailed documentation and troubleshooting.

---

**💡 Tip**: The first Dependabot PRs will come on Monday. You can trigger one manually by changing a version in `package.json` and letting Dependabot detect it, or wait for the scheduled run.

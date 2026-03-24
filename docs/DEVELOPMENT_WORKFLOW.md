# Development Workflow

This repo uses Husky, commitlint, Conventional Commits, and Changesets to keep local checks, commit history, and releases aligned.

## Source of Truth

- `.husky/`
- `commitlint.config.js`
- `.changeset/config.json`
- `.github/workflows/changeset-required.yml`
- `.github/workflows/release.yml`
- `.github/release.yml`
- `package.json`

## Git Hooks

Husky is enabled through the `prepare` script in `package.json`.

### `.husky/pre-commit`

Runs:

1. `tsc -b`
2. `npx lint-staged`

That means staged TypeScript files are linted and formatted before the commit is created.

### `.husky/commit-msg`

Runs:

- `npx --no -- commitlint --edit $1`

This enforces the Conventional Commit rules from `commitlint.config.js`.

### `.husky/pre-push`

The default pre-push hook is the light version. It runs:

1. `tsc -b`
2. `npm run build`
3. `npm run test:unit`

Because `npm run build` already includes the production build, contrast check, sitemap generation, prerendering, and bundle-size enforcement, this catches most deployment-breaking issues.

### `.husky/pre-push.full`

The stricter optional variant also runs:

- `npm run lint:fix`
- `npm run test:e2e`

Use it before a high-risk push or when you want near-CI confidence.

### Swapping hooks locally

The repo does not keep a checked-in `.husky/pre-push.light` file, so create your own temporary backup first:

```bash
cp .husky/pre-push .husky/pre-push.light.local
cp .husky/pre-push.full .husky/pre-push
```

To restore the default light hook:

```bash
cp .husky/pre-push.light.local .husky/pre-push
```

If you do not want to swap files, keep the light hook active and run `npm run test:e2e` manually.

### Skipping hooks

Use `--no-verify` sparingly:

```bash
git commit --no-verify -m "docs: emergency wording fix"
git push --no-verify
```

Reasonable cases:

- the hook itself is broken
- you are pushing temporary WIP to a personal branch
- you have already run the equivalent checks manually

If hooks stop running entirely, reinstall Husky with:

```bash
npm run prepare
```

## Commit Convention

The enforced format is:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Supported commit types

| Type       | Purpose                           |
| ---------- | --------------------------------- |
| `feat`     | new feature                       |
| `fix`      | bug fix                           |
| `docs`     | documentation-only change         |
| `style`    | formatting and style-only change  |
| `refactor` | non-feature, non-fix code change  |
| `perf`     | performance improvement           |
| `test`     | test additions or updates         |
| `build`    | build system or dependency change |
| `ci`       | CI configuration change           |
| `chore`    | maintenance work                  |
| `revert`   | revert a previous commit          |

### Subject rules

- use imperative present tense
- keep the first letter lowercase
- do not end with a period
- keep the header within 100 characters

Examples:

```bash
feat(auth): add OAuth login
fix(ui): handle null response in theme switcher
docs(readme): update local setup instructions
```

Breaking changes can use `!` or a `BREAKING CHANGE:` footer.

Conventional Commits are still required, but they no longer drive version bumps directly. Version bumps come from committed changeset files.

## Changesets

Every normal PR into `master` must include a `.changeset/*.md` file. Create one with:

```bash
npm run changeset
```

Choose:

- `patch` for bug fixes and small dependency updates
- `minor` for backward-compatible features
- `major` for breaking changes

The PR check in `.github/workflows/changeset-required.yml` enforces this for normal PRs. The bot-generated release PR is exempt.

To preview the local versioning result without opening a release PR, run:

```bash
npm run version-packages
```

That updates `package.json`, `package-lock.json`, and `CHANGELOG.md` based on pending changesets.

## Releases & Changelog

Releases now use the standard Changesets release PR flow on `master`.

### Normal release flow

1. Open a feature PR with a `.changeset/*.md` file.
2. Merge the PR into `master`.
3. `.github/workflows/release.yml` opens or updates the release PR titled `chore(release): version packages`.
4. Review that release PR and merge it manually.
5. The same workflow creates the bare semver tag and the GitHub Release with generated notes if that version does not already exist.

Tags stay in bare semver format such as `1.1.0` and `1.1.1`.

`CHANGELOG.md` remains checked in, but Changesets owns future release entries after the manual `1.1.0` normalization release.

### Manual release checklist

```bash
git checkout master
git pull
npm run lint:ci
npm run test:coverage
npm run test:e2e
```

After those checks pass, merge the open release PR from GitHub.

## Why This Workflow Exists

- hooks catch local issues before code review or CI
- Conventional Commits keep history readable and machine-validated
- Changesets makes semver intent explicit on each PR
- release PRs keep version bumps, changelog updates, tags, and GitHub Releases consistent

## Related Files

- `.changeset/config.json`
- `.github/release.yml`
- `.github/workflows/changeset-required.yml`
- `.github/workflows/release.yml`
- `.github/workflows/dependabot-changeset.yml`
- `.husky/pre-commit`
- `.husky/commit-msg`
- `.husky/pre-push`
- `.husky/pre-push.full`
- `commitlint.config.js`
- `CHANGELOG.md`

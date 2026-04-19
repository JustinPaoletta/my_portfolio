# Development Workflow

This repo uses Husky, commitlint, Conventional Commits, and a manual changelog-driven release process.

## Source Of Truth

- `.husky/`
- `commitlint.config.js`
- `package.json`
- [`CHANGELOG.md`](../CHANGELOG.md)
- [`RELEASE.md`](../RELEASE.md)

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

The default pre-push hook runs:

1. `tsc -b`
2. `npm run build`
3. `npm run test:unit`

Because `npm run build` already includes the production build, contrast check, sitemap generation, and prerendering, this catches most deployment-breaking issues before the push leaves your machine.

### `.husky/pre-push.full`

The stricter optional variant also runs:

- `npm run lint:fix`
- `npm run test:e2e`

Use it before a high-risk push or when you want near-CI confidence.

### Swapping Hooks Locally

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

### Skipping Hooks

Use `--no-verify` sparingly:

```bash
git commit --no-verify -m "docs: emergency wording fix"
git push --no-verify
```

Reasonable cases:

- the hook itself is broken
- you are pushing temporary work to a personal branch
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

### Supported Commit Types

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

### Subject Rules

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

## Changelog Maintenance

`CHANGELOG.md` is the release source of truth.

- Keep `## [Unreleased]` at the top of the file.
- Add concise, human-written notes for user-visible or operator-visible changes.
- Use the release categories already established in the changelog: `Added`, `Changed`, `Fixed`, `Removed`, `Security`, and `Documentation`.
- Do not depend on release automation. Update `CHANGELOG.md` directly and cut release branches manually.
- Routine dependency upgrades are manual. Dependabot is intentionally limited to security-update PRs.

## Manual Releases

Releases now follow the root [`RELEASE.md`](../RELEASE.md) checklist.

The short version is:

1. Merge normal work into the protected default branch.
2. Keep `CHANGELOG.md` current under `Unreleased`.
3. Cut `release/vX.Y.Z` from the default branch when you are ready to ship.
4. Finalize the version bump and release notes on that release branch.
5. Run the release validation commands.
6. Merge the release branch back into the default branch.
7. Tag the merge commit as `vX.Y.Z` and publish the GitHub release from the matching changelog section.

## Release Prep Commands

Use these as the local baseline before opening a release PR:

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

For visual or performance-sensitive releases, also run:

```bash
npm run test:visual
npm run lighthouse
```

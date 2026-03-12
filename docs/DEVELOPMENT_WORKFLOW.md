# Development Workflow

This repo uses Husky, commitlint, Conventional Commits, and `commit-and-tag-version` to keep local checks, commit history, and releases aligned.

## Source of Truth

- `.husky/`
- `commitlint.config.js`
- `.versionrc.json`
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

## Releases & Changelog

The repo uses `commit-and-tag-version` to:

1. determine the version bump from commit history
2. update `CHANGELOG.md`
3. update `package.json` and `package-lock.json`
4. create the release commit
5. create the git tag

Release metadata is created from `main` or `master`, not from normal feature branches.

### Release commands

```bash
npm run release
npm run release:patch
npm run release:minor
npm run release:major
npm run release:dry-run
```

### Typical release flow

```bash
git checkout <default-branch>
git pull
git status
npm run test:coverage
npm run test:e2e
npm run lint:ci
npm run release:dry-run
npm run release
git push --follow-tags origin <default-branch>
```

### How commit types affect versions

- `fix` and `perf` contribute patch releases
- `feat` contributes minor releases
- `BREAKING CHANGE` contributes major releases
- other supported types can still appear in the changelog depending on `.versionrc.json`

## Why This Workflow Exists

- hooks catch local issues before code review or CI
- Conventional Commits keep history machine-readable
- release tooling can generate consistent versions and changelogs from that history

## Related Files

- `.husky/pre-commit`
- `.husky/commit-msg`
- `.husky/pre-push`
- `.husky/pre-push.full`
- `commitlint.config.js`
- `.versionrc.json`
- `CHANGELOG.md`

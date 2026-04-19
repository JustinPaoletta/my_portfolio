# Dependabot Policy

## Overview

This repository uses Dependabot for security remediation only.

- Routine version-update PRs are intentionally disabled.
- Dependabot may still open PRs immediately for vulnerable npm dependencies and vulnerable GitHub Actions versions.
- Non-security dependency refreshes are done manually in normal branches and PRs.

## Source Of Truth

- [`.github/dependabot.yml`](../.github/dependabot.yml)
- [`.github/workflows/dependabot-auto-merge.yml`](../.github/workflows/dependabot-auto-merge.yml)

## How The Config Works

Each configured ecosystem keeps a `schedule` block because GitHub requires one, but the effective policy comes from:

```yaml
open-pull-requests-limit: 0
```

That setting disables Dependabot version-update PRs for the ecosystem while still allowing Dependabot security updates.

This repo currently applies that policy to:

- `npm`
- `github-actions`

Security PRs are grouped with:

- `npm-security-updates`
- `github-actions-security-updates`

Those groups keep related security fixes together without reopening routine upgrade noise.

## Important Guardrail

Do not add version-range `ignore` rules unless you explicitly want to suppress security PRs too.

GitHub applies dependency and version ignore rules to both version updates and security updates. In this repo, compatibility holds for routine upgrades should be handled manually, not by hiding potential security fixes from Dependabot.

## Auto-Merge Automation

The workflow at [`.github/workflows/dependabot-auto-merge.yml`](../.github/workflows/dependabot-auto-merge.yml):

- runs on `pull_request_target` so the GitHub token can actually enable auto-merge for Dependabot PRs
- only acts on PRs opened by `dependabot[bot]`
- only enables auto-merge when the PR matches one of the configured security-update groups
- uses squash merge after the repository's required checks pass

If a security PR should not merge automatically, comment:

```text
@dependabot cancel merge
```

Useful comment commands:

- `@dependabot rebase`
- `@dependabot recreate`
- `@dependabot close`
- `@dependabot ignore this dependency`

## Repository Settings

For the policy to work as intended, GitHub should have:

- Dependency graph enabled
- Dependabot alerts enabled
- Dependabot security updates enabled
- Allow auto-merge enabled
- GitHub Actions workflow permissions set to read and write
- "Allow GitHub Actions to create and approve pull requests" enabled

Branch protection on the default branch should continue to require the normal CI checks before merge.

## Operational Notes

- Security PRs can still be major-version jumps if that is the first safe version.
- After merging a noteworthy security fix, add a short note to [`CHANGELOG.md`](../CHANGELOG.md) under `## [Unreleased]`.
- If you want a routine dependency refresh, open a normal branch and PR instead of relaxing the Dependabot policy.

## Verification

After pushing changes to the policy, check:

```bash
gh workflow list
gh run list --workflow=dependabot-auto-merge.yml
gh pr list --author "dependabot[bot]"
```

## References

- [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
- [Configuring Dependabot security updates](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configuring-dependabot-security-updates)
- [dependabot/fetch-metadata](https://github.com/dependabot/fetch-metadata)

# Environment Setup for CI/CD

This document explains how environment variables are configured for continuous integration and deployment.

## Overview

The application requires certain environment variables to be set before it can build or run. To ensure tests pass in CI environments, we provide a `.env.test` file with safe default values.

## Environment Files

### `.env.example`

- Template file showing all available environment variables
- Copy this to `.env.local` for local development
- Fill in with your actual values
- Committed to git for reference

### `.env.test`

- Test environment configuration used in CI/CD
- Contains safe placeholder values
- Allows builds and tests to run without real credentials
- **Committed to git** (safe - contains no real secrets)

### `.env.local`

- Your personal environment configuration
- **Never committed to git** (gitignored)
- Create from `.env.example`

## Required Environment Variables

The following environment variables are **required** for the app to build:

| Variable               | Purpose           | Example                              |
| ---------------------- | ----------------- | ------------------------------------ |
| `VITE_APP_TITLE`       | Application title | `"My Portfolio"`                     |
| `VITE_APP_DESCRIPTION` | Meta description  | `"Portfolio website"`                |
| `VITE_API_URL`         | Backend API URL   | `"https://api.example.com"`          |
| `VITE_GITHUB_URL`      | GitHub profile    | `"https://github.com/username"`      |
| `VITE_LINKEDIN_URL`    | LinkedIn profile  | `"https://linkedin.com/in/username"` |
| `VITE_EMAIL`           | Contact email     | `"you@example.com"`                  |

## CI/CD Setup

### GitHub Actions

The CI workflows automatically copy `.env.test` to `.env.local` before building:

```yaml
- name: Set up test environment variables
  run: cp .env.test .env.local
```

This ensures:

- ✅ Tests can run without manual configuration
- ✅ No real secrets are exposed in CI logs
- ✅ Builds are reproducible across environments

### Local Testing

To test with the same environment as CI:

```bash
# Copy test environment
cp .env.test .env.local

# Run tests
npm run test:unit
npm run test:e2e
npm run test:a11y

# Build
npm run build
```

## Security Notes

### What's Safe to Commit

✅ `.env.example` - Template with example values
✅ `.env.test` - Test placeholders (no real credentials)

### What's NEVER Committed

❌ `.env` - May contain real secrets
❌ `.env.local` - Your personal configuration
❌ `.env.*.local` - Any local overrides

## Troubleshooting

### CI Fails with "Environment validation failed"

**Cause:** Required environment variables are missing.

**Solution:** Ensure `.env.test` exists and is committed to your repository.

### App Won't Build Locally

**Cause:** No environment file found.

**Solution:**

```bash
# Quick setup with test values
cp .env.test .env.local

# OR for real development, use the example
cp .env.example .env.local
# Then edit .env.local with your actual values
```

### "Invalid environment variables" Error

**Cause:** Environment variables don't pass validation rules.

**Solution:** Check `src/config/env.ts` for validation requirements. Common issues:

- URLs must be valid and start with `http://` or `https://`
- Email must be properly formatted
- GitHub/LinkedIn URLs must point to those domains

## Related Documentation

- [ENV.md](./ENV.md) - Complete environment variable reference
- [ENV_VALIDATION.md](./ENV_VALIDATION.md) - Validation rules and schema
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Production environment setup

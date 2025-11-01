# Environment Setup for CI/CD

This document explains how environment variables are configured for continuous integration and deployment.

## Overview

The application requires certain environment variables to be set before it can build or run. For CI/CD environments, set these variables directly in your platform's configuration (GitHub Secrets, Vercel Environment Variables, etc.).

## Environment Files

### Committed Files (Safe to Share)

- **`.env.example`** - Template file with all available variables and documentation
  - ✅ Committed to git
  - Contains placeholder values only
  - Copy this to create your local `.env`

- **`.env.test`** - Test configuration with safe placeholder values
  - ✅ Committed to git
  - Used by CI/CD for automated testing
  - Contains safe test values only

### Local Development Files (Gitignored)

- **`.env`** - Your personal development environment variables
  - ❌ Not committed to git (gitignored)
  - Create by copying `.env.example`
  - Contains your actual development values

- **`.env.prod`** - Local copy of Vercel production variables (optional)
  - ❌ Not committed to git (gitignored)
  - Keeps a local reference of production environment variables set in Vercel
  - Useful for comparing local vs. production configuration
  - **Never committed** - production secrets stay in Vercel

**Note:** This project keeps it simple for solo development - just copy `.env.example` to `.env` and update the values.

### CI/CD Environments

The CI workflows can use `.env.test` or set variables directly via GitHub Actions secrets:

```bash
# Option 1: Use the committed .env.test file
cp .env.test .env

# Option 2: Set variables in GitHub Secrets
```

### Production (Vercel)

- Environment variables configured directly in Vercel dashboard
- See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for setup instructions

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

The CI workflows can use the committed `.env.test` file:

```yaml
- name: Set up test environment variables
  run: cp .env.test .env
```

Or set environment variables using GitHub Secrets for production-like testing:

```yaml
env:
  VITE_APP_TITLE: ${{ secrets.VITE_APP_TITLE }}
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
  # ... other variables
```

This ensures:

- ✅ Tests can run using the committed `.env.test` file
- ✅ No real secrets are exposed in repository
- ✅ Builds are reproducible across environments

### Local Testing

To test with the same environment as CI:

```bash
# Copy test environment
cp .env.test .env

# Run tests
npm run test:unit
npm run test:e2e
npm run test:a11y

# Build
npm run build
```

For development with real values:

```bash
# Copy example and update with your values
cp .env.example .env
# Then edit .env with your actual configuration
```

## Security Notes

### What's Committed (Safe to Share)

✅ `.env.example` - Template with placeholder values (committed)
✅ `.env.test` - Test configuration with safe placeholders (committed)

### What's NEVER Committed

❌ `.env` - Your personal development environment variables (gitignored)
❌ `.env.prod` - Local copy of Vercel production variables (gitignored)
❌ **Any file containing real secrets or credentials**

**Note:** `.env.prod` is a convenience file for keeping a local reference of production environment variables that are set in Vercel. The actual production variables are configured in Vercel's dashboard.

### How to Handle Environment Variables

✅ **Development:** Copy `.env.example` to `.env` and update with your values
✅ **CI/CD:** Use the committed `.env.test` file or GitHub Secrets
✅ **Production:** Configure variables directly in Vercel dashboard
✅ **Testing:** Copy `.env.test` to `.env` for safe test values

## Troubleshooting

### CI Fails with "Environment validation failed"

**Cause:** Required environment variables are missing.

**Solution:** Ensure `.env.test` exists or set variables in GitHub Actions secrets.

### App Won't Build Locally

**Cause:** No `.env` file found.

**Solution:** Copy the example template and customize:

```bash
# Quick setup with example template
cp .env.example .env
# Then edit .env with your actual values

# OR for testing with safe values
cp .env.test .env
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

# Environment Variables Guide

This project uses environment variables for configuration with **runtime validation using Valibot**. Vite exposes environment variables through `import.meta.env`, and all values are validated for format and correctness at startup.

## 📁 Files

- **`.env.example`** - Template file with all available variables (✅ committed to git)
- **`.env`** - Your local development environment variables (gitignored)

**Note:** All `.env*` files are gitignored **except** `.env.example` which is committed to provide a template.

## 🚀 Getting Started

1. **Copy the example file:**

   ```bash
   cp .env.example .env
   ```

2. **Update the values** in `.env` with your actual configuration

3. **Restart your dev server** for changes to take effect

## 📝 Environment Variable Naming

All environment variables must be prefixed with `VITE_` to be exposed to your application:

- ✅ `VITE_API_URL` - Exposed to the app
- ❌ `API_URL` - Not exposed to the app

## 🔧 Available Variables

### App Configuration (Required)

```bash
# 1-100 characters, cannot be empty
VITE_APP_TITLE=JP - Engineering

# 1-500 characters, cannot be empty
VITE_APP_DESCRIPTION=My personal portfolio website

# App version in semver format (Optional, defaults to 1.0.0)
VITE_APP_VERSION=1.0.0
```

**Validation:**

- Title: 1-100 characters
- Description: 1-500 characters
- Version: Must be in semver format (e.g., `1.0.0`, `2.1.3`) or defaults to `1.0.0`

### API Configuration (Required)

```bash
# Must be a valid URL starting with http:// or https://
VITE_API_URL=http://localhost:3000/api

# Timeout in milliseconds, must be between 1000-60000 (1-60 seconds)
# Optional, defaults to 5000
VITE_API_TIMEOUT=5000
```

**Validation:**

- URL: Must be valid URL format (http:// or https://)
- Timeout: Must be 1000-60000 (defaults to 5000)

### Feature Flags (Optional)

```bash
# Use 'true'/'false' or '1'/'0'
# Defaults to false if not specified
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ERROR_MONITORING=false
```

**Validation:**

- Accepts: `true`, `false`, `1`, `0`
- Defaults to `false`

### Third-party Services (Optional)

```bash
# Google Analytics ID - format: G-XXXXXXXXXX or UA-XXXXXX-X
VITE_GOOGLE_ANALYTICS_ID=G-ABC123XYZ

# Mapbox token - any non-empty string
VITE_MAPBOX_TOKEN=pk.abc123xyz

# Umami Analytics - must be valid UUID
VITE_UMAMI_WEBSITE_ID=123e4567-e89b-12d3-a456-426614174000

# Umami script source - must be valid URL
# Defaults to https://cloud.umami.is/script.js
VITE_UMAMI_SRC=https://cloud.umami.is/script.js
```

**Validation:**

- Google Analytics ID: Must match format `G-XXXXXXXXXX` or `UA-XXXXXX-X`
- Mapbox Token: Non-empty string (if provided)
- Umami Website ID: Must be valid UUID format
- Umami Src: Must be valid URL

### New Relic Error Monitoring (Optional)

```bash
# Your New Relic Account ID (numeric)
# Example: 1234567
VITE_NEWRELIC_ACCOUNT_ID=

# Trust Key (numeric)
# Example: 1234567
VITE_NEWRELIC_TRUST_KEY=

# Agent ID (numeric)
# Example: 1234567890
VITE_NEWRELIC_AGENT_ID=

# License Key - must start with "NRJS-" followed by alphanumeric characters (10-50 chars total)
# Example: NRJS-ebbbb806e4ce754f330
# Leave empty to disable New Relic
VITE_NEWRELIC_LICENSE_KEY=

# Application ID (numeric)
# Example: 1234567890
VITE_NEWRELIC_APPLICATION_ID=

# Optional: Comma-separated list of URL patterns to exclude from AJAX tracking
# Example: /api/internal,/health,/metrics
VITE_NEWRELIC_AJAX_DENY_LIST=
```

**Validation:**

- Account ID: Must be numeric (digits only) or empty string
- Trust Key: Must be numeric (digits only) or empty string
- Agent ID: Must be numeric (digits only) or empty string
- License Key: Must start with `"NRJS-"` followed by alphanumeric characters, 10-50 characters total. Can be empty string to disable.
  - Valid format: `NRJS-ebbbb806e4ce754f330`
  - Invalid: `INVALID-KEY`, `NRJS-`, keys shorter than 10 chars, keys longer than 50 chars
- Application ID: Must be numeric (digits only) or empty string
- AJAX Deny List: Comma-separated list (optional, defaults to empty array)

**Required for New Relic to work:**

- All five main fields (Account ID, Trust Key, Agent ID, License Key, Application ID) must be set
- `VITE_ENABLE_ERROR_MONITORING` must be set to `true`

### Social Links (Required)

```bash
# Must be valid URLs with correct domains
VITE_GITHUB_URL=https://github.com/yourusername
VITE_LINKEDIN_URL=https://linkedin.com/in/yourusername
VITE_EMAIL=your.email@example.com
```

**Validation:**

- GitHub URL: Must be valid URL containing 'github.com'
- LinkedIn URL: Must be valid URL containing 'linkedin.com'
- Email: Must be valid email format

### GitHub API Proxy (Optional)

```bash
# Enable the GitHub API proxy for real contribution data
# Only set to 'true' on Vercel where serverless functions are available
# Defaults to 'false' (uses mock data in local dev and CI)
VITE_GITHUB_API_ENABLED=false
```

**Validation:**

- Accepts: `true`, `false`, `1`, `0`
- Defaults to `false`

**When to set:**

- Set to `true` only in **Vercel environment variables** where the `/api/github` serverless function is available
- Keep as `false` (or unset) for local development and CI to avoid 404 errors
- When `false`, the app uses mock contribution data and derives pinned repos from top starred repos

### PWA & SEO (Optional)

```bash
# Your site's production URL - used for sitemap generation
VITE_SITE_URL=https://yourportfolio.com
```

**Validation:**

- Site URL: Must be valid URL format (optional)

**When to set:**

- Not required for development or initial deployment
- Set this in production environment variables on Vercel/hosting platform
- Used by the build process to generate `sitemap.xml` with correct URLs
- Can be added after initial deployment and redeployed

**Note:** If not set, the sitemap will generate with placeholder URLs. You can also manually generate the sitemap by running `npm run sitemap:generate` after setting this variable.

## 💻 Usage in Code

### Option 1: Using the type-safe `env` object (Recommended)

```typescript
import { env } from '@/config/env';

// App configuration
console.log(env.app.title);
console.log(env.app.isDevelopment);

// API configuration
const apiUrl = env.api.url;
const timeout = env.api.timeout; // Automatically parsed as number

// Feature flags
if (env.features.analytics) {
  // Initialize analytics
}

// Social links
const github = env.social.github;
```

### Option 2: Direct access via import.meta.env

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';
```

## 🎯 Type Safety & Runtime Validation

This project uses **Valibot** for runtime validation of environment variables. TypeScript definitions are in `src/vite-env.d.ts`, and validation logic is in `src/config/env.ts`.

### Features

- ✅ **Type safety** - TypeScript types for all variables
- ✅ **Runtime validation** - Validates format, not just existence
- ✅ **Automatic type conversion** - Strings → numbers, booleans
- ✅ **Required vs optional** - Clear distinction with defaults
- ✅ **Format validation** - URLs, emails, UUIDs, etc.
- ✅ **Range validation** - Min/max for numbers and strings
- ✅ **Detailed error messages** - Know exactly what's wrong

### How Validation Works

When you start the app or run tests, the `env.ts` file validates all environment variables at module load time:

```typescript
import { env } from '@/config/env';

// All values are validated at startup
// If validation fails, you get detailed error messages
console.log(env.api.url); // Guaranteed to be a valid URL
console.log(env.api.timeout); // Guaranteed to be a number (1000-60000)
console.log(env.social.email); // Guaranteed to be valid email format
```

### Example Error Messages

**Missing required variable:**

```
❌ Invalid environment variables:
  ❌ VITE_API_URL: Required
  ❌ VITE_EMAIL: Required
```

**Invalid format:**

```
❌ Invalid environment variables:
  ❌ VITE_API_URL: Invalid url
  ❌ VITE_EMAIL: Invalid email
  ❌ VITE_GITHUB_URL: GitHub URL must be a github.com URL
  ❌ VITE_API_TIMEOUT: Number must be greater than or equal to 1000
```

**What gets validated:**

| Type     | Validation                                                   |
| -------- | ------------------------------------------------------------ |
| URLs     | Valid URL format + domain checks (GitHub, LinkedIn)          |
| Email    | Valid email format                                           |
| Numbers  | Range checks (min/max)                                       |
| Booleans | Correct format (`true`/`false`/`1`/`0`)                      |
| UUIDs    | Valid UUID v4 format                                         |
| IDs      | Specific patterns (Google Analytics, New Relic license keys) |
| Strings  | Length constraints (min/max characters)                      |
| Regex    | Format validation (URLs, emails, license keys)               |

## 🌍 Environment Files

This project uses a simple approach with just two environment files:

- **`.env`** - Your local development and test environment variables (gitignored)
- **`.env.example`** - Template file showing all available variables (committed to git)

For production, environment variables are set directly in your hosting platform (Vercel, etc.) rather than using a separate file.

### GitHub Actions & CI/CD

For GitHub Actions workflows (Lighthouse CI, Bundle Size Check, etc.), environment variables are set as **GitHub Secrets**:

1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each required variable (see list below)

**Required Secrets for CI/CD:**

- `VITE_APP_TITLE` - Your app title
- `VITE_APP_DESCRIPTION` - Your app description
- `VITE_API_URL` - API URL
- `VITE_GITHUB_URL` - Your GitHub profile URL
- `VITE_LINKEDIN_URL` - Your LinkedIn profile URL
- `VITE_EMAIL` - Your email address
- `VITE_GITHUB_USERNAME` - Your GitHub username

**Note:** Do NOT set `VITE_GITHUB_API_ENABLED=true` in GitHub Secrets. The API proxy only works on Vercel, so CI should use `false` (or leave unset) to avoid 404 errors during Lighthouse testing.

**Optional Secrets for CI/CD:**

- `VITE_UMAMI_WEBSITE_ID` - Umami analytics ID
- `VITE_NEWRELIC_LICENSE_KEY` - New Relic license key
- `VITE_NEWRELIC_ACCOUNT_ID` - New Relic account ID
- `VITE_NEWRELIC_TRUST_KEY` - New Relic trust key
- `VITE_NEWRELIC_AGENT_ID` - New Relic agent ID
- `VITE_NEWRELIC_APPLICATION_ID` - New Relic application ID
- `VITE_GOOGLE_ANALYTICS_ID` - Google Analytics ID
- `VITE_MAPBOX_TOKEN` - Mapbox token

**Note:** Workflows will use fallback values for required variables if secrets are not set, but it's recommended to set actual values for accurate testing and reporting.

## 🧪 Running Tests

Tests use the same `.env` file as development:

```bash
# Run tests (uses .env)
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test src/App.test.tsx

# Run tests with coverage
npm test -- --coverage
```

All environment variables from `.env` are loaded and validated when running tests.

## 📦 Build-time vs Runtime

⚠️ **Important:** Environment variables are embedded at **build time**, not runtime.

- Variables are replaced during build with their actual values
- Cannot be changed after build without rebuilding
- Don't store sensitive secrets in client-side env vars

## 🔒 Security

- ❌ **Never commit** `.env` (contains your actual values, gitignored)
- ✅ `.env.example` - Template with placeholders (✅ committed, safe to share)
- ❌ **Never store secrets** like API keys in client-side env vars
- ✅ **Use a backend** to proxy requests that require secrets
- ✅ **Set production variables** directly in hosting platform (Vercel, etc.)
- ✅ **Set GitHub Secrets** for CI/CD workflows (see GitHub Actions section above)

## 🐛 Troubleshooting

### Validation errors on startup

If you see validation errors when starting the app:

1. **Read the error message carefully** - It tells you exactly what's wrong
2. **Check your `.env` file** - Verify the values match the required format
3. **See examples above** - Each variable has validation rules listed
4. **Common issues:**
   - URLs missing `http://` or `https://`
   - Email missing `@` or `.com`
   - GitHub URL doesn't include `github.com`
   - API timeout not a number or out of range (1000-60000)

**Example fix:**

```bash
# ❌ Wrong - Not a valid URL
VITE_API_URL=localhost:3000

# ✅ Correct - Valid URL
VITE_API_URL=http://localhost:3000

# ❌ Wrong - Not a valid email
VITE_EMAIL=myemail

# ✅ Correct - Valid email
VITE_EMAIL=my.email@example.com
```

### Variables not updating?

- Restart the dev server
- Clear browser cache
- Check that variable is prefixed with `VITE_`

### Variable is undefined?

- Ensure it's defined in your `.env` file
- Check the variable name spelling
- Verify it's prefixed with `VITE_`
- Restart dev server
- Check if it passes validation (see error message)

### TypeScript errors?

- Update `src/vite-env.d.ts` with new variables
- Update `src/config/env.ts` Valibot schema with validation rules
- Restart TypeScript server in your editor

### Bypass validation temporarily (not recommended)

If you need to temporarily disable validation during development:

```typescript
// In src/config/env.ts
// Comment out the validation (NOT recommended for production!)
// const validatedEnv = validateEnv();

// Use import.meta.env directly (bypasses validation)
// const validatedEnv = import.meta.env;
```

**Warning:** Only do this temporarily! Validation catches configuration errors early.

## 📚 Resources

- **[Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)** - Official Vite documentation
- **[Valibot Documentation](https://valibot.dev/)** - Schema validation library
- **[TypeScript ImportMeta](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#supporting-lib-from-node_modules)** - TypeScript environment types

## 🔍 Validation Schema Reference

The complete validation schema is defined in `src/config/env.ts`. Key validation features:

- **URL validation** - Ensures proper format and protocol
- **Email validation** - RFC-compliant email format
- **Number ranges** - Min/max constraints
- **String length** - Character limits (min/max)
- **Pattern matching** - Regex for IDs and tokens (e.g., New Relic license keys: `NRJS-[A-Za-z0-9]+`)
- **Domain validation** - Checks for specific domains (GitHub, LinkedIn, etc.)
- **UUID validation** - Proper UUID v4 format
- **Default values** - Sensible defaults for optional fields
- **Type coercion** - Automatic string to number/boolean conversion
- **Union types** - Allows empty strings or validated values (for optional fields)

**Example from schema:**

```typescript
VITE_API_URL: v.pipe(
  v.string(),
  v.url('API URL must be a valid URL'),
  v.check(
    (url: string) => url.startsWith('http://') || url.startsWith('https://'),
    'API URL must start with http:// or https://'
  )
),

VITE_EMAIL: v.pipe(
  v.string(),
  v.email('Email must be a valid email address')
),

VITE_API_TIMEOUT: v.pipe(
  v.fallback(v.string(), '5000'),
  v.transform((val: string) => parseInt(val, 10)),
  v.pipe(
    v.number(),
    v.minValue(1000),
    v.maxValue(60000)
  )
),

VITE_NEWRELIC_LICENSE_KEY: v.union([
  v.pipe(
    v.string(),
    v.regex(
      /^NRJS-[A-Za-z0-9]+$/,
      'New Relic License Key must start with "NRJS-" followed by alphanumeric characters'
    ),
    v.minLength(10),
    v.maxLength(50)
  ),
  v.literal(''),
]),
```

For the complete schema, see `src/config/env.ts`.

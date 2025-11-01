# Environment Variables Guide

This project uses environment variables for configuration with **runtime validation using Zod**. Vite exposes environment variables through `import.meta.env`, and all values are validated for format and correctness at startup.

## 📁 Files

- **`.env.example`** - Template file with all available variables (✅ committed to git)
- **`.env.test`** - Test configuration for CI/CD with safe placeholder values (✅ committed to git)
- **`.env`** - Your local development environment variables (gitignored)
- **`.env.prod`** - Local copy of production variables set in Vercel (gitignored, optional)

**Note:** All `.env*` files are gitignored **except** `.env.example` and `.env.test` which are committed to provide templates and enable CI/CD testing. The `.env.prod` file is a convenience for keeping a local reference of your Vercel production environment variables.

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
VITE_APP_TITLE=My Portfolio

# 1-500 characters, cannot be empty
VITE_APP_DESCRIPTION=My personal portfolio website
```

**Validation:**

- Title: 1-100 characters
- Description: 1-500 characters

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
```

**Validation:**

- Accepts: `true`, `false`, `1`, `0`
- Defaults to `false`

### Third-party Services (Optional)

```bash
# Google Analytics ID - format: G-XXXXXXXXXX or UA-XXXXXX-X
VITE_GOOGLE_ANALYTICS_ID=G-ABC123XYZ

# Sentry DSN - must be valid URL, should contain 'sentry.io' or 'ingest'
VITE_SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456

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
- Sentry DSN: Must be valid URL containing 'sentry.io' or 'ingest'
- Mapbox Token: Non-empty string (if provided)
- Umami Website ID: Must be valid UUID format
- Umami Src: Must be valid URL

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

This project uses **Zod** for runtime validation of environment variables. TypeScript definitions are in `src/vite-env.d.ts`, and validation logic is in `src/config/env.ts`.

### Features

- ✅ **Type safety** - TypeScript types for all variables
- ✅ **Runtime validation** - Validates format, not just existence
- ✅ **Automatic type conversion** - Strings → numbers, booleans
- ✅ **Required vs optional** - Clear distinction with defaults
- ✅ **Format validation** - URLs, emails, UUIDs, etc.
- ✅ **Range validation** - Min/max for numbers and strings
- ✅ **Detailed error messages** - Know exactly what's wrong

### How Validation Works

When you start the app, the `env.ts` file validates all environment variables:

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

| Type     | Validation                                                  |
| -------- | ----------------------------------------------------------- |
| URLs     | Valid URL format + domain checks (GitHub, LinkedIn, Sentry) |
| Email    | Valid email format                                          |
| Numbers  | Range checks (min/max)                                      |
| Booleans | Correct format (`true`/`false`/`1`/`0`)                     |
| UUIDs    | Valid UUID v4 format                                        |
| IDs      | Specific patterns (Google Analytics format)                 |
| Strings  | Length constraints (min/max characters)                     |

## 🌍 Environment-specific Files

Vite loads environment variables in the following order (later values override earlier ones):

1. `.env` - Loaded in all cases
2. `.env.local` - Loaded in all cases (gitignored)
3. `.env.[mode]` - Only loaded in specified mode (e.g., `.env.production`)
4. `.env.[mode].local` - Only loaded in specified mode (gitignored)

## 📦 Build-time vs Runtime

⚠️ **Important:** Environment variables are embedded at **build time**, not runtime.

- Variables are replaced during build with their actual values
- Cannot be changed after build without rebuilding
- Don't store sensitive secrets in client-side env vars

## 🔒 Security

- ❌ **Never commit** `.env` or `.env.prod` (contain your actual values, gitignored)
- ✅ `.env.example` - Template with placeholders (✅ committed, safe to share)
- ✅ `.env.test` - Test values with safe placeholders (✅ committed, safe to share)
- ❌ **Never store secrets** like API keys in client-side env vars
- ✅ **Use a backend** to proxy requests that require secrets
- ✅ **Set production variables** directly in hosting platform (Vercel, etc.)

## 🧪 Different Environments

### Development

```bash
npm run start:dev
# Uses .env.development
```

### Production

```bash
npm run build
# Uses .env.production
```

### Preview Production Build

```bash
npm run start:prod
# Uses .env.production
```

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
- Update `src/config/env.ts` Zod schema with validation rules
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
- **[Zod Documentation](https://zod.dev/)** - Schema validation library
- **[TypeScript ImportMeta](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#supporting-lib-from-node_modules)** - TypeScript environment types

## 🔍 Validation Schema Reference

The complete validation schema is defined in `src/config/env.ts`. Key validation features:

- **URL validation** - Ensures proper format and protocol
- **Email validation** - RFC-compliant email format
- **Number ranges** - Min/max constraints
- **String length** - Character limits
- **Pattern matching** - Regex for IDs and tokens
- **Domain validation** - Checks for specific domains (GitHub, LinkedIn, etc.)
- **UUID validation** - Proper UUID v4 format
- **Default values** - Sensible defaults for optional fields
- **Type coercion** - Automatic string to number/boolean conversion

**Example from schema:**

```typescript
VITE_API_URL: z
  .string()
  .url('API URL must be a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'API URL must start with http:// or https://'
  ),

VITE_EMAIL: z
  .string()
  .email('Email must be a valid email address'),

VITE_API_TIMEOUT: z
  .string()
  .optional()
  .default('5000')
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(1000).max(60000)),
```

For the complete schema, see `src/config/env.ts`.

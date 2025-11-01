# Environment Variable Validation with Zod

This document explains the Zod-based environment validation system implemented in this project.

## Overview

All environment variables are validated at runtime using [Zod](https://zod.dev/), a TypeScript-first schema validation library. This ensures that configuration errors are caught early with helpful error messages.

## What's Validated

### Format Validation

- ✅ **URLs** - Proper format with protocol (http:// or https://)
- ✅ **Email addresses** - Valid email format
- ✅ **UUIDs** - Valid UUID v4 format
- ✅ **Numbers** - Range validation (min/max)
- ✅ **Booleans** - Proper true/false format
- ✅ **String length** - Min/max character constraints

### Domain-Specific Validation

- ✅ **GitHub URLs** - Must contain 'github.com'
- ✅ **LinkedIn URLs** - Must contain 'linkedin.com'
- ✅ **Sentry DSN** - Must contain 'sentry.io' or 'ingest'
- ✅ **Google Analytics ID** - Must match G-XXXXXXXXXX or UA-XXXXXX-X format

## Example Error Messages

### Before Zod (Basic Validation)

```
Error: Missing required environment variable: VITE_API_URL
```

### After Zod (Detailed Validation)

```
❌ Invalid environment variables:
  ❌ VITE_API_URL: Invalid url
  ❌ VITE_EMAIL: Invalid email
  ❌ VITE_GITHUB_URL: GitHub URL must be a github.com URL
  ❌ VITE_API_TIMEOUT: Number must be greater than or equal to 1000

Please check your .env file and fix the errors above.
See docs/ENV.md for configuration details.
```

## When Validation Runs

Validation happens **at application startup** when `src/config/env.ts` is imported:

```typescript
// In main.tsx or any file that imports env
import { env } from '@/config/env';

// Validation runs immediately
// If it fails, the app won't start and you'll see error messages
console.log(env.api.url); // Guaranteed to be a valid URL
```

## Schema Definition

The validation schema is defined in `src/config/env.ts`:

```typescript
const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .url('API URL must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'API URL must start with http:// or https://'
    ),

  VITE_EMAIL: z.string().email('Email must be a valid email address'),

  VITE_API_TIMEOUT: z
    .string()
    .optional()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(60000)),

  // ... more fields
});
```

## Type Safety

Zod automatically infers TypeScript types from the schema:

```typescript
// TypeScript knows the exact shape
const env = validateEnv();

env.api.url; // Type: string (validated URL format)
env.api.timeout; // Type: number (validated range 1000-60000)
env.features.analytics; // Type: boolean
env.social.email; // Type: string (validated email format)
```

## Adding New Environment Variables

1. **Add to TypeScript types** (`src/vite-env.d.ts`):

```typescript
interface ImportMetaEnv {
  // ... existing
  readonly VITE_NEW_VARIABLE: string;
}
```

2. **Add to Zod schema** (`src/config/env.ts`):

```typescript
const envSchema = z.object({
  // ... existing
  VITE_NEW_VARIABLE: z.string().min(1, 'Cannot be empty').max(100, 'Too long'),
});
```

3. **Add to env object export**:

```typescript
export const env = {
  // ... existing
  newFeature: {
    variable: validatedEnv.VITE_NEW_VARIABLE,
  },
};
```

4. **Update documentation** (`docs/ENV.md`)

## Common Validation Patterns

### URL Validation

```typescript
VITE_API_URL: z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => url.startsWith('https://'),
    'Must use HTTPS in production'
  ),
```

### Email Validation

```typescript
VITE_EMAIL: z
  .string()
  .email('Must be a valid email'),
```

### Number with Range

```typescript
VITE_TIMEOUT: z
  .string()
  .transform((val) => parseInt(val, 10))
  .pipe(z.number().min(100).max(10000)),
```

### Optional with Default

```typescript
VITE_FEATURE_FLAG: z
  .string()
  .optional()
  .default('false')
  .transform((val) => val === 'true'),
```

### UUID Validation

```typescript
VITE_UUID: z
  .string()
  .uuid('Must be a valid UUID'),
```

### Enum (Specific Values)

```typescript
VITE_ENVIRONMENT: z
  .enum(['development', 'staging', 'production']),
```

### Regex Pattern

```typescript
VITE_GA_ID: z
  .string()
  .regex(/^G-[A-Z0-9]+$/, 'Must match format G-XXXXXXXXXX'),
```

## Testing Validation

### Test with Invalid Values

Create a temporary `.env` file with invalid values:

```bash
# Invalid URL (missing protocol)
VITE_API_URL=localhost:3000

# Invalid email
VITE_EMAIL=notanemail

# Out of range
VITE_API_TIMEOUT=100000
```

Start the dev server:

```bash
npm run start:dev
```

You should see validation errors immediately.

### Test with Valid Values

Fix the values:

```bash
VITE_API_URL=http://localhost:3000
VITE_EMAIL=your.email@example.com
VITE_API_TIMEOUT=5000
```

The app should start successfully.

## Benefits

### 1. Fail Fast

Errors are caught at **startup**, not at runtime when the variable is used.

**Without validation:**

```typescript
// Error happens deep in your app when you try to use it
fetch(env.api.url); // Runtime error: Invalid URL
```

**With validation:**

```typescript
// Error happens at startup before any code runs
// ❌ VITE_API_URL: Invalid url
```

### 2. Better Developer Experience

**Clear error messages** tell you exactly what's wrong:

- "Email must be a valid email address"
- "Number must be greater than or equal to 1000"
- "GitHub URL must be a github.com URL"

### 3. Prevents Production Issues

Catch configuration mistakes **before deployment**:

- Wrong URL format
- Missing required variables
- Invalid credentials format
- Out of range values

### 4. Self-Documenting

The schema serves as **living documentation** of what's expected:

```typescript
// Anyone reading the schema knows exactly what's required
VITE_API_URL: z.string().url(); // Must be a URL
VITE_API_TIMEOUT: z.number().min(1000).max(60000); // Range constraints
```

### 5. Type Safety

TypeScript knows the **exact types** after validation:

```typescript
env.api.timeout; // Type: number (not string!)
env.features.analytics; // Type: boolean (not string!)
```

## Troubleshooting

### Validation Fails on Startup

**Problem:** App doesn't start, shows validation errors

**Solution:**

1. Read the error messages carefully
2. Check your `.env` file
3. Fix the invalid values
4. Restart the server

### Want to Skip Validation Temporarily

**Problem:** Need to bypass validation for testing

**Solution (not recommended):**

```typescript
// In src/config/env.ts
// Comment out validation temporarily
// const validatedEnv = validateEnv();
const validatedEnv = import.meta.env as any;
```

**Warning:** Only do this for quick testing. Re-enable validation before committing!

### Adding Too Many Validations

**Problem:** Schema is getting too complex

**Solution:**

- Keep validations focused on format and safety
- Don't validate business logic (do that elsewhere)
- Use optional with sensible defaults when possible

## Best Practices

1. **Validate format, not business logic**
   - ✅ Validate that a URL is a URL
   - ❌ Don't validate if the URL returns 200 OK

2. **Provide helpful error messages**
   - ✅ "Email must be a valid email address (e.g., user@example.com)"
   - ❌ "Invalid"

3. **Use defaults for optional values**
   - Makes it easier to get started
   - Reduces required configuration

4. **Keep required variables minimal**
   - Only require what's truly necessary
   - Make everything else optional with defaults

5. **Document validation rules**
   - Add comments in the schema
   - Update ENV.md with requirements
   - Update `.env.example` with new variables and documentation
   - Update `.env.test` with safe test values

## Resources

- **[Zod Documentation](https://zod.dev/)** - Full Zod API reference
- **[ENV.md](ENV.md)** - Complete environment variable guide
- **[src/config/env.ts](../src/config/env.ts)** - Validation schema implementation

---

**Remember:** Validation is your friend! It catches mistakes before they become problems. 🛡️

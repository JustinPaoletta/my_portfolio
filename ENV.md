# Environment Variables Guide

This project uses environment variables for configuration. Vite exposes environment variables through `import.meta.env`.

## 📁 Files

- `.env.example` - Template file with all available variables (committed to git)
- `.env.development` - Development environment variables (gitignored)
- `.env.production` - Production environment variables (gitignored)
- `.env` - Local overrides (gitignored)

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

### App Configuration

```bash
VITE_APP_TITLE=My Portfolio
VITE_APP_DESCRIPTION=My personal portfolio website
```

### API Configuration

```bash
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=5000
```

### Feature Flags

```bash
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

### Third-party Services

```bash
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
VITE_MAPBOX_TOKEN=
```

### Social Links

```bash
VITE_GITHUB_URL=https://github.com/yourusername
VITE_LINKEDIN_URL=https://linkedin.com/in/yourusername
VITE_EMAIL=your.email@example.com
```

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

## 🎯 Type Safety

TypeScript definitions are in `src/vite-env.d.ts`. The `env` utility provides:

- ✅ Type safety
- ✅ Automatic type conversion (string → number, boolean)
- ✅ Required vs optional variables
- ✅ Default values
- ✅ Validation at runtime

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

- ❌ **Never commit** `.env`, `.env.local`, or `.env.*.local` files
- ✅ **Always commit** `.env.example` as a template
- ❌ **Never store secrets** like API keys in client-side env vars
- ✅ **Use a backend** to proxy requests that require secrets

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

### Variables not updating?

- Restart the dev server
- Clear browser cache
- Check that variable is prefixed with `VITE_`

### Variable is undefined?

- Ensure it's defined in your `.env` file
- Check the variable name spelling
- Verify it's prefixed with `VITE_`
- Restart dev server

### TypeScript errors?

- Update `src/vite-env.d.ts` with new variables
- Restart TypeScript server in your editor

## 📚 Resources

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [TypeScript ImportMeta](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#supporting-lib-from-node_modules)

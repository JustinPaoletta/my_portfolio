/**
 * Environment configuration
 * Access environment variables in a type-safe way
 */

// Helper function to get required environment variables
function getEnvVar(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Helper function to get optional environment variables
function getOptionalEnvVar(
  key: keyof ImportMetaEnv,
  defaultValue = ''
): string {
  return import.meta.env[key] ?? defaultValue;
}

// Helper to parse boolean environment variables
function getEnvBoolean(
  key: keyof ImportMetaEnv,
  defaultValue = false
): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

// Helper to parse number environment variables
function getEnvNumber(key: keyof ImportMetaEnv, defaultValue = 0): number {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application environment configuration
 */
export const env = {
  // App Configuration
  app: {
    title: getEnvVar('VITE_APP_TITLE'),
    description: getEnvVar('VITE_APP_DESCRIPTION'),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },

  // API Configuration
  api: {
    url: getEnvVar('VITE_API_URL'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 5000),
  },

  // Feature Flags
  features: {
    analytics: getEnvBoolean('VITE_ENABLE_ANALYTICS'),
    debug: getEnvBoolean('VITE_ENABLE_DEBUG'),
  },

  // Third-party Services
  services: {
    googleAnalyticsId: getOptionalEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    sentryDsn: getOptionalEnvVar('VITE_SENTRY_DSN'),
    mapboxToken: getOptionalEnvVar('VITE_MAPBOX_TOKEN'),
  },

  // Social Links
  social: {
    github: getEnvVar('VITE_GITHUB_URL'),
    linkedin: getEnvVar('VITE_LINKEDIN_URL'),
    email: getEnvVar('VITE_EMAIL'),
  },
} as const;

// Export type for use in other files
export type Env = typeof env;

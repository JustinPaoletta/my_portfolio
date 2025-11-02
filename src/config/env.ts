/**
 * Environment configuration with runtime validation using Zod
 * Access environment variables in a type-safe, validated way
 */

import { config, z } from 'zod';

// Disable Zod's JIT compilation to avoid runtime eval checks that violate CSP
config({ jitless: true });

/**
 * Environment variable schema with validation rules
 * This validates format, type, and constraints at runtime
 */
const envSchema = z.object({
  // App Configuration (Required)
  VITE_APP_TITLE: z
    .string()
    .min(1, 'App title is required and cannot be empty')
    .max(100, 'App title must be less than 100 characters'),

  VITE_APP_DESCRIPTION: z
    .string()
    .min(1, 'App description is required and cannot be empty')
    .max(500, 'App description must be less than 500 characters'),

  // API Configuration (Required)
  VITE_API_URL: z
    .string()
    .url('API URL must be a valid URL (e.g., https://api.example.com)')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'API URL must start with http:// or https://'
    ),

  VITE_API_TIMEOUT: z
    .string()
    .optional()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(1000, 'API timeout must be at least 1000ms (1 second)')
        .max(60000, 'API timeout must not exceed 60000ms (60 seconds)')
    ),

  // Feature Flags
  VITE_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean()),

  VITE_ENABLE_DEBUG: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean()),

  VITE_ENABLE_ERROR_MONITORING: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true' || val === '1')
    .pipe(z.boolean()),

  // Third-party Services (Optional)
  VITE_GOOGLE_ANALYTICS_ID: z
    .string()
    .regex(
      /^(G-[A-Z0-9]+|UA-\d+-\d+)?$/,
      'Google Analytics ID must be in format G-XXXXXXXXXX or UA-XXXXXX-X'
    )
    .optional(),

  VITE_MAPBOX_TOKEN: z
    .string()
    .min(1, 'Mapbox token cannot be empty if provided')
    .optional()
    .or(z.literal('')),

  // Umami Analytics (Optional)
  VITE_UMAMI_WEBSITE_ID: z
    .string()
    .uuid('Umami website ID must be a valid UUID')
    .optional()
    .or(z.literal('')),

  VITE_UMAMI_SRC: z
    .string()
    .url('Umami script source must be a valid URL')
    .optional()
    .default('https://cloud.umami.is/script.js'),

  // New Relic Configuration (Optional)
  VITE_NEWRELIC_ACCOUNT_ID: z
    .string()
    .regex(/^\d+$/, 'New Relic Account ID must be a number')
    .optional()
    .or(z.literal('')),

  VITE_NEWRELIC_TRUST_KEY: z
    .string()
    .regex(/^\d+$/, 'New Relic Trust Key must be a number')
    .optional()
    .or(z.literal('')),

  VITE_NEWRELIC_AGENT_ID: z
    .string()
    .regex(/^\d+$/, 'New Relic Agent ID must be a number')
    .optional()
    .or(z.literal('')),

  VITE_NEWRELIC_LICENSE_KEY: z
    .string()
    .min(1, 'New Relic License Key cannot be empty if provided')
    .optional()
    .or(z.literal('')),

  VITE_NEWRELIC_APPLICATION_ID: z
    .string()
    .regex(/^\d+$/, 'New Relic Application ID must be a number')
    .optional()
    .or(z.literal('')),

  VITE_NEWRELIC_AJAX_DENY_LIST: z
    .string()
    .optional()
    .default('')
    .transform((val) => (val ? val.split(',').map((s) => s.trim()) : [])),

  // App Version (Optional)
  VITE_APP_VERSION: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'App version must be in semver format (e.g., 1.0.0)'
    )
    .optional()
    .default('1.0.0'),

  // Social Links (Required)
  VITE_GITHUB_URL: z
    .string()
    .url('GitHub URL must be a valid URL')
    .refine(
      (url) => url.includes('github.com'),
      'GitHub URL must be a github.com URL'
    ),

  VITE_LINKEDIN_URL: z
    .string()
    .url('LinkedIn URL must be a valid URL')
    .refine(
      (url) => url.includes('linkedin.com'),
      'LinkedIn URL must be a linkedin.com URL'
    ),

  VITE_EMAIL: z
    .string()
    .email(
      'Email must be a valid email address (e.g., your.email@example.com)'
    ),
});

/**
 * Validate and parse environment variables
 * Throws detailed error if validation fails
 */
function validateEnv() {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    // Format validation errors in a readable way
    const errors = parsed.error.issues
      .map((issue) => {
        const path = issue.path.join('.');
        return `  ❌ ${path}: ${issue.message}`;
      })
      .join('\n');

    console.error('❌ Invalid environment variables:\n' + errors);

    throw new Error(
      `Environment validation failed:\n${errors}\n\n` +
        `Please check your .env file and fix the errors above.\n` +
        `See docs/ENV.md for configuration details.`
    );
  }

  return parsed.data;
}

// Validate and export environment variables
const validatedEnv = validateEnv();

/**
 * Application environment configuration
 * All values are validated at runtime for type safety and correctness
 */
export const env = {
  // App Configuration
  app: {
    title: validatedEnv.VITE_APP_TITLE,
    description: validatedEnv.VITE_APP_DESCRIPTION,
    version: validatedEnv.VITE_APP_VERSION,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },

  // API Configuration
  api: {
    url: validatedEnv.VITE_API_URL,
    timeout: validatedEnv.VITE_API_TIMEOUT,
  },

  // Feature Flags
  features: {
    analytics: validatedEnv.VITE_ENABLE_ANALYTICS,
    debug: validatedEnv.VITE_ENABLE_DEBUG,
    errorMonitoring: validatedEnv.VITE_ENABLE_ERROR_MONITORING,
  },

  // Third-party Services
  services: {
    googleAnalyticsId: validatedEnv.VITE_GOOGLE_ANALYTICS_ID || undefined,
    mapboxToken: validatedEnv.VITE_MAPBOX_TOKEN || undefined,
  },

  // Analytics
  analytics: {
    umami: {
      websiteId: validatedEnv.VITE_UMAMI_WEBSITE_ID || undefined,
      src: validatedEnv.VITE_UMAMI_SRC,
    },
  },

  // Error Monitoring
  monitoring: {
    newrelic: {
      accountId: validatedEnv.VITE_NEWRELIC_ACCOUNT_ID || undefined,
      trustKey: validatedEnv.VITE_NEWRELIC_TRUST_KEY || undefined,
      agentId: validatedEnv.VITE_NEWRELIC_AGENT_ID || undefined,
      licenseKey: validatedEnv.VITE_NEWRELIC_LICENSE_KEY || undefined,
      applicationId: validatedEnv.VITE_NEWRELIC_APPLICATION_ID || undefined,
      ajaxDenyList: validatedEnv.VITE_NEWRELIC_AJAX_DENY_LIST,
    },
  },

  // Social Links
  social: {
    github: validatedEnv.VITE_GITHUB_URL,
    linkedin: validatedEnv.VITE_LINKEDIN_URL,
    email: validatedEnv.VITE_EMAIL,
  },
} as const;

// Export type for use in other files
export type Env = typeof env;

// Export the Zod schema type for reference
export type ValidatedEnv = z.infer<typeof envSchema>;

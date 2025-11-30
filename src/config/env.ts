/**
 * Environment configuration with runtime validation using Valibot
 * Access environment variables in a type-safe, validated way
 */

import * as v from 'valibot';

const envSchema = v.object({
  VITE_APP_TITLE: v.pipe(
    v.string(),
    v.minLength(1, 'App title is required and cannot be empty'),
    v.maxLength(100, 'App title must be less than 100 characters')
  ),

  VITE_APP_DESCRIPTION: v.pipe(
    v.string(),
    v.minLength(1, 'App description is required and cannot be empty'),
    v.maxLength(500, 'App description must be less than 500 characters')
  ),

  VITE_API_URL: v.pipe(
    v.string(),
    v.url('API URL must be a valid URL (e.g., https://api.example.com)'),
    v.check(
      (url: string) => url.startsWith('http://') || url.startsWith('https://'),
      'API URL must start with http:// or https://'
    )
  ),

  VITE_API_TIMEOUT: v.pipe(
    v.fallback(v.string(), '5000'),
    v.transform<string, number>((val) => parseInt(val, 10)),
    v.pipe(
      v.number(),
      v.minValue(1000, 'API timeout must be at least 1000ms (1 second)'),
      v.maxValue(60000, 'API timeout must not exceed 60000ms (60 seconds)')
    )
  ),

  VITE_ENABLE_ANALYTICS: v.pipe(
    v.fallback(v.optional(v.string()), 'false'),
    v.transform((val) => val === 'true' || val === '1'),
    v.boolean()
  ),

  VITE_ENABLE_DEBUG: v.pipe(
    v.fallback(v.optional(v.string()), 'false'),
    v.transform((val) => val === 'true' || val === '1'),
    v.boolean()
  ),

  VITE_ENABLE_ERROR_MONITORING: v.pipe(
    v.fallback(v.optional(v.string()), 'false'),
    v.transform((val) => val === 'true' || val === '1'),
    v.boolean()
  ),

  VITE_UMAMI_WEBSITE_ID: v.union([
    v.pipe(v.string(), v.uuid('Umami website ID must be a valid UUID')),
    v.literal(''),
  ]),

  VITE_UMAMI_SRC: v.pipe(
    v.fallback(v.string(), 'https://cloud.umami.is/script.js'),
    v.url('Umami script source must be a valid URL')
  ),

  VITE_NEWRELIC_ACCOUNT_ID: v.union([
    v.pipe(
      v.string(),
      v.regex(/^\d+$/, 'New Relic Account ID must be a number')
    ),
    v.literal(''),
  ]),

  VITE_NEWRELIC_TRUST_KEY: v.union([
    v.pipe(
      v.string(),
      v.regex(/^\d+$/, 'New Relic Trust Key must be a number')
    ),
    v.literal(''),
  ]),

  VITE_NEWRELIC_AGENT_ID: v.union([
    v.pipe(v.string(), v.regex(/^\d+$/, 'New Relic Agent ID must be a number')),
    v.literal(''),
  ]),

  VITE_NEWRELIC_LICENSE_KEY: v.union([
    v.pipe(
      v.string(),
      v.regex(
        /^NRJS-[A-Za-z0-9]+$/,
        'New Relic License Key must start with "NRJS-" followed by alphanumeric characters (e.g., NRJS-abc123xyz)'
      ),
      v.minLength(10, 'New Relic License Key appears too short'),
      v.maxLength(50, 'New Relic License Key appears too long')
    ),
    v.literal(''),
  ]),

  VITE_NEWRELIC_APPLICATION_ID: v.union([
    v.pipe(
      v.string(),
      v.regex(/^\d+$/, 'New Relic Application ID must be a number')
    ),
    v.literal(''),
  ]),

  VITE_NEWRELIC_AJAX_DENY_LIST: v.pipe(
    v.fallback(v.optional(v.string()), ''),
    v.transform((val) =>
      val && val.trim() ? val.split(',').map((s) => s.trim()) : []
    )
  ),

  VITE_APP_VERSION: v.pipe(
    v.fallback(v.string(), '1.0.0'),
    v.regex(
      /^\d+\.\d+\.\d+$/,
      'App version must be in semver format (e.g., 1.0.0)'
    )
  ),

  VITE_GITHUB_URL: v.pipe(
    v.string(),
    v.url('GitHub URL must be a valid URL'),
    v.check(
      (url: string) => url.includes('github.com'),
      'GitHub URL must be a github.com URL'
    )
  ),

  VITE_LINKEDIN_URL: v.pipe(
    v.string(),
    v.url('LinkedIn URL must be a valid URL'),
    v.check(
      (url: string) => url.includes('linkedin.com'),
      'LinkedIn URL must be a linkedin.com URL'
    )
  ),

  VITE_EMAIL: v.pipe(
    v.string(),
    v.email(
      'Email must be a valid email address (e.g., your.email@example.com)'
    )
  ),

  VITE_SITE_URL: v.union([
    v.pipe(
      v.string(),
      v.url('Site URL must be a valid URL'),
      v.check(
        (url: string) =>
          url.startsWith('http://') || url.startsWith('https://'),
        'Site URL must start with http:// or https://'
      )
    ),
    v.literal(''),
  ]),

  VITE_GOOGLE_ANALYTICS_ID: v.optional(
    v.pipe(
      v.string(),
      v.regex(
        /^(G-[A-Z0-9]+|UA-\d+-\d+)?$/,
        'Google Analytics ID must be in format G-XXXXXXXXXX or UA-XXXXXX-X'
      )
    )
  ),

  VITE_MAPBOX_TOKEN: v.union([
    v.pipe(
      v.string(),
      v.minLength(1, 'Mapbox token cannot be empty if provided')
    ),
    v.literal(''),
  ]),
});

function validateEnv(): v.InferOutput<typeof envSchema> {
  const mode = import.meta.env.MODE || 'development';

  // log validation in development or when debug tools are enabled
  const shouldLogValidation = import.meta.env.DEV && __ENABLE_DEBUG_TOOLS__;
  if (shouldLogValidation) {
    console.log(`🔍 Validating environment variables (mode: ${mode})...`);
  }

  const parsed = v.safeParse(envSchema, import.meta.env);

  if (!parsed.success) {
    // format validation errors in a readable way
    const errors = parsed.issues
      .map((issue) => {
        const path =
          issue.path?.map((p) => String(p.key)).join('.') ??
          String(issue.input);
        return `  ❌ ${path}: ${issue.message}`;
      })
      .join('\n');

    console.error(
      `❌ Invalid environment variables (mode: ${mode}):\n${errors}`
    );

    throw new Error(
      `Environment validation failed:\n${errors}\n\n` +
        `Please check your .env file and fix the errors above.\n` +
        `See docs/ENV.md for configuration details.`
    );
  }

  return parsed.output;
}

const validatedEnv = validateEnv();

const analyticsFeatureEnabled =
  __ENABLE_ANALYTICS__ && validatedEnv.VITE_ENABLE_ANALYTICS;
const debugFeatureEnabled =
  __ENABLE_DEBUG_TOOLS__ && validatedEnv.VITE_ENABLE_DEBUG;
const errorMonitoringFeatureEnabled =
  __ENABLE_ERROR_MONITORING__ && validatedEnv.VITE_ENABLE_ERROR_MONITORING;

export const env = {
  app: {
    title: validatedEnv.VITE_APP_TITLE,
    description: validatedEnv.VITE_APP_DESCRIPTION,
    version: validatedEnv.VITE_APP_VERSION,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  },
  api: {
    url: validatedEnv.VITE_API_URL,
    timeout: validatedEnv.VITE_API_TIMEOUT,
  },
  features: {
    analytics: analyticsFeatureEnabled,
    debug: debugFeatureEnabled,
    errorMonitoring: errorMonitoringFeatureEnabled,
  },
  services: {
    googleAnalyticsId: validatedEnv.VITE_GOOGLE_ANALYTICS_ID || undefined,
    mapboxToken: validatedEnv.VITE_MAPBOX_TOKEN || undefined,
  },
  analytics: {
    umami: {
      websiteId: validatedEnv.VITE_UMAMI_WEBSITE_ID || undefined,
      src: validatedEnv.VITE_UMAMI_SRC,
    },
  },
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
  social: {
    github: validatedEnv.VITE_GITHUB_URL,
    linkedin: validatedEnv.VITE_LINKEDIN_URL,
    email: validatedEnv.VITE_EMAIL,
  },
  site: {
    url: validatedEnv.VITE_SITE_URL || undefined,
  },
} as const;

export type Env = typeof env;
export type ValidatedEnv = v.InferOutput<typeof envSchema>;

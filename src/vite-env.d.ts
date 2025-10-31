/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Configuration
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_DESCRIPTION: string;

  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG: string;

  // Third-party Services
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_MAPBOX_TOKEN?: string;

  // Social Links
  readonly VITE_GITHUB_URL: string;
  readonly VITE_LINKEDIN_URL: string;
  readonly VITE_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

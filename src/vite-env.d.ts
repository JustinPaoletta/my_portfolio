/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

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

  // Third-party Services (Optional)
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_MAPBOX_TOKEN?: string;

  // Umami Analytics (Optional)
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_SRC?: string;

  // PWA & SEO
  readonly VITE_SITE_URL?: string;
  readonly SITE_URL?: string;
  readonly URL?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

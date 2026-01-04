import type { VitePWAOptions } from 'vite-plugin-pwa';

/**
 * PWA Configuration for Portfolio Website
 *
 * This configuration enables offline support, caching, and installability.
 * See: https://vite-pwa-org.netlify.app/
 */
export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: [
    'favicon.svg',
    'pwa-192x192.png',
    'pwa-512x512.png',
    'robots.txt',
    'sitemap.xml',
    'og-image.png',
  ],
  manifestFilename: 'manifest.webmanifest',

  manifest: {
    name: 'JP - Engineering',
    short_name: 'Portfolio',
    description: 'A modern portfolio showcasing my projects and skills',
    theme_color: '#242424',
    background_color: '#242424',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-192x192.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '310x310',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['portfolio', 'personal', 'developer'],
    screenshots: [
      // Add screenshots for app stores (optional)
      // {
      //   src: '/screenshot-desktop.png',
      //   sizes: '1280x720',
      //   type: 'image/png',
      //   form_factor: 'wide',
      // },
      // {
      //   src: '/screenshot-mobile.png',
      //   sizes: '750x1334',
      //   type: 'image/png',
      //   form_factor: 'narrow',
      // },
    ],
  },

  workbox: {
    // Cache configuration
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // Cache CSS and JS with a stale-while-revalidate strategy
        urlPattern: /^https:\/\/.*\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        // Cache Google Fonts
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // Cache Google Fonts files
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // Network-first for API calls (if you have any)
        urlPattern: /^https:\/\/.*\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],

    // Clean up old caches
    cleanupOutdatedCaches: true,

    // Skip waiting and activate immediately
    skipWaiting: true,
    clientsClaim: true,
  },

  devOptions: {
    enabled: true, // Enable if you want to test PWA in development
    type: 'module',
  },
};

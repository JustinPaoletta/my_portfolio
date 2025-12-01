// Lighthouse CI Configuration

/** @type {import('@lhci/cli').LighthouseCiConfig} */
module.exports = {
  ci: {
    collect: {
      buildCommand: 'npm run build',
      staticDistDir: './dist',
      numberOfRuns: 3,
      settings: {
        // Chrome flags must be inside settings (per LHCI docs)
        // These flags are essential for running Chrome in CI environments
        chromeFlags: [
          // Essential for CI environments (Docker, GitHub Actions, etc.)
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          // Headless mode - use new headless for Chrome 112+
          '--headless=new',
          // Disable GPU (not available in CI)
          '--disable-gpu',
          '--disable-software-rasterizer',
          // Disable features that cause issues in headless
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-component-update',
          '--disable-default-apps',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-renderer-backgrounding',
          '--disable-sync',
          '--disable-translate',
          // Memory and stability
          '--disable-features=TranslateUI,BlinkGenPropertyTrees,IsolateOrigins,site-per-process',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          // Rendering
          '--force-color-profile=srgb',
          '--hide-scrollbars',
          '--mute-audio',
          // for consistent rendering
          '--window-size=1350,940',
        ],
        throttlingMethod: 'simulate',
        maxWaitForLoad: 60000,
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
      },
    },

    upload: {
      target: 'temporary-public-storage',
    },

    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Sites like Vercel, Netlify, and major apps score 0.80-0.90
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // FCP: "Good" is <1.8s, we allow up to 2.5s with monitoring
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        // LCP: "Good" is <2.5s, we allow up to 3s with monitoring overhead
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        // TBT: "Good" is <200ms, monitoring adds ~100-200ms
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-byte-weight': ['warn', { maxNumericValue: 500000 }],
        // BF-cache: Often fails due to unload handlers in monitoring libs
        'bf-cache': 'off',
        // CSP-XSS: LHCI's static server doesn't send HTTP headers
        // Our CSP is properly configured in vercel.json for production
        'csp-xss': 'off',
        // INP: Still experimental, disable for now
        'interaction-to-next-paint': 'off',
        // Unused JavaScript: Expected and acceptable for:
        // 1. Error monitoring (New Relic) - loads after page load event
        // 2. React internals - needed for interactivity, not initial render
        'unused-javascript': 'off',
        // New Relic includes polyfills for older browsers
        'legacy-javascript': 'off',
        // Network dependency tree: False positive with static server
        'network-dependency-tree-insight': 'off',
        'color-contrast': 'error',
        // ============================================================
        // NOISY DIAGNOSTICS
        // Set to off for now but can be enabled later if wanted for
        // even stricter checks
        // ============================================================
        'bootup-time': 'off',
        'dom-size': 'off',
        'server-response-time': 'off',
        'mainthread-work-breakdown': 'off',
        'render-blocking-resources': 'off',
      },
    },
  },
};

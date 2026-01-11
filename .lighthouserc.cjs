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
        // ============================================================
        // CATEGORY SCORES
        // Sites like Vercel, Netlify, and major apps score 0.80-0.90
        // Note: Performance in CI can vary significantly (0.5-0.9)
        // due to shared resources and cold starts
        // ============================================================
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // ============================================================
        // CORE WEB VITALS (warnings only - CI environment varies)
        // ============================================================
        // FCP: "Good" is <1.8s, CI overhead pushes this higher
        'first-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        // LCP: "Good" is <2.5s, CI overhead pushes this higher
        'largest-contentful-paint': ['warn', { maxNumericValue: 4500 }],
        // TBT: "Good" is <200ms, monitoring adds ~100-200ms
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-byte-weight': ['warn', { maxNumericValue: 500000 }],

        // ============================================================
        // DISABLED: SECURITY/BROWSER ENVIRONMENT SPECIFIC
        // ============================================================
        // Console errors: API proxy 404s are expected in CI (no serverless functions)
        // 'errors-in-console': 'off',
        // BF-cache: Often fails due to unload handlers in monitoring libs
        'bf-cache': 'off',
        // CSP-XSS: LHCI's static server doesn't send HTTP headers
        // Our CSP is properly configured in vercel.json for production
        'csp-xss': 'off',
        // Third-party cookies: External services (fonts, analytics) may set cookies
        'third-party-cookies': 'off',

        // ============================================================
        // DISABLED: EXPERIMENTAL/UNSTABLE METRICS
        // ============================================================
        // INP: Still experimental, disable for now
        'interaction-to-next-paint': 'off',

        // ============================================================
        // DISABLED: PERFORMANCE INSIGHTS (new in Lighthouse)
        // These are informational diagnostics, not actionable failures
        // ============================================================
        'image-delivery-insight': 'off',
        'cache-insight': 'off',
        'dom-size-insight': 'off',
        'render-blocking-insight': 'off',
        'network-dependency-tree-insight': 'off',

        // ============================================================
        // DISABLED: IMAGE OPTIMIZATION
        // Images are already optimized; these audits trigger for
        // srcSet images or minor size differences
        // ============================================================
        'offscreen-images': 'off',
        'uses-responsive-images': 'off',
        'modern-image-formats': 'off',

        // ============================================================
        // DISABLED: NETWORK OPTIMIZATION
        // Preconnect/preload require production CDN headers
        // LHCI static server doesn't support these
        // ============================================================
        'uses-rel-preconnect': 'off',
        'uses-rel-preload': 'off',

        // ============================================================
        // DISABLED: JAVASCRIPT ANALYSIS
        // Expected and acceptable for:
        // 1. Error monitoring (New Relic) - loads after page load event
        // 2. React internals - needed for interactivity, not initial render
        // ============================================================
        'unused-javascript': 'off',
        // New Relic includes polyfills for older browsers
        'legacy-javascript': 'off',

        // ============================================================
        // DISABLED: PERFORMANCE DIAGNOSTICS (noisy in CI)
        // ============================================================
        'bootup-time': 'off',
        'dom-size': 'off',
        'server-response-time': 'off',
        'mainthread-work-breakdown': 'off',
        'render-blocking-resources': 'off',
        'speed-index': 'off',
        'max-potential-fid': 'off',
        'uses-long-cache-ttl': 'off',
        // TTI: Highly variable in CI environments
        interactive: 'off',

        // ============================================================
        // DISABLED: THIRD-PARTY/EXTERNAL RESOURCES
        // ============================================================
        // Passive event listeners: Often flagged due to React/third-party code
        'uses-passive-event-listeners': 'off',
        // Font display: Google Fonts on fonts.gstatic.com can't be verified
        'font-display': 'off',
        // LCP lazy load: Informational only, our LCP image is above the fold
        'lcp-lazy-loaded': 'off',
        // Non-composited animations: CSS transform animations may not be GPU-composited
        'non-composited-animations': 'off',

        // ============================================================
        // ENABLED: ACCESSIBILITY (always on)
        // ============================================================
        'color-contrast': 'error',
        // Label-content-name-mismatch: Ensures aria-labels match visible text
        'label-content-name-mismatch': 'error',
      },
    },
  },
};

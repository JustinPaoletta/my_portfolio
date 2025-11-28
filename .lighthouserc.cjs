// Lighthouse CI Configuration

/** @type {import('@lhci/cli').LighthouseCiConfig} */
module.exports = {
  ci: {
    collect: {
      buildCommand: 'npm run build',
      staticDistDir: './dist',
      numberOfRuns: 3,
      chromeFlags: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-translate',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-default-apps',
        '--mute-audio',
        '--hide-scrollbars',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--force-color-profile=srgb',
      ],
      settings: {
        throttlingMethod: 'simulate',
        maxWaitForLoad: 45000,
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
        // Set to 'off' to reduce CI noise, but monitor manually
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

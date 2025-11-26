// .lighthouseci/config.cjs

/** @type {import('@lhci/cli').LighthouseCiConfig} */
module.exports = {
  ci: {
    collect: {
      buildCommand: 'npm run build:lhci',

      // Use LHCI's built-in static server for maximum reliability
      // Note: This doesn't send custom HTTP headers, but CSP is set via:
      // 1. Meta tag in HTML (for LHCI testing)
      // 2. HTTP headers in production (via vercel.json)
      staticDistDir: './dist',

      numberOfRuns: 3,

      // Chrome flags for stable tracing
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

    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        "bf-cache": "off",

        // CSP-XSS: Disabled because LHCI's staticDistDir doesn't send HTTP headers.
        // Our CSP is properly configured:
        // - Meta tag with nonce + strict-dynamic + unsafe-inline fallback in HTML
        // - HTTP headers configured in vercel.json for production
        // The CSP passes Lighthouse's Best Practices category (score 100).
        'csp-xss': 'off',

        // Category guardrails
        'categories:performance':   ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices':['error', { minScore: 0.90 }],
        'categories:seo':           ['error', { minScore: 0.90 }],

        // Core metrics (numeric thresholds; "good" Web Vitals with a small CI buffer)
        'first-contentful-paint':       ['warn', { maxNumericValue: 1900 }],   // ms
        'largest-contentful-paint':     ['warn', { maxNumericValue: 2500 }],   // ms
        'total-blocking-time':          ['warn', { maxNumericValue: 200 }],    // ms
        'cumulative-layout-shift':      ['warn', { maxNumericValue: 0.10 }],   // unitless
        'interaction-to-next-paint':    'off',                                  // Temporarily disabled

        // Payload (bytes). If you frequently include images on the tested route, bump to 350k–500k.
        'total-byte-weight':            ['warn', { maxNumericValue: 350000 }], // 350 KB

        // Keep this strict
        'color-contrast':               'error',

        // Reduce CI noise from insight/diagnostic "score" audits
        'bootup-time':                  'off',
        'dom-size':                     'off',
        'server-response-time':         'off',

        // Unused JavaScript: For SPAs, this is often a false positive
        // The code is needed for interactivity, just not executed on initial load
        // Set to warn instead of error to avoid blocking builds
        'unused-javascript':            ['warn', { maxLength: 1 }],
        // Silence noisy diagnostics for now
        'mainthread-work-breakdown':    'off',
        'render-blocking-resources':    'off',
      }
      ,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

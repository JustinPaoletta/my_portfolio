// .lighthouseci/config.cjs
/** @type {import('@lhci/cli').LighthouseCiConfig} */
module.exports = {
  ci: {
    collect: {
      // LHCI will spin up its own static server for this folder
      staticDistDir: './dist',

      // Paths to audit (relative to staticDistDir). Add more if you have routes.
      url: ['/', '/index.html'],

      numberOfRuns: 3,

      // Headless Chrome stability in CI
      chromeFlags: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],

      // Keep throttling simulated unless you specifically want devtools throttling
      settings: {
        throttlingMethod: 'simulate',
      },
    },

    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'color-contrast': 'error',
        'image-alt': 'error',
        'aria-allowed-attr': 'error',
      },
    },

    upload: {
      target: 'temporary-public-storage',
    },
  },
};

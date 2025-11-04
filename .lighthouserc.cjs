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
        // Categories
        'categories:performance': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],

        // Real issues you care about
        'unsized-images': ['error', { minScore: 1 }],
        'errors-in-console': 'warn',

        // Don’t assert on “insights” (informative, no score)
        'network-dependency-tree-insight': 'off',
        'render-blocking-insight': 'off',

        // Be pragmatic on noisy perf items from vendor bundles
        'unused-javascript': ['warn', { maxLength: 3 }],
        'legacy-javascript': ['warn', { maxLength: 1 }],
        'render-blocking-resources': ['warn', { maxLength: 2 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      startServerCommand: 'npx vite preview --port 4173 --host 0.0.0.0',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 120000,
      numberOfRuns: 3,
      settings: {
        chromeFlags:
          '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu',
        skipAudits: [],
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
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        // Accessibility checks
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

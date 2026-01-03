import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Default test environment values for CI/CD where .env files don't exist
const testEnvDefaults: Record<string, string> = {
  VITE_APP_TITLE: 'Test App',
  VITE_APP_DESCRIPTION: 'Test description for unit tests',
  VITE_API_URL: 'https://api.test.example.com',
  VITE_API_TIMEOUT: '5000',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_DEBUG: 'false',
  VITE_ENABLE_ERROR_MONITORING: 'false',
  VITE_UMAMI_WEBSITE_ID: '',
  VITE_UMAMI_SRC: 'https://cloud.umami.is/script.js',
  VITE_NEWRELIC_ACCOUNT_ID: '',
  VITE_NEWRELIC_TRUST_KEY: '',
  VITE_NEWRELIC_AGENT_ID: '',
  VITE_NEWRELIC_LICENSE_KEY: '',
  VITE_NEWRELIC_APPLICATION_ID: '',
  VITE_NEWRELIC_AJAX_DENY_LIST: '',
  VITE_APP_VERSION: '1.0.0',
  VITE_GITHUB_URL: 'https://github.com/test',
  VITE_LINKEDIN_URL: 'https://linkedin.com/in/test',
  VITE_EMAIL: 'test@example.com',
  VITE_SITE_URL: 'https://test.example.com',
  VITE_MAPBOX_TOKEN: '',
};

export default defineConfig(({ mode }) => {
  const testMode = mode || 'test';
  const loadedEnv = loadEnv(testMode, process.cwd(), '');

  // Merge loaded env with defaults (loaded env takes precedence)
  const env = { ...testEnvDefaults, ...loadedEnv };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'virtual:pwa-register/react': path.resolve(
          __dirname,
          './src/test/mocks/pwa-register.ts'
        ),
      },
    },
    define: {
      'import.meta.env.MODE': JSON.stringify(testMode),
      __ENABLE_ANALYTICS__: JSON.stringify(false),
      __ENABLE_ERROR_MONITORING__: JSON.stringify(false),
      __ENABLE_DEBUG_TOOLS__: JSON.stringify(false),
      ...Object.keys(env).reduce(
        (acc, key) => {
          if (key.startsWith('VITE_')) {
            acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      testTimeout: 10_000,
      hookTimeout: 30_000,
      pool: 'forks',
      isolate: false,
      exclude: ['node_modules', 'dist', 'e2e', '**/*.e2e.spec.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
        all: true,
        exclude: [
          'node_modules/',
          'dist/',
          'e2e/',
          '**/*.e2e.spec.ts',
          '**/*.spec.ts',
          '**/*.test.ts',
          '**/*.spec.tsx',
          '**/*.test.tsx',
          '**/test/',
          '**/*.config.ts',
          '**/*.config.js',
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/config/env.ts',
          '**/*.css',
          '**/*.svg',
          '**/*.png',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.gif',
          '**/*.webp',
        ],
        thresholds: {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
      },
    },
  };
});

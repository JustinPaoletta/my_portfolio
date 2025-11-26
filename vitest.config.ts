import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the actual mode
  // Defaults to 'test' if no mode is specified
  const testMode = mode || 'test';

  // For testing, we want to validate the mode-specific file in isolation
  // loadEnv merges .env + .env.[mode], so we use loadEnv but prioritize validation
  // This ensures we catch missing/invalid variables in that specific environment
  // Note: loadEnv automatically merges .env + .env.[mode], with .env.[mode] taking precedence
  const env = loadEnv(testMode, process.cwd(), '');

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
    // Define environment variables so they're available in import.meta.env
    define: {
      'import.meta.env.MODE': JSON.stringify(testMode),
      // Define global feature flags (must match vite.config.ts)
      // These are disabled in test mode to prevent side effects
      __ENABLE_ANALYTICS__: JSON.stringify(false),
      __ENABLE_ERROR_MONITORING__: JSON.stringify(false),
      __ENABLE_DEBUG_TOOLS__: JSON.stringify(false),
      // Expose all VITE_ prefixed env variables from the mode-specific .env file
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
      exclude: ['node_modules', 'dist', 'e2e', '**/*.e2e.spec.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
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

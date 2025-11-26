import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import fs from 'node:fs';
import { sitemapPlugin } from './scripts/vite-plugin-sitemap';
import { cspPlugin } from './scripts/vite-plugin-csp';
import { inlineCssPlugin } from './scripts/vite-plugin-inline-css';
import { pwaConfig } from './src/pwa-config';

// KBs
const BUNDLE_SIZE_LIMITS = {
  appChunk: 200,
  vendorChunk: 500,
  totalSize: 800,
  cssFile: 50,
};

function bundleSizeLimit(): Plugin {
  return {
    name: 'bundle-size-limit',
    enforce: 'post',
    closeBundle() {
      const distPath = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distPath)) return;

      const errors: string[] = [];
      let totalSize = 0;

      const assetsPath = path.join(distPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        const files = fs.readdirSync(assetsPath);
        for (const file of files) {
          if (file.endsWith('.map')) continue;

          const stats = fs.statSync(path.join(assetsPath, file));
          const sizeKB = stats.size / 1024;
          totalSize += sizeKB;

          if (file.endsWith('.js')) {
            const limit = file.includes('vendor')
              ? BUNDLE_SIZE_LIMITS.vendorChunk
              : BUNDLE_SIZE_LIMITS.appChunk;
            if (sizeKB > limit) {
              errors.push(
                `❌ ${file}: ${sizeKB.toFixed(2)} KB (limit: ${limit} KB)`
              );
            } else {
              console.log(
                `✅ ${file}: ${sizeKB.toFixed(2)} KB (limit: ${limit} KB)`
              );
            }
          } else if (file.endsWith('.css')) {
            const limit = BUNDLE_SIZE_LIMITS.cssFile;
            if (sizeKB > limit) {
              errors.push(
                `❌ ${file}: ${sizeKB.toFixed(2)} KB (limit: ${limit} KB)`
              );
            } else {
              console.log(
                `✅ ${file}: ${sizeKB.toFixed(2)} KB (limit: ${limit} KB)`
              );
            }
          }
        }
      }

      console.log(
        `\n📦 Total bundle size: ${totalSize.toFixed(2)} KB (limit: ${BUNDLE_SIZE_LIMITS.totalSize} KB)`
      );
      if (totalSize > BUNDLE_SIZE_LIMITS.totalSize) {
        errors.push(
          `❌ Total bundle size ${totalSize.toFixed(2)} KB exceeds ${BUNDLE_SIZE_LIMITS.totalSize} KB`
        );
      }

      if (errors.length) {
        console.error('\n🚨 Bundle size limit exceeded:\n' + errors.join('\n'));
        console.error(
          '\n💡 Consider:\n   - Code splitting\n   - Dynamic imports\n   - Tree shaking\n   - npm run analyze\n'
        );
        throw new Error('Build failed due to bundle size limits');
      } else {
        console.log('\n✅ All bundle size checks passed!\n');
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const toBoolean = (value: string | undefined) =>
    value === 'true' || value === '1';

  const isAnalyze = env.ANALYZE === 'true';

  const analyticsEnabled = toBoolean(env.VITE_ENABLE_ANALYTICS);
  const errorMonitoringEnabled = toBoolean(env.VITE_ENABLE_ERROR_MONITORING);
  const debugEnabled = toBoolean(env.VITE_ENABLE_DEBUG);

  return {
    base: '/',

    plugins: [
      react(),
      VitePWA(pwaConfig),
      bundleSizeLimit(),
      sitemapPlugin(),
      inlineCssPlugin(), // Inline small CSS files to eliminate render-blocking resources
      cspPlugin(), // CSP plugin runs after CSS inlining to ensure inline styles are allowed
    ],

    define: {
      __ENABLE_ANALYTICS__: JSON.stringify(analyticsEnabled),
      __ENABLE_ERROR_MONITORING__: JSON.stringify(errorMonitoringEnabled),
      __ENABLE_DEBUG_TOOLS__: JSON.stringify(debugEnabled),
    },

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    // esbuild options for production builds
    esbuild: {
      drop: ['console', 'debugger'], // remove console/debugger
    },

    build: {
      chunkSizeWarningLimit: 400,
      sourcemap: isAnalyze,
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // 4KBs
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Split React into its own chunk
              if (id.includes('react') || id.includes('react-dom'))
                return 'vendor-react';
              // Split New Relic into its own chunk for better caching
              if (id.includes('@newrelic')) return 'vendor-newrelic';
              // Other vendor code
              return 'vendor';
            }
          },
          // Optimize chunk filenames for better caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
        // Tree-shake more aggressively
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      target: 'es2022',
      // Improve build performance
      reportCompressedSize: true,
    },
  };
});

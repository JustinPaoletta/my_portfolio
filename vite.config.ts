import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import fs from 'node:fs';
import { sitemapPlugin } from './plugins/vite-plugin-sitemap';
import { inlineCssPlugin } from './plugins/vite-plugin-inline-css';
import { pwaConfig } from './src/pwa-config';

/**
 * Plugin to exclude API directory from Vite processing
 * API files are serverless functions that only run on Vercel
 */
function excludeApiDirectory(): Plugin {
  const apiDir = path.resolve(__dirname, 'api');
  return {
    name: 'exclude-api-directory',
    enforce: 'pre',
    resolveId(id, importer) {
      // Exclude API directory files from Vite processing
      const isApiFile =
        id.includes('/api/') ||
        id.includes('\\api\\') ||
        id.startsWith('./api/') ||
        id.startsWith('../api/') ||
        (importer &&
          (importer.includes('/api/') || importer.includes('\\api\\'))) ||
        id.startsWith(apiDir) ||
        (importer && importer.startsWith(apiDir));

      if (isApiFile) {
        return { id, external: true };
      }
      // Exclude @upstash/redis from client bundle (only when imported from API files)
      if (
        (id === '@upstash/redis' || id.startsWith('@upstash/redis/')) &&
        importer &&
        importer.includes('/api/')
      ) {
        return { id, external: true };
      }
      return null;
    },
    load(id) {
      // Skip loading API files
      if (
        id.includes('/api/') ||
        id.includes('\\api\\') ||
        id.startsWith(apiDir)
      ) {
        return '';
      }
      return null;
    },
  };
}

const BUNDLE_SIZE_LIMITS = {
  appChunk: 150,
  vendorChunk: 400,
  totalSize: 650,
  // CSS optimized to stay under 60KB uncompressed
  cssFile: 60,
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
        throw new Error('Build failed due to bundle size limits');
      } else {
        console.log('\n✅ All bundle size checks passed!\n');
      }
    },
  };
}

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
      excludeApiDirectory(),
      react(),
      VitePWA(pwaConfig),
      bundleSizeLimit(),
      sitemapPlugin(),
      inlineCssPlugin(),
    ],
    define: {
      __ENABLE_ANALYTICS__: JSON.stringify(analyticsEnabled),
      __ENABLE_ERROR_MONITORING__: JSON.stringify(errorMonitoringEnabled),
      __ENABLE_DEBUG_TOOLS__: JSON.stringify(debugEnabled),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      fs: {
        // Deny access to API directory (serverless functions only)
        deny: [path.resolve(__dirname, 'api')],
      },
    },
    optimizeDeps: {
      exclude: ['@upstash/redis'],
    },
    build: {
      chunkSizeWarningLimit: 400,
      sourcemap: isAnalyze,
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom'))
                return 'vendor-react';
              // Keep newrelic separate for lazy loading and caching
              if (id.includes('@newrelic')) return 'vendor-newrelic';
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      target: 'es2022',
      reportCompressedSize: true,
    },
  };
});

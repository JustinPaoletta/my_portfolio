import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import fs from 'node:fs';
import { sitemapPlugin } from './scripts/vite-plugin-sitemap';
import { pwaConfig } from './src/pwa-config';

// Bundle size limits in KB
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

const isCI = process.env.CI === 'true';
const isAnalyze = process.env.ANALYZE === 'true';

// https://vite.dev/config/
export default defineConfig({
  // Critical for LHCI staticDistDir to resolve asset URLs predictably
  base: '/',

  plugins: [
    react(),
    // Disable PWA in CI to avoid SW/registration interfering with LHCI static server
    ...(isCI ? [] : [VitePWA(pwaConfig)]),
    bundleSizeLimit(),
    sitemapPlugin(),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    chunkSizeWarningLimit: 400,
    sourcemap: isAnalyze,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom'))
              return 'vendor-react';
            return 'vendor';
          }
        },
      },
    },
    target: 'es2020',
  },
});

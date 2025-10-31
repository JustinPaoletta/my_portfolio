import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Bundle size limits in KB
const BUNDLE_SIZE_LIMITS = {
  // Main application chunk (your code)
  appChunk: 200, // 200 KB
  // Vendor chunks (libraries)
  vendorChunk: 500, // 500 KB
  // Total bundle size
  totalSize: 800, // 800 KB
  // CSS files
  cssFile: 50, // 50 KB
};

/**
 * Plugin to enforce bundle size limits and fail the build if exceeded
 */
function bundleSizeLimit(): Plugin {
  return {
    name: 'bundle-size-limit',
    enforce: 'post',
    closeBundle() {
      const distPath = path.resolve(__dirname, 'dist');

      if (!fs.existsSync(distPath)) {
        return;
      }

      const errors: string[] = [];
      let totalSize = 0;

      // Read all files in dist/assets
      const assetsPath = path.join(distPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        const files = fs.readdirSync(assetsPath);

        files.forEach((file: string) => {
          // Skip source maps - they're not served in production
          if (file.endsWith('.map')) {
            return;
          }

          const filePath = path.join(assetsPath, file);
          const stats = fs.statSync(filePath);
          const sizeKB = stats.size / 1024;
          totalSize += sizeKB;

          // Check individual file limits
          if (file.endsWith('.js')) {
            let limit = BUNDLE_SIZE_LIMITS.appChunk;

            // Vendor chunks have higher limits
            if (file.includes('vendor')) {
              limit = BUNDLE_SIZE_LIMITS.vendorChunk;
            }

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
        });
      }

      // Check total bundle size
      console.log(
        `\n📦 Total bundle size: ${totalSize.toFixed(2)} KB (limit: ${BUNDLE_SIZE_LIMITS.totalSize} KB)`
      );

      if (totalSize > BUNDLE_SIZE_LIMITS.totalSize) {
        errors.push(
          `❌ Total bundle size ${totalSize.toFixed(2)} KB exceeds limit of ${BUNDLE_SIZE_LIMITS.totalSize} KB`
        );
      }

      // Fail the build if any limits exceeded
      if (errors.length > 0) {
        console.error('\n🚨 Bundle size limit exceeded:\n');
        errors.forEach((error) => console.error(error));
        console.error('\n💡 Consider:');
        console.error('   - Code splitting');
        console.error('   - Dynamic imports');
        console.error('   - Tree shaking unused code');
        console.error('   - Analyzing bundle with: npm run analyze\n');
        throw new Error('Build failed due to bundle size limits');
      } else {
        console.log('\n✅ All bundle size checks passed!\n');
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), bundleSizeLimit()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Show warning at 400KB (but won't fail build, our plugin handles that)
    chunkSizeWarningLimit: 400,
    sourcemap: process.env.ANALYZE === 'true',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});

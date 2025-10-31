import type { Plugin } from 'vite';
import { generateSitemap } from './generate-sitemap';

/**
 * Vite plugin to automatically generate sitemap during build
 */
export function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap-generator',
    apply: 'build', // Only run during build
    closeBundle() {
      try {
        generateSitemap();
      } catch (error) {
        console.error('❌ Failed to generate sitemap:', error);
        // Don't fail the build, just warn
      }
    },
  };
}

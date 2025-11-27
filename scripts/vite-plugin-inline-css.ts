import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Vite plugin to inline small CSS files into HTML to eliminate render-blocking resources
 * This improves Lighthouse scores by removing the CSS file request
 */
export function inlineCssPlugin(): Plugin {
  return {
    name: 'vite-plugin-inline-css',
    apply: 'build', // Only run during build
    closeBundle() {
      const distPath = path.resolve(__dirname, '../dist');
      const indexPath = path.join(distPath, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.warn('⚠️  index.html not found, skipping CSS inlining');
        return;
      }

      try {
        let html = fs.readFileSync(indexPath, 'utf-8');

        // Find CSS link tags
        const cssLinkRegex =
          /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/g;
        const cssLinks: Array<{ fullTag: string; href: string }> = [];
        let match;

        while ((match = cssLinkRegex.exec(html)) !== null) {
          cssLinks.push({
            fullTag: match[0],
            href: match[1],
          });
        }

        // Inline each CSS file that's small enough (< 5KB)
        for (const { fullTag, href } of cssLinks) {
          // Resolve the CSS file path
          const cssPath = path.join(
            distPath,
            href.startsWith('/') ? href.slice(1) : href
          );

          if (fs.existsSync(cssPath)) {
            const stats = fs.statSync(cssPath);
            const sizeKB = stats.size / 1024;

            // Only inline CSS files smaller than 5KB to avoid bloating HTML
            if (sizeKB < 5) {
              const cssContent = fs.readFileSync(cssPath, 'utf-8');

              // Replace the link tag with inline style tag
              const inlineStyle = `<style>${cssContent}</style>`;
              html = html.replace(fullTag, inlineStyle);

              // Delete the CSS file since it's now inlined
              fs.unlinkSync(cssPath);
              console.log(`✅ Inlined CSS: ${href} (${sizeKB.toFixed(2)} KB)`);
            } else {
              console.log(
                `⏭️  Skipped inlining large CSS: ${href} (${sizeKB.toFixed(2)} KB)`
              );
            }
          }
        }

        // Write the updated HTML
        fs.writeFileSync(indexPath, html, 'utf-8');
      } catch (error) {
        console.error('❌ Failed to inline CSS:', error);
        // Don't throw - this is an optimization, not critical
      }
    },
  };
}

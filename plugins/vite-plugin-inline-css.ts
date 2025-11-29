import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Vite plugin to eliminate some render-blocking resources.
 * Improves Lighthouse scores by removing the request for CSS.
 */
export function inlineCssPlugin(): Plugin {
  return {
    name: 'vite-plugin-inline-css',
    apply: 'build', // runs only during build phase
    closeBundle() {
      const distPath = path.resolve(__dirname, '../dist');
      const indexPath = path.join(distPath, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.warn('⚠️  index.html not found, skipping CSS inlining');
        return;
      }

      try {
        let html = fs.readFileSync(indexPath, 'utf-8');

        // gather CSS link tags
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

        for (const { fullTag, href } of cssLinks) {
          const cssPath = path.join(
            distPath,
            href.startsWith('/') ? href.slice(1) : href
          );

          if (fs.existsSync(cssPath)) {
            const stats = fs.statSync(cssPath);
            const sizeKB = stats.size / 1024;

            // inline CSS files smaller than 5KB
            if (sizeKB < 5) {
              const cssContent = fs.readFileSync(cssPath, 'utf-8');

              // replace link with inline style tag
              const inlineStyle = `<style>${cssContent}</style>`;
              html = html.replace(fullTag, inlineStyle);

              // delete the CSS file once it's inlined
              fs.unlinkSync(cssPath);
              console.log(`Inlined CSS: ${href} (${sizeKB.toFixed(2)} KB)`);
            } else {
              console.log(
                `Skipped inlining large CSS: ${href} (${sizeKB.toFixed(2)} KB)`
              );
            }
          }
        }

        // update the HTML file with the inlined CSS
        fs.writeFileSync(indexPath, html, 'utf-8');
      } catch (error) {
        console.error('Failed to inline CSS:', error);
      }
    },
  };
}

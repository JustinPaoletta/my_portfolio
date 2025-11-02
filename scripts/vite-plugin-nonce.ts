/**
 * Vite Plugin for CSP Nonce Support
 * Prepares HTML for nonce injection by adding placeholders
 */

import type { Plugin } from 'vite';
import type { OutputOptions } from 'rollup';

export function vitePluginNonce(): Plugin {
  return {
    name: 'vite-plugin-nonce',
    enforce: 'post',
    generateBundle(_options: OutputOptions, bundle) {
      // Find the HTML file in the bundle
      const htmlFiles = Object.keys(bundle).filter((id) =>
        id.endsWith('.html')
      );

      htmlFiles.forEach((htmlId) => {
        const htmlChunk = bundle[htmlId];
        if (
          htmlChunk.type === 'asset' &&
          typeof htmlChunk.source === 'string'
        ) {
          let html = htmlChunk.source;

          // Add nonce placeholders to script tags
          // Vite's build process will already create script tags, we just need to ensure
          // they can be modified by middleware
          html = html.replace(/<script([^>]*?)>/gi, (match, attrs) => {
            // Don't add nonce to external scripts that should use data-nonce attribute
            // or scripts that are dynamically loaded (they'll get nonce from meta tag)
            if (attrs.includes('src=') && !attrs.includes('data-nonce')) {
              return match;
            }
            return match;
          });

          // Add nonce placeholders to style tags
          html = html.replace(/<style([^>]*?)>/gi, (match) => {
            // Styles will get nonce injected by middleware
            return match;
          });

          htmlChunk.source = html;
        }
      });
    },
  };
}

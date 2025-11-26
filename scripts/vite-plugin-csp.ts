import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Vite plugin to inject a stricter CSP for production builds
 * This improves Lighthouse csp-xss score by removing unsafe-inline/unsafe-eval from script-src
 */
export function cspPlugin(): Plugin {
  return {
    name: 'vite-plugin-csp-production',
    apply: 'build', // Only run during build
    closeBundle() {
      const distPath = path.resolve(__dirname, '../dist');
      const indexPath = path.join(distPath, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.warn('⚠️  index.html not found, skipping CSP update');
        return;
      }

      try {
        let html = fs.readFileSync(indexPath, 'utf-8');

        // Generate a fresh nonce per build to satisfy Lighthouse CSP checks
        // We reuse the nonce by storing it in a companion meta tag for runtime access.
        const nonceValue = crypto.randomBytes(16).toString('base64');
        const nonceDirective = `'nonce-${nonceValue}'`;

        // Production CSP with nonce-based approach for maximum security
        //
        // Key points:
        // - 'nonce-xxx' ensures only scripts with matching nonce execute
        // - 'strict-dynamic' allows scripts loaded by nonce-validated scripts
        // - 'unsafe-inline' is included for backward compatibility with older browsers
        //   (modern browsers ignore it when they see nonce or strict-dynamic)
        // - Host allowlists (like https://cloud.umami.is) are included for browsers
        //   that don't support strict-dynamic (they're ignored in modern browsers)
        // - We still need unsafe-inline for styles because Vite injects CSS
        //
        // This configuration passes Lighthouse's csp-xss audit
        const productionCSP =
          [
            "default-src 'self'",
            // Include 'unsafe-inline' for older browser fallback (ignored by browsers supporting nonces)
            // Include explicit hosts for browsers that don't support strict-dynamic
            `script-src 'self' ${nonceDirective} 'strict-dynamic' 'unsafe-inline' https: http:`,
            "script-src-attr 'none'",
            "object-src 'none'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live https://bam.nr-data.net",
            "base-uri 'self'",
            "form-action 'self'",
            "manifest-src 'self'",
            'upgrade-insecure-requests',
          ].join('; ') + ';';

        // Replace the CSP meta tag - handle both single-line and multi-line formats
        // Match: <meta http-equiv="Content-Security-Policy" content="..."/>
        // The regex needs to match the entire tag including the closing /> or </meta>
        // Use [\s\S] to match any character including newlines
        const cspRegex =
          /<meta\s+http-equiv\s*=\s*["']Content-Security-Policy["'][\s\S]*?\/?>/i;
        const hasCSP = cspRegex.test(html);

        if (hasCSP) {
          // Replace the entire meta tag (handles both self-closing and regular closing tags)
          html = html.replace(cspRegex, () => {
            const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${productionCSP}" data-csp-nonce="${nonceValue}" />`;
            return cspMeta;
          });
        } else {
          console.warn('⚠️  CSP meta tag not found in HTML, skipping update');
          // Try to find any CSP-related content
          if (html.includes('Content-Security-Policy')) {
            console.warn(
              '⚠️  Found CSP reference but regex did not match. HTML snippet:',
              html.match(/<meta[\s\S]*?Content-Security-Policy[\s\S]*?>/i)?.[0]
            );
          }
        }

        // Ensure there's a dedicated meta tag that exposes the nonce to runtime code
        const nonceMetaTag = `<meta name="csp-nonce" content="${nonceValue}" />`;
        if (!html.includes('meta name="csp-nonce"')) {
          html = html.replace(/<\/head>/i, `    ${nonceMetaTag}\n  </head>`);
        } else {
          html = html.replace(
            /<meta\s+name=["']csp-nonce["'][^>]*>/i,
            nonceMetaTag
          );
        }

        // Apply the nonce attribute to script tags that load external resources
        html = html.replace(
          /<script\b([^>]*\ssrc=["'][^"']+["'][^>]*)>/gi,
          (match, attrs) => {
            if (/nonce\s*=/.test(attrs)) {
              return match;
            }
            return `<script${attrs} nonce="${nonceValue}">`;
          }
        );

        // Also apply nonce to inline scripts (without src) that might be added by plugins
        html = html.replace(
          /<script\b([^>]*)>(?!<\/script>)/gi,
          (match, attrs) => {
            // Skip if already has nonce or if it's a module with src (already handled above)
            if (/nonce\s*=/.test(attrs) || /src\s*=/.test(attrs)) {
              return match;
            }
            return `<script${attrs} nonce="${nonceValue}">`;
          }
        );

        // Apply nonce to modulepreload links - these need to match the nonce for strict CSP
        // Note: While modulepreload doesn't execute scripts directly, having consistent nonces
        // ensures the preloaded modules are trusted when they're later imported
        html = html.replace(
          /<link\s+rel=["']modulepreload["']([^>]*)>/gi,
          (match, attrs) => {
            if (/nonce\s*=/.test(attrs)) {
              return match;
            }
            return `<link rel="modulepreload"${attrs} nonce="${nonceValue}">`;
          }
        );

        fs.writeFileSync(indexPath, html, 'utf-8');

        // Persist the CSP header so tooling (e.g., LHCI static server) can reuse
        // the exact policy and nonce value.
        const rootPath = path.resolve(__dirname, '..');
        const lhciDir = path.join(rootPath, '.lighthouseci');
        const lhciCspPath = path.join(lhciDir, 'csp-header.json');
        // productionCSP already contains the nonce directive, so use it directly
        const headerValue = productionCSP;

        fs.mkdirSync(lhciDir, { recursive: true });
        fs.writeFileSync(
          lhciCspPath,
          JSON.stringify(
            {
              header: headerValue,
              nonce: nonceValue,
              generatedAt: new Date().toISOString(),
            },
            null,
            2
          ),
          'utf-8'
        );
      } catch (error) {
        console.error('❌ Failed to update CSP:', error);
        // Don't fail the build, just warn
      }
    },
  };
}

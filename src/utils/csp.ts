/**
 * Utility helpers for working with CSP during runtime.
 */

/**
 * Retrieve the CSP nonce that the build pipeline injected into the HTML.
 * We expose it via `meta[name="csp-nonce"]` so runtime-injected scripts can comply
 * with the Content-Security-Policy without needing unsafe-inline.
 */
export function getCspNonce(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const metaTag = document.querySelector('meta[name="csp-nonce"]');
  if (metaTag instanceof HTMLMetaElement && metaTag.content) {
    return metaTag.content;
  }

  const cspMeta = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"][data-csp-nonce]'
  );
  if (cspMeta instanceof HTMLMetaElement && cspMeta.dataset.cspNonce) {
    return cspMeta.dataset.cspNonce;
  }

  return undefined;
}

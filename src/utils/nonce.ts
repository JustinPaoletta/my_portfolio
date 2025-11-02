/**
 * CSP Nonce Utility
 * Provides access to the CSP nonce for dynamically injected scripts and styles
 */

/**
 * Get the CSP nonce from the meta tag
 * This nonce is injected by the Vercel middleware
 * @returns The nonce value or empty string if not found
 */
export function getNonce(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  const metaTag = document.querySelector('meta[name="csp-nonce"]');
  if (metaTag) {
    const nonce = metaTag.getAttribute('content');
    return nonce || '';
  }

  return '';
}

/**
 * Apply nonce to a script element
 * @param script - The script element to apply nonce to
 */
export function applyNonceToScript(script: HTMLScriptElement): void {
  const nonce = getNonce();
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }
}

/**
 * Apply nonce to a style element
 * @param style - The style element to apply nonce to
 */
export function applyNonceToStyle(style: HTMLStyleElement): void {
  const nonce = getNonce();
  if (nonce) {
    style.setAttribute('nonce', nonce);
  }
}

/**
 * Apply nonce to a link element (for stylesheets)
 * @param link - The link element to apply nonce to
 */
export function applyNonceToLink(link: HTMLLinkElement): void {
  const nonce = getNonce();
  if (nonce && (link.rel === 'stylesheet' || link.rel === 'modulepreload')) {
    link.setAttribute('nonce', nonce);
  }
}

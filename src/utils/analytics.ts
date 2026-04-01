/**
 * Umami Analytics Utility
 * Lazily injects the Umami script when analytics is enabled.
 */
import { env } from '@/config/env';
import { isAutomatedClient } from '@/utils/userAgent';

// Check if we're in CI environment (analytics disabled in CI)
const mode = import.meta.env.MODE;
const isCI = mode === 'test';
const analyticsEnabled = __ENABLE_ANALYTICS__;
const shouldLog = import.meta.env.DEV && __ENABLE_DEBUG_TOOLS__;

// Extend Window interface for Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Initialize Umami Analytics
 * Injects the tracking script into the page
 */
export async function initializeAnalytics(): Promise<void> {
  if (!analyticsEnabled) {
    if (shouldLog) {
      console.log('[Analytics] Skipped - disabled by feature flag');
    }
    return;
  }

  if (isCI) {
    if (shouldLog) {
      console.log('[Analytics] Skipped - CI environment');
    }
    return;
  }

  if (!env.features.analytics || !env.analytics.umami.websiteId) {
    if (shouldLog) {
      console.log('[Analytics] Skipped - disabled or not configured');
    }
    return;
  }

  if (isAutomatedClient()) {
    if (shouldLog) {
      console.log('[Analytics] Skipped - automated client detected');
    }
    return;
  }

  if (document.querySelector('[data-website-id]')) {
    if (shouldLog) {
      console.log('[Analytics] Already initialized');
    }
    return;
  }

  // Create and inject the Umami script
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = env.analytics.umami.src;
  script.setAttribute('data-website-id', env.analytics.umami.websiteId);
  script.setAttribute('data-auto-track', 'true');
  script.setAttribute('data-cache', 'true');

  document.head.appendChild(script);

  if (shouldLog) {
    console.log('[Analytics] Umami initialized');
  }
}

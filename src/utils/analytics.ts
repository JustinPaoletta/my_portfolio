/**
 * Umami Analytics Utility
 * Privacy-friendly analytics tracking
 */
import { env } from '@/config/env';

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

/**
 * Track custom events
 * @param eventName - Name of the event to track
 * @param eventData - Optional data to include with the event
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  if (!analyticsEnabled || isCI) {
    return;
  }

  if (window.umami && typeof window.umami.track === 'function') {
    window.umami.track(eventName, eventData);

    if (shouldLog) {
      console.log('[Analytics] Event tracked:', eventName, eventData);
    }
  } else if (shouldLog) {
    console.log('[Analytics] Umami not loaded, event skipped:', eventName);
  }
}

/**
 * Common event tracking functions for portfolio
 */
export const analytics = {
  /**
   * Track project link clicks
   */
  trackProjectClick: (projectName: string, linkType: 'demo' | 'github') => {
    trackEvent('project_click', {
      project: projectName,
      link_type: linkType,
    });
  },

  /**
   * Track resume/CV downloads
   */
  trackResumeDownload: () => {
    trackEvent('resume_download');
  },

  /**
   * Track contact interactions
   */
  trackContact: (method: 'email' | 'form' | 'linkedin') => {
    trackEvent('contact', { method });
  },

  /**
   * Track social link clicks
   */
  trackSocialClick: (platform: 'github' | 'linkedin' | 'twitter' | 'other') => {
    trackEvent('social_click', { platform });
  },

  /**
   * Track navigation to sections
   */
  trackNavigation: (section: string) => {
    trackEvent('navigation', { section });
  },

  /**
   * Track external link clicks
   */
  trackExternalLink: (url: string, label?: string) => {
    trackEvent('external_link', {
      url,
      label: label || 'unknown',
    });
  },

  /**
   * Track search or filter interactions
   */
  trackSearch: (query: string, category?: string) => {
    trackEvent('search', {
      query,
      category: category || 'general',
    });
  },

  /**
   * Track errors (client-side)
   */
  trackError: (errorType: string, errorMessage?: string) => {
    trackEvent('error', {
      type: errorType,
      message: errorMessage,
    });
  },
};

/**
 * Custom hook types for event tracking
 */
export type AnalyticsEvent = keyof typeof analytics;

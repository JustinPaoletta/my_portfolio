/**
 * Umami Analytics Utility
 * Privacy-friendly analytics tracking
 */

import { env } from '@/config/env';

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
  // Skip if analytics is disabled or no website ID is configured
  if (!env.features.analytics || !env.analytics.umami.websiteId) {
    if (env.app.isDevelopment) {
      console.log('[Analytics] Skipped - disabled or not configured');
    }
    return;
  }

  // Skip if script is already loaded
  if (document.querySelector('[data-website-id]')) {
    if (env.app.isDevelopment) {
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

  // Optional: Auto-track (enabled by default)
  script.setAttribute('data-auto-track', 'true');

  // Optional: Cache the tracking script
  script.setAttribute('data-cache', 'true');

  document.head.appendChild(script);

  if (env.app.isDevelopment) {
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
  // Skip if analytics is disabled
  if (!env.features.analytics) {
    return;
  }

  // Check if Umami is loaded
  if (window.umami && typeof window.umami.track === 'function') {
    window.umami.track(eventName, eventData);

    if (env.app.isDevelopment) {
      console.log('[Analytics] Event tracked:', eventName, eventData);
    }
  } else if (env.app.isDevelopment) {
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

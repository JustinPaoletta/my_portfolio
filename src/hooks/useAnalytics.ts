/**
 * React hook for analytics tracking
 * Provides easy access to analytics functions within components
 */

import { useCallback } from 'react';
import { analytics, trackEvent } from '@/utils/analytics';

/**
 * Hook for analytics tracking
 * @returns Object with tracking functions
 */
export function useAnalytics() {
  // Wrap analytics functions in useCallback to prevent unnecessary re-renders
  const trackProjectClick = useCallback(
    (projectName: string, linkType: 'demo' | 'github') => {
      analytics.trackProjectClick(projectName, linkType);
    },
    []
  );

  const trackResumeDownload = useCallback(() => {
    analytics.trackResumeDownload();
  }, []);

  const trackContact = useCallback((method: 'email' | 'form' | 'linkedin') => {
    analytics.trackContact(method);
  }, []);

  const trackSocialClick = useCallback(
    (platform: 'github' | 'linkedin' | 'twitter' | 'other') => {
      analytics.trackSocialClick(platform);
    },
    []
  );

  const trackNavigation = useCallback((section: string) => {
    analytics.trackNavigation(section);
  }, []);

  const trackExternalLink = useCallback((url: string, label?: string) => {
    analytics.trackExternalLink(url, label);
  }, []);

  const trackSearch = useCallback((query: string, category?: string) => {
    analytics.trackSearch(query, category);
  }, []);

  const trackError = useCallback((errorType: string, errorMessage?: string) => {
    analytics.trackError(errorType, errorMessage);
  }, []);

  // Generic event tracking
  const trackCustomEvent = useCallback(
    (eventName: string, eventData?: Record<string, unknown>) => {
      trackEvent(eventName, eventData);
    },
    []
  );

  return {
    trackProjectClick,
    trackResumeDownload,
    trackContact,
    trackSocialClick,
    trackNavigation,
    trackExternalLink,
    trackSearch,
    trackError,
    trackCustomEvent,
  };
}

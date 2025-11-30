/**
 * React hook for analytics tracking
 * Provides easy access to analytics functions within components
 */

import { useCallback } from 'react';

type AnalyticsModule = typeof import('@/utils/analytics');

let analyticsModule: AnalyticsModule | undefined;
let analyticsPromise: Promise<AnalyticsModule | undefined> | undefined;

const loadAnalytics: () => Promise<AnalyticsModule | undefined> =
  __ENABLE_ANALYTICS__
    ? () => {
        if (analyticsModule) {
          return Promise.resolve(analyticsModule);
        }

        if (!analyticsPromise) {
          analyticsPromise = import('@/utils/analytics')
            .then((mod) => {
              analyticsModule = mod;
              return mod;
            })
            .catch((error: unknown) => {
              if (import.meta.env.DEV) {
                const errorMessage =
                  error instanceof Error ? error.message : String(error);
                console.error(
                  '[Analytics] Failed to load analytics module',
                  errorMessage
                );
              }
              analyticsPromise = undefined;
              return undefined;
            });
        }

        return analyticsPromise;
      }
    : () => Promise.resolve(undefined);

function withAnalytics(execute: (module: AnalyticsModule) => void): void {
  if (!__ENABLE_ANALYTICS__) {
    return;
  }

  void loadAnalytics().then((mod) => {
    if (mod) {
      execute(mod);
    }
  });
}

/**
 * Return type for useAnalytics hook
 */
export interface UseAnalyticsReturn {
  trackProjectClick: (projectName: string, linkType: 'demo' | 'github') => void;
  trackResumeDownload: () => void;
  trackContact: (method: 'email' | 'form' | 'linkedin') => void;
  trackSocialClick: (
    platform: 'github' | 'linkedin' | 'twitter' | 'other'
  ) => void;
  trackNavigation: (section: string) => void;
  trackExternalLink: (url: string, label?: string) => void;
  trackSearch: (query: string, category?: string) => void;
  trackError: (errorType: string, errorMessage?: string) => void;
  trackCustomEvent: (
    eventName: string,
    eventData?: Record<string, unknown>
  ) => void;
}

/**
 * Hook for analytics tracking
 * @returns Object with tracking functions
 */
export function useAnalytics(): UseAnalyticsReturn {
  // Wrap analytics functions in useCallback to prevent unnecessary re-renders
  const trackProjectClick = useCallback(
    (projectName: string, linkType: 'demo' | 'github') => {
      withAnalytics(({ analytics }) =>
        analytics.trackProjectClick(projectName, linkType)
      );
    },
    []
  );

  const trackResumeDownload = useCallback(() => {
    withAnalytics(({ analytics }) => analytics.trackResumeDownload());
  }, []);

  const trackContact = useCallback((method: 'email' | 'form' | 'linkedin') => {
    withAnalytics(({ analytics }) => analytics.trackContact(method));
  }, []);

  const trackSocialClick = useCallback(
    (platform: 'github' | 'linkedin' | 'twitter' | 'other') => {
      withAnalytics(({ analytics }) => analytics.trackSocialClick(platform));
    },
    []
  );

  const trackNavigation = useCallback((section: string) => {
    withAnalytics(({ analytics }) => analytics.trackNavigation(section));
  }, []);

  const trackExternalLink = useCallback((url: string, label?: string) => {
    withAnalytics(({ analytics }) => analytics.trackExternalLink(url, label));
  }, []);

  const trackSearch = useCallback((query: string, category?: string) => {
    withAnalytics(({ analytics }) => analytics.trackSearch(query, category));
  }, []);

  const trackError = useCallback((errorType: string, errorMessage?: string) => {
    withAnalytics(({ analytics }) =>
      analytics.trackError(errorType, errorMessage)
    );
  }, []);

  // Generic event tracking
  const trackCustomEvent = useCallback(
    (eventName: string, eventData?: Record<string, unknown>) => {
      withAnalytics(({ trackEvent }) => trackEvent(eventName, eventData));
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

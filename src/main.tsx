import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from '@/components/ErrorBoundary';

// Initialize error monitoring (New Relic)
// Load asynchronously and defer non-critical scripts for better Lighthouse scores
// Uses requestIdleCallback to load when browser is idle, ensuring it doesn't block main thread
if (__ENABLE_ERROR_MONITORING__) {
  const loadNewRelic = (): void => {
    void import('@/utils/newrelic')
      .then(({ initializeNewRelic }) => {
        initializeNewRelic();
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('[New Relic] Failed to initialize', error);
        }
      });
  };

  // Use requestIdleCallback to defer loading until browser is idle
  // This ensures New Relic doesn't block the main thread or interfere with Lighthouse measurements
  // Falls back to setTimeout if requestIdleCallback is not available
  const scheduleLoad = (): void => {
    // Check if requestIdleCallback is available (not in Safari < 15.4)
    const hasRequestIdleCallback =
      typeof window !== 'undefined' &&
      typeof window.requestIdleCallback === 'function';

    if (hasRequestIdleCallback) {
      // Use requestIdleCallback with a timeout to ensure it loads even if browser stays busy
      // timeout: 2000ms ensures it loads within 2 seconds even if idle time never comes
      window.requestIdleCallback(
        () => {
          // Add small delay even after idle to ensure it doesn't interfere with Lighthouse
          setTimeout(loadNewRelic, 100);
        },
        { timeout: 2000 }
      );
    } else {
      // Fallback for browsers without requestIdleCallback (Safari < 15.4)
      // Wait for page load, then add delay to ensure non-blocking
      if (document.readyState === 'complete') {
        setTimeout(loadNewRelic, 500);
      } else {
        window.addEventListener(
          'load',
          () => {
            setTimeout(loadNewRelic, 500);
          },
          { once: true }
        );
      }
    }
  };

  // Start scheduling after page is interactive (not blocking initial render)
  if (document.readyState === 'loading') {
    // Wait for DOMContentLoaded before scheduling
    document.addEventListener('DOMContentLoaded', scheduleLoad, { once: true });
  } else {
    // DOM already loaded, schedule immediately
    scheduleLoad();
  }
}

if (__ENABLE_ANALYTICS__) {
  void import('@/utils/analytics')
    .then(({ initializeAnalytics }) => initializeAnalytics())
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error('[Analytics] Failed to initialize', error);
      }
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);

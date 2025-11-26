import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from '@/components/ErrorBoundary';

if (__ENABLE_ERROR_MONITORING__) {
  void import('@/utils/newrelic')
    .then(({ initializeNewRelic }) => {
      initializeNewRelic();
    })
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error('[New Relic] Failed to initialize', error);
      }
    });
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

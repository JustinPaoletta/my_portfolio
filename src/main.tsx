import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { initializeAnalytics } from '@/utils/analytics';
import { initSentry } from '@/config/sentry';
import ErrorBoundary from '@/components/ErrorBoundary';

// Initialize Sentry first for error tracking
initSentry();

// Initialize analytics before rendering
initializeAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);

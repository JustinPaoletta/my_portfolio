import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { initializeAnalytics } from '@/utils/analytics';
import { initializeNewRelic } from '@/utils/newrelic';
import ErrorBoundary from '@/components/ErrorBoundary';

// Initialize error monitoring first (before analytics and app rendering)
initializeNewRelic();

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

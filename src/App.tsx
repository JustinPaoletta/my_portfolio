/**
 * Main Application Component
 * Portfolio with parallax scrolling and animated sections
 */

import { Suspense, lazy, useCallback } from 'react';
import '@/App.css';
import SEO from '@/components/SEO';
import PWAUpdatePrompt from '@/components/pwa-update-prompt';
import Hero from '@/components/sections/Hero';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const Navigation = lazy(() => import('@/components/Navigation'));
const Footer = lazy(() => import('@/components/Footer'));
const NonCliSections = lazy(() => import('@/components/AppNonCliSections'));

function AppLayout(): React.ReactElement {
  const { themeName } = useTheme();
  const isCliTheme = themeName === 'cli';
  const handleSkipToMain = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();

      const main = document.getElementById('main');
      if (!(main instanceof HTMLElement)) {
        return;
      }

      main.focus();
      main.scrollIntoView();
      window.history.replaceState(null, '', '#main');
    },
    []
  );

  return (
    <>
      <SEO />
      <PWAUpdatePrompt />

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link" onClick={handleSkipToMain}>
        Skip to main content
      </a>

      {/* Fixed Navigation */}
      {!isCliTheme && (
        <Suspense fallback={null}>
          <Navigation />
        </Suspense>
      )}

      {/* Theme switcher - always floating bottom-right */}
      <ThemeSwitcher placement="floating" />

      {/* Main Content */}
      <main
        id="main"
        tabIndex={-1}
        className={
          isCliTheme ? 'main-content main-content--cli' : 'main-content'
        }
      >
        <Hero />
        {!isCliTheme && (
          <Suspense fallback={null}>
            <NonCliSections />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      {!isCliTheme && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </>
  );
}

export default function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

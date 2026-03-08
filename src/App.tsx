/**
 * Main Application Component
 * Portfolio with parallax scrolling and animated sections
 */

import { Suspense, lazy } from 'react';
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

  return (
    <>
      <SEO />
      <PWAUpdatePrompt />

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link">
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
        role="main"
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

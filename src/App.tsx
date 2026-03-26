/**
 * Main Application Component
 * Portfolio with parallax scrolling and animated sections
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import '@/App.css';
import '@/styles/reveal.css';
import DeferredSection from '@/components/DeferredSection';
import Hero from '@/components/sections/Hero';
import { SECTION_MANIFEST } from '@/config/section-manifest';
import {
  PORTFOLIO_REVEAL_TARGET_EVENT,
  type PortfolioRevealTargetDetail,
} from '@/constants/deferred-navigation';
import useIdleActivation from '@/hooks/useIdleActivation';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const Navigation = lazy(() => import('@/components/Navigation'));
const Footer = lazy(() => import('@/components/Footer'));
const PWAUpdatePrompt = lazy(() => import('@/components/pwa-update-prompt'));

function AppLayout(): React.ReactElement {
  const { themeName } = useTheme();
  const isCliTheme = themeName === 'cli';
  const shouldMountFeaturedSections = useIdleActivation({
    enabled: !isCliTheme,
  });
  const shouldMountPwaPrompt = useIdleActivation();
  const [revealedDeferredSectionIds, setRevealedDeferredSectionIds] = useState<
    string[]
  >([]);
  const [forcedDeferredSectionIds, setForcedDeferredSectionIds] = useState<
    string[]
  >([]);
  const revealedDeferredSectionIdSet = new Set(revealedDeferredSectionIds);
  const forcedDeferredSectionIdSet = new Set(forcedDeferredSectionIds);

  const handleDeferredSectionReveal = (sectionId: string): void => {
    setRevealedDeferredSectionIds((currentIds) =>
      currentIds.includes(sectionId) ? currentIds : [...currentIds, sectionId]
    );
  };

  useEffect(() => {
    const handleRevealTarget = (event: Event): void => {
      const customEvent = event as CustomEvent<PortfolioRevealTargetDetail>;
      const targetId = customEvent.detail?.targetId;

      if (!targetId) {
        return;
      }

      const targetIndex = SECTION_MANIFEST.findIndex(
        (section) => section.id === targetId
      );

      if (targetIndex === -1) {
        return;
      }

      const deferredSectionIds = SECTION_MANIFEST.slice(0, targetIndex + 1)
        .filter((section) => section.activation === 'deferred')
        .map((section) => section.id);

      setForcedDeferredSectionIds((currentIds) => {
        const nextIds = new Set([...currentIds, ...deferredSectionIds]);
        return Array.from(nextIds);
      });
    };

    window.addEventListener(PORTFOLIO_REVEAL_TARGET_EVENT, handleRevealTarget);

    return () => {
      window.removeEventListener(
        PORTFOLIO_REVEAL_TARGET_EVENT,
        handleRevealTarget
      );
    };
  }, []);

  return (
    <>
      {shouldMountPwaPrompt && (
        <Suspense fallback={null}>
          <PWAUpdatePrompt />
        </Suspense>
      )}

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
        {!isCliTheme &&
          shouldMountFeaturedSections &&
          SECTION_MANIFEST.map((section, index) => {
            const canRenderDeferredBoundary = SECTION_MANIFEST.slice(
              0,
              index
            ).every(
              (previousSection) =>
                previousSection.activation === 'idle' ||
                revealedDeferredSectionIdSet.has(previousSection.id) ||
                forcedDeferredSectionIdSet.has(previousSection.id)
            );

            const content = (
              <Suspense fallback={null}>
                <section.Component />
              </Suspense>
            );

            if (section.activation === 'idle') {
              return <div key={section.id}>{content}</div>;
            }

            if (!canRenderDeferredBoundary) {
              return null;
            }

            return (
              <DeferredSection
                key={section.id}
                forceVisible={forcedDeferredSectionIdSet.has(section.id)}
                rootMargin={section.rootMargin}
                onReveal={() => {
                  handleDeferredSectionReveal(section.id);
                }}
              >
                {content}
              </DeferredSection>
            );
          })}
        {!isCliTheme && !shouldMountFeaturedSections && (
          <div aria-hidden="true" style={{ minHeight: '1px' }} />
        )}
      </main>

      {/* Footer */}
      {!isCliTheme && shouldMountFeaturedSections && (
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

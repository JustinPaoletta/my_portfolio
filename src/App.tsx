/**
 * Main Application Component
 * Portfolio with parallax scrolling and animated sections
 */

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import '@/App.css';
import '@/styles/reveal.css';
import DeferredSection from '@/components/DeferredSection';
import SectionRouteFallback from '@/components/SectionRouteFallback';
import Hero from '@/components/sections/Hero';
import { SECTION_MANIFEST } from '@/config/section-manifest';
import {
  PORTFOLIO_REVEAL_TARGET_EVENT,
  type PortfolioRevealTargetDetail,
} from '@/constants/deferred-navigation';
import useIdleActivation from '@/hooks/useIdleActivation';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { revealAndNavigate } from '@/utils/deferredNavigation';
import { isVisualTestMode } from '@/utils/visualTest';

const Navigation = lazy(() => import('@/components/Navigation'));
const Footer = lazy(() => import('@/components/Footer'));
const PWAUpdatePrompt = lazy(() => import('@/components/pwa-update-prompt'));

function AppLayout(): React.ReactElement {
  const { themeName } = useTheme();
  const isCliTheme = themeName === 'cli';
  const sections = useMemo(
    () =>
      SECTION_MANIFEST.filter(
        (section) => themeName !== 'minimal' || section.id !== 'pet-dogs'
      ),
    [themeName]
  );
  const isVisualTest = isVisualTestMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldMountFeaturedSections = useIdleActivation({
    enabled: !isCliTheme,
  });
  const shouldMountPwaPrompt = useIdleActivation();
  const [forcedDeferredSectionIds, setForcedDeferredSectionIds] = useState<
    string[]
  >([]);
  const forcedDeferredSectionIdSet = new Set(forcedDeferredSectionIds);
  const previousIsCliThemeRef = useRef<boolean | null>(null);

  const handleSkipToMain = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();

      const main = document.getElementById('main');
      if (!(main instanceof HTMLElement)) {
        return;
      }

      main.scrollIntoView({ behavior: 'auto', block: 'start' });
      main.focus({ preventScroll: true });
      window.history.replaceState(null, '', '#main');
    },
    []
  );

  useEffect(() => {
    const handleRevealTarget = (event: Event): void => {
      const customEvent = event as CustomEvent<PortfolioRevealTargetDetail>;
      const targetId = customEvent.detail?.targetId;

      if (!targetId) {
        return;
      }

      const targetIndex = sections.findIndex(
        (section) => section.id === targetId
      );

      if (targetIndex === -1) {
        return;
      }

      const deferredSectionIds = sections
        .slice(0, targetIndex + 1)
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
  }, [sections]);

  useEffect(() => {
    const shouldHandleCurrentHash = previousIsCliThemeRef.current !== false;
    previousIsCliThemeRef.current = isCliTheme;

    if (isCliTheme) {
      return;
    }

    const sectionIds: Set<string> = new Set(sections.map((s) => s.id));

    const handleHash = (): void => {
      const hash = window.location.hash.replace('#', '');
      if (hash && sectionIds.has(hash)) {
        revealAndNavigate(hash);
      }
    };

    // Rebind eligible targets after a theme change without replaying an old
    // hash and moving the visitor away from their current scroll position.
    if (shouldHandleCurrentHash) {
      handleHash();
    }

    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
    };
  }, [isCliTheme, sections]);

  return (
    <>
      {shouldMountPwaPrompt && (
        <Suspense fallback={null}>
          <PWAUpdatePrompt isHidden={isCliTheme} />
        </Suspense>
      )}

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link" onClick={handleSkipToMain}>
        Skip to main content
      </a>

      {/* Fixed Navigation */}
      {!isCliTheme && (
        <Suspense fallback={null}>
          <Navigation onMobileMenuOpenChange={setIsMobileMenuOpen} />
        </Suspense>
      )}

      {/* CLI theme exposes appearance and exit commands in the terminal. */}
      {!isVisualTest && !isCliTheme && (
        <ThemeSwitcher
          placement="floating"
          isTemporarilyHidden={isMobileMenuOpen}
        />
      )}

      {/* Main Content */}
      <main
        id="main"
        tabIndex={-1}
        className={
          isCliTheme ? 'main-content main-content--cli' : 'main-content'
        }
      >
        <Hero />
        {!isCliTheme &&
          shouldMountFeaturedSections &&
          sections.map((section) => {
            const content = (
              <Suspense
                fallback={<SectionRouteFallback sectionId={section.id} />}
              >
                <section.Component />
              </Suspense>
            );

            if (section.activation === 'idle') {
              return <div key={section.id}>{content}</div>;
            }

            return (
              <DeferredSection
                key={section.id}
                forceVisible={forcedDeferredSectionIdSet.has(section.id)}
                rootMargin={section.rootMargin}
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

/**
 * Hero Section
 * Main introduction with name, title, and brief intro
 * Uses reduced-motion checks and lightweight parallax enhancement
 */

import { useEffect, useRef, useState } from 'react';
import { env } from '@/config/env';
import { HERO_TAGLINE } from '@/content/site';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/hooks/useTheme';
import { isVisualTestMode } from '@/utils/visualTest';
import CliTerminal from './CliTerminal';
import CosmicHeroBackground from './CosmicHeroBackground';
import EngineerHeroBackground from './EngineerHeroBackground';
import './Hero.css';
const themeStyleLoaders: Record<string, () => Promise<unknown>> = {
  cli: () => import('./Hero.cli.css'),
  cosmic: () => import('./Hero.cosmic.css'),
  engineer: () => import('./Hero.engineer.css'),
};

type NavigatorConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

const HERO_ENVIRONMENT_FLAGS = {
  compactViewport: 1 << 0,
  reducedMotion: 1 << 1,
  saveData: 1 << 2,
  slowNetwork: 1 << 3,
} as const;

function getNavigatorConnection(): NavigatorConnectionLike | undefined {
  return (navigator as Navigator & { connection?: NavigatorConnectionLike })
    .connection;
}

function getHeroEnvironmentFlags(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  let flags = 0;

  if (window.matchMedia('(max-width: 768px)').matches) {
    flags |= HERO_ENVIRONMENT_FLAGS.compactViewport;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    flags |= HERO_ENVIRONMENT_FLAGS.reducedMotion;
  }

  const connection = getNavigatorConnection();

  if (connection?.saveData) {
    flags |= HERO_ENVIRONMENT_FLAGS.saveData;
  }

  if (['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')) {
    flags |= HERO_ENVIRONMENT_FLAGS.slowNetwork;
  }

  return flags;
}

function subscribeToMediaQuery(
  mediaQuery: MediaQueryList,
  listener: () => void
): () => void {
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }

  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
}

function useHeroEnvironmentFlags(): number {
  const [flags, setFlags] = useState(() => getHeroEnvironmentFlags());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const compactViewportQuery = window.matchMedia('(max-width: 768px)');
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const connection = getNavigatorConnection();

    const updateFlags = (): void => {
      setFlags((currentFlags) => {
        const nextFlags = getHeroEnvironmentFlags();
        return currentFlags === nextFlags ? currentFlags : nextFlags;
      });
    };

    const unsubscribeCompactViewport = subscribeToMediaQuery(
      compactViewportQuery,
      updateFlags
    );
    const unsubscribeReducedMotion = subscribeToMediaQuery(
      reducedMotionQuery,
      updateFlags
    );

    connection?.addEventListener?.('change', updateFlags);

    return () => {
      unsubscribeCompactViewport();
      unsubscribeReducedMotion();
      connection?.removeEventListener?.('change', updateFlags);
    };
  }, []);

  return flags;
}

function useDeferredHeroEnhancement(): boolean {
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let idleHandle: number | undefined;
    let timeoutId: number | undefined;
    let paintFrameOne: number | undefined;
    let paintFrameTwo: number | undefined;
    let cancelled = false;

    const isTestEnvironment =
      typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
    const activationDelay = isTestEnvironment ? 0 : 180;

    const activateEnhancement = (): void => {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setIsEnhanced(true);
        }
      }, activationDelay);
    };

    const scheduleAfterPaint = (): void => {
      paintFrameOne = window.requestAnimationFrame(() => {
        paintFrameTwo = window.requestAnimationFrame(() => {
          if (
            !isTestEnvironment &&
            typeof window.requestIdleCallback === 'function'
          ) {
            idleHandle = window.requestIdleCallback(activateEnhancement, {
              timeout: 1200,
            });
            return;
          }

          activateEnhancement();
        });
      });
    };

    if (document.readyState === 'complete') {
      scheduleAfterPaint();
    } else {
      window.addEventListener('load', scheduleAfterPaint, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', scheduleAfterPaint);
      if (
        idleHandle !== undefined &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (paintFrameOne !== undefined) {
        window.cancelAnimationFrame(paintFrameOne);
      }
      if (paintFrameTwo !== undefined) {
        window.cancelAnimationFrame(paintFrameTwo);
      }
    };
  }, []);

  return isEnhanced;
}

function Hero(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const loadedThemeStyles = useRef(new Set<string>());
  const { themeName, resolvedMode } = useTheme();
  const isVisualTest = isVisualTestMode();
  const isCosmicTheme = themeName === 'cosmic';
  const isEngineerTheme = themeName === 'engineer';
  const isCliTheme = themeName === 'cli';
  const prefersReducedMotion = Boolean(useReducedMotion());
  const shouldEnhanceHero = useDeferredHeroEnhancement();
  const heroEnvironmentFlags = useHeroEnvironmentFlags();
  const useCalmerChipMotion = Boolean(
    heroEnvironmentFlags &
    (HERO_ENVIRONMENT_FLAGS.compactViewport |
      HERO_ENVIRONMENT_FLAGS.reducedMotion |
      HERO_ENVIRONMENT_FLAGS.saveData)
  );
  const disableParallax = prefersReducedMotion || isCliTheme || isVisualTest;
  const isHeroInView = useIntersectionObserver(sectionRef, {
    threshold: 0.01,
    rootMargin: '0px',
    triggerOnce: false,
  });

  useEffect(() => {
    const loadThemeStyles = themeStyleLoaders[themeName];
    if (!loadThemeStyles || loadedThemeStyles.current.has(themeName)) {
      return;
    }

    void loadThemeStyles();
    loadedThemeStyles.current.add(themeName);
  }, [themeName]);

  useEffect(() => {
    const content = heroContentRef.current;
    if (!content) {
      return;
    }

    const disableEnhancement = disableParallax || !shouldEnhanceHero;

    if (disableEnhancement) {
      content.dataset.parallaxEnabled = 'false';
      content.style.removeProperty('--hero-parallax-y');
      content.style.removeProperty('--hero-parallax-opacity');
      return;
    }

    let rafId: number | null = null;
    let previousTransform = '';
    let previousOpacity = '';

    const updateParallax = (): void => {
      rafId = null;

      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const sectionHeight = Math.max(rect.height, 1);
      const progress = Math.min(Math.max(-rect.top / sectionHeight, 0), 1);
      const parallaxY = `${(progress * 125).toFixed(2)}px`;
      const opacity = (progress >= 0.9 ? 0 : 1 - progress / 0.9)
        .toFixed(3)
        .replace(/\.?0+$/, '');

      if (parallaxY !== previousTransform) {
        content.style.setProperty('--hero-parallax-y', parallaxY);
        previousTransform = parallaxY;
      }

      if (opacity !== previousOpacity) {
        content.style.setProperty('--hero-parallax-opacity', opacity);
        previousOpacity = opacity;
      }
    };

    const scheduleUpdate = (): void => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(updateParallax);
    };

    content.dataset.parallaxEnabled = 'true';
    updateParallax();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      content.dataset.parallaxEnabled = 'false';
      content.style.removeProperty('--hero-parallax-y');
      content.style.removeProperty('--hero-parallax-opacity');
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [disableParallax, shouldEnhanceHero]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section visible"
      aria-labelledby="hero-heading"
    >
      {isCosmicTheme ? (
        <CosmicHeroBackground
          isActive={isHeroInView}
          reducedMotion={prefersReducedMotion}
          isVisualTest={isVisualTest}
          shouldLoadScene={shouldEnhanceHero}
          calmMotion={useCalmerChipMotion}
          mode={resolvedMode}
        />
      ) : (
        <div
          className="hero-background"
          data-cosmic-theme="false"
          aria-hidden="true"
        >
          {isEngineerTheme ? (
            <EngineerHeroBackground
              isActive={isHeroInView}
              reducedMotion={prefersReducedMotion}
              isVisualTest={isVisualTest}
              shouldLoadScene={shouldEnhanceHero}
              calmMotion={useCalmerChipMotion}
              mode={resolvedMode}
            />
          ) : null}
        </div>
      )}

      <div
        ref={heroContentRef}
        className="hero-content"
        data-parallax-enabled={
          !disableParallax && shouldEnhanceHero ? 'true' : 'false'
        }
      >
        <div className="hero-text-stack">
          {isCliTheme ? (
            <CliTerminal />
          ) : (
            <>
              <span className="hero-greeting">Hello, I&apos;m</span>

              <h1
                id="hero-heading"
                className="hero-name"
                aria-label="Justin Paoletta"
              >
                <span className="hero-name-text" aria-hidden="true">
                  Justin Paoletta
                </span>
              </h1>
            </>
          )}
        </div>
        {!isCliTheme && (
          <>
            <div className={isCosmicTheme ? 'hero-subtext-layout' : undefined}>
              <div className={isCosmicTheme ? 'hero-subtext-copy' : undefined}>
                {isCosmicTheme ? (
                  <ul className="hero-title-list" aria-label="Core roles">
                    <li className="hero-title-list-item">Software Engineer</li>
                    <li className="hero-title-list-item">
                      Frontend Platform Architecture
                    </li>
                    <li className="hero-title-list-item">
                      Modernization &amp; Automation
                    </li>
                  </ul>
                ) : (
                  <p className="hero-title">
                    <span className="title-text">Software Engineer</span>
                    <span className="title-divider" aria-hidden="true">
                      •
                    </span>
                    <span className="title-text">
                      Frontend Platform Architecture
                    </span>
                    <span className="title-divider" aria-hidden="true">
                      •
                    </span>
                    <span className="title-text">
                      Modernization &amp; Automation
                    </span>
                  </p>
                )}

                {!isCosmicTheme && (
                  <div className="hero-tagline">
                    <p>{HERO_TAGLINE}</p>
                  </div>
                )}
              </div>

              {isCosmicTheme && (
                <span className="hero-astronaut-rig" aria-hidden="true">
                  <span className="hero-asteroid-tail" />
                  <span className="hero-asteroid" />
                  <img
                    className="hero-astronaut"
                    src="/images/hero/astro.webp"
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    decoding="async"
                  />
                </span>
              )}
            </div>

            {isCosmicTheme && (
              <div className="hero-tagline">
                <p>{HERO_TAGLINE}</p>
              </div>
            )}

            <div className="hero-cta">
              <a href="#projects" className="cta-primary">
                <span>View My Work</span>
                <svg
                  className="cta-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#contact" className="cta-secondary">
                <span>Get In Touch</span>
              </a>
            </div>

            <div className="hero-social">
              <a
                href={env.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub Profile"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href={env.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn Profile"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href={`mailto:${env.social.email}`}
                className="social-link"
                aria-label="Send Email"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Hero;

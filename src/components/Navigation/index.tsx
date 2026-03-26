/**
 * Navigation Component
 * Responsive navigation with smooth scrolling
 * Uses passive scroll handling for sticky state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import JPLogo from '@/components/Brand/JPLogo';
import {
  PORTFOLIO_REVEAL_TARGET_EVENT,
  type PortfolioRevealTargetDetail,
} from '@/constants/deferred-navigation';
import { useTheme } from '@/hooks/useTheme';
import { isVisualTestMode } from '@/utils/visualTest';
import {
  getFocusableElements,
  temporarilyInertElements,
  trapFocusWithin,
} from '@/utils/accessibility';
import './Navigation.css';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'articles', label: 'Articles', href: '#articles' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'github', label: 'GitHub', href: '#github' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

function Navigation(): React.ReactElement {
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuDialogRef = useRef<HTMLDivElement>(null);
  const shouldRestoreMobileMenuFocus = useRef(true);
  const { themeName } = useTheme();
  const isCliTheme = themeName === 'cli';
  const isVisualTest = isVisualTestMode();

  useEffect(() => {
    if (isCliTheme || isVisualTest) {
      return;
    }

    let frameId = 0;
    const syncScrollState = (): void => {
      frameId = 0;
      setIsScrolled(window.scrollY > 0);
    };

    const handleScroll = (): void => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(syncScrollState);
    };

    syncScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isCliTheme, isVisualTest]);

  useEffect(() => {
    if (isCliTheme || isVisualTest) {
      return;
    }

    const sections = navItems.map((item) => document.getElementById(item.id));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [isCliTheme, isVisualTest]);

  useEffect(() => {
    if (!isCliTheme || !isMobileMenuOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isCliTheme, isMobileMenuOpen]);

  const closeMobileMenu = useCallback((restoreFocus = true): void => {
    shouldRestoreMobileMenuFocus.current = restoreFocus;
    setIsMobileMenuOpen(false);
  }, []);

  const focusSectionTarget = useCallback((targetId: string): void => {
    const element = document.getElementById(targetId);

    if (!(element instanceof HTMLElement)) {
      return;
    }

    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }

    window.requestAnimationFrame(() => {
      element.focus({ preventScroll: true });
    });
  }, []);

  const scrollToTarget = useCallback(
    (element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void => {
      const offsetTop =
        element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior,
      });
    },
    []
  );

  const revealDeferredTarget = useCallback(
    (targetId: string): void => {
      const navigateToMountedTarget = (
        mountedTarget: HTMLElement,
        behavior: ScrollBehavior = 'smooth'
      ): void => {
        scrollToTarget(mountedTarget, behavior);
        window.history.replaceState(null, '', `#${targetId}`);
        focusSectionTarget(targetId);
      };

      const existingTarget = document.getElementById(targetId);
      if (existingTarget instanceof HTMLElement) {
        navigateToMountedTarget(existingTarget);
        return;
      }

      window.dispatchEvent(
        new CustomEvent<PortfolioRevealTargetDetail>(
          PORTFOLIO_REVEAL_TARGET_EVENT,
          {
            detail: { targetId },
          }
        )
      );

      const observerRoot = document.getElementById('main') ?? document.body;
      let timerId = 0;
      let attemptsLeft = 20;

      const cleanup = (): void => {
        mutationObserver.disconnect();
        window.clearTimeout(timerId);
      };

      const ensureTargetInView = (
        mountedTarget: HTMLElement,
        remainingAttempts = 6
      ): void => {
        scrollToTarget(mountedTarget, 'auto');

        if (remainingAttempts <= 1) {
          window.requestAnimationFrame(() => {
            navigateToMountedTarget(mountedTarget);
          });
          return;
        }

        window.requestAnimationFrame(() => {
          const rect = mountedTarget.getBoundingClientRect();
          const isInViewport =
            rect.top <= window.innerHeight - 80 && rect.bottom >= 80;

          if (isInViewport) {
            navigateToMountedTarget(mountedTarget);
            return;
          }

          ensureTargetInView(mountedTarget, remainingAttempts - 1);
        });
      };

      const finishWhenMounted = (): boolean => {
        const mountedTarget = document.getElementById(targetId);
        if (!(mountedTarget instanceof HTMLElement)) {
          return false;
        }

        cleanup();
        timerId = window.setTimeout(() => {
          ensureTargetInView(mountedTarget);
        }, 80);
        return true;
      };

      const waitForTarget = (): void => {
        if (finishWhenMounted()) {
          return;
        }

        if (attemptsLeft <= 0) {
          cleanup();
          return;
        }

        attemptsLeft -= 1;
        timerId = window.setTimeout(() => {
          waitForTarget();
        }, 120);
      };

      const mutationObserver = new MutationObserver(() => {
        if (finishWhenMounted()) {
          return;
        }

        window.clearTimeout(timerId);
        timerId = window.setTimeout(() => {
          waitForTarget();
        }, 120);
      });

      mutationObserver.observe(observerRoot, {
        childList: true,
        subtree: true,
      });

      waitForTarget();
    },
    [focusSectionTarget, scrollToTarget]
  );

  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      event.preventDefault();
      const targetId = href.replace('#', '');
      const navigateToTarget = (): void => {
        const element = document.getElementById(targetId);

        if (element instanceof HTMLElement) {
          scrollToTarget(element);
          window.history.replaceState(null, '', href);
          focusSectionTarget(targetId);
        } else {
          revealDeferredTarget(targetId);
        }
      };

      navigateToTarget();
      closeMobileMenu(false);
    },
    [closeMobileMenu, focusSectionTarget, revealDeferredTarget, scrollToTarget]
  );

  useEffect(() => {
    if (isCliTheme || !isMobileMenuOpen) {
      return;
    }

    const dialog = mobileMenuDialogRef.current;
    if (!dialog) {
      return;
    }

    const mobileMenuButton = mobileMenuButtonRef.current;
    const mobileMenuButtonTabIndex =
      mobileMenuButton?.getAttribute('tabindex') ?? null;
    shouldRestoreMobileMenuFocus.current = true;
    mobileMenuButton?.setAttribute('tabindex', '-1');

    const restoreInertState = temporarilyInertElements([
      mobileMenuButton,
      document.querySelector<HTMLElement>('.skip-link'),
      document.getElementById('main'),
      document.querySelector<HTMLElement>('.theme-switcher'),
      document.querySelector<HTMLElement>('footer'),
    ]);

    const focusInitialElement = (): void => {
      const [firstFocusable] = getFocusableElements(dialog);
      (firstFocusable ?? dialog).focus();
    };

    const handleKeyDown = (keyboardEvent: KeyboardEvent): void => {
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault();
        closeMobileMenu(true);
        return;
      }

      trapFocusWithin(keyboardEvent, dialog);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(focusInitialElement);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      restoreInertState();
      if (mobileMenuButton) {
        if (mobileMenuButtonTabIndex === null) {
          mobileMenuButton.removeAttribute('tabindex');
        } else {
          mobileMenuButton.setAttribute('tabindex', mobileMenuButtonTabIndex);
        }
      }

      if (shouldRestoreMobileMenuFocus.current) {
        mobileMenuButton?.focus();
      }
    };
  }, [closeMobileMenu, isCliTheme, isMobileMenuOpen]);

  return (
    <nav
      className={`navigation ${isScrolled ? 'scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="nav-container">
        <a href="#hero" className="nav-logo" aria-label="Back to top">
          <JPLogo className="logo-image" />
        </a>

        {!isCliTheme && (
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  aria-current={
                    activeSection === item.id ? 'location' : undefined
                  }
                  onClick={(event) => handleNavClick(event, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {!isCliTheme && (
          <button
            ref={mobileMenuButtonRef}
            className={`mobile-menu-button ${isMobileMenuOpen ? 'open' : ''}`}
            type="button"
            onClick={() => {
              if (isMobileMenuOpen) {
                closeMobileMenu(true);
                return;
              }

              setIsMobileMenuOpen(true);
            }}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        )}
      </div>

      {!isCliTheme && (
        <div
          id="mobile-menu"
          className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <button
            type="button"
            className="mobile-menu-backdrop"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => closeMobileMenu(true)}
          />
          <div
            ref={mobileMenuDialogRef}
            className="mobile-menu-content"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            tabIndex={-1}
          >
            <nav aria-label="Mobile navigation">
              <ul className="mobile-nav-links">
                {navItems.map((item, index) => (
                  <li
                    key={item.id}
                    style={
                      { '--delay': `${index * 0.05}s` } as React.CSSProperties
                    }
                  >
                    <a
                      href={item.href}
                      className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                      onClick={(event) => handleNavClick(event, item.href)}
                      aria-current={
                        activeSection === item.id ? 'location' : undefined
                      }
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;

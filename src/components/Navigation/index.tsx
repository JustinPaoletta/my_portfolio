/**
 * Navigation Component
 * Responsive navigation with smooth scrolling
 * Uses passive scroll handling for sticky state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import JPLogo from '@/components/Brand/JPLogo';
import { useTheme } from '@/hooks/useTheme';
import { isVisualTestMode } from '@/utils/visualTest';
import {
  getFocusableElements,
  temporarilyInertElements,
  trapFocusWithin,
} from '@/utils/accessibility';
import {
  revealAndNavigate,
  scrollToElement,
  focusSection,
} from '@/utils/deferredNavigation';
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

    const sectionIds = new Set(navItems.map((item) => item.id));
    const observedIds = new Set<string>();

    const intersectionObserver = new IntersectionObserver(
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

    const observeNewSections = (): void => {
      for (const id of sectionIds) {
        if (observedIds.has(id)) {
          continue;
        }

        const element = document.getElementById(id);
        if (element) {
          intersectionObserver.observe(element);
          observedIds.add(id);
        }
      }
    };

    observeNewSections();

    const mainElement = document.getElementById('main') ?? document.body;
    const mutationObserver = new MutationObserver(() => {
      observeNewSections();
    });

    mutationObserver.observe(mainElement, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
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

  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      event.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);

      if (element instanceof HTMLElement) {
        scrollToElement(element);
        window.history.replaceState(null, '', href);
        focusSection(targetId);
      } else {
        revealAndNavigate(targetId);
      }

      closeMobileMenu(false);
    },
    [closeMobileMenu]
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

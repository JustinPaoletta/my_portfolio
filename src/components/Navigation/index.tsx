/**
 * Navigation Component
 * Responsive navigation with smooth scrolling
 * Uses Framer Motion for scroll detection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import JPLogo from '@/components/Brand/JPLogo';
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
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'articles', label: 'Articles', href: '#articles' },
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

  // Use Framer Motion's scroll hook
  const { scrollY } = useScroll();

  // Listen to scroll changes efficiently
  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (isVisualTest) {
      setIsScrolled(false);
      return;
    }

    setIsScrolled(latest > 0);
  });

  // Track active section based on scroll position
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

  // Handle smooth scroll
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);

      if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
        window.history.replaceState(null, '', href);
        focusSectionTarget(targetId);
      }

      closeMobileMenu(false);
    },
    [closeMobileMenu, focusSectionTarget]
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

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu(true);
        return;
      }

      trapFocusWithin(event, dialog);
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

        {/* Desktop Navigation */}
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
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
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
                      onClick={(e) => handleNavClick(e, item.href)}
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

/**
 * Navigation Component
 * Responsive navigation with smooth scrolling
 * Uses passive scroll handling for sticky state
 */

import { useState, useEffect, useCallback } from 'react';
import JPLogo from '@/components/Brand/JPLogo';
import {
  PORTFOLIO_REVEAL_TARGET_EVENT,
  type PortfolioRevealTargetDetail,
} from '@/constants/deferred-navigation';
import { useTheme } from '@/hooks/useTheme';
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
  const { themeName } = useTheme();
  const isCliTheme = themeName === 'cli';

  useEffect(() => {
    if (isCliTheme) {
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
  }, [isCliTheme]);

  // Track active section based on scroll position
  useEffect(() => {
    if (isCliTheme) {
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
  }, [isCliTheme]);

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
      const existingTarget = document.getElementById(targetId);
      if (existingTarget) {
        scrollToTarget(existingTarget);
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
        attemptsLeft = 6
      ): void => {
        scrollToTarget(mountedTarget, 'auto');

        if (attemptsLeft <= 1) {
          return;
        }

        window.requestAnimationFrame(() => {
          const rect = mountedTarget.getBoundingClientRect();
          const isInViewport =
            rect.top <= window.innerHeight - 80 && rect.bottom >= 80;

          if (isInViewport) {
            scrollToTarget(mountedTarget);
            return;
          }

          ensureTargetInView(mountedTarget, attemptsLeft - 1);
        });
      };

      const finishWhenMounted = (): boolean => {
        const mountedTarget = document.getElementById(targetId);
        if (!mountedTarget) {
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
    [scrollToTarget]
  );

  // Handle smooth scroll
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const navigateToTarget = (): void => {
        const element = document.getElementById(targetId);

        if (element) {
          scrollToTarget(element);
        } else {
          revealDeferredTarget(targetId);
        }
      };

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        navigateToTarget();
        return;
      }

      navigateToTarget();
    },
    [isMobileMenuOpen, revealDeferredTarget, scrollToTarget]
  );

  // Close mobile menu on escape
  useEffect(() => {
    if (isCliTheme) {
      return;
    }

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isCliTheme]);

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
          <ul className="nav-links" role="menubar">
            {navItems.map((item) => (
              <li key={item.id} role="none">
                <a
                  href={item.href}
                  role="menuitem"
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
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
            className={`mobile-menu-button ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
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
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mobile-menu-content">
            <ul className="mobile-nav-links" role="menu">
              {navItems.map((item, index) => (
                <li
                  key={item.id}
                  role="none"
                  style={
                    { '--delay': `${index * 0.05}s` } as React.CSSProperties
                  }
                >
                  <a
                    href={item.href}
                    role="menuitem"
                    className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;

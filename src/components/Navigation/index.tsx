/**
 * Navigation Component
 * Responsive navigation with smooth scrolling
 * Uses Framer Motion for scroll detection
 */

import { useState, useEffect, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import JPLogo from '@/components/Brand/JPLogo';
import { useTheme } from '@/hooks/useTheme';
import { isVisualTestMode } from '@/utils/visualTest';
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
      }

      setIsMobileMenuOpen(false);
    },
    []
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

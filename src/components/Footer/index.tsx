/**
 * Footer Component
 * Site footer with social links and copyright
 */

import { env } from '@/config/env';
import './Footer.css';

function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#hero" className="footer-logo" aria-label="Go to top">
              <span className="logo-text">JP</span>
              <span className="logo-dot" aria-hidden="true" />
            </a>
            <p className="footer-tagline">
              Building the future, one line of code at a time.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-links-group">
              <p className="footer-links-title">Navigation</p>
              <ul className="footer-links">
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#projects">Projects</a>
                </li>
                <li>
                  <a href="#skills">Skills</a>
                </li>
                <li>
                  <a href="#experience">Experience</a>
                </li>
              </ul>
            </div>

            <div className="footer-links-group">
              <p className="footer-links-title">Connect</p>
              <ul className="footer-links">
                <li>
                  <a
                    href={env.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={env.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={`mailto:${env.social.email}`}>Email</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Justin Paoletta. All rights reserved.
          </p>
          <p className="built-with">
            Built with{' '}
            <span className="heart" aria-hidden="true">
              ❤️
            </span>
            <span className="visually-hidden">love</span> using React +
            TypeScript
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="footer-decoration" aria-hidden="true">
        <div className="decoration-gradient" />
      </div>
    </footer>
  );
}

export default Footer;

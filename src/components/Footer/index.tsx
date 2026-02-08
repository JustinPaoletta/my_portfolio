/**
 * Footer Component
 * Site footer with copyright
 */
import { ArrowRight } from 'lucide-react';
import './Footer.css';

function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-brand">
          <a href="#hero" className="footer-logo">
            <span className="logo-text">JP</span>
            <span className="visually-hidden">- Go to top</span>
          </a>
          <p className="footer-tagline">
            <span>Ideas</span>
            <ArrowRight className="footer-tagline-icon" aria-hidden="true" />
            <span>Prompts</span>
            <ArrowRight className="footer-tagline-icon" aria-hidden="true" />
            <span>Production</span>
          </p>
        </div>
        <p className="copyright">
          © {currentYear} Justin Paoletta. All rights reserved.
        </p>
      </div>

      {/* Background decoration */}
      <div className="footer-decoration" aria-hidden="true">
        <div className="decoration-gradient" />
      </div>
    </footer>
  );
}

export default Footer;

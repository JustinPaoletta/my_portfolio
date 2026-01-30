/**
 * Footer Component
 * Site footer with copyright
 */
import './Footer.css';

function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-brand">
          <a href="#hero" className="footer-logo">
            <span className="logo-text">JP</span>
            <span className="logo-dot" aria-hidden="true" />
            <span className="visually-hidden">- Go to top</span>
          </a>
          <p className="footer-tagline">Ideas → Prompts → Production</p>
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

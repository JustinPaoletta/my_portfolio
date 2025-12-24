import '@/App.css';
import { env } from '@/config/env';
import SEO from '@/components/SEO';
import PWAUpdatePrompt from '@/components/pwa-update-prompt';

export default function App() {
  return (
    <>
      <SEO />
      <PWAUpdatePrompt />

      {/* skip link for keyboard users */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header role="banner">{/* nav bar - todo */}</header>

      <main id="main" role="main">
        <h1>{env.app.title}</h1>

        <div>
          <img
            src="/jp-100.webp"
            srcSet="/jp-100.webp 100w, /jp-200.webp 200w, /jp-400.webp 400w"
            sizes="100px"
            width={100}
            height={100}
            alt="JP"
          />
        </div>
      </main>

      <footer role="contentinfo">{/* footer - todo */}</footer>
    </>
  );
}

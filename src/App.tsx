import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '/vite.svg';
import '@/App.css';
import { env } from '@/config/env';
import SEO from '@/components/SEO';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function App() {
  const [count, setCount] = useState(0);
  const { trackExternalLink } = useAnalytics();

  // Always have exactly one <h1> per page (route) and exactly one <main>.
  // Add a skip link so keyboard users can jump to content immediately.
  return (
    <>
      <SEO />
      <PWAUpdatePrompt />

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header role="banner">
        {/* Put your site nav/logo here if you have one */}
      </header>

      <main id="main" role="main">
        {/* Visible H1 (or sr-only if you already have a visible page title elsewhere) */}
        <h1>{env?.app?.title ?? 'JP Engineering'}</h1>

        <div>
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink('https://vite.dev', 'Vite Logo')}
          >
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackExternalLink('https://react.dev', 'React Logo')}
          >
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <div className="card">
          <button onClick={() => setCount((c) => c + 1)}>
            Count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>

        <p className="read-the-docs">
          Click the Vite and React logos to learn more
        </p>
      </main>

      <footer role="contentinfo">{/* footer stuff */}</footer>
    </>
  );
}

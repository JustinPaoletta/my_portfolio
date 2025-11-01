import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '/vite.svg';
import '@/App.css';
import { env } from '@/config/env';
import SEO from '@/components/SEO';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import { useAnalytics } from '@/hooks/useAnalytics';

function App() {
  const [count, setCount] = useState(0);
  const { trackExternalLink } = useAnalytics();

  return (
    <>
      <SEO />
      <PWAUpdatePrompt />
      <main>
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
        <h1>{env.app.title}</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </main>
    </>
  );
}

export default App;

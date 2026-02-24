/**
 * Main Application Component
 * Portfolio with parallax scrolling and animated sections
 */

import '@/App.css';
import SEO from '@/components/SEO';
import PWAUpdatePrompt from '@/components/pwa-update-prompt';
import Navigation from '@/components/Navigation';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Experience from '@/components/sections/Experience';
import GitHub from '@/components/sections/GitHub';
import Contact from '@/components/sections/Contact';
import PetDogs from '@/components/sections/PetDogs';
import Footer from '@/components/Footer';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';

function AppLayout(): React.ReactElement {
  const { themeName } = useTheme();
  const isCliTheme = themeName === 'cli';

  return (
    <>
      <SEO />
      <PWAUpdatePrompt />

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {/* Fixed Navigation */}
      {!isCliTheme && <Navigation />}

      {/* Theme switcher - always floating bottom-right */}
      <ThemeSwitcher placement="floating" />

      {/* Main Content */}
      <main
        id="main"
        role="main"
        className={
          isCliTheme ? 'main-content main-content--cli' : 'main-content'
        }
      >
        <Hero />
        {!isCliTheme && (
          <>
            <About />
            <Projects />
            <Skills />
            <Experience />
            <GitHub />
            <Contact />
            <PetDogs />
          </>
        )}
      </main>

      {/* Footer */}
      {!isCliTheme && <Footer />}
    </>
  );
}

export default function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

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
import { ThemeProvider } from '@/hooks/useTheme';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <SEO />
      <PWAUpdatePrompt />

      {/* Skip link for keyboard users */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {/* Fixed Navigation */}
      <Navigation />

      {/* Theme Switcher - Fixed position for easy testing */}
      <ThemeSwitcher />

      {/* Main Content */}
      <main id="main" role="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <GitHub />
        <Contact />
        <PetDogs />
      </main>

      {/* Footer */}
      <Footer />
    </ThemeProvider>
  );
}

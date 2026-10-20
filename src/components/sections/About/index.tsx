import { SECTION_NAMES } from '@/content/site';
/** Professional background and résumé. */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import './About.css';

function About(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRevealInView(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section"
      aria-labelledby="about-heading"
    >
      <div className="section-container">
        <Reveal
          as="header"
          className="section-header"
          effect="fade-only"
          visible={isVisible}
        >
          <Reveal
            as="h2"
            id="about-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            {SECTION_NAMES.about}
          </Reveal>
        </Reveal>

        <div className="about-content">
          <Reveal
            as="div"
            className="about-text"
            effect="fade-left"
            delay={140}
            visible={isVisible}
          >
            <p className="about-intro">
              I’m a software engineer with more than five years of experience
              building and modernizing production applications. My work combines{' '}
              <strong>frontend architecture</strong>,{' '}
              <strong>full-stack development</strong>, and ownership from
              requirements through release.
            </p>
            <p>
              At accesso, I lead frontend modernization for a platform used by
              hundreds of venues worldwide. I’ve integrated Angular and React
              into an established application, delivered backend and database
              changes, and automated releases across four production
              applications, cutting a{' '}
              <strong>3–4 hour process to about 25 minutes.</strong>
            </p>
            <p>
              I also <strong>mentor engineers</strong> and improve the tools and
              processes the team relies on. I care about understanding the
              business problem, making sound technical decisions, and building
              software that other engineers can maintain and improve.
            </p>
            <div className="about-resume">
              <a
                className="about-resume-link"
                href="/resume/Justin-Paoletta_Software-Engineer.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resume
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;

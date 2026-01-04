/**
 * About Section
 * Background and story
 */

import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import './About.css';

function About(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`about-section ${isVisible ? 'visible' : ''}`}
      aria-labelledby="about-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <span className="section-label">About Me</span>
          <h2 id="about-heading" className="section-title">
            My Journey
          </h2>
        </header>

        <div className="about-content">
          <div className="about-text">
            <p className="about-intro">
              I&apos;m a passionate software engineer with a love for building
              products that make a difference. My journey in tech started with
              curiosity about how things work, and it has evolved into a career
              focused on creating elegant, scalable solutions.
            </p>

            <p>
              With expertise spanning from frontend frameworks to backend
              systems, I enjoy tackling complex challenges and turning ideas
              into reality. I believe in writing clean, maintainable code and
              creating experiences that users love.
            </p>

            <p>
              When I&apos;m not coding, you can find me exploring new
              technologies, contributing to open-source projects, or sharing
              knowledge with the developer community. I&apos;m always eager to
              learn and grow, staying current with the ever-evolving tech
              landscape.
            </p>

            <div className="about-highlights">
              <div className="highlight-item">
                <span className="highlight-number">5+</span>
                <span className="highlight-label">Years Experience</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-number">50+</span>
                <span className="highlight-label">Projects Completed</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-number">20+</span>
                <span className="highlight-label">Technologies</span>
              </div>
            </div>
          </div>

          <div className="about-image-container">
            <div className="about-image-wrapper">
              <img
                src="/jp-400.webp"
                width={400}
                height={400}
                alt="Justin working on code"
                className="about-image"
              />
              <div className="image-decoration" aria-hidden="true" />
              <div className="image-dots" aria-hidden="true" />
            </div>

            <div className="about-card">
              <div className="card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="card-content">
                <h3>Full Stack Focus</h3>
                <p>
                  Building end-to-end solutions with modern technologies and
                  best practices.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-values">
          <h3 className="values-title">What I Value</h3>
          <div className="values-grid">
            <article className="value-card">
              <div className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h4>Quality Over Speed</h4>
              <p>
                Taking the time to build things right, with attention to detail
                and long-term maintainability.
              </p>
            </article>

            <article className="value-card">
              <div className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="9" cy="7" r="4" strokeWidth="2" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
                </svg>
              </div>
              <h4>Collaboration</h4>
              <p>
                Working together to achieve great results. The best solutions
                come from diverse perspectives.
              </p>
            </article>

            <article className="value-card">
              <div className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4>Continuous Learning</h4>
              <p>
                Staying curious and always exploring new technologies, patterns,
                and approaches.
              </p>
            </article>

            <article className="value-card">
              <div className="value-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h4>Accessibility</h4>
              <p>
                Building inclusive experiences that work for everyone,
                regardless of ability.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

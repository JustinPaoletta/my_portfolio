/**
 * About Section
 * Background and story section
 */

import { Reveal, useRevealInView } from '@/components/Reveal';
import { BookOpenIcon, BrainIcon } from '@/components/icons';
import { useEffect, useRef } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import './About.css';

function About(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const isVisible = useRevealInView(sectionRef);
  const breakpoint = useBreakpoint();
  const isSmallHighlights = breakpoint === 'xs' || breakpoint === 'sm';

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    let rafId: number | null = null;

    const measureExpandedHeight = () => {
      if (!content) {
        return;
      }

      if (window.matchMedia('(max-width: 640px)').matches) {
        content.style.minHeight = '';
        return;
      }

      const leftColumn =
        content.querySelector<HTMLElement>('.about-text') || null;
      const rightColumn =
        content.querySelector<HTMLElement>('.about-center') || null;
      const cards = content.querySelectorAll<HTMLElement>('.value-card');

      if (!leftColumn || !rightColumn || !cards.length) {
        content.style.minHeight = '';
        return;
      }

      content.style.minHeight = '';
      const leftHeight = leftColumn.getBoundingClientRect().height;
      const rightHeight = rightColumn.getBoundingClientRect().height;
      let maxExtra = 0;

      cards.forEach((card) => {
        const inner = card.querySelector<HTMLElement>(
          '.value-card-content-inner'
        );
        if (!inner) {
          return;
        }
        maxExtra = Math.max(maxExtra, inner.scrollHeight);
      });

      const expandedRightHeight = rightHeight + maxExtra;
      const targetHeight = Math.max(leftHeight, expandedRightHeight);
      content.style.minHeight = `${targetHeight}px`;
    };

    const scheduleMeasure = () => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        measureExpandedHeight();
        rafId = null;
      });
    };

    measureExpandedHeight();
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('load', scheduleMeasure);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('load', scheduleMeasure);
      content.style.minHeight = '';
    };
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) {
      return;
    }

    let rafId: number | null = null;

    const updateStoryHeight = (): void => {
      if (window.matchMedia('(max-width: 640px)').matches) {
        story.style.removeProperty('--about-story-max-height');
        return;
      }

      const paragraphs = story.querySelectorAll<HTMLParagraphElement>('p');
      if (paragraphs.length < 2) {
        story.style.removeProperty('--about-story-max-height');
        return;
      }

      const first = paragraphs[0];
      const second = paragraphs[1];
      const firstStyle = window.getComputedStyle(first);
      const secondStyle = window.getComputedStyle(second);
      const firstMargin = Number.parseFloat(firstStyle.marginBottom) || 0;
      const secondMargin = Number.parseFloat(secondStyle.marginBottom) || 0;
      const totalHeight =
        first.getBoundingClientRect().height +
        firstMargin +
        second.getBoundingClientRect().height +
        secondMargin;

      story.style.setProperty('--about-story-max-height', `${totalHeight}px`);
    };

    const scheduleUpdate = (): void => {
      if (rafId !== null) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        updateStoryHeight();
        rafId = null;
      });
    };

    updateStoryHeight();
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('resize', scheduleUpdate);
      story.style.removeProperty('--about-story-max-height');
    };
  }, []);

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
            as="span"
            className="section-label"
            delay={40}
            visible={isVisible}
          >
            About Me
          </Reveal>
          <Reveal
            as="h2"
            id="about-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            My Career
          </Reveal>
        </Reveal>

        <div className="about-content" ref={contentRef}>
          <Reveal
            as="div"
            className="about-text"
            effect="fade-left"
            delay={140}
            visible={isVisible}
          >
            <div className="about-story" ref={storyRef}>
              <p className="about-intro">
                I specialize in modernizing large AngularJS applications without
                forcing risky all-at-once rewrites. At accesso, I work on a
                platform that supports hundreds of venues worldwide, designing
                and integrating Angular, React, and Tailwind micro-frontends
                inside a legacy AngularJS host.
              </p>

              <p>
                My focus is frontend platform architecture: isolating framework
                lifecycles, reducing styling conflicts, building release and
                CI/CD automation, and creating developer tooling that improves
                engineering velocity. I also design AI-assisted workflows that
                help refine requirements, validate UI work against designs, and
                tighten testing and QA handoff without removing human review.
              </p>
            </div>

            <div className="about-highlights">
              <div
                className="about-highlights-lines"
                style={
                  isSmallHighlights
                    ? {
                        display: 'grid',
                        gap: '1rem',
                        width: 'fit-content',
                        margin: '0 auto',
                      }
                    : { display: 'contents' }
                }
              >
                <Reveal
                  as="div"
                  className="highlight-item"
                  delay={200}
                  visible={isVisible}
                  style={
                    isSmallHighlights
                      ? { justifyContent: 'flex-start', textAlign: 'left' }
                      : undefined
                  }
                >
                  <span
                    className="highlight-number"
                    style={isSmallHighlights ? { marginBottom: 0 } : undefined}
                  >
                    5+
                  </span>
                  <span className="highlight-label">Years Experience</span>
                </Reveal>
                <Reveal
                  as="div"
                  className="highlight-item"
                  delay={280}
                  visible={isVisible}
                  style={
                    isSmallHighlights
                      ? { justifyContent: 'flex-start', textAlign: 'left' }
                      : undefined
                  }
                >
                  <span
                    className="highlight-number"
                    style={isSmallHighlights ? { marginBottom: 0 } : undefined}
                  >
                    8
                  </span>
                  <span className="highlight-label">
                    Micro-frontends Migrated
                  </span>
                </Reveal>
                <Reveal
                  as="div"
                  className="highlight-item"
                  delay={360}
                  visible={isVisible}
                  style={
                    isSmallHighlights
                      ? { justifyContent: 'flex-start', textAlign: 'left' }
                      : undefined
                  }
                >
                  <span
                    className="highlight-number"
                    style={isSmallHighlights ? { marginBottom: 0 } : undefined}
                  >
                    ~75%
                  </span>
                  <span className="highlight-label">Faster Releases</span>
                </Reveal>
              </div>
            </div>

            <Reveal
              as="div"
              className="about-ai"
              delay={420}
              visible={isVisible}
            >
              <h3 className="about-ai-title">
                Thoughts on AI
                <img
                  src="/images/about/thoughts.webp"
                  width={18}
                  height={18}
                  loading="lazy"
                  decoding="async"
                  alt=""
                  className="about-ai-icon"
                  aria-hidden="true"
                />
              </h3>
              <p className="about-ai-lede">
                AI is most valuable when it improves execution, not when it
                replaces judgment. I use it to turn ambiguous requirements into
                clearer plans, speed up implementation, and tighten feedback
                loops across testing and QA.
              </p>
              <p>
                At accesso, I&apos;ve built AI-assisted workflows that refine
                Jira tickets, generate implementation plans, validate UI work
                with Playwright against Figma designs, and help produce QA notes
                plus unit and end-to-end test scaffolding after manual
                validation.
              </p>
              <p>
                I work daily with{' '}
                <a
                  href="https://www.anthropic.com/claude"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claude Code
                </a>
                , but I treat it like any other production tool: useful,
                fallible, and worth designing carefully. The goal is not blind
                automation. It&apos;s better engineering velocity, stronger
                consistency, and more time spent solving the hard parts.
              </p>
            </Reveal>
          </Reveal>

          <Reveal
            as="div"
            className="about-center"
            effect="fade-right"
            delay={180}
            visible={isVisible}
          >
            <div className="about-image-container">
              <div className="about-image-wrapper">
                <img
                  src="/branding/jp-headshot/jp-400.webp"
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  alt="Justin Paoletta working on code"
                  className="about-image"
                />
                <div className="image-decoration" aria-hidden="true" />
              </div>
            </div>

            <div className="about-values">
              <h3 className="values-title">Core Principles</h3>
              <div className="values-grid">
                <Reveal
                  as="article"
                  className="value-card"
                  delay={260}
                  visible={isVisible}
                >
                  <div className="value-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path
                        d="M12 6v6l4 2"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h4>Quality</h4>
                  <div className="value-card-content">
                    <div className="value-card-content-inner">
                      <p>
                        It starts with precision. Lay the right groundwork,
                        design with AI in mind, and accelerate with confidence
                        and reduced risk.
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal
                  as="article"
                  className="value-card"
                  delay={340}
                  visible={isVisible}
                >
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
                  <div className="value-card-content">
                    <div className="value-card-content-inner">
                      <p>
                        Great outcomes are built together. The strongest
                        solutions emerge from diverse perspectives working in
                        sync.
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal
                  as="article"
                  className="value-card"
                  delay={420}
                  visible={isVisible}
                >
                  <div className="value-icon" aria-hidden="true">
                    <BrainIcon strokeWidth={2} size={24} />
                  </div>
                  <h4>Continuous Learning</h4>
                  <div className="value-card-content">
                    <div className="value-card-content-inner">
                      <p>
                        Stay curious. Continuously explore new technologies,
                        patterns, and ideas to keep evolving and improving.
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal
                  as="article"
                  className="value-card"
                  delay={500}
                  visible={isVisible}
                >
                  <div className="value-icon" aria-hidden="true">
                    <BookOpenIcon strokeWidth={2} size={24} />
                  </div>
                  <h4>Documentation</h4>
                  <div className="value-card-content">
                    <div className="value-card-content-inner">
                      <p>
                        Create clear, thoughtful documentation that empowers
                        both AI agents and developers to quickly understand the
                        project and contribute effectively from day one.
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal
                  as="article"
                  className="value-card"
                  delay={580}
                  visible={isVisible}
                >
                  <div className="value-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <h4>Accessibility</h4>
                  <div className="value-card-content">
                    <div className="value-card-content-inner">
                      <p>
                        Design inclusive experiences that are usable, welcoming,
                        and effective for everyone.
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;

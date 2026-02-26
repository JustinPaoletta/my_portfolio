/**
 * About Section
 * Background and story with Framer Motion animations
 */

import { Brain, BookOpen } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import {
  fadeUpVariants,
  fadeLeftVariants,
  fadeRightVariants,
  staggerContainerVariants,
  sectionHeaderVariants,
  defaultViewport,
} from '@/utils/animations';
import './About.css';

function About(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, defaultViewport);
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
        <motion.header
          className="section-header"
          variants={sectionHeaderVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="section-label" variants={fadeUpVariants}>
            About Me
          </motion.span>
          <motion.h2
            id="about-heading"
            className="section-title"
            variants={fadeUpVariants}
          >
            My Career
          </motion.h2>
        </motion.header>

        <div className="about-content" ref={contentRef}>
          <motion.div
            className="about-text"
            variants={fadeLeftVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="about-story" ref={storyRef}>
              <p className="about-intro">
                It was the drive to challenge myself and really understand how
                things work that led me to learn how to code. When I eventually
                built my first website I realized I enjoyed the process so
                immensely, that I chose to take a leap and make a career change.
                In 2020, the year of the COVID-19 pandemic, I quit my job and
                joined the HRR45 cohort at Hack Reactor. It was from there, I
                learned the fundamentals of building full stack web applications
                and gained the experience and foundation needed for a successful
                career in software development.
              </p>

              <p>
                Today, I&apos;m primarily frontend-focused, working as a UI
                Engineer for accesso. I know my way around backend systems, and
                I can build/support features end to end. I focus on the quality
                of what I produce and advocate for maintainable solutions that
                scale without breaking. I care deeply about thoughtful design,
                reducing unnecessary complexity, and building software that
                people will find useful and enjoy using.
              </p>
            </div>

            <motion.div
              className="about-highlights"
              variants={staggerContainerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
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
                <motion.div
                  className="highlight-item"
                  variants={fadeUpVariants}
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
                </motion.div>
                <motion.div
                  className="highlight-item"
                  variants={fadeUpVariants}
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
                    300+
                  </span>
                  <span className="highlight-label">
                    Jira Tickets Completed
                  </span>
                </motion.div>
                <motion.div
                  className="highlight-item"
                  variants={fadeUpVariants}
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
                    1500+
                  </span>
                  <span className="highlight-label">
                    Diet Dews Converted to Code
                  </span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="about-ai"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <h3 className="about-ai-title">
                Thoughts on AI
                <img
                  src="/images/about/thoughts.webp"
                  width={18}
                  height={18}
                  alt=""
                  className="about-ai-icon"
                  aria-hidden="true"
                />
              </h3>
              <p className="about-ai-lede">
                Artificial intelligence is arguably the most significant
                invention of our lifetimes. At its core, it&apos;s simple, it
                predicts the next most likely token. The complexity that emerges
                from such a simple concept though is what makes it
                extraordinarily valuable.
              </p>
              <p>
                Used properly, we can learn faster, plan more efficiently and
                code higher quality software with incredible speed. We need to
                approach it with caution though, it&apos;s not an oracle, and it
                doesn&apos;t consciously &ldquo;think&rdquo; like we do. It
                builds statistical models and finds patterns, but it has no
                awareness, or understanding, its mathematics.
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
                , I validate its claims, test its outputs, and treat it as a
                tool rather than an all knowing authority, and my productivity
                has multiplied. It&apos;s reshaping what&apos;s possible for a
                single developer to build, or break, so code responsibly.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="about-center"
            variants={fadeRightVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className="about-image-container">
              <div className="about-image-wrapper">
                <img
                  src="/branding/jp-headshot/jp-400.webp"
                  width={400}
                  height={400}
                  alt="Justin working on code"
                  className="about-image"
                />
                <div className="image-decoration" aria-hidden="true" />
              </div>
            </div>

            <motion.div
              className="about-values"
              variants={staggerContainerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <h3 className="values-title">Core Principles</h3>
              <div className="values-grid">
                <motion.article
                  className="value-card"
                  variants={fadeUpVariants}
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
                </motion.article>

                <motion.article
                  className="value-card"
                  variants={fadeUpVariants}
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
                </motion.article>

                <motion.article
                  className="value-card"
                  variants={fadeUpVariants}
                >
                  <div className="value-icon" aria-hidden="true">
                    <Brain strokeWidth={2} size={24} />
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
                </motion.article>

                <motion.article
                  className="value-card"
                  variants={fadeUpVariants}
                >
                  <div className="value-icon" aria-hidden="true">
                    <BookOpen strokeWidth={2} size={24} />
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
                </motion.article>

                <motion.article
                  className="value-card"
                  variants={fadeUpVariants}
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
                </motion.article>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;

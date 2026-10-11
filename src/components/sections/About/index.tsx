/** Background and a concrete engineering approach. */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import './About.css';

const approachSteps = [
  {
    title: 'Clarify the requirements',
    description:
      'Start with the user flow, constraints, and acceptance criteria before choosing an implementation.',
  },
  {
    title: 'Check the implementation',
    description:
      'Use type checks, linting, and focused unit and browser tests to catch repeatable failures.',
  },
  {
    title: 'Inspect the result',
    description:
      'Review the code and the interface, then document the behavior and remaining QA checks.',
  },
];

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
            as="span"
            className="section-label"
            delay={40}
            visible={isVisible}
          >
            About
          </Reveal>
          <Reveal
            as="h2"
            id="about-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            How I Work
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
              I work on the practical challenges of modernizing frontend
              systems: keeping existing products running while making them
              easier to build on.
            </p>
            <p>
              At accesso, that means integrating Angular and React
              micro-frontends into a legacy AngularJS platform, isolating
              framework lifecycles and styles, and improving release tooling.
            </p>
            <p>
              My personal projects give me room to explore reusable components,
              full-stack applications, and developer tools. I document their
              current capabilities and what still needs work.
            </p>
            <a className="about-work-link" href="#experience">
              Read my professional experience <span aria-hidden="true">→</span>
            </a>
          </Reveal>

          <Reveal
            as="div"
            className="about-approach"
            effect="fade-right"
            delay={180}
            visible={isVisible}
          >
            <h3>From requirement to verified change</h3>
            <ol className="approach-steps">
              {approachSteps.map((step) => (
                <li key={step.title}>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
            <p className="approach-example">
              For UI work, I connect Jira requirements, Figma comparisons,
              Playwright checks, and QA notes. AI helps draft plans and
              implementations; deterministic checks and human review determine
              whether the change is ready.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;

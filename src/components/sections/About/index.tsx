import { SECTION_NAMES } from '@/content/site';
/** Background and a concrete engineering approach. */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import './About.css';

const approachSteps = [
  {
    title: 'Establish the context',
    description:
      'Connect Jira requirements, design references, application constraints, and acceptance criteria.',
  },
  {
    title: 'Use AI with judgment',
    description:
      'Explore approaches and draft changes, checking assumptions and taking responsibility for the implementation.',
  },
  {
    title: 'Verify and document',
    description:
      'Review the code and interface, run focused checks, and record useful QA notes and remaining limitations.',
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
              At accesso, I help modernize the frontend platform behind accesso
              Passport, bringing Angular and React micro-frontends into an
              established AngularJS application.
            </p>
            <p>
              My work includes integrating frameworks, isolating styles and
              application lifecycles, and improving release tooling. These
              changes support ongoing modernization while keeping existing
              functionality dependable.
            </p>
            <p>
              I also incorporate AI into planning, implementation, and
              documentation. I review its suggestions against the requirements
              and existing code, then verify the resulting changes through
              automated checks, browser testing, and human review.
            </p>
            <a className="about-work-link" href="#experience">
              View my experience <span aria-hidden="true">→</span>
            </a>
          </Reveal>

          <Reveal
            as="div"
            className="about-approach"
            effect="fade-up"
            delay={180}
            visible={isVisible}
          >
            <h3>From requirement to reviewed change</h3>
            <ol className="approach-steps">
              {approachSteps.map((step) => (
                <li key={step.title}>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
            <p className="approach-example">
              I’ve also built an AI-assisted PR review bot that flags potential
              issues for developer review.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;

/** A focused stack connected to actual work. */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import './Skills.css';

const skillIcons: Record<string, string[]> = {
  'Claude Code': ['/icons/claude.webp'],
  Codex: ['/icons/codex.webp'],
  Cursor: ['/icons/cursor.webp'],
  Angular: ['/icons/angular.svg'],
  React: ['/icons/react.svg'],
  TypeScript: ['/icons/typescript.svg'],
  RxJS: ['/icons/rxjs.svg'],
  SCSS: ['/icons/sass.svg'],
  Playwright: ['/icons/playwright.webp'],
  'GitHub Actions': ['/icons/githubactions.svg'],
  Jenkins: ['/icons/jenkins.svg'],
  'Node.js': ['/icons/nodejs.svg'],
  NestJS: ['/icons/nestjs.svg'],
  Prisma: ['/icons/prisma.svg'],
  'MySQL/MariaDB': ['/icons/mysql.svg', '/icons/mariadb.svg'],
};

const skillAreas = [
  {
    title: 'Frontend Architecture',
    technologies: ['Angular', 'React', 'TypeScript', 'RxJS', 'SCSS'],
    description:
      'I lead frontend modernization for an AngularJS platform used by hundreds of venues worldwide. I architected a React micro-frontend and led the migration of eight Angular micro-frontends into the platform. My work establishes repeatable integration patterns that isolate framework lifecycles and styles, support independent feature development, and reduce technical debt.',
  },
  {
    title: 'Testing & Release Automation',
    technologies: ['Playwright', 'GitHub Actions', 'Jenkins'],
    description:
      'I own release automation across 8+ applications, using Jenkins pipelines and internal tooling to cut deployment time by about 75%. I build automated checks for UI behavior, code quality, and test coverage. My work includes Playwright validation and a GitHub Actions review bot that improves review consistency and flags logic, security, and memory risks.',
  },
  {
    title: 'Backend APIs & Data',
    technologies: ['Node.js', 'NestJS', 'Prisma', 'MySQL/MariaDB'],
    description:
      'I build typed APIs and relational data models that connect application features to persistent storage. I organize backend services around clear responsibilities and consistent database access. My focus is keeping application logic and data access easy to understand, maintain, and extend.',
  },
  {
    title: 'AI-Assisted Development',
    technologies: ['Claude Code', 'Codex', 'Cursor'],
    description:
      'I design AI-assisted workflows that turn Jira requirements into implementation plans and validate UI changes against Figma using Playwright. I also standardize QA documentation and unit and end-to-end test generation. I make these tasks repeatable and verify generated changes through code review and testing.',
  },
];

function Skills(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRevealInView(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="skills-section"
      aria-labelledby="skills-heading"
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
            id="skills-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            Skills & Technologies
          </Reveal>
        </Reveal>

        <div className="skill-areas">
          {skillAreas.map((area, index) => (
            <Reveal
              as="article"
              key={area.title}
              className="skill-area"
              delay={140 + index * 60}
              visible={isVisible}
            >
              <h3>{area.title}</h3>
              <div className="skill-icons" aria-hidden="true">
                {area.technologies.flatMap((technology) =>
                  skillIcons[technology]?.map((icon) => (
                    <span key={icon} className="skill-icon">
                      <img
                        src={icon}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  ))
                )}
              </div>
              <ul
                className="skill-stack"
                aria-label={`${area.title} technologies`}
              >
                {area.technologies.map((technology, technologyIndex) => (
                  <li key={technology}>
                    <span>{technology}</span>
                    {technologyIndex < area.technologies.length - 1 && (
                      <span aria-hidden="true" className="skill-separator">
                        ·
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="skill-summary">{area.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;

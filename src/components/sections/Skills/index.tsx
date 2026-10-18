/** A focused stack connected to actual work. */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import './Skills.css';

const skillIcons: Record<string, string[]> = {
  'Claude Code': ['/icons/claude.webp'],
  Codex: ['/icons/codex.webp'],
  'Cursor (IDE)': ['/icons/cursor.webp'],
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
    title: 'Frontend systems',
    technologies: ['Angular', 'React', 'TypeScript', 'RxJS', 'SCSS'],
    description:
      'I modernize established frontend applications while keeping existing features dependable. My work spans reusable components, micro-frontend integration, and clear boundaries between frameworks and styles.',
  },
  {
    title: 'Testing & delivery',
    technologies: ['Playwright', 'GitHub Actions', 'Jenkins'],
    description:
      'I turn critical user journeys into repeatable browser checks and automate build and release workflows, giving teams faster feedback and reducing manual release work.',
  },
  {
    title: 'APIs & data',
    technologies: ['Node.js', 'NestJS', 'Prisma', 'MySQL/MariaDB'],
    description:
      'I build typed APIs and relational data models that connect application features to persistent storage, using clear service boundaries and consistent database access.',
  },
  {
    title: 'AI-assisted development',
    technologies: ['Claude Code', 'Codex', 'Cursor (IDE)'],
    description:
      'I use AI tools to explore approaches, draft implementations, and review code. I verify changes with tests and manual review, and remain responsible for the code I ship.',
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

/** A focused stack connected to actual work. */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import { BITSTOCKERZ_PROJECT } from '@/content/projects';
import './Skills.css';

const skillIcons: Record<string, string[]> = {
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
      'Angular and React micro-frontends inside an AngularJS host, with attention to framework lifecycles and style isolation.',
    link: '#experience',
    linkLabel: 'See the modernization work',
  },
  {
    title: 'Testing & delivery',
    technologies: ['Playwright', 'GitHub Actions', 'Jenkins'],
    description:
      'Browser checks for UI behavior, continuous integration, and release automation across four applications.',
    link: '#experience',
    linkLabel: 'See the delivery work',
  },
  {
    title: 'APIs & data',
    technologies: ['Node.js', 'NestJS', 'Prisma', 'MySQL/MariaDB'],
    description:
      'BitStockerz pairs an Angular client with a NestJS API for strategy research, historical backtests, and paper trading. The project is in development.',
    link: BITSTOCKERZ_PROJECT.githubUrl,
    linkLabel: 'Inspect the BitStockerz source',
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
            as="span"
            className="section-label"
            delay={40}
            visible={isVisible}
          >
            Applied Skills
          </Reveal>
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
              <ul
                className="skill-stack"
                aria-label={`${area.title} technologies`}
              >
                {area.technologies.map((technology) => (
                  <li key={technology}>
                    {skillIcons[technology]?.map((icon) => (
                      <span key={icon} className="skill-icon">
                        <img
                          src={icon}
                          alt=""
                          width={16}
                          height={16}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    ))}
                    <span>{technology}</span>
                  </li>
                ))}
              </ul>
              <p>{area.description}</p>
              <a
                href={area.link}
                target={area.link?.startsWith('https:') ? '_blank' : undefined}
                rel={
                  area.link?.startsWith('https:')
                    ? 'noopener noreferrer'
                    : undefined
                }
              >
                {area.linkLabel} <span aria-hidden="true">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;

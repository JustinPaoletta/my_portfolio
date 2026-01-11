/**
 * Experience Section
 * Work history and education timeline
 */

import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import './Experience.css';

interface ExperienceItem {
  id: string;
  type: 'work' | 'education';
  title: string;
  organization: string;
  location: string;
  period: string;
  current?: boolean;
  description: React.ReactNode;
  highlights: string[];
  technologies?: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 'exp-1',
    type: 'work',
    title: 'UI Engineer',
    organization: 'accesso',
    location: 'Orlando, FL (Remote)',
    period: 'May 2021 – Present',
    current: true,
    description: (
      <>
        Develop and maintain frontend features for the{' '}
        <a
          href="https://accesso.com/capabilities/products/passport/"
          target="_blank"
          rel="noopener noreferrer"
        >
          accesso Passport
        </a>{' '}
        platform, a cloud-hosted SaaS eCommerce ticketing system used by
        high-volume entertainment venues worldwide.
      </>
    ),
    highlights: [
      'Engineer on a large-scale, production micro-frontend platform supporting multiple independently deployed applications',
      'Develop and maintain complex user interfaces using Angular (10+), AngularJS, React, TypeScript, and RxJS',
      'Contribute to shared UI libraries and design systems used across teams, balancing consistency with application-specific needs',
      'Work in hybrid legacy/modern codebases, incrementally modernizing systems while maintaining business continuity',
      'Collaborate closely with product managers, designers, and backend engineers to deliver features under tight deadlines',
      'Regularly unblock teammates by debugging complex issues, clarifying requirements, and proposing pragmatic technical solutions',
      'Participate in architectural discussions around state management, performance, and frontend scalability',
      'Write, review, and refactor production code with an emphasis on maintainability, readability, and long-term ownership',
      'Contribute to CI/CD pipelines, build processes, and automated testing workflows',
      'Use Git extensively for version control, code reviews, and cross-team collaboration in a multi-repo environment',
    ],
    technologies: [
      'Angular',
      'AngularJS',
      'React',
      'TypeScript',
      'RxJS',
      'GitHub',
      'CI/CD',
      'Jenkins',
      'Agile',
      'Scrum',
      'Jira',
      'Confluence',
      'Docker',
      'AWS',
    ],
  },
  {
    id: 'exp-2',
    type: 'work',
    title: 'Software Engineer',
    organization: '4C Strategies',
    location: 'Orlando, FL',
    period: 'Aug 2020 – Apr 2021',
    current: false,
    description:
      'Gained early hands-on experience shipping code, reviewing PRs, and working with legacy systems.',
    highlights: [
      'Contributed to Angular UI components and Java backend endpoints as part of a team of 5 engineers.',
      'Used GitLab for version control, participating in code reviews and team-based development workflows.',
    ],
    technologies: ['Angular', 'Java', 'GitLab'],
  },
  {
    id: 'edu-1',
    type: 'education',
    title: 'Advanced Software Engineering Immersive',
    organization: 'Hack Reactor',
    location: '(Remote)',
    period: '2020',
    description:
      'Full-time, 12-week intensive focused on full-stack JavaScript engineering and computer science fundamentals.',
    highlights: [
      'Completed ~600+ hours of hands-on programming under production-style deadlines',
      'Built and shipped multiple full-stack applications',
      'Applied core CS concepts including data structures, algorithmic problem solving, asynchronous programming, and system design fundamentals',
      'Collaborated in small engineering teams using Git/GitHub, code reviews, pair programming, and Agile workflows',
      'Designed and implemented RESTful APIs, relational database schemas, and client-side state management',
      'Regularly solved algorithmic challenges under time constraints (whiteboarding and live coding)',
    ],
    technologies: ['JavaScript', 'Node.js', 'Express', 'PostgreSQL', 'React'],
  },
  {
    id: 'edu-2',
    type: 'education',
    title: 'Bachelor of Science (B.S.) in Psychology',
    organization: 'University of Central Florida',
    location: 'Orlando, FL',
    period: '2008-2012',
    description:
      'Coursework emphasized research methods, statistics, cognitive psychology, and behavioral analysis.',
    highlights: [
      'Developed a foundation in analytical thinking, experimental design, and human-centered problem solving',
      'Applied statistical reasoning and behavioral analysis to complex systems',
    ],
  },
];

function Experience(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  const workExperiences = experiences.filter((e) => e.type === 'work');
  const education = experiences.filter((e) => e.type === 'education');

  return (
    <section
      ref={sectionRef}
      id="experience"
      className={`experience-section ${isVisible ? 'visible' : ''}`}
      aria-labelledby="experience-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <span className="section-label">Career</span>
          <h2 id="experience-heading" className="section-title">
            Experience & Education
          </h2>
        </header>

        <div className="experience-content">
          {/* Work Experience */}
          <div className="experience-column">
            <h3 className="column-title">
              <svg
                className="column-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="7"
                  width="20"
                  height="14"
                  rx="2"
                  strokeWidth="2"
                />
                <path
                  d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
                  strokeWidth="2"
                />
              </svg>
              Work Experience
            </h3>

            <div className="timeline">
              {workExperiences.map((exp, index) => (
                <article
                  key={exp.id}
                  className={`timeline-item ${exp.current ? 'current' : ''}`}
                  style={
                    { '--delay': `${index * 0.15}s` } as React.CSSProperties
                  }
                >
                  <div className="timeline-marker" aria-hidden="true">
                    {exp.current && (
                      <span className="pulse" aria-label="Current position" />
                    )}
                  </div>
                  <div className="timeline-content">
                    <header className="item-header">
                      <h4 className="item-title">{exp.title}</h4>
                      <span className="item-period">{exp.period}</span>
                    </header>
                    <div className="item-org">
                      <span className="org-name">{exp.organization}</span>
                      <span className="org-location">{exp.location}</span>
                    </div>
                    <p className="item-description">{exp.description}</p>
                    <ul className="item-highlights">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                    {exp.technologies && (
                      <div className="item-tech">
                        {exp.technologies.map((tech) => (
                          <span key={tech} className="tech-badge">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="experience-column education-column">
            <h3 className="column-title">
              <svg
                className="column-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2" />
              </svg>
              Education
            </h3>

            <div className="timeline">
              {education.map((edu, index) => (
                <article
                  key={edu.id}
                  className="timeline-item"
                  style={
                    {
                      '--delay': `${(workExperiences.length + index) * 0.15}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className="timeline-marker" aria-hidden="true" />
                  <div className="timeline-content">
                    <header className="item-header">
                      <h4 className="item-title">{edu.title}</h4>
                      <span className="item-period">{edu.period}</span>
                    </header>
                    <div className="item-org">
                      <span className="org-name">{edu.organization}</span>
                      <span className="org-location">{edu.location}</span>
                    </div>
                    <p className="item-description">{edu.description}</p>
                    <ul className="item-highlights">
                      {edu.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>

            {/* Resume Download */}
            <div className="resume-cta">
              <a
                href="/Justin Paoletta_Software Engineer.pdf"
                download="Justin_Paoletta_Resume.pdf"
                className="resume-button"
                aria-label="Download resume as PDF"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="7 10 12 15 17 10"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Download Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Experience;

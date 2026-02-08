/**
 * Experience Section
 * Work history and education timeline
 * Uses Framer Motion for smooth scroll animations
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  fadeUpVariants,
  fadeLeftVariants,
  fadeRightVariants,
  staggerContainerVariants,
  sectionHeaderVariants,
  defaultViewport,
} from '@/utils/animations';
import './Experience.css';

interface ExperienceItem {
  id: string;
  type: 'work' | 'education';
  title: string;
  organization: string;
  organizationUrl?: string;
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
    organizationUrl: 'https://www.accesso.com',
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
    organizationUrl: 'https://www.4cstrategies.com',
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
    organizationUrl: 'https://www.hackreactor.com',
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
    organizationUrl: 'https://www.ucf.edu',
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
  const isInView = useInView(sectionRef, defaultViewport);

  const workExperiences = experiences.filter((e) => e.type === 'work');
  const education = experiences.filter((e) => e.type === 'education');
  const renderOrganization = (
    organization: string,
    organizationUrl?: string
  ): React.ReactNode =>
    organizationUrl ? (
      <a
        className="org-name"
        href={organizationUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {organization}
      </a>
    ) : (
      <span className="org-name">{organization}</span>
    );

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="experience-section"
      aria-labelledby="experience-heading"
    >
      <div className="section-container">
        <motion.header
          className="section-header"
          variants={sectionHeaderVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="section-label" variants={fadeUpVariants}>
            Professional
          </motion.span>
          <motion.h2
            id="experience-heading"
            className="section-title"
            variants={fadeUpVariants}
          >
            Experience & Education
          </motion.h2>
        </motion.header>

        <div className="experience-content">
          {/* Work Experience */}
          <motion.div
            className="experience-column"
            variants={fadeLeftVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
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

            <motion.div
              className="timeline"
              variants={staggerContainerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {workExperiences.map((exp) => (
                <motion.article
                  key={exp.id}
                  className={`timeline-item ${exp.current ? 'current' : ''}`}
                  variants={fadeUpVariants}
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
                      {renderOrganization(
                        exp.organization,
                        exp.organizationUrl
                      )}
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
                </motion.article>
              ))}
            </motion.div>
          </motion.div>

          {/* Education */}
          <motion.div
            className="experience-column education-column"
            variants={fadeRightVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
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

            <motion.div
              className="timeline"
              variants={staggerContainerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {education.map((edu) => (
                <motion.article
                  key={edu.id}
                  className="timeline-item"
                  variants={fadeUpVariants}
                >
                  <div className="timeline-marker" aria-hidden="true" />
                  <div className="timeline-content">
                    <header className="item-header">
                      <h4 className="item-title">{edu.title}</h4>
                      <span className="item-period">{edu.period}</span>
                    </header>
                    <div className="item-org">
                      {renderOrganization(
                        edu.organization,
                        edu.organizationUrl
                      )}
                      <span className="org-location">{edu.location}</span>
                    </div>
                    <p className="item-description">{edu.description}</p>
                    <ul className="item-highlights">
                      {edu.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            {/* Resume Download */}
            <motion.div
              className="resume-cta"
              variants={fadeUpVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <a
                href="/Justin Paoletta_Software Engineer.pdf"
                download="Justin_Paoletta_Resume.pdf"
                className="resume-button"
                aria-label="Download resume as PDF"
              >
                <svg
                  className="resume-button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="7 10 12 15 17 10"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Download Resume
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Experience;

/**
 * Experience Section
 * Work history with supporting education credentials
 */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import './Experience.css';

interface CareerEntry {
  id: string;
  title: string;
  organization: string;
  organizationUrl?: string;
  location: string;
  period: string;
}

interface WorkExperience extends CareerEntry {
  current?: boolean;
  description: React.ReactNode;
  highlights: string[];
  technologies?: string[];
}

const workExperiences: WorkExperience[] = [
  {
    id: 'exp-1',
    title: 'Software Engineer (UI Engineer)',
    organization: 'accesso',
    organizationUrl: 'https://www.accesso.com',
    location: 'Lake Mary, FL',
    period: 'May 2021 – Present',
    current: true,
    description: (
      <>
        Modernize the legacy AngularJS platform behind{' '}
        <a
          href="https://accesso.com/capabilities/products/passport/"
          target="_blank"
          rel="noopener noreferrer"
        >
          accesso Passport
        </a>{' '}
        with micro-frontends, supporting high-volume entertainment venues
        worldwide.
      </>
    ),
    highlights: [
      'Architected a React + Tailwind micro-frontend inside a legacy AngularJS + Bootstrap host, isolating framework lifecycles and eliminating cross-framework styling conflicts.',
      'Led migration of 8 Angular micro-frontends into an AngularJS shell using ngUpgrade, enabling incremental platform modernization without a full rewrite.',
      'Engineered release automation that reduced deployment time by about 75% across four applications, coordinating Jenkins pipelines, release notes, Jira updates, and internal documentation.',
      'Developed an AI-assisted engineering workflow using Claude Code agents, custom skills, Playwright, and Figma validation to refine Jira requirements, generate implementation plans, iterate on UI work, and prepare QA documentation plus unit and end-to-end test scaffolding after manual validation.',
      'Built a Claude-powered PR review bot in GitHub Actions to flag logic, security, and memory issues for developer review.',
    ],
    technologies: [
      'AngularJS',
      'Angular',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Bootstrap',
      'RxJS',
      'ngUpgrade',
      'Jenkins',
      'GitHub Actions',
      'CI/CD',
      'Jira',
      'Playwright',
      'Figma',
      'Claude Code',
    ],
  },
  {
    id: 'exp-2',
    title: 'Angular Developer',
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
];

const education: CareerEntry[] = [
  {
    id: 'edu-1',
    title: 'Advanced Software Engineering Immersive',
    organization: 'Hack Reactor',
    organizationUrl: 'https://www.hackreactor.com',
    location: '(Remote)',
    period: '2020',
  },
  {
    id: 'edu-2',
    title: 'Bachelor of Science (B.S.) in Psychology',
    organization: 'University of Central Florida',
    organizationUrl: 'https://www.ucf.edu',
    location: 'Orlando, FL',
    period: '2008-2012',
  },
];

function Experience(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRevealInView(sectionRef);

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
            Career
          </Reveal>
          <Reveal
            as="h2"
            id="experience-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            Professional Experience
          </Reveal>
        </Reveal>

        <div className="experience-content">
          {/* Work Experience */}
          <Reveal
            as="div"
            className="work-experience"
            effect="fade-only"
            delay={140}
            visible={isVisible}
          >
            <div className="experience-work-header">
              <h3 className="work-history-title">Work History</h3>
              <a
                href="/resume/Justin-Paoletta_Software-Engineer.pdf"
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
                <span className="resume-button-label">Download Resume</span>
              </a>
            </div>

            <div className="timeline">
              {workExperiences.map((exp, index) => (
                <Reveal
                  as="article"
                  key={exp.id}
                  className={`timeline-item ${exp.current ? 'current' : ''}`}
                  delay={200 + index * 90}
                  visible={isVisible}
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
                </Reveal>
              ))}
            </div>
          </Reveal>

          {/* Education */}
          <Reveal
            as="div"
            className="education-section"
            effect="fade-only"
            delay={200}
            visible={isVisible}
          >
            <h3 className="education-title">Education</h3>

            <ul className="education-list">
              {education.map((edu) => (
                <li key={edu.id} className="education-credential">
                  <div className="education-credential-header">
                    <h4 className="education-credential-title">{edu.title}</h4>
                    <span className="item-period">{edu.period}</span>
                  </div>
                  <div className="education-credential-org">
                    {renderOrganization(edu.organization, edu.organizationUrl)}
                    <span className="org-location">{edu.location}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Experience;

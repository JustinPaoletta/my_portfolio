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
  description: string;
  highlights: string[];
  technologies?: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 'exp-1',
    type: 'work',
    title: 'Senior Software Engineer',
    organization: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    period: '2022 - Present',
    current: true,
    description:
      'Leading development of cloud-native applications and mentoring junior engineers.',
    highlights: [
      'Architected microservices platform serving 2M+ daily users',
      'Reduced API response times by 60% through optimization',
      'Led migration to Kubernetes, improving deployment frequency by 10x',
      'Mentored team of 5 engineers on best practices and design patterns',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'AWS', 'Kubernetes'],
  },
  {
    id: 'exp-2',
    type: 'work',
    title: 'Full Stack Developer',
    organization: 'StartupXYZ',
    location: 'Austin, TX',
    period: '2020 - 2022',
    description:
      'Built and maintained full-stack applications from concept to deployment.',
    highlights: [
      'Developed real-time collaboration features using WebSockets',
      'Implemented CI/CD pipeline reducing deployment time by 80%',
      'Built analytics dashboard processing 1M+ events daily',
      'Contributed to open-source projects with 500+ GitHub stars',
    ],
    technologies: ['Vue.js', 'Python', 'PostgreSQL', 'Docker', 'Redis'],
  },
  {
    id: 'exp-3',
    type: 'work',
    title: 'Software Engineer',
    organization: 'Digital Solutions Co.',
    location: 'Remote',
    period: '2018 - 2020',
    description: 'Developed web applications and APIs for enterprise clients.',
    highlights: [
      'Built REST APIs serving 100K+ requests per day',
      'Implemented authentication system with OAuth 2.0',
      'Reduced page load times by 40% through performance optimization',
      'Collaborated with cross-functional teams in Agile environment',
    ],
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'AWS'],
  },
  {
    id: 'edu-1',
    type: 'education',
    title: 'Bachelor of Science in Computer Science',
    organization: 'University of Technology',
    location: 'Boston, MA',
    period: '2014 - 2018',
    description:
      'Focused on software engineering, algorithms, and distributed systems.',
    highlights: [
      'Graduated with Honors (GPA: 3.8)',
      'Senior thesis on distributed computing patterns',
      'Teaching Assistant for Data Structures course',
      'Member of Computer Science Club and Hackathon Team',
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
              <a href="/resume.pdf" className="resume-button">
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

/**
 * Projects Section
 * Showcase of best work with descriptions, tech stack, and links
 */

import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import './Projects.css';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  inDevelopment?: boolean;
}

const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Bitstockerz',
    description:
      'A paper trading platform for cryptocurrency and stocks that lets users practice trading strategies with virtual portfolios. Track real-time prices, execute simulated trades, and learn market dynamics without risking real money—designed to build confidence and understanding of financial markets over time.',
    image: '/bitcoin.webp',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
    githubUrl: '#',
    featured: true,
    inDevelopment: true,
  },
  {
    id: 'project-2',
    title: '@jp-angular-ui',
    description:
      'A reusable UI component library built with Angular, featuring accessible, customizable components with consistent styling and comprehensive documentation. Includes form controls, data display elements, navigation patterns, and utility components—designed for rapid development and maintainability across projects.',
    image: '/ui-ux-elements.webp',
    techStack: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'Storybook'],
    githubUrl: '#',
    featured: true,
    inDevelopment: true,
  },
  {
    id: 'project-3',
    title: 'StarForge',
    description:
      'A cosmic strategy game built in Godot where you forge life and weapons from stellar matter. Use heat, pressure, and gravitational collapse to out-engineer hostile alien forces and expand your control across an ever-growing cosmos.',
    image: '/starforge.webp',
    techStack: ['Godot', 'GDScript', 'Game Design', 'Procedural Generation'],
    githubUrl: '#',
    featured: true,
    inDevelopment: true,
  },
  {
    id: 'project-4',
    title: 'Coverage IQ',
    description:
      'Coverage IQ is a mobile companion app designed to help Madden players make smarter defensive play calls in real time. It breaks down offensive formations, situational context, and coverage concepts to recommend effective counters, explaining not just what to call, but why it works. Built with a coach-first mindset, Coverage IQ focuses on decision-making, user responsibility, and practical adjustments that translate directly to better on-field results.',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    techStack: [
      'React Native',
      'TypeScript',
      'Node.js',
      'SQLite',
      'Mobile Development',
    ],
    githubUrl: '#',
    featured: false,
  },
  {
    id: 'project-5',
    title: 'SideQuest: Pittsburgh',
    description:
      'SideQuest: Pittsburgh is a discovery app for finding the weird, fun, and off-the-beaten-path things to do around the city. Instead of ranking by popularity like Yelp, it surfaces hidden spots, low-key entertainment, micro-events, and neighborhood oddities. The app works offline-first and focuses on local knowledge over influencer recommendations.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    techStack: ['React Native', 'TypeScript', 'Express', 'MongoDB', 'Maps API'],
    githubUrl: '#',
    featured: false,
  },
  {
    id: 'project-6',
    title: 'Easy Eats',
    description:
      'Easy Eats is a lightweight food-tracking app I built for personal use after struggling with the friction and overhead of existing calorie and macro trackers. By focusing on reusable recipes and repeatable portions instead of daily ingredient entry, the app reduces cognitive load and makes consistent, healthy eating easier to maintain over time.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    techStack: [
      'React',
      'TypeScript',
      'SQLite',
      'Nutrition API',
      'Mobile-First',
    ],
    githubUrl: '#',
    featured: false,
  },
];

function Projects(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className={`projects-section ${isVisible ? 'visible' : ''}`}
      aria-labelledby="projects-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <span className="section-label">Portfolio</span>
          <h2 id="projects-heading" className="section-title">
            Featured Projects
          </h2>
          <p className="section-subtitle">
            Exploratory engineering projects I'm tinkering with.
          </p>
        </header>

        {/* Featured Projects */}
        <div className="featured-projects">
          {featuredProjects.map((project, index) => (
            <article
              key={project.id}
              className="featured-project"
              style={{ '--delay': `${index * 0.15}s` } as React.CSSProperties}
            >
              <div className="project-image-wrapper">
                <img
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  className="project-image"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <div className="project-overlay">
                  <div className="project-links">
                    {project.inDevelopment && (
                      <span
                        className="project-status"
                        aria-label="Project in development"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <path
                            d="M12 6v6l4 2"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>In Development</span>
                      </span>
                    )}
                    {project.liveUrl && !project.inDevelopment && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        aria-label={`View ${project.title} live demo`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="15 3 21 3 21 9"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="10"
                            y1="14"
                            x2="21"
                            y2="3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Live Demo</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        aria-label={`View ${project.title} source code`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        <span>Source</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Other Projects */}
        <h3 className="other-projects-title">Other Projects</h3>
        <div className="other-projects">
          {otherProjects.map((project, index) => (
            <article
              key={project.id}
              className="project-card"
              style={
                {
                  '--delay': `${(index + featuredProjects.length) * 0.1}s`,
                } as React.CSSProperties
              }
            >
              <div className="card-header">
                <svg
                  className="folder-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="card-links">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                      aria-label={`View ${project.title} live`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                          strokeWidth="2"
                        />
                        <polyline points="15 3 21 3 21 9" strokeWidth="2" />
                        <line x1="10" y1="14" x2="21" y2="3" strokeWidth="2" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <h4 className="card-title">{project.title}</h4>
              <p className="card-description">{project.description}</p>
              <div className="card-tech">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span key={tech} className="tech-tag-small">
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;

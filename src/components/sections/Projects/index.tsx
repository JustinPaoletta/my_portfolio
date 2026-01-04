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
}

const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Cloud Dashboard',
    description:
      'A comprehensive cloud infrastructure monitoring dashboard with real-time metrics, alerting, and cost optimization insights. Built with performance and scalability in mind.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    techStack: ['React', 'TypeScript', 'D3.js', 'Node.js', 'PostgreSQL'],
    liveUrl: '#',
    githubUrl: '#',
    featured: true,
  },
  {
    id: 'project-2',
    title: 'E-Commerce Platform',
    description:
      'Full-stack e-commerce solution with modern payment integration, inventory management, and analytics. Optimized for high traffic and conversion.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    techStack: ['Next.js', 'Stripe', 'Prisma', 'Tailwind CSS', 'Redis'],
    liveUrl: '#',
    githubUrl: '#',
    featured: true,
  },
  {
    id: 'project-3',
    title: 'AI Content Generator',
    description:
      'An intelligent content creation tool leveraging GPT models for blog posts, social media, and marketing copy. Features collaborative editing and version control.',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    techStack: ['Python', 'FastAPI', 'OpenAI', 'React', 'MongoDB'],
    liveUrl: '#',
    githubUrl: '#',
    featured: true,
  },
  {
    id: 'project-4',
    title: 'DevOps Automation Suite',
    description:
      'CI/CD pipeline automation with infrastructure as code, container orchestration, and deployment strategies for modern cloud-native applications.',
    image:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=600&fit=crop',
    techStack: ['Go', 'Kubernetes', 'Terraform', 'GitHub Actions', 'AWS'],
    liveUrl: '#',
    githubUrl: '#',
    featured: false,
  },
  {
    id: 'project-5',
    title: 'Real-Time Chat App',
    description:
      'Scalable messaging platform with end-to-end encryption, file sharing, and video calling capabilities. Built for reliability and privacy.',
    image:
      'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&h=600&fit=crop',
    techStack: ['Socket.io', 'WebRTC', 'Express', 'React', 'Redis'],
    liveUrl: '#',
    githubUrl: '#',
    featured: false,
  },
  {
    id: 'project-6',
    title: 'Analytics Dashboard',
    description:
      'Business intelligence dashboard with customizable widgets, data visualization, and automated reporting. Transforms complex data into actionable insights.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    techStack: ['Vue.js', 'Chart.js', 'Python', 'Apache Kafka', 'ClickHouse'],
    liveUrl: '#',
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
            A selection of my recent work and personal projects
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
                    {project.liveUrl && (
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

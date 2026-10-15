import { SECTION_NAMES } from '@/content/site';
/**
 * Projects Section
 * Showcase of best work with descriptions, tech stack, and links
 */

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import { env } from '@/config/env';
import {
  BITSTOCKERZ_PROJECT,
  JP_DESIGN_SYSTEM_PROJECT,
  PROJECT_STATUS_LABELS,
  type ProjectSummary,
} from '@/content/projects';
import './Projects.css';
import { DesignSystemShowcase } from './DesignSystemShowcase';
import { ExportShowcase } from './ExportShowcase';

interface Project extends ProjectSummary {
  id: string;
  showcase?: 'design-system' | 'exports';
  image: string;
  imageCaption?: string;
  demo?: { src: string; webm: string; captions: string; transcript: string };
  fullSizeCapture?: string;
  imageSrcSet?: string;
  imageSizes?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
  cardImage?: string;
  cardImageAlt?: string;
  cardImageFit?: 'cover' | 'contain';
  cardHeaderIcon?: string;
  cardHeaderIconSrcSet?: string;
  /** When set, shown instead of `title` text in the project heading (e.g. transparent PNG wordmark). */
  titleLogo?: string;
  titleLogoAlt?: string;
}

function ProjectHeadingTitle({
  project,
}: {
  project: Project;
}): React.ReactNode {
  if (project.titleLogo) {
    return (
      <span className="project-title-logo-frame">
        <img
          src={project.titleLogo}
          alt={project.titleLogoAlt ?? project.title}
          className="project-title-logo"
          width={1536}
          height={1024}
          loading="lazy"
        />
      </span>
    );
  }
  return project.title;
}

const githubProfileUrl = env.social.github.replace(/\/+$/, '');

function logoSrcSet(name: string, widths: readonly number[]): string {
  return widths
    .map((width) => `/images/projects/${name}-${width}.webp ${width}w`)
    .join(', ');
}

// The square artwork is contained within a 90%-wide, 4:3 frame with a 3px
// border. Match its painted width through the stacked and two-column layouts.
const sideQuestImageSizes = [
  '(max-width: 640px) calc(67.5vw - 2.025rem - 6px)',
  '(max-width: 1024px) calc(67.5vw - 2.7rem - 6px)',
  '(max-width: 1264px) calc(36.82vw - 2.578rem - 6px)',
  '419px',
].join(', ');

const projects: Project[] = [
  {
    ...JP_DESIGN_SYSTEM_PROJECT,
    id: 'project-2',
    showcase: 'design-system',
    image: '/images/projects/design-system-dashboard-960.webp',
  },
  {
    ...BITSTOCKERZ_PROJECT,
    id: 'project-1',
    image: '/images/projects/bitstockerz-research-1440.webp',
    imageWidth: 1440,
    imageHeight: 960,
    imageCaption:
      '16-second local app walkthrough: strategy rules → simulation settings → backtest results. Synthetic demo data; no live trading.',
    demo: {
      src: '/media/bitstockerz-demo.mp4',
      webm: '/media/bitstockerz-demo.webm',
      captions: '/media/bitstockerz-demo.vtt',
      transcript:
        'In a disposable local account, change the moving-average period and risk exit, then validate and save the strategy. Configure a backtest with 75% allocation, 5 basis points of commission and 5 basis points of slippage. Run the simulation and inspect its benchmark comparison and equity curve. Prices and results are synthetic demo data.',
    },
  },
  {
    id: 'project-3',
    title: 'Godot Playground',
    description:
      'My sandbox for learning the Godot engine, built around small, isolated mechanics, movement systems, UI components, shaders, physics experiments, and prototype gameplay loops. Each technique is a self-contained scene designed to be reused or referenced in future projects.',
    image: '/images/projects/godot-playground.webp',
    cardHeaderIcon: '/images/projects/godot-playground.webp',
    techStack: ['Godot', 'GDScript', 'Shaders', 'Physics'],
    githubUrl: `${githubProfileUrl}/godot_practice`,
    featured: false,
    status: 'development',
  },
  {
    id: 'project-4',
    showcase: 'exports',
    title: 'wild-apricot-exports',
    description:
      'A published Node CLI and library for exporting and backing up Wild Apricot data without relying on the admin UI. It pulls contacts, events, registrations, invoices, payments, donations, audit logs, configuration, and uploaded files through the public REST API and WebDAV, then writes everything locally as JSON, CSV, and original files.',
    image: '/images/projects/wae-exports-logo-180.webp',
    cardHeaderIcon: '/images/projects/wae-exports-logo-60.webp',
    cardHeaderIconSrcSet: logoSrcSet('wae-exports-logo', [60, 120, 180]),
    techStack: ['Node.js', 'TypeScript', 'Commander', 'WebDAV', 'npm CLI'],
    githubUrl: `${githubProfileUrl}/wild-apricot-exports`,
    packageUrl: 'https://www.npmjs.com/package/wild-apricot-exports',
    featured: true,
  },
  {
    id: 'project-5',
    title: 'SideQuest: Pittsburgh',
    description:
      'A private React Native app for discovering offbeat places across Pittsburgh. An offline-first feed prioritizes proximity, novelty, and curated tags. Source access is private; this entry is supporting project context.',
    image: '/images/projects/sidequest-logo-480.webp',
    imageSrcSet: logoSrcSet('sidequest-logo', [240, 480, 720, 960, 1254]),
    imageSizes: sideQuestImageSizes,
    imageAlt: 'SideQuest: Pittsburgh logo',
    cardHeaderIcon: '/images/projects/sidequest-logo-60.webp',
    cardHeaderIconSrcSet: logoSrcSet('sidequest-logo', [60, 120, 180]),
    imageWidth: 1254,
    imageHeight: 1254,
    imageFit: 'contain',
    techStack: ['React Native', 'TypeScript', 'Express', 'MongoDB', 'Maps API'],
    private: true,
    featured: false,
  },
  {
    id: 'project-6',
    title: 'Plexarr',
    cardHeaderIcon: '/images/projects/plexarr-icon-60.webp',
    cardHeaderIconSrcSet: logoSrcSet('plexarr-icon', [60, 120, 180]),
    description:
      'A self-hosted app for discovering and requesting media for my at-home Plex server. Built with Next.js and React, it brings title discovery, quality selection, request confirmation, and an activity log into one flow. Passkeys protect access, and service credentials stay server-side.',
    image: '/images/projects/plexarr-discover-1440.webp',
    imageWidth: 1440,
    imageHeight: 960,
    imageCaption:
      '17-second local app walkthrough: discover a title → choose quality → confirm → view Activity. Actual Plexarr UI with a fictional catalog and simulated services.',
    demo: {
      src: '/media/plexarr-demo.mp4',
      webm: '/media/plexarr-demo.webm',
      captions: '/media/plexarr-demo.vtt',
      transcript:
        'In an isolated local session, browse a fictional movie catalog and open Glass Harbor. Review its details, request the title, and choose the Ultra-HD quality profile. Confirm the selection, then open Activity to see the added entry. This is the actual Plexarr interface with fixed sample responses; no real media server request or download occurs. Sign-in is preconfigured for the recording, so passkey authentication is not demonstrated.',
    },
    techStack: ['Next.js', 'React', 'TypeScript', 'SQLite', 'WebAuthn'],
    private: true,
    featured: true,
  },
];

function Projects(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRevealInView(sectionRef);

  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="projects-section"
      aria-labelledby="projects-heading"
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
            Software & tools
          </Reveal>
          <Reveal
            as="h2"
            id="projects-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            {SECTION_NAMES.projects}
          </Reveal>
        </Reveal>

        {/* My Projects */}
        <div className="featured-projects">
          {featuredProjects.map((project, index) => (
            <Reveal
              as="article"
              key={project.id}
              className="featured-project"
              delay={140 + index * 90}
              visible={isVisible}
            >
              {project.showcase === 'design-system' ? (
                <DesignSystemShowcase />
              ) : project.showcase === 'exports' ? (
                <ExportShowcase />
              ) : project.demo ? (
                <figure className="project-demo">
                  <video
                    controls
                    playsInline
                    preload="none"
                    poster={project.image}
                    width={project.imageWidth}
                    height={project.imageHeight}
                    aria-label={`${project.title} product walkthrough with demo data`}
                  >
                    <source src={project.demo.webm} type="video/webm" />
                    <source src={project.demo.src} type="video/mp4" />
                    <track
                      kind="captions"
                      src={project.demo.captions}
                      srcLang="en"
                      label="English walkthrough"
                      default
                    />
                    <a href={project.demo.src}>Download the walkthrough</a>
                  </video>
                  <figcaption>
                    <p>{project.imageCaption}</p>
                    <details>
                      <summary>Read the walkthrough</summary>
                      <p>{project.demo.transcript}</p>
                    </details>
                  </figcaption>
                </figure>
              ) : (
                <figure
                  className={`project-image-wrapper${
                    project.imageFit === 'contain'
                      ? ' project-image-wrapper--contain'
                      : ''
                  }`}
                >
                  <img
                    src={project.image}
                    srcSet={project.imageSrcSet}
                    sizes={project.imageSizes}
                    alt={project.imageAlt ?? `${project.title} artwork`}
                    className={`project-image${
                      project.imageFit === 'contain'
                        ? ' project-image--contain'
                        : ''
                    }`}
                    style={
                      project.imagePosition
                        ? { objectPosition: project.imagePosition }
                        : undefined
                    }
                    loading="lazy"
                    decoding="async"
                    width={project.imageWidth ?? 800}
                    height={project.imageHeight ?? 600}
                  />
                  {project.imageCaption && (
                    <figcaption>
                      {project.imageCaption}
                      {project.fullSizeCapture && (
                        <a
                          className="project-capture-link"
                          href={project.fullSizeCapture}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.title} full-size screenshot`}
                        >
                          View full-size screenshot ↗
                        </a>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}
              <div className="project-content">
                {project.cardHeaderIcon && (
                  <img
                    src={project.cardHeaderIcon}
                    srcSet={project.cardHeaderIconSrcSet}
                    sizes="60px"
                    className="folder-icon folder-icon--image"
                    alt=""
                    aria-hidden="true"
                    width={60}
                    height={60}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <h3 className="project-title">
                  <ProjectHeadingTitle project={project} />
                </h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {project.status && project.status !== 'live' && (
                    <span
                      className={`project-status project-status--${project.status}`}
                      aria-label={`Project ${PROJECT_STATUS_LABELS[project.status].toLowerCase()}`}
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
                      <span>{PROJECT_STATUS_LABELS[project.status]}</span>
                    </span>
                  )}
                  {project.liveUrl &&
                    (!project.status || project.status === 'live') && (
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
                  {project.private ? (
                    <span
                      className="project-visibility"
                      aria-label={`${project.title} repository is private`}
                    >
                      <span className="project-link-label">Private</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </span>
                  ) : (
                    project.githubUrl && (
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
                    )
                  )}
                  {project.packageUrl && (
                    <a
                      href={project.packageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                      aria-label={`View ${project.title} on npm`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="m7.5 4.27 9 5.15"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m3.29 7 8.71 5 8.71-5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 22V12"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>npm</span>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Other Projects */}
        <Reveal
          as="h3"
          className="other-projects-title"
          delay={240}
          visible={isVisible}
        >
          More Projects
        </Reveal>
        <div className="other-projects">
          {otherProjects.map((project, index) => (
            <Reveal
              as="article"
              key={project.id}
              className={`project-card${
                project.titleLogo && !project.cardImage
                  ? ' project-card--title-logo'
                  : ''
              }`}
              delay={280 + index * 80}
              visible={isVisible}
            >
              <div className="card-header">
                {project.cardHeaderIcon ? (
                  <img
                    src={project.cardHeaderIcon}
                    srcSet={project.cardHeaderIconSrcSet}
                    sizes={project.cardHeaderIconSrcSet ? '60px' : undefined}
                    alt=""
                    aria-hidden="true"
                    className="folder-icon folder-icon--image"
                    width={60}
                    height={60}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
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
                )}
                <div className="card-links">
                  {project.private ? (
                    <span
                      className="card-link card-link--disabled"
                      aria-label={`${project.title} repository is private`}
                    >
                      <span className="card-link-label">Private</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </span>
                  ) : (
                    project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-link"
                        aria-label={`View ${project.title} on GitHub`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )
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
                  {project.packageUrl && (
                    <a
                      href={project.packageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                      aria-label={`View ${project.title} on npm`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          d="m7.5 4.27 9 5.15"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m3.29 7 8.71 5 8.71-5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 22V12"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              {project.cardImage && (
                <div
                  className={`card-image-wrapper${
                    project.cardImageFit === 'contain'
                      ? ' card-image-wrapper--contain'
                      : ''
                  }`}
                >
                  <img
                    src={project.cardImage}
                    alt={project.cardImageAlt ?? `${project.title} preview`}
                    className={`card-image${
                      project.cardImageFit === 'contain'
                        ? ' card-image--contain'
                        : ''
                    }`}
                    loading="lazy"
                  />
                </div>
              )}
              <h4 className="card-title">
                <ProjectHeadingTitle project={project} />
              </h4>
              <p className="card-description">{project.description}</p>
              <div className="card-tech">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span key={tech} className="tech-tag-small">
                    {tech}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;

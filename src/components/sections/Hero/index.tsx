/**
 * Hero Section
 * Main introduction with name, title, and brief intro
 * Uses Framer Motion for smooth parallax scrolling
 */

import { useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { env } from '@/config/env';
import { useTheme } from '@/hooks/useTheme';
import './Hero.css';

const tracePaths = [
  { id: 'trace-top-1', d: 'M660 300 L660 250 L627 170 L627 110' },
  { id: 'trace-top-2', d: 'M685 300 L685 250 L658 170 L658 110' },
  { id: 'trace-top-3', d: 'M711 300 L711 250 L690 170 L690 110' },
  { id: 'trace-top-4', d: 'M736 300 L736 250 L721 170 L721 110' },
  { id: 'trace-top-5', d: 'M762 300 L762 250 L753 170 L753 110' },
  { id: 'trace-top-6', d: 'M787 300 L787 250 L784 170 L784 110' },
  { id: 'trace-top-7', d: 'M813 300 L813 250 L816 170 L816 110' },
  { id: 'trace-top-8', d: 'M838 300 L838 250 L847 170 L847 110' },
  { id: 'trace-top-9', d: 'M864 300 L864 250 L879 170 L879 110' },
  { id: 'trace-top-10', d: 'M889 300 L889 250 L910 170 L910 110' },
  { id: 'trace-top-11', d: 'M915 300 L915 250 L942 170 L942 110' },
  { id: 'trace-top-12', d: 'M940 300 L940 250 L973 170 L973 110' },
  { id: 'trace-bottom-1', d: 'M660 600 L660 650 L627 730 L627 810' },
  { id: 'trace-bottom-2', d: 'M685 600 L685 650 L658 730 L658 810' },
  { id: 'trace-bottom-3', d: 'M711 600 L711 650 L690 730 L690 810' },
  { id: 'trace-bottom-4', d: 'M736 600 L736 650 L721 730 L721 810' },
  { id: 'trace-bottom-5', d: 'M762 600 L762 650 L753 730 L753 810' },
  { id: 'trace-bottom-6', d: 'M787 600 L787 650 L784 730 L784 810' },
  { id: 'trace-bottom-7', d: 'M813 600 L813 650 L816 730 L816 810' },
  { id: 'trace-bottom-8', d: 'M838 600 L838 650 L847 730 L847 810' },
  { id: 'trace-bottom-9', d: 'M864 600 L864 650 L879 730 L879 810' },
  { id: 'trace-bottom-10', d: 'M889 600 L889 650 L910 730 L910 810' },
  { id: 'trace-bottom-11', d: 'M915 600 L915 650 L942 730 L942 810' },
  { id: 'trace-bottom-12', d: 'M940 600 L940 650 L973 730 L973 810' },
  { id: 'trace-left-1', d: 'M650 310 L590 310 L510 283 L200 283 L140 343' },
  { id: 'trace-left-2', d: 'M650 341 L590 341 L510 320 L200 320 L140 380' },
  { id: 'trace-left-3', d: 'M650 372 L590 372 L510 357 L200 357 L140 417' },
  { id: 'trace-left-4', d: 'M650 403 L590 403 L510 394 L200 394 L140 454' },
  { id: 'trace-left-5', d: 'M650 434 L590 434 L510 431 L200 431 L140 491' },
  { id: 'trace-left-6', d: 'M650 466 L590 466 L510 469 L200 469 L140 529' },
  { id: 'trace-left-7', d: 'M650 497 L590 497 L510 506 L200 506 L140 566' },
  { id: 'trace-left-8', d: 'M650 528 L590 528 L510 543 L200 543 L140 603' },
  { id: 'trace-left-9', d: 'M650 559 L590 559 L510 580 L200 580 L140 640' },
  { id: 'trace-left-10', d: 'M650 590 L590 590 L510 617 L200 617 L140 677' },
  {
    id: 'trace-right-1',
    d: 'M950 310 L1010 310 L1090 283 L1400 283 L1460 223',
  },
  {
    id: 'trace-right-2',
    d: 'M950 341 L1010 341 L1090 320 L1400 320 L1460 260',
  },
  {
    id: 'trace-right-3',
    d: 'M950 372 L1010 372 L1090 357 L1400 357 L1460 297',
  },
  {
    id: 'trace-right-4',
    d: 'M950 403 L1010 403 L1090 394 L1400 394 L1460 334',
  },
  {
    id: 'trace-right-5',
    d: 'M950 434 L1010 434 L1090 431 L1400 431 L1460 371',
  },
  {
    id: 'trace-right-6',
    d: 'M950 466 L1010 466 L1090 469 L1400 469 L1460 409',
  },
  {
    id: 'trace-right-7',
    d: 'M950 497 L1010 497 L1090 506 L1400 506 L1460 446',
  },
  {
    id: 'trace-right-8',
    d: 'M950 528 L1010 528 L1090 543 L1400 543 L1460 483',
  },
  {
    id: 'trace-right-9',
    d: 'M950 559 L1010 559 L1090 580 L1400 580 L1460 520',
  },
  {
    id: 'trace-right-10',
    d: 'M950 590 L1010 590 L1090 617 L1400 617 L1460 557',
  },
];

type TracePoint = {
  x: number;
  y: number;
};

const extractTracePoints = (d: string): TracePoint[] => {
  const tokens = d.match(/[ML]|-?\d+(?:\.\d+)?/g);
  if (!tokens) {
    return [];
  }

  const points: TracePoint[] = [];
  let i = 0;
  let command = '';

  while (i < tokens.length) {
    const token = tokens[i];
    if (token === 'M' || token === 'L') {
      command = token;
      i += 1;
      continue;
    }

    if (!command) {
      i += 1;
      continue;
    }

    const x = Number(token);
    const y = Number(tokens[i + 1]);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      break;
    }

    points.push({ x, y });
    i += 2;
  }

  return points;
};

const traceNodes = tracePaths.map((trace) => ({
  id: trace.id,
  points: extractTracePoints(trace.d),
}));

function Hero(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const loadedThemeStyles = useRef(new Set<string>());
  const { themeName } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const disableParallax = prefersReducedMotion;

  useEffect(() => {
    const loaders: Record<string, () => Promise<unknown>> = {
      cosmic: () => import('./Hero.cosmic.css'),
      dewTheDew: () => import('./Hero.dew.css'),
      breezy: () => import('./Hero.breezy.css'),
    };

    const loadThemeStyles = loaders[themeName];
    if (!loadThemeStyles || loadedThemeStyles.current.has(themeName)) {
      return;
    }

    loadThemeStyles();
    loadedThemeStyles.current.add(themeName);
  }, [themeName]);

  // Framer Motion scroll hooks for smooth parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Transform scroll position to parallax offset with smooth spring physics
  // As user scrolls from 0 to 500px, content moves 0 to 125px (0.25 multiplier)
  const parallaxRange = useTransform(scrollYProgress, [0, 1], [0, 125], {
    clamp: true,
  });
  const parallaxY = useSpring(parallaxRange, {
    stiffness: 120,
    damping: 30,
    mass: 0.6,
  });

  // Fade out content as user scrolls
  const opacityRange = useTransform(scrollYProgress, [0, 0.9], [1, 0], {
    clamp: true,
  });
  const opacity = useSpring(opacityRange, {
    stiffness: 120,
    damping: 30,
    mass: 0.6,
  });

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-section visible"
      aria-labelledby="hero-heading"
    >
      <div className="hero-background" aria-hidden="true">
        {themeName === 'breezy' && (
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/brees.mp4" type="video/mp4" />
          </video>
        )}
        <div className="star-layer star-layer-back" />
        <div className="nebula-layer nebula-layer-1" />
        <div className="nebula-layer nebula-layer-2" />
        <div className="nebula-layer nebula-layer-3" />
        <div className="nebula-layer nebula-layer-4" />
        <div className="star-layer star-layer-front" />
        <div className="dew-bubbles dew-bubbles--1" />
        <div className="dew-bubbles dew-bubbles--2" />
        <div className="dew-bubbles dew-bubbles--3" />
        <div className="hero-circuit">
          <div className="circuit-board" />
          <div className="circuit-traces" />
          <div className="circuit-nodes" />
          <div className="circuit-electrons">
            <svg
              className="electron-svg"
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                {tracePaths.map((trace) => (
                  <path key={trace.id} id={trace.id} d={trace.d} />
                ))}
              </defs>
              <g className="node-pulse-layer">
                {traceNodes.flatMap((trace, index) => {
                  const duration = 5.8 + (index % 5) * 0.5;
                  const begin = (index * 0.35) % 3.2;
                  const reverse = index % 4 === 0;
                  const nodeCount = trace.points.length;

                  return trace.points.map((point, nodeIndex) => {
                    const fraction =
                      nodeCount > 1 ? nodeIndex / (nodeCount - 1) : 0;
                    const progress = reverse ? 1 - fraction : fraction;
                    const offset = begin + duration * progress;
                    const style = {
                      '--pulse-duration': `${duration.toFixed(1)}s`,
                      '--pulse-offset': `${offset.toFixed(2)}s`,
                    } as React.CSSProperties;

                    return (
                      <circle
                        key={`${trace.id}-node-${nodeIndex}`}
                        className="node-pulse"
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        style={style}
                      />
                    );
                  });
                })}
              </g>
              {tracePaths.map((trace, index) => {
                const duration = 5.8 + (index % 5) * 0.5;
                const begin = (index * 0.35) % 3.2;
                const reverse = index % 4 === 0;
                return (
                  <circle key={trace.id} className="electron-dot" r="3">
                    <animateMotion
                      dur={`${duration.toFixed(1)}s`}
                      repeatCount="indefinite"
                      begin={`${begin.toFixed(2)}s`}
                      {...(reverse
                        ? {
                            keyPoints: '1;0',
                            keyTimes: '0;1',
                            calcMode: 'linear',
                          }
                        : {})}
                    >
                      <mpath href={`#${trace.id}`} />
                    </animateMotion>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <motion.div
        className="hero-content"
        style={{
          y: disableParallax ? 0 : parallaxY,
          opacity: disableParallax ? 1 : opacity,
        }}
      >
        <div className="hero-text-stack">
          <span className="hero-greeting">Hello, I&apos;m</span>

          <h1
            id="hero-heading"
            className="hero-name"
            aria-label="Justin Paoletta"
          >
            <span className="hero-name-text" aria-hidden="true">
              Justin Paoletta
            </span>
            <svg
              className="hero-name-svg"
              viewBox="0 0 1000 200"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="hero-name-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="var(--text-primary)" />
                  <stop offset="55%" stopColor="var(--color-primary-light)" />
                  <stop offset="100%" stopColor="var(--color-accent)" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="72%"
                textAnchor="start"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
                className="hero-name-svg-text"
              >
                Justin Paoletta
              </text>
            </svg>
            <img
              className="hero-astronaut"
              src="/astro.png"
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
            />
          </h1>

          <p className="hero-title">
            <span className="title-text">Software Engineer</span>
            <span className="title-divider" aria-hidden="true">
              •
            </span>
            <span className="title-text">Problem Solver</span>
            <span className="title-divider" aria-hidden="true">
              •
            </span>
            <span className="title-text">Fixer of Things</span>
          </p>
        </div>

        <img
          className="hero-dew-text"
          src="/dew_text.png"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
        />

        <div className="hero-tagline">
          <p>I solve complex business challenges through thoughtful code,</p>
          <p>
            and deliver fast reliable solutions with precision and expertise.
          </p>
        </div>

        <div className="hero-cta">
          <a href="#projects" className="cta-primary">
            <span>View My Work</span>
            <svg
              className="cta-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a href="#contact" className="cta-secondary">
            <span>Get In Touch</span>
          </a>
        </div>

        <div className="hero-social">
          <a
            href={env.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="GitHub Profile"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href={env.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="LinkedIn Profile"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href={`mailto:${env.social.email}`}
            className="social-link"
            aria-label="Send Email"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;

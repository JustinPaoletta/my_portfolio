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
  { id: 'trace-top-2', d: 'M687.5 300 L687.5 250 L660.5 170 L660.5 110' },
  { id: 'trace-top-3', d: 'M712.5 300 L712.5 250 L691.5 170 L691.5 110' },
  { id: 'trace-top-4', d: 'M737.5 300 L737.5 250 L722.5 170 L722.5 110' },
  { id: 'trace-top-5', d: 'M762.5 300 L762.5 250 L753.5 170 L753.5 110' },
  { id: 'trace-top-6', d: 'M787.5 300 L787.5 250 L784.5 170 L784.5 110' },
  { id: 'trace-top-7', d: 'M812.5 300 L812.5 250 L815.5 170 L815.5 110' },
  { id: 'trace-top-8', d: 'M837.5 300 L837.5 250 L846.5 170 L846.5 110' },
  { id: 'trace-top-9', d: 'M862.5 300 L862.5 250 L877.5 170 L877.5 110' },
  { id: 'trace-top-10', d: 'M887.5 300 L887.5 250 L908.5 170 L908.5 110' },
  { id: 'trace-top-11', d: 'M912.5 300 L912.5 250 L939.5 170 L939.5 110' },
  { id: 'trace-bottom-2', d: 'M687.5 600 L687.5 650 L660.5 730 L660.5 810' },
  { id: 'trace-bottom-3', d: 'M712.5 600 L712.5 650 L691.5 730 L691.5 810' },
  { id: 'trace-bottom-4', d: 'M737.5 600 L737.5 650 L722.5 730 L722.5 810' },
  { id: 'trace-bottom-5', d: 'M762.5 600 L762.5 650 L753.5 730 L753.5 810' },
  { id: 'trace-bottom-6', d: 'M787.5 600 L787.5 650 L784.5 730 L784.5 810' },
  { id: 'trace-bottom-7', d: 'M812.5 600 L812.5 650 L815.5 730 L815.5 810' },
  { id: 'trace-bottom-8', d: 'M837.5 600 L837.5 650 L846.5 730 L846.5 810' },
  { id: 'trace-bottom-9', d: 'M862.5 600 L862.5 650 L877.5 730 L877.5 810' },
  { id: 'trace-bottom-10', d: 'M887.5 600 L887.5 650 L908.5 730 L908.5 810' },
  { id: 'trace-bottom-11', d: 'M912.5 600 L912.5 650 L939.5 730 L939.5 810' },
  {
    id: 'trace-left-2',
    d: 'M650 362.5 L590 362.5 L510 341.5 L200 341.5 L140 401.5',
  },
  {
    id: 'trace-left-3',
    d: 'M650 387.5 L590 387.5 L510 372.5 L200 372.5 L140 432.5',
  },
  {
    id: 'trace-left-4',
    d: 'M650 412.5 L590 412.5 L510 403.5 L200 403.5 L140 463.5',
  },
  {
    id: 'trace-left-5',
    d: 'M650 437.5 L590 437.5 L510 434.5 L200 434.5 L140 494.5',
  },
  {
    id: 'trace-left-6',
    d: 'M650 462.5 L590 462.5 L510 465.5 L200 465.5 L140 525.5',
  },
  {
    id: 'trace-left-7',
    d: 'M650 487.5 L590 487.5 L510 496.5 L200 496.5 L140 556.5',
  },
  {
    id: 'trace-left-8',
    d: 'M650 512.5 L590 512.5 L510 527.5 L200 527.5 L140 587.5',
  },
  {
    id: 'trace-left-9',
    d: 'M650 537.5 L590 537.5 L510 558.5 L200 558.5 L140 618.5',
  },
  {
    id: 'trace-right-2',
    d: 'M 950 537.5 L 1010 537.5 L 1090 558.5 L 1400 558.5 L 1460 498.5',
  },
  {
    id: 'trace-right-3',
    d: 'M 950 512.5 L 1010 512.5 L 1090 527.5 L 1400 527.5 L 1460 467.5',
  },
  {
    id: 'trace-right-4',
    d: 'M 950 487.5 L 1010 487.5 L 1090 496.5 L 1400 496.5 L 1460 436.5',
  },
  {
    id: 'trace-right-5',
    d: 'M 950 462.5 L 1010 462.5 L 1090 465.5 L 1400 465.5 L 1460 405.5',
  },
  {
    id: 'trace-right-6',
    d: 'M 950 437.5 L 1010 437.5 L 1090 434.5 L 1400 434.5 L 1460 374.5',
  },
  {
    id: 'trace-right-7',
    d: 'M 950 412.5 L 1010 412.5 L 1090 403.5 L 1400 403.5 L 1460 343.5',
  },
  {
    id: 'trace-right-8',
    d: 'M 950 387.5 L 1010 387.5 L 1090 372.5 L 1400 372.5 L 1460 312.5',
  },
  {
    id: 'trace-right-9',
    d: 'M 950 362.5 L 1010 362.5 L 1090 341.5 L 1400 341.5 L 1460 281.5',
  },
];

type TracePoint = {
  x: number;
  y: number;
};

type TraceSegment = {
  start: TracePoint;
  end: TracePoint;
};

const chip = {
  x: 650,
  y: 300,
  size: 300,
  radius: 14,
  coreSize: 150,
  coreRadius: 10,
  pinLength: 28,
  diagonalLength: 18,
};

const chipCoreOffset = (chip.size - chip.coreSize) / 2;

const getFirstTwoPoints = (d: string): TracePoint[] => {
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
    if (points.length >= 2) {
      break;
    }
    i += 2;
  }

  return points;
};

const getSuffix = (id: string): number => {
  const match = id.match(/-(\d+)$/);
  return match ? Number(match[1]) : 0;
};

const buildPinSegments = (prefix: string): TraceSegment[] =>
  tracePaths
    .filter((trace) => trace.id.startsWith(prefix))
    .sort((a, b) => getSuffix(a.id) - getSuffix(b.id))
    .map((trace) => {
      const points = getFirstTwoPoints(trace.d);
      if (points.length < 2) {
        return null;
      }
      return { start: points[0], end: points[1] };
    })
    .filter((segment): segment is TraceSegment => Boolean(segment));

const chipPins = {
  top: buildPinSegments('trace-top-'),
  bottom: buildPinSegments('trace-bottom-'),
  left: buildPinSegments('trace-left-'),
  right: buildPinSegments('trace-right-'),
};

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
          <div className="circuit-chip-svg" aria-hidden="true">
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <g className="chip-svg">
                <rect
                  className="chip-body"
                  x={chip.x}
                  y={chip.y}
                  width={chip.size}
                  height={chip.size}
                  rx={chip.radius}
                />
                <rect
                  className="chip-core"
                  x={chip.x + chipCoreOffset}
                  y={chip.y + chipCoreOffset}
                  width={chip.coreSize}
                  height={chip.coreSize}
                  rx={chip.coreRadius}
                />
                <circle
                  className="chip-marker"
                  cx={chip.x + chip.size - 24}
                  cy={chip.y + 24}
                  r="8"
                />
                {chipPins.top.map((segment, index) => (
                  <line
                    key={`chip-top-${index}`}
                    className="chip-pin"
                    x1={segment.start.x}
                    y1={segment.start.y}
                    x2={segment.end.x}
                    y2={segment.end.y}
                  />
                ))}
                {chipPins.bottom.map((segment, index) => (
                  <line
                    key={`chip-bottom-${index}`}
                    className="chip-pin"
                    x1={segment.start.x}
                    y1={segment.start.y}
                    x2={segment.end.x}
                    y2={segment.end.y}
                  />
                ))}
                {chipPins.left.map((segment, index) => (
                  <line
                    key={`chip-left-${index}`}
                    className="chip-pin"
                    x1={segment.start.x}
                    y1={segment.start.y}
                    x2={segment.end.x}
                    y2={segment.end.y}
                  />
                ))}
                {chipPins.right.map((segment, index) => (
                  <line
                    key={`chip-right-${index}`}
                    className="chip-pin"
                    x1={segment.start.x}
                    y1={segment.start.y}
                    x2={segment.end.x}
                    y2={segment.end.y}
                  />
                ))}
                <line
                  className="chip-pin-diagonal"
                  x1={chip.x}
                  y1={chip.y}
                  x2={chip.x - chip.diagonalLength}
                  y2={chip.y - chip.diagonalLength}
                />
                <line
                  className="chip-pin-diagonal"
                  x1={chip.x + chip.size}
                  y1={chip.y}
                  x2={chip.x + chip.size + chip.diagonalLength}
                  y2={chip.y - chip.diagonalLength}
                />
                <line
                  className="chip-pin-diagonal"
                  x1={chip.x}
                  y1={chip.y + chip.size}
                  x2={chip.x - chip.diagonalLength}
                  y2={chip.y + chip.size + chip.diagonalLength}
                />
                <line
                  className="chip-pin-diagonal"
                  x1={chip.x + chip.size}
                  y1={chip.y + chip.size}
                  x2={chip.x + chip.size + chip.diagonalLength}
                  y2={chip.y + chip.size + chip.diagonalLength}
                />
              </g>
            </svg>
          </div>
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
            {themeName === 'cosmic' && (
              <img
                className="hero-astronaut"
                src="/astro.webp"
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
              />
            )}
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

        {themeName === 'dewTheDew' && (
          <img
            className="hero-dew-text"
            src="/dew_text.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
          />
        )}

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

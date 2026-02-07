/**
 * Hero Section
 * Main introduction with name, title, and brief intro
 * Uses Framer Motion for smooth parallax scrolling
 */

import { useRef } from 'react';
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
  { id: 'trace-1', d: 'M80 140H360V260H620' },
  { id: 'trace-2', d: 'M120 760H420V560H740V420H980' },
  { id: 'trace-3', d: 'M200 200V360H360V520H520' },
  { id: 'trace-4', d: 'M520 140H720V300H980V180H1240' },
  { id: 'trace-5', d: 'M900 760H1120V600H1320V420' },
  { id: 'trace-6', d: 'M1080 120V280H1240V480H1460' },
  { id: 'trace-7', d: 'M320 680H520V800H820' },
  { id: 'trace-8', d: 'M680 520V700H940V820H1220' },
  { id: 'trace-9', d: 'M300 80V220H460V360H620' },
  { id: 'trace-10', d: 'M760 100V220H940V360H1100' },
  { id: 'trace-11', d: 'M140 460H340V340H540V260' },
  { id: 'trace-12', d: 'M360 620V500H560V380H820' },
  { id: 'trace-13', d: 'M60 300H200V140H420' },
  { id: 'trace-14', d: 'M140 860H360V700H600' },
  { id: 'trace-15', d: 'M420 420H620V560H860' },
  { id: 'trace-16', d: 'M520 60H820V160H1040' },
  { id: 'trace-17', d: 'M980 260H1200V120H1420' },
  { id: 'trace-18', d: 'M1040 680H1280V760H1500' },
  { id: 'trace-19', d: 'M620 860H900V720H1120' },
  { id: 'trace-20', d: 'M860 360V520H1120V620' },
  { id: 'trace-21', d: 'M240 520H440V640H660' },
  { id: 'trace-22', d: 'M820 460H1060V340H1280' },
  { id: 'trace-23', d: 'M100 560V700H260' },
  { id: 'trace-24', d: 'M1180 520V700H1380' },
];

function Hero(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const { themeName } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const disableParallax = prefersReducedMotion;

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

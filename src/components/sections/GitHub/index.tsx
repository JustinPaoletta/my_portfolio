/**
 * GitHub Section
 * Displays contribution graph and pinned repositories
 */

import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useGitHub } from '@/hooks/useGitHub';
import { env } from '@/config/env';
import ContributionGraph from './ContributionGraph';
import './GitHub.css';

function GitHub(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });
  const { user, contributions, loading, error } = useGitHub();

  return (
    <section
      ref={sectionRef}
      id="github"
      className={`github-section ${isVisible ? 'visible' : ''}`}
      aria-labelledby="github-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <span className="section-label">Open Source</span>
          <h2 id="github-heading" className="section-title">
            GitHub Activity
          </h2>
          <p className="section-subtitle">
            My contributions and open-source projects
          </p>
        </header>

        {error && (
          <div className="github-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
            <span>Unable to load GitHub data. Please try again later.</span>
          </div>
        )}

        {/* GitHub Stats Overview */}
        {user && (
          <div className="github-stats-bar">
            <a
              href={env.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="github-profile-link"
            >
              <img
                src={user.avatar_url}
                alt={`${user.name || user.login}'s avatar`}
                className="github-avatar"
                width={48}
                height={48}
              />
              <div className="github-profile-info">
                <span className="github-name">{user.name || user.login}</span>
                <span className="github-username">@{user.login}</span>
              </div>
            </a>

            <div className="github-stats">
              <div className="stat-item">
                <span className="stat-value">{user.public_repos}</span>
                <span className="stat-label">Repos</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user.following}</span>
                <span className="stat-label">Following</span>
              </div>
              {contributions && (
                <div className="stat-item highlight">
                  <span className="stat-value">
                    {contributions.totalContributions}
                  </span>
                  <span className="stat-label">Contributions</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contribution Graph */}
        {contributions && (
          <ContributionGraph
            contributions={contributions}
            loading={loading}
            isVisible={isVisible}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="github-loading" aria-label="Loading GitHub data">
            <div className="loading-skeleton contribution-skeleton" />
            <div className="loading-skeleton repos-skeleton" />
          </div>
        )}

        {/* View Profile CTA */}
        <div className="github-cta">
          <a
            href={env.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="github-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>View Full Profile on GitHub</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="arrow-icon"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default GitHub;

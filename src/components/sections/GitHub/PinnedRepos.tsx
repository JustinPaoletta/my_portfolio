/**
 * PinnedRepos Component
 * Display pinned/featured GitHub repositories
 */

import type { PinnedRepository } from '@/types/github';
import './PinnedRepos.css';

interface PinnedReposProps {
  repos: PinnedRepository[];
  isVisible: boolean;
}

function PinnedRepos({
  repos,
  isVisible,
}: PinnedReposProps): React.ReactElement {
  return (
    <div className={`pinned-repos ${isVisible ? 'visible' : ''}`}>
      <h3 className="repos-title">
        <svg
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
        Featured Repositories
      </h3>

      <div className="repos-grid">
        {repos.map((repo, index) => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-card"
            style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <div className="repo-header">
              <svg
                className="repo-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="repo-name">{repo.name}</span>
            </div>

            <p className="repo-description">
              {repo.description || 'No description provided'}
            </p>

            <div className="repo-meta">
              {repo.primaryLanguage && (
                <span className="repo-language">
                  <span
                    className="language-color"
                    style={{ background: repo.primaryLanguage.color }}
                    aria-hidden="true"
                  />
                  {repo.primaryLanguage.name}
                </span>
              )}

              <span className="repo-stat">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {repo.stargazerCount}
              </span>

              <span className="repo-stat">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="18" r="3" strokeWidth="2" />
                  <circle cx="6" cy="6" r="3" strokeWidth="2" />
                  <circle cx="18" cy="6" r="3" strokeWidth="2" />
                  <path
                    d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"
                    strokeWidth="2"
                  />
                  <path d="M12 12v3" strokeWidth="2" />
                </svg>
                {repo.forkCount}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default PinnedRepos;

import { useRef } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import { env } from '@/config/env';
import { LINKEDIN_ARTICLES } from '@/content/site';
import './Articles.css';

export default function Articles(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRevealInView(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="articles"
      className="articles-section"
      aria-labelledby="articles-heading"
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
            Writing
          </Reveal>
          <Reveal
            as="h2"
            id="articles-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            LinkedIn Articles
          </Reveal>
          <Reveal
            as="p"
            className="section-subtitle articles-subtitle"
            delay={200}
            visible={isVisible}
          >
            Long-form notes on AI-assisted development, engineering rigor, and
            the trade-offs behind building software that lasts.
          </Reveal>
        </Reveal>

        <div className="articles-grid">
          {LINKEDIN_ARTICLES.map((article, index) => (
            <Reveal
              as="article"
              key={article.id}
              className="article-card"
              delay={140 + index * 90}
              visible={isVisible}
            >
              {article.image && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-card__image-link"
                  aria-label={`Open ${article.title} on LinkedIn`}
                >
                  <img
                    src={article.image}
                    alt={article.imageAlt ?? `${article.title} article cover`}
                    className="article-card__image"
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={337}
                  />
                </a>
              )}
              <div className="article-card__eyebrow">
                <span className="article-platform">LinkedIn</span>
                <span className="article-meta-separator" aria-hidden="true" />
                <span className="article-read-time">{article.readTime}</span>
              </div>

              <h3 className="article-title">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-title-link"
                >
                  {article.title}
                </a>
              </h3>

              <p className="article-summary">{article.summary}</p>

              <ul
                className="article-topics"
                aria-label={`Topics covered in ${article.title}`}
              >
                {article.topics.map((topic) => (
                  <li key={topic} className="article-topic">
                    {topic}
                  </li>
                ))}
              </ul>

              <div className="article-footer">
                <span className="article-date">{article.publishedLabel}</span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-cta"
                  aria-label={`Read ${article.title} on LinkedIn`}
                >
                  <span>Read article</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m12 5 7 7-7 7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal
          as="a"
          href={env.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="articles-profile-link"
          delay={280}
          visible={isVisible}
        >
          View more on LinkedIn
        </Reveal>
      </div>
    </section>
  );
}

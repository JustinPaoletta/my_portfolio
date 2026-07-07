import { useCallback, useRef, useState } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import { env } from '@/config/env';
import { LINKEDIN_ARTICLES } from '@/content/site';
import './Articles.css';

function ArticleCard({
  article,
}: {
  article: (typeof LINKEDIN_ARTICLES)[number];
}): React.ReactElement {
  return (
    <article className="article-card">
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
    </article>
  );
}

export default function Articles(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useRevealInView(sectionRef);
  const [activeIndex, setActiveIndex] = useState(0);
  const articleCount = LINKEDIN_ARTICLES.length;
  const activeArticle = LINKEDIN_ARTICLES[activeIndex];
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < articleCount - 1;

  const goToPrevious = useCallback((): void => {
    setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1));
  }, []);

  const goToNext = useCallback((): void => {
    setActiveIndex((currentIndex) =>
      Math.min(articleCount - 1, currentIndex + 1)
    );
  }, [articleCount]);

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

        <Reveal
          as="div"
          className="articles-carousel"
          delay={140}
          visible={isVisible}
        >
          <div
            className="articles-carousel__viewport"
            role="region"
            aria-roledescription="carousel"
            aria-label="LinkedIn articles"
          >
            <div className="articles-carousel__controls">
              <button
                type="button"
                className="articles-carousel__nav"
                aria-label="Previous article"
                disabled={!canGoPrevious}
                onClick={goToPrevious}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="m15 18-6-6 6-6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="articles-carousel__status">
                <p
                  className="articles-carousel__counter"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Article {activeIndex + 1} of {articleCount}
                </p>
                <div
                  className="articles-carousel__dots"
                  role="tablist"
                  aria-label="Select article"
                >
                  {LINKEDIN_ARTICLES.map((article, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={article.id}
                        type="button"
                        role="tab"
                        className="articles-carousel__dot"
                        aria-label={`Show ${article.title}`}
                        aria-selected={isActive}
                        aria-controls={`article-slide-${article.id}`}
                        id={`article-tab-${article.id}`}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => {
                          setActiveIndex(index);
                        }}
                      >
                        <span className="visually-hidden">{article.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="articles-carousel__nav"
                aria-label="Next article"
                disabled={!canGoNext}
                onClick={goToNext}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="m9 18 6-6-6-6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div
              id={`article-slide-${activeArticle.id}`}
              role="tabpanel"
              aria-labelledby={`article-tab-${activeArticle.id}`}
              className="articles-carousel__slide"
            >
              <ArticleCard article={activeArticle} />
            </div>
          </div>
        </Reveal>

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

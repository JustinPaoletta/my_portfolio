import { useCallback, useRef, useState } from 'react';
import { Reveal, useRevealInView } from '@/components/Reveal';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { env } from '@/config/env';
import { LINKEDIN_ARTICLES, SECTION_NAMES } from '@/content/site';
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
            as="h2"
            id="articles-heading"
            className="section-title"
            delay={120}
            visible={isVisible}
          >
            {SECTION_NAMES.articles}
          </Reveal>
          <Reveal
            as="p"
            className="section-subtitle articles-subtitle"
            delay={200}
            visible={isVisible}
          >
            My approach to Software Engineering &amp; AI-assisted development:
            choosing the right tools, automating predictable work, and keeping
            code understandable and maintainable.
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
            aria-label="Article slides"
          >
            <div className="articles-carousel__controls">
              <button
                type="button"
                className="articles-carousel__nav"
                aria-label="Previous article"
                disabled={!canGoPrevious}
                onClick={goToPrevious}
              >
                <ChevronLeftIcon size={20} aria-hidden="true" />
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
                <ChevronRightIcon size={20} aria-hidden="true" />
              </button>
            </div>

            {LINKEDIN_ARTICLES.map((article, index) => {
              const isActivePanel = index === activeIndex;

              return (
                <div
                  key={article.id}
                  id={`article-slide-${article.id}`}
                  role="tabpanel"
                  aria-labelledby={`article-tab-${article.id}`}
                  hidden={!isActivePanel}
                  className="articles-carousel__slide"
                >
                  <ArticleCard article={article} />
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal
          as="div"
          className="articles-profile"
          delay={280}
          visible={isVisible}
        >
          <span>See more on</span>
          <a
            href={env.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="articles-profile-link"
            aria-label="See more on LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

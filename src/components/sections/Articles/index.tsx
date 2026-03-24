import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { env } from '@/config/env';
import { LINKEDIN_ARTICLES } from '@/content/site';
import {
  fadeUpVariants,
  staggerContainerVariants,
  sectionHeaderVariants,
  defaultViewport,
} from '@/utils/animations';
import './Articles.css';

export default function Articles(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, defaultViewport);

  return (
    <section
      ref={sectionRef}
      id="articles"
      className="articles-section"
      aria-labelledby="articles-heading"
    >
      <div className="section-container">
        <motion.header
          className="section-header"
          variants={sectionHeaderVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="section-label" variants={fadeUpVariants}>
            Writing
          </motion.span>
          <motion.h2
            id="articles-heading"
            className="section-title"
            variants={fadeUpVariants}
          >
            LinkedIn Articles
          </motion.h2>
          <motion.p
            className="section-subtitle articles-subtitle"
            variants={fadeUpVariants}
          >
            Long-form notes on AI-assisted development, engineering rigor, and
            the trade-offs behind building software that lasts.
          </motion.p>
        </motion.header>

        <motion.div
          className="articles-grid"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {LINKEDIN_ARTICLES.map((article) => (
            <motion.article
              key={article.id}
              className="article-card"
              variants={fadeUpVariants}
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
            </motion.article>
          ))}
        </motion.div>

        <motion.a
          href={env.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="articles-profile-link"
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          View more on LinkedIn
        </motion.a>
      </div>
    </section>
  );
}

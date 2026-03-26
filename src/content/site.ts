export const HERO_TAGLINE =
  'Frontend platform engineer focused on AngularJS modernization, cross-framework micro-frontends, CI/CD automation, and AI-assisted developer workflows.';

export const SEO_DESCRIPTION =
  'Justin Paoletta is a software engineer focused on frontend platform architecture, AngularJS modernization, micro-frontends, and CI/CD automation.';

export interface LinkedInArticle {
  id: string;
  title: string;
  summary: string;
  publishedLabel: string;
  readTime: string;
  url: string;
  topics: string[];
  image?: string;
  imageAlt?: string;
}

export const LINKEDIN_ARTICLES: LinkedInArticle[] = [
  {
    id: 'agentic-coding',
    title: 'The Two Competing Ideas in Agentic Coding',
    summary:
      'A short essay on the two mindsets emerging around agentic coding, and why explicit constraints, architectural coherence, and engineering judgment still matter when AI is writing code.',
    publishedLabel: 'Feb 18, 2026',
    readTime: '4 min read',
    url: 'https://www.linkedin.com/pulse/two-competing-ideas-agentic-coding-justin-paoletta-acezc',
    topics: [
      'Agentic Coding',
      'AI-Assisted Development',
      'Engineering Quality',
    ],
    image: '/articles/article_1.webp',
    imageAlt: 'The Two Competing Ideas in Agentic Coding article cover',
  },
];

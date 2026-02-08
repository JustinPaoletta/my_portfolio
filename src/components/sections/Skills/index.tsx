/**
 * Skills Section
 * Technologies and tools showcase with category tabs
 * Uses Framer Motion for smooth scroll animations
 */

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import {
  fadeUpVariants,
  staggerContainerVariants,
  fastStaggerContainerVariants,
  sectionHeaderVariants,
  defaultViewport,
} from '@/utils/animations';
import './Skills.css';

interface SkillCategory {
  name: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  icon: string;
  color: string;
  url?: string;
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Frontend',
    skills: [
      {
        name: 'Angular',
        icon: '/icons/angular.svg',
        color: '#DD0031',
        url: 'https://angular.dev/',
      },
      {
        name: 'React',
        icon: '/icons/react.svg',
        color: '#61DAFB',
        url: 'https://react.dev/',
      },
      {
        name: 'TypeScript',
        icon: '/icons/typescript.svg',
        color: '#3178C6',
        url: 'https://www.typescriptlang.org/',
      },
      {
        name: 'JavaScript',
        icon: '/icons/javascript.svg',
        color: '#F7DF1E',
        url: 'https://tc39.es/',
      },
      {
        name: 'RxJS',
        icon: '/icons/rxjs.svg',
        color: '#B7178C',
        url: 'https://rxjs.dev/',
      },
      {
        name: 'HTML5',
        icon: '/icons/html5.svg',
        color: '#E34F26',
        url: 'https://html.spec.whatwg.org/',
      },
      {
        name: 'CSS3',
        icon: '/icons/css3.svg',
        color: '#1572B6',
        url: 'https://www.w3.org/Style/CSS/',
      },
      {
        name: 'Playwright',
        icon: '/icons/playwright.webp',
        color: '#2EAD33',
        url: 'https://playwright.dev/',
      },
      {
        name: 'Jest',
        icon: '/icons/jest.svg',
        color: '#C21325',
        url: 'https://jestjs.io/',
      },
      {
        name: 'AngularJS',
        icon: '/icons/angularjs.svg',
        color: '#E23237',
        url: 'https://angularjs.org/',
      },
    ],
  },
  {
    name: 'Backend',
    skills: [
      {
        name: 'Node.js',
        icon: '/icons/nodejs.svg',
        color: '#339933',
        url: 'https://nodejs.org/',
      },
      {
        name: 'Express',
        icon: '/icons/express.svg',
        color: '#000000',
        url: 'https://expressjs.com/',
      },
      {
        name: 'PostgreSQL',
        icon: '/icons/postgresql.svg',
        color: '#4169E1',
        url: 'https://www.postgresql.org/',
      },
      {
        name: 'Java',
        icon: '/icons/java.svg',
        color: '#ED8B00',
        url: 'https://www.oracle.com/java/',
      },
      {
        name: 'Postman',
        icon: '/icons/postman.webp',
        color: '#FF6C37',
        url: 'https://www.postman.com/',
      },
    ],
  },
  {
    name: 'DevOps & Tools',
    skills: [
      {
        name: 'Git',
        icon: '/icons/git.svg',
        color: '#F05032',
        url: 'https://git-scm.com/',
      },
      {
        name: 'GitHub',
        icon: '/icons/github.svg',
        color: '#181717',
        url: 'https://github.com/',
      },
      {
        name: 'GitLab',
        icon: 'https://cdn.simpleicons.org/gitlab',
        color: '#FC6D26',
        url: 'https://about.gitlab.com/',
      },
      {
        name: 'Docker',
        icon: '/icons/docker.svg',
        color: '#2496ED',
        url: 'https://www.docker.com/',
      },
      {
        name: 'AWS',
        icon: '/icons/aws.svg',
        color: '#FF9900',
        url: 'https://aws.amazon.com/',
      },
      {
        name: 'Vercel',
        icon: 'https://cdn.simpleicons.org/vercel',
        color: '#000000',
        url: 'https://vercel.com/',
      },
      {
        name: 'Jenkins',
        icon: '/icons/jenkins.svg',
        color: '#D24939',
        url: 'https://www.jenkins.io/',
      },
      {
        name: 'Jira',
        icon: '/icons/jira.svg',
        color: '#0052CC',
        url: 'https://www.atlassian.com/software/jira',
      },
      {
        name: 'Confluence',
        icon: '/icons/confluence.svg',
        color: '#172B4D',
        url: 'https://www.atlassian.com/software/confluence',
      },
      {
        name: 'New Relic',
        icon: '/icons/newrelic.svg',
        color: '#1CE783',
        url: 'https://newrelic.com/',
      },
    ],
  },
  {
    name: 'AI',
    skills: [
      {
        name: 'ChatGPT',
        icon: '/icons/chatgpt.svg',
        color: '#000000',
        url: 'https://chatgpt.com/',
      },
      {
        name: 'GitHub Copilot',
        icon: '/icons/copilot.svg',
        color: '#000000',
        url: 'https://github.com/features/copilot',
      },
      {
        name: 'Claude Code',
        icon: '/icons/claude.webp',
        color: '#8C6A4A',
        url: 'https://claude.ai/',
      },
      {
        name: 'Cursor',
        icon: '/icons/cursor.png',
        color: '#4A6A8C',
        url: 'https://cursor.com/',
      },
      {
        name: 'Codex',
        icon: '/icons/codex.png',
        color: '#4A8C6A',
        url: 'https://openai.com/codex',
      },
    ],
  },
];

const additionalSkills = [
  { name: 'REST APIs' },
  { name: 'CI/CD' },
  { name: 'Micro-frontends' },
  { name: 'State Management' },
  { name: 'Design Systems' },
  { name: 'Agile' },
  { name: 'Scrum' },
  { name: 'Code Reviews' },
  { name: 'Pair Programming' },
  {
    name: 'PWA',
    url: 'https://web.dev/learn/pwa/',
  },
  {
    name: 'Service Workers',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
  },
  { name: 'Debugging' },
  { name: 'Performance' },
  { name: 'Accessibility', url: 'https://www.w3.org/WAI/' },
];

function Skills(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, defaultViewport);
  const [activeTab, setActiveTab] = useState(0);
  const { resolvedMode } = useTheme();
  const isDarkMode = resolvedMode === 'dark';

  const handleTabChange = (index: number): void => {
    setActiveTab(index);
  };

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="skills-section"
      aria-labelledby="skills-heading"
    >
      <div className="section-container">
        <motion.header
          className="section-header"
          variants={sectionHeaderVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="section-label" variants={fadeUpVariants}>
            Expertise
          </motion.span>
          <motion.h2
            id="skills-heading"
            className="section-title"
            variants={fadeUpVariants}
          >
            Skills & Technologies
          </motion.h2>
        </motion.header>

        <motion.div
          className="skills-tabs-container"
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div
            className="tabs-list"
            role="tablist"
            aria-label="Skill categories"
          >
            {skillCategories.map((category, index) => (
              <button
                key={category.name}
                className={`tab-button ${activeTab === index ? 'active' : ''}`}
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`tabpanel-${index}`}
                id={`tab-${index}`}
                onClick={() => handleTabChange(index)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setActiveTab((prev) => (prev + 1) % skillCategories.length);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setActiveTab(
                      (prev) =>
                        (prev - 1 + skillCategories.length) %
                        skillCategories.length
                    );
                  }
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.name}
              id={`tabpanel-${categoryIndex}`}
              role="tabpanel"
              aria-labelledby={`tab-${categoryIndex}`}
              className={`tab-panel ${activeTab === categoryIndex ? 'active' : ''}`}
            >
              <motion.div
                className="skills-grid"
                variants={staggerContainerVariants}
                initial="hidden"
                animate={activeTab === categoryIndex ? 'visible' : 'hidden'}
              >
                {category.skills.map((skill) => (
                  <motion.a
                    key={skill.name}
                    className={`skill-item ${skill.url ? 'skill-link' : ''}`}
                    data-skill={skill.name.toLowerCase().replace(/\s+/g, '-')}
                    variants={fadeUpVariants}
                    href={skill.url}
                    target={skill.url ? '_blank' : undefined}
                    rel={skill.url ? 'noopener noreferrer' : undefined}
                    aria-label={
                      skill.url ? `${skill.name} official website` : undefined
                    }
                  >
                    <div className="skill-item-icon">
                      <img
                        src={
                          skill.name === 'AWS' && isDarkMode
                            ? '/icons/aws-dark.svg'
                            : skill.name === 'New Relic'
                              ? isDarkMode
                                ? '/icons/newrelic-dark.svg'
                                : '/icons/newrelic.svg'
                              : skill.icon
                        }
                        alt={`${skill.name} icon`}
                        width="48"
                        height="48"
                        loading="lazy"
                      />
                    </div>
                    <span className="skill-item-name">{skill.name}</span>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="additional-skills"
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h3 className="additional-title">Also Experienced With</h3>
          <motion.div
            className="skill-tags"
            variants={fastStaggerContainerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {additionalSkills.map((skill) =>
              skill.url ? (
                <motion.a
                  key={skill.name}
                  className="skill-tag skill-link"
                  variants={fadeUpVariants}
                  href={skill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${skill.name} official website`}
                >
                  {skill.name}
                </motion.a>
              ) : (
                <motion.span
                  key={skill.name}
                  className="skill-tag"
                  variants={fadeUpVariants}
                >
                  {skill.name}
                </motion.span>
              )
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Skills;

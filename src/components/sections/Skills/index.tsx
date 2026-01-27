/**
 * Skills Section
 * Technologies and tools showcase with category tabs
 */

import { useRef, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import './Skills.css';

interface SkillCategory {
  name: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  icon: string;
  color: string;
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Frontend',
    skills: [
      { name: 'Angular', icon: '/icons/angular.svg', color: '#DD0031' },
      { name: 'React', icon: '/icons/react.svg', color: '#61DAFB' },
      { name: 'TypeScript', icon: '/icons/typescript.svg', color: '#3178C6' },
      { name: 'JavaScript', icon: '/icons/javascript.svg', color: '#F7DF1E' },
      { name: 'RxJS', icon: '/icons/rxjs.svg', color: '#B7178C' },
      { name: 'HTML5', icon: '/icons/html5.svg', color: '#E34F26' },
      { name: 'CSS3', icon: '/icons/css3.svg', color: '#1572B6' },
      { name: 'AngularJS', icon: '/icons/angularjs.svg', color: '#E23237' },
    ],
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Node.js', icon: '/icons/nodejs.svg', color: '#339933' },
      { name: 'Express', icon: '/icons/express.svg', color: '#000000' },
      { name: 'PostgreSQL', icon: '/icons/postgresql.svg', color: '#4169E1' },
      { name: 'Java', icon: '/icons/java.svg', color: '#ED8B00' },
      { name: 'REST APIs', icon: '/icons/rest-api.svg', color: '#FF6B6B' },
    ],
  },
  {
    name: 'DevOps & Tools',
    skills: [
      { name: 'Git', icon: '/icons/git.svg', color: '#F05032' },
      { name: 'GitHub', icon: '/icons/github.svg', color: '#181717' },
      { name: 'Docker', icon: '/icons/docker.svg', color: '#2496ED' },
      { name: 'AWS', icon: '/icons/aws.svg', color: '#FF9900' },
      { name: 'Jenkins', icon: '/icons/jenkins.svg', color: '#D24939' },
      { name: 'CI/CD', icon: '/icons/cicd.svg', color: '#2088FF' },
      { name: 'Jira', icon: '/icons/jira.svg', color: '#0052CC' },
      { name: 'Confluence', icon: '/icons/confluence.svg', color: '#172B4D' },
    ],
  },
];

function Skills(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index: number): void => {
    setActiveTab(index);
  };

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={`skills-section ${isVisible ? 'visible' : ''}`}
      aria-labelledby="skills-heading"
    >
      <div className="section-container">
        <header className="section-header">
          <span className="section-label">Expertise</span>
          <h2 id="skills-heading" className="section-title">
            Skills & Technologies
          </h2>
          <p className="section-subtitle">
            The tools and technologies I use to bring ideas to life
          </p>
        </header>

        <div className="skills-tabs-container">
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
              <div className="skills-grid">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill.name}
                    className="skill-item"
                    style={
                      {
                        '--skill-delay': `${skillIndex * 0.05}s`,
                        '--skill-color': skill.color,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="skill-item-icon"
                      style={{ color: skill.color }}
                    >
                      <img
                        src={skill.icon}
                        alt={`${skill.name} icon`}
                        width="48"
                        height="48"
                        loading="lazy"
                      />
                    </div>
                    <span className="skill-item-name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="additional-skills">
          <h3 className="additional-title">Also Experienced With</h3>
          <div className="skill-tags">
            {[
              'Micro-frontends',
              'State Management',
              'Design Systems',
              'Agile',
              'Scrum',
              'Code Reviews',
              'Pair Programming',
              'GitLab',
              'Vitest',
              'Playwright',
              'Vite',
              'Debugging',
              'Performance',
              'Accessibility',
            ].map((skill, index) => (
              <span
                key={skill}
                className="skill-tag"
                style={
                  { '--tag-delay': `${index * 0.03}s` } as React.CSSProperties
                }
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Skills;

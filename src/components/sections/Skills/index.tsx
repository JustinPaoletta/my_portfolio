/**
 * Skills Section
 * Technologies and tools showcase
 */

import { useRef } from 'react';
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
      { name: 'Angular', icon: '🅰️', color: '#DD0031' },
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '📘', color: '#3178C6' },
      { name: 'JavaScript', icon: '🟨', color: '#F7DF1E' },
      { name: 'RxJS', icon: '🔮', color: '#B7178C' },
      { name: 'HTML5', icon: '📄', color: '#E34F26' },
      { name: 'CSS3', icon: '🎭', color: '#1572B6' },
      { name: 'AngularJS', icon: '🅰️', color: '#E23237' },
    ],
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Node.js', icon: '🟢', color: '#339933' },
      { name: 'Express', icon: '🚂', color: '#000000' },
      { name: 'PostgreSQL', icon: '🐘', color: '#4169E1' },
      { name: 'Java', icon: '☕', color: '#ED8B00' },
      { name: 'REST APIs', icon: '🔗', color: '#FF6B6B' },
    ],
  },
  {
    name: 'DevOps & Tools',
    skills: [
      { name: 'Git', icon: '📦', color: '#F05032' },
      { name: 'GitHub', icon: '🐙', color: '#181717' },
      { name: 'Docker', icon: '🐳', color: '#2496ED' },
      { name: 'AWS', icon: '☁️', color: '#FF9900' },
      { name: 'Jenkins', icon: '🔧', color: '#D24939' },
      { name: 'CI/CD', icon: '🔄', color: '#2088FF' },
      { name: 'Jira', icon: '📋', color: '#0052CC' },
      { name: 'Confluence', icon: '📚', color: '#172B4D' },
    ],
  },
];

function Skills(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

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

        <div className="skills-table">
          {skillCategories.map((category, categoryIndex) => (
            <div key={category.name} className="table-section">
              <h3 className="table-section-title">{category.name}</h3>
              <div className="skills-table-grid">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill.name}
                    className="skill-table-item"
                    style={
                      {
                        '--skill-delay': `${categoryIndex * 0.1 + skillIndex * 0.02}s`,
                        '--skill-color': skill.color,
                      } as React.CSSProperties
                    }
                  >
                    <span className="skill-table-icon" aria-hidden="true">
                      {skill.icon}
                    </span>
                    <span className="skill-table-name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Skills */}
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

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
      { name: 'React', icon: '⚛️', color: '#61DAFB' },
      { name: 'TypeScript', icon: '📘', color: '#3178C6' },
      { name: 'Next.js', icon: '▲', color: '#ffffff' },
      { name: 'Vue.js', icon: '💚', color: '#42B883' },
      { name: 'Tailwind CSS', icon: '🎨', color: '#06B6D4' },
      { name: 'HTML5', icon: '📄', color: '#E34F26' },
      { name: 'CSS3', icon: '🎭', color: '#1572B6' },
      { name: 'Redux', icon: '🔄', color: '#764ABC' },
    ],
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Node.js', icon: '🟢', color: '#339933' },
      { name: 'Python', icon: '🐍', color: '#3776AB' },
      { name: 'Go', icon: '🐹', color: '#00ADD8' },
      { name: 'PostgreSQL', icon: '🐘', color: '#4169E1' },
      { name: 'MongoDB', icon: '🍃', color: '#47A248' },
      { name: 'Redis', icon: '⚡', color: '#DC382D' },
      { name: 'GraphQL', icon: '◈', color: '#E10098' },
      { name: 'REST APIs', icon: '🔗', color: '#FF6B6B' },
    ],
  },
  {
    name: 'DevOps & Tools',
    skills: [
      { name: 'Docker', icon: '🐳', color: '#2496ED' },
      { name: 'Kubernetes', icon: '☸️', color: '#326CE5' },
      { name: 'AWS', icon: '☁️', color: '#FF9900' },
      { name: 'GitHub Actions', icon: '🔧', color: '#2088FF' },
      { name: 'Terraform', icon: '🏗️', color: '#7B42BC' },
      { name: 'Linux', icon: '🐧', color: '#FCC624' },
      { name: 'Git', icon: '📦', color: '#F05032' },
      { name: 'Nginx', icon: '🌐', color: '#009639' },
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

        <div className="skills-grid">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.name}
              className="skill-category"
              style={
                {
                  '--cat-delay': `${categoryIndex * 0.15}s`,
                } as React.CSSProperties
              }
            >
              <h3 className="category-title">{category.name}</h3>
              <div className="skills-list">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill.name}
                    className="skill-item"
                    style={
                      {
                        '--skill-delay': `${categoryIndex * 0.15 + skillIndex * 0.05}s`,
                        '--skill-color': skill.color,
                      } as React.CSSProperties
                    }
                  >
                    <span className="skill-icon" aria-hidden="true" role="img">
                      {skill.icon}
                    </span>
                    <span className="skill-name">{skill.name}</span>
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
              'Jest',
              'Cypress',
              'Playwright',
              'Storybook',
              'Figma',
              'WebSockets',
              'OAuth',
              'JWT',
              'Microservices',
              'Serverless',
              'CI/CD',
              'Agile',
              'Scrum',
              'TDD',
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

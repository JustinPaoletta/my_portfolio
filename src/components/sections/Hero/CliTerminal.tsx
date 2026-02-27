import { useEffect, useMemo, useRef, useState } from 'react';
import { env } from '@/config/env';
import { defaultTheme } from '@/config/themes';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useGitHub } from '@/hooks/useGitHub';
import { usePetDogs } from '@/hooks/usePetDogs';
import { useTheme } from '@/hooks/useTheme';
import './CliTerminal.css';

type LineKind = 'system' | 'output' | 'input' | 'hint' | 'error' | 'success';
type Context = 'main' | 'projects' | 'skills' | 'experience' | 'dogs';

interface TerminalLine {
  id: number;
  kind: LineKind;
  text: string;
  /** When set, the line text is rendered as a clickable link */
  url?: string;
  /** For resume/download links, adds download attribute */
  download?: string;
}

interface CliProject {
  title: string;
  description: string;
  techStack: string[];
  status?: string;
  featured: boolean;
  githubUrl?: string;
  private?: boolean;
}

interface CliSkillCategory {
  name: string;
  skills: string[];
}

interface CliExperience {
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
}

interface CliDogMetadata {
  name: string;
  breed: string;
  badge?: string;
}

interface DogStats {
  treats: number;
  scritches: number;
}

interface DogData {
  name: string;
  stats: DogStats;
}

interface SelectionOption {
  value: number;
  label: string;
}

type InitialLine = Omit<TerminalLine, 'id'>;

const MAIN_MENU = [
  { number: 1, label: 'About Me', command: 'about' },
  { number: 2, label: 'Projects', command: 'projects' },
  { number: 3, label: 'Skills', command: 'skills' },
  { number: 4, label: 'Experience', command: 'experience' },
  { number: 5, label: 'GitHub Stats', command: 'github' },
  { number: 6, label: 'Contact', command: 'contact' },
  { number: 7, label: 'Pet Dawgs', command: 'dogs' },
  { number: 8, label: 'Resume', command: 'resume' },
  { number: 9, label: 'Help', command: 'help' },
  { number: 0, label: 'Clear', command: 'clear' },
] as const;

const ABOUT_SUMMARY = [
  'The drive to challenge myself and understand how things work led me to code; building my first website sparked a career change.',
  'In 2020, quit my job and joined HRR45 at Hack Reactor for full-stack fundamentals.',
  'Now frontend-focused as a UI Engineer at accesso, with end-to-end delivery experience.',
];

const ABOUT_HIGHLIGHTS = [
  '5+ years of professional software engineering experience',
  '300+ Jira tickets completed',
  '1500+ Diet Dews converted to code',
];

const ABOUT_VALUES = [
  'Quality',
  'Collaboration',
  'Continuous Learning',
  'Documentation',
  'Accessibility',
];

const PROJECTS: CliProject[] = [
  {
    title: 'BitStockerz',
    description:
      'A paper trading platform for cryptocurrency and stocks that lets users practice trading strategies with virtual portfolios. Track real-time prices, execute simulated trades, and learn market dynamics without risking real money.',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
    status: 'In Development',
    featured: true,
    githubUrl: `${env.social.github}/BitStockerz`,
  },
  {
    title: '@jp-design-system',
    description:
      'A reusable UI component library built with Angular, featuring accessible, customizable components with consistent styling and comprehensive documentation. Designed for rapid development and maintainability across projects.',
    techStack: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'Storybook'],
    status: 'Planning',
    featured: true,
    githubUrl: `${env.social.github}/jp-design-system`,
  },
  {
    title: 'Godot Playground',
    description:
      'My sandbox for learning the Godot engine, built around small, isolated mechanics, movement systems, UI components, shaders, physics experiments, and prototype gameplay loops. Each technique is a self-contained scene.',
    techStack: ['Godot', 'GDScript', 'Shaders', 'Physics'],
    status: 'In Development',
    featured: true,
    githubUrl: `${env.social.github}/godot_practice`,
  },
  {
    title: 'SideQuest: Pittsburgh',
    description:
      'A mobile app for discovering hidden gems and offbeat restaurants across Pittsburgh. Built offline-first, it surfaces under-the-radar spots—prioritizing proximity, novelty, and curated tags over star ratings and influencer rankings.',
    techStack: ['React Native', 'TypeScript', 'Express', 'MongoDB', 'Maps API'],
    featured: false,
    private: true,
  },
  {
    title: 'Plex Request App',
    description:
      'A self-hosted media request system for managing a home Plex Server. Users authenticate via passkeys (WebAuthn). Features include real-time service health monitoring, per-user quality profiles, and an activity audit log.',
    techStack: ['React', 'TypeScript', 'Node.js', 'WebAuthn'],
    featured: false,
    private: true,
  },
];

const SKILL_CATEGORIES: CliSkillCategory[] = [
  {
    name: 'Frontend',
    skills: [
      'Angular',
      'React',
      'TypeScript',
      'JavaScript',
      'RxJS',
      'HTML5',
      'CSS3',
      'Playwright',
      'Jest',
      'AngularJS',
    ],
  },
  {
    name: 'Backend',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Java', 'Postman'],
  },
  {
    name: 'Tooling',
    skills: [
      'Git',
      'GitHub',
      'GitLab',
      'Docker',
      'AWS',
      'Vercel',
      'Jenkins',
      'Jira',
      'Confluence',
      'New Relic',
    ],
  },
  {
    name: 'AI',
    skills: ['ChatGPT', 'GitHub Copilot', 'Claude Code', 'Cursor', 'Codex'],
  },
];

const ADDITIONAL_SKILLS = [
  'REST APIs',
  'CI/CD',
  'Micro-frontends',
  'State Management',
  'Design Systems',
  'Agile',
  'Scrum',
  'Code Reviews',
  'Pair Programming',
  'PWA',
  'Service Workers',
  'Debugging',
  'Performance',
  'Accessibility',
];

const EXPERIENCES: CliExperience[] = [
  {
    title: 'UI Engineer',
    organization: 'accesso',
    period: 'May 2021 – Present',
    location: 'Orlando, FL (Remote)',
    summary:
      'Develop and maintain frontend features for accesso Passport, a cloud-hosted SaaS eCommerce ticketing system used by high-volume entertainment venues worldwide.',
    highlights: [
      'Engineer on a large-scale micro-frontend platform with Angular, AngularJS, React, TypeScript, and RxJS.',
      'Contribute to shared UI libraries and design systems, balancing consistency with application needs.',
      'Work in hybrid legacy/modern codebases, incrementally modernizing while maintaining business continuity.',
      'Participate in architectural discussions around state management, performance, and frontend scalability.',
      'Contribute to CI/CD pipelines, build processes, and automated testing workflows.',
    ],
  },
  {
    title: 'Angular Developer',
    organization: '4C Strategies',
    period: 'Aug 2020 – Apr 2021',
    location: 'Orlando, FL',
    summary:
      'Gained early hands-on experience shipping code, reviewing PRs, and working with legacy systems.',
    highlights: [
      'Contributed to Angular UI components and Java backend endpoints as part of a team of 5 engineers.',
      'Used GitLab for version control, participating in code reviews and team-based development workflows.',
    ],
  },
  {
    title: 'Advanced Software Engineering Immersive',
    organization: 'Hack Reactor',
    period: '2020',
    location: '(Remote)',
    summary:
      'Full-time, 12-week intensive focused on full-stack JavaScript engineering and computer science fundamentals.',
    highlights: [
      'Completed ~600+ hours of hands-on programming under production-style deadlines.',
      'Built and shipped multiple full-stack applications.',
      'Applied core CS concepts: data structures, algorithms, async programming, and system design fundamentals.',
      'Collaborated using Git/GitHub, code reviews, pair programming, and Agile workflows.',
    ],
  },
  {
    title: 'Bachelor of Science (B.S.) in Psychology',
    organization: 'University of Central Florida',
    period: '2008-2012',
    location: 'Orlando, FL',
    summary:
      'Coursework emphasized research methods, statistics, cognitive psychology, and behavioral analysis.',
    highlights: [
      'Developed a foundation in analytical thinking, experimental design, and human-centered problem solving.',
    ],
  },
];

const DOGS: CliDogMetadata[] = [
  {
    name: 'Nala',
    breed: 'Australian Cattle Dog / Australian Shepherd / German Shepherd mix',
    badge: 'Foster',
  },
  { name: 'Rosie', breed: 'Bloodhound / Beagle mix' },
  { name: 'Tito', breed: 'Chihuahua / Pomeranian / Dachshund mix' },
];

const INITIAL_DOGS_DATA: DogData[] = DOGS.map((dog) => ({
  name: dog.name,
  stats: { treats: 0, scritches: 0 },
}));

const RESUME_PATH = '/resume/Justin-Paoletta_Software-Engineer.pdf';

const BOOT_MESSAGE = 'JP-CLI Initialized';

const MAIN_MENU_LINES: InitialLine[] = [
  { kind: 'hint', text: 'Use panel options or type a number/command.' },
];

/** Lines shown after boot completes and when user runs clear */
function createMainMenuLines(lineIdStart: number): TerminalLine[] {
  return MAIN_MENU_LINES.map((entry, index) => ({
    ...entry,
    id: lineIdStart + index + 1,
  }));
}

function chunk(items: string[], size: number): string[] {
  const groups: string[] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size).join(', '));
  }
  return groups;
}

function getCliExperienceOptionLabel(item: CliExperience): string {
  if (item.organization === 'Hack Reactor') return 'Hack Reactor';
  if (item.organization === 'University of Central Florida')
    return 'B.S. Psychology';
  return item.title;
}

function CliTerminal(): React.ReactElement {
  const { setTheme } = useTheme();
  const breakpoint = useBreakpoint();
  const [context, setContext] = useState<Context>('main');
  const [inputValue, setInputValue] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [isDetailView, setIsDetailView] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const lineIdRef = useRef(0);
  const historyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [dogStats, updateDogStats] = usePetDogs(INITIAL_DOGS_DATA);
  const {
    user: githubUser,
    repos,
    pinnedRepos,
    contributions,
    loading: githubLoading,
    error: githubError,
  } = useGitHub();

  const dogs = useMemo(
    () =>
      DOGS.map((dog) => ({
        ...dog,
        stats: dogStats.find((entry) => entry.name === dog.name)?.stats ?? {
          treats: 0,
          scritches: 0,
        },
      })),
    [dogStats]
  );

  const topRepos = useMemo(() => {
    if (pinnedRepos.length > 0) {
      return pinnedRepos.slice(0, 4).map((repo) => ({
        name: repo.name,
        stars: repo.stargazerCount,
      }));
    }

    return repos.slice(0, 4).map((repo) => ({
      name: repo.name,
      stars: repo.stargazers_count,
    }));
  }, [pinnedRepos, repos]);

  const selectionOptions = useMemo<SelectionOption[]>(() => {
    if (context === 'projects') {
      return [
        ...PROJECTS.map((project, index) => ({
          value: index + 1,
          label: project.title,
        })),
        { value: 0, label: 'Clear' },
      ];
    }

    if (context === 'skills') {
      return [
        ...SKILL_CATEGORIES.map((category, index) => ({
          value: index + 1,
          label: category.name,
        })),
        { value: 5, label: 'Other' },
        { value: 0, label: 'Clear' },
      ];
    }

    if (context === 'experience') {
      return [
        ...EXPERIENCES.map((item, index) => ({
          value: index + 1,
          label: getCliExperienceOptionLabel(item),
        })),
        { value: 0, label: 'Clear' },
      ];
    }

    if (context === 'dogs') {
      return [
        ...dogs.map((dog, index) => ({
          value: index + 1,
          label: dog.name,
        })),
        { value: 0, label: 'Clear' },
      ];
    }

    return MAIN_MENU.map((item) => ({
      value: item.number,
      label: item.label,
    }));
  }, [context, dogs]);

  const currentSelection = selectionOptions[selectedOptionIndex] ?? null;

  const stampLines = (entries: Omit<TerminalLine, 'id'>[]): TerminalLine[] =>
    entries.map((entry) => ({
      ...entry,
      id: ++lineIdRef.current,
    }));

  const appendLines = (entries: Omit<TerminalLine, 'id'>[]): void => {
    setLines((prev) => [...prev, ...stampLines(entries)]);
  };

  const moveSelection = (direction: -1 | 1): void => {
    setSelectedOptionIndex((previous) => {
      if (selectionOptions.length === 0) {
        return 0;
      }

      return (
        (previous + direction + selectionOptions.length) %
        selectionOptions.length
      );
    });
  };

  const activateSelectedOption = (): void => {
    if (!currentSelection) {
      return;
    }

    executeCommand(String(currentSelection.value));
  };

  const printMainMenu = (): void => {
    setContext('main');
    setIsDetailView(false);
    setSelectedOptionIndex(0);
    appendLines(MAIN_MENU_LINES);
  };

  const resetTerminal = (): void => {
    setContext('main');
    setIsDetailView(false);
    setSelectedOptionIndex(0);
    setLines([]);
  };

  const showAbout = (): void => {
    appendLines([
      { kind: 'output', text: '[ABOUT]' },
      ...ABOUT_SUMMARY.map((item) => ({
        kind: 'output' as const,
        text: `- ${item}`,
      })),
      { kind: 'output', text: `Highlights: ${ABOUT_HIGHLIGHTS.join(' | ')}` },
      { kind: 'output', text: `Core principles: ${ABOUT_VALUES.join(', ')}` },
      {
        kind: 'output',
        text: 'AI approach: use tools aggressively, validate outputs, treat as tool not oracle, code responsibly.',
      },
    ]);
  };

  const showProjectsMenu = (): void => {
    setContext('projects');
    setIsDetailView(false);
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[PROJECTS]' },
      ...PROJECTS.map((project, index) => {
        const statusPart = project.status ? ` (${project.status})` : '';
        const privatePart = project.private ? ' (Private)' : '';
        const text = `${index + 1}. ${project.title}${statusPart}${privatePart}`;
        return project.githubUrl
          ? { kind: 'output' as const, text, url: project.githubUrl }
          : { kind: 'output' as const, text };
      }),
      {
        kind: 'hint',
        text: 'Choose a project number or type "project <number>" for details.',
      },
    ]);
  };

  const showProjectDetail = (selection: number): void => {
    const project = PROJECTS[selection - 1];
    if (!project) {
      appendLines([
        { kind: 'error', text: `Project ${selection} not found.` },
        { kind: 'hint', text: 'Use a number from the current project list.' },
      ]);
      return;
    }

    setContext('projects');
    setIsDetailView(true);
    setSelectedOptionIndex(selection - 1);
    const repoLine = project.private
      ? { kind: 'output' as const, text: 'Repository: Private' }
      : project.githubUrl
        ? {
            kind: 'output' as const,
            text: `GitHub: ${project.githubUrl}`,
            url: project.githubUrl,
          }
        : null;

    appendLines([
      { kind: 'output', text: `[PROJECT ${selection}] ${project.title}` },
      {
        kind: 'output',
        text: `Type: ${project.featured ? 'Featured' : 'Other'}${project.status ? ` | Status: ${project.status}` : ''}`,
      },
      ...(repoLine ? [repoLine] : []),
      { kind: 'output', text: project.description },
      { kind: 'output', text: `Stack: ${project.techStack.join(', ')}` },
      { kind: 'hint', text: 'Try another project number, or type menu.' },
    ]);
  };

  const showSkillsMenu = (): void => {
    setContext('skills');
    setIsDetailView(false);
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[SKILLS]' },
      ...SKILL_CATEGORIES.map((category, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${category.name} (${category.skills.length})`,
      })),
      {
        kind: 'output',
        text: `5. Other (${ADDITIONAL_SKILLS.length})`,
      },
      {
        kind: 'hint',
        text: 'Choose a category number or type "skill <number>".',
      },
    ]);
  };

  const showSkillDetail = (selection: number): void => {
    if (selection === 5) {
      setContext('skills');
      setIsDetailView(true);
      setSelectedOptionIndex(4);
      appendLines([
        {
          kind: 'output',
          text: '[SKILL CATEGORY 5] Other',
        },
        ...chunk(ADDITIONAL_SKILLS, 5).map((group) => ({
          kind: 'output' as const,
          text: group,
        })),
        { kind: 'hint', text: 'Choose another category or type menu.' },
      ]);
      return;
    }

    const category = SKILL_CATEGORIES[selection - 1];
    if (!category) {
      appendLines([
        { kind: 'error', text: `Skill category ${selection} not found.` },
        { kind: 'hint', text: 'Use a number from the category list.' },
      ]);
      return;
    }

    setContext('skills');
    setIsDetailView(true);
    setSelectedOptionIndex(selection - 1);
    appendLines([
      {
        kind: 'output',
        text: `[SKILL CATEGORY ${selection}] ${category.name}`,
      },
      ...chunk(category.skills, 5).map((group) => ({
        kind: 'output' as const,
        text: group,
      })),
      { kind: 'hint', text: 'Choose another category or type menu.' },
    ]);
  };

  const showExperienceMenu = (): void => {
    setContext('experience');
    setIsDetailView(false);
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[EXPERIENCE & EDUCATION]' },
      ...EXPERIENCES.map((item, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${getCliExperienceOptionLabel(item)} @ ${item.organization} (${item.period})`,
      })),
      {
        kind: 'hint',
        text: 'Choose a timeline number or type "exp <number>".',
      },
    ]);
  };

  const showExperienceDetail = (selection: number): void => {
    const item = EXPERIENCES[selection - 1];
    if (!item) {
      appendLines([
        { kind: 'error', text: `Experience entry ${selection} not found.` },
        { kind: 'hint', text: 'Use a number from the timeline list.' },
      ]);
      return;
    }

    setContext('experience');
    setIsDetailView(true);
    setSelectedOptionIndex(selection - 1);
    appendLines([
      { kind: 'output', text: `[TIMELINE ${selection}] ${item.title}` },
      { kind: 'output', text: `${item.organization} | ${item.location}` },
      { kind: 'output', text: item.period },
      { kind: 'output', text: item.summary },
      ...item.highlights.map((highlight) => ({
        kind: 'output' as const,
        text: `- ${highlight}`,
      })),
      { kind: 'hint', text: 'Choose another timeline entry or type menu.' },
    ]);
  };

  const showGitHub = (): void => {
    if (githubError) {
      appendLines([
        { kind: 'output', text: '[GITHUB]' },
        { kind: 'error', text: 'Unable to load live GitHub data right now.' },
        {
          kind: 'hint',
          text: `You can still visit: ${env.social.github}`,
          url: env.social.github,
        },
      ]);
      return;
    }

    if (githubLoading && !githubUser) {
      appendLines([
        { kind: 'output', text: '[GITHUB]' },
        { kind: 'system', text: 'Fetching live GitHub stats...' },
        { kind: 'hint', text: 'Run command 5 again in a few seconds.' },
      ]);
      return;
    }

    if (!githubUser) {
      appendLines([
        { kind: 'output', text: '[GITHUB]' },
        {
          kind: 'error',
          text: 'GitHub profile data is currently unavailable.',
        },
      ]);
      return;
    }

    appendLines([
      { kind: 'output', text: '[GITHUB]' },
      {
        kind: 'output',
        text: `${githubUser.name || githubUser.login} (@${githubUser.login})`,
      },
      {
        kind: 'output',
        text: `Repos: ${githubUser.public_repos} | Followers: ${githubUser.followers} | Following: ${githubUser.following}`,
      },
      ...(contributions
        ? [
            {
              kind: 'output' as const,
              text: `Contributions (last year): ${contributions.totalContributions}`,
            },
          ]
        : []),
      ...(topRepos.length > 0
        ? [
            { kind: 'output' as const, text: 'Top repositories:' },
            ...topRepos.map((repo) => ({
              kind: 'output' as const,
              text: `- ${repo.name} (${repo.stars} stars)`,
            })),
          ]
        : []),
      {
        kind: 'hint',
        text: `Profile: ${env.social.github}`,
        url: env.social.github,
      },
    ]);
  };

  const showContact = (): void => {
    appendLines([
      { kind: 'output', text: '[CONTACT]' },
      {
        kind: 'output',
        text: 'Currently entertaining freelance & full-time opportunities.',
      },
      {
        kind: 'output',
        text: `Email: ${env.social.email}`,
        url: `mailto:${env.social.email}`,
      },
      {
        kind: 'output',
        text: `LinkedIn: ${env.social.linkedin}`,
        url: env.social.linkedin,
      },
      {
        kind: 'output',
        text: `GitHub: ${env.social.github}`,
        url: env.social.github,
      },
      {
        kind: 'hint',
        text: 'Switch to a non-CLI theme if you want to use the web contact form.',
      },
    ]);
  };

  const showDogsMenu = (): void => {
    setContext('dogs');
    setIsDetailView(false);
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[PET DOGS]' },
      ...dogs.map((dog, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${dog.name}${dog.badge ? ` (${dog.badge})` : ''} | Treats: ${dog.stats.treats} | Scritches: ${dog.stats.scritches}`,
      })),
      {
        kind: 'hint',
        text: 'Choose a dog number, or run "dog <number> treat|scritch".',
      },
    ]);
  };

  const showDogDetail = (selection: number): void => {
    const dog = dogs[selection - 1];
    if (!dog) {
      appendLines([
        { kind: 'error', text: `Dog ${selection} not found.` },
        { kind: 'hint', text: 'Use a number from the dogs list.' },
      ]);
      return;
    }

    setContext('dogs');
    setIsDetailView(true);
    setSelectedOptionIndex(selection - 1);
    appendLines([
      {
        kind: 'output',
        text: `[DOG ${selection}] ${dog.name}${dog.badge ? ` (${dog.badge})` : ''}`,
      },
      { kind: 'output', text: dog.breed },
      {
        kind: 'output',
        text: `Treats: ${dog.stats.treats} | Scritches: ${dog.stats.scritches}`,
      },
      {
        kind: 'hint',
        text: `Try: dog ${selection} treat  or  dog ${selection} scritch`,
      },
    ]);
  };

  const handleDogAction = (selection: number, action: string): void => {
    const dog = dogs[selection - 1];
    if (!dog) {
      appendLines([{ kind: 'error', text: `Dog ${selection} not found.` }]);
      return;
    }

    setIsDetailView(true);

    if (action === 'treat' || action === 'treats') {
      updateDogStats(dog.name, 'treats');
      appendLines([
        {
          kind: 'success',
          text: `${dog.name} got a treat. New treats count: ${dog.stats.treats + 1}`,
        },
      ]);
      return;
    }

    if (action === 'scritch' || action === 'scritches') {
      updateDogStats(dog.name, 'scritches');
      appendLines([
        {
          kind: 'success',
          text: `${dog.name} got scritches. New scritches count: ${dog.stats.scritches + 1}`,
        },
      ]);
      return;
    }

    appendLines([
      {
        kind: 'error',
        text: 'Unknown dog action. Use "treat" or "scritch".',
      },
    ]);
  };

  const showResume = (): void => {
    appendLines([
      { kind: 'output', text: '[RESUME]' },
      {
        kind: 'output',
        text: `Download: ${RESUME_PATH}`,
        url: RESUME_PATH,
        download: 'Justin_Paoletta_Resume.pdf',
      },
      {
        kind: 'hint',
        text: 'In the standard web sections, this is available in Experience.',
      },
    ]);
  };

  const showHelp = (): void => {
    appendLines([
      { kind: 'output', text: '[HELP]' },
      { kind: 'output', text: 'Main: 1-8, 9 (help), 0 (clear)' },
      {
        kind: 'output',
        text: 'Aliases: about, projects, skills, experience, github, contact, dogs, resume, menu, clear, exit',
      },
      {
        kind: 'output',
        text: 'Drill-in commands: project <n>, skill <n>, exp <n>',
      },
      { kind: 'output', text: 'Dog commands: dog <n> treat | dog <n> scritch' },
      {
        kind: 'output',
        text: `Terminal commands: exit (switches to ${defaultTheme} theme)`,
      },
      { kind: 'hint', text: 'Example: project 1' },
    ]);
  };

  const handleNumericInput = (selection: number): void => {
    if (selection === 0) {
      resetTerminal();
      return;
    }

    if (selection === 9) {
      showHelp();
      return;
    }

    if (context === 'projects') {
      showProjectDetail(selection);
      return;
    }
    if (context === 'skills') {
      showSkillDetail(selection);
      return;
    }
    if (context === 'experience') {
      showExperienceDetail(selection);
      return;
    }
    if (context === 'dogs') {
      showDogDetail(selection);
      return;
    }

    switch (selection) {
      case 1:
        showAbout();
        break;
      case 2:
        showProjectsMenu();
        break;
      case 3:
        showSkillsMenu();
        break;
      case 4:
        showExperienceMenu();
        break;
      case 5:
        showGitHub();
        break;
      case 6:
        showContact();
        break;
      case 7:
        showDogsMenu();
        break;
      case 8:
        showResume();
        break;
      default:
        appendLines([
          { kind: 'error', text: `Unknown menu selection: ${selection}` },
          { kind: 'hint', text: 'Use a menu number from 0 to 9.' },
        ]);
    }
  };

  const executeCommand = (rawInput: string): void => {
    const raw = rawInput.trim();
    if (!raw) {
      return;
    }

    const normalized = raw.toLowerCase();
    const tokens = normalized.split(/\s+/);
    const [command, arg1, arg2] = tokens;
    const numericMatch = normalized.match(/^\d+$/);

    if (command === 'clear' || command === 'cls') {
      resetTerminal();
      return;
    }

    if (command === 'exit' || command === 'quit') {
      setTheme(defaultTheme);
      return;
    }

    appendLines([{ kind: 'input', text: raw }]);

    if (numericMatch) {
      handleNumericInput(Number.parseInt(command, 10));
      return;
    }

    if (command === 'menu') {
      printMainMenu();
      return;
    }

    if (command === 'help' || command === 'h') {
      showHelp();
      return;
    }

    if (command === 'about') {
      showAbout();
      return;
    }

    if (command === 'projects') {
      showProjectsMenu();
      return;
    }

    if (command === 'project') {
      if (!arg1) {
        showProjectsMenu();
        return;
      }
      const selection = Number.parseInt(arg1, 10);
      if (Number.isNaN(selection)) {
        appendLines([{ kind: 'error', text: 'Usage: project <number>' }]);
        return;
      }
      showProjectDetail(selection);
      return;
    }

    if (command === 'skills') {
      showSkillsMenu();
      return;
    }

    if (command === 'skill') {
      if (!arg1) {
        showSkillsMenu();
        return;
      }
      const selection = Number.parseInt(arg1, 10);
      if (Number.isNaN(selection)) {
        appendLines([{ kind: 'error', text: 'Usage: skill <number>' }]);
        return;
      }
      showSkillDetail(selection);
      return;
    }

    if (command === 'experience' || command === 'education') {
      showExperienceMenu();
      return;
    }

    if (command === 'exp') {
      if (!arg1) {
        showExperienceMenu();
        return;
      }
      const selection = Number.parseInt(arg1, 10);
      if (Number.isNaN(selection)) {
        appendLines([{ kind: 'error', text: 'Usage: exp <number>' }]);
        return;
      }
      showExperienceDetail(selection);
      return;
    }

    if (command === 'github' || command === 'gh') {
      showGitHub();
      return;
    }

    if (command === 'contact') {
      showContact();
      return;
    }

    if (command === 'dogs' || command === 'doggos' || command === 'pets') {
      showDogsMenu();
      return;
    }

    if (command === 'dog') {
      if (!arg1) {
        showDogsMenu();
        return;
      }
      const selection = Number.parseInt(arg1, 10);
      if (Number.isNaN(selection)) {
        appendLines([
          { kind: 'error', text: 'Usage: dog <number> [treat|scritch]' },
        ]);
        return;
      }

      if (!arg2) {
        showDogDetail(selection);
        return;
      }

      handleDogAction(selection, arg2);
      return;
    }

    if (command === 'resume' || command === 'cv') {
      showResume();
      return;
    }

    appendLines([
      { kind: 'error', text: `Unknown command: ${raw}` },
      { kind: 'hint', text: 'Type 9 for help.' },
    ]);
  };

  const submitPrompt = (): void => {
    if (inputValue.trim().length > 0) {
      executeCommand(inputValue);
    } else {
      activateSelectedOption();
    }
    setInputValue('');
  };

  const goToPreviousList = (): void => {
    setInputValue('');

    if (context === 'main') {
      return;
    }

    if (isDetailView) {
      if (context === 'projects') {
        showProjectsMenu();
        return;
      }
      if (context === 'skills') {
        showSkillsMenu();
        return;
      }
      if (context === 'experience') {
        showExperienceMenu();
        return;
      }
      showDogsMenu();
      return;
    }

    printMainMenu();
  };

  const isCompactLayout = breakpoint === 'xs' || breakpoint === 'sm';
  const shouldAutoFocusPrompt = !isCompactLayout;
  /** Height for options panel sized to fit all 10 main-menu options (5 rows × 2 cols) */
  const compactOptionsPanelHeight = '16rem';

  const focusPromptInput = (): void => {
    inputRef.current?.focus();
  };

  const macDotBaseStyle = {
    width: '0.76rem',
    height: '0.76rem',
    padding: 0,
    border: '1px solid rgba(0, 0, 0, 0.22)',
    borderRadius: '50%',
    boxShadow: 'inset 0 0.045rem 0.075rem rgba(255, 255, 255, 0.22)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  } as const;

  const macCloseDotStyle = {
    ...macDotBaseStyle,
    background: '#ff5f57',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    appearance: 'none',
    touchAction: 'manipulation',
  } as const;

  const macYellowDotStyle = {
    ...macDotBaseStyle,
    background: '#febc2e',
  } as const;

  const macGreenDotStyle = {
    ...macDotBaseStyle,
    background: '#28c840',
  } as const;

  const macCloseGlyphStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.56rem',
    fontWeight: 700,
    lineHeight: 1,
    color: 'rgba(68, 20, 15, 0.8)',
    transform: 'translateY(-0.01rem)',
  } as const;

  /* Boot sequence: typewriter "JP-CLI Initialized", then clear and show main menu */
  useEffect(() => {
    const charDelayMs = 50;
    const pauseAfterBootMs = 500;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(setTimeout(fn, ms));
    };

    let charIndex = 0;
    const bootLineId = 1;
    lineIdRef.current = 1;

    const typeNextChar = (): void => {
      charIndex += 1;
      const partial = BOOT_MESSAGE.slice(0, charIndex);
      setLines([{ id: bootLineId, kind: 'system', text: partial }]);

      if (charIndex < BOOT_MESSAGE.length) {
        schedule(typeNextChar, charDelayMs);
      } else {
        schedule(() => {
          const menuLines = createMainMenuLines(lineIdRef.current);
          lineIdRef.current += menuLines.length;
          setLines(menuLines);
        }, pauseAfterBootMs);
      }
    };

    schedule(typeNextChar, charDelayMs);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const history = historyRef.current;
    if (!history) {
      return;
    }
    history.scrollTop = history.scrollHeight;
    if (shouldAutoFocusPrompt) {
      inputRef.current?.focus();
    }
  }, [lines, shouldAutoFocusPrompt]);

  return (
    <div className="cli-terminal-shell">
      <h1 id="hero-heading" className="visually-hidden">
        Hello, I&apos;m Justin Paoletta
      </h1>

      <section
        className="cli-terminal-window"
        aria-label="Interactive portfolio terminal"
      >
        <header className="cli-terminal-toolbar">
          <div className="cli-terminal-dots">
            <button
              type="button"
              className="cli-terminal-dot cli-terminal-dot--red cli-terminal-dot--close"
              onClick={() => setTheme(defaultTheme)}
              aria-label={`Exit CLI and switch to ${defaultTheme} theme`}
              title="Exit CLI theme"
              style={macCloseDotStyle}
            >
              <span aria-hidden="true" style={macCloseGlyphStyle}>
                ×
              </span>
            </button>
            <span
              className="cli-terminal-dot cli-terminal-dot--yellow"
              aria-hidden="true"
              style={macYellowDotStyle}
            />
            <span
              className="cli-terminal-dot cli-terminal-dot--green"
              aria-hidden="true"
              style={macGreenDotStyle}
            />
          </div>
          <span className="cli-terminal-title">jp-cli v1.0.1</span>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompactLayout
              ? '1fr'
              : 'minmax(210px, 260px) minmax(0, 1fr)',
            gridTemplateRows: isCompactLayout
              ? `1fr ${compactOptionsPanelHeight}`
              : undefined,
            flex: 1,
            minHeight: 0,
          }}
        >
          <aside
            className="cli-options-panel"
            aria-label="Selection menu"
            style={{
              order: isCompactLayout ? 2 : 1,
              borderRight: isCompactLayout
                ? 'none'
                : '1px solid var(--border-subtle)',
              borderTop: isCompactLayout
                ? '1px solid var(--border-subtle)'
                : 'none',
              background: 'var(--bg-card)',
              padding: '0.7rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              minHeight: isCompactLayout ? compactOptionsPanelHeight : 0,
              maxHeight: isCompactLayout ? compactOptionsPanelHeight : 'none',
              flexShrink: isCompactLayout ? 0 : undefined,
              overflow: isCompactLayout ? 'hidden' : 'visible',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <p className="cli-line cli-line--system" style={{ margin: 0 }}>
                Options
              </p>
              {isCompactLayout ? (
                <div
                  style={{
                    alignItems: 'center',
                    display: 'inline-flex',
                    gap: '0.35rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      goToPreviousList();
                      requestAnimationFrame(focusPromptInput);
                    }}
                    aria-label="Previous list"
                    title="Previous list"
                    style={{
                      width: '3.1rem',
                      height: '2rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      background: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      touchAction: 'manipulation',
                    }}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      submitPrompt();
                      requestAnimationFrame(focusPromptInput);
                    }}
                    aria-label="Run selected option"
                    title="Run selected option"
                    style={{
                      width: '4.5rem',
                      height: '2rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      background: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      padding: 0,
                      touchAction: 'manipulation',
                    }}
                  >
                    Enter <span aria-hidden="true">↵</span>
                  </button>
                </div>
              ) : null}
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: isCompactLayout ? 'row' : 'column',
                flexWrap: isCompactLayout ? 'wrap' : 'nowrap',
                flex: 1,
                gap: '0.35rem',
                overflowY: 'auto',
                alignContent: isCompactLayout ? 'flex-start' : undefined,
                minHeight: 0,
              }}
            >
              {selectionOptions.map((option, index) => {
                const isSelected = index === selectedOptionIndex;
                return (
                  <li
                    key={`${context}-${option.value}-${option.label}`}
                    style={{
                      minWidth: isCompactLayout ? 'calc(50% - 0.35rem)' : 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOptionIndex(index);
                        setInputValue(String(option.value));
                        requestAnimationFrame(focusPromptInput);
                      }}
                      aria-current={isSelected ? 'true' : undefined}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: '8px',
                        border: isSelected
                          ? '1px solid var(--border-hover)'
                          : '1px solid var(--border-subtle)',
                        background: isSelected
                          ? 'var(--bg-card-hover)'
                          : 'var(--bg-main)',
                        color: 'var(--text-primary)',
                        padding: '0.42rem 0.46rem',
                        display: 'flex',
                        gap: '0.4rem',
                        alignItems: 'center',
                        fontSize: '0.72rem',
                        fontFamily: 'inherit',
                        lineHeight: 1.25,
                      }}
                    >
                      <span style={{ opacity: 0.75, minWidth: '2ch' }}>
                        {option.value}.
                      </span>
                      <span>{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div
            style={{
              order: isCompactLayout ? 1 : 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div className="cli-terminal-banner" aria-hidden="true">
              <div className="cli-banner-left">
                <div className="cli-banner-prompt">
                  <span>&gt;&gt; HELLO, I&apos;M</span>
                </div>
                <div className="cli-banner-name">JUSTIN PAOLETTA</div>
              </div>
              <div className="cli-banner-right">
                Software Engineer • Problem Solver • Fixer of Things
              </div>
            </div>

            <p
              className="cli-line cli-line--hint"
              style={{
                padding: '0.42rem 1rem',
                margin: 0,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {isCompactLayout
                ? 'Options below | Type 9 for help'
                : 'Options left | Keys: ↑ ↓ ← → move | Space/0-9 stage input | Enter run'}
            </p>

            <div
              className="cli-session"
              ref={historyRef}
              role="button"
              tabIndex={0}
              aria-label="Focus command input"
              onClick={focusPromptInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  focusPromptInput();
                }
              }}
            >
              <div className="cli-history" role="log" aria-live="polite">
                {lines.map((line) => (
                  <p
                    key={line.id}
                    className={`cli-line cli-line--${line.kind}`}
                  >
                    {line.kind === 'input' ? (
                      <>
                        <span className="cli-line-prefix">user@jp-cli: ~%</span>
                        <span>{line.text}</span>
                      </>
                    ) : line.url ? (
                      <a
                        href={line.url}
                        className="cli-line-link"
                        target={
                          line.url.startsWith('mailto:') ||
                          line.url.startsWith('/')
                            ? undefined
                            : '_blank'
                        }
                        rel={
                          line.url.startsWith('mailto:') ||
                          line.url.startsWith('/')
                            ? undefined
                            : 'noopener noreferrer'
                        }
                        download={line.download}
                        {...(line.download && {
                          'aria-label': 'Download resume as PDF',
                        })}
                      >
                        {line.text}
                      </a>
                    ) : (
                      <span>{line.text}</span>
                    )}
                  </p>
                ))}
              </div>

              <form
                className="cli-prompt cli-prompt--inline"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitPrompt();
                }}
              >
                <label htmlFor="cli-command-input" className="visually-hidden">
                  Enter a command
                </label>
                <span className="cli-prompt-prefix">user@jp-cli: ~%</span>
                <input
                  ref={inputRef}
                  id="cli-command-input"
                  type="text"
                  className="cli-prompt-input"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Terminal command input"
                  onKeyDown={(event) => {
                    const trimmedInput = inputValue.trim();
                    const isNavigationMode =
                      trimmedInput.length === 0 || /^\d+$/.test(trimmedInput);

                    if (!isNavigationMode) {
                      return;
                    }

                    if (
                      event.key === 'ArrowDown' ||
                      event.key === 'ArrowRight' ||
                      event.key === 'ArrowUp' ||
                      event.key === 'ArrowLeft'
                    ) {
                      event.preventDefault();
                      moveSelection(
                        event.key === 'ArrowDown' || event.key === 'ArrowRight'
                          ? 1
                          : -1
                      );
                      return;
                    }

                    if (event.key === ' ') {
                      event.preventDefault();
                      if (currentSelection) {
                        setInputValue(String(currentSelection.value));
                      }
                      return;
                    }

                    const isDigitKey = /^[0-9]$/.test(event.key);
                    const isNumpadDigit = /^Numpad[0-9]$/.test(event.code);

                    if (isDigitKey || isNumpadDigit) {
                      event.preventDefault();
                      const value = isDigitKey
                        ? event.key
                        : event.code.replace('Numpad', '');
                      setInputValue(value);
                      return;
                    }
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CliTerminal;

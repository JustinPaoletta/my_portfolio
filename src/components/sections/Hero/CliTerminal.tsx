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
}

interface CliProject {
  title: string;
  description: string;
  techStack: string[];
  status?: string;
  featured: boolean;
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
  { number: 4, label: 'Experience & Education', command: 'experience' },
  { number: 5, label: 'GitHub Activity', command: 'github' },
  { number: 6, label: 'Contact', command: 'contact' },
  { number: 7, label: 'Pet Dogs', command: 'dogs' },
  { number: 8, label: 'Resume', command: 'resume' },
  { number: 9, label: 'Help', command: 'help' },
  { number: 0, label: 'Clear Terminal', command: 'clear' },
] as const;

const ABOUT_SUMMARY = [
  'Started in AppleCare, then pivoted to software to solve root causes directly.',
  'Switched careers in 2020 through Hack Reactor and moved into full-stack development.',
  'Now frontend-focused as a UI Engineer, with end-to-end delivery experience.',
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
  'Accessibility',
  'Documentation',
];

const PROJECTS: CliProject[] = [
  {
    title: 'BitStockerz',
    description:
      'Paper trading platform for crypto and stocks with simulated orders and real-time prices.',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
    status: 'In Development',
    featured: true,
  },
  {
    title: '@jp-angular-ui',
    description:
      'Reusable Angular component library focused on accessibility, consistency, and velocity.',
    techStack: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'Storybook'],
    status: 'Planning',
    featured: true,
  },
  {
    title: 'StarForge',
    description:
      'Cosmic strategy game in Godot where players forge life and weapons from stellar matter.',
    techStack: ['Godot', 'GDScript', 'Game Design', 'Procedural Generation'],
    status: 'Planning',
    featured: true,
  },
  {
    title: 'SideQuest: Pittsburgh',
    description:
      'Discovery app for weird and off-the-beaten-path local activities with offline-first behavior.',
    techStack: ['React Native', 'TypeScript', 'Express', 'MongoDB', 'Maps API'],
    featured: false,
  },
  {
    title: 'Easy Eats',
    description:
      'Personal nutrition tracker built around reusable recipes and repeatable portions.',
    techStack: [
      'React',
      'TypeScript',
      'SQLite',
      'Nutrition API',
      'Mobile-First',
    ],
    featured: false,
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
    name: 'DevOps & Tools',
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
    period: 'May 2021 - Present',
    location: 'Orlando, FL (Remote)',
    summary:
      'Builds frontend features for accesso Passport, a cloud SaaS ticketing platform used by high-volume venues.',
    highlights: [
      'Works across Angular, AngularJS, React, TypeScript, and RxJS in a production micro-frontend ecosystem.',
      'Contributes to shared design systems, CI/CD workflows, and long-term modernization of legacy code.',
    ],
  },
  {
    title: 'Software Engineer',
    organization: '4C Strategies',
    period: 'Aug 2020 - Apr 2021',
    location: 'Orlando, FL',
    summary:
      'Early professional role shipping Angular UI and Java backend functionality.',
    highlights: [
      'Worked on a five-engineer team and participated in daily code review workflows in GitLab.',
      'Built strong fundamentals in collaborative delivery and maintaining legacy systems.',
    ],
  },
  {
    title: 'Advanced Software Engineering Immersive',
    organization: 'Hack Reactor',
    period: '2020',
    location: 'Remote',
    summary:
      'Full-time 12-week intensive focused on full-stack JavaScript and core CS fundamentals.',
    highlights: [
      'Completed 600+ hours of programming and shipped multiple full-stack applications.',
      'Practiced pair programming, algorithms, and production-style team workflows.',
    ],
  },
  {
    title: 'B.S. in Psychology',
    organization: 'University of Central Florida',
    period: '2008 - 2012',
    location: 'Orlando, FL',
    summary:
      'Academic background in research methods, statistics, cognitive psychology, and behavioral analysis.',
    highlights: [
      'Built analytical and systems-thinking foundations that inform engineering decisions today.',
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

const BOOT_LINES: InitialLine[] = [
  { kind: 'system', text: 'JP CLI Initialized. Type 9 for help.' },
];

const MAIN_MENU_LINES: InitialLine[] = [
  { kind: 'hint', text: 'Use left-panel options or type a number/command.' },
];

function createInitialLines(): TerminalLine[] {
  return [...BOOT_LINES].map((entry, index) => ({
    ...entry,
    id: index + 1,
  }));
}

function chunk(items: string[], size: number): string[] {
  const groups: string[] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size).join(', '));
  }
  return groups;
}

function CliTerminal(): React.ReactElement {
  const { setTheme } = useTheme();
  const breakpoint = useBreakpoint();
  const [context, setContext] = useState<Context>('main');
  const [inputValue, setInputValue] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [lines, setLines] = useState<TerminalLine[]>(createInitialLines);
  const lineIdRef = useRef(lines.length);
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
      return PROJECTS.map((project, index) => ({
        value: index + 1,
        label: project.title,
      }));
    }

    if (context === 'skills') {
      return SKILL_CATEGORIES.map((category, index) => ({
        value: index + 1,
        label: category.name,
      }));
    }

    if (context === 'experience') {
      return EXPERIENCES.map((item, index) => ({
        value: index + 1,
        label: item.title,
      }));
    }

    if (context === 'dogs') {
      return dogs.map((dog, index) => ({
        value: index + 1,
        label: dog.name,
      }));
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
    setSelectedOptionIndex(0);
    appendLines(MAIN_MENU_LINES);
  };

  const resetTerminal = (): void => {
    const initialLines = createInitialLines();
    lineIdRef.current = initialLines.length;
    setContext('main');
    setSelectedOptionIndex(0);
    setLines(initialLines);
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
        text: 'AI approach: use tools aggressively, validate outputs, and code responsibly.',
      },
      {
        kind: 'hint',
        text: 'Next: type 2 for projects, 4 for experience, or menu.',
      },
    ]);
  };

  const showProjectsMenu = (): void => {
    setContext('projects');
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[PROJECTS]' },
      ...PROJECTS.map((project, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${project.title}${project.status ? ` (${project.status})` : ''}`,
      })),
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
    setSelectedOptionIndex(selection - 1);
    appendLines([
      { kind: 'output', text: `[PROJECT ${selection}] ${project.title}` },
      {
        kind: 'output',
        text: `Type: ${project.featured ? 'Featured' : 'Other'}${project.status ? ` | Status: ${project.status}` : ''}`,
      },
      { kind: 'output', text: project.description },
      { kind: 'output', text: `Stack: ${project.techStack.join(', ')}` },
      { kind: 'hint', text: 'Try another project number, or type menu.' },
    ]);
  };

  const showSkillsMenu = (): void => {
    setContext('skills');
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[SKILLS]' },
      ...SKILL_CATEGORIES.map((category, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${category.name} (${category.skills.length})`,
      })),
      {
        kind: 'hint',
        text: 'Choose a category number or type "skill <number>".',
      },
    ]);
  };

  const showSkillDetail = (selection: number): void => {
    const category = SKILL_CATEGORIES[selection - 1];
    if (!category) {
      appendLines([
        { kind: 'error', text: `Skill category ${selection} not found.` },
        { kind: 'hint', text: 'Use a number from the category list.' },
      ]);
      return;
    }

    setContext('skills');
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
      {
        kind: 'output',
        text: `Also experienced with: ${ADDITIONAL_SKILLS.join(', ')}`,
      },
      { kind: 'hint', text: 'Choose another category or type menu.' },
    ]);
  };

  const showExperienceMenu = (): void => {
    setContext('experience');
    setSelectedOptionIndex(0);
    appendLines([
      { kind: 'output', text: '[EXPERIENCE & EDUCATION]' },
      ...EXPERIENCES.map((item, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${item.title} @ ${item.organization} (${item.period})`,
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
      { kind: 'hint', text: `Profile: ${env.social.github}` },
    ]);
  };

  const showContact = (): void => {
    appendLines([
      { kind: 'output', text: '[CONTACT]' },
      {
        kind: 'output',
        text: "Open to freelance and full-time opportunities. Let's connect.",
      },
      { kind: 'output', text: `Email: ${env.social.email}` },
      { kind: 'output', text: `LinkedIn: ${env.social.linkedin}` },
      { kind: 'output', text: `GitHub: ${env.social.github}` },
      {
        kind: 'hint',
        text: 'Switch to a non-CLI theme if you want to use the web contact form.',
      },
    ]);
  };

  const showDogsMenu = (): void => {
    setContext('dogs');
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
        text: 'Download: /Justin Paoletta_Software Engineer.pdf',
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

  const isCompactLayout = breakpoint === 'xs' || breakpoint === 'sm';

  useEffect(() => {
    const history = historyRef.current;
    if (!history) {
      return;
    }
    history.scrollTop = history.scrollHeight;
    if (!isCompactLayout) {
      inputRef.current?.focus();
    }
  }, [isCompactLayout, lines]);

  const promptPlaceholder =
    context === 'projects'
      ? 'Project number or "project <n>"'
      : context === 'skills'
        ? 'Skill category number or "skill <n>"'
        : context === 'experience'
          ? 'Experience number or "exp <n>"'
          : context === 'dogs'
            ? 'Dog number or "dog <n> treat"'
            : 'Enter a number or command (9 for help)';

  const touchControlsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.4rem',
    marginBottom: '0.75rem',
  } as const;

  const touchButtonStyle = {
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    fontWeight: 600,
    lineHeight: 1.2,
    padding: '0.52rem 0.58rem',
    minHeight: '2.2rem',
    touchAction: 'manipulation',
  } as const;

  const runTouchButtonStyle = {
    ...touchButtonStyle,
    borderColor: 'var(--border-hover)',
    background: 'var(--bg-card-hover)',
  } as const;

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
          <div className="cli-terminal-dots" aria-hidden="true">
            <span className="cli-terminal-dot cli-terminal-dot--red" />
            <span className="cli-terminal-dot cli-terminal-dot--yellow" />
            <span className="cli-terminal-dot cli-terminal-dot--green" />
          </div>
          <span className="cli-terminal-title">jp-cli</span>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompactLayout
              ? '1fr'
              : 'minmax(210px, 260px) minmax(0, 1fr)',
            flex: 1,
            minHeight: 0,
          }}
        >
          <aside
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
              minHeight: isCompactLayout ? 'auto' : 0,
            }}
          >
            <p className="cli-line cli-line--system" style={{ margin: 0 }}>
              Navigate
            </p>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: isCompactLayout ? 'row' : 'column',
                flexWrap: isCompactLayout ? 'wrap' : 'nowrap',
                gap: '0.35rem',
                overflowY: isCompactLayout ? 'visible' : 'auto',
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
                        if (!isCompactLayout) {
                          inputRef.current?.focus();
                        }
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
                        fontFamily: 'var(--font-mono)',
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
            <p className="cli-line cli-line--system" style={{ margin: 0 }}>
              Context: {context}
            </p>
          </aside>

          <div
            style={{
              order: isCompactLayout ? 1 : 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <img
              className="cli-terminal-banner"
              src="/terminal-header.png"
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
            />

            <p
              className="cli-line cli-line--hint"
              style={{
                padding: '0.42rem 1rem',
                margin: 0,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {isCompactLayout ? (
                <>
                  Menu: panel below | Tap menu items or controls | Current:{' '}
                  {currentSelection
                    ? `${currentSelection.value}. ${currentSelection.label}`
                    : 'None'}
                </>
              ) : (
                <>
                  Menu: left panel | Keys: ↑ ↓ ← → move | Space/0-9 stage input
                  | Enter run | Current:{' '}
                  {currentSelection
                    ? `${currentSelection.value}. ${currentSelection.label}`
                    : 'None'}
                </>
              )}
            </p>

            <div className="cli-session" ref={historyRef}>
              {isCompactLayout ? (
                <div style={touchControlsStyle} aria-label="Touch controls">
                  <button
                    type="button"
                    style={touchButtonStyle}
                    onClick={() => moveSelection(-1)}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    style={touchButtonStyle}
                    onClick={() => moveSelection(1)}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    style={touchButtonStyle}
                    onClick={() => {
                      if (currentSelection) {
                        setInputValue(String(currentSelection.value));
                      }
                    }}
                    disabled={!currentSelection}
                  >
                    Stage
                  </button>
                  <button
                    type="button"
                    style={runTouchButtonStyle}
                    onClick={submitPrompt}
                  >
                    Run
                  </button>
                </div>
              ) : null}

              <div className="cli-history" role="log" aria-live="polite">
                {lines.map((line) => (
                  <p
                    key={line.id}
                    className={`cli-line cli-line--${line.kind}`}
                  >
                    {line.kind === 'input' ? (
                      <>
                        <span className="cli-line-prefix">jp@cli: ~%</span>
                        <span>{line.text}</span>
                      </>
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
                <span className="cli-prompt-prefix">jp@cli: ~%</span>
                <input
                  ref={inputRef}
                  id="cli-command-input"
                  type="text"
                  className="cli-prompt-input"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={promptPlaceholder}
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

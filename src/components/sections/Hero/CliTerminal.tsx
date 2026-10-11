import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { env } from '@/config/env';
import { defaultTheme } from '@/config/themes';
import {
  BITSTOCKERZ_PROJECT,
  JP_DESIGN_SYSTEM_PROJECT,
  PROJECT_STATUS_LABELS,
  type ProjectSummary,
} from '@/content/projects';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useGitHub } from '@/hooks/useGitHub';
import { usePetDogs } from '@/hooks/usePetDogs';
import { useTheme } from '@/hooks/useTheme';
import '@/components/sections/Hero/CliTerminal.css';

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

interface CliSkillCategory {
  name: string;
  skills: string[];
  example: string;
}

interface CliExperience {
  title: string;
  organization: string;
  period: string;
  location: string;
  summary?: string;
  highlights?: string[];
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

type InitialLine = Omit<TerminalLine, 'id'>;

const MAX_SCROLLBACK_LINES = 300;
const MAX_COMMAND_HISTORY = 100;
const COMMANDS = [
  'about',
  'projects',
  'project',
  'skills',
  'skill',
  'experience',
  'exp',
  'github',
  'contact',
  'dogs',
  'dog',
  'resume',
  'help',
  'history',
  'back',
  'menu',
  'pwd',
  'ls',
  'clear',
  'theme',
  'mode',
  'exit',
];
const THEME_NAMES = ['minimal', 'engineer', 'cosmic', 'cli'];
const MODE_NAMES = ['light', 'dark', 'system'];
const NO_ARGUMENT_COMMANDS = new Set([
  'about',
  'projects',
  'skills',
  'experience',
  'education',
  'github',
  'gh',
  'contact',
  'dogs',
  'doggos',
  'pets',
  'resume',
  'cv',
  'history',
  'back',
  'menu',
  'pwd',
  'ls',
  'clear',
  'cls',
  'exit',
  'quit',
]);
const MAIN_MENU_LINES: InitialLine[] = [
  { kind: 'output', text: '[COMMANDS]' },
  { kind: 'output', text: 'about       Background and engineering approach' },
  {
    kind: 'output',
    text: 'projects    Project details, source, and release limits',
  },
  { kind: 'output', text: 'experience  Work history and education' },
  { kind: 'output', text: 'skills      Technologies with examples' },
  { kind: 'output', text: 'github      GitHub profile and available activity' },
  { kind: 'output', text: 'contact     Email and professional profiles' },
  { kind: 'output', text: 'resume      Download the PDF resume' },
  { kind: 'output', text: 'dogs        Meet Nala, Rosie, and Tito' },
  {
    kind: 'hint',
    text: 'Try project 1 or exp 1. Type help for all commands; exit returns to the visual portfolio.',
  },
];

const HELP_TOPICS: Record<string, string[]> = {
  projects: [
    'projects — list the projects.',
    'project <number> — read the description, stack, source links, and release limits.',
    'Example: project 1. Numbers also work after projects. Type back to return to the list.',
  ],
  skills: [
    'skills — list skill categories.',
    'skill <number> — see technologies and concrete examples. Example: skill 1.',
  ],
  experience: [
    'experience — list work history and education.',
    'exp <number> — read a timeline entry. Example: exp 1.',
  ],
  dogs: [
    'dogs — list the dogs and current counts.',
    'dog <number> — read a profile.',
    'dog <number> treat | dog <number> scritch — give a treat or scritches.',
    'Example: dog 1 treat. Counts are shared with the portfolio pet section.',
  ],
  keyboard: [
    'Enter runs your command. Empty Enter does nothing.',
    '↑ / ↓ recall previous commands and restore your unfinished draft.',
    '← / → edit text normally. Ctrl+Space completes a command or lists matches.',
    'Tab / Shift+Tab move focus between the transcript, links, and prompt.',
    'Ctrl+L clears the transcript. Ctrl+C cancels the draft; selected text can still be copied.',
  ],
  theme: [
    'theme minimal | engineer | cosmic | cli — change the portfolio theme.',
    'Example: theme minimal. Your preference is saved on this browser.',
  ],
  mode: [
    'mode light | dark | system — change the color preference.',
    'Example: mode light. System follows your device preference.',
  ],
  navigation: [
    'back — return from a detail to its list, or from a list to the command menu.',
    'menu — show the main commands. ls lists the current portfolio section.',
    'pwd — show the current portfolio context. This is a portfolio guide, not an operating-system shell.',
    'history — show up to 100 commands from this session. clear — clear output, keeping command history.',
    'exit — return to the minimal visual theme.',
  ],
  aliases: [
    'Main-menu numbers: 1 about, 2 projects, 3 skills, 4 experience, 5 github, 6 contact, 7 dogs, 8 resume, 9 help, 0 clear.',
    'Inside projects, skills, experience, or dogs, a number opens that entry. 9 help and 0 clear remain available.',
    'Other aliases: h, gh, cv, education, pets, doggos, cls, quit.',
  ],
  about: [
    'about — read my background and approach to modernizing frontend systems.',
  ],
  github: [
    'github — show available profile data. Loading, unavailable, and partial data are labeled; run github again to refresh the output.',
  ],
  contact: [
    'contact — get email, LinkedIn, and GitHub links.',
    'Type exit to use the visual portfolio contact form.',
  ],
  resume: [
    'resume — show the PDF download link. Follow the link with your pointer or keyboard.',
  ],
};

const ABOUT_SUMMARY = [
  'I work on the practical challenges of modernizing frontend systems: keeping existing products running while making them easier to build on.',
  'At accesso, that means integrating Angular and React micro-frontends into a legacy AngularJS platform, isolating framework lifecycles and styles, and improving release tooling.',
  'My personal projects give me room to explore reusable components, full-stack applications, and developer tools. I document their current capabilities and what still needs work.',
];

const ABOUT_APPROACH = [
  'Clarify the requirements: start with the user flow, constraints, and acceptance criteria.',
  'Check the implementation: use type checks, linting, and focused unit and browser tests.',
  'Inspect the result: review the code and interface, then document behavior and remaining QA checks.',
];

const APPROACH_EXAMPLE =
  'For UI work, I connect Jira requirements, Figma comparisons, Playwright checks, and QA notes. AI helps draft plans and implementations; deterministic checks and human review determine whether the change is ready.';

const githubProfileUrl = env.social.github.replace(/\/+$/, '');

const PROJECTS: ProjectSummary[] = [
  BITSTOCKERZ_PROJECT,
  JP_DESIGN_SYSTEM_PROJECT,
  {
    title: 'Godot Playground',
    description:
      'My sandbox for learning the Godot engine, built around small, isolated mechanics, movement systems, UI components, shaders, physics experiments, and prototype gameplay loops. Each technique is a self-contained scene.',
    techStack: ['Godot', 'GDScript', 'Shaders', 'Physics'],
    status: 'development',
    featured: false,
    githubUrl: `${githubProfileUrl}/godot_practice`,
  },
  {
    title: 'wild-apricot-exports',
    description:
      'A published Node CLI and library for exporting and backing up Wild Apricot data without relying on the admin UI. It pulls contacts, events, registrations, invoices, payments, donations, audit logs, configuration, and uploaded files through the public REST API and WebDAV, then writes everything locally as JSON, CSV, and original files.',
    techStack: ['Node.js', 'TypeScript', 'Commander', 'WebDAV', 'npm CLI'],
    featured: true,
    githubUrl: `${githubProfileUrl}/wild-apricot-exports`,
    packageUrl: 'https://www.npmjs.com/package/wild-apricot-exports',
  },
  {
    title: 'SideQuest: Pittsburgh',
    description:
      'A private React Native app for discovering offbeat places across Pittsburgh. An offline-first feed prioritizes proximity, novelty, and curated tags. Source access is private; this entry is supporting project context.',
    techStack: ['React Native', 'TypeScript', 'Express', 'MongoDB', 'Maps API'],
    featured: false,
    private: true,
  },
  {
    title: 'Plexarr',
    description:
      'A self-hosted media request system for managing a home Plex server. Users authenticate via passkeys (WebAuthn), search for content, and submit requests through a private dashboard. Features include real-time service health monitoring, per-user quality profiles, and an activity audit log.',
    techStack: ['React', 'TypeScript', 'Node.js', 'WebAuthn'],
    featured: false,
    private: true,
  },
];

const SKILL_CATEGORIES: CliSkillCategory[] = [
  {
    name: 'Frontend systems',
    skills: ['Angular', 'React', 'TypeScript', 'RxJS', 'SCSS'],
    example:
      'Applied at accesso: Angular and React micro-frontends inside an AngularJS host, with attention to framework lifecycles and style isolation. Run exp 1 for the work history.',
  },
  {
    name: 'APIs & data',
    skills: ['Node.js', 'NestJS', 'Prisma', 'MySQL/MariaDB'],
    example:
      'Applied in BitStockerz: an Angular client and NestJS API for strategy research, historical backtests, and paper trading. The project is in development. Run project 1 for source and release limits.',
  },
  {
    name: 'Testing & delivery',
    skills: ['Playwright', 'GitHub Actions', 'Jenkins'],
    example:
      'Browser checks for UI behavior, continuous integration, and release automation across four applications. Run exp 1 for the delivery work.',
  },
  {
    name: 'Engineering approach',
    skills: ['Requirements', 'Deterministic checks', 'Human review'],
    example: APPROACH_EXAMPLE,
  },
];

const ADDITIONAL_SKILLS = ['Documentation', 'Accessibility', 'Code review'];

const EXPERIENCES: CliExperience[] = [
  {
    title: 'Software Engineer (UI Engineer)',
    organization: 'accesso',
    period: 'May 2021 – Present',
    location: 'Lake Mary, FL',
    summary:
      'Contribute to the modernization of a large legacy AngularJS platform using micro-frontends, supporting high-volume entertainment venues worldwide.',
    highlights: [
      'Architected a React + Tailwind micro-frontend inside a legacy AngularJS + Bootstrap host, isolating framework lifecycles and eliminating cross-framework styling conflicts.',
      'Led migration of 8 Angular micro-frontends into an AngularJS shell using ngUpgrade, enabling incremental modernization without a full rewrite.',
      'Engineered release automation tooling that reduced deployment time by about 75% across four applications through Jenkins pipelines, Jira automation, release notes drafting, and internal documentation generation.',
      'Developed a UI workflow connecting Jira requirements, Figma comparisons, Playwright checks, and QA documentation, with AI-assisted planning and human review.',
      'Built a Claude-powered PR review bot in GitHub Actions to flag logic, security, and memory issues for developer review.',
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
  },
  {
    title: 'Bachelor of Science (B.S.) in Psychology',
    organization: 'University of Central Florida',
    period: '2008-2012',
    location: 'Orlando, FL',
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
  const { setTheme, setColorMode, colorMode } = useTheme();
  const breakpoint = useBreakpoint();
  const [context, setContext] = useState<Context>('main');
  const [inputValue, setInputValue] = useState('');
  const [isDetailView, setIsDetailView] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState({ id: 0, text: '' });
  const draftRef = useRef('');
  const lineIdRef = useRef(0);
  const scrollRequestedRef = useRef(false);
  const initialDesktopRef = useRef(breakpoint === 'lg' || breakpoint === 'xl');
  const historyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

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

  const announce = (text: string): void => {
    setAnnouncement((previous) => ({ id: previous.id + 1, text }));
  };

  const appendLines = (entries: InitialLine[]): void => {
    const stamped = entries.map((entry) => ({
      ...entry,
      id: ++lineIdRef.current,
    }));
    setLines((previous) =>
      [...previous, ...stamped].slice(-MAX_SCROLLBACK_LINES)
    );
    const outputCount = entries.filter(
      (entry) => entry.kind !== 'input'
    ).length;
    if (outputCount)
      announce(
        `Command output ready. ${outputCount} ${outputCount === 1 ? 'line' : 'lines'} added to the transcript.`
      );
  };

  const printMainMenu = (): void => {
    setContext('main');
    setIsDetailView(false);
    appendLines(MAIN_MENU_LINES);
  };

  const resetTerminal = (): void => {
    setContext('main');
    setIsDetailView(false);
    setLines([]);
    announce(
      'Transcript cleared. Command history is still available with the up arrow.'
    );
  };

  const showAbout = (): void => {
    setContext('main');
    setIsDetailView(false);
    appendLines([
      { kind: 'output', text: '[ABOUT]' },
      ...ABOUT_SUMMARY.map((item) => ({
        kind: 'output' as const,
        text: `- ${item}`,
      })),
      { kind: 'output', text: 'From requirement to verified change:' },
      ...ABOUT_APPROACH.map((item) => ({
        kind: 'output' as const,
        text: `- ${item}`,
      })),
      { kind: 'output', text: APPROACH_EXAMPLE },
    ]);
  };

  const showProjectsMenu = (): void => {
    setContext('projects');
    setIsDetailView(false);
    appendLines([
      { kind: 'output', text: '[PROJECTS]' },
      ...PROJECTS.map((project, index) => {
        const statusPart = project.status
          ? ` (${PROJECT_STATUS_LABELS[project.status]})`
          : '';
        const privatePart = project.private ? ' (Private)' : '';
        const text = `${index + 1}. ${project.title}${statusPart}${privatePart}`;
        return project.githubUrl
          ? { kind: 'output' as const, text, url: project.githubUrl }
          : { kind: 'output' as const, text };
      }),
      {
        kind: 'hint',
        text: 'Read details with project <number>, for example project 1. Type back for the command menu.',
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
    const repoLine = project.private
      ? { kind: 'output' as const, text: 'Repository: Private' }
      : project.githubUrl
        ? {
            kind: 'output' as const,
            text: `GitHub: ${project.githubUrl}`,
            url: project.githubUrl,
          }
        : null;
    const packageLine = project.packageUrl
      ? {
          kind: 'output' as const,
          text: `npm: ${project.packageUrl}`,
          url: project.packageUrl,
        }
      : null;

    appendLines([
      { kind: 'output', text: `[PROJECT ${selection}] ${project.title}` },
      {
        kind: 'output',
        text: `Type: ${project.featured ? 'Featured' : 'Other'}${project.status ? ` | Status: ${PROJECT_STATUS_LABELS[project.status]}` : ''}`,
      },
      ...(repoLine ? [repoLine] : []),
      ...(packageLine ? [packageLine] : []),
      { kind: 'output', text: project.description },
      { kind: 'output', text: `Stack: ${project.techStack.join(', ')}` },
      {
        kind: 'hint',
        text: 'Try project <number> for another project, back for the list, or help projects.',
      },
    ]);
  };

  const showSkillsMenu = (): void => {
    setContext('skills');
    setIsDetailView(false);
    appendLines([
      { kind: 'output', text: '[SKILLS]' },
      ...SKILL_CATEGORIES.map((category, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${category.name} (${category.skills.length})`,
      })),
      {
        kind: 'output',
        text: `5. Supporting practices (${ADDITIONAL_SKILLS.length})`,
      },
      {
        kind: 'hint',
        text: 'Try skill 1 for an example. Type back for the command menu.',
      },
    ]);
  };

  const showSkillDetail = (selection: number): void => {
    if (selection === 5) {
      setContext('skills');
      setIsDetailView(true);
      appendLines([
        {
          kind: 'output',
          text: '[SKILL CATEGORY 5] Supporting practices',
        },
        ...chunk(ADDITIONAL_SKILLS, 5).map((group) => ({
          kind: 'output' as const,
          text: group,
        })),
        {
          kind: 'output',
          text: 'Examples: QA documentation and developer review at accesso; automated accessibility checks in the pre-release design system. Run exp 1 or project 2 for details.',
        },
        {
          kind: 'hint',
          text: 'Try skill <number> for another category, or back for the list.',
        },
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
    appendLines([
      {
        kind: 'output',
        text: `[SKILL CATEGORY ${selection}] ${category.name}`,
      },
      ...chunk(category.skills, 5).map((group) => ({
        kind: 'output' as const,
        text: group,
      })),
      { kind: 'output', text: category.example },
      {
        kind: 'hint',
        text: 'Try skill <number> for another category, or back for the list.',
      },
    ]);
  };

  const showExperienceMenu = (): void => {
    setContext('experience');
    setIsDetailView(false);
    appendLines([
      { kind: 'output', text: '[EXPERIENCE & EDUCATION]' },
      ...EXPERIENCES.map((item, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${getCliExperienceOptionLabel(item)} @ ${item.organization} (${item.period})`,
      })),
      {
        kind: 'hint',
        text: 'Read a role with exp <number>, for example exp 1. Type back for the command menu.',
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
    appendLines([
      { kind: 'output', text: `[TIMELINE ${selection}] ${item.title}` },
      { kind: 'output', text: `${item.organization} | ${item.location}` },
      { kind: 'output', text: item.period },
      ...(item.summary
        ? [{ kind: 'output' as const, text: item.summary }]
        : []),
      ...(item.highlights ?? []).map((highlight) => ({
        kind: 'output' as const,
        text: `- ${highlight}`,
      })),
      {
        kind: 'hint',
        text: 'Try exp <number> for another entry, or back for the timeline.',
      },
    ]);
  };

  const showGitHub = (): void => {
    setContext('main');
    setIsDetailView(false);
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
        {
          kind: 'hint',
          text: 'Run github again in a few seconds, or type contact for profile links.',
        },
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
        : [
            {
              kind: 'hint' as const,
              text: 'Contribution history is temporarily unavailable. View the profile on GitHub for current activity.',
            },
          ]),
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
    setContext('main');
    setIsDetailView(false);
    appendLines([
      { kind: 'output', text: '[CONTACT]' },
      {
        kind: 'output',
        text: 'Software engineering roles and technical conversations. Share the role, team, and working arrangement.',
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
        text: 'Type exit to use the visual portfolio contact form, or resume for the PDF.',
      },
    ]);
  };

  const showDogsMenu = (): void => {
    setContext('dogs');
    setIsDetailView(false);
    appendLines([
      { kind: 'output', text: '[PET DOGS]' },
      ...dogs.map((dog, index) => ({
        kind: 'output' as const,
        text: `${index + 1}. ${dog.name}${dog.badge ? ` (${dog.badge})` : ''} | Treats: ${dog.stats.treats} | Scritches: ${dog.stats.scritches}`,
      })),
      {
        kind: 'hint',
        text: 'Try dog 1, dog 1 treat, or dog 1 scritch. Type help dogs for more.',
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

    if (!['treat', 'treats', 'scritch', 'scritches'].includes(action)) {
      appendLines([
        {
          kind: 'error',
          text: 'Unknown dog action. Use "treat" or "scritch".',
        },
      ]);
      return;
    }

    setContext('dogs');
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
  };

  const showResume = (): void => {
    setContext('main');
    setIsDetailView(false);
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
        text: 'Follow the download link above. Type contact to get in touch, or exit for the visual portfolio.',
      },
    ]);
  };

  const showHelp = (topic?: string): void => {
    const aliases: Record<string, string> = {
      project: 'projects',
      skill: 'skills',
      exp: 'experience',
      dog: 'dogs',
      history: 'navigation',
      back: 'navigation',
      pwd: 'navigation',
      ls: 'navigation',
      clear: 'navigation',
      menu: 'navigation',
      exit: 'navigation',
    };
    const resolvedTopic = topic
      ? Object.prototype.hasOwnProperty.call(aliases, topic)
        ? aliases[topic]
        : topic
      : undefined;
    if (resolvedTopic) {
      const instructions = Object.prototype.hasOwnProperty.call(
        HELP_TOPICS,
        resolvedTopic
      )
        ? HELP_TOPICS[resolvedTopic]
        : undefined;
      appendLines(
        instructions
          ? [
              { kind: 'output', text: `[HELP: ${resolvedTopic}]` },
              ...instructions.map(
                (text): InitialLine => ({ kind: 'output', text })
              ),
              { kind: 'hint', text: 'Type help for all commands.' },
            ]
          : [
              { kind: 'error', text: `No help topic: ${topic}` },
              {
                kind: 'hint',
                text: 'Try help projects, help keyboard, or help navigation.',
              },
            ]
      );
      return;
    }
    appendLines([
      { kind: 'output', text: '[HELP]' },
      ...MAIN_MENU_LINES.slice(1, -1),
      {
        kind: 'output',
        text: 'Details: project <n>, skill <n>, exp <n>, dog <n> [treat|scritch]',
      },
      {
        kind: 'output',
        text: 'Navigate: back, menu, pwd, ls. Session: history, clear.',
      },
      {
        kind: 'output',
        text: 'Appearance: theme minimal|engineer|cosmic|cli; mode light|dark|system.',
      },
      { kind: 'output', text: 'exit returns to the minimal visual portfolio.' },
      {
        kind: 'hint',
        text: 'Try help keyboard for shortcuts or help aliases for number shortcuts.',
      },
      {
        kind: 'hint',
        text: 'This is a portfolio guide, not an operating-system shell. Commands do not access your files or run programs.',
      },
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
          { kind: 'hint', text: 'Type help for available commands.' },
        ]);
    }
  };

  const showCurrentList = (): void => {
    if (context === 'projects') showProjectsMenu();
    else if (context === 'skills') showSkillsMenu();
    else if (context === 'experience') showExperienceMenu();
    else if (context === 'dogs') showDogsMenu();
    else printMainMenu();
  };

  const goBack = (): void => {
    if (isDetailView && context !== 'main') showCurrentList();
    else printMainMenu();
  };

  const clearQueryOverride = (key: 'theme' | 'mode'): void => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(key)) return;
    url.searchParams.delete(key);
    window.history.replaceState(window.history.state, '', url);
  };

  const executeCommand = (raw: string, sessionHistory: string[]): void => {
    const tokens = raw.toLowerCase().split(/\s+/);
    const [command, arg1, arg2] = tokens;
    if (NO_ARGUMENT_COMMANDS.has(command) && tokens.length !== 1) {
      appendLines([
        { kind: 'input', text: raw },
        { kind: 'error', text: `Usage: ${command}` },
      ]);
      return;
    }
    if ((command === 'help' || command === 'h') && tokens.length > 2) {
      appendLines([
        { kind: 'input', text: raw },
        { kind: 'error', text: 'Usage: help [topic]' },
      ]);
      return;
    }
    if (command === 'clear' || command === 'cls' || raw === '0') {
      resetTerminal();
      return;
    }

    appendLines([{ kind: 'input', text: raw }]);

    if (/^\d+$/.test(raw)) {
      handleNumericInput(Number(raw));
      return;
    }
    if (command === 'exit' || command === 'quit') {
      clearQueryOverride('theme');
      setTheme(defaultTheme);
      return;
    }
    if (command === 'theme') {
      if (!arg1 || !THEME_NAMES.includes(arg1) || tokens.length !== 2) {
        appendLines([
          { kind: 'error', text: 'Usage: theme <minimal|engineer|cosmic|cli>' },
        ]);
        return;
      }
      clearQueryOverride('theme');
      setTheme(arg1);
      appendLines([{ kind: 'success', text: `Theme set to ${arg1}.` }]);
      return;
    }
    if (command === 'mode') {
      if (
        (arg1 !== 'light' && arg1 !== 'dark' && arg1 !== 'system') ||
        tokens.length !== 2
      ) {
        appendLines([
          { kind: 'error', text: 'Usage: mode <light|dark|system>' },
        ]);
        return;
      }
      clearQueryOverride('mode');
      setColorMode(arg1);
      appendLines([{ kind: 'success', text: `Color mode set to ${arg1}.` }]);
      return;
    }
    if (command === 'help' || command === 'h') {
      showHelp(arg1);
      return;
    }
    if (command === 'history') {
      appendLines([
        { kind: 'output', text: '[HISTORY]' },
        ...sessionHistory.map(
          (text, index): InitialLine => ({
            kind: 'output',
            text: `${index + 1}  ${text}`,
          })
        ),
        {
          kind: 'hint',
          text: 'Use ↑ / ↓ to recall commands. Your draft returns after the newest entry.',
        },
      ]);
      return;
    }
    if (command === 'back') {
      goBack();
      return;
    }
    if (command === 'menu') {
      printMainMenu();
      return;
    }
    if (command === 'ls') {
      showCurrentList();
      return;
    }
    if (command === 'pwd') {
      appendLines([
        {
          kind: 'output',
          text: context === 'main' ? 'portfolio:/' : `portfolio:/${context}`,
        },
        {
          kind: 'hint',
          text: 'This is your portfolio context. Type ls to list it, or back to return.',
        },
      ]);
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
    if (command === 'skills') {
      showSkillsMenu();
      return;
    }
    if (command === 'experience' || command === 'education') {
      showExperienceMenu();
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
    if (command === 'resume' || command === 'cv') {
      showResume();
      return;
    }

    const detailCommands: Record<
      string,
      { list: () => void; detail: (selection: number) => void; usage: string }
    > = {
      project: {
        list: showProjectsMenu,
        detail: showProjectDetail,
        usage: 'Usage: project <number>',
      },
      skill: {
        list: showSkillsMenu,
        detail: showSkillDetail,
        usage: 'Usage: skill <number>',
      },
      exp: {
        list: showExperienceMenu,
        detail: showExperienceDetail,
        usage: 'Usage: exp <number>',
      },
      dog: {
        list: showDogsMenu,
        detail: showDogDetail,
        usage: 'Usage: dog <number> [treat|scritch]',
      },
    };
    const detailCommand = Object.prototype.hasOwnProperty.call(
      detailCommands,
      command
    )
      ? detailCommands[command]
      : undefined;
    if (detailCommand) {
      if (!arg1) {
        detailCommand.list();
        return;
      }
      if (!/^\d+$/.test(arg1) || tokens.length > (command === 'dog' ? 3 : 2)) {
        appendLines([{ kind: 'error', text: detailCommand.usage }]);
        return;
      }
      if (command === 'dog' && arg2) handleDogAction(Number(arg1), arg2);
      else detailCommand.detail(Number(arg1));
      return;
    }
    appendLines([
      { kind: 'error', text: `Unknown command: ${raw}` },
      { kind: 'hint', text: 'Type help for available commands.' },
    ]);
  };

  const submitPrompt = (): void => {
    if (isComposingRef.current) return;
    const command = inputValue.trim();
    if (!command) return;
    const nextHistory = [...commandHistory, command].slice(
      -MAX_COMMAND_HISTORY
    );
    setCommandHistory(nextHistory);
    setHistoryIndex(null);
    draftRef.current = '';
    setInputValue('');
    scrollRequestedRef.current = true;
    executeCommand(command, nextHistory);
  };

  const recallCommand = (direction: -1 | 1): void => {
    if (commandHistory.length === 0) return;
    if (historyIndex === null) {
      if (direction === 1) return;
      draftRef.current = inputValue;
    }
    const nextIndex = (historyIndex ?? commandHistory.length) + direction;
    if (nextIndex < 0) return;
    if (nextIndex >= commandHistory.length) {
      setHistoryIndex(null);
      setInputValue(draftRef.current);
    } else {
      setHistoryIndex(nextIndex);
      setInputValue(commandHistory[nextIndex]);
    }
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input && document.activeElement === input)
        input.setSelectionRange(input.value.length, input.value.length);
    });
  };

  const completeCommand = (): void => {
    const input = inputRef.current;
    if (
      !input ||
      input.selectionStart !== input.selectionEnd ||
      input.selectionEnd !== input.value.length
    ) {
      announce('Move the cursor to the end of your command to complete it.');
      return;
    }
    const value = inputValue.toLowerCase().trimStart();
    const parts = value.split(/\s+/);
    let candidates: string[] = [];
    let prefix = '';
    if (parts.length === 1) candidates = COMMANDS;
    else if (parts.length === 2) {
      prefix = `${parts[0]} `;
      if (parts[0] === 'theme') candidates = THEME_NAMES;
      else if (parts[0] === 'mode') candidates = MODE_NAMES;
      else if (parts[0] === 'help') candidates = Object.keys(HELP_TOPICS);
      else {
        const counts: Record<string, number> = {
          project: PROJECTS.length,
          skill: 5,
          exp: EXPERIENCES.length,
          dog: dogs.length,
        };
        const count = Object.prototype.hasOwnProperty.call(counts, parts[0])
          ? counts[parts[0]]
          : 0;
        candidates = Array.from({ length: count }, (_, index) =>
          String(index + 1)
        );
      }
    } else if (parts.length === 3 && parts[0] === 'dog') {
      prefix = `dog ${parts[1]} `;
      candidates = ['treat', 'scritch'];
    }
    const matches = candidates.filter((candidate) =>
      candidate.startsWith(parts.at(-1) ?? '')
    );
    if (matches.length === 1) {
      const completed = `${prefix}${matches[0]} `;
      setInputValue(completed);
      setHistoryIndex(null);
      announce(`Completed: ${completed.trim()}`);
    } else if (matches.length > 1) {
      scrollRequestedRef.current = true;
      appendLines([{ kind: 'hint', text: `Matches: ${matches.join(', ')}` }]);
    } else announce('No completion found. Type help for available commands.');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.nativeEvent.isComposing || isComposingRef.current) {
      if (event.key === 'Enter') event.preventDefault();
      return;
    }
    if (event.ctrlKey && !event.altKey && !event.metaKey) {
      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        resetTerminal();
      } else if (event.key.toLowerCase() === 'c') {
        const input = event.currentTarget;
        if (
          input.selectionStart !== input.selectionEnd ||
          window.getSelection()?.toString()
        )
          return;
        event.preventDefault();
        setInputValue('');
        setHistoryIndex(null);
        draftRef.current = '';
        announce('Draft cancelled. Ready for a command.');
      } else if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        completeCommand();
      }
      return;
    }
    if (
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey &&
      commandHistory.length > 0
    ) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        recallCommand(event.key === 'ArrowUp' ? -1 : 1);
      }
    }
  };

  useEffect(() => {
    if (
      initialDesktopRef.current &&
      !window.matchMedia('(pointer: coarse)').matches
    ) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (!scrollRequestedRef.current) return;
    scrollRequestedRef.current = false;
    const transcript = historyRef.current;
    if (
      transcript &&
      document.activeElement === inputRef.current &&
      !window.getSelection()?.toString()
    ) {
      transcript.scrollTop = transcript.scrollHeight;
    }
  }, [lines]);

  const contextHint =
    context === 'main'
      ? 'help for commands · exit for the visual portfolio'
      : `help ${context} for commands · back to return · exit for the visual portfolio`;

  return (
    <section className="cli-terminal-shell" aria-label="Portfolio terminal">
      <div className="cli-terminal-toolbar">
        <span className="cli-terminal-title">
          portfolio / interactive guide
        </span>
        <span className="cli-terminal-mode">{colorMode ?? 'system'}</span>
      </div>
      {/* The scrollable transcript needs a tab stop for keyboard scrolling. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="cli-session"
        ref={historyRef}
        role="region"
        aria-label="Terminal transcript"
        tabIndex={0}
      >
        <div className="cli-session-content">
          <div className="cli-intro">
            <p className="cli-line cli-line--system">
              Welcome to my portfolio.
            </p>
            <h1 id="hero-heading" className="cli-identity">
              Justin Paoletta
            </h1>
            <p className="cli-role">Software Engineer</p>
            <p className="cli-line">Angular · React · TypeScript</p>
            <p className="cli-line cli-intro-summary">
              I modernize frontend applications and build release tooling that
              helps teams ship reliably.
            </p>
            <p className="cli-line">
              An interactive guide to my work. Type a command, then press Enter.
            </p>
            <dl className="cli-command-guide">
              <div>
                <dt>projects</dt>
                <dd>Explore the work</dd>
              </div>
              <div>
                <dt>experience</dt>
                <dd>Read my work history</dd>
              </div>
              <div>
                <dt>about / skills</dt>
                <dd>Background and approach</dd>
              </div>
              <div>
                <dt>contact / resume</dt>
                <dd>Get in touch or get the PDF</dd>
              </div>
              <div>
                <dt>github / dogs</dt>
                <dd>Activity and a little personality</dd>
              </div>
            </dl>
            <p className="cli-line cli-line--hint">
              Start with projects, or try project 1. Type help for all commands.
            </p>
            <p className="cli-line cli-line--hint">
              Type exit to return to the visual portfolio. Change appearance
              with theme or mode.
            </p>
          </div>
          <div className="cli-history">
            {lines.map((line) => (
              <p key={line.id} className={`cli-line cli-line--${line.kind}`}>
                {line.kind === 'input' ? (
                  <>
                    <span className="cli-line-prefix" aria-hidden="true">
                      $
                    </span>
                    <span>{line.text}</span>
                  </>
                ) : line.url ? (
                  <a
                    href={line.url}
                    className="cli-line-link"
                    target={
                      line.url.startsWith('mailto:') || line.url.startsWith('/')
                        ? undefined
                        : '_blank'
                    }
                    rel={
                      line.url.startsWith('mailto:') || line.url.startsWith('/')
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
        </div>
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
      <form
        className="cli-prompt"
        onSubmit={(event) => {
          event.preventDefault();
          submitPrompt();
        }}
      >
        <div className="cli-prompt-content">
          <p className="cli-line cli-context-hint">{contextHint}</p>
          <div className="cli-prompt-row">
            <label htmlFor="cli-command-input" className="visually-hidden">
              Terminal command input
            </label>
            <span className="cli-prompt-prefix" aria-hidden="true">
              {context === 'main' ? '~' : `~/${context}`} $
            </span>
            <input
              ref={inputRef}
              id="cli-command-input"
              type="text"
              className="cli-prompt-input"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setHistoryIndex(null);
              }}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              enterKeyHint="send"
              maxLength={500}
              aria-describedby="cli-keyboard-shortcuts"
              onKeyDown={handleKeyDown}
            />
          </div>
          <p id="cli-keyboard-shortcuts" className="cli-keyboard-shortcuts">
            Enter run · ↑ ↓ history · Ctrl+Space complete · Tab move focus ·
            help keyboard
          </p>
        </div>
      </form>
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span key={announcement.id}>{announcement.text}</span>
      </div>
    </section>
  );
}

export default CliTerminal;

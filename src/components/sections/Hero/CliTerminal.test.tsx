import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import CliTerminal from '@/components/sections/Hero/CliTerminal';
import Projects from '@/components/sections/Projects';
import { defaultTheme } from '@/config/themes';

const setThemeMock = vi.fn();
const setColorModeMock = vi.fn();
const updateDogStatsMock = vi.fn();

let dogsState = [
  { name: 'Nala', stats: { treats: 1, scritches: 2 } },
  { name: 'Rosie', stats: { treats: 3, scritches: 4 } },
  { name: 'Tito', stats: { treats: 5, scritches: 6 } },
];

interface CliGitHubUser {
  login: string;
  name: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface CliGitHubRepo {
  name: string;
  stargazers_count: number;
}

interface CliPinnedRepo {
  name: string;
  stargazerCount: number;
}

interface CliContributions {
  totalContributions: number;
  weeks: unknown[];
}

interface CliGitHubState {
  user: CliGitHubUser | null;
  repos: CliGitHubRepo[];
  pinnedRepos: CliPinnedRepo[];
  contributions: CliContributions | null;
  loading: boolean;
  error: string | null;
}

let githubState: CliGitHubState = {
  user: {
    login: 'justin',
    name: 'Justin',
    public_repos: 42,
    followers: 8,
    following: 2,
  },
  repos: [{ name: 'repo-a', stargazers_count: 10 }],
  pinnedRepos: [],
  contributions: { totalContributions: 123, weeks: [] },
  loading: false,
  error: null as string | null,
};

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    setTheme: setThemeMock,
    setColorMode: setColorModeMock,
    themeName: 'cli',
    colorMode: 'dark',
    resolvedMode: 'dark',
  }),
}));

vi.mock('@/hooks/usePetDogs', () => ({
  usePetDogs: () => [dogsState, updateDogStatsMock],
}));

vi.mock('@/hooks/useGitHub', () => ({
  useGitHub: () => githubState,
}));

function renderTerminal() {
  render(<CliTerminal />);
  expect(
    screen.getByRole('region', { name: 'Portfolio terminal' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Justin Paoletta', level: 1 })
  ).toBeInTheDocument();
}

function terminalTranscript() {
  return within(screen.getByRole('region', { name: 'Terminal transcript' }));
}

function runCommand(command: string) {
  const input = screen.getByLabelText(/terminal command input/i);
  fireEvent.change(input, { target: { value: command } });
  const form = input.closest('form');
  if (!form) throw new Error('missing command form');
  fireEvent.submit(form);
}

describe('CliTerminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dogsState = [
      { name: 'Nala', stats: { treats: 1, scritches: 2 } },
      { name: 'Rosie', stats: { treats: 3, scritches: 4 } },
      { name: 'Tito', stats: { treats: 5, scritches: 6 } },
    ];
    githubState = {
      user: {
        login: 'justin',
        name: 'Justin',
        public_repos: 42,
        followers: 8,
        following: 2,
      },
      repos: [{ name: 'repo-a', stargazers_count: 10 }],
      pinnedRepos: [],
      contributions: { totalContributions: 123, weeks: [] },
      loading: false,
      error: null,
    };
  });

  it('reveals the opening instructions half a second after the welcome', () => {
    vi.useFakeTimers();
    try {
      renderTerminal();
      expect(
        terminalTranscript().getByText('Welcome to JP-CLI')
      ).toBeInTheDocument();
      expect(
        terminalTranscript().queryByText(/^Type ls to list directories/)
      ).not.toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(
        terminalTranscript().queryByText(/^Type ls to list directories/)
      ).not.toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(
        terminalTranscript().getByText(/^Type ls to list directories/)
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('navigates relative and absolute directories and lists paths without moving', () => {
    renderTerminal();
    const cwd = () => document.querySelector('.cli-prompt-prefix')?.textContent;
    runCommand('ls');
    expect(terminalTranscript().getByText('projects/')).toBeInTheDocument();
    runCommand('cd projects/2');
    expect(cwd()).toBe('~/projects/2 $');
    expect(
      terminalTranscript().getByText('[PROJECT 2] @jp-design-system')
    ).toBeInTheDocument();
    runCommand('ls ..');
    expect(cwd()).toBe('~/projects/2 $');
    runCommand('cd ..');
    expect(cwd()).toBe('~/projects $');
    runCommand('cd ../skills/5');
    expect(cwd()).toBe('~/skills/5 $');
    runCommand('cd /contact');
    expect(cwd()).toBe('~/contact $');
    expect(terminalTranscript().getByText('[CONTACT]')).toBeInTheDocument();
    runCommand('cd ~/resume');
    expect(cwd()).toBe('~/resume $');
    for (const command of [
      'cd missing',
      'cd /projects/99',
      'cd /missing/../projects',
      'cd /projects/1/child',
      'cd /projects extra',
      'ls /missing',
    ]) {
      runCommand(command);
      expect(cwd()).toBe('~/resume $');
    }
    runCommand('cd');
    expect(cwd()).toBe('~ $');
    runCommand('cd ../../');
    expect(cwd()).toBe('~ $');
  });

  it('completes directory paths and closes through the same saved-theme exit', () => {
    renderTerminal();
    const input = screen.getByLabelText('Terminal command input');
    fireEvent.change(input, { target: { value: 'cd /pro' } });
    fireEvent.keyDown(input, { key: ' ', code: 'Space', ctrlKey: true });
    expect(input).toHaveValue('cd /projects ');
    runCommand('cd projects');
    fireEvent.change(input, { target: { value: 'cd ../ski' } });
    fireEvent.keyDown(input, { key: ' ', code: 'Space', ctrlKey: true });
    expect(input).toHaveValue('cd ../skills ');
    const originalUrl = window.location.href;
    window.history.replaceState({}, '', '?theme=cli&mode=dark');
    fireEvent.click(screen.getByRole('button', { name: 'Exit terminal' }));
    expect(setThemeMock).toHaveBeenCalledWith(defaultTheme);
    expect(new URL(window.location.href).searchParams.has('theme')).toBe(false);
    expect(new URL(window.location.href).searchParams.get('mode')).toBe('dark');
    window.history.replaceState({}, '', originalUrl);
  });

  it('covers menu numerics, aliases, help, clear, unknown and exit', () => {
    renderTerminal();

    runCommand('1');
    expect(terminalTranscript().getByText('[ABOUT]')).toBeInTheDocument();
    expect(
      terminalTranscript().getByText(
        /deterministic checks and human review determine/
      )
    ).toBeInTheDocument();
    expect(
      terminalTranscript().queryByText(/5\+ years|75% faster releases/)
    ).not.toBeInTheDocument();

    runCommand('2');
    expect(terminalTranscript().getByText('[PROJECTS]')).toBeInTheDocument();

    runCommand('skills');
    expect(terminalTranscript().getByText('[SKILLS]')).toBeInTheDocument();

    runCommand('experience');
    expect(
      terminalTranscript().getByText('[EXPERIENCE & EDUCATION]')
    ).toBeInTheDocument();

    runCommand('9');
    expect(terminalTranscript().getByText('[HELP]')).toBeInTheDocument();

    runCommand('totally-unknown');
    expect(
      terminalTranscript().getByText('Type help for available commands.')
    ).toBeInTheDocument();

    runCommand('menu');
    expect(terminalTranscript().getByText('[HELP]')).toBeInTheDocument();

    runCommand('clear');
    expect(terminalTranscript().queryByText('[HELP]')).not.toBeInTheDocument();

    runCommand('exit');
    expect(setThemeMock).toHaveBeenCalledWith(defaultTheme);
  });

  it('covers project, skill, and experience drill-ins including invalid inputs', () => {
    renderTerminal();

    runCommand('project');
    expect(terminalTranscript().getByText('[PROJECTS]')).toBeInTheDocument();

    runCommand('project abc');
    expect(
      terminalTranscript().getByText('Usage: project <number>')
    ).toBeInTheDocument();

    runCommand('project 99');
    expect(
      terminalTranscript().getByText('Project 99 not found.')
    ).toBeInTheDocument();

    runCommand('project 1');
    expect(terminalTranscript().getByText(/\[PROJECT 1\]/)).toBeInTheDocument();

    runCommand('project 4');
    expect(
      terminalTranscript().getByText(/\[PROJECT 4\] wild-apricot-exports/)
    ).toBeInTheDocument();
    expect(
      terminalTranscript().getByText('Type: Featured')
    ).toBeInTheDocument();
    expect(
      terminalTranscript().getByText(
        /npm: https:\/\/www\.npmjs\.com\/package\/wild-apricot-exports/i
      )
    ).toBeInTheDocument();

    runCommand('skill');
    expect(terminalTranscript().getByText('[SKILLS]')).toBeInTheDocument();

    runCommand('skill abc');
    expect(
      terminalTranscript().getByText('Usage: skill <number>')
    ).toBeInTheDocument();

    runCommand('skill 5');
    expect(
      terminalTranscript().getByText('[SKILL CATEGORY 5] Supporting practices')
    ).toBeInTheDocument();

    runCommand('skill 99');
    expect(
      terminalTranscript().getByText('Skill category 99 not found.')
    ).toBeInTheDocument();

    runCommand('exp');
    expect(
      terminalTranscript().getByText('[EXPERIENCE & EDUCATION]')
    ).toBeInTheDocument();

    runCommand('exp abc');
    expect(
      terminalTranscript().getByText('Usage: exp <number>')
    ).toBeInTheDocument();

    runCommand('exp 99');
    expect(
      terminalTranscript().getByText('Experience entry 99 not found.')
    ).toBeInTheDocument();
  });

  it('covers dog listing, details, actions and validation errors', () => {
    renderTerminal();

    runCommand('dog');
    expect(terminalTranscript().getByText('[PET DOGS]')).toBeInTheDocument();

    runCommand('dog x');
    expect(
      terminalTranscript().getByText('Usage: dog <number> [treat|scritch]')
    ).toBeInTheDocument();

    runCommand('dog 9');
    expect(
      terminalTranscript().getByText('Dog 9 not found.')
    ).toBeInTheDocument();

    runCommand('dog 1');
    expect(
      terminalTranscript().getByText('[DOG 1] Nala (Foster)')
    ).toBeInTheDocument();

    runCommand('dog 1 treat');
    expect(updateDogStatsMock).toHaveBeenCalledWith('Nala', 'treats');
    expect(
      terminalTranscript().getByText(/Nala got a treat/)
    ).toBeInTheDocument();

    runCommand('dog 2 scritch');
    expect(updateDogStatsMock).toHaveBeenCalledWith('Rosie', 'scritches');
    expect(
      terminalTranscript().getByText(/Rosie got scritches/)
    ).toBeInTheDocument();

    runCommand('dog 2 dance');
    expect(
      terminalTranscript().getByText(/Unknown dog action/)
    ).toBeInTheDocument();

    runCommand('dog 9 treat');
    expect(
      terminalTranscript().getAllByText('Dog 9 not found.').length
    ).toBeGreaterThan(0);
  });

  it('rejects malformed dog actions before mutating statistics', () => {
    renderTerminal();
    for (const command of [
      'dog 1oops treat',
      'dog 1 treat extra',
      'dog -1 treat',
      'dog 1.5 scritch',
    ]) {
      runCommand(command);
    }
    expect(updateDogStatsMock).not.toHaveBeenCalled();
  });

  it('covers github states and contact/resume output', () => {
    renderTerminal();

    runCommand('gh');
    expect(terminalTranscript().getByText('[GITHUB]')).toBeInTheDocument();

    githubState = { ...githubState, error: 'down' };
    runCommand('gh');
    expect(
      terminalTranscript().getByText(
        /Unable to load live GitHub data right now/
      )
    ).toBeInTheDocument();

    githubState = { ...githubState, error: null, loading: true, user: null };
    runCommand('5');
    expect(
      terminalTranscript().getByText(/Fetching live GitHub stats/)
    ).toBeInTheDocument();

    githubState = { ...githubState, loading: false, user: null };
    runCommand('5');
    expect(
      terminalTranscript().getByText(
        /GitHub profile data is currently unavailable/
      )
    ).toBeInTheDocument();

    runCommand('contact');
    expect(terminalTranscript().getByText('[CONTACT]')).toBeInTheDocument();

    runCommand('resume');
    expect(terminalTranscript().getByText('[RESUME]')).toBeInTheDocument();
  });

  it('keeps the welcome visible and leaves empty input and native keys alone', () => {
    renderTerminal();
    const terminal = screen.getByRole('region', { name: 'Portfolio terminal' });
    const transcript = screen.getByRole('region', {
      name: 'Terminal transcript',
    });
    const input = screen.getByLabelText('Terminal command input');

    expect(
      within(terminal).getByRole('button', { name: 'Exit terminal' })
    ).toBeInTheDocument();
    expect(within(terminal).getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('log')).not.toBeInTheDocument();
    expect(transcript).not.toHaveAttribute('aria-live');
    const initialOutput = transcript.textContent;
    runCommand('');
    runCommand('   ');
    expect(transcript.textContent).toBe(initialOutput);

    fireEvent.change(input, { target: { value: 'project 1' } });
    for (const key of ['ArrowLeft', 'ArrowRight', 'Tab']) {
      const event = createEvent.keyDown(input, { key, cancelable: true });
      fireEvent(input, event);
      expect(event.defaultPrevented).toBe(false);
      expect(input).toHaveValue('project 1');
    }
    const shiftTab = createEvent.keyDown(input, {
      key: 'Tab',
      shiftKey: true,
      cancelable: true,
    });
    fireEvent(input, shiftTab);
    expect(shiftTab.defaultPrevented).toBe(false);

    runCommand('about');
    runCommand('clear');
    expect(transcript.querySelector('.cli-history')).toBeEmptyDOMElement();
    expect(
      screen.getByRole('heading', { name: 'Justin Paoletta' })
    ).toBeInTheDocument();
  });

  it('does not submit Enter while an IME composition is in progress', () => {
    renderTerminal();
    const input = screen.getByLabelText('Terminal command input');
    const transcript = screen.getByRole('region', {
      name: 'Terminal transcript',
    });
    const previousOutput = transcript.textContent;
    fireEvent.change(input, { target: { value: 'about' } });
    const event = createEvent.keyDown(input, {
      key: 'Enter',
      isComposing: true,
      keyCode: 229,
      cancelable: true,
    });
    fireEvent(input, event);
    expect(event.defaultPrevented).toBe(true);
    expect(input).toHaveValue('about');
    expect(transcript.textContent).toBe(previousOutput);
  });

  it('recalls command history and restores an unfinished draft', () => {
    renderTerminal();
    const input = screen.getByLabelText('Terminal command input');
    runCommand('about');
    runCommand('projects');
    fireEvent.change(input, { target: { value: 'project 4' } });

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('projects');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('about');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('about');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('projects');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('project 4');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('project 4');
  });

  it('completes commands without intercepting tab navigation to output links', async () => {
    const user = userEvent.setup();
    renderTerminal();
    const input = screen.getByLabelText('Terminal command input');
    fireEvent.change(input, { target: { value: 'res' } });
    fireEvent.keyDown(input, { key: ' ', code: 'Space', ctrlKey: true });
    expect(input).toHaveValue('resume ');

    runCommand('resume');
    const resume = screen.getByRole('link', { name: 'Download resume as PDF' });
    expect(resume).toHaveAttribute(
      'href',
      '/resume/Justin-Paoletta_Software-Engineer.pdf'
    );
    expect(resume).toHaveAttribute('download');
    input.focus();
    await user.tab({ shift: true });
    expect(resume).toHaveFocus();
    await user.tab();
    expect(input).toHaveFocus();
  });

  it('cancels draft input without hijacking copy and clears output with Ctrl+L', () => {
    renderTerminal();
    runCommand('about');
    const input = screen.getByLabelText(
      'Terminal command input'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'project 1' } });
    input.focus();
    input.setSelectionRange(0, input.value.length);
    const copy = createEvent.keyDown(input, {
      key: 'c',
      ctrlKey: true,
      cancelable: true,
    });
    fireEvent(input, copy);
    expect(copy.defaultPrevented).toBe(false);
    expect(input).toHaveValue('project 1');

    input.setSelectionRange(input.value.length, input.value.length);
    const cancel = createEvent.keyDown(input, {
      key: 'c',
      ctrlKey: true,
      cancelable: true,
    });
    fireEvent(input, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(input).toHaveValue('');
    expect(terminalTranscript().getByText('[ABOUT]')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'l', ctrlKey: true });
    expect(
      screen
        .getByRole('region', { name: 'Terminal transcript' })
        .querySelector('.cli-history')
    ).toBeEmptyDOMElement();
    expect(
      screen.getByRole('heading', { name: 'Justin Paoletta' })
    ).toBeInTheDocument();
  });

  it('offers topic help, reports context, and retains command history after clearing output', () => {
    renderTerminal();
    runCommand('projects');
    runCommand('pwd');
    expect(
      terminalTranscript().getByText('portfolio:/projects')
    ).toBeInTheDocument();
    runCommand('help projects');
    expect(
      terminalTranscript().getByText('[HELP: projects]')
    ).toBeInTheDocument();
    runCommand('ls');
    expect(terminalTranscript().getAllByText('[PROJECTS]')).toHaveLength(2);
    runCommand('back');
    runCommand('pwd');
    expect(terminalTranscript().getByText('portfolio:/')).toBeInTheDocument();
    runCommand('clear');
    runCommand('history');
    expect(terminalTranscript().getByText('[HISTORY]')).toBeInTheDocument();
    expect(
      terminalTranscript().getByText(/^1\s+projects$/)
    ).toBeInTheDocument();
    expect(terminalTranscript().getByText(/^8\s+history$/)).toBeInTheDocument();
  });

  it('validates theme and color mode names before invoking setters', () => {
    renderTerminal();
    for (const value of ['minimal', 'engineer', 'cosmic', 'cli']) {
      runCommand(`theme ${value}`);
      expect(setThemeMock).toHaveBeenLastCalledWith(value);
    }
    for (const value of ['light', 'dark', 'system']) {
      runCommand(`mode ${value}`);
      expect(setColorModeMock).toHaveBeenLastCalledWith(value);
    }
    setThemeMock.mockClear();
    setColorModeMock.mockClear();
    for (const command of [
      'theme missing',
      'theme constructor',
      'theme __proto__',
      'theme cosmic extra',
      'mode sepia',
      'mode light extra',
    ]) {
      runCommand(command);
    }
    expect(setThemeMock).not.toHaveBeenCalled();
    expect(setColorModeMock).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
  });

  it('bounds transcript and history while retaining the newest commands', () => {
    renderTerminal();
    const input = screen.getByLabelText('Terminal command input');
    for (let index = 0; index < 105; index += 1) {
      runCommand(`unknown-command-${index}`);
    }
    const transcript = screen.getByRole('region', {
      name: 'Terminal transcript',
    });
    expect(
      transcript.querySelectorAll('.cli-history .cli-line').length
    ).toBeGreaterThan(0);
    expect(
      transcript.querySelectorAll('.cli-history .cli-line').length
    ).toBeLessThanOrEqual(300);
    expect(transcript).not.toHaveTextContent('unknown-command-0');
    expect(transcript).toHaveTextContent('unknown-command-104');
    for (let index = 0; index < 110; index += 1) {
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    }
    expect(input).toHaveValue('unknown-command-5');
  });

  it('covers remaining aliases, numeric menu branches, and unknown numeric fallback', () => {
    renderTerminal();

    runCommand('3');
    expect(terminalTranscript().getByText('[SKILLS]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('4');
    expect(
      terminalTranscript().getByText('[EXPERIENCE & EDUCATION]')
    ).toBeInTheDocument();

    runCommand('menu');
    runCommand('6');
    expect(terminalTranscript().getByText('[CONTACT]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('7');
    expect(terminalTranscript().getByText('[PET DOGS]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('8');
    expect(terminalTranscript().getByText('[RESUME]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('11');
    expect(
      terminalTranscript().getByText('Unknown menu selection: 11')
    ).toBeInTheDocument();

    runCommand('0');
    expect(
      terminalTranscript().queryByText('Unknown menu selection: 11')
    ).not.toBeInTheDocument();

    runCommand('h');
    expect(terminalTranscript().getByText('[HELP]')).toBeInTheDocument();

    runCommand('about');
    expect(terminalTranscript().getByText('[ABOUT]')).toBeInTheDocument();

    runCommand('projects');
    expect(terminalTranscript().getByText('[PROJECTS]')).toBeInTheDocument();

    runCommand('doggos');
    expect(
      terminalTranscript().getAllByText('[PET DOGS]').length
    ).toBeGreaterThan(0);

    runCommand('pets');
    expect(
      terminalTranscript().getAllByText('[PET DOGS]').length
    ).toBeGreaterThan(0);

    runCommand('cv');
    expect(
      terminalTranscript().getAllByText('[RESUME]').length
    ).toBeGreaterThan(0);

    runCommand('cls');
    expect(
      terminalTranscript().queryByText('[RESUME]')
    ).not.toBeInTheDocument();

    runCommand('quit');
    expect(setThemeMock).toHaveBeenCalledWith(defaultTheme);
  });

  it('routes numeric input by active context and supports back navigation in detail views', () => {
    renderTerminal();

    runCommand('projects');
    runCommand('1');
    expect(terminalTranscript().getByText(/\[PROJECT 1\]/)).toBeInTheDocument();
    expect(
      terminalTranscript().getByText(
        'Stack: Angular, TypeScript, NestJS, Prisma, MySQL/MariaDB'
      )
    ).toBeInTheDocument();
    runCommand('back');
    expect(
      terminalTranscript().getAllByText('[PROJECTS]').length
    ).toBeGreaterThan(0);
    runCommand('back');
    runCommand('pwd');
    expect(terminalTranscript().getByText('portfolio:/')).toBeInTheDocument();

    runCommand('skills');
    runCommand('1');
    expect(
      terminalTranscript().getByText('[SKILL CATEGORY 1] Frontend systems')
    ).toBeInTheDocument();
    runCommand('back');
    expect(
      terminalTranscript().getAllByText('[SKILLS]').length
    ).toBeGreaterThan(0);

    runCommand('experience');
    runCommand('1');
    expect(
      terminalTranscript().getByText(
        '[TIMELINE 1] Software Engineer (UI Engineer)'
      )
    ).toBeInTheDocument();
    runCommand('back');
    expect(
      terminalTranscript().getAllByText('[EXPERIENCE & EDUCATION]').length
    ).toBeGreaterThan(0);

    runCommand('dogs');
    runCommand('2');
    expect(terminalTranscript().getByText('[DOG 2] Rosie')).toBeInTheDocument();
    runCommand('back');
    expect(
      terminalTranscript().getAllByText('[PET DOGS]').length
    ).toBeGreaterThan(0);
  });

  it.each([
    {
      title: 'BitStockerz',
      selection: 1,
      status: 'In Development',
      requiredClaims: [
        /recent stored bar closes/,
        /seed mode uses synthetic data/,
        /MySQL\/MariaDB/,
        /adapter is implemented but disabled by default/,
        /Live-provider verification and production launch remain pending/,
      ],
    },
    {
      title: '@jp-design-system',
      selection: 2,
      status: 'Pre-release',
      requiredClaims: [
        /automated interaction and accessibility checks/,
        /packages are tested in a separate application/,
        /prerelease includes stable and preview APIs/,
        /Manual accessibility review and the first public release remain in progress/,
      ],
    },
  ])(
    'keeps $title capabilities and release limits consistent in cards and CLI',
    ({ title, selection, status, requiredClaims }) => {
      const cards = render(<Projects />);
      const article = screen
        .getByRole('heading', { name: title })
        .closest('article');
      if (!article) throw new Error(`Missing ${title} project card`);

      const description = article.querySelector(
        '.project-description'
      )?.textContent;
      if (!description) throw new Error(`Missing ${title} description`);
      for (const claim of requiredClaims) expect(description).toMatch(claim);
      expect(description).not.toMatch(/Track real-time prices|PostgreSQL/);
      expect(within(article).getByText(status)).toBeInTheDocument();
      expect(
        within(article).queryByRole('link', { name: /live demo|on npm/i })
      ).not.toBeInTheDocument();
      const sourceUrl = within(article)
        .getByRole('link', { name: `View ${title} source code` })
        .getAttribute('href');
      const stack = Array.from(
        article.querySelectorAll('.tech-tag'),
        (tag) => tag.textContent
      ).join(', ');
      cards.unmount();

      renderTerminal();
      runCommand('projects');
      expect(
        terminalTranscript().getByText(`${selection}/ ${title} (${status})`)
      ).toHaveAttribute('href', sourceUrl);
      runCommand(`project ${selection}`);
      expect(terminalTranscript().getByText(description)).toBeInTheDocument();
      expect(
        terminalTranscript().getByText(`Type: Featured | Status: ${status}`)
      ).toBeInTheDocument();
      expect(
        terminalTranscript().getByText(`Stack: ${stack}`)
      ).toBeInTheDocument();
      expect(
        terminalTranscript().getByText(`GitHub: ${sourceUrl}`)
      ).toHaveAttribute('href', sourceUrl);
    }
  );

  it('covers github and project detail fallback branches', () => {
    renderTerminal();

    githubState = {
      ...githubState,
      user: {
        login: 'justin',
        name: null,
        public_repos: 42,
        followers: 8,
        following: 2,
      },
      repos: [],
      pinnedRepos: [],
      contributions: null,
      loading: false,
      error: null,
    };
    runCommand('github');
    expect(
      terminalTranscript().getByText('justin (@justin)')
    ).toBeInTheDocument();
    expect(
      terminalTranscript().queryByText(/Contributions \(last year\):/i)
    ).not.toBeInTheDocument();
    expect(
      terminalTranscript().queryByText('Top repositories:')
    ).not.toBeInTheDocument();
    expect(
      terminalTranscript().getByText(
        /Contribution history is temporarily unavailable/
      )
    ).toBeInTheDocument();

    githubState = {
      ...githubState,
      user: {
        login: 'justin',
        name: 'Justin',
        public_repos: 42,
        followers: 8,
        following: 2,
      },
      pinnedRepos: [{ name: 'pinned-a', stargazerCount: 77 }],
      repos: [{ name: 'repo-a', stargazers_count: 10 }],
      contributions: { totalContributions: 123, weeks: [] },
    };
    runCommand('github');
    expect(
      terminalTranscript().getByText('- pinned-a (77 stars)')
    ).toBeInTheDocument();

    runCommand('project 5');
    expect(
      terminalTranscript().getByText('[PROJECT 5] SideQuest: Pittsburgh')
    ).toBeInTheDocument();
    expect(terminalTranscript().getByText('Type: Other')).toBeInTheDocument();
    expect(
      terminalTranscript().getByText('Repository: Private')
    ).toBeInTheDocument();
  });

  it('handles whitespace input and missing dog stat fallback state', () => {
    dogsState = [{ name: 'Nala', stats: { treats: 1, scritches: 2 } }];
    renderTerminal();

    const priorInputLines =
      document.querySelectorAll('.cli-line--input').length;
    runCommand('   ');
    expect(document.querySelectorAll('.cli-line--input').length).toBe(
      priorInputLines
    );
    expect(terminalTranscript().queryByText('[ABOUT]')).not.toBeInTheDocument();

    runCommand('dogs');
    expect(
      terminalTranscript().getByText('2/ Rosie | Treats: 0 | Scritches: 0')
    ).toBeInTheDocument();
    expect(
      terminalTranscript().getByText('3/ Tito | Treats: 0 | Scritches: 0')
    ).toBeInTheDocument();
  });
});

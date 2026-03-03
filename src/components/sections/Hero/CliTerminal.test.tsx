import { fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CliTerminal from './CliTerminal';
import { defaultTheme } from '@/config/themes';

const setThemeMock = vi.fn();
const updateDogStatsMock = vi.fn();

let breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
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
  }),
}));

vi.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => breakpoint,
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
    screen.getByText(/Use panel options or type a number\/command./i)
  ).toBeInTheDocument();
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
    breakpoint = 'md';
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

    vi.spyOn(window, 'setTimeout').mockImplementation(((
      callback: TimerHandler
    ) => {
      if (typeof callback === 'function') {
        callback();
      }
      return 1 as unknown as number;
    }) as typeof window.setTimeout);
    vi.spyOn(window, 'clearTimeout').mockImplementation(() => {});
  });

  it('covers menu numerics, aliases, help, clear, unknown and exit', () => {
    renderTerminal();

    runCommand('1');
    expect(screen.getByText('[ABOUT]')).toBeInTheDocument();

    runCommand('2');
    expect(screen.getByText('[PROJECTS]')).toBeInTheDocument();

    runCommand('skills');
    expect(screen.getByText('[SKILLS]')).toBeInTheDocument();

    runCommand('experience');
    expect(screen.getByText('[EXPERIENCE & EDUCATION]')).toBeInTheDocument();

    runCommand('9');
    expect(screen.getByText('[HELP]')).toBeInTheDocument();

    runCommand('totally-unknown');
    expect(screen.getByText('Type 9 for help.')).toBeInTheDocument();

    runCommand('menu');
    expect(screen.getByText('[HELP]')).toBeInTheDocument();

    runCommand('clear');
    expect(screen.queryByText('[HELP]')).not.toBeInTheDocument();

    runCommand('exit');
    expect(setThemeMock).toHaveBeenCalledWith(defaultTheme);
  });

  it('covers project, skill, and experience drill-ins including invalid inputs', () => {
    renderTerminal();

    runCommand('project');
    expect(screen.getByText('[PROJECTS]')).toBeInTheDocument();

    runCommand('project abc');
    expect(screen.getByText('Usage: project <number>')).toBeInTheDocument();

    runCommand('project 99');
    expect(screen.getByText('Project 99 not found.')).toBeInTheDocument();

    runCommand('project 1');
    expect(screen.getByText(/\[PROJECT 1\]/)).toBeInTheDocument();

    runCommand('skill');
    expect(screen.getByText('[SKILLS]')).toBeInTheDocument();

    runCommand('skill abc');
    expect(screen.getByText('Usage: skill <number>')).toBeInTheDocument();

    runCommand('skill 5');
    expect(screen.getByText('[SKILL CATEGORY 5] Other')).toBeInTheDocument();

    runCommand('skill 99');
    expect(
      screen.getByText('Skill category 99 not found.')
    ).toBeInTheDocument();

    runCommand('exp');
    expect(screen.getByText('[EXPERIENCE & EDUCATION]')).toBeInTheDocument();

    runCommand('exp abc');
    expect(screen.getByText('Usage: exp <number>')).toBeInTheDocument();

    runCommand('exp 99');
    expect(
      screen.getByText('Experience entry 99 not found.')
    ).toBeInTheDocument();
  });

  it('covers dog listing, details, actions and validation errors', () => {
    renderTerminal();

    runCommand('dog');
    expect(screen.getByText('[PET DOGS]')).toBeInTheDocument();

    runCommand('dog x');
    expect(
      screen.getByText('Usage: dog <number> [treat|scritch]')
    ).toBeInTheDocument();

    runCommand('dog 9');
    expect(screen.getByText('Dog 9 not found.')).toBeInTheDocument();

    runCommand('dog 1');
    expect(screen.getByText('[DOG 1] Nala (Foster)')).toBeInTheDocument();

    runCommand('dog 1 treat');
    expect(updateDogStatsMock).toHaveBeenCalledWith('Nala', 'treats');
    expect(screen.getByText(/Nala got a treat/)).toBeInTheDocument();

    runCommand('dog 2 scritch');
    expect(updateDogStatsMock).toHaveBeenCalledWith('Rosie', 'scritches');
    expect(screen.getByText(/Rosie got scritches/)).toBeInTheDocument();

    runCommand('dog 2 dance');
    expect(screen.getByText(/Unknown dog action/)).toBeInTheDocument();

    runCommand('dog 9 treat');
    expect(screen.getAllByText('Dog 9 not found.').length).toBeGreaterThan(0);
  });

  it('covers github states and contact/resume output', () => {
    renderTerminal();

    runCommand('gh');
    expect(screen.getByText('[GITHUB]')).toBeInTheDocument();

    githubState = { ...githubState, error: 'down' };
    runCommand('gh');
    expect(
      screen.getByText(/Unable to load live GitHub data right now/)
    ).toBeInTheDocument();

    githubState = { ...githubState, error: null, loading: true, user: null };
    runCommand('5');
    expect(screen.getByText(/Fetching live GitHub stats/)).toBeInTheDocument();

    githubState = { ...githubState, loading: false, user: null };
    runCommand('5');
    expect(
      screen.getByText(/GitHub profile data is currently unavailable/)
    ).toBeInTheDocument();

    runCommand('contact');
    expect(screen.getByText('[CONTACT]')).toBeInTheDocument();

    runCommand('resume');
    expect(screen.getByText('[RESUME]')).toBeInTheDocument();
  });

  it('covers compact layout controls and keyboard helpers', () => {
    breakpoint = 'xs';
    renderTerminal();

    fireEvent.click(
      screen.getByRole('button', { name: 'Run selected option' })
    );
    expect(screen.getByText('[ABOUT]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous list' }));
    expect(
      screen.getByText(/Use panel options or type a number\/command./i)
    ).toBeInTheDocument();

    const input = screen.getByLabelText(/terminal command input/i);
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    fireEvent.keyDown(input, { key: ' ' });
    fireEvent.keyDown(input, { key: '2', code: 'Digit2' });
    fireEvent.keyDown(input, { key: 'Unidentified', code: 'Numpad3' });

    expect(input).toHaveValue('3');

    fireEvent.change(input, { target: { value: 'project 1' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('project 1');

    const session = screen.getByRole('button', { name: 'Focus command input' });
    session.focus();
    fireEvent.keyDown(session, { key: 'Enter' });
    fireEvent.keyDown(session, { key: ' ' });
    expect(input).toHaveFocus();
  });

  it('supports option click staging and close button behavior', () => {
    renderTerminal();

    const optionButton = screen.getByRole('button', { name: /2\.Projects/i });
    fireEvent.click(optionButton);

    const input = screen.getByLabelText(/terminal command input/i);
    expect(input).toHaveValue('2');

    fireEvent.click(
      screen.getByRole('button', {
        name: `Exit CLI and switch to ${defaultTheme} theme`,
      })
    );
    expect(setThemeMock).toHaveBeenCalledWith(defaultTheme);
  });

  it('covers remaining aliases, numeric menu branches, and unknown numeric fallback', () => {
    renderTerminal();

    runCommand('3');
    expect(screen.getByText('[SKILLS]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('4');
    expect(screen.getByText('[EXPERIENCE & EDUCATION]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('6');
    expect(screen.getByText('[CONTACT]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('7');
    expect(screen.getByText('[PET DOGS]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('8');
    expect(screen.getByText('[RESUME]')).toBeInTheDocument();

    runCommand('menu');
    runCommand('11');
    expect(screen.getByText('Unknown menu selection: 11')).toBeInTheDocument();

    runCommand('0');
    expect(
      screen.queryByText('Unknown menu selection: 11')
    ).not.toBeInTheDocument();

    runCommand('h');
    expect(screen.getByText('[HELP]')).toBeInTheDocument();

    runCommand('about');
    expect(screen.getByText('[ABOUT]')).toBeInTheDocument();

    runCommand('projects');
    expect(screen.getByText('[PROJECTS]')).toBeInTheDocument();

    runCommand('doggos');
    expect(screen.getAllByText('[PET DOGS]').length).toBeGreaterThan(0);

    runCommand('pets');
    expect(screen.getAllByText('[PET DOGS]').length).toBeGreaterThan(0);

    runCommand('cv');
    expect(screen.getAllByText('[RESUME]').length).toBeGreaterThan(0);

    runCommand('cls');
    expect(screen.queryByText('[RESUME]')).not.toBeInTheDocument();

    runCommand('quit');
    expect(setThemeMock).toHaveBeenCalledWith(defaultTheme);
  });

  it('routes numeric input by active context and supports prev navigation in detail views', () => {
    breakpoint = 'xs';
    renderTerminal();

    runCommand('projects');
    runCommand('1');
    expect(screen.getByText(/\[PROJECT 1\]/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous list' }));
    expect(screen.getAllByText('[PROJECTS]').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Previous list' }));
    expect(
      screen.getAllByText(/Use panel options or type a number\/command./i)
        .length
    ).toBeGreaterThan(0);

    runCommand('skills');
    runCommand('1');
    expect(screen.getByText('[SKILL CATEGORY 1] Frontend')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous list' }));
    expect(screen.getAllByText('[SKILLS]').length).toBeGreaterThan(0);

    runCommand('experience');
    runCommand('1');
    expect(screen.getByText('[TIMELINE 1] UI Engineer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous list' }));
    expect(
      screen.getAllByText('[EXPERIENCE & EDUCATION]').length
    ).toBeGreaterThan(0);

    runCommand('dogs');
    runCommand('2');
    expect(screen.getByText('[DOG 2] Rosie')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous list' }));
    expect(screen.getAllByText('[PET DOGS]').length).toBeGreaterThan(0);
  });

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
    expect(screen.getByText('justin (@justin)')).toBeInTheDocument();
    expect(
      screen.queryByText(/Contributions \(last year\):/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Top repositories:')).not.toBeInTheDocument();

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
    expect(screen.getByText('- pinned-a (77 stars)')).toBeInTheDocument();

    runCommand('project 4');
    expect(
      screen.getByText('[PROJECT 4] SideQuest: Pittsburgh')
    ).toBeInTheDocument();
    expect(screen.getByText('Type: Other')).toBeInTheDocument();
    expect(screen.getByText('Repository: Private')).toBeInTheDocument();
  });

  it('handles whitespace input and missing dog stat fallback state', () => {
    dogsState = [{ name: 'Nala', stats: { treats: 1, scritches: 2 } }];
    renderTerminal();

    const priorInputLines =
      document.querySelectorAll('.cli-line--input').length;
    runCommand('   ');
    expect(document.querySelectorAll('.cli-line--input').length).toBe(
      priorInputLines + 1
    );
    expect(screen.getByText('[ABOUT]')).toBeInTheDocument();

    runCommand('dogs');
    expect(
      screen.getByText('2. Rosie | Treats: 0 | Scritches: 0')
    ).toBeInTheDocument();
    expect(
      screen.getByText('3. Tito | Treats: 0 | Scritches: 0')
    ).toBeInTheDocument();
  });
});

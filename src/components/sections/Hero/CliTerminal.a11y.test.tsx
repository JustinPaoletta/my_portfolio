import { render, screen } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CliTerminal from './CliTerminal';

const setThemeMock = vi.fn();
const updateDogStatsMock = vi.fn();

let breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
let dogsState = [
  { name: 'Nala', stats: { treats: 1, scritches: 2 } },
  { name: 'Rosie', stats: { treats: 3, scritches: 4 } },
  { name: 'Tito', stats: { treats: 5, scritches: 6 } },
];

let githubState = {
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

describe('CLI terminal accessibility', () => {
  beforeEach(() => {
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

  it('has no violations for the interactive terminal shell', async () => {
    const { container } = render(<CliTerminal />);

    expect(
      screen.getByText(/Use panel options or type a number\/command./i)
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

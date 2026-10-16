import { fireEvent, render, screen } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/hooks/useTheme';
import CliTerminal from './CliTerminal';

const updateDogStatsMock = vi.fn();

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

vi.mock('@/hooks/usePetDogs', () => ({
  usePetDogs: () => [dogsState, updateDogStatsMock],
}));

vi.mock('@/hooks/useGitHub', () => ({
  useGitHub: () => githubState,
}));

describe('CLI terminal accessibility', () => {
  beforeEach(() => {
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

  it('has no violations for the interactive terminal shell', async () => {
    const { container } = render(
      <ThemeProvider>
        <CliTerminal />
      </ThemeProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Justin Paoletta', level: 1 })
    ).toBeInTheDocument();
    const transcript = screen.getByRole('region', {
      name: 'Terminal transcript',
    });
    expect(transcript).not.toHaveAttribute('aria-live');
    expect(screen.queryByRole('log')).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    const input = screen.getByLabelText('Terminal command input');
    fireEvent.change(input, { target: { value: 'resume' } });
    fireEvent.submit(input.closest('form')!);
    expect(
      screen.getByRole('link', { name: 'Download resume as PDF' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
    expect(await axe(container)).toHaveNoViolations();
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, act, waitFor } from '@/test/test-utils';
import App from './App';

const mockDogStats = {
  Nala: { treats: 0, scritches: 0 },
  Rosie: { treats: 0, scritches: 0 },
  Tito: { treats: 0, scritches: 0 },
};

const mockContributionCalendar = {
  totalContributions: 6,
  weeks: [
    {
      contributionDays: [
        {
          contributionCount: 0,
          date: '2026-02-22',
          color: '#161b22',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 1,
          date: '2026-02-23',
          color: '#0e4429',
          contributionLevel: 'FIRST_QUARTILE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-02-24',
          color: '#161b22',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 2,
          date: '2026-02-25',
          color: '#006d32',
          contributionLevel: 'SECOND_QUARTILE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-02-26',
          color: '#161b22',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 3,
          date: '2026-02-27',
          color: '#26a641',
          contributionLevel: 'THIRD_QUARTILE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-02-28',
          color: '#161b22',
          contributionLevel: 'NONE' as const,
        },
      ],
    },
  ],
};

const mockGitHubUser = {
  login: 'JustinPaoletta',
  id: 1,
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  html_url: 'https://github.com/JustinPaoletta',
  name: 'Justin Paoletta',
  company: null,
  blog: '',
  location: null,
  email: null,
  bio: null,
  public_repos: 10,
  public_gists: 0,
  followers: 23,
  following: 1,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockGitHubRepos = [
  {
    id: 101,
    name: 'my-portfolio',
    full_name: 'JustinPaoletta/my-portfolio',
    html_url: 'https://github.com/JustinPaoletta/my-portfolio',
    description: 'Portfolio',
    fork: false,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    pushed_at: '2026-01-01T00:00:00Z',
    homepage: null,
    stargazers_count: 12,
    watchers_count: 12,
    forks_count: 2,
    language: 'TypeScript',
    topics: [],
    default_branch: 'main',
  },
];

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        const method = (
          init?.method ?? (input instanceof Request ? input.method : 'GET')
        ).toUpperCase();

        const jsonResponse = (
          body: unknown,
          status = 200,
          headers: Record<string, string> = {}
        ): Response =>
          new Response(JSON.stringify(body), {
            status,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          });

        if (requestUrl.includes('/api/pet-dogs')) {
          if (method === 'POST') {
            return jsonResponse({ ok: true });
          }
          return jsonResponse({ stats: mockDogStats });
        }

        if (requestUrl.includes('/api/github')) {
          return jsonResponse({
            contributions: mockContributionCalendar,
            pinnedRepos: [],
          });
        }

        if (requestUrl.includes('https://api.github.com/users/')) {
          if (requestUrl.includes('/repos')) {
            return jsonResponse(mockGitHubRepos);
          }
          return jsonResponse(mockGitHubUser);
        }

        throw new Error(`Unhandled fetch URL in App.test.tsx: ${requestUrl}`);
      })
    );
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the heading with app title from env', async () => {
    await act(async () => {
      render(<App />);
    });
    // App title comes from environment variable VITE_APP_TITLE
    // In tests, this is set to "Test App" via vitest.config.ts defaults
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/./); // Ensures heading has some text
  });

  it('renders the JP image with correct attributes', async () => {
    await act(async () => {
      render(<App />);
    });

    const jpImage = screen.getByAltText(/Justin working on code/i);
    expect(jpImage).toBeInTheDocument();
    expect(jpImage).toHaveAttribute('width', '400');
    expect(jpImage).toHaveAttribute('height', '400');
    expect(jpImage).toHaveAttribute('src', '/branding/jp-headshot/jp-400.webp');
  });

  it('renders skip link for keyboard navigation', async () => {
    await act(async () => {
      render(<App />);
    });

    const skipLink = screen.getByRole('link', {
      name: /skip to main content/i,
    });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
  });

  it('renders semantic HTML structure', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(
      screen.getByRole('navigation', { name: /main navigation/i })
    ).toBeInTheDocument(); // main nav
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });

  it('has no footer in CLI view', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });

    const themeToggle = screen.getByRole('button', {
      name: /toggle theme switcher/i,
    });
    await user.click(themeToggle);

    const cliOption = screen.getByRole('option', { name: /CLI/i });
    await user.click(cliOption);

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('CLI Enter submits typed command', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    const themeToggle = screen.getByRole('button', {
      name: /toggle theme switcher/i,
    });
    await user.click(themeToggle);

    const cliOption = screen.getByRole('option', { name: /CLI/i });
    await user.click(cliOption);

    const input = await screen.findByLabelText(/terminal command input/i);
    await user.click(input);
    await user.type(input, '9{Enter}');

    await screen.findByText('[HELP]');
    expect(input).toHaveValue('');
  });

  it('CLI container Enter still focuses input', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    const themeToggle = screen.getByRole('button', {
      name: /toggle theme switcher/i,
    });
    await user.click(themeToggle);

    const cliOption = screen.getByRole('option', { name: /CLI/i });
    await user.click(cliOption);

    const sessionContainer = screen.getByRole('button', {
      name: /focus command input/i,
    });
    const input = await screen.findByLabelText(/terminal command input/i);

    sessionContainer.focus();
    expect(sessionContainer).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(input).toHaveFocus();
  });

  it('Cosmic startup attempts autoplay from persisted theme', async () => {
    localStorage.setItem('portfolio-theme', 'cosmic');

    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(playSpy).toHaveBeenCalled();
    });

    const heroBackground = document.querySelector('.hero-background');
    expect(heroBackground).toBeInTheDocument();
    expect(heroBackground).toHaveAttribute('data-cosmic-theme', 'true');
    expect(heroBackground).toHaveAttribute('data-cosmic-video-ready', 'false');

    const cosmicFallback = document.querySelector('.hero-cosmic-fallback');
    expect(cosmicFallback).toBeInTheDocument();
    const cosmicStill = document.querySelector('.hero-cosmic-still');
    expect(cosmicStill).toBeInTheDocument();
    expect(cosmicStill).toHaveAttribute(
      'src',
      '/images/hero/cosmic/cosmos-first-frame.webp'
    );
    expect(document.querySelector('.nebula-layer-1')).toBeInTheDocument();

    const cosmicVideo = document.querySelector('.hero-cosmic-video');
    expect(cosmicVideo).toBeInTheDocument();
    expect(cosmicVideo).toHaveAttribute('src', '/video/cosmos.mp4');
    expect(cosmicVideo).not.toHaveAttribute('poster');
    if (!cosmicVideo) {
      throw new Error('Expected cosmic video element to exist');
    }

    await act(async () => {
      cosmicVideo.dispatchEvent(new Event('playing'));
    });

    expect(heroBackground).toHaveAttribute('data-cosmic-video-ready', 'true');
  });

  it('Cosmic retries autoplay after initial block', async () => {
    localStorage.setItem('portfolio-theme', 'cosmic');

    let callCount = 0;
    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => {
        callCount += 1;
        if (callCount === 1) {
          return Promise.reject(new Error('autoplay blocked'));
        }
        return Promise.resolve(undefined);
      });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    const heroBackground = document.querySelector('.hero-background');
    expect(heroBackground).toBeInTheDocument();
    expect(heroBackground).toHaveAttribute('data-cosmic-theme', 'true');
    expect(heroBackground).toHaveAttribute('data-cosmic-video-ready', 'false');

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    await waitFor(() => {
      expect(playSpy.mock.calls.length).toBeGreaterThan(1);
    });

    expect(heroBackground).toHaveAttribute('data-cosmic-video-ready', 'false');

    const cosmicVideo = document.querySelector('.hero-cosmic-video');
    expect(cosmicVideo).toBeInTheDocument();
    if (!cosmicVideo) {
      throw new Error('Expected cosmic video element to exist');
    }
    await act(async () => {
      cosmicVideo.dispatchEvent(new Event('playing'));
    });

    expect(heroBackground).toHaveAttribute('data-cosmic-video-ready', 'true');
  });
});

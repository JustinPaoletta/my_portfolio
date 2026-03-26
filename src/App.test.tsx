import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, act, waitFor } from '@/test/test-utils';
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
    vi.stubGlobal(
      'requestIdleCallback',
      (callback: IdleRequestCallback): number =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 50,
            } as IdleDeadline),
          0
        )
    );
    vi.stubGlobal('cancelIdleCallback', (handle: number): void => {
      window.clearTimeout(handle);
    });
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

    const jpImage = await screen.findByAltText(
      /Justin Paoletta working on code/i
    );
    expect(jpImage).toBeInTheDocument();
    expect(jpImage).toHaveAttribute('width', '400');
    expect(jpImage).toHaveAttribute('height', '400');
    expect(jpImage).toHaveAttribute('src', '/branding/jp-headshot/jp-400.webp');
  });

  it('renders skip link for keyboard navigation', async () => {
    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    await act(async () => {
      render(<App />);
    });

    const skipLink = screen.getByRole('link', {
      name: /skip to main content/i,
    });
    const main = screen.getByRole('main');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');

    fireEvent.click(skipLink);

    expect(main).toHaveFocus();
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('renders semantic HTML structure', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(
      await screen.findByRole('navigation', { name: /main navigation/i })
    ).toBeInTheDocument(); // main nav
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(await screen.findByRole('contentinfo')).toBeInTheDocument(); // footer
  });

  it('does not mount deferred data sections or fetch them before intersection', async () => {
    await act(async () => {
      render(<App />);
    });

    await screen.findByRole('heading', { name: /My Projects/i });

    expect(document.getElementById('github')).not.toBeInTheDocument();
    expect(document.getElementById('pet-dogs')).not.toBeInTheDocument();

    const fetchCalls = vi
      .mocked(fetch)
      .mock.calls.map(([input]) =>
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url
      );

    expect(fetchCalls.some((url) => url.includes('/api/github'))).toBe(false);
    expect(fetchCalls.some((url) => url.includes('/api/pet-dogs'))).toBe(false);
  });

  it('has no footer in CLI view', async () => {
    localStorage.setItem('portfolio-theme', 'cli');
    await act(async () => {
      render(<App />);
    });

    await screen.findByLabelText(/terminal command input/i);

    await waitFor(() => {
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    });
  });

  it('CLI Enter submits typed command', async () => {
    const user = userEvent.setup();
    localStorage.setItem('portfolio-theme', 'cli');

    await act(async () => {
      render(<App />);
    });

    const input = await screen.findByLabelText(/terminal command input/i);
    await user.click(input);
    await user.type(input, '9{Enter}');

    await screen.findByText(/\[HELP\]/, undefined, { timeout: 3000 });
    expect(input).toHaveValue('');
  });

  it('CLI input exposes the keyboard shortcuts hint', async () => {
    localStorage.setItem('portfolio-theme', 'cli');

    await act(async () => {
      render(<App />);
    });

    const input = await screen.findByLabelText(/terminal command input/i);
    expect(input).toHaveAttribute('aria-describedby', 'cli-keyboard-shortcuts');
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

    const cosmicStill = document.querySelector('.hero-cosmic-still');
    expect(cosmicStill).toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector('.hero-cosmic-video')).toBeInTheDocument();
    });
    const cosmicVideo = document.querySelector('.hero-cosmic-video');
    expect(cosmicVideo).toHaveAttribute(
      'poster',
      '/images/hero/cosmic/cosmos-first-frame.webp'
    );
    expect(cosmicVideo).toHaveAttribute('preload', 'metadata');
    const cosmicVideoSource = cosmicVideo?.querySelector('source');
    expect(cosmicVideoSource).toHaveAttribute('src', '/video/cosmos.mp4');
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

    await waitFor(() => {
      expect(document.querySelector('.hero-cosmic-video')).toBeInTheDocument();
    });
    const cosmicVideo = document.querySelector('.hero-cosmic-video');
    if (!cosmicVideo) {
      throw new Error('Expected cosmic video element to exist');
    }
    await act(async () => {
      cosmicVideo.dispatchEvent(new Event('playing'));
    });

    expect(heroBackground).toHaveAttribute('data-cosmic-video-ready', 'true');
  });
});

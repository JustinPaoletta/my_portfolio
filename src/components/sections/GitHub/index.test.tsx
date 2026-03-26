import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import GitHub from '.';

let isInView = true;
interface GitHubSectionState {
  user: {
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
    public_repos: number;
    followers: number;
    following: number;
  } | null;
  contributions: {
    totalContributions: number;
    weeks: unknown[];
  } | null;
  loading: boolean;
  error: string | null;
}

let githubState: GitHubSectionState = {
  user: {
    login: 'justin',
    name: 'Justin',
    avatar_url: 'https://example.com/avatar.png',
    html_url: 'https://github.com/justin',
    public_repos: 42,
    followers: 8,
    following: 2,
  },
  contributions: {
    totalContributions: 123,
    weeks: [],
  },
  loading: false,
  error: null as string | null,
};

vi.mock('@/hooks/useGitHub', () => ({
  useGitHub: () => githubState,
}));

vi.mock('./ContributionGraph', () => ({
  default: (props: { loading: boolean; isVisible: boolean }) => (
    <div
      data-testid="contribution-graph"
      data-loading={props.loading ? 'true' : 'false'}
      data-visible={props.isVisible ? 'true' : 'false'}
    />
  ),
}));

vi.mock('@/components/Reveal', async () => {
  const React = await import('react');
  return {
    Reveal: React.forwardRef<
      HTMLElement,
      React.HTMLAttributes<HTMLElement> & {
        as?: keyof HTMLElementTagNameMap;
        visible?: boolean;
        delay?: number;
        effect?: string;
      }
    >(
      (
        {
          as: Tag = 'div',
          children,
          visible: _visible,
          delay: _delay,
          effect: _effect,
          ...props
        },
        ref
      ) => React.createElement(Tag, { ref, ...props }, children)
    ),
    useRevealInView: () => isInView,
  };
});

describe('GitHub section', () => {
  it('renders profile stats, contribution graph, and CTA', () => {
    isInView = true;
    githubState = {
      user: {
        login: 'justin',
        name: 'Justin',
        avatar_url: 'https://example.com/avatar.png',
        html_url: 'https://github.com/justin',
        public_repos: 42,
        followers: 8,
        following: 2,
      },
      contributions: {
        totalContributions: 123,
        weeks: [],
      },
      loading: false,
      error: null,
    };
    render(<GitHub />);

    expect(
      screen.getByRole('heading', { name: 'GitHub Activity' })
    ).toBeInTheDocument();
    expect(screen.getByText('Justin')).toBeInTheDocument();
    expect(screen.getByText('@justin')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByTestId('contribution-graph')).toHaveAttribute(
      'data-visible',
      'true'
    );
    expect(
      screen.getByRole('link', { name: 'View Full Profile on GitHub' })
    ).toHaveAttribute('href', 'https://github.com/justin');
  });

  it('renders loading and error states while hiding missing profile data branches', () => {
    isInView = false;
    githubState = {
      user: null,
      contributions: null,
      loading: true,
      error: 'down',
    };
    render(<GitHub />);

    expect(
      screen.getByText('Unable to load GitHub data. Please try again later.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Loading GitHub data')).toBeInTheDocument();
    expect(screen.queryByTestId('contribution-graph')).not.toBeInTheDocument();
  });

  it('falls back to login when name is missing', () => {
    isInView = true;
    githubState = {
      user: {
        login: 'justin',
        name: null,
        avatar_url: 'https://example.com/avatar.png',
        html_url: 'https://github.com/justin',
        public_repos: 10,
        followers: 1,
        following: 1,
      },
      contributions: null,
      loading: false,
      error: null,
    };
    render(<GitHub />);

    expect(screen.getByText('justin')).toBeInTheDocument();
    expect(screen.getByAltText("justin's avatar")).toBeInTheDocument();
    expect(screen.queryByText('Contributions')).not.toBeInTheDocument();
  });
});

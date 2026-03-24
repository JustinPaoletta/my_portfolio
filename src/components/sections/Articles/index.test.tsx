import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import Articles from '.';

let isInView = true;

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionFactory = (tag: keyof HTMLElementTagNameMap) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children)
    );

  return {
    motion: {
      header: motionFactory('header'),
      span: motionFactory('span'),
      h2: motionFactory('h2'),
      p: motionFactory('p'),
      div: motionFactory('div'),
      article: motionFactory('article'),
      a: motionFactory('a'),
    },
    useInView: () => isInView,
  };
});

describe('Articles section', () => {
  it('renders LinkedIn article content and profile CTA', () => {
    isInView = true;
    render(<Articles />);

    expect(
      screen.getByRole('heading', { name: 'LinkedIn Articles' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'The Two Competing Ideas in Agentic Coding',
      })
    ).toHaveAttribute(
      'href',
      'https://www.linkedin.com/pulse/two-competing-ideas-agentic-coding-justin-paoletta-acezc'
    );
    expect(screen.getByText('4 min read')).toBeInTheDocument();
    expect(screen.getByText('Feb 18, 2026')).toBeInTheDocument();
    expect(screen.getByText('Agentic Coding')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'The Two Competing Ideas in Agentic Coding article cover',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Read The Two Competing Ideas in Agentic Coding on LinkedIn',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View more on LinkedIn' })
    ).toHaveAttribute('href', 'https://www.linkedin.com/in/justin-paoletta/');
  });

  it('still renders article content when hidden animation state is active', () => {
    isInView = false;
    render(<Articles />);

    expect(screen.getByText(/explicit constraints/i)).toBeInTheDocument();
    expect(screen.getByText(/architectural coherence/i)).toBeInTheDocument();
  });
});

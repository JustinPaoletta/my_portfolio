import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Articles from '.';

describe('Articles section', () => {
  it('renders LinkedIn article content and profile CTA', () => {
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

  it('renders article content consistently', () => {
    render(<Articles />);

    expect(screen.getByText(/explicit constraints/i)).toBeInTheDocument();
    expect(screen.getByText(/architectural coherence/i)).toBeInTheDocument();
  });
});

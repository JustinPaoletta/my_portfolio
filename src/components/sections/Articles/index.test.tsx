import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Articles from '.';

describe('Articles section', () => {
  it('renders the most recent LinkedIn article by default', () => {
    render(<Articles />);

    expect(
      screen.getByRole('heading', { name: 'LinkedIn Articles' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'A Case for using less AI while Programming',
      })
    ).toHaveAttribute(
      'href',
      'https://www.linkedin.com/pulse/case-using-less-ai-while-programming-justin-paoletta-ww3dc'
    );
    expect(screen.getByText('3 min read')).toBeInTheDocument();
    expect(screen.getByText('Jul 7, 2026')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'A Case for using less AI while Programming article cover',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Read A Case for using less AI while Programming on LinkedIn',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View more on LinkedIn' })
    ).toHaveAttribute('href', 'https://www.linkedin.com/in/justin-paoletta/');
    expect(screen.getByText('Article 1 of 2')).toBeInTheDocument();
  });

  it('navigates between articles with carousel controls', async () => {
    const user = userEvent.setup();

    render(<Articles />);

    expect(
      screen.getByRole('link', {
        name: 'A Case for using less AI while Programming',
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'The Two Competing Ideas in Agentic Coding',
      })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next article' }));

    expect(screen.getByText('Article 2 of 2')).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'Previous article' }));

    expect(screen.getByText('Article 1 of 2')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'A Case for using less AI while Programming',
      })
    ).toBeInTheDocument();
  });

  it('renders article content consistently', () => {
    render(<Articles />);

    expect(
      screen.getByText(/predictable work belongs in scripts/i)
    ).toBeInTheDocument();
  });
});

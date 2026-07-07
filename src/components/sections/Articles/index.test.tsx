import { render, screen, within } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LINKEDIN_ARTICLES } from '@/content/site';
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

  it('associates each carousel tab with a persistent tabpanel', () => {
    const { container } = render(<Articles />);

    const tablist = screen.getByRole('tablist', { name: 'Select article' });
    const tabs = within(tablist).getAllByRole('tab');

    expect(tabs).toHaveLength(LINKEDIN_ARTICLES.length);

    for (const tab of tabs) {
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(
        container.querySelector(`#${CSS.escape(panelId ?? '')}`)
      ).toBeInTheDocument();
    }

    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(
      LINKEDIN_ARTICLES.length
    );
  });

  it('exposes carousel region semantics and live slide counter', () => {
    render(<Articles />);

    const carousel = screen.getByRole('region', { name: 'Article slides' });

    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getByText('Article 1 of 2')).toHaveAttribute(
      'aria-live',
      'polite'
    );
    expect(screen.getByText('Article 1 of 2')).toHaveAttribute(
      'aria-atomic',
      'true'
    );
  });

  it('disables boundary navigation buttons and keeps only the active panel visible', () => {
    render(<Articles />);

    expect(
      screen.getByRole('button', { name: 'Previous article' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next article' })).toBeEnabled();

    const tabpanels = screen.getAllByRole('tabpanel', { hidden: true });
    const visiblePanels = tabpanels.filter(
      (panel) => !panel.hasAttribute('hidden')
    );

    expect(visiblePanels).toHaveLength(1);
    expect(visiblePanels[0]).toHaveAttribute(
      'id',
      `article-slide-${LINKEDIN_ARTICLES[0].id}`
    );
  });

  it('navigates directly to an article with dot tabs', async () => {
    const user = userEvent.setup();

    render(<Articles />);

    const secondArticle = LINKEDIN_ARTICLES[1];
    const secondTab = screen.getByRole('tab', {
      name: `Show ${secondArticle.title}`,
    });

    expect(secondTab).toHaveAttribute('aria-selected', 'false');
    expect(secondTab).toHaveAttribute('tabindex', '-1');

    await user.click(secondTab);

    expect(screen.getByText('Article 2 of 2')).toBeInTheDocument();
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    expect(secondTab).toHaveAttribute('tabindex', '0');
    expect(
      screen.getByRole('link', { name: secondArticle.title })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Previous article' })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next article' })).toBeDisabled();
  });

  it('renders article content consistently', () => {
    render(<Articles />);

    expect(
      screen.getByText(/predictable work belongs in scripts/i)
    ).toBeInTheDocument();
  });
});

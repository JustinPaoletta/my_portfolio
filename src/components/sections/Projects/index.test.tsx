import { fireEvent, render, screen, within } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Projects from '.';

describe('Projects section', () => {
  it('renders main projects and games with status/private branches', () => {
    render(<Projects />);

    expect(
      screen.getByRole('heading', { name: 'Projects' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Games' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'More Projects' })).toBeNull();
    const games = screen.getByRole('group', { name: 'Games' });
    expect(within(games).getAllByRole('article')).toHaveLength(1);
    expect(
      within(games).getByRole('heading', { name: 'SQUARK' })
    ).toBeInTheDocument();
    const sideQuest = screen
      .getByRole('heading', { name: 'SideQuest: Pittsburgh', level: 3 })
      .closest('article')!;
    expect(sideQuest).toHaveClass('featured-project');
    expect(sideQuest.querySelector('.project-content')).toBeInTheDocument();
    expect(
      within(sideQuest).getByLabelText('Project testing')
    ).toBeInTheDocument();
    expect(
      within(sideQuest).getByRole('group', { name: 'SideQuest app screens' })
    ).toBeInTheDocument();

    expect(screen.getAllByLabelText('Project in development').length).toBe(1);
    expect(screen.getByLabelText('Project pre-release')).toBeInTheDocument();

    expect(
      screen.getByLabelText('SideQuest: Pittsburgh repository is private')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Plexarr repository is private')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'View BitStockerz source code' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View @jp-design-system source code' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'View wild-apricot-exports source code',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View wild-apricot-exports on npm' })
    ).toBeInTheDocument();
  });

  it('shows the public SQUARK action without loading an embedded game', () => {
    render(<Projects />);
    expect(
      screen.queryByRole('heading', { name: 'Godot Playground' })
    ).not.toBeInTheDocument();
    const card = screen
      .getByRole('heading', { name: 'SQUARK' })
      .closest('article')!;
    const action = within(card).getByRole('link', {
      name: 'Preview In Browser: SQUARK',
    });
    expect(action).toHaveAttribute(
      'href',
      'https://squark-demo-justin-paolettas-projects.vercel.app'
    );
    expect(action).toHaveAttribute('target', '_blank');
    expect(action).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      within(card).getByText(/desktop browser demo needs no account/)
    ).toBeInTheDocument();
    expect(within(card).queryByText(/Vercel sign-in/)).not.toBeInTheDocument();
    expect(
      within(card).getByAltText(/Actual SQUARK browser gameplay/)
    ).toHaveAttribute('loading', 'lazy');
    expect(
      card.querySelector('.card-header img, .card-header .folder-icon')
    ).toBeNull();
    expect(card.querySelector('iframe, video, canvas, script')).toBeNull();
  });

  it('does not offer the retired request-focused Plexarr recording', () => {
    render(<Projects />);
    const card = screen
      .getByRole('heading', { name: 'Plexarr' })
      .closest('article')!;
    expect(card.querySelector('video, source, track')).toBeNull();
    expect(
      within(card).queryByText('Read the walkthrough')
    ).not.toBeInTheDocument();
    expect(
      within(card).getByAltText(/Current Plexarr Library interface/)
    ).toBeInTheDocument();
  });

  it('renders project content consistently', () => {
    render(<Projects />);

    expect(
      screen.getByRole('heading', { name: 'Projects' })
    ).toBeInTheDocument();
    expect(screen.getByText('BitStockerz')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'wild-apricot-exports' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Plexarr' })
    ).toBeInTheDocument();

    const bitStockerzCard = screen.getByText('BitStockerz').closest('article');
    expect(bitStockerzCard).not.toBeNull();
    if (!bitStockerzCard) {
      throw new Error('BitStockerz card not found');
    }
    expect(within(bitStockerzCard).getByText('Angular')).toBeInTheDocument();
    expect(
      within(bitStockerzCard).getByText('MySQL/MariaDB')
    ).toBeInTheDocument();
    expect(
      within(bitStockerzCard).queryByText('PostgreSQL')
    ).not.toBeInTheDocument();
    expect(
      within(bitStockerzCard).queryByText('React')
    ).not.toBeInTheDocument();

    expect(
      document.querySelector(
        'img.folder-icon--image[src="/images/projects/sidequest-sq-logo-60.webp"]'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByAltText(/JP Design System Game 6 dashboard/)
    ).toBeInTheDocument();
  });

  it('offers the prerelease Storybook and lazy native SideQuest screens', () => {
    render(<Projects />);
    expect(
      screen.getByRole('link', { name: 'Explore Storybook: @jp-design-system' })
    ).toHaveAttribute(
      'href',
      'https://justinpaoletta.github.io/jp-design-system/'
    );
    const card = screen
      .getByRole('heading', { name: 'SideQuest: Pittsburgh' })
      .closest('article')!;
    expect(within(card).getAllByRole('img')).toHaveLength(1);
    expect(within(card).getByText('SQLite')).toBeInTheDocument();
    expect(within(card).queryByText('MongoDB')).not.toBeInTheDocument();
    fireEvent.click(within(card).getByRole('tab', { name: 'Collection' }));
    expect(
      within(card).getByAltText(/Steel City Coin Collection/)
    ).toBeInTheDocument();
    expect(within(card).getAllByRole('img')).toHaveLength(1);
    expect(
      within(card).getByText(/Additional coin earning/)
    ).toBeInTheDocument();
    fireEvent.click(within(card).getByRole('tab', { name: 'Guides' }));
    expect(
      within(card).getByAltText(/eleven available Pittsburgh guides/)
    ).toBeInTheDocument();
  });
});

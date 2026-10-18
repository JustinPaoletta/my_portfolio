import { render, screen, within } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Projects from '.';

describe('Projects section', () => {
  it('renders featured and other projects with status/private branches', () => {
    render(<Projects />);

    expect(
      screen.getByRole('heading', { name: 'Projects' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'More Projects' })
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

  it('shows the SQUARK review action without loading an embedded game', () => {
    render(<Projects />);
    const card = screen
      .getByRole('heading', { name: 'SQUARK' })
      .closest('article')!;
    const action = within(card).getByRole('link', {
      name: 'Play preview: SQUARK',
    });
    expect(action).toHaveAttribute(
      'href',
      'https://squark-demo-mztzrjrps-justin-paolettas-projects.vercel.app'
    );
    expect(action).toHaveAttribute('target', '_blank');
    expect(action).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      within(card).getByText(/preview requires Vercel sign-in/)
    ).toBeInTheDocument();
    expect(
      within(card).getByAltText(/Actual SQUARK browser gameplay/)
    ).toHaveAttribute('loading', 'lazy');
    expect(card.querySelector('iframe, video, canvas, script')).toBeNull();
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
        'img.folder-icon--image[src="/images/projects/godot-playground.webp"]'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByAltText(/Current JP Design System dashboard/)
    ).toBeInTheDocument();
  });
});

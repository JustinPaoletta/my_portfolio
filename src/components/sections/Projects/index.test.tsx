import { render, screen, within } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Projects from '.';

describe('Projects section', () => {
  it('renders featured and other projects with status/private branches', () => {
    render(<Projects />);

    expect(
      screen.getByRole('heading', { name: 'My Projects' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Other Projects' })
    ).toBeInTheDocument();

    expect(screen.getAllByLabelText('Project in development').length).toBe(1);
    expect(screen.getByLabelText('Project planning')).toBeInTheDocument();

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
        name: 'View wild-apricot-exports on GitHub',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View wild-apricot-exports on npm' })
    ).toBeInTheDocument();
  });

  it('renders project content consistently', () => {
    render(<Projects />);

    expect(
      screen.getByRole('heading', { name: 'My Projects' })
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
      within(bitStockerzCard).queryByText('React')
    ).not.toBeInTheDocument();

    expect(
      document.querySelector(
        'img.folder-icon--image[src="/images/projects/godot-playground.webp"]'
      )
    ).toBeInTheDocument();

    expect(screen.getByAltText('SideQuest: Pittsburgh screenshot')).toHaveClass(
      'project-image--contain'
    );
  });
});

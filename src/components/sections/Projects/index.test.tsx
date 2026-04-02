import { render, screen } from '@/test/test-utils';
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

    expect(screen.getAllByLabelText('Project in development').length).toBe(2);
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
  });

  it('renders project content consistently', () => {
    render(<Projects />);

    expect(
      screen.getByRole('heading', { name: 'My Projects' })
    ).toBeInTheDocument();
    expect(screen.getByText('BitStockerz')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Plexarr' })
    ).toBeInTheDocument();
  });
});

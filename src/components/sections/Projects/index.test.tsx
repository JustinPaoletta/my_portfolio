import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import Projects from '.';

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
      h3: motionFactory('h3'),
      div: motionFactory('div'),
      article: motionFactory('article'),
    },
    useInView: () => isInView,
  };
});

describe('Projects section', () => {
  it('renders featured and other projects with status/private branches', () => {
    isInView = true;
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

  it('still renders content when section is out of view (hidden animation state)', () => {
    isInView = false;
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

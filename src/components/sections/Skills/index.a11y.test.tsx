import { fireEvent, render, screen } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Skills from '.';

const resolvedMode: 'dark' | 'light' = 'light';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    resolvedMode,
  }),
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionFactory = (tag: keyof HTMLElementTagNameMap) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children)
    );

  return {
    motion: {
      section: motionFactory('section'),
      header: motionFactory('header'),
      span: motionFactory('span'),
      h2: motionFactory('h2'),
      div: motionFactory('div'),
      a: motionFactory('a'),
    },
    useInView: () => true,
  };
});

describe('Skills accessibility', () => {
  it('has no violations for the tabbed skills UI', async () => {
    const { container } = render(<Skills />);

    fireEvent.click(screen.getByRole('tab', { name: 'Tooling' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});

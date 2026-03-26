import { fireEvent, render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import Skills from '.';

let resolvedMode: 'dark' | 'light' = 'light';

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

describe('Skills section', () => {
  it('renders category tabs and switches active tab by click', () => {
    resolvedMode = 'light';
    render(<Skills />);

    const backendTab = screen.getByRole('tab', { name: 'Backend' });
    fireEvent.click(backendTab);

    expect(backendTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('heading', { name: 'Skills & Technologies' })
    ).toBeInTheDocument();
  });

  it('handles arrow keyboard navigation between tabs', () => {
    resolvedMode = 'light';
    render(<Skills />);

    const frontendTab = screen.getByRole('tab', { name: 'Frontend' });
    frontendTab.focus();

    fireEvent.keyDown(frontendTab, { key: 'ArrowRight' });
    const backendTab = screen.getByRole('tab', { name: 'Backend' });
    expect(backendTab).toHaveAttribute('aria-selected', 'true');
    expect(backendTab).toHaveFocus();

    fireEvent.keyDown(backendTab, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Frontend' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    fireEvent.keyDown(frontendTab, { key: 'End' });
    const aiTab = screen.getByRole('tab', { name: 'AI' });
    expect(aiTab).toHaveAttribute('aria-selected', 'true');
    expect(aiTab).toHaveFocus();

    fireEvent.keyDown(aiTab, { key: 'Home' });
    expect(frontendTab).toHaveAttribute('aria-selected', 'true');
    expect(frontendTab).toHaveFocus();
  });

  it('uses the dark AWS icon variant in dark mode', () => {
    resolvedMode = 'dark';
    render(<Skills />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tooling' }));

    const awsIcon = screen.getByAltText('AWS icon');

    expect(awsIcon).toHaveAttribute('src', '/icons/aws-dark.svg');
  });

  it('uses default icon variants in light mode and renders updated additional skills', () => {
    resolvedMode = 'light';
    render(<Skills />);

    fireEvent.click(screen.getByRole('tab', { name: 'Tooling' }));

    const awsIcon = screen.getByAltText('AWS icon');

    expect(awsIcon).toHaveAttribute('src', '/icons/aws.svg');

    expect(
      screen.getByRole('link', { name: 'Accessibility official website' })
    ).toHaveAttribute('href', 'https://www.w3.org/WAI/');
    expect(screen.getByText('Platform Architecture')).toBeInTheDocument();
  });
});

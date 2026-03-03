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
    expect(screen.getByRole('tab', { name: 'Backend' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    const backendTab = screen.getByRole('tab', { name: 'Backend' });
    fireEvent.keyDown(backendTab, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Frontend' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('uses mode-aware icon variants for AWS/New Relic in dark mode', () => {
    resolvedMode = 'dark';
    render(<Skills />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tooling' }));

    const awsIcon = screen.getByAltText('AWS icon');
    const newRelicIcon = screen.getByAltText('New Relic icon');

    expect(awsIcon).toHaveAttribute('src', '/icons/aws-dark.svg');
    expect(newRelicIcon).toHaveAttribute('src', '/icons/newrelic-dark.svg');
  });

  it('uses default icon variants in light mode and renders linked additional skills', () => {
    resolvedMode = 'light';
    render(<Skills />);

    fireEvent.click(screen.getByRole('tab', { name: 'Tooling' }));

    const awsIcon = screen.getByAltText('AWS icon');
    const newRelicIcon = screen.getByAltText('New Relic icon');

    expect(awsIcon).toHaveAttribute('src', '/icons/aws.svg');
    expect(newRelicIcon).toHaveAttribute('src', '/icons/newrelic.svg');

    expect(
      screen.getByRole('link', { name: 'PWA official website' })
    ).toHaveAttribute('href', 'https://web.dev/learn/pwa/');
    expect(screen.getByText('REST APIs')).toBeInTheDocument();
  });
});

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

describe('Skills accessibility', () => {
  it('has no violations for the tabbed skills UI', async () => {
    const { container } = render(<Skills />);

    fireEvent.click(screen.getByRole('tab', { name: 'Tooling' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});

import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import { themes } from '@/config/themes';
import ThemeSwitcher from '.';

const setThemeMock = vi.fn();
const setColorModeMock = vi.fn();
const themeName: keyof typeof themes = 'minimal';
const colorMode: 'light' | 'dark' | 'system' = 'system';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    themeName,
    setTheme: setThemeMock,
    themes,
    colorMode,
    setColorMode: setColorModeMock,
  }),
}));

describe('ThemeSwitcher accessibility', () => {
  it('has no violations when the dialog is open', async () => {
    const { container } = render(<ThemeSwitcher placement="floating" />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle theme switcher' })
    );

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'System' })).toHaveFocus();
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

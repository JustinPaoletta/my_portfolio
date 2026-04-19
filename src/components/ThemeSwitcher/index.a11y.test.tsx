import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/hooks/useTheme';
import ThemeSwitcher from '.';

describe('ThemeSwitcher accessibility', () => {
  it('has no violations when the dialog is open', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeSwitcher placement="floating" />
      </ThemeProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle theme switcher' })
    );

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'System' })).toHaveFocus();
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

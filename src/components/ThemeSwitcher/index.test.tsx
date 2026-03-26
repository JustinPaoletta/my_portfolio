import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { themes } from '@/config/themes';
import ThemeSwitcher from '.';

const setThemeMock = vi.fn();
const setColorModeMock = vi.fn();
let themeName: keyof typeof themes = 'minimal';
let colorMode: 'light' | 'dark' | 'system' = 'system';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    themeName,
    setTheme: setThemeMock,
    themes,
    colorMode,
    setColorMode: setColorModeMock,
  }),
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    themeName = 'minimal';
    colorMode = 'system';
    setThemeMock.mockReset();
    setColorModeMock.mockReset();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens menu, selects mode/theme and closes via backdrop', () => {
    render(<ThemeSwitcher placement="floating" />);

    const toggle = screen.getByRole('button', {
      name: 'Toggle theme switcher',
    });
    fireEvent.click(toggle);

    fireEvent.click(screen.getByTitle('Dark'));
    expect(setColorModeMock).toHaveBeenCalledWith('dark');

    fireEvent.click(screen.getByText('Cosmic'));
    expect(setThemeMock).toHaveBeenCalledWith('cosmic');

    const backdrop = document.querySelector('.theme-switcher-backdrop');
    if (!backdrop) throw new Error('missing backdrop');
    fireEvent.click(backdrop);
    expect(
      screen.queryByRole('dialog', { name: 'Theme settings' })
    ).not.toBeInTheDocument();
  });

  it('supports keyboard escape close path and restores the toggle focus', async () => {
    render(<ThemeSwitcher placement="floating" />);
    const toggle = screen.getByRole('button', {
      name: 'Toggle theme switcher',
    });
    fireEvent.click(toggle);

    const systemMode = screen.getByRole('radio', { name: 'System' });
    await waitFor(() => {
      expect(systemMode).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('clears pulse-on-load class after animation and closes menu on scroll', () => {
    render(<ThemeSwitcher placement="floating" />);

    const toggle = screen.getByRole('button', {
      name: 'Toggle theme switcher',
    });
    expect(toggle.className).toContain('pulse-on-load');
    fireEvent.animationEnd(toggle);
    expect(toggle.className).not.toContain('pulse-on-load');

    fireEvent.click(toggle);
    expect(
      screen.getByRole('dialog', { name: 'Theme settings' })
    ).toBeInTheDocument();
    fireEvent.scroll(window);
    expect(
      screen.queryByRole('dialog', { name: 'Theme settings' })
    ).not.toBeInTheDocument();
  });

  it('keeps floating placement free of footer-coupled inline offsets', () => {
    render(<ThemeSwitcher placement="floating" />);
    const root = document.querySelector('.theme-switcher') as HTMLElement;
    expect(root.style.getPropertyValue('--theme-switcher-offset')).toBe('');
  });

  it('skips floating placement effect when placement is nav', () => {
    render(<ThemeSwitcher placement="nav" />);
    const root = document.querySelector('.theme-switcher') as HTMLElement;
    expect(root.className).toContain('theme-switcher--nav');
  });

  it('reflects active state attributes for current mode and theme', () => {
    themeName = 'engineer';
    colorMode = 'dark';
    render(<ThemeSwitcher placement="floating" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle theme switcher' })
    );

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Engineer' })).toBeChecked();
  });

  it('ignores non-activation keys', () => {
    render(<ThemeSwitcher placement="floating" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle theme switcher' })
    );

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Light' }), {
      key: 'Tab',
    });
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Engineer' }), {
      key: 'Escape',
    });
    expect(setColorModeMock).not.toHaveBeenCalled();
    expect(setThemeMock).not.toHaveBeenCalled();
  });
});

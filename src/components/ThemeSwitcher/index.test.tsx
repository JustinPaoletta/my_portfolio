import { fireEvent, render, screen } from '@/test/test-utils';
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

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(setColorModeMock).toHaveBeenCalledWith('dark');

    fireEvent.click(screen.getByRole('option', { name: 'Cosmic' }));
    expect(setThemeMock).toHaveBeenCalledWith('cosmic');

    const backdrop = document.querySelector('.theme-switcher-backdrop');
    if (!backdrop) throw new Error('missing backdrop');
    fireEvent.click(backdrop);
    expect(
      screen.queryByRole('dialog', { name: 'Theme settings' })
    ).not.toBeInTheDocument();
  });

  it('supports keyboard selection and escape close path', () => {
    render(<ThemeSwitcher placement="floating" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle theme switcher' })
    );

    const lightMode = screen.getByRole('radio', { name: 'Light' });
    fireEvent.keyDown(lightMode, { key: 'Enter' });
    fireEvent.keyDown(lightMode, { key: ' ' });
    expect(setColorModeMock).toHaveBeenCalledWith('light');

    const engineerTheme = screen.getByRole('option', { name: 'Engineer' });
    fireEvent.keyDown(engineerTheme, { key: 'Enter' });
    fireEvent.keyDown(engineerTheme, { key: ' ' });
    expect(setThemeMock).toHaveBeenCalledWith('engineer');

    const backdrop = document.querySelector('.theme-switcher-backdrop');
    if (!backdrop) throw new Error('missing backdrop');
    fireEvent.keyDown(backdrop, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('option', { name: 'Engineer' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('ignores non-activation keys', () => {
    render(<ThemeSwitcher placement="floating" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle theme switcher' })
    );

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Light' }), {
      key: 'Tab',
    });
    fireEvent.keyDown(screen.getByRole('option', { name: 'Engineer' }), {
      key: 'Escape',
    });
    expect(setColorModeMock).not.toHaveBeenCalled();
    expect(setThemeMock).not.toHaveBeenCalled();
  });
});

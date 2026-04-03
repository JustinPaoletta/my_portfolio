import { fireEvent, render, waitFor, within } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Navigation from '.';

let themeName: 'cli' | 'minimal' | 'cosmic' | 'engineer' = 'minimal';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ themeName }),
}));

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(_callback: IntersectionObserverCallback) {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

describe('Navigation accessibility', () => {
  beforeEach(() => {
    themeName = 'minimal';
    setViewportWidth(1200);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    document.body.innerHTML = '';

    [
      'about',
      'projects',
      'skills',
      'experience',
      'articles',
      'github',
      'contact',
    ].forEach((id, i) => {
      const section = document.createElement('section');
      section.id = id;
      Object.defineProperty(section, 'offsetTop', {
        configurable: true,
        value: 500 + i * 100,
      });
      document.body.appendChild(section);
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('has no violations in desktop navigation', async () => {
    const { container } = render(<Navigation />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in the mobile menu dialog', async () => {
    setViewportWidth(900);

    const { container } = render(<Navigation />);

    const menuButton = container.querySelector(
      '.mobile-menu-button'
    ) as HTMLButtonElement | null;
    if (!menuButton) throw new Error('missing mobile menu button');

    fireEvent.click(menuButton);
    const mobileMenu = container.querySelector('#mobile-menu') as HTMLElement;
    const dialog = container.querySelector(
      '.mobile-menu-content'
    ) as HTMLElement;
    mobileMenu.style.display = 'flex';
    dialog.style.transform = 'translateX(0)';

    await waitFor(() => {
      expect(within(dialog).getByRole('link', { name: 'About' })).toHaveFocus();
    });

    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(await axe(dialog)).toHaveNoViolations();
  });
});

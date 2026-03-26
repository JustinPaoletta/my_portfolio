import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@/test/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Navigation from '.';

let themeName: 'cli' | 'minimal' | 'cosmic' | 'engineer' = 'minimal';
let motionChangeHandler: ((latest: number) => void) | null = null;

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ themeName }),
}));

vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollY: {} }),
  useMotionValueEvent: (
    _value: unknown,
    _event: string,
    callback: (latest: number) => void
  ) => {
    motionChangeHandler = callback;
  },
}));

interface ObserverRecord {
  callback: IntersectionObserverCallback;
}
const observers: ObserverRecord[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.push({ callback });
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('Navigation', () => {
  beforeEach(() => {
    themeName = 'minimal';
    motionChangeHandler = null;
    observers.length = 0;
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

  it('renders full navigation in non-CLI mode and applies scrolled class on scroll', () => {
    const { container } = render(<Navigation />);

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Articles' })).toBeInTheDocument();
    expect(container.querySelector('.mobile-menu-button')).toBeInTheDocument();

    act(() => {
      motionChangeHandler?.(10);
    });
    expect(document.querySelector('.navigation.scrolled')).toBeInTheDocument();
  });

  it('tracks active section via intersection observer and performs smooth scroll', () => {
    render(<Navigation />);
    const firstObserver = observers[0];
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) throw new Error('expected projects section');

    act(() => {
      firstObserver.callback(
        [
          {
            isIntersecting: true,
            target: projectsSection,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    const projectsLink = screen.getAllByRole('link', { name: 'Projects' })[0];
    fireEvent.click(projectsLink);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 520,
      behavior: 'smooth',
    });
    expect(projectsLink.className).toContain('active');
    expect(projectsLink).toHaveAttribute('aria-current', 'location');
  });

  it('opens/closes mobile menu, traps focus, and restores the trigger focus', async () => {
    const { container } = render(<Navigation />);

    const menuButton = container.querySelector('.mobile-menu-button');
    if (!menuButton) throw new Error('missing mobile menu button');
    fireEvent.click(menuButton);
    const mobileMenu = container.querySelector('#mobile-menu') as HTMLElement;
    const dialog = container.querySelector(
      '.mobile-menu-content'
    ) as HTMLElement;
    mobileMenu.style.display = 'flex';
    dialog.style.transform = 'translateX(0)';

    expect(menuButton).toHaveAttribute('aria-label', 'Close menu');
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog).toHaveAttribute('role', 'dialog');

    const aboutLink = within(dialog).getByRole('link', { name: 'About' });
    await waitFor(() => {
      expect(aboutLink).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
    expect(menuButton).toHaveFocus();

    fireEvent.click(menuButton);
    mobileMenu.style.display = 'flex';
    dialog.style.transform = 'translateX(0)';
    const backdrop = document.querySelector('.mobile-menu-backdrop');
    if (!backdrop) throw new Error('missing backdrop');
    fireEvent.click(backdrop);
    expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    expect(menuButton).toHaveFocus();
  });

  it('hides nav links and mobile menu controls in CLI mode', () => {
    themeName = 'cli';
    const { container } = render(<Navigation />);

    expect(
      container.querySelector('.mobile-menu-button')
    ).not.toBeInTheDocument();
    expect(container.querySelector('.nav-links')).not.toBeInTheDocument();
  });

  it('auto-closes mobile menu after switching from non-CLI to CLI theme', () => {
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        cb(0);
        return 1;
      });
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const { container, rerender } = render(<Navigation />);
    const menuButton = container.querySelector('.mobile-menu-button');
    if (!menuButton) throw new Error('missing mobile menu button');
    fireEvent.click(menuButton);

    themeName = 'cli';
    rerender(<Navigation />);

    expect(rafSpy).toHaveBeenCalled();
    expect(
      container.querySelector('.mobile-menu-button')
    ).not.toBeInTheDocument();
    expect(cancelSpy).toHaveBeenCalled();
  });
});

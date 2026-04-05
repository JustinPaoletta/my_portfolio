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

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ themeName }),
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

function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

describe('Navigation', () => {
  beforeEach(() => {
    themeName = 'minimal';
    observers.length = 0;
    setViewportWidth(1200);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.spyOn(window, 'scrollTo').mockImplementation(((
      xOrOptions?: number | ScrollToOptions,
      y?: number
    ) => {
      let top = window.scrollY;

      if (typeof xOrOptions === 'object' && xOrOptions) {
        top = xOrOptions.top ?? top;
      } else if (typeof xOrOptions === 'number') {
        top = typeof y === 'number' ? y : xOrOptions;
      }

      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: top,
      });
    }) as typeof window.scrollTo);
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
    document.body.innerHTML = '';

    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    document.body.appendChild(skipLink);

    const main = document.createElement('main');
    main.id = 'main';
    document.body.appendChild(main);

    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    document.body.appendChild(themeSwitcher);

    const footer = document.createElement('footer');
    document.body.appendChild(footer);

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
      const offsetTop = 500 + i * 100;
      Object.defineProperty(section, 'offsetTop', {
        configurable: true,
        value: offsetTop,
      });
      section.getBoundingClientRect = vi.fn(() => ({
        top: offsetTop - window.scrollY,
        bottom: offsetTop - window.scrollY + 400,
        left: 0,
        right: 0,
        width: 0,
        height: 400,
        x: 0,
        y: offsetTop - window.scrollY,
        toJSON: () => ({}),
      }));
      main.appendChild(section);
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.overscrollBehavior = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overscrollBehavior = '';
    document.body.innerHTML = '';
  });

  it('renders full navigation in non-CLI mode and applies scrolled class on scroll', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const { container } = render(<Navigation />);

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Articles' })).toBeInTheDocument();
    expect(container.querySelector('.mobile-menu-button')).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 10,
      });
      fireEvent.scroll(window);
    });
    expect(document.querySelector('.navigation.scrolled')).toBeInTheDocument();
  });

  it('tracks active section via intersection observer and performs auto scroll', () => {
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
      behavior: 'auto',
    });
    expect(projectsLink.className).toContain('active');
    expect(projectsLink).toHaveAttribute('aria-current', 'location');
  });

  it('reveals deferred targets before performing the final scroll', async () => {
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    document.getElementById('contact')?.remove();
    Object.defineProperty(document.body, 'scrollHeight', {
      configurable: true,
      value: 3200,
    });

    render(<Navigation />);
    const contactLink = screen.getAllByRole('link', { name: 'Contact' })[0];

    fireEvent.click(contactLink);

    const contactSection = document.createElement('section');
    contactSection.id = 'contact';
    const contactOffsetTop = 2100;
    Object.defineProperty(contactSection, 'offsetTop', {
      configurable: true,
      value: contactOffsetTop,
    });
    contactSection.getBoundingClientRect = vi.fn(() => ({
      top: contactOffsetTop - window.scrollY,
      bottom: contactOffsetTop - window.scrollY + 400,
      left: 0,
      right: 0,
      width: 0,
      height: 400,
      x: 0,
      y: contactOffsetTop - window.scrollY,
      toJSON: () => ({}),
    }));
    document.body.appendChild(contactSection);

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 2020,
        behavior: 'auto',
      });
    });

    const autoScrollCalls = vi
      .mocked(window.scrollTo)
      .mock.calls.filter(
        ([arg]) =>
          typeof arg === 'object' &&
          arg !== null &&
          (arg as ScrollToOptions).behavior === 'auto'
      );
    expect(autoScrollCalls.length).toBeGreaterThan(0);

    expect(rafSpy).toHaveBeenCalled();
  });

  it('opens/closes mobile menu, traps focus, and restores the trigger focus', async () => {
    setViewportWidth(900);

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

    expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(document.getElementById('main')).toHaveAttribute(
      'aria-hidden',
      'true'
    );

    const closeButton = within(dialog).getByRole('button', {
      name: 'Close menu',
    });
    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    fireEvent.click(closeButton);
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(menuButton).toHaveFocus();
    expect(document.getElementById('main')).not.toHaveAttribute('aria-hidden');

    fireEvent.click(menuButton);
    mobileMenu.style.display = 'flex';
    dialog.style.transform = 'translateX(0)';
    const backdrop = document.querySelector('.mobile-menu-backdrop');
    if (!backdrop) throw new Error('missing backdrop');
    fireEvent.click(backdrop);
    expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveFocus();
  });

  it('does not restore a stale scroll position after mobile link navigation closes the menu', async () => {
    setViewportWidth(900);
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 320,
    });

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

    const projectsLink = within(dialog).getByRole('link', {
      name: 'Projects',
    });
    fireEvent.click(projectsLink);

    await waitFor(() => {
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 520,
        behavior: 'auto',
      });
    });
    expect(window.scrollTo).not.toHaveBeenCalledWith({
      top: 320,
      left: 0,
      behavior: 'auto',
    });
    await waitFor(() => {
      expect(window.scrollY).toBe(520);
    });
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
    setViewportWidth(900);

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

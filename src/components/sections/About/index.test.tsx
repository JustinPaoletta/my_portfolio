import { act, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type AboutModule = typeof import('.');

let breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
let isMobileViewport = false;
let About: AboutModule['default'];

vi.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => breakpoint,
}));

describe('About section', () => {
  beforeEach(async () => {
    breakpoint = 'md';
    isMobileViewport = false;
    vi.resetModules();
    ({ default: About } = await import('.'));
  });

  it('computes expanded content/story heights and resets styles on unmount', () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === '(max-width: 640px)' ? isMobileViewport : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    })) as typeof window.matchMedia;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function getRect(this: HTMLElement) {
        const el = this as HTMLElement;
        if (el.classList.contains('about-text')) {
          return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 300,
          } as DOMRect;
        }
        if (el.classList.contains('about-center')) {
          return {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 180,
          } as DOMRect;
        }
        return {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 80,
        } as DOMRect;
      }
    );

    const { container, unmount } = render(<About />);

    container
      .querySelectorAll<HTMLElement>('.value-card-content-inner')
      .forEach((inner) => {
        Object.defineProperty(inner, 'scrollHeight', {
          configurable: true,
          value: 150,
        });
      });

    act(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('load'));
    });

    const aboutContent = container.querySelector(
      '.about-content'
    ) as HTMLElement;
    const aboutStory = container.querySelector('.about-story') as HTMLElement;
    expect(aboutContent.style.minHeight).toBe('330px');
    expect(
      aboutStory.style.getPropertyValue('--about-story-max-height')
    ).not.toBe('');

    unmount();
    expect(aboutContent.style.minHeight).toBe('');
    expect(aboutStory.style.getPropertyValue('--about-story-max-height')).toBe(
      ''
    );
  });

  it('applies small-highlight styles on xs/sm breakpoints and mobile viewport branch', () => {
    breakpoint = 'xs';
    isMobileViewport = true;
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === '(max-width: 640px)' ? isMobileViewport : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    })) as typeof window.matchMedia;

    render(<About />);

    const highlights = document.querySelector(
      '.about-highlights-lines'
    ) as HTMLElement;
    expect(highlights.style.display).toBe('grid');

    const firstNumber = screen.getByText('5+');
    expect(firstNumber).toHaveStyle({ marginBottom: '0px' });
    expect(screen.getByRole('link', { name: 'Claude Code' })).toHaveAttribute(
      'href',
      'https://www.anthropic.com/claude'
    );
  });
});

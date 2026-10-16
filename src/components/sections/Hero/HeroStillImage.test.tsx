import { fireEvent, render } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import HeroStillImage from './HeroStillImage';

describe('hero poster transition', () => {
  it('only completes the requested poster fade, never unrelated animation events', () => {
    const done = vi.fn();
    const props = {
      theme: 'engineer' as const,
      mode: 'dark' as const,
      className: 'poster',
      onFadeComplete: done,
    };
    const view = render(<HeroStillImage {...props} />);
    const end = (animationName: string) => {
      const node = view.container.querySelector('.hero-poster-overlay')!;
      const event = new Event('webkitAnimationEnd', { bubbles: true });
      Object.defineProperty(event, 'animationName', { value: animationName });
      fireEvent(node, event);
    };
    end('hero-poster-fade-out');
    expect(done).not.toHaveBeenCalled();
    view.rerender(<HeroStillImage {...props} fadeRequested />);
    end('other-animation');
    expect(done).not.toHaveBeenCalled();
    end('hero-poster-fade-out');
    expect(done).toHaveBeenCalledOnce();
    view.rerender(
      <HeroStillImage {...props} fadeRequested onFadeComplete={undefined} />
    );
    end('hero-poster-fade-out');
    expect(done).toHaveBeenCalledOnce();
    view.rerender(<HeroStillImage {...props} hidden />);
    expect(view.container).toBeEmptyDOMElement();
  });
});

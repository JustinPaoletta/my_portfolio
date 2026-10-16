import { act, fireEvent, render, screen } from '@/test/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DeferredSection from './DeferredSection';

let visible = false;
vi.mock('@/hooks/useIntersectionObserver', () => ({ default: () => visible }));

describe('deferred section lifecycle', () => {
  beforeEach(() => {
    visible = false;
    document.documentElement.scrollTop = 0;
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) =>
      window.setTimeout(() => callback(0), 16)
    );
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) =>
      window.clearTimeout(id)
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.scrollTop = 0;
  });
  it('does not mount disabled sections, and mounts an explicitly requested section immediately', () => {
    const { rerender } = render(
      <DeferredSection enabled={false}>Content</DeferredSection>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-deferred-sentinel]')
    ).not.toBeInTheDocument();
    rerender(<DeferredSection forceVisible>Content</DeferredSection>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('waits for a real user scroll even when the observer reports visibility', () => {
    visible = true;
    render(<DeferredSection>Content</DeferredSection>);
    fireEvent.scroll(window);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    document.documentElement.scrollTop = 100;
    fireEvent.scroll(window);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it.each(['400px 0px', 'badpx', '20%', ''])(
    'recovers when intersection observation misses a nearby section (%s)',
    (rootMargin) => {
      document.documentElement.scrollTop = 10;
      render(
        <DeferredSection rootMargin={rootMargin}>Content</DeferredSection>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      fireEvent.resize(window);
      fireEvent(window, new Event('orientationchange'));
      act(() => vi.advanceTimersByTime(16));
      expect(screen.getByText('Content')).toBeInTheDocument();
    }
  );
  it('keeps a far-away sentinel deferred until it reaches the lead range', () => {
    document.documentElement.scrollTop = 10;
    let top = 5000;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({
        top,
        bottom: top + 24,
        left: 0,
        right: 100,
        x: 0,
        y: top,
        width: 100,
        height: 24,
        toJSON: () => ({}),
      })
    );
    render(<DeferredSection>Content</DeferredSection>);
    act(() => vi.advanceTimersByTime(16));
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    top = 200;
    fireEvent.scroll(window);
    act(() => vi.advanceTimersByTime(16));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('reveals at the page end even when a short viewport misses the sentinel, and cancels a pending frame on unmount', () => {
    document.documentElement.scrollTop = 900;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 5000,
      bottom: 5024,
    } as DOMRect);
    const { unmount } = render(<DeferredSection>Content</DeferredSection>);
    act(() => vi.advanceTimersByTime(16));
    expect(screen.getByText('Content')).toBeInTheDocument();
    unmount();
    document.documentElement.scrollTop = 10;
    const next = render(<DeferredSection>Later</DeferredSection>);
    next.unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
    act(() => vi.runOnlyPendingTimers());
    expect(screen.queryByText('Later')).not.toBeInTheDocument();
  });
});

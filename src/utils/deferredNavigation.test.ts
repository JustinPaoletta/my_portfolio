import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { revealAndNavigate } from './deferredNavigation';

function mountSection(id: string): HTMLElement {
  const section = document.createElement('section');
  section.id = id;
  document.body.append(section);
  return section;
}

describe('deferred section navigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('finishes navigation when a slow section takes several seconds to mount', async () => {
    revealAndNavigate('contact');
    await vi.advanceTimersByTimeAsync(4500);

    const section = mountSection('contact');
    await vi.advanceTimersByTimeAsync(250);

    expect(section).toHaveFocus();
    expect(window.location.hash).toBe('#contact');
  });

  it('preserves field focus if the visitor starts using a newly mounted section', async () => {
    revealAndNavigate('contact');
    const section = mountSection('contact');
    const input = document.createElement('input');
    section.append(input);
    await vi.advanceTimersByTimeAsync(1);

    input.focus();
    await vi.advanceTimersByTimeAsync(500);

    expect(input).toHaveFocus();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('cancels a waiting jump when the visitor navigates to another section', async () => {
    const about = mountSection('about');
    revealAndNavigate('contact');
    revealAndNavigate('about');

    mountSection('contact');
    await vi.advanceTimersByTimeAsync(500);

    expect(about).toHaveFocus();
    expect(window.location.hash).toBe('#about');
  });

  it('stops a pending jump when the visitor scrolls while the section loads', async () => {
    revealAndNavigate('contact');
    window.dispatchEvent(new WheelEvent('wheel'));
    mountSection('contact');
    await vi.advanceTimersByTimeAsync(500);

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
  });

  it('expires the wait if a section never loads', async () => {
    revealAndNavigate('contact');
    await vi.advanceTimersByTimeAsync(12_000);
    mountSection('contact');
    await vi.advanceTimersByTimeAsync(500);

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
  });
});

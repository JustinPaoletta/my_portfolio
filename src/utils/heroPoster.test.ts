import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getHeroPosterPath, isPosterCaptureMode } from '@/utils/heroPoster';

describe('heroPoster', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    delete document.documentElement.dataset.posterCapture;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns poster paths for each theme, mode, and variant', () => {
    expect(getHeroPosterPath('engineer', 'dark', 'desktop')).toBe(
      '/images/hero/engineer/engineer-poster-dark-desktop.webp'
    );
    expect(getHeroPosterPath('cosmic', 'light', 'mobile')).toBe(
      '/images/hero/cosmic/cosmos-poster-light-mobile.webp'
    );
  });

  it('detects poster capture mode from the query string', () => {
    window.history.pushState({}, '', '/?capture-posters=1');
    expect(isPosterCaptureMode()).toBe(true);
  });

  it('detects poster capture mode from the document dataset', () => {
    document.documentElement.dataset.posterCapture = 'true';
    expect(isPosterCaptureMode()).toBe(true);
  });
});

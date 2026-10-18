import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { useBreakpoint } from './useBreakpoint';
import { useReducedMotion } from './useReducedMotion';
import { isPosterCaptureMode, useHeroPosterPath } from '@/utils/heroPoster';
import { isVisualTestMode } from '@/utils/visualTest';
import DeferredSection from '@/components/DeferredSection';

function PrerenderProbe() {
  const breakpoint = useBreakpoint();
  const reduced = useReducedMotion();
  const poster = useHeroPosterPath('engineer', 'dark');
  return (
    <p>
      {breakpoint}|{String(reduced)}|{poster}
    </p>
  );
}

describe('prerender-safe responsive state', () => {
  it('uses a desktop poster and defers unseen content without browser globals', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);
    let markup = '';
    let capture = true;
    try {
      markup = renderToString(
        <>
          <PrerenderProbe />
          <DeferredSection>Deferred content</DeferredSection>
        </>
      );
      capture = isPosterCaptureMode();
    } finally {
      vi.unstubAllGlobals();
    }
    expect(markup.replace(/<!--.*?-->/g, '')).toContain(
      'xl|false|/images/hero/engineer/engineer-poster-dark-desktop.webp'
    );
    expect(markup.replace(/<!--.*?-->/g, '')).toContain(
      'data-deferred-sentinel'
    );
    expect(markup).not.toContain('Deferred content');
    expect(capture).toBe(false);
  });
  it('can detect capture query flags before a document is available', () => {
    const url = window.location.href;
    window.history.replaceState(null, '', '/?visual-test=1&capture-posters=1');
    vi.stubGlobal('document', undefined);
    try {
      expect(isVisualTestMode()).toBe(true);
      expect(isPosterCaptureMode()).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      window.history.replaceState(null, '', url);
    }
  });
});

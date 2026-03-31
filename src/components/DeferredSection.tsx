import { useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface DeferredSectionProps {
  children: React.ReactNode;
  enabled?: boolean;
  forceVisible?: boolean;
  rootMargin?: string;
}

export default function DeferredSection({
  children,
  enabled = true,
  forceVisible = false,
  rootMargin,
}: DeferredSectionProps): React.ReactElement | null {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isManuallyVisible, setIsManuallyVisible] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const scrollEl = document.scrollingElement ?? document.documentElement;
    return scrollEl.scrollTop > 0;
  });
  const effectiveRootMargin = rootMargin ?? '400px 0px';
  const isVisible = useIntersectionObserver(sentinelRef, {
    rootMargin: effectiveRootMargin,
    triggerOnce: true,
  });
  const shouldReveal =
    forceVisible || (hasUserScrolled && (isVisible || isManuallyVisible));

  useEffect(() => {
    if (!enabled || forceVisible || hasUserScrolled) {
      return;
    }

    const detectScroll = (): void => {
      const scrollEl = document.scrollingElement ?? document.documentElement;
      if (scrollEl.scrollTop > 0) {
        setHasUserScrolled(true);
      }
    };

    detectScroll();
    window.addEventListener('scroll', detectScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', detectScroll);
    };
  }, [enabled, forceVisible, hasUserScrolled]);

  useEffect(() => {
    if (!enabled || shouldReveal || (!forceVisible && !hasUserScrolled)) {
      return;
    }

    const parseLeadMargin = (marginValue: string): number => {
      const firstToken = marginValue.trim().split(/\s+/)[0] ?? '0px';
      if (firstToken.endsWith('px')) {
        const parsed = Number.parseFloat(firstToken);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const leadMargin = parseLeadMargin(effectiveRootMargin);
    let rafId: number | undefined;

    const checkVisibility = (): void => {
      const sentinel = sentinelRef.current;
      if (!sentinel) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const rect = sentinel.getBoundingClientRect();
      const intersectsVerticalRange =
        rect.top <= viewportHeight + leadMargin && rect.bottom >= -leadMargin;

      // When the user has scrolled past the fold and the sentinel is near the
      // current document bottom, treat it as visible. This prevents the
      // deferred cascade from stalling in landscape (short viewport) where a
      // newly-rendered section can push the next sentinel beyond rootMargin.
      const scrollEl = document.scrollingElement ?? document.documentElement;
      const scrolledPastFold = scrollEl.scrollTop > viewportHeight * 0.5;
      const distFromBottom =
        scrollEl.scrollHeight - (scrollEl.scrollTop + viewportHeight);
      const nearPageEnd =
        scrolledPastFold && distFromBottom < viewportHeight * 2;

      if (intersectsVerticalRange || nearPageEnd) {
        setIsManuallyVisible(true);
      }
    };

    const scheduleCheck = (): void => {
      if (rafId !== undefined) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = undefined;
        checkVisibility();
      });
    };

    scheduleCheck();
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck);
    window.addEventListener('orientationchange', scheduleCheck);

    return () => {
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      window.removeEventListener('orientationchange', scheduleCheck);
      if (rafId !== undefined) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    effectiveRootMargin,
    enabled,
    forceVisible,
    hasUserScrolled,
    shouldReveal,
  ]);

  if (!enabled) {
    return null;
  }

  if (shouldReveal) {
    return <>{children}</>;
  }

  return (
    <div
      ref={sentinelRef}
      data-deferred-sentinel="true"
      aria-hidden="true"
      style={{ width: '100%', height: '24px' }}
    />
  );
}

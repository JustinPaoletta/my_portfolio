import { useEffect, useRef, useState } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface DeferredSectionProps {
  children: React.ReactNode;
  enabled?: boolean;
  forceVisible?: boolean;
  onReveal?: () => void;
  rootMargin?: string;
}

export default function DeferredSection({
  children,
  enabled = true,
  forceVisible = false,
  onReveal,
  rootMargin = '400px 0px',
}: DeferredSectionProps): React.ReactElement | null {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isManuallyVisible, setIsManuallyVisible] = useState(false);
  const isVisible = useIntersectionObserver(sentinelRef, {
    rootMargin,
    triggerOnce: true,
  });
  const shouldReveal = forceVisible || isVisible || isManuallyVisible;

  useEffect(() => {
    if (!enabled || shouldReveal) {
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

    const leadMargin = parseLeadMargin(rootMargin);
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
      const nearPageEnd = scrolledPastFold && distFromBottom < viewportHeight;

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
  }, [enabled, rootMargin, shouldReveal]);

  useEffect(() => {
    if (shouldReveal) {
      onReveal?.();
    }
  }, [onReveal, shouldReveal]);

  if (!enabled) {
    return null;
  }

  if (shouldReveal) {
    return <>{children}</>;
  }

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ width: '100%', height: '24px' }}
    />
  );
}

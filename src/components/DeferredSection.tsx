import { useEffect, useRef } from 'react';
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
  const isVisible = useIntersectionObserver(sentinelRef, {
    rootMargin,
    triggerOnce: true,
  });

  useEffect(() => {
    if (isVisible || forceVisible) {
      onReveal?.();
    }
  }, [forceVisible, isVisible, onReveal]);

  if (!enabled) {
    return null;
  }

  if (forceVisible || isVisible) {
    return <>{children}</>;
  }

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ width: '100%', height: '1px' }}
    />
  );
}

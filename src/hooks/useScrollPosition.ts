/**
 * useScrollPosition Hook
 * Tracks scroll position for parallax and scroll-based effects
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollPosition {
  scrollY: number;
  scrollX: number;
  scrollDirection: 'up' | 'down' | null;
}

function getInitialScrollPosition(): ScrollPosition {
  // Handle SSR case where window might not be available
  if (typeof window === 'undefined') {
    return { scrollY: 0, scrollX: 0, scrollDirection: null };
  }
  return {
    scrollY: window.scrollY,
    scrollX: window.scrollX,
    scrollDirection: null,
  };
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>(
    getInitialScrollPosition
  );
  const prevScrollY = useRef(
    typeof window !== 'undefined' ? window.scrollY : 0
  );

  const handleScroll = useCallback((): void => {
    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    const prevY = prevScrollY.current;

    const direction: 'up' | 'down' | null =
      currentScrollY > prevY ? 'down' : currentScrollY < prevY ? 'up' : null;

    prevScrollY.current = currentScrollY;

    setScrollPosition({
      scrollY: currentScrollY,
      scrollX: currentScrollX,
      scrollDirection: direction,
    });
  }, []);

  useEffect(() => {
    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return scrollPosition;
}

export default useScrollPosition;

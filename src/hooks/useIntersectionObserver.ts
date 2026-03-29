/**
 * useIntersectionObserver Hook
 * Detects when an element enters the viewport for scroll animations.
 * Reconnects the observer after viewport resize / orientation change to
 * work around mobile browsers that don't reliably re-evaluate entries.
 */

import { useState, useEffect, type RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const {
    threshold = 0.05,
    rootMargin = '100px 0px -50px 0px',
    triggerOnce = true,
  } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (isVisible && triggerOnce) return;

    const observerOptions: IntersectionObserverInit = { threshold, rootMargin };

    const handleIntersection: IntersectionObserverCallback = ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (triggerOnce) {
          activeObserver.disconnect();
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    };

    let activeObserver = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );
    activeObserver.observe(element);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const handleResize = (): void => {
      if (resizeTimer !== undefined) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(() => {
        resizeTimer = undefined;
        activeObserver.disconnect();
        activeObserver = new IntersectionObserver(
          handleIntersection,
          observerOptions
        );
        activeObserver.observe(element);
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      activeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (resizeTimer !== undefined) {
        clearTimeout(resizeTimer);
      }
    };
  }, [ref, threshold, rootMargin, triggerOnce, isVisible]);

  return isVisible;
}

export default useIntersectionObserver;

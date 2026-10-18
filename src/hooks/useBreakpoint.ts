/**
 * useBreakpoint Hook
 * Detects current viewport breakpoint for responsive behavior
 */

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BreakpointConfig {
  breakpoint: Breakpoint;
  minWidth: number;
}

// Breakpoints aligned with project conventions (mobile-first)
const BREAKPOINTS: BreakpointConfig[] = [
  { breakpoint: 'xl', minWidth: 1025 },
  { breakpoint: 'lg', minWidth: 769 },
  { breakpoint: 'md', minWidth: 641 },
  { breakpoint: 'sm', minWidth: 481 },
  { breakpoint: 'xs', minWidth: 0 },
];

function getBreakpoint(width: number): Breakpoint {
  for (const { breakpoint, minWidth } of BREAKPOINTS) {
    if (width >= minWidth) {
      return breakpoint;
    }
  }
  return 'xs';
}

/**
 * Hook to detect current viewport breakpoint
 * @returns Current breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'xl';
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = (): void => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Configuration for showing full day labels vs abbreviated
 */
export const SHOW_FULL_DAY_LABELS: Record<Breakpoint, boolean> = {
  xs: false,
  sm: false,
  md: false,
  lg: true,
  xl: true,
};

/**
 * Configuration for showing day labels at all
 */
export const SHOW_DAY_LABELS: Record<Breakpoint, boolean> = {
  xs: false,
  sm: true,
  md: true,
  lg: true,
  xl: true,
};

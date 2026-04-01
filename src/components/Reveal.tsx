/* eslint-disable react-refresh/only-export-components */
import { createElement, type CSSProperties, type ElementType } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

type RevealEffect =
  | 'fade-up'
  | 'fade-left'
  | 'fade-right'
  | 'fade-only'
  | 'scale';

interface UseRevealOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

interface RevealProps<T extends ElementType> {
  as?: T;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  effect?: RevealEffect;
  style?: CSSProperties;
  visible: boolean;
}

const DEFAULT_REVEAL_OPTIONS: UseRevealOptions = {
  rootMargin: '-40px 0px -20px 0px',
  threshold: 0.05,
  triggerOnce: true,
};

export function useRevealInView(
  ref: React.RefObject<Element | null>,
  options: UseRevealOptions = {}
): boolean {
  return useIntersectionObserver(ref, {
    ...DEFAULT_REVEAL_OPTIONS,
    ...options,
  });
}

export function getRevealClassName({
  className,
  effect = 'fade-up',
  visible,
}: {
  className?: string;
  effect?: RevealEffect;
  visible: boolean;
}): string {
  return [
    className,
    'reveal',
    `reveal--${effect}`,
    visible ? 'reveal--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');
}

export function getRevealStyle(
  delay = 0,
  style?: CSSProperties
): CSSProperties {
  return {
    ...style,
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties;
}

export function Reveal<T extends ElementType = 'div'>({
  as,
  children,
  className,
  delay = 0,
  effect = 'fade-up',
  style,
  visible,
  ...rest
}: RevealProps<T> &
  Omit<
    React.ComponentPropsWithoutRef<T>,
    keyof RevealProps<T> | 'className' | 'children' | 'style'
  >): React.ReactElement {
  const Component = (as ?? 'div') as ElementType;

  return createElement(
    Component,
    {
      ...rest,
      className: getRevealClassName({
        className,
        effect,
        visible,
      }),
      style: getRevealStyle(delay, style),
    },
    children
  );
}

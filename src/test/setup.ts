// CRITICAL: Import env at the TOP of setup file (before anything else)
// This ensures validation runs at module load time, BEFORE any tests execute
// Validation happens when this line executes because env.ts calls validateEnv()
// at module load time (line 217: const validatedEnv = validateEnv();)
// If validation fails, it throws an error and prevents tests from running
console.log('[SETUP] Loading and validating environment variables...');
import '@/config/env';
console.log('[SETUP] Environment validation completed successfully');

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extend vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock IntersectionObserver for jsdom (not available in Node.js environment)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    _callback: IntersectionObserverCallback,

    _options?: IntersectionObserverInit
  ) {}

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

window.IntersectionObserver = MockIntersectionObserver;

class MockResizeObserver implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

window.ResizeObserver = MockResizeObserver;

// Mock matchMedia for jsdom (not available in Node.js environment)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => {
    let matches = false;
    const listeners = new Set<EventListenerOrEventListenerObject>();
    const notifyListener = (
      listener: EventListenerOrEventListenerObject,
      event: MediaQueryListEvent
    ): void => {
      if (typeof listener === 'function') {
        listener(event);
        return;
      }
      listener.handleEvent(event);
    };

    return {
      matches,
      media: query,
      onchange: null,
      addListener: (listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener as EventListener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener as EventListener),
      addEventListener: (
        eventName: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        if (eventName === 'change') listeners.add(listener);
      },
      removeEventListener: (
        eventName: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        if (eventName === 'change') listeners.delete(listener);
      },
      dispatchEvent: (event: Event): boolean => {
        if (event.type !== 'change') return false;
        const mediaEvent = event as MediaQueryListEvent;
        matches = mediaEvent.matches;
        listeners.forEach((listener) => notifyListener(listener, mediaEvent));
        return true;
      },
    };
  },
});

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback): number =>
    window.setTimeout(() => callback(Date.now()), 16);
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id: number): void => {
    window.clearTimeout(id);
  };
}

afterEach(() => {
  cleanup();
});

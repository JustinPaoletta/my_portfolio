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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callback: IntersectionObserverCallback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

afterEach(() => {
  cleanup();
});

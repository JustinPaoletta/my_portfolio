import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// CRITICAL: Import env at the TOP of setup file (before anything else)
// This ensures validation runs at module load time, BEFORE any tests execute
// Validation happens when this line executes because env.ts calls validateEnv()
// at module load time (line 228: const validatedEnv = validateEnv();)
// If validation fails, it throws an error and prevents tests from running
console.log('[SETUP] Loading and validating environment variables...');
import '@/config/env';
console.log('[SETUP] Environment validation completed successfully');

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

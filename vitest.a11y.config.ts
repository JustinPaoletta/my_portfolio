import { defineConfig } from 'vitest/config';
import { createVitestConfig } from './vitest.config';

export default defineConfig(() => {
  const config = createVitestConfig('test');

  return {
    ...config,
    test: {
      ...config.test,
      include: ['src/**/*.a11y.test.tsx'],
    },
  };
});

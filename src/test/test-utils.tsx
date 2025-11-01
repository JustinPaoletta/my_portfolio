import { render, type RenderOptions } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactElement } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <HelmetProvider>{children}</HelmetProvider>,
    ...options,
  });
}

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

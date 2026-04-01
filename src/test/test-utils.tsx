import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * custom render function that wraps components with necessary providers
 */
function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <>{children}</>,
    ...options,
  });
}

// re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// override render with custom render
export { customRender as render };

import { render, type RenderOptions } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';

/**
 * custom render function that wraps components with necessary providers
 */
function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <HelmetProvider>{children}</HelmetProvider>,
    ...options,
  });
}

function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => (
      <HelmetProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </HelmetProvider>
    ),
    ...options,
  });
}

// re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// override render with custom render
export { customRender as render };
export { renderWithTheme };

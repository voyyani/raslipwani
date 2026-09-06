import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from '../../contexts/ThemeContext';

/**
 * Custom render function that wraps components with necessary providers
 * for testing (React Query, Router, Helmet, Theme).
 *
 * ThemeProvider is here rather than in individual tests because the header and
 * the admin shell both render the theme control, so a component test that omits
 * it fails on a missing context rather than on anything it meant to assert.
 */
export function renderWithProviders(
  ui,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0
        },
        mutations: {
          retry: false
        }
      }
    }),
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient
  };
}

// Re-export everything from testing library, but override `render` with the
// provider-wrapped version so `import { render } from '.../renderWithProviders'`
// gives tests a QueryClientProvider/BrowserRouter/HelmetProvider by default.
export * from '@testing-library/react';
export { renderWithProviders as render };
export { default as userEvent } from '@testing-library/user-event';

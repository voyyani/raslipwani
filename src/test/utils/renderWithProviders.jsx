import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

/**
 * Custom render function that wraps components with necessary providers
 * for testing (React Query, Router, Helmet)
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
          <BrowserRouter>
            {children}
          </BrowserRouter>
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

import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { AuthProvider } from '../../contexts/AuthContext';

/**
 * Custom render function that wraps components with necessary providers
 * for testing (React Query, Router, Helmet, Theme, Settings).
 *
 * ThemeProvider is here rather than in individual tests because the header and
 * the admin shell both render the theme control, so a component test that omits
 * it fails on a missing context rather than on anything it meant to assert.
 *
 * AuthProvider wraps them all, as in App.jsx: the header renders AuthButtons,
 * which reads `useAuth`, and that hook throws on a null context rather than
 * treating "no session" as signed out.
 *
 * SettingsProvider is here for the same reason and one more: `useSettings`
 * throws rather than degrading when its context is absent, so any page reading
 * business details — Contact does, for the address and hours — cannot be
 * rendered at all without it. The nesting matches App.jsx, Theme outside
 * Settings, so what a test exercises is the tree the browser builds.
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
          <AuthProvider>
            <ThemeProvider>
              <SettingsProvider>
                <BrowserRouter>
                  {children}
                </BrowserRouter>
              </SettingsProvider>
            </ThemeProvider>
          </AuthProvider>
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

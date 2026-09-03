/**
 * A console that only speaks in development.
 *
 * The production build drops every bare `console.*` call at the esbuild level
 * (see `vite.config.js` → `esbuild.drop`), so shipping code must not rely on
 * `console` for anything a user or an operator needs to see. This module is the
 * sanctioned alternative: it keeps developer diagnostics readable locally and
 * compiles to nothing meaningful in production.
 *
 * `error` is deliberately still routed to `console.error` in development only.
 * Anything a *user* must know about belongs in a toast; anything an *operator*
 * must know about belongs in an error boundary or a server log — never here.
 */
const isDev = import.meta.env.DEV;

const noop = () => {};

export const logger = {
  debug: isDev ? (...args) => console.debug(...args) : noop,
  info: isDev ? (...args) => console.info(...args) : noop,
  warn: isDev ? (...args) => console.warn(...args) : noop,
  error: isDev ? (...args) => console.error(...args) : noop,
};

export default logger;

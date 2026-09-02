import React from 'react';

/**
 * Catches render-time exceptions and shows a branded recovery screen instead
 * of React's default: an empty white page with no explanation and no way back.
 *
 * Must be a class — there is no hook equivalent of componentDidCatch.
 *
 * What it does NOT catch, because React error boundaries never do:
 *   - errors thrown in event handlers (use try/catch and a toast)
 *   - errors inside async callbacks, promises, or setTimeout
 *   - errors thrown by this component's own rendering
 * A boundary is a floor under the render tree, not a global exception handler.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Somewhere real, once a reporter exists. Until then the console is the
    // only record, and a silent boundary is worse than no boundary: the page
    // recovers and nobody ever learns the page was broken.
    console.error(
      `[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`,
      error,
      errorInfo?.componentStack
    );

    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Clearing the error remounts the subtree. That is enough for a transient
    // failure — a failed fetch, a bad render off stale data — and harmless for
    // a permanent one, which simply lands back here.
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback({ error, retry: this.handleRetry })
        : this.props.fallback;
    }

    return (
      <div
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-16 text-center"
      >
        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            This part of the page failed to load. Your data is safe — nothing you
            submitted has been lost.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleRetry}
              className="bg-primary text-white font-semibold py-3 px-8 rounded-md hover:bg-primary-dark transition-colors"
            >
              Try again
            </button>
            {/* A plain anchor, not a <Link>: this boundary has to work above
                the Router too, and a full reload is the honest recovery when
                the app's own render tree has just failed. */}
            <a
              href="/"
              className="border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors"
            >
              Return home
            </a>
          </div>

          {import.meta.env.DEV && (
            <pre className="mt-8 text-left text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-4 overflow-x-auto">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

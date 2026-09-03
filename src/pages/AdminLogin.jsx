import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }
    // On success AuthContext's onAuthStateChange updates `user`, and the
    // redirect above takes over. Leave `submitting` true so the button
    // cannot be double-fired during that transition.
  };

  return (
    <>
      <Helmet>
        <title>Admin Sign In | Raslipwani Properties</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-light px-4">
        <div className="w-full max-w-md bg-surface-raised rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-primary mb-1">Admin Sign In</h1>
          <p className="text-sm text-content-muted mb-6">
            Raslipwani Properties management console
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger-content"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-content-muted mb-1">
                Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line-strong px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-content-muted mb-1">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-line-strong px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-semibold text-content-on-brand transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

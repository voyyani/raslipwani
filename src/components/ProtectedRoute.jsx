import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Gates the admin area. Being signed in is NOT sufficient — the user must have
 * an admin_users row, which `useAuth().isAdmin` reflects. This mirrors the
 * is_admin() check enforced in RLS, so the UI and the database agree.
 */
const ProtectedRoute = ({ children }) => {
  const { loading, user, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div
          role="status"
          aria-label="Checking your session"
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <h1 className="mb-2 text-xl font-bold text-gray-900">Not authorised</h1>
          <p className="mb-6 text-sm text-gray-600">
            This account does not have administrator access. If you believe this
            is a mistake, contact your system administrator.
          </p>
          <Link
            to="/"
            className="inline-block rounded-md bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-secondary"
          >
            Return to site
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthButtons = () => {
  const { user, isAdmin, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          to="/admin/login"
          className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-secondary"
        >
          Admin Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {isAdmin && (
        <Link
          to="/admin"
          className="rounded-md bg-secondary px-4 py-2 text-white transition-colors hover:bg-primary"
        >
          Dashboard
        </Link>
      )}
      <button
        type="button"
        onClick={() => signOut()}
        className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
};

export default AuthButtons;

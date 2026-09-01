import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

const mockAuth = { loading: false, user: null, isAdmin: false };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

const renderAt = (path = '/admin') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/login" element={<div>LOGIN PAGE</div>} />
        <Route
          path="/admin"
          element={<ProtectedRoute><div>SECRET DASHBOARD</div></ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  mockAuth.loading = false;
  mockAuth.user = null;
  mockAuth.isAdmin = false;
});

describe('ProtectedRoute', () => {
  it('shows a loading state while auth resolves, and never the children', () => {
    mockAuth.loading = true;
    renderAt();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
  });

  it('redirects to the login page when there is no user', () => {
    renderAt();
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
  });

  it('denies a signed-in user who is not an admin', () => {
    mockAuth.user = { id: 'u1', email: 'nobody@example.com' };
    mockAuth.isAdmin = false;
    renderAt();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
    expect(screen.getByText(/not authorised/i)).toBeInTheDocument();
  });

  it('renders children for a signed-in admin', () => {
    mockAuth.user = { id: 'u1', email: 'admin@raslipwani.co.ke' };
    mockAuth.isAdmin = true;
    renderAt();
    expect(screen.getByText('SECRET DASHBOARD')).toBeInTheDocument();
  });
});

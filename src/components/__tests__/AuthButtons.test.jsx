import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthButtons from '../AuthButtons';

const mockSignOut = vi.fn();
const mockAuth = { user: null, isAdmin: false, signOut: mockSignOut };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

const renderButtons = () =>
  render(<MemoryRouter><AuthButtons /></MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.user = null;
  mockAuth.isAdmin = false;
  mockSignOut.mockResolvedValue({ error: null });
});

describe('AuthButtons', () => {
  it('shows an Admin Login link when signed out', () => {
    renderButtons();
    expect(screen.getByRole('link', { name: /admin login/i }))
      .toHaveAttribute('href', '/admin/login');
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('shows Dashboard and Sign out for a signed-in admin', () => {
    mockAuth.user = { id: 'u1', email: 'admin@raslipwani.co.ke' };
    mockAuth.isAdmin = true;
    renderButtons();

    expect(screen.getByRole('link', { name: /dashboard/i }))
      .toHaveAttribute('href', '/admin');
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('hides the Dashboard link for a signed-in non-admin', () => {
    mockAuth.user = { id: 'u2', email: 'nobody@example.com' };
    mockAuth.isAdmin = false;
    renderButtons();

    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls signOut when the sign-out button is clicked', async () => {
    mockAuth.user = { id: 'u1', email: 'admin@raslipwani.co.ke' };
    mockAuth.isAdmin = true;
    const user = userEvent.setup();
    renderButtons();

    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });
});

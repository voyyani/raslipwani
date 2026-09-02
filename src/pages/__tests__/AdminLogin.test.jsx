import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
// Rendered through renderWithProviders: AdminLogin needs HelmetProvider.
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import AdminLogin from '../AdminLogin';

const mockSignIn = vi.fn();
const mockAuth = { signIn: mockSignIn, user: null, isAdmin: false, loading: false };

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.user = null;
  mockSignIn.mockResolvedValue({ error: null });
});

describe('AdminLogin', () => {
  it('renders email and password fields with an accessible submit button', () => {
    render(<AdminLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits the typed credentials', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), 'admin@raslipwani.co.ke');
    await user.type(screen.getByLabelText(/password/i), 'correct-horse');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('admin@raslipwani.co.ke', 'correct-horse'));
  });

  it('shows the error message in an alert region when sign-in fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), 'admin@raslipwani.co.ke');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid login credentials');
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveSignIn;
    mockSignIn.mockReturnValue(new Promise((r) => { resolveSignIn = r; }));
    const user = userEvent.setup();
    render(<AdminLogin />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pw');
    await user.click(screen.getByRole('button', { name: /signing in|sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled());

    resolveSignIn({ error: null });
  });

  it('does not call signIn when fields are empty', async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from '../AdminLayout';

const mockSignOut = vi.fn();
const mockAuth = {
  user: { id: 'u1', email: 'admin@raslipwani.co.ke' },
  isAdmin: true,
  signOut: mockSignOut
};
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockAuth }));

const renderLayout = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin']}>
        <AdminLayout><div>PAGE CONTENT</div></AdminLayout>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSignOut.mockResolvedValue({ error: null });
});

describe('AdminLayout auth integration', () => {
  it('renders its children', () => {
    renderLayout();
    expect(screen.getByText('PAGE CONTENT')).toBeInTheDocument();
  });

  it("displays the signed-in admin's email", () => {
    renderLayout();
    expect(screen.getAllByText(/admin@raslipwani\.co\.ke/i).length).toBeGreaterThan(0);
  });

  it('calls signOut when the logout control is used', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole('button', { name: /sign out|log out|logout/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });
});

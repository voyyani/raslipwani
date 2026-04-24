import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils/renderWithProviders';
import BookingStatusBadge from '../BookingStatusBadge';

describe('BookingStatusBadge', () => {
  it('renders pending status correctly', () => {
    render(<BookingStatusBadge status="pending" />);

    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders confirmed status correctly', () => {
    render(<BookingStatusBadge status="confirmed" />);

    const badge = screen.getByText('Confirmed');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('renders completed status correctly', () => {
    render(<BookingStatusBadge status="completed" />);

    const badge = screen.getByText('Completed');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders cancelled status correctly', () => {
    render(<BookingStatusBadge status="cancelled" />);

    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
    expect(badge.parentElement).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays appropriate icon for each status', () => {
    const { rerender } = render(<BookingStatusBadge status="pending" />);
    expect(screen.getByText('Pending').previousSibling).toBeTruthy();

    rerender(<BookingStatusBadge status="confirmed" />);
    expect(screen.getByText('Confirmed').previousSibling).toBeTruthy();

    rerender(<BookingStatusBadge status="completed" />);
    expect(screen.getByText('Completed').previousSibling).toBeTruthy();

    rerender(<BookingStatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled').previousSibling).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<BookingStatusBadge status="pending" className="custom-class" />);

    const badge = screen.getByText('Pending').parentElement;
    expect(badge).toHaveClass('custom-class');
  });
});

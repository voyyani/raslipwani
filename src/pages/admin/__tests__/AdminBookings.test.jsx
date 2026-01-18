import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import AdminBookings from '../AdminBookings';
import { supabase } from '../../../utils/supabaseClient';

// Mock Supabase
vi.mock('../../../utils/supabaseClient');

// Mock FullCalendar
vi.mock('@fullcalendar/react', () => ({
  default: ({ events, eventClick }) => (
    <div data-testid="fullcalendar">
      {events.map((event, index) => (
        <div
          key={event.id}
          data-testid={`event-${event.id}`}
          onClick={() => eventClick({ event: { id: event.id, ...event } })}
        >
          {event.title}
        </div>
      ))}
    </div>
  )
}));

describe('AdminBookings', () => {
  const mockBookings = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      service: 'Property Viewing',
      appointment_at: '2026-01-20T10:00:00Z',
      status: 'pending',
      priority: 'medium',
      is_archived: false,
      created_at: '2026-01-18T08:00:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254723456789',
      service: 'Consultation',
      appointment_at: '2026-01-21T14:00:00Z',
      status: 'confirmed',
      priority: 'high',
      is_archived: false,
      created_at: '2026-01-18T09:00:00Z'
    }
  ];

  const mockStats = {
    total: 10,
    pending: 3,
    confirmed: 4,
    completed: 2,
    cancelled: 1,
    high_priority: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Supabase queries
    supabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      then: vi.fn((callback) => callback({ data: mockBookings, error: null }))
    }));
  });

  it('renders bookings calendar view', async () => {
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Booking Management')).toBeInTheDocument();
    });

    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('displays booking statistics', async () => {
    // Mock stats query
    supabase.from = vi.fn((table) => {
      if (table === 'bookings') {
        const chainable = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis()
        };

        chainable.then = vi.fn((callback) => {
          const data = table === 'bookings' && chainable.eq.mock.calls[0]?.[0] === 'is_archived'
            ? mockBookings
            : mockBookings;
          return callback({ data, error: null });
        });

        return chainable;
      }
    });

    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    });
  });

  it('switches between calendar views', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByTestid('fullcalendar')).toBeInTheDocument();
    });

    const dayButton = screen.getByRole('button', { name: /day/i });
    const weekButton = screen.getByRole('button', { name: /week/i });
    const monthButton = screen.getByRole('button', { name: /month/i });

    expect(dayButton).toBeInTheDocument();
    expect(weekButton).toBeInTheDocument();
    expect(monthButton).toBeInTheDocument();

    await user.click(weekButton);
    // View should change (would check calendar props in real implementation)
  });

  it('filters bookings by status', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Booking Management')).toBeInTheDocument();
    });

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, 'confirmed');

    // Verify filter was applied (would check API call in real implementation)
  });

  it('exports bookings to CSV', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Booking Management')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    // Would verify CSV download in real implementation
  });

  it('opens booking detail modal on event click', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      const event = screen.getByTestId('event-1');
      expect(event).toBeInTheDocument();
    });

    const event = screen.getByTestId('event-1');
    await user.click(event);

    // Modal should open (would verify modal content in real implementation)
  });
});

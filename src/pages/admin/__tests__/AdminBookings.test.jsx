import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import AdminBookings from '../AdminBookings';
import { supabase } from '../../../utils/supabaseClient';
import { exportToCSV } from '../../../utils/exportUtils';

// Mock Supabase
vi.mock('../../../utils/supabaseClient');

// Mock FullCalendar
vi.mock('@fullcalendar/react', () => ({
  default: ({ events, eventClick, initialView }) => (
    <div data-testid="fullcalendar" data-view={initialView}>
      {events.map((event) => (
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

// Exporting is a side effect on the download; assert the call, not the file.
vi.mock('../../../utils/exportUtils', () => ({
  exportToCSV: vi.fn(),
  formatBookingsForExport: vi.fn((rows) => rows)
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
      expect(screen.getByText('Bookings')).toBeInTheDocument();
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
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  it('switches between calendar views', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
    });

    // The calendar opens on the month grid.
    expect(screen.getByTestId('fullcalendar')).toHaveAttribute('data-view', 'dayGridMonth');

    await user.click(screen.getByRole('button', { name: /week/i }));

    await waitFor(() => {
      expect(screen.getByTestId('fullcalendar')).toHaveAttribute('data-view', 'timeGridWeek');
    });

    await user.click(screen.getByRole('button', { name: /day/i }));

    await waitFor(() => {
      expect(screen.getByTestId('fullcalendar')).toHaveAttribute('data-view', 'timeGridDay');
    });
  });

  it('filters bookings by status', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    const statusSelect = screen.getByDisplayValue('All Statuses');
    await user.selectOptions(statusSelect, 'confirmed');

    await waitFor(() => {
      expect(statusSelect).toHaveValue('confirmed');
    });
  });

  it('exports bookings to CSV', async () => {
    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(exportToCSV).toHaveBeenCalledTimes(1);
    });

    const [rows, filename] = exportToCSV.mock.calls[0];
    expect(rows).toHaveLength(mockBookings.length);
    expect(rows[0]).toMatchObject({ Name: 'John Doe', Email: 'john@example.com' });
    expect(filename).toMatch(/^bookings-\d{4}-\d{2}-\d{2}\.csv$/);
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

    // The detail modal renders the booking it was handed, not a placeholder.
    await waitFor(() => {
      expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
    });
  });
});

import { readFileSync } from 'fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import AdminBookings from '../AdminBookings';
import { exportToCSV } from '../../../utils/exportUtils';
import * as bookingsService from '@/services/bookings';

// Mock FullCalendar. `data-start` and the `simulate-drop` button exist only so
// the rollback test below can drive `eventDrop` the same way a real drag
// would, without a real drag-and-drop library in jsdom.
vi.mock('@fullcalendar/react', () => ({
  default: ({ events, eventClick, eventDrop, initialView }) => (
    <div data-testid="fullcalendar" data-view={initialView}>
      {events.map((event) => (
        <div
          key={event.id}
          data-testid={`event-${event.id}`}
          data-start={event.start}
          onClick={() => eventClick({ event: { id: event.id, ...event } })}
        >
          {event.title}
        </div>
      ))}
      {eventDrop && events[0] && (
        <button
          type="button"
          data-testid="simulate-drop"
          onClick={() =>
            eventDrop({
              event: {
                id: events[0].id,
                title: events[0].title,
                start: new Date('2026-03-01T09:00:00.000Z'),
              },
              revert: vi.fn(),
            })
          }
        >
          Simulate drop
        </button>
      )}
    </div>
  )
}));

// Exporting is a side effect on the download; assert the call, not the file.
vi.mock('../../../utils/exportUtils', () => ({
  exportToCSV: vi.fn(),
  formatBookingsForExport: vi.fn((rows) => rows)
}));

// The bookings service replaces the hand-stubbed Supabase builder chain: the
// component now consumes query options and mutation functions, not a table
// mock, so the test doubles them directly.
vi.mock('@/services/bookings', () => ({
  bookingQueries: {
    list: vi.fn((filters = {}) => ({
      queryKey: ['bookings', 'list', filters],
      queryFn: () => Promise.resolve(bookingsService.__mockBookings),
    })),
    stats: vi.fn(() => ({
      queryKey: ['bookings', 'stats'],
      queryFn: () => Promise.resolve(bookingsService.__mockStats),
    })),
    notes: vi.fn((bookingId) => ({
      queryKey: ['bookings', 'notes', String(bookingId)],
      queryFn: () => Promise.resolve([]),
      enabled: Boolean(bookingId),
    })),
  },
  setBookingStatus: vi.fn(() => Promise.resolve({})),
  setBookingPriority: vi.fn(() => Promise.resolve({})),
  rescheduleBooking: vi.fn(() => Promise.resolve({})),
  updateBooking: vi.fn(() => Promise.resolve({})),
  addBookingNote: vi.fn(() => Promise.resolve({})),
  deleteBookingNote: vi.fn(() => Promise.resolve({})),
  // Test-only escape hatch so the mocked query options above can read
  // per-test fixtures without re-mocking the whole module each time.
  __mockBookings: [],
  __mockStats: { total: 0, byStatus: {}, byPriority: {} },
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
    bookingsService.__mockBookings.length = 0;
    bookingsService.__mockBookings.push(...mockBookings);
    Object.assign(bookingsService.__mockStats, {
      total: mockBookings.length,
      byStatus: { pending: 1, confirmed: 1 },
      byPriority: { medium: 1, high: 1 },
    });
  });

  it('renders bookings calendar view', async () => {
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByText('Bookings')).toBeInTheDocument();
    });

    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('displays booking statistics', async () => {
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

  it('invalidates the whole bookings domain after a status change, not two named keys', async () => {
    // The bug this prevents: 'admin-bookings' and 'booking-stats' were
    // invalidated by hand at six call sites, and the seventh — the note modal —
    // forgot 'booking-stats', so the counters disagreed with the list until a
    // reload.
    const source = readFileSync('src/pages/admin/AdminBookings.jsx', 'utf8');
    expect(source).not.toMatch(/queryKey:\s*\[\s*['"]admin-bookings/);
    expect(source).toMatch(/queryKeys\.bookings\.all/);
  });

  it('rolls back the optimistic reschedule when the mutation fails, restoring the previous list', async () => {
    // The bug this prevents: the optimistic update snapshots and restores
    // whatever key it is given. Restoring a different key than the one that
    // was snapshotted (or than the one useQuery reads) leaves the list stuck
    // showing a move that never happened.
    bookingsService.rescheduleBooking.mockRejectedValueOnce(new Error('network down'));

    const user = userEvent.setup();
    render(<AdminBookings />);

    await waitFor(() => {
      expect(screen.getByTestId('event-1')).toBeInTheDocument();
    });

    const originalStart = screen.getByTestId('event-1').getAttribute('data-start');

    await user.click(screen.getByTestId('simulate-drop'));

    const confirmButton = await screen.findByRole('button', { name: /reschedule/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(bookingsService.rescheduleBooking).toHaveBeenCalledWith(
        1,
        { appointmentAt: '2026-03-01T09:00:00.000Z' }
      );
    });

    // Once the rejected mutation's rollback runs, the cache must be back to
    // the pre-optimistic value — not left on the optimistic guess, and not
    // wiped by restoring the wrong key.
    await waitFor(() => {
      expect(screen.getByTestId('event-1')).toHaveAttribute('data-start', originalStart);
    });
  });
});

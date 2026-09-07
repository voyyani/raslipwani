import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test/utils/renderWithProviders';
import CommunicationTimeline from '../CommunicationTimeline';

// `subject`/`type`/`communication_date` are the real columns
// (supabase/migrations/001_create_clients_tables.sql) — the component renders
// `comm.subject` as the timeline entry's heading.
vi.mock('@/services/clientCommunications', () => ({
  communicationQueries: {
    forClient: () => ({
      queryKey: ['clients', 'communications', '4'],
      queryFn: () => Promise.resolve([
        { id: 1, type: 'call', subject: 'Discussed Gigiri', communication_date: '2026-09-01' },
      ]),
    }),
  },
  addClientCommunication: vi.fn(),
  updateClientCommunication: vi.fn(),
  deleteClientCommunication: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe('CommunicationTimeline', () => {
  it('renders the communications the service returns', async () => {
    render(<CommunicationTimeline clientId={4} />);
    expect(await screen.findByText('Discussed Gigiri')).toBeInTheDocument();
  });
});

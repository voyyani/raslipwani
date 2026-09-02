import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notifyBookingReceived } from '../bookingNotifications';

describe('notifyBookingReceived', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the booking to the notification endpoint as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    const booking = { name: 'Amina', email: 'a@b.co' };
    await expect(notifyBookingReceived(booking)).resolves.toBe(true);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/send-email');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({ booking });

    vi.unstubAllGlobals();
  });

  // The booking row is already committed when this runs, so a mail failure must
  // never propagate: it would turn a saved enquiry into an error message.
  it('resolves false instead of throwing when the endpoint errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    await expect(notifyBookingReceived({ name: 'Amina' })).resolves.toBe(false);
    vi.unstubAllGlobals();
  });

  it('resolves false instead of throwing when the network is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(notifyBookingReceived({ name: 'Amina' })).resolves.toBe(false);
    vi.unstubAllGlobals();
  });
});

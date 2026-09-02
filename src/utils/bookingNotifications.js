/**
 * Client-side trigger for booking notification email.
 *
 * Deliberately fail-safe: the booking row is already saved by the time this is
 * called, so a mail outage must never surface as a failed submission. Every
 * error is swallowed and logged, and the function resolves to a boolean the
 * caller is free to ignore.
 */
export async function notifyBookingReceived(booking) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking }),
    });

    if (!response.ok) {
      console.error('Booking notification failed with status', response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Booking notification could not be sent', error);
    return false;
  }
}

export default notifyBookingReceived;

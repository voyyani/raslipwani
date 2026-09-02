import { Resend } from 'resend';
import {
  sanitizeBooking,
  isValidEmail,
  buildAdminEmail,
  buildCustomerEmail,
} from './_lib/bookingEmails.js';

/**
 * Booking notification endpoint.
 *
 * Lives at the repository root because Vercel only serves functions from a
 * root-level `api/` directory — the previous copy under `src/pages/api/` was
 * never deployed, which is one of the reasons no booking has ever produced an
 * email.
 *
 * Contract note: this handler deliberately does NOT accept `to` or `subject`
 * from the caller, as its predecessor did. An endpoint that mails arbitrary
 * recipients arbitrary HTML on behalf of an unauthenticated browser is an open
 * relay. Recipients are derived here: the team address from the environment,
 * the customer's own address from the booking they just submitted.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const adminRecipient = process.env.BOOKING_NOTIFICATION_EMAIL;
  const fromAddress = process.env.BOOKING_FROM_EMAIL || 'Raslipwani Properties <bookings@raslipwani.co.ke>';

  if (!apiKey || !adminRecipient) {
    // Misconfiguration is ours, not the customer's. Say so in the logs and
    // return a failure the caller is expected to swallow — the booking itself
    // has already been saved by this point.
    console.error('send-email: RESEND_API_KEY or BOOKING_NOTIFICATION_EMAIL is not set');
    return res.status(503).json({ error: 'Email delivery is not configured' });
  }

  const booking = sanitizeBooking(req.body?.booking ?? req.body);

  if (!booking.name && !booking.email && !booking.phone) {
    return res.status(400).json({ error: 'Booking payload is missing contact details' });
  }

  const resend = new Resend(apiKey);
  const admin = buildAdminEmail(booking);

  const results = { admin: false, customer: false };

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: adminRecipient,
      replyTo: isValidEmail(booking.email) ? booking.email : undefined,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
    });
    if (error) throw new Error(error.message || 'Resend rejected the admin notification');
    results.admin = true;
  } catch (error) {
    console.error('send-email: admin notification failed', error);
  }

  // The customer confirmation is a courtesy; failing it must not be reported as
  // an overall failure while the team was still notified.
  if (isValidEmail(booking.email)) {
    try {
      const customer = buildCustomerEmail(booking);
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: booking.email,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
      });
      if (error) throw new Error(error.message || 'Resend rejected the customer confirmation');
      results.customer = true;
    } catch (error) {
      console.error('send-email: customer confirmation failed', error);
    }
  }

  if (!results.admin) {
    return res.status(502).json({ error: 'Notification delivery failed', ...results });
  }

  return res.status(200).json({ success: true, ...results });
}

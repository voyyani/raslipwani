/**
 * Booking notification templates.
 *
 * Kept separate from the request handler so the escaping and formatting rules
 * can be tested directly, without a serverless runtime. Files under api/ whose
 * name starts with `_` are not routed by Vercel.
 */

/** Fields accepted from the browser. Anything else in the payload is discarded. */
export const ALLOWED_FIELDS = [
  'name',
  'email',
  'phone',
  'type',
  'service',
  'subject',
  'inquiry_type',
  'viewing_type',
  'property_id',
  'property_type',
  'location',
  'budget',
  'appointment_at',
  'notes',
];

/** Human labels for the fields above, in the order they should be presented. */
const FIELD_LABELS = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  type: 'Enquiry type',
  service: 'Service',
  subject: 'Subject',
  inquiry_type: 'Category',
  viewing_type: 'Viewing type',
  property_id: 'Property reference',
  property_type: 'Property type',
  location: 'Preferred location',
  budget: 'Budget',
  appointment_at: 'Requested appointment',
  notes: 'Message',
};

const MAX_FIELD_LENGTH = 2000;

/**
 * Escape text for interpolation into HTML.
 *
 * Every value in these emails originates from an anonymous web form, so it is
 * hostile until proven otherwise. The previous implementation interpolated form
 * values into HTML raw.
 */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Reduce an arbitrary payload to the known fields, as trimmed, length-capped
 * strings. Unknown keys, nested objects, and blank values are dropped.
 */
export function sanitizeBooking(payload) {
  const booking = {};
  if (!payload || typeof payload !== 'object') return booking;

  for (const field of ALLOWED_FIELDS) {
    const raw = payload[field];
    if (raw === null || raw === undefined || typeof raw === 'object') continue;
    const value = String(raw).trim().slice(0, MAX_FIELD_LENGTH);
    if (value) booking[field] = value;
  }
  return booking;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_PATTERN.test(value);
}

/** Present an ISO timestamp in Nairobi time; fall back to the raw string. */
export function formatAppointment(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return date.toLocaleString('en-KE', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi',
  });
}

function detailRows(booking) {
  return Object.entries(FIELD_LABELS)
    .filter(([field]) => booking[field])
    .map(([field, label]) => {
      const value = field === 'appointment_at' ? formatAppointment(booking[field]) : booking[field];
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#555;white-space:nowrap;vertical-align:top;"><strong>${escapeHtml(label)}</strong></td>
          <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#111;">${escapeHtml(value)}</td>
        </tr>`;
    })
    .join('');
}

function shell(heading, intro, body) {
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f6f7f9;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e6e8eb;border-radius:12px;overflow:hidden;">
    <div style="background:#1e40af;color:#fff;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;">${escapeHtml(heading)}</h1>
    </div>
    <div style="padding:24px;color:#333;font-size:14px;line-height:1.6;">
      <p style="margin-top:0;">${intro}</p>
      ${body}
    </div>
    <div style="padding:16px 24px;border-top:1px solid #eee;color:#888;font-size:12px;">
      Raslipwani Properties · Sent automatically by the booking system.
    </div>
  </div>
</body></html>`;
}

/** The internal notification: everything the team needs to act on the lead. */
export function buildAdminEmail(booking) {
  const who = booking.name || booking.email || 'Someone';
  return {
    subject: `New ${booking.type || 'enquiry'} — ${who}`,
    html: shell(
      'New booking enquiry',
      `<strong>${escapeHtml(who)}</strong> submitted an enquiry through the website.`,
      `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${detailRows(booking)}</table>
       <p style="margin-bottom:0;">Review and respond in the admin dashboard.</p>`
    ),
    text: [
      `New enquiry from ${who}`,
      '',
      ...Object.entries(FIELD_LABELS)
        .filter(([field]) => booking[field])
        .map(([field, label]) =>
          `${label}: ${field === 'appointment_at' ? formatAppointment(booking[field]) : booking[field]}`
        ),
    ].join('\n'),
  };
}

/** The customer's receipt: confirms we have it, and sets expectations. */
export function buildCustomerEmail(booking) {
  const name = booking.name ? booking.name.split(' ')[0] : 'there';
  return {
    subject: 'We have received your enquiry — Raslipwani Properties',
    html: shell(
      'Thank you for getting in touch',
      `Hi ${escapeHtml(name)}, we have received your enquiry and a member of our team will be in
       touch shortly. Here is what you sent us, for your records.`,
      `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${detailRows(booking)}</table>
       <p style="margin-bottom:0;">If anything above is wrong, simply reply to this email and we will correct it.</p>`
    ),
    text: `Hi ${name}, we have received your enquiry and will be in touch shortly. Reply to this email if any detail needs correcting.`,
  };
}

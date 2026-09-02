import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeBooking,
  isValidEmail,
  formatAppointment,
  buildAdminEmail,
  buildCustomerEmail,
} from '../bookingEmails.js';

describe('escapeHtml', () => {
  it('neutralises every HTML-significant character', () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;'
    );
  });

  it('escapes the ampersand before the entities it introduces', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('coerces non-strings rather than throwing', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});

describe('sanitizeBooking', () => {
  it('keeps known fields and drops unknown ones', () => {
    const result = sanitizeBooking({ name: 'Amina', email: 'a@example.com', role: 'admin' });
    expect(result).toEqual({ name: 'Amina', email: 'a@example.com' });
  });

  it('drops blank, null, and object values', () => {
    const result = sanitizeBooking({ name: '  ', phone: null, notes: { nested: true }, email: 'a@b.co' });
    expect(result).toEqual({ email: 'a@b.co' });
  });

  it('trims and caps very long values', () => {
    const result = sanitizeBooking({ notes: ` ${'x'.repeat(5000)} ` });
    expect(result.notes).toHaveLength(2000);
  });

  it('returns an empty object for a non-object payload', () => {
    expect(sanitizeBooking(null)).toEqual({});
    expect(sanitizeBooking('nope')).toEqual({});
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.co', 'first.last@sub.example.co.ke'])('accepts %s', (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each(['', 'no-at-sign', 'a@b', 'a b@c.co', null, undefined])('rejects %s', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});

describe('formatAppointment', () => {
  it('renders an ISO timestamp in Nairobi time', () => {
    // 09:30 UTC is 12:30 in Africa/Nairobi (UTC+3, no DST).
    expect(formatAppointment('2026-09-15T09:30:00.000Z')).toContain('12:30');
  });

  it('passes an unparseable value straight through', () => {
    expect(formatAppointment('not a date')).toBe('not a date');
  });
});

describe('email templates', () => {
  const hostile = {
    name: '<img src=x onerror=alert(1)>',
    email: 'mallory@example.com',
    notes: '"><script>steal()</script>',
  };

  it('escapes hostile form input in the admin notification body', () => {
    const { html } = buildAdminEmail(hostile);
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img src=x');
  });

  it('escapes hostile form input in the customer confirmation body', () => {
    const { html } = buildCustomerEmail(hostile);
    expect(html).not.toContain('<script>');
  });

  it('omits fields the submitter left empty', () => {
    const { html } = buildAdminEmail({ name: 'Amina', email: 'a@b.co' });
    expect(html).toContain('Amina');
    expect(html).not.toContain('Budget');
  });

  it('renders the appointment in Nairobi time rather than raw ISO', () => {
    const { html } = buildAdminEmail({ name: 'Amina', appointment_at: '2026-09-15T09:30:00.000Z' });
    expect(html).not.toContain('2026-09-15T09:30');
    expect(html).toContain('12:30');
  });

  it('gives both emails a subject and a plain-text alternative', () => {
    for (const email of [buildAdminEmail({ name: 'Amina' }), buildCustomerEmail({ name: 'Amina' })]) {
      expect(email.subject).toBeTruthy();
      expect(email.text).toBeTruthy();
    }
  });

  it('addresses the customer by first name only', () => {
    expect(buildCustomerEmail({ name: 'Amina Wanjiru' }).text).toContain('Hi Amina,');
  });

  it('falls back to a neutral greeting when no name was given', () => {
    expect(buildCustomerEmail({ email: 'a@b.co' }).text).toContain('Hi there,');
  });
});

import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Global toast surface.
 *
 * Two things were wrong with the previous configuration, and the first is why
 * this file had to change during Slice 4C rather than after it.
 *
 * 1. **It was hardcoded hex.** `background: '#fff'` with `color: '#363636'` is a
 *    white card with dark text no matter what theme is active, so every toast
 *    would have been a bright rectangle on a dark page. Toasts are the
 *    replacement for the ten native `alert()` calls this slice retires, so they
 *    had to be themeable before they could take that traffic. Every value below
 *    now resolves through the token custom properties, which is why they are
 *    written `rgb(var(--token))` — the generator emits channels so Tailwind's
 *    alpha slot works, and inline styles have to re-wrap them.
 * 2. **It announced nothing.** `react-hot-toast` renders its container without a
 *    live region, so a toast confirming a submitted booking was visible and
 *    silent. `containerAriaLabel` plus a polite live region means the
 *    confirmation is actually delivered to a screen reader — which matters most
 *    on exactly the two call sites that were customer-facing.
 */
export const ToastProvider = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    gutter={8}
    containerAriaLabel="Notifications"
    toastOptions={{
      duration: 4000,
      // `aria-live` is polite rather than assertive: these confirm an action the
      // user just took, so they should not interrupt what is being read.
      ariaProps: { role: 'status', 'aria-live': 'polite' },
      style: {
        background: 'rgb(var(--surface-raised))',
        color: 'rgb(var(--content))',
        border: '1px solid rgb(var(--border))',
        boxShadow: '0 10px 15px -3px rgb(var(--surface-inverse) / 0.1)',
        borderRadius: '0.5rem',
        padding: '16px',
        maxWidth: '500px',
      },
      success: {
        duration: 3000,
        iconTheme: {
          primary: 'rgb(var(--success-content))',
          secondary: 'rgb(var(--surface-raised))',
        },
      },
      error: {
        // Longer than success on purpose: a failure usually needs reading, and
        // often needs acting on.
        duration: 5000,
        iconTheme: {
          primary: 'rgb(var(--danger-content))',
          secondary: 'rgb(var(--surface-raised))',
        },
      },
      loading: {
        iconTheme: {
          primary: 'rgb(var(--brand))',
          secondary: 'rgb(var(--surface-raised))',
        },
      },
    }}
  />
);

export default ToastProvider;

/**
 * One place that decides what a booking status looks like.
 *
 * Before this file, five components each answered that question on their own and
 * they disagreed in two ways that were visible to the operator:
 *
 *   - `BookingStatusBadge` rendered **confirmed** in blue; `BookingList` and
 *     `BookingRow` rendered it in green. The same booking changed colour
 *     depending on which screen you were looking at.
 *   - `BookingList` and `BookingRow` used a two-branch ternary — confirmed,
 *     cancelled, else — so **completed** bookings fell through to the pending
 *     colour and read as still-outstanding work.
 *
 * Both are the same bug: a rendering decision duplicated instead of shared. The
 * intent map lives in `tokens.js` next to the colours it selects, and everything
 * that shows a status reads it from here.
 */
import { BOOKING_STATUS_INTENT } from './tokens.js';

/**
 * Tailwind classes for a status pill, from the semantic status tokens.
 *
 * Deliberately returns tokens (`bg-warning-surface`) rather than literals
 * (`bg-yellow-100`): these classes have to work in both themes, and a literal
 * has already decided which one it is for.
 */
export const INTENT_CLASSES = {
  success: 'bg-success-surface text-success-content border-success-border',
  warning: 'bg-warning-surface text-warning-content border-warning-border',
  danger: 'bg-danger-surface text-danger-content border-danger-border',
  info: 'bg-info-surface text-info-content border-info-border',
};

/** Human-facing label. The database stores lowercase; people read title case. */
export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/**
 * The intent a booking status wears. Unknown statuses fall back to `pending`'s
 * intent rather than rendering unstyled — a status nobody anticipated should
 * still look like something that needs attention.
 */
export function intentForStatus(status) {
  return BOOKING_STATUS_INTENT[status] ?? BOOKING_STATUS_INTENT.pending;
}

/** Pill classes for a booking status. */
export function statusClasses(status) {
  return INTENT_CLASSES[intentForStatus(status)];
}

/** Label for a booking status, falling back to the raw value if it is new. */
export function statusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

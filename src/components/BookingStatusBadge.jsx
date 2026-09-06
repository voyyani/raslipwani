import React from 'react';
import PropTypes from 'prop-types';

import { statusClasses, statusLabel } from '../design/status';
import Icon from './Icon';

/**
 * The one badge that renders a booking status.
 *
 * It used to carry its own colour map, and so did `BookingList`, `BookingRow` and
 * the pill in `AdminBookings` — four maps that disagreed. Colour and label now
 * come from `src/design/status.js`; this component owns only the icon and the
 * shape. See that file for what the four maps got wrong.
 */
const STATUS_ICONS = {
  pending: 'clock',
  confirmed: 'check-circle',
  completed: 'check',
  cancelled: 'times-circle',
};

const BookingStatusBadge = ({ status, className = '' }) => {
  const iconName = STATUS_ICONS[status] ?? STATUS_ICONS.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses(
        status
      )} ${className}`}
    >
      <Icon name={iconName} size={14} />
      {statusLabel(status)}
    </span>
  );
};

BookingStatusBadge.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
};

export default BookingStatusBadge;

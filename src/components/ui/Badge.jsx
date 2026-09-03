import React from 'react';
import PropTypes from 'prop-types';

import { INTENT_CLASSES, statusClasses, statusLabel } from '../../design/status';

/**
 * A pill. Either it renders a booking status — in which case colour and label
 * come from `design/status.js` and the caller gets no say — or it renders an
 * arbitrary intent.
 *
 * The `status` form exists because four components previously each decided what
 * "confirmed" looked like and two of them were wrong. A caller that passes
 * `status` cannot reintroduce that disagreement.
 */
const Badge = ({ status, intent = 'info', children, className = '' }) => {
  const tone = status ? statusClasses(status) : INTENT_CLASSES[intent] ?? INTENT_CLASSES.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${tone} ${className}`}
    >
      {children ?? (status ? statusLabel(status) : null)}
    </span>
  );
};

Badge.propTypes = {
  status: PropTypes.string,
  intent: PropTypes.oneOf(['success', 'warning', 'danger', 'info']),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Badge;

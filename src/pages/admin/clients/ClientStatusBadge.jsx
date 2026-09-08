import React from 'react';
import PropTypes from 'prop-types';

const COLOURS = {
  lead: 'bg-brand-subtle text-brand-content',
  prospect: 'bg-warning-surface text-warning-content',
  active: 'bg-success-surface text-success-content',
  inactive: 'bg-surface-sunken text-content',
};

/**
 * A client's status, as a pill. Moved out of `ClientManagement.jsx`
 * (Task 26), where it was declared inside the page component and so was a new
 * component type on every render.
 */
const ClientStatusBadge = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${COLOURS[status] || COLOURS.lead}`}>
    {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Lead'}
  </span>
);

ClientStatusBadge.propTypes = {
  status: PropTypes.string,
};

export default ClientStatusBadge;

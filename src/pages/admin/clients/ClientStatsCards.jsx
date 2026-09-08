import React from 'react';
import PropTypes from 'prop-types';
import { Users } from 'lucide-react';

/**
 * The four tallies above the client list. Moved out of
 * `ClientManagement.jsx` (Task 26) unchanged.
 */
const ClientStatsCards = ({ clients, totalCount }) => (
<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
  <div className="bg-surface-raised p-3 sm:p-4 rounded-lg shadow">
    <p className="text-content-muted text-xs sm:text-sm">Total</p>
    <p className="text-xl sm:text-2xl font-bold text-content">{totalCount || 0}</p>
  </div>
  <div className="bg-surface-raised p-3 sm:p-4 rounded-lg shadow">
    <p className="text-content-muted text-xs sm:text-sm">Active</p>
    <p className="text-xl sm:text-2xl font-bold text-success-content">
      {clients.filter(c => c.status === 'active').length || 0}
    </p>
  </div>
  <div className="bg-surface-raised p-3 sm:p-4 rounded-lg shadow">
    <p className="text-content-muted text-xs sm:text-sm">Prospects</p>
    <p className="text-xl sm:text-2xl font-bold text-warning-content">
      {clients.filter(c => c.status === 'prospect').length || 0}
    </p>
  </div>
  <div className="bg-surface-raised p-3 sm:p-4 rounded-lg shadow">
    <p className="text-content-muted text-xs sm:text-sm">Leads</p>
    <p className="text-xl sm:text-2xl font-bold text-brand">
      {clients.filter(c => c.status === 'lead').length || 0}
    </p>
  </div>
</div>
);

ClientStatsCards.propTypes = {
  clients: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
};

export default ClientStatsCards;

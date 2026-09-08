import React from 'react';
import PropTypes from 'prop-types';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';
import ClientStatusBadge from './ClientStatusBadge';

const formatCurrency = (amount) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * The client list itself: a table on desktop, cards below `lg`. Moved out of
 * `ClientManagement.jsx` (Task 26) unchanged — both views render the same
 * clients and offer the same three actions.
 */
const ClientTable = ({ clients, onView, onEdit, onDelete }) => (
  <>
<div className="hidden lg:block bg-surface-raised rounded-lg shadow overflow-hidden">
  <table className="min-w-full divide-y divide-line">
    <thead className="bg-surface">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">
          Client
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">
          Contact
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">
          Type
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">
          Budget Range
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">
          Created
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-surface-raised divide-y divide-line">
      {clients.map((client) => (
        <tr key={client.id} className="hover:bg-surface">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-brand-subtle rounded-full flex items-center justify-center">
                <span className="text-brand font-semibold text-sm">
                  {client.first_name?.[0]}{client.last_name?.[0]}
                </span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-content">
                  {client.first_name} {client.last_name}
                </div>
                {client.company && (
                  <div className="text-sm text-content-subtle">{client.company}</div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-content">{client.email}</div>
            <div className="text-sm text-content-subtle">{client.phone}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-content capitalize">
              {client.client_type || 'Individual'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-content">
            {client.budget_min && client.budget_max ? (
              <div>
                <div>{formatCurrency(client.budget_min)}</div>
                <div className="text-content-subtle">to {formatCurrency(client.budget_max)}</div>
              </div>
            ) : (
              'Not specified'
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <ClientStatusBadge status={client.status} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-content-subtle">
            {formatDate(client.created_at)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onView(client)}
                className="text-brand hover:text-brand-content"
                title="View Details"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit(client)}
                className="text-warning-content hover:text-warning-content"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(client)}
                className="text-danger-content hover:text-danger-content"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Card View */}
<div className="lg:hidden space-y-3">
  {clients.map((client) => (
    <div key={client.id} className="bg-surface-raised rounded-lg shadow border border-line p-3 sm:p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 h-12 w-12 bg-brand-subtle rounded-full flex items-center justify-center">
          <span className="text-brand font-semibold">
            {client.first_name?.[0]}{client.last_name?.[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-content text-sm sm:text-base truncate">
            {client.first_name} {client.last_name}
          </h3>
          {client.company && (
            <p className="text-xs sm:text-sm text-content-subtle truncate">{client.company}</p>
          )}
          <ClientStatusBadge status={client.status} />
        </div>
      </div>
      
      <div className="space-y-2 text-xs sm:text-sm mb-3">
        <div className="flex items-center text-content-muted">
          <span className="font-medium mr-2">Email:</span>
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center text-content-muted">
          <span className="font-medium mr-2">Phone:</span>
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center text-content-muted">
          <span className="font-medium mr-2">Type:</span>
          <span className="capitalize">{client.client_type || 'Individual'}</span>
        </div>
        {client.budget_min && client.budget_max && (
          <div className="text-content-muted">
            <span className="font-medium">Budget:</span> {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <button
          onClick={() => onView(client)}
          className="flex-1 bg-brand hover:bg-brand-hover text-content-on-brand px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" /> View
        </button>
        <button
          onClick={() => onEdit(client)}
          className="flex-1 bg-accent-hover hover:bg-yellow-700 text-content-on-media px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => onDelete(client)}
          className="flex-1 bg-danger-content hover:bg-danger-content text-content-on-brand px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  ))}
</div>
  </>
);

ClientTable.propTypes = {
  clients: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ClientTable;

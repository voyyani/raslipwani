import React from 'react';

import { statusClasses, statusLabel } from '../design/status';
import Icon from './Icon';

const BookingRow = ({
  booking,
  viewFilter,
  onViewDetails,
  onUpdateStatus,
  onArchive,
  formatDate
}) => {
  return (
    <>
      {/* Desktop Row */}
      <tr className="hover:bg-surface transition-colors hidden md:table-row">
        <td className="px-6 py-4">
          <div className="font-medium text-content">{booking.name}</div>
          <div className="text-sm text-content-subtle">{booking.email}</div>
          <div className="text-sm text-content-subtle">{booking.phone}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium">{booking.type}</div>
          <div className="text-sm text-content-subtle">
            {booking.service || booking.viewing_type}
          </div>
          <div className="text-sm mt-2">
            {booking.appointment_at ? (
              <span className="text-content">
                {formatDate(booking.appointment_at)}
              </span>
            ) : (
              <span className="text-content-subtle">Not scheduled</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-3">
            <button
              onClick={() => onViewDetails(booking)}
              className="text-brand hover:text-brand-content transition-colors"
              title="View details"
            >
              <Icon name="eye" size={20} />
            </button>
            {booking.status !== 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="text-success-content hover:text-success-content transition-colors"
                title="Confirm appointment"
              >
                <Icon name="check" size={20} />
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="text-danger-content hover:text-danger-content transition-colors"
                title="Cancel appointment"
              >
                <Icon name="times" size={20} />
              </button>
            )}
            <a 
              href={`mailto:${booking.email}`}
              className="text-purple-600 hover:text-purple-800 transition-colors"
              title="Send email"
            >
              <Icon name="envelope" size={20} />
            </a>
            {viewFilter === 'active' ? (
              <button
                onClick={() => onArchive(booking.id, true)}
                className="text-content-muted hover:text-content transition-colors"
                title="Archive appointment"
              >
                <Icon name="archive" size={20} />
              </button>
            ) : (
              <button
                onClick={() => onArchive(booking.id, false)}
                className="text-brand hover:text-brand-content transition-colors"
                title="Restore appointment"
              >
                <Icon name="trash-restore" size={20} />
              </button>
            )}
          </div>
        </td>
      </tr>
      
      {/* Mobile Row */}
      <div className="border-b border-line p-4 md:hidden">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-content">{booking.name}</div>
            <div className="text-sm text-content-subtle">{booking.email}</div>
            <div className="text-sm text-content-subtle">{booking.phone}</div>
          </div>
          <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </span>
        </div>
        
        <div className="mt-3">
          <div className="font-medium">{booking.type}</div>
          <div className="text-sm text-content-subtle">
            {booking.service || booking.viewing_type}
          </div>
          <div className="text-sm mt-2">
            {booking.appointment_at ? (
              <span className="text-content">
                {formatDate(booking.appointment_at)}
              </span>
            ) : (
              <span className="text-content-subtle">Not scheduled</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            onClick={() => onViewDetails(booking)}
            className="text-brand hover:text-brand-content"
          >
            Details
          </button>
          <div className="flex space-x-3">
            {booking.status !== 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="text-success-content hover:text-success-content"
                title="Confirm"
              >
                <Icon name="check" />
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="text-danger-content hover:text-danger-content"
                title="Cancel"
              >
                <Icon name="times" />
              </button>
            )}
            {viewFilter === 'active' ? (
              <button
                onClick={() => onArchive(booking.id, true)}
                className="text-content-muted hover:text-content"
                title="Archive"
              >
                <Icon name="archive" />
              </button>
            ) : (
              <button
                onClick={() => onArchive(booking.id, false)}
                className="text-brand hover:text-brand-content"
                title="Restore"
              >
                <Icon name="trash-restore" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingRow;
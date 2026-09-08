import React from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

/**
 * The client's communication history, or the empty state when there is none.
 * Moved out of `CommunicationTimeline.jsx` (Task 27) unchanged.
 */
const CommunicationList = ({ communications, getIcon, getColor, confirm, onEdit, onDelete }) => (
  <>
{communications.length === 0 ? (
  <div className="text-center py-12 bg-surface rounded-lg">
    <MessageSquare className="w-12 h-12 text-content-subtle mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-content mb-2">No communications yet</h3>
    <p className="text-content-muted">Start tracking your interactions with this client</p>
  </div>
) : (
  <div className="space-y-4">
    {communications.map((comm) => (
      <div key={comm.id} className="bg-surface-raised border border-line rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColor(comm.type)}`}>
            {getIcon(comm.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-semibold text-content">{comm.subject}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-content-subtle">
                  <span className="capitalize">{comm.type}</span>
                  <span>•</span>
                  <span>{formatDateTime(comm.communication_date)}</span>
                  {comm.duration_minutes && (
                    <>
                      <span>•</span>
                      <span>{comm.duration_minutes} mins</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(comm)}
                  className="text-brand hover:text-brand-content"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Delete communication',
                      message: `This ${comm.type || 'communication'} record will be permanently deleted.`,
                      confirmLabel: 'Delete',
                    });
                    if (ok) onDelete(comm.id);
                  }}
                  className="text-danger-content hover:opacity-80"
                  aria-label="Delete communication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {comm.notes && (
              <p className="mt-2 text-content-muted text-sm">{comm.notes}</p>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
)}
  </>
);

CommunicationList.propTypes = {
  communications: PropTypes.array.isRequired,
  getIcon: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CommunicationList;

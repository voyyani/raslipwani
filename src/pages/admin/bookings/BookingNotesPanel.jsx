import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Icon from '../../../components/Icon';

/**
 * The modal's Notes tab: the add-note form and the list of internal notes,
 * each with its confirmed delete. Moved out of `BookingDetailModal.jsx`
 * (Task 23).
 *
 * The draft note is the one piece of state that belongs only here, so it lives
 * here; the writes stay with the modal, which owns the mutations and the single
 * `queryKeys.bookings.all` invalidation behind them.
 */
const BookingNotesPanel = ({ notes, onAddNote, onDeleteNote, isAdding, confirm }) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    const added = await onAddNote(newNote);
    if (added) setNewNote('');
  };

  return (
          <div className="space-y-4">
            {/* Add Note Form */}
            <div className="bg-surface p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-content mb-3">Add Internal Note</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-line-strong rounded-md focus:outline-none focus:ring-2 focus:ring-focus-ring mb-3"
                placeholder="Add a note visible only to admins..."
              />
              <button
                onClick={handleAddNote}
                disabled={isAdding || !newNote.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-content-on-brand rounded-md hover:bg-brand-hover transition disabled:opacity-50"
              >
                <Icon name="plus" /> Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-content-subtle">
                  No internal notes yet. Add one above to get started.
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-surface-raised border border-line rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-content-muted">
                        {format(new Date(note.created_at), 'PPp')}
                      </div>
                      <button
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Delete note',
                            message:
                              'This note will be permanently deleted from the booking.',
                            confirmLabel: 'Delete note',
                          });
                          if (ok) onDeleteNote(note.id);
                        }}
                        className="text-danger-content hover:opacity-80"
                        aria-label="Delete note"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                    <p className="text-content-muted">{note.note_text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
  );
};

BookingNotesPanel.propTypes = {
  notes: PropTypes.array.isRequired,
  onAddNote: PropTypes.func.isRequired,
  onDeleteNote: PropTypes.func.isRequired,
  isAdding: PropTypes.bool.isRequired,
  confirm: PropTypes.func.isRequired,
};

export default BookingNotesPanel;

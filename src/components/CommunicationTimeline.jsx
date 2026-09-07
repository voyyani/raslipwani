import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  communicationQueries,
  addClientCommunication,
  updateClientCommunication,
  deleteClientCommunication,
} from '@/services/clientCommunications';
import { queryKeys } from '@/services/queryKeys';
import { formatDateTime } from '../utils/dateUtils';
import toast from 'react-hot-toast';

import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import useConfirm from './ui/useConfirm';
import { 
  Phone, Mail, Video, MessageSquare, Calendar, 
  Plus, Edit2, Trash2, Eye, X, Save 
} from 'lucide-react';

// A fresh `[]` default on every render would give a dependent effect a new
// array identity each time. There is no such effect here today, but this is
// the pattern used across the migrated surfaces (src/pages/Properties.jsx:14).
const EMPTY_COMMUNICATIONS = [];

const CommunicationTimeline = ({ clientId }) => {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingComm, setEditingComm] = useState(null);
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    notes: '',
    date: new Date().toISOString().slice(0, 16),
    duration_minutes: '',
  });

  // Fetch communications
  const { data: communications = EMPTY_COMMUNICATIONS, isLoading } = useQuery(
    communicationQueries.forClient(clientId)
  );

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) =>
      addClientCommunication({
        client_id: clientId,
        type: data.type,
        subject: data.subject,
        notes: data.notes,
        communication_date: data.date,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Communication added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add communication: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      updateClientCommunication(id, {
        type: data.type,
        subject: data.subject,
        notes: data.notes,
        communication_date: data.date,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Communication updated successfully');
      setEditingComm(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update communication: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClientCommunication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Communication deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete communication: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'call',
      subject: '',
      notes: '',
      date: new Date().toISOString().slice(0, 16),
      duration_minutes: '',
    });
    setIsAddingNew(false);
    setEditingComm(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingComm) {
      updateMutation.mutate({ id: editingComm.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (comm) => {
    setEditingComm(comm);
    setFormData({
      type: comm.type,
      subject: comm.subject || '',
      notes: comm.notes || '',
      date: comm.communication_date ? new Date(comm.communication_date).toISOString().slice(0, 16) : '',
      duration_minutes: comm.duration_minutes?.toString() || '',
    });
    setIsAddingNew(true);
  };

  const getIcon = (type) => {
    const icons = {
      call: Phone,
      email: Mail,
      meeting: Video,
      note: MessageSquare,
      viewing: Eye,
    };
    const Icon = icons[type] || MessageSquare;
    return <Icon className="w-5 h-5" />;
  };

  const getColor = (type) => {
    const colors = {
      call: 'bg-brand-subtle text-brand',
      email: 'bg-success-surface text-success-content',
      meeting: 'bg-purple-100 text-purple-600',
      note: 'bg-surface-sunken text-content-muted',
      viewing: 'bg-warning-surface text-warning-content',
    };
    return colors[type] || colors.note;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-content">Communication History</h3>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-content-on-brand rounded-lg hover:bg-brand-hover"
        >
          {isAddingNew ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Communication
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="viewing">Property Viewing</option>
                <option value="note">Note</option>
              </Select>

              <Input
                label="Date & Time"
                required
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />

              <Input
                label="Subject"
                required
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief subject..."
              />

              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="Optional"
              />

            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Detailed notes about this communication..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-line-strong rounded-lg text-content-muted hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-brand text-content-on-brand rounded-lg hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingComm ? 'Update' : 'Add'} Communication
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
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
                        onClick={() => handleEdit(comm)}
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
                          if (ok) deleteMutation.mutate(comm.id);
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

      {confirmDialog}
    </div>
  );
};

export default CommunicationTimeline;

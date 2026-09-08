import { useState } from 'react';
import CommunicationForm from './communications/CommunicationForm';
import CommunicationList from './communications/CommunicationList';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  communicationQueries,
  addClientCommunication,
  updateClientCommunication,
  deleteClientCommunication,
} from '@/services/clientCommunications';
import { queryKeys } from '@/services/queryKeys';
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
        <CommunicationForm
          formData={formData}
          isEditing={Boolean(editingComm)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onFieldChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <CommunicationList
        communications={communications}
        getIcon={getIcon}
        getColor={getColor}
        confirm={confirm}
        onEdit={handleEdit}
        onDelete={deleteMutation.mutate}
      />

      {confirmDialog}
    </div>
  );
};

export default CommunicationTimeline;

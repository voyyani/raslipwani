import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { formatDateTime, formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import { 
  Phone, Mail, Video, MessageSquare, Calendar, 
  Plus, Edit2, Trash2, Eye, X, Save 
} from 'lucide-react';

const CommunicationTimeline = ({ clientId }) => {
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
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_communications')
        .select('*')
        .eq('client_id', clientId)
        .order('communication_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('client_communications')
        .insert([{
          client_id: clientId,
          type: data.type,
          subject: data.subject,
          notes: data.notes,
          communication_date: data.date,
          duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communications', clientId]);
      queryClient.invalidateQueries(['client-stats', clientId]);
      toast.success('Communication added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add communication: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('client_communications')
        .update({
          type: data.type,
          subject: data.subject,
          notes: data.notes,
          communication_date: data.date,
          duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communications', clientId]);
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
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('client_communications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communications', clientId]);
      queryClient.invalidateQueries(['client-stats', clientId]);
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
      call: 'bg-blue-100 text-blue-600',
      email: 'bg-green-100 text-green-600',
      meeting: 'bg-purple-100 text-purple-600',
      note: 'bg-gray-100 text-gray-600',
      viewing: 'bg-yellow-100 text-yellow-600',
    };
    return colors[type] || colors.note;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="viewing">Property Viewing</option>
                <option value="note">Note</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief subject..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed notes about this communication..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingComm ? 'Update' : 'Add'} Communication
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {communications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No communications yet</h3>
          <p className="text-gray-600">Start tracking your interactions with this client</p>
        </div>
      ) : (
        <div className="space-y-4">
          {communications.map((comm) => (
            <div key={comm.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColor(comm.type)}`}>
                  {getIcon(comm.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{comm.subject}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
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
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this communication?')) {
                            deleteMutation.mutate(comm.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {comm.notes && (
                    <p className="mt-2 text-gray-700 text-sm">{comm.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunicationTimeline;

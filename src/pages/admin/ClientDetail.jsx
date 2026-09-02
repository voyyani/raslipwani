import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { formatDate } from '../../utils/dateUtils';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { 
  ArrowLeft, Edit2, Mail, Phone, MapPin, Calendar, 
  Building2, DollarSign, Tag, Clock, MessageSquare,
  Home, Activity 
} from 'lucide-react';
import ClientForm from './ClientForm';
import CommunicationTimeline from '../../components/CommunicationTimeline';
import PropertyInterests from '../../components/PropertyInterests';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // Fetch client data
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch client stats
  const { data: stats } = useQuery({
    queryKey: ['client-stats', id],
    queryFn: async () => {
      const [interests, communications, bookings] = await Promise.all([
        supabase
          .from('client_property_interests')
          .select('id', { count: 'exact' })
          .eq('client_id', id),
        supabase
          .from('client_communications')
          .select('id', { count: 'exact' })
          .eq('client_id', id),
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('client_id', id),
      ]);

      return {
        interests: interests.count || 0,
        communications: communications.count || 0,
        bookings: bookings.count || 0,
      };
    },
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading client: {error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="default" rows={8} />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status] || colors.lead}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Lead'}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'properties', label: 'Properties', icon: Home, count: stats?.interests },
    { id: 'communications', label: 'Communications', icon: MessageSquare, count: stats?.communications },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/clients')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Clients
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-2xl">
                  {client.first_name?.[0]}{client.last_name?.[0]}
                </span>
              </div>

              {/* Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {client.first_name} {client.last_name}
                </h1>
                {client.company && (
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {client.company}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={client.status} />
                  <span className="text-sm text-gray-500 capitalize">
                    {client.client_type || 'Individual'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => setIsEditFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 className="w-4 h-4" />
              Edit Client
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats?.interests || 0}</p>
              <p className="text-sm text-gray-600">Property Interests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats?.communications || 0}</p>
              <p className="text-sm text-gray-600">Communications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats?.bookings || 0}</p>
              <p className="text-sm text-gray-600">Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                          {client.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                          {client.phone}
                        </a>
                      </div>
                    </div>
                    {client.preferred_contact_method && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Preferred Contact</p>
                          <p className="capitalize">{client.preferred_contact_method}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget & Preferences</h3>
                  <div className="space-y-3">
                    {(client.budget_min || client.budget_max) && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Budget Range</p>
                          <p className="font-medium">
                            {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                          </p>
                        </div>
                      </div>
                    )}
                    {client.preferred_locations && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Preferred Locations</p>
                          <p>{client.preferred_locations}</p>
                        </div>
                      </div>
                    )}
                    {client.source && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Source</p>
                          <p className="capitalize">{client.source}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Preferences */}
                {client.property_preferences && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Preferences</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{client.property_preferences}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {client.notes && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="md:col-span-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Created on {formatDate(client.created_at)}</span>
                    {client.updated_at && client.updated_at !== client.created_at && (
                      <>
                        <span>•</span>
                        <span>Last updated {formatDate(client.updated_at)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <PropertyInterests clientId={id} />
            )}

            {activeTab === 'communications' && (
              <CommunicationTimeline clientId={id} />
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Log</h3>
                <p className="text-gray-600">
                  Activity tracking will be available soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditFormOpen && (
        <ClientForm
          client={client}
          onClose={() => setIsEditFormOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['client', id]);
            queryClient.invalidateQueries(['clients']);
            setIsEditFormOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ClientDetail;

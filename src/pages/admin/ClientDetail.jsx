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
        <div className="bg-danger-surface border border-danger-border rounded-lg p-4">
          <p className="text-danger-content">Error loading client: {error.message}</p>
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
      lead: 'bg-brand-subtle text-brand-content',
      prospect: 'bg-warning-surface text-warning-content',
      active: 'bg-success-surface text-success-content',
      inactive: 'bg-surface-sunken text-content'
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
          className="flex items-center gap-2 text-content-muted hover:text-content mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Clients
        </button>

        <div className="bg-surface-raised rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center">
                <span className="text-brand font-bold text-2xl">
                  {client.first_name?.[0]}{client.last_name?.[0]}
                </span>
              </div>

              {/* Info */}
              <div>
                <h1 className="text-3xl font-bold text-content">
                  {client.first_name} {client.last_name}
                </h1>
                {client.company && (
                  <p className="text-content-muted mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {client.company}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={client.status} />
                  <span className="text-sm text-content-subtle capitalize">
                    {client.client_type || 'Individual'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => setIsEditFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-content-on-brand rounded-lg hover:bg-brand-hover"
            >
              <Edit2 className="w-4 h-4" />
              Edit Client
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand">{stats?.interests || 0}</p>
              <p className="text-sm text-content-muted">Property Interests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-content">{stats?.communications || 0}</p>
              <p className="text-sm text-content-muted">Communications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-content">{stats?.bookings || 0}</p>
              <p className="text-sm text-content-muted">Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-surface-raised rounded-lg shadow">
          <div className="border-b border-line">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-brand text-brand'
                        : 'border-transparent text-content-subtle hover:text-content-muted hover:border-line-strong'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-surface-sunken text-content-muted">
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
                  <h3 className="text-lg font-semibold text-content mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-content-muted">
                      <Mail className="w-5 h-5 text-content-subtle" />
                      <div>
                        <p className="text-sm text-content-subtle">Email</p>
                        <a href={`mailto:${client.email}`} className="text-brand hover:underline">
                          {client.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-content-muted">
                      <Phone className="w-5 h-5 text-content-subtle" />
                      <div>
                        <p className="text-sm text-content-subtle">Phone</p>
                        <a href={`tel:${client.phone}`} className="text-brand hover:underline">
                          {client.phone}
                        </a>
                      </div>
                    </div>
                    {client.preferred_contact_method && (
                      <div className="flex items-center gap-3 text-content-muted">
                        <MessageSquare className="w-5 h-5 text-content-subtle" />
                        <div>
                          <p className="text-sm text-content-subtle">Preferred Contact</p>
                          <p className="capitalize">{client.preferred_contact_method}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-content mb-4">Budget & Preferences</h3>
                  <div className="space-y-3">
                    {(client.budget_min || client.budget_max) && (
                      <div className="flex items-center gap-3 text-content-muted">
                        <DollarSign className="w-5 h-5 text-content-subtle" />
                        <div>
                          <p className="text-sm text-content-subtle">Budget Range</p>
                          <p className="font-medium">
                            {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                          </p>
                        </div>
                      </div>
                    )}
                    {client.preferred_locations && (
                      <div className="flex items-center gap-3 text-content-muted">
                        <MapPin className="w-5 h-5 text-content-subtle" />
                        <div>
                          <p className="text-sm text-content-subtle">Preferred Locations</p>
                          <p>{client.preferred_locations}</p>
                        </div>
                      </div>
                    )}
                    {client.source && (
                      <div className="flex items-center gap-3 text-content-muted">
                        <Activity className="w-5 h-5 text-content-subtle" />
                        <div>
                          <p className="text-sm text-content-subtle">Source</p>
                          <p className="capitalize">{client.source}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Preferences */}
                {client.property_preferences && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-content mb-4">Property Preferences</h3>
                    <div className="bg-surface rounded-lg p-4">
                      <p className="text-content-muted">{client.property_preferences}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-brand-subtle text-brand-content rounded-full text-sm"
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
                    <h3 className="text-lg font-semibold text-content mb-4">Notes</h3>
                    <div className="bg-surface rounded-lg p-4">
                      <p className="text-content-muted whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="md:col-span-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-content-subtle">
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
                <Clock className="w-12 h-12 text-content-subtle mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-content mb-2">Activity Log</h3>
                <p className="text-content-muted">
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

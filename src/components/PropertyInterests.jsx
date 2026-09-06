import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

import useConfirm from './ui/useConfirm';
import { Home, Plus, X, Save, Trash2, MapPin, DollarSign, Bed, Bath } from 'lucide-react';

const PropertyInterests = ({ clientId }) => {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [interestLevel, setInterestLevel] = useState('medium');
  const [notes, setNotes] = useState('');

  // Fetch client's property interests
  const { data: interests, isLoading: interestsLoading } = useQuery({
    queryKey: ['property-interests', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_property_interests')
        .select(`
          *,
          properties (
            id,
            title,
            location,
            price,
            bedrooms,
            bathrooms,
            images
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Search properties
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['property-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price, bedrooms, bathrooms, images')
        .or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  // Add interest mutation
  const addInterestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProperty) throw new Error('No property selected');

      const { error } = await supabase
        .from('client_property_interests')
        .insert([{
          client_id: clientId,
          property_id: selectedProperty.id,
          interest_level: interestLevel,
          notes: notes,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['property-interests', clientId]);
      queryClient.invalidateQueries(['client-stats', clientId]);
      toast.success('Property interest added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add interest: ${error.message}`);
    },
  });

  // Update interest mutation
  const updateInterestMutation = useMutation({
    mutationFn: async ({ id, level, notes }) => {
      const { error } = await supabase
        .from('client_property_interests')
        .update({
          interest_level: level,
          notes: notes,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['property-interests', clientId]);
      toast.success('Interest updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update interest: ${error.message}`);
    },
  });

  // Delete interest mutation
  const deleteInterestMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('client_property_interests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['property-interests', clientId]);
      queryClient.invalidateQueries(['client-stats', clientId]);
      toast.success('Interest removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove interest: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSearchTerm('');
    setSelectedProperty(null);
    setInterestLevel('medium');
    setNotes('');
    setIsAddingNew(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addInterestMutation.mutate();
  };

  const getInterestBadge = (level) => {
    const colors = {
      low: 'bg-surface-sunken text-content',
      medium: 'bg-brand-subtle text-brand-content',
      high: 'bg-success-surface text-success-content',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[level]}`}>
        {level?.charAt(0).toUpperCase() + level?.slice(1)} Interest
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (interestsLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-content">Property Interests</h3>
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
              Add Interest
            </>
          )}
        </button>
      </div>

      {/* Add Form */}
      {isAddingNew && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-4 mb-6">
          <div className="space-y-4">
            {/* Property Search */}
            <div>
              <label className="block text-sm font-medium text-content-muted mb-1">
                Search Property
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring"
                placeholder="Search by title or location..."
              />

              {/* Search Results */}
              {searchLoading && searchTerm.length >= 2 && (
                <div className="mt-2 text-sm text-content-subtle">Searching...</div>
              )}

              {searchResults && searchResults.length > 0 && !selectedProperty && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-line rounded-lg">
                  {searchResults.map((property) => (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => {
                        setSelectedProperty(property);
                        setSearchTerm('');
                      }}
                      className="w-full text-left p-3 hover:bg-surface-sunken border-b last:border-b-0"
                    >
                      <div className="font-medium text-content">{property.title}</div>
                      <div className="text-sm text-content-muted">{property.location}</div>
                      <div className="text-sm text-brand">{formatCurrency(property.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Property */}
            {selectedProperty && (
              <div className="bg-surface-raised border border-brand-subtle rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-content">{selectedProperty.title}</h4>
                    <p className="text-sm text-content-muted">{selectedProperty.location}</p>
                    <p className="text-sm text-brand">{formatCurrency(selectedProperty.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProperty(null)}
                    className="text-content-subtle hover:text-content-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Interest Level */}
            <div>
              <label className="block text-sm font-medium text-content-muted mb-1">
                Interest Level
              </label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value)}
                className="w-full px-3 py-2 border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-content-muted mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-line-strong rounded-lg focus:ring-2 focus:ring-focus-ring"
                placeholder="Any specific requirements or notes..."
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
              disabled={!selectedProperty || addInterestMutation.isPending}
              className="px-4 py-2 bg-brand text-content-on-brand rounded-lg hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Add Interest
            </button>
          </div>
        </form>
      )}

      {/* Interests List */}
      {interests.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <Home className="w-12 h-12 text-content-subtle mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-content mb-2">No property interests yet</h3>
          <p className="text-content-muted">Track which properties this client is interested in</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interests.map((interest) => (
            <div key={interest.id} className="bg-surface-raised border border-line rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              {interest.properties?.images?.[0] && (
                <div className="h-48 bg-surface-sunken">
                  <img
                    src={interest.properties.images[0]}
                    alt={interest.properties.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-content">{interest.properties?.title}</h4>
                  {getInterestBadge(interest.interest_level)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-content-muted">
                    <MapPin className="w-4 h-4" />
                    {interest.properties?.location}
                  </div>

                  <div className="flex items-center gap-2 text-brand font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(interest.properties?.price)}
                  </div>

                  {(interest.properties?.bedrooms || interest.properties?.bathrooms) && (
                    <div className="flex items-center gap-4 text-content-muted">
                      {interest.properties.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {interest.properties.bedrooms} beds
                        </div>
                      )}
                      {interest.properties.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          {interest.properties.bathrooms} baths
                        </div>
                      )}
                    </div>
                  )}

                  {interest.notes && (
                    <p className="text-content-muted mt-2">{interest.notes}</p>
                  )}

                  <p className="text-xs text-content-subtle mt-2">
                    Added {formatDate(interest.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <select
                    value={interest.interest_level}
                    onChange={(e) => {
                      updateInterestMutation.mutate({
                        id: interest.id,
                        level: e.target.value,
                        notes: interest.notes,
                      });
                    }}
                    className="flex-1 px-3 py-1 text-sm border border-line-strong rounded focus:ring-2 focus:ring-focus-ring"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <button
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Remove property interest',
                        message: `${
                          interest.properties?.title || 'This property'
                        } will be removed from this client's interests.`,
                        confirmLabel: 'Remove interest',
                      });
                      if (ok) deleteInterestMutation.mutate(interest.id);
                    }}
                    className="px-3 py-1 text-danger-content hover:bg-danger-surface rounded"
                    aria-label="Remove property interest"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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

export default PropertyInterests;

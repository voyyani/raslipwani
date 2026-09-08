import { useState } from 'react';
import PropertyInterestForm from './interests/PropertyInterestForm';
import PropertyInterestList from './interests/PropertyInterestList';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  interestQueries,
  addClientInterest,
  updateClientInterest,
  deleteClientInterest,
} from '@/services/clientInterests';
import { propertyQueries } from '@/services/properties';
import { queryKeys } from '@/services/queryKeys';
import toast from 'react-hot-toast';

import useConfirm from './ui/useConfirm';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import { Home, Plus, X, Save, Trash2, MapPin, DollarSign, Bed, Bath } from 'lucide-react';

// A fresh `[]` default on every render would give a dependent effect a new
// array identity each time (src/pages/Properties.jsx:14).
const EMPTY_INTERESTS = [];
const EMPTY_SEARCH_RESULTS = [];

const PropertyInterests = ({ clientId }) => {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [interestLevel, setInterestLevel] = useState('medium');
  const [notes, setNotes] = useState('');

  // Fetch client's property interests — the join lives in the service
  // (clientInterests.js), so `interest.properties` arrives already populated;
  // this used to fetch each interest's property in a separate request.
  const { data: interests = EMPTY_INTERESTS, isLoading: interestsLoading } = useQuery(
    interestQueries.forClient(clientId)
  );

  // Search properties. propertyQueries.search reproduces the original inline
  // query exactly (seven columns, no ordering, no count) rather than reusing
  // the paginated admin-table query, which would add an ORDER BY and a COUNT
  // to a control that fires on every keystroke. The two-character gate lives
  // in the query options themselves.
  const { data: searchResults = EMPTY_SEARCH_RESULTS, isLoading: searchLoading } = useQuery(
    propertyQueries.search(searchTerm)
  );

  // Add interest mutation
  const addInterestMutation = useMutation({
    mutationFn: () => {
      if (!selectedProperty) throw new Error('No property selected');

      return addClientInterest({
        client_id: clientId,
        property_id: selectedProperty.id,
        interest_level: interestLevel,
        notes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Property interest added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add interest: ${error.message}`);
    },
  });

  // Update interest mutation
  const updateInterestMutation = useMutation({
    mutationFn: ({ id, level, notes }) =>
      updateClientInterest(id, {
        interest_level: level,
        notes: notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Interest updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update interest: ${error.message}`);
    },
  });

  // Delete interest mutation
  const deleteInterestMutation = useMutation({
    mutationFn: (id) => deleteClientInterest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
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

      {isAddingNew && (
        <PropertyInterestForm
          searchTerm={searchTerm}
          searchResults={searchResults}
          searchLoading={searchLoading}
          selectedProperty={selectedProperty}
          interestLevel={interestLevel}
          notes={notes}
          isSubmitting={addInterestMutation.isPending}
          formatCurrency={formatCurrency}
          onSearchTermChange={setSearchTerm}
          onSelectProperty={setSelectedProperty}
          onInterestLevelChange={setInterestLevel}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      <PropertyInterestList
        interests={interests}
        formatCurrency={formatCurrency}
        getInterestBadge={getInterestBadge}
        confirm={confirm}
        onUpdateInterest={updateInterestMutation.mutate}
        onDeleteInterest={deleteInterestMutation.mutate}
      />

      {confirmDialog}
    </div>
  );
};

export default PropertyInterests;

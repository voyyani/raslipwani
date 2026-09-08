import React from 'react';
import PropTypes from 'prop-types';
import { Save } from 'lucide-react';
import Input from './../ui/Input';
import Select from './../ui/Select';
import Textarea from './../ui/Textarea';

/**
 * The add-an-interest form: property typeahead, interest level and notes.
 * Moved out of `PropertyInterests.jsx` (Task 27) unchanged.
 */
const PropertyInterestForm = ({
  searchTerm, searchResults, searchLoading, selectedProperty = null, interestLevel, notes,
  isSubmitting, formatCurrency,
  onSearchTermChange, onSelectProperty, onInterestLevelChange, onNotesChange, onSubmit, onCancel,
}) => (
<form onSubmit={onSubmit} className="bg-surface rounded-lg p-4 mb-6">
  <div className="space-y-4">
    {/* Property Search */}
    <Input
      label="Search Property"
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchTermChange(e.target.value)}
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
      onSelectProperty(property);
      onSearchTermChange('');
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
      onClick={() => onSelectProperty(null)}
      className="text-content-subtle hover:text-content-muted"
      >
      <X className="w-5 h-5" />
      </button>
      </div>
      </div>
      )}
      {/* Interest Level */}
      <Select
        label="Interest Level"
        required
        value={interestLevel}
        onChange={(e) => onInterestLevelChange(e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>
      {/* Notes */}
      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        placeholder="Any specific requirements or notes..."
      />

  <div className="flex justify-end gap-2 mt-4">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 border border-line-strong rounded-lg text-content-muted hover:bg-surface"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={!selectedProperty || isSubmitting}
      className="px-4 py-2 bg-brand text-content-on-brand rounded-lg hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2"
    >
      <Save className="w-4 h-4" />
      Add Interest
    </button>
  </div>
</form>
);

PropertyInterestForm.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  searchResults: PropTypes.array.isRequired,
  searchLoading: PropTypes.bool.isRequired,
  selectedProperty: PropTypes.object,
  interestLevel: PropTypes.string.isRequired,
  notes: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  onSelectProperty: PropTypes.func.isRequired,
  onInterestLevelChange: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};


export default PropertyInterestForm;

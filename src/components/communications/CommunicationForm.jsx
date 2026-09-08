import React from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

/**
 * The add/edit communication form. Moved out of `CommunicationTimeline.jsx`
 * (Task 27) unchanged.
 */
const CommunicationForm = ({ formData, isEditing, isSubmitting, onFieldChange, onSubmit, onCancel }) => (
<form onSubmit={onSubmit} className="bg-surface rounded-lg p-4 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Type"
        required
        value={formData.type}
        onChange={(e) => onFieldChange({ ...formData, type: e.target.value })}
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
        onChange={(e) => onFieldChange({ ...formData, date: e.target.value })}
      />

      <Input
        label="Subject"
        required
        type="text"
        value={formData.subject}
        onChange={(e) => onFieldChange({ ...formData, subject: e.target.value })}
        placeholder="Brief subject..."
      />

      <Input
        label="Duration (minutes)"
        type="number"
        value={formData.duration_minutes}
        onChange={(e) => onFieldChange({ ...formData, duration_minutes: e.target.value })}
        placeholder="Optional"
      />

    <div className="md:col-span-2">
      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => onFieldChange({ ...formData, notes: e.target.value })}
        rows={3}
        placeholder="Detailed notes about this communication..."
      />
    </div>
  </div>

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
      disabled={isSubmitting}
      className="px-4 py-2 bg-brand text-content-on-brand rounded-lg hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2"
    >
      <Save className="w-4 h-4" />
      {isEditing ? 'Update' : 'Add'} Communication
    </button>
  </div>
</form>
);

CommunicationForm.propTypes = {
  formData: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CommunicationForm;

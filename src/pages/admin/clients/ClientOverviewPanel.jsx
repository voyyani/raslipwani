import React from 'react';
import PropTypes from 'prop-types';
import { Mail, Phone, MapPin, DollarSign, Tag, Calendar } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

/**
 * The client detail page's Overview tab: contact details, budget and
 * preferences, tags, notes and the record's dates. Moved out of
 * `ClientDetail.jsx` (Task 27) unchanged.
 */
const ClientOverviewPanel = ({ client, formatCurrency }) => (
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
);

ClientOverviewPanel.propTypes = {
  client: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
};

export default ClientOverviewPanel;

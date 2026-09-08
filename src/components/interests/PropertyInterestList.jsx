import React from 'react';
import PropTypes from 'prop-types';
import { Home, Trash2, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

/**
 * The client's tracked property interests, or the empty state when there are
 * none. Moved out of `PropertyInterests.jsx` (Task 27) unchanged.
 */
const PropertyInterestList = ({
  interests, formatCurrency, getInterestBadge, confirm, onUpdateInterest, onDeleteInterest,
}) => (
  <>
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
                onUpdateInterest({
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
                if (ok) onDeleteInterest(interest.id);
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
  </>
);

PropertyInterestList.propTypes = {
  interests: PropTypes.array.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  getInterestBadge: PropTypes.func.isRequired,
  confirm: PropTypes.func.isRequired,
  onUpdateInterest: PropTypes.func.isRequired,
  onDeleteInterest: PropTypes.func.isRequired,
};

export default PropertyInterestList;

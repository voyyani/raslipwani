import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';
import MobilePropertyCard from '../../../components/admin/MobilePropertyCard';

/**
 * The mobile grid and list views, moved verbatim out of `AdminProperties.jsx`
 * (Task 22).
 */
const PropertyCardGrid = ({ properties, viewMode, onEdit, onDelete, onToggleFeatured }) => (
  <div className="lg:hidden">
    {/* Grid View */}
    {viewMode === 'grid' && (
      <div className="grid grid-cols-1 gap-3">
        {properties.map(property => (
          <MobilePropertyCard
            key={property.id}
            property={property}
            onView={() => onEdit(property)}
            onEdit={() => onEdit(property)}
            onDelete={() => onDelete(property.id)}
            onToggleFeatured={() => onToggleFeatured(property)}
          />
        ))}
      </div>
    )}

    {/* List View */}
    {viewMode === 'list' && (
      <div className="space-y-2">
        {properties.map(property => (
          <div
            key={property.id}
            className="bg-surface-raised rounded-lg shadow-sm border border-line p-3 flex items-center gap-3"
            onClick={() => onEdit(property)}
          >
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-surface-sunken rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="home" size={20} className="text-content-subtle" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-content text-sm truncate">{property.title}</h3>
              <p className="text-xs text-content-subtle truncate">{property.location}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-brand">
                  Ksh {parseFloat(property.price).toLocaleString()}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  property.status === 'available' ? 'bg-success-surface text-success-content' :
                  property.status === 'pending' ? 'bg-warning-surface text-warning-content' :
                  property.status === 'sold' ? 'bg-danger-surface text-danger-content' :
                  'bg-surface-sunken text-content'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
            <Icon name="chevron-right" className="text-content-on-media/80" />
          </div>
        ))}
      </div>
    )}
  </div>
);

PropertyCardGrid.propTypes = {
  properties: PropTypes.array.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleFeatured: PropTypes.func.isRequired,
};

export default PropertyCardGrid;

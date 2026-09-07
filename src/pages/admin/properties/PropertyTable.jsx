import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';

/**
 * The desktop properties table, moved verbatim out of `AdminProperties.jsx`
 * (Task 22).
 *
 * `sortField`/`sortDirection`/`onSort` are accepted per the Task 22 brief's
 * interface, but the original table had no clickable column headers — sorting
 * was driven entirely by `PropertyFilters`'s "Sort properties by" select, and
 * that control moves verbatim there rather than being re-wired here.
 */
// eslint-disable-next-line no-unused-vars -- onToggleFeatured is part of the Task 22 interface; the original desktop table had no featured toggle (only the mobile card did).
const PropertyTable = ({ properties, onEdit, onDelete, onToggleFeatured }) => (
  <div className="hidden lg:block overflow-x-auto rounded-lg border border-line shadow-sm">
    <table className="min-w-full divide-y divide-line">
      <thead className="bg-surface">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Property</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Location</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Price</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-surface-raised divide-y divide-line">
        {properties.map(property => (
          <tr key={property.id} className="hover:bg-surface transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                ) : (
                  <div className="bg-surface-sunken border-2 border-dashed rounded-md w-16 h-16 mr-4 flex items-center justify-center text-content-subtle">
                    <Icon name="times" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-content">{property.title}</div>
                  <div className="text-sm text-content-subtle">
                    {property.bedrooms} Beds, {property.bathrooms} Baths
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-content">{property.location}</div>
              <div className="text-sm text-content-subtle">
                {property.address}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-content">
              Ksh{parseFloat(property.price).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap capitalize text-content">
              {property.property_type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.status === 'available' ? 'bg-success-surface text-success-content' :
                property.status === 'pending' ? 'bg-warning-surface text-warning-content' :
                property.status === 'sold' ? 'bg-brand-subtle text-brand-content' :
                'bg-surface-sunken text-content'
              }`}>
                {property.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex space-x-3">
                <button
                  onClick={() => onEdit(property)}
                  className="text-brand hover:text-brand-content transition-colors"
                  title="Edit property"
                >
                  <Icon name="edit" size={20} />
                </button>
                <button
                  onClick={() => onDelete(property.id)}
                  className="text-danger-content hover:text-danger-content transition-colors"
                  title="Delete property"
                >
                  <Icon name="trash" size={20} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

PropertyTable.propTypes = {
  properties: PropTypes.array.isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleFeatured: PropTypes.func,
};

export default PropertyTable;

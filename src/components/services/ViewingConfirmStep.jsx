import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

/**
 * Step one of the viewing booking flow: the property, the chosen viewing
 * experience and its price on the left, what to expect on the right. Moved out
 * of `ViewingExperience.jsx` (Task 24) unchanged.
 */
const ViewingConfirmStep = ({ property, experience, formatPrice, onContinue }) => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold mb-3">Property Details</h3>
          <div className="bg-surface-sunken rounded-lg p-3 mb-4">
            <div className="flex items-start">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-20 h-20 object-cover rounded-lg mr-3"
                />
              ) : (
                <div className="bg-surface-sunken border-2 border-dashed rounded-xl w-20 h-20 flex items-center justify-center text-content-subtle mr-3">
                  <Icon name="home" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-md">{property.title}</h4>
                <p className="text-content-muted mb-1 text-sm">{property.location}</p>
                <p className="text-primary font-bold text-sm">
                  {formatPrice(property.price)}
                </p>
              </div>
            </div>
          </div>
        
          <div className="mb-4">
            <h4 className="font-bold mb-2 text-md">Selected Viewing Experience</h4>
            <div className="bg-brand-subtle rounded-lg p-3 border border-brand-subtle">
              <div className="flex items-center mb-1">
                <Icon name={experience?.icon} className="text-primary mr-2" />
                <h5 className="font-bold">
                  {experience?.title}
                </h5>
              </div>
              <p className="text-content-muted mb-2 text-sm">
                {experience?.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span>Duration:</span>
                <span>{experience?.duration}</span>
              </div>
            </div>
          </div>
        
          <div className="mt-4 bg-surface rounded-lg p-3">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium">Viewing Price:</span>
              <span className="font-bold">
                {experience?.price}
              </span>
            </div>
          </div>
        
          <button
            onClick={onContinue}
            className="w-full mt-4 bg-primary text-content-on-brand py-2.5 px-5 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
          >
            Continue to Schedule
          </button>
        </div>
      
        <div>
          <h3 className="text-lg font-bold mb-3">What to Expect</h3>
          <div className="space-y-3">
            <div className="bg-surface-raised border border-line rounded-lg p-3">
              <div className="flex items-start">
                <div className="bg-primary/10 p-1.5 rounded mr-2">
                  <Icon name="clock" size={14} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm">Preparation</h4>
                  <p className="text-xs text-content-muted">
                    Our agent will prepare the property for your viewing
                  </p>
                </div>
              </div>
            </div>
          
            <div className="bg-surface-raised border border-line rounded-lg p-3">
              <div className="flex items-start">
                <div className="bg-primary/10 p-1.5 rounded mr-2">
                  <Icon name="user" size={14} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm">Dedicated Agent</h4>
                  <p className="text-xs text-content-muted">
                    A specialized agent will guide you through the viewing
                  </p>
                </div>
              </div>
            </div>
          
            <div className="bg-surface-raised border border-line rounded-lg p-3">
              <div className="flex items-start">
                <div className="bg-primary/10 p-1.5 rounded mr-2">
                  <Icon name="file-alt" size={14} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-sm">Follow-Up</h4>
                  <p className="text-xs text-content-muted">
                    After the viewing, we'll provide a detailed summary
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
);

ViewingConfirmStep.propTypes = {
  property: PropTypes.object.isRequired,
  experience: PropTypes.object,
  formatPrice: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};

ViewingConfirmStep.defaultProps = {
  experience: undefined,
};

export default ViewingConfirmStep;

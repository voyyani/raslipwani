import React from 'react';

const PropertyManagement = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6 text-center">Property Management Service</h1>
        <div className="bg-amber-50 p-8 rounded-xl max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Under Development</h2>
          <p className="mb-6">
            This will be the specialized page for Property Management services. 
            It will include:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Management dashboard preview</li>
            <li>Tenant management tools</li>
            <li>Customized management form</li>
            <li>Maintenance request system</li>
          </ul>
          <div className="text-center">
            <a 
              href="/services" 
              className="inline-block bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark"
            >
              Back to Services
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;

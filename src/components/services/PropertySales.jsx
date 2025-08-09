import React from 'react';

const PropertySales = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6 text-center">Property Sales Service</h1>
        <div className="bg-blue-50 p-8 rounded-xl max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Under Development</h2>
          <p className="mb-6">
            This will be the specialized page for Property Sales services. 
            It will include:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Sales-specific features and benefits</li>
            <li>Customized sales form</li>
            <li>Market analysis tools</li>
            <li>Success stories and case studies</li>
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

export default PropertySales;

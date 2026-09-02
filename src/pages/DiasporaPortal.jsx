import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Home, 
  DollarSign, 
  FileText, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Settings,
  MessageSquare,
  Download,
  Video
} from 'lucide-react';

const DiasporaPortal = () => {
  const [, setActiveProperty] = useState(null);

  // Mock data - would come from API
  const myProperties = [
    {
      id: 1,
      address: '123 Kilimani Road, Nairobi',
      type: 'Apartment',
      status: 'Rented',
      tenant: 'UN Staff Member',
      monthlyRent: 1500,
      occupancy: 100,
      nextPayment: '2026-02-01',
      propertyValue: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      documents: ['Lease Agreement', 'Property Title', 'Insurance Policy'],
      maintenanceIssues: [],
      yearlyIncome: 18000,
      expenses: 2400
    },
    {
      id: 2,
      address: '45 Westlands Avenue, Nairobi',
      type: 'Commercial',
      status: 'Rented',
      tenant: 'Tech Startup',
      monthlyRent: 2500,
      occupancy: 100,
      nextPayment: '2026-02-01',
      propertyValue: 200000,
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      documents: ['Commercial Lease', 'Property Title', 'Tax Documents'],
      maintenanceIssues: [{ issue: 'AC unit maintenance', status: 'Scheduled', date: '2026-01-25' }],
      yearlyIncome: 30000,
      expenses: 4200
    }
  ];

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalMonthlyIncome = myProperties.reduce((sum, prop) => sum + prop.monthlyRent, 0);
  const totalPropertyValue = myProperties.reduce((sum, prop) => sum + prop.propertyValue, 0);
  const totalYearlyIncome = myProperties.reduce((sum, prop) => sum + prop.yearlyIncome, 0);
  const totalExpenses = myProperties.reduce((sum, prop) => sum + prop.expenses, 0);
  const netYearlyIncome = totalYearlyIncome - totalExpenses;

  return (
    <>
      <Helmet>
        <title>Diaspora Property Portal | Manage Your Nairobi Investments | Raslipwani</title>
        <meta 
          name="description" 
          content="Manage your Nairobi properties from anywhere. Real-time income tracking, tenant management, maintenance coordination, and detailed reporting for diaspora investors." 
        />
      </Helmet>
      
      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Diaspora Property Portal
            </h1>
            <p className="text-lg text-gray-600">
              Manage your Nairobi investments from anywhere in the world
            </p>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Portfolio Value</span>
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalPropertyValue)}</div>
              <div className="text-sm text-green-600 mt-1">↑ 12% this year</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monthly Income</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalMonthlyIncome)}</div>
              <div className="text-sm text-gray-500 mt-1">100% collected</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Annual ROI</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {((netYearlyIncome / totalPropertyValue) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-600 mt-1">Above target</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Properties</span>
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{myProperties.length}</div>
              <div className="text-sm text-gray-500 mt-1">All occupied</div>
            </div>
          </div>

          {/* Properties List */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {myProperties.map((property) => (
              <div 
                key={property.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setActiveProperty(property)}
              >
                <div className="relative h-48">
                  <img 
                    src={property.imageUrl} 
                    alt={property.address}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {property.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{property.address}</h3>
                  <p className="text-gray-600 mb-4">{property.type} • {property.tenant}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Monthly Rent</div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(property.monthlyRent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Property Value</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(property.propertyValue)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      Next payment: {new Date(property.nextPayment).toLocaleDateString()}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      View Details →
                    </button>
                  </div>

                  {property.maintenanceIssues.length > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {property.maintenanceIssues.length} maintenance item(s)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Virtual Inspections</h3>
              <p className="text-gray-600 mb-4">
                Schedule live video property inspections from anywhere
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Schedule Inspection →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Document Management</h3>
              <p className="text-gray-600 mb-4">
                Access all property documents, leases, and reports
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                View Documents →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Communication</h3>
              <p className="text-gray-600 mb-4">
                Message tenants and property managers instantly
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Send Message →
              </button>
            </div>
          </div>

          {/* Income & Expenses Section */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Income Overview</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Gross Annual Income</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalYearlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Annual Expenses</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-gray-900">Net Annual Income</span>
                  <span className="font-bold text-green-600 text-xl">{formatCurrency(netYearlyIncome)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Annual Report
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-xs">FEB</div>
                    <div className="text-lg font-bold">01</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Rent Payment Due</div>
                    <div className="text-sm text-gray-600">123 Kilimani Road</div>
                    <div className="text-sm text-green-600 font-medium mt-1">{formatCurrency(1500)}</div>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-yellow-50 rounded-lg">
                  <div className="bg-yellow-600 text-white w-12 h-12 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-xs">JAN</div>
                    <div className="text-lg font-bold">25</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Maintenance Scheduled</div>
                    <div className="text-sm text-gray-600">45 Westlands Avenue</div>
                    <div className="text-sm text-yellow-600 font-medium mt-1">AC unit service</div>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="bg-gray-600 text-white w-12 h-12 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-xs">FEB</div>
                    <div className="text-lg font-bold">15</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Property Inspection</div>
                    <div className="text-sm text-gray-600">All properties</div>
                    <div className="text-sm text-gray-600 mt-1">Quarterly review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Need Help Managing Your Properties?</h3>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Our team handles everything - tenant screening, rent collection, maintenance, 
              and monthly reporting - so you can enjoy passive income from abroad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all">
                Upgrade to Full Management
              </button>
              <button className="bg-blue-800 hover:bg-blue-900 px-8 py-3 rounded-lg font-semibold transition-all">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default DiasporaPortal;

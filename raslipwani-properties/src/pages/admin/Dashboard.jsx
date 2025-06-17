import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';

const AdminDashboard = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === `/admin${path}`;
  };
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Raslipwani Properties</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <div className="flex flex-grow">
          {/* Sidebar */}
          <aside className="bg-dark text-white w-64 min-h-screen p-4">
            <h2 className="text-xl font-bold mb-8 mt-4">Admin Dashboard</h2>
            
            <nav className="space-y-2">
              <Link 
                to="/admin" 
                className={`block p-3 rounded-md ${isActive('') || isActive('/') ? 'bg-primary' : 'hover:bg-gray-700'}`}
              >
                Dashboard Overview
              </Link>
              <Link 
                to="/admin/properties" 
                className={`block p-3 rounded-md ${isActive('/properties') ? 'bg-primary' : 'hover:bg-gray-700'}`}
              >
                Manage Properties
              </Link>
              <Link 
                to="/admin/viewings" 
                className={`block p-3 rounded-md ${isActive('/viewings') ? 'bg-primary' : 'hover:bg-gray-700'}`}
              >
                Viewing Appointments
              </Link>
              <Link 
                to="/admin/clients" 
                className={`block p-3 rounded-md ${isActive('/clients') ? 'bg-primary' : 'hover:bg-gray-700'}`}
              >
                Client Management
              </Link>
              <Link 
                to="/admin/inquiries" 
                className={`block p-3 rounded-md ${isActive('/inquiries') ? 'bg-primary' : 'hover:bg-gray-700'}`}
              >
                Contact Inquiries
              </Link>
              <Link 
                to="/admin/settings" 
                className={`block p-3 rounded-md ${isActive('/settings') ? 'bg-primary' : 'hover:bg-gray-700'}`}
              >
                Settings
              </Link>
            </nav>
          </aside>
          
          {/* Main content */}
          <main className="flex-grow p-6 bg-light">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Outlet />
              
              {/* Placeholder content for dashboard */}
              {location.pathname === '/admin' && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Total Properties</h3>
                      <p className="text-3xl font-bold text-primary">24</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Scheduled Viewings</h3>
                      <p className="text-3xl font-bold text-primary">12</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">New Inquiries</h3>
                      <p className="text-3xl font-bold text-primary">5</p>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <ul className="space-y-3">
                      {[1, 2, 3, 4].map(item => (
                        <li key={item} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 mr-3" />
                            <div>
                              <p>New property listing added</p>
                              <p className="text-sm text-gray-500">2 hours ago</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
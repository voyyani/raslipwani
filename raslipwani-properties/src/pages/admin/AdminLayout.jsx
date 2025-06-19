import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk, UserButton } from '@clerk/clerk-react'; // Import UserButton
import { FaHome, FaBuilding, FaCalendarAlt, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import Header from './AdminHeader';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useClerk();
  
  const isActive = (path) => {
    return location.pathname === `/admin${path}`;
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
          <div className="mb-8 mt-4">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1">Raslipwani Properties</p>
          </div>
          
          <nav className="space-y-1 flex-grow">
            <Link 
              to="/admin" 
              className={`flex items-center p-3 rounded-md ${
                isActive('') || isActive('/') 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaHome className="mr-3" />
              <span>Dashboard Overview</span>
            </Link>
            <Link 
              to="/admin/properties" 
              className={`flex items-center p-3 rounded-md ${
                isActive('/properties') 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaBuilding className="mr-3" />
              <span>Manage Properties</span>
            </Link>
            <Link 
              to="/admin/viewings" 
              className={`flex items-center p-3 rounded-md ${
                isActive('/viewings') 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaCalendarAlt className="mr-3" />
              <span>Viewing Appointments</span>
            </Link>
            <Link 
              to="/admin/clients" 
              className={`flex items-center p-3 rounded-md ${
                isActive('/clients') 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaUsers className="mr-3" />
              <span>Client Management</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex items-center mb-4 p-2">
              {/* Clerk UserButton for account management */}
              <div className="mr-3">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonPopoverCard: "bg-white text-gray-800",
                      userButtonPopoverActionButton: "hover:bg-gray-100",
                      userButtonPopoverActionButtonText: "text-gray-700",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </div>
              
              <div>
                <p className="font-medium">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-grow p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
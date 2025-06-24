import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk, UserButton } from '@clerk/clerk-react';
import { 
  FaHome, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUsers, 
  FaSignOutAlt, 
  FaBars,
  FaTimes
} from 'react-icons/fa';
import Header from './AdminHeader';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === `/admin${path}`;
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <Header />
      
      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <button 
          className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Sidebar */}
        <aside 
          className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white w-64 min-h-screen p-4 flex flex-col fixed lg:static z-40 transform transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="mb-8 mt-4 border-b border-gray-700 pb-4">
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-sm text-blue-300 mt-1">Raslipwani Properties</p>
          </div>
          
          <nav className="space-y-1 flex-grow">
            <Link 
              to="/admin" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center p-3 rounded-md transition-all ${
                isActive('') || isActive('/') 
                  ? 'bg-blue-600 shadow-lg text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FaHome className="mr-3 text-blue-300" />
              <span>Dashboard Overview</span>
            </Link>
            <Link 
              to="/admin/properties" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center p-3 rounded-md transition-all ${
                isActive('/properties') 
                  ? 'bg-blue-600 shadow-lg text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FaBuilding className="mr-3 text-blue-300" />
              <span>Manage Properties</span>
            </Link>
            <Link 
              to="/admin/viewings" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center p-3 rounded-md transition-all ${
                isActive('/viewings') 
                  ? 'bg-blue-600 shadow-lg text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FaCalendarAlt className="mr-3 text-blue-300" />
              <span>Viewing Appointments</span>
            </Link>
            <Link 
              to="/admin/clients" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center p-3 rounded-md transition-all ${
                isActive('/clients') 
                  ? 'bg-blue-600 shadow-lg text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FaUsers className="mr-3 text-blue-300" />
              <span>Client Management</span>
            </Link>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex items-center mb-4 p-2">
              <div className="mr-3">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-blue-400",
                      userButtonPopoverCard: "bg-white text-gray-800 rounded-xl shadow-xl",
                      userButtonPopoverActionButton: "hover:bg-gray-100 rounded-lg",
                      userButtonPopoverActionButtonText: "text-gray-700",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </div>
              
              <div>
                <p className="font-medium text-white">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-blue-300">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-grow p-4 lg:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
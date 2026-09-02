import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
import { 
  FaHome, 
  FaStar, 
  FaClock, 
  FaPlusCircle, 
  FaEdit, 
  FaEnvelope,
  FaCalendarAlt,
  FaUserFriends,
  FaDollarSign,
  FaBuilding
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { logger } from '../../utils/logger';
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    pendingProperties: 0,
    soldProperties: 0,
    totalBookings: 0,
    newBookings: 0,
    availableProperties: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBookings, setActiveBookings] = useState([]);

  // Format time difference for recent activities
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Fetch dashboard stats and recent activities
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch property stats
        const [
          { count: total }, 
          { count: featured }, 
          { count: pending },
          { count: sold },
          { count: available },
          { count: bookings },
          { count: newBookings },
          { data: upcomingBookings }
        ] = await Promise.all([
          supabase.from('properties').select('*', { count: 'exact' }),
          supabase.from('properties').select('*', { count: 'exact' }).eq('featured', true),
          supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'sold'),
          supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'available'),
          supabase.from('bookings').select('*', { count: 'exact' }),
          supabase.from('bookings')
            .select('*', { count: 'exact' })
            .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from('bookings')
            .select('id, name, appointment_at, service, viewing_type')
            .gte('appointment_at', new Date().toISOString())
            .order('appointment_at', { ascending: true })
            .limit(4)
        ]);
        
        setStats({
          totalProperties: total || 0,
          featuredProperties: featured || 0,
          pendingProperties: pending || 0,
          soldProperties: sold || 0,
          availableProperties: available || 0,
          totalBookings: bookings || 0,
          newBookings: newBookings || 0
        });
        
        setActiveBookings(upcomingBookings || []);

        // Fetch recent activities from both properties and bookings
        const [
          { data: propertiesActivities },
          { data: bookingsActivities }
        ] = await Promise.all([
          supabase
            .from('properties')
            .select('id, title, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('bookings')
            .select('id, name, service, viewing_type, type, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);
        
        // Format property activities
        const formattedProperties = propertiesActivities?.map(property => {
          const isNew = new Date(property.created_at).getTime() === new Date(property.updated_at).getTime();
          
          return {
            id: `property-${property.id}`,
            title: property.title,
            action: isNew ? 'added' : 'updated',
            timestamp: isNew ? property.created_at : property.updated_at,
            icon: isNew ? <FaPlusCircle className="text-green-500" /> : <FaEdit className="text-blue-500" />,
            type: 'property'
          };
        }) || [];
        
        // Format booking activities
        const formattedBookings = bookingsActivities?.map(booking => {
          let title = '';
          let icon = <FaCalendarAlt className="text-purple-500" />;
          
          if (booking.type === 'consultation') {
            title = `Consultation: ${booking.service}`;
          } else if (booking.type === 'viewing') {
            title = `Viewing: ${booking.viewing_type}`;
          } else if (booking.type === 'contact') {
            title = `Contact: ${booking.name}`;
            icon = <FaEnvelope className="text-orange-500" />;
          } else {
            title = `Booking: ${booking.name}`;
          }
          
          return {
            id: `booking-${booking.id}`,
            title,
            action: 'received',
            timestamp: booking.created_at,
            icon,
            type: 'booking'
          };
        }) || [];
        
        // Combine and sort activities
        const allActivities = [...formattedProperties, ...formattedBookings]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 8);
        
        setRecentActivities(allActivities);
      } catch (error) {
        logger.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Stats card component
  const StatCard = ({ title, value, icon, color, link }) => (
    <Link 
      to={link || '#'} 
      className={`bg-white border border-${color}-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex items-start">
        <div className={`bg-${color}-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-4 group-hover:bg-${color}-200 transition-colors flex-shrink-0`}>
          {React.cloneElement(icon, { className: `text-${color}-600 text-lg sm:text-xl` })}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-1 truncate">{title}</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </Link>
  );

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Raslipwani Properties</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your property portfolio and business performance</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            <StatCard 
              title="Total Properties" 
              value={stats.totalProperties} 
              icon={<FaBuilding />} 
              color="blue" 
              link="/admin/properties"
            />
            
            <StatCard 
              title="Available" 
              value={stats.availableProperties} 
              icon={<FaHome />} 
              color="green" 
              link="/admin/properties?status=available"
            />
            
            <StatCard 
              title="Featured" 
              value={stats.featuredProperties} 
              icon={<FaStar />} 
              color="amber" 
              link="/admin/properties?filter=featured"
            />
            
            <StatCard 
              title="Pending Sale" 
              value={stats.pendingProperties} 
              icon={<FaDollarSign />} 
              color="yellow" 
              link="/admin/properties?status=pending"
            />
            
            <StatCard 
              title="Sold" 
              value={stats.soldProperties} 
              icon={<FaHome />} 
              color="green" 
              link="/admin/properties?status=sold"
            />
            
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings} 
              icon={<FaCalendarAlt />} 
              color="purple" 
              link="/admin/bookings"
            />
            
            <StatCard 
              title="New Bookings" 
              value={stats.newBookings} 
              icon={<FaUserFriends />} 
              color="indigo" 
              link="/admin/bookings?filter=recent"
            />
          </div>
          
          {/* Data Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
                <Link to="/admin/properties" className="text-blue-600 hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {recentActivities.map(activity => (
                    <div 
                      key={activity.id} 
                      className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="bg-gray-100 p-3 rounded-lg mr-4 mt-1 group-hover:bg-gray-200 transition-colors">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          <span className="capitalize">
                            {activity.type === 'property' ? 'Property ' : ''}
                            {activity.action}: 
                          </span>
                          <span className="text-blue-600 ml-1">{activity.title}</span>
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <FaClock className="mr-1.5 text-gray-400 text-xs" />
                          {timeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Upcoming Viewings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Upcoming Viewings</h3>
                <Link to="/admin/viewings" className="text-blue-600 hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              {activeBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming viewings scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <FaCalendarAlt className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {booking.name || 'Client'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <FaClock className="mr-1.5 text-gray-400 text-xs" />
                          {formatDate(booking.appointment_at)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {booking.service || booking.viewing_type || 'Property Viewing'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { dashboardQueries } from '@/services/dashboard';
import Icon from '../../components/Icon';

// Module-level so the default doesn't create a new array/object identity
// every render (see src/pages/Properties.jsx:14 for the same pattern). It
// also covers the render that can land with isLoading false and data still
// undefined (query resolves between renders) — the same shape the previous
// useState(...) initializer defaulted to before any fetch completed.
const EMPTY_BOOKINGS = [];
const EMPTY_ACTIVITIES = [];
const EMPTY_STATS = {
  properties: { total: 0, featured: 0, pending: 0, sold: 0, available: 0 },
  bookings: { total: 0, pending: 0 },
  upcoming: EMPTY_BOOKINGS,
  recentProperties: EMPTY_ACTIVITIES,
  recentBookings: EMPTY_ACTIVITIES,
};

const Dashboard = () => {
  const { data: stats = EMPTY_STATS, isLoading: loading } = useQuery(dashboardQueries.stats());

  const activeBookings = stats.upcoming;

  // Recent activity is a client-side merge of the two lists the service
  // fetches, not a fetch of its own — recomputed only when the stats change.
  const recentActivities = useMemo(() => {
    // Format property activities
    const formattedProperties = (stats.recentProperties ?? []).map(property => {
      const isNew = new Date(property.created_at).getTime() === new Date(property.updated_at).getTime();

      return {
        id: `property-${property.id}`,
        title: property.title,
        action: isNew ? 'added' : 'updated',
        timestamp: isNew ? property.created_at : property.updated_at,
        icon: isNew ? <Icon name="plus-circle" className="text-success-content" /> : <Icon name="edit" className="text-brand" />,
        type: 'property'
      };
    });

    // Format booking activities
    const formattedBookings = (stats.recentBookings ?? []).map(booking => {
      let title = '';
      let icon = <Icon name="calendar" className="text-purple-500" />;

      if (booking.type === 'consultation') {
        title = `Consultation: ${booking.service}`;
      } else if (booking.type === 'viewing') {
        title = `Viewing: ${booking.viewing_type}`;
      } else if (booking.type === 'contact') {
        title = `Contact: ${booking.name}`;
        icon = <Icon name="envelope" className="text-orange-500" />;
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
    });

    // Combine and sort activities
    return [...formattedProperties, ...formattedBookings]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);
  }, [stats]);

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
  
  // Stats card component
  const StatCard = ({ title, value, icon, color, link }) => (
    <Link 
      to={link || '#'} 
      className={`bg-surface-raised border border-${color}-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex items-start">
        <div className={`bg-${color}-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-4 group-hover:bg-${color}-200 transition-colors flex-shrink-0`}>
          {React.cloneElement(icon, { className: `text-${color}-600 text-lg sm:text-xl` })}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-content-muted mb-1 truncate">{title}</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-content">{value}</p>
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
        <h1 className="text-2xl md:text-3xl font-bold text-content">Dashboard Overview</h1>
        <p className="text-content-muted mt-1">Monitor your property portfolio and business performance</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            <StatCard 
              title="Total Properties" 
              value={stats.properties.total}
              icon={<Icon name="building" />} 
              color="blue" 
              link="/admin/properties"
            />
            
            <StatCard 
              title="Available" 
              value={stats.properties.available}
              icon={<Icon name="home" />} 
              color="green" 
              link="/admin/properties?status=available"
            />
            
            <StatCard 
              title="Featured" 
              value={stats.properties.featured}
              icon={<Icon name="star" />} 
              color="amber" 
              link="/admin/properties?filter=featured"
            />
            
            <StatCard 
              title="Pending Sale" 
              value={stats.properties.pending}
              icon={<Icon name="dollar-sign" />} 
              color="yellow" 
              link="/admin/properties?status=pending"
            />
            
            <StatCard 
              title="Sold" 
              value={stats.properties.sold}
              icon={<Icon name="home" />} 
              color="green" 
              link="/admin/properties?status=sold"
            />
            
            <StatCard 
              title="Total Bookings" 
              value={stats.bookings.total}
              icon={<Icon name="calendar" />} 
              color="purple" 
              link="/admin/bookings"
            />
            
            <StatCard 
              title="New Bookings" 
              value={stats.bookings.pending} 
              icon={<Icon name="user-friends" />} 
              color="indigo" 
              link="/admin/bookings?filter=recent"
            />
          </div>
          
          {/* Data Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Activity */}
            <div className="bg-surface-raised border border-line rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-content">Recent Activity</h3>
                <Link to="/admin/properties" className="text-brand hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-content-subtle">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {recentActivities.map(activity => (
                    <div 
                      key={activity.id} 
                      className="flex items-start border-b border-line pb-4 last:border-0 last:pb-0 group hover:bg-surface p-2 rounded-lg transition-colors"
                    >
                      <div className="bg-surface-sunken p-3 rounded-lg mr-4 mt-1 group-hover:bg-surface-sunken transition-colors">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-content">
                          <span className="capitalize">
                            {activity.type === 'property' ? 'Property ' : ''}
                            {activity.action}: 
                          </span>
                          <span className="text-brand ml-1">{activity.title}</span>
                        </p>
                        <p className="text-sm text-content-subtle flex items-center mt-1">
                          <Icon name="clock" size={12} className="mr-1.5 text-content-subtle" />
                          {timeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Upcoming Viewings */}
            <div className="bg-surface-raised border border-line rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-content">Upcoming Viewings</h3>
                <Link to="/admin/viewings" className="text-brand hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              {activeBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-content-subtle">No upcoming viewings scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className="flex items-start border-b border-line pb-4 last:border-0 last:pb-0 group hover:bg-surface p-3 rounded-lg transition-colors"
                    >
                      <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <Icon name="calendar" className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-content">
                          {booking.name || 'Client'}
                        </p>
                        <p className="text-sm text-content-subtle mt-1 flex items-center">
                          <Icon name="clock" size={12} className="mr-1.5 text-content-subtle" />
                          {formatDate(booking.appointment_at)}
                        </p>
                        <p className="text-sm text-content-muted mt-2">
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
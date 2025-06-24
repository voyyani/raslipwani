import { FaCalendarCheck, FaList, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';

const BookingFilters = ({
  searchTerm,
  setSearchTerm,
  viewFilter,
  setViewFilter,
  statusFilter,
  setStatusFilter,
  statusCounts,
  viewType,
  setViewType,
  setCurrentPage,
  dateRange,
  setDateRange,
  calendarViewMode,
  setCalendarViewMode
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Viewing Appointments</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaCalendarCheck />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewFilter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewFilter === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewType('list')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewType === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaList className="mr-2" /> List View
          </button>
          <button
            onClick={() => setViewType('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewType === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaCalendarDay className="mr-2" /> Calendar View
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Date Range Selector for List View */}
          {viewType === 'list' && (
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setDateRange('today')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-l border-r border-gray-300`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                This Month
              </button>
            </div>
          )}
          
          {/* Calendar View Mode Selector */}
          {viewType === 'calendar' && (
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setCalendarViewMode('day')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  calendarViewMode === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaCalendarAlt className="mr-2" /> Day
              </button>
              <button
                onClick={() => setCalendarViewMode('week')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  calendarViewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-l border-r border-gray-300`}
              >
                <FaCalendarWeek className="mr-2" /> Week
              </button>
              <button
                onClick={() => setCalendarViewMode('month')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  calendarViewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaCalendarAlt className="mr-2" /> Month
              </button>
            </div>
          )}
          
          {/* Status Filter Buttons */}
          {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                statusFilter === status
                  ? status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                    : status === 'confirmed' ? 'bg-green-100 text-green-800'
                    : status === 'cancelled' ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default BookingFilters;
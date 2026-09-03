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
          <h1 className="text-2xl font-bold text-content">Viewing Appointments</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-line-strong rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-focus-ring focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-subtle">
              <FaCalendarCheck />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewFilter === 'active'
                  ? 'bg-brand text-white'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewFilter === 'archived'
                  ? 'bg-brand text-white'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
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
                ? 'bg-brand text-white'
                : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
            }`}
          >
            <FaList className="mr-2" /> List View
          </button>
          <button
            onClick={() => setViewType('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              viewType === 'calendar'
                ? 'bg-brand text-white'
                : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
            }`}
          >
            <FaCalendarDay className="mr-2" /> Calendar View
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Date Range Selector for List View */}
          {viewType === 'list' && (
            <div className="flex items-center border border-line-strong rounded-lg overflow-hidden">
              <button
                onClick={() => setDateRange('today')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'today'
                    ? 'bg-brand text-white'
                    : 'bg-surface-raised text-content-muted hover:bg-surface'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'week'
                    ? 'bg-brand text-white'
                    : 'bg-surface-raised text-content-muted hover:bg-surface'
                } border-l border-r border-line-strong`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  dateRange === 'month'
                    ? 'bg-brand text-white'
                    : 'bg-surface-raised text-content-muted hover:bg-surface'
                }`}
              >
                This Month
              </button>
            </div>
          )}
          
          {/* Calendar View Mode Selector */}
          {viewType === 'calendar' && (
            <div className="flex items-center border border-line-strong rounded-lg overflow-hidden">
              <button
                onClick={() => setCalendarViewMode('day')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  calendarViewMode === 'day'
                    ? 'bg-brand text-white'
                    : 'bg-surface-raised text-content-muted hover:bg-surface'
                }`}
              >
                <FaCalendarAlt className="mr-2" /> Day
              </button>
              <button
                onClick={() => setCalendarViewMode('week')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  calendarViewMode === 'week'
                    ? 'bg-brand text-white'
                    : 'bg-surface-raised text-content-muted hover:bg-surface'
                } border-l border-r border-line-strong`}
              >
                <FaCalendarWeek className="mr-2" /> Week
              </button>
              <button
                onClick={() => setCalendarViewMode('month')}
                className={`px-4 py-2 text-sm font-medium flex items-center ${
                  calendarViewMode === 'month'
                    ? 'bg-brand text-white'
                    : 'bg-surface-raised text-content-muted hover:bg-surface'
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
                  ? status === 'pending' ? 'bg-warning-surface text-warning-content'
                    : status === 'confirmed' ? 'bg-success-surface text-success-content'
                    : status === 'cancelled' ? 'bg-danger-surface text-danger-content'
                    : 'bg-brand-subtle text-brand-content'
                  : 'bg-surface-sunken text-content-muted hover:bg-surface-sunken'
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
import { useState } from 'react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV, formatClientsForExport } from '../../utils/exportUtils';
import { formatDate } from '../../utils/dateUtils';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { Users, Plus, Search, Download, X, Eye, Edit2, Trash2 } from 'lucide-react';
import ClientForm from './ClientForm';
import { useNavigate } from 'react-router-dom';

const ClientManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const itemsPerPage = 20;

  // Fetch clients with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', page, debouncedSearch, statusFilter, typeFilter, budgetFilter],
    queryFn: async () => {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // Search filter
      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`);
      }

      // Status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Type filter
      if (typeFilter !== 'all') {
        query = query.eq('client_type', typeFilter);
      }

      // Budget filter
      if (budgetFilter !== 'all') {
        const budgetRanges = {
          '0-500k': { min: 0, max: 500000 },
          '500k-1m': { min: 500000, max: 1000000 },
          '1m-5m': { min: 1000000, max: 5000000 },
          '5m+': { min: 5000000, max: 999999999 }
        };
        const range = budgetRanges[budgetFilter];
        if (range) {
          query = query.gte('budget_max', range.min).lte('budget_min', range.max);
        }
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        clients: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / itemsPerPage)
      };
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Client deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    }
  });

  // Handlers
  const handleEdit = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = (client) => {
    setDeleteConfirm(client);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  const handleExport = () => {
    if (data?.clients) {
      const formattedData = formatClientsForExport(data.clients);
      exportToCSV(formattedData, 'clients');
      toast.success('Clients exported successfully');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setBudgetFilter('all');
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || budgetFilter !== 'all' || searchTerm !== '';

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || colors.lead}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Lead'}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading clients: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            Client Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage clients & track communication
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-600 text-xs sm:text-sm">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.totalCount || 0}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-600 text-xs sm:text-sm">Active</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {data?.clients.filter(c => c.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-600 text-xs sm:text-sm">Prospects</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">
            {data?.clients.filter(c => c.status === 'prospect').length || 0}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-600 text-xs sm:text-sm">Leads</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            {data?.clients.filter(c => c.status === 'lead').length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="investor">Investor</option>
              <option value="other">Other</option>
            </select>

            {/* Budget Filter */}
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Budget</option>
              <option value="0-500k">&lt; 500K</option>
              <option value="500k-1m">500K-1M</option>
              <option value="1m-5m">1M-5M</option>
              <option value="5m+">5M+</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
              disabled={!data?.clients.length}
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Export</span>
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton type="table" rows={10} />
      ) : data?.clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first client'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {client.first_name?.[0]}{client.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                          {client.company && (
                            <div className="text-sm text-gray-500">{client.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {client.client_type || 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.budget_min && client.budget_max ? (
                        <div>
                          <div>{formatCurrency(client.budget_min)}</div>
                          <div className="text-gray-500">to {formatCurrency(client.budget_max)}</div>
                        </div>
                      ) : (
                        'Not specified'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={client.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/clients/${client.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {data.clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg shadow border border-gray-200 p-3 sm:p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {client.first_name} {client.last_name}
                    </h3>
                    {client.company && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{client.company}</p>
                    )}
                    <StatusBadge status={client.status} />
                  </div>
                </div>
                
                <div className="space-y-2 text-xs sm:text-sm mb-3">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Email:</span>
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Phone:</span>
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Type:</span>
                    <span className="capitalize">{client.client_type || 'Individual'}</span>
                  </div>
                  {client.budget_min && client.budget_max && (
                    <div className="text-gray-600">
                      <span className="font-medium">Budget:</span> {formatCurrency(client.budget_min)} - {formatCurrency(client.budget_max)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * itemsPerPage, data.totalCount)}
                    </span>{' '}
                    of <span className="font-medium">{data.totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(data.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === data.totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return (
                          <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Client Form Modal */}
      {isFormOpen && (
        <ClientForm
          client={editingClient}
          onClose={handleFormClose}
          onSuccess={() => {
            queryClient.invalidateQueries(['clients']);
            handleFormClose();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteConfirm)}
        title="Delete client"
        message={
          deleteConfirm
            ? `Delete ${deleteConfirm.first_name} ${deleteConfirm.last_name}? Their enquiry history goes with them, and this cannot be undone.`
            : ''
        }
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete client'}
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
};

export default ClientManagement;

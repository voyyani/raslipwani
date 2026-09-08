import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, Plus } from 'lucide-react';

import { clientQueries, deleteClient } from '@/services/clients';
import { queryKeys } from '@/services/queryKeys';
import { useDebounce } from '../../hooks/useDebounce';
import { useFilters } from '@/hooks/useFilters';
import { exportToCSV, formatClientsForExport } from '../../utils/exportUtils';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ClientForm from './ClientForm';
import ClientStatsCards from './clients/ClientStatsCards';
import ClientFiltersPanel from './clients/ClientFiltersPanel';
import ClientTable from './clients/ClientTable';
import ClientPagination from './clients/ClientPagination';

// A fresh `[]` default on every render would give a dependent effect a new
// array identity each time (src/pages/Properties.jsx:14).
const EMPTY_CLIENTS = [];

// The Budget filter's labels are UI vocabulary — clientQueries.page takes
// the resolved numeric bounds, not the bucket name.
const BUDGET_RANGES = {
  '0-500k': { min: 0, max: 500000 },
  '500k-1m': { min: 500000, max: 1000000 },
  '1m-5m': { min: 1000000, max: 5000000 },
  '5m+': { min: 5000000, max: 999999999 },
};

const INITIAL_FILTERS = { search: '', status: 'all', type: 'all', budget: 'all' };
const ITEMS_PER_PAGE = 20;

const ClientManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { filters, setFilter, resetFilters, isFiltered } = useFilters(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Any change to a filter puts the visitor back on page one — page 7 of the
  // old result set is rarely page 7 of the new one. This used to be repeated
  // in three of the four controls, and missing from the fourth.
  const handleFilterChange = (name, value) => {
    setFilter(name, value);
    setPage(1);
  };

  // Fetch clients with filters. The budget bucket is resolved to numeric
  // bounds here and threaded through clientQueries.page so they land in the
  // query key too — otherwise the cache would serve one budget's results
  // for another.
  const budgetRange = BUDGET_RANGES[filters.budget];
  const { data: { rows: clients, count: totalCount } = { rows: EMPTY_CLIENTS, count: 0 }, isLoading, error } = useQuery(
    clientQueries.page({
      page,
      pageSize: ITEMS_PER_PAGE,
      status: filters.status,
      clientType: filters.type,
      search: debouncedSearch,
      budgetMin: budgetRange?.min,
      budgetMax: budgetRange?.max,
    })
  );

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      toast.success('Client deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(`Failed to delete client: ${err.message}`);
    }
  });

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  const handleExport = () => {
    if (clients) {
      const formattedData = formatClientsForExport(clients);
      exportToCSV(formattedData, 'clients');
      toast.success('Clients exported successfully');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const clearFilters = () => {
    resetFilters();
    setPage(1);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-danger-surface border border-danger-border rounded-lg p-4">
          <p className="text-danger-content">Error loading clients: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-content flex items-center gap-2">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            Client Management
          </h1>
          <p className="text-sm sm:text-base text-content-muted mt-1">
            Manage clients &amp; track communication
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-brand text-content-on-brand px-3 sm:px-4 py-2 rounded-lg hover:bg-brand-hover flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Client
        </button>
      </div>

      <ClientStatsCards clients={clients} totalCount={totalCount || 0} />

      <ClientFiltersPanel
        filters={filters}
        hasActiveFilters={isFiltered}
        canExport={clients.length > 0}
        onFilterChange={handleFilterChange}
        onReset={clearFilters}
        onExport={handleExport}
      />

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton type="table" rows={10} />
      ) : clients.length === 0 ? (
        <div className="bg-surface-raised rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-content-subtle mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-content mb-2">No clients found</h3>
          <p className="text-content-muted mb-4">
            {isFiltered ? 'Try adjusting your filters' : 'Get started by adding your first client'}
          </p>
          {!isFiltered && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-brand text-content-on-brand px-6 py-2 rounded-lg hover:bg-brand-hover"
            >
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <>
          <ClientTable
            clients={clients}
            onView={(client) => navigate(`/admin/clients/${client.id}`)}
            onEdit={handleEdit}
            onDelete={setDeleteConfirm}
          />

          <ClientPagination
            page={page}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalCount={totalCount || 0}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Client Form Modal */}
      {isFormOpen && (
        <ClientForm
          client={editingClient}
          onClose={handleFormClose}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
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

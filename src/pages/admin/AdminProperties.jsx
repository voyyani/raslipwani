import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyQueries, deleteProperty, setFeatured } from '@/services/properties';
import { queryKeys } from '@/services/queryKeys';
import { useDebounce } from '../../hooks/useDebounce';
import { useFilters } from '../../hooks/useFilters';
import { usePagination } from '../../hooks/usePagination';
import { exportToCSV, formatPropertiesForExport } from '../../utils/exportUtils';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { logger } from '../../utils/logger';
import useConfirm from '../../components/ui/useConfirm';
import Icon from '../../components/Icon';

import PropertyStatsCards from './properties/PropertyStatsCards';
import PropertyFilters from './properties/PropertyFilters';
import PropertyTable from './properties/PropertyTable';
import PropertyCardGrid from './properties/PropertyCardGrid';
import PropertyFormModal from './properties/PropertyFormModal';
import PropertyPagination from './properties/PropertyPagination';

// A stable reference: `properties` defaults to this when the page query has
// no data yet, so components reading it don't see a fresh `[]` identity every
// render (see src/pages/Properties.jsx for the effect this avoids elsewhere).
const EMPTY_PROPERTIES = [];

const INITIAL_FILTERS = {
  search: '',
  status: 'all',
  purpose: 'all',
  sortField: 'created_at',
  sortDirection: 'desc',
  showMobileFilters: false,
  mobileViewMode: 'grid',
};

const AdminProperties = () => {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  // Gates the table/grid/pagination while a mutation is in flight — restored
  // from the pre-Task-22 `loading = isPageLoading || isSubmitting`. Losing
  // this let a second click hit the same (or another) row's Delete button
  // while the first delete was still running.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { filters, setFilter, activeCount } = useFilters(INITIAL_FILTERS);
  const debouncedSearchTerm = useDebounce(filters.search, 500);

  // usePagination's totalPages lags the query by one render — it can only
  // know the total once the page it asked for comes back.
  const [totalCount, setTotalCount] = useState(0);
  const pagination = usePagination({ pageSize: 20, totalCount });

  // Properties, one page at a time; `listPage` owns the range arithmetic.
  const {
    data: { rows: properties = EMPTY_PROPERTIES, count: fetchedCount = 0 } = {},
    isLoading: isPageLoading,
  } = useQuery(
    propertyQueries.page({
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortField: filters.sortField,
      sortDirection: filters.sortDirection,
      search: debouncedSearchTerm || undefined,
    })
  );
  const loading = isPageLoading || isSubmitting;

  useEffect(() => {
    setTotalCount(fetchedCount);
  }, [fetchedCount]);

  const invalidateProperties = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });

  // Export properties to CSV
  const handleExport = () => {
    try {
      const formattedData = formatPropertiesForExport(properties);
      exportToCSV(formattedData, `properties-${new Date().toISOString().split('T')[0]}`);
      toast.success(`Exported ${properties.length} properties`);
    } catch {
      toast.error('Failed to export properties');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilter(name, value);
    if (name === 'search') {
      pagination.reset();
    }
  };

  const handleFilterReset = () => {
    setFilter('status', 'all');
    setFilter('purpose', 'all');
  };

  const handleDelete = async (id) => {
    // Name the listing. "Are you sure you want to delete this property?" is the
    // same sentence for every row, so it cannot catch the mistake it exists to
    // catch — deleting the wrong one.
    const property = properties.find((p) => p.id === id);
    const ok = await confirm({
      title: 'Delete property',
      message: property
        ? `"${property.title}" will be permanently deleted. This cannot be undone.`
        : 'This property will be permanently deleted. This cannot be undone.',
      confirmLabel: 'Delete property',
    });
    if (!ok) return;

    try {
      setIsSubmitting(true);
      await deleteProperty(id);
      invalidateProperties();
      toast.success('Property deleted successfully!');
    } catch (error) {
      toast.error('Error deleting property: ' + error.message);
      toast.error('Failed to delete property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (property) => {
    try {
      const newFeaturedValue = !property.featured;

      logger.debug('Toggling featured for property:', property.id, 'to:', newFeaturedValue);

      // Plain client: the Supabase Auth session carries admin identity, and the
      // "admins manage properties" policy in 009 authorises this write.
      await setFeatured(property.id, newFeaturedValue);

      // Invalidate the whole properties domain: the admin table, the featured
      // strip and every open detail all read from one root key.
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });

      toast.success(newFeaturedValue ? 'Added to featured' : 'Removed from featured');
    } catch (error) {
      logger.error('Toggle featured error:', error);
      toast.error(`Failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Filter properties for mobile
  const filteredProperties = properties.filter(p => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.purpose !== 'all' && p.purpose !== filters.purpose) return false;
    return true;
  });

  const openEditForm = (property) => {
    setCurrentProperty(property);
    setIsModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Manage Properties | Raslipwani Properties</title>
      </Helmet>

      {/* Stats Cards */}
      <PropertyStatsCards properties={properties} totalCount={totalCount} />
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-content">Manage Properties</h1>
          <p className="text-sm sm:text-base text-content-muted">{totalCount} properties total</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <PropertyFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
            activeCount={activeCount}
            showMobileControls={!loading && properties.length > 0}
          />
          <button
            onClick={handleExport}
            className="bg-success-content hover:bg-success-content text-content-on-brand px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center shadow-md text-sm sm:text-base"
            title="Export to CSV"
          >
            <Icon name="download" className="mr-2" /> <span className="hidden sm:inline">Export</span><span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={() => {
              setCurrentProperty(null);
              setIsModalOpen(true);
            }}
            className="bg-brand hover:bg-brand-hover text-content-on-brand px-4 py-2 rounded-lg flex items-center shadow-md"
          >
            <Icon name="plus" className="mr-2" /> Add Property
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={5} />
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-line">
          <h3 className="text-xl mb-4 text-content-muted">No properties found</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-content-on-brand px-6 py-2.5 rounded-lg shadow-md"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <>
          <PropertyTable
            properties={properties}
            sortField={filters.sortField}
            sortDirection={filters.sortDirection}
            onSort={(field) => handleFilterChange('sortField', field)}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onToggleFeatured={handleToggleFeatured}
          />
          <PropertyCardGrid
            properties={filteredProperties}
            viewMode={filters.mobileViewMode}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onToggleFeatured={handleToggleFeatured}
          />
        </>
      )}

      <PropertyPagination
        pagination={pagination}
        totalCount={totalCount}
        loading={loading}
      />

      <PropertyFormModal
        isOpen={isModalOpen}
        property={currentProperty}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentProperty(null);
        }}
        onSaved={invalidateProperties}
        onSubmittingChange={setIsSubmitting}
      />
      {confirmDialog}
    </>
  );
};

export default AdminProperties;
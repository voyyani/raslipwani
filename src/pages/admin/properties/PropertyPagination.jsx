import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../../components/Icon';

/**
 * The property list's pager, driven by `usePagination`. Moved out of
 * `AdminProperties.jsx` (Task 27) unchanged.
 */
const PropertyPagination = ({ pagination, totalCount, loading }) => (
  <>
{!loading && totalCount > 0 && (
  <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row items-center justify-between">
    <div className="text-xs sm:text-sm text-content-muted text-center sm:text-left">
      Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, totalCount)} of {totalCount}
    </div>
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={() => pagination.previousPage()}
        disabled={pagination.page === 1}
        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center text-xs sm:text-sm ${
          pagination.page === 1
            ? 'bg-surface-sunken text-content-subtle cursor-not-allowed'
            : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
        }`}
      >
        <Icon name="chevron-left" className="mr-0 sm:mr-1" /> <span className="hidden xs:inline">Prev</span>
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
          .filter(page => {
            return page === 1 ||
                   page === pagination.totalPages ||
                   Math.abs(page - pagination.page) <= 1;
          })
          .map((page, index, arr) => (
            <React.Fragment key={page}>
              {index > 0 && arr[index - 1] !== page - 1 && (
                <span className="px-1 text-content-subtle text-xs sm:text-sm">...</span>
              )}
              <button
                onClick={() => pagination.setPage(page)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                  pagination.page === page
                    ? 'bg-brand text-content-on-brand'
                    : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          ))}
      </div>
      <button
        onClick={() => pagination.nextPage()}
        disabled={pagination.page === pagination.totalPages}
        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center text-xs sm:text-sm ${
          pagination.page === pagination.totalPages
            ? 'bg-surface-sunken text-content-subtle cursor-not-allowed'
            : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
        }`}
      >
        <span className="hidden xs:inline">Next</span> <Icon name="chevron-right" className="ml-0 sm:ml-1" />
      </button>
    </div>
  </div>
)}
  </>
);

PropertyPagination.propTypes = {
  pagination: PropTypes.object.isRequired,
  totalCount: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default PropertyPagination;

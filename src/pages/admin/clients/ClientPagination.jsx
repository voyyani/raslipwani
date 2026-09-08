import React from 'react';
import PropTypes from 'prop-types';

/**
 * The client list's pager. Moved out of `ClientManagement.jsx` (Task 26)
 * unchanged, window of pages and all.
 */
const ClientPagination = ({ page, totalPages, itemsPerPage, totalCount, onPageChange }) => (
  <>
{totalPages > 1 && (
  <div className="bg-surface-raised px-4 py-3 flex items-center justify-between border-t border-line sm:px-6 mt-4 rounded-lg shadow">
    <div className="flex-1 flex justify-between sm:hidden">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="relative inline-flex items-center px-4 py-2 border border-line-strong text-sm font-medium rounded-md text-content-muted bg-surface-raised hover:bg-surface disabled:opacity-50"
      >
        Previous
      </button>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="ml-3 relative inline-flex items-center px-4 py-2 border border-line-strong text-sm font-medium rounded-md text-content-muted bg-surface-raised hover:bg-surface disabled:opacity-50"
      >
        Next
      </button>
    </div>
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-content-muted">
          Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(page * itemsPerPage, totalCount)}
          </span>{' '}
          of <span className="font-medium">{totalCount}</span> results
        </p>
      </div>
      <div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-line-strong bg-surface-raised text-sm font-medium text-content-subtle hover:bg-surface disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, idx) => {
            const pageNum = idx + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pageNum
                      ? 'z-10 bg-brand-subtle border-brand text-brand'
                      : 'bg-surface-raised border-line-strong text-content-subtle hover:bg-surface'
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === page - 2 || pageNum === page + 2) {
              return (
                <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-line-strong bg-surface-raised text-sm font-medium text-content-muted">
                  ...
                </span>
              );
            }
            return null;
          })}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-line-strong bg-surface-raised text-sm font-medium text-content-subtle hover:bg-surface disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  </div>
)}
  </>
);

ClientPagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default ClientPagination;

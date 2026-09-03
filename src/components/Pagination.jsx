import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-4 py-2 border-y border-line-strong text-sm ${
            currentPage === i
              ? 'bg-brand text-white border-brand'
              : 'bg-surface-raised text-content-muted hover:bg-surface'
          } ${i === startPage ? 'border-l rounded-l-md' : ''} ${
            i === endPage ? 'border-r rounded-r-md' : ''
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-4 py-2 border border-line-strong text-sm ${
                1 === currentPage
                  ? 'bg-brand text-white'
                  : 'bg-surface-raised text-content-muted hover:bg-surface'
              } border-r-0 rounded-l-md`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-3 py-2 border-y border-line-strong text-content-subtle">...</span>
            )}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-3 py-2 border-y border-line-strong text-content-subtle">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-4 py-2 border border-line-strong text-sm ${
                totalPages === currentPage
                  ? 'bg-brand text-white'
                  : 'bg-surface-raised text-content-muted hover:bg-surface'
              } border-l-0 rounded-r-md`}
            >
              {totalPages}
            </button>
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-surface border-t gap-4">
      <p className="text-sm text-content-muted">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} items
      </p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md text-sm ${
            currentPage === 1 
              ? 'bg-surface-sunken text-content-subtle cursor-not-allowed' 
              : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
          }`}
        >
          Previous
        </button>
        
        <div className="flex">
          {renderPageNumbers()}
        </div>
        
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md text-sm ${
            currentPage === totalPages 
              ? 'bg-surface-sunken text-content-subtle cursor-not-allowed' 
              : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
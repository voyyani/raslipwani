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
          className={`px-4 py-2 border-y border-gray-300 text-sm ${
            currentPage === i
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
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
              className={`px-4 py-2 border border-gray-300 text-sm ${
                1 === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-r-0 rounded-l-md`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-3 py-2 border-y border-gray-300 text-gray-500">...</span>
            )}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-3 py-2 border-y border-gray-300 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-4 py-2 border border-gray-300 text-sm ${
                totalPages === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
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
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t gap-4">
      <p className="text-sm text-gray-600">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} items
      </p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md text-sm ${
            currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
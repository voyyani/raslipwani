import { useCallback, useState } from 'react';
import { exportToCSV } from '@/utils/exportUtils';

/**
 * The export button's whole behaviour, once.
 *
 * Three screens each had their own copy: two of them downloaded a header-only
 * file when the filtered list was empty, and none of them cleared their
 * spinner if the download threw.
 */
export function useCsvExport({ filename, format }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportRows = useCallback(
    async (rows) => {
      setError(null);

      if (!rows?.length) {
        setError('There is nothing to export.');
        return;
      }

      setIsExporting(true);
      try {
        exportToCSV(format(rows), filename);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsExporting(false);
      }
    },
    [filename, format]
  );

  return { exportRows, isExporting, error };
}

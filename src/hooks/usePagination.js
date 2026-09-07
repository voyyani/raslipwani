import { useCallback, useMemo, useState } from 'react';

/**
 * 1-based page state, and the 0-based inclusive range Supabase wants.
 *
 * The conversion lives in src/services (listPage, listClientsPage) for the
 * query; this hook owns the same arithmetic for screens that page client-side,
 * and the two agree by construction because both are `(page - 1) * pageSize`.
 */
export function usePagination({ pageSize = 20, totalCount = 0 } = {}) {
  const [page, setPageState] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // A filter that shrinks the result set must not strand the view on a page
  // that no longer exists.
  const safePage = Math.min(page, totalPages);

  const setPage = useCallback(
    (next) => setPageState(() => Math.max(1, Math.min(next, Math.max(1, Math.ceil(totalCount / pageSize))))),
    [totalCount, pageSize]
  );

  const nextPage = useCallback(() => setPage(safePage + 1), [setPage, safePage]);
  const previousPage = useCallback(() => setPage(safePage - 1), [setPage, safePage]);
  const reset = useCallback(() => setPageState(1), []);

  const range = useMemo(() => {
    const from = (safePage - 1) * pageSize;
    return { from, to: from + pageSize - 1 };
  }, [safePage, pageSize]);

  return { page: safePage, pageSize, setPage, nextPage, previousPage, totalPages, range, reset };
}

import { logger } from '@/utils/logger';

/**
 * What a failed query looks like, decided once.
 *
 * Supabase returns `{ data, error }` rather than rejecting, so before this
 * module every call site had to remember to check `error` — and the ones that
 * forgot rendered `null` as though it were an empty result. A thrown error is
 * also what TanStack Query wants: `isError` only becomes true if the queryFn
 * rejects.
 */
export class ServiceError extends Error {
  constructor(message, { table, operation, cause } = {}) {
    super(message);
    this.name = 'ServiceError';
    this.table = table;
    this.operation = operation;
    this.cause = cause;
  }
}

function fail({ error }, { table, operation }) {
  // `logger` calls are dropped from production builds by the esbuild `drop` in
  // vite.config.js, so the full object is available in development and none of
  // it reaches a visitor's console. The thrown message carries no query text.
  logger.error(`[${table}.${operation}]`, error);
  throw new ServiceError(`${operation} failed on ${table}: ${error.message}`, {
    table,
    operation,
    cause: error,
  });
}

/** Single row or arbitrary payload. Returns `data` as-is, including null. */
export function unwrap(result, context) {
  if (result.error) fail(result, context);
  return result.data;
}

/** List query. Null data becomes `[]`, so no caller needs `data || []`. */
export function unwrapList(result, context) {
  if (result.error) fail(result, context);
  return result.data ?? [];
}

/** `.select('*', { count: 'exact' })`. Returns the page and the total together. */
export function unwrapCount(result, context) {
  if (result.error) fail(result, context);
  return { rows: result.data ?? [], count: result.count ?? 0 };
}

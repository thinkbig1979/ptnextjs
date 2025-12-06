/**
 * Pagination Types
 *
 * Common pagination types for API responses and data fetching.
 * Follows Payload CMS pagination structure for consistency.
 */

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Field to sort by (prefix with '-' for descending) */
  sort?: string;
  /** Sort order (defaults to 'desc') */
  order?: 'asc' | 'desc';
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Array of documents for current page */
  docs: T[];
  /** Total number of documents across all pages */
  totalDocs: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
  /** Number of documents on current page */
  limit: number;
  /** Number of documents skipped */
  offset: number;
  /** Next page number (null if no next page) */
  nextPage: number | null;
  /** Previous page number (null if no previous page) */
  prevPage: number | null;
}

/**
 * Pagination configuration constants
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size */
  DEFAULT_LIMIT: 20,
  /** Maximum page size */
  MAX_LIMIT: 100,
  /** Minimum page size */
  MIN_LIMIT: 1,
  /** Default page number */
  DEFAULT_PAGE: 1,
} as const;

/**
 * Validates and normalizes pagination parameters
 */
export function normalizePaginationParams(
  params?: Partial<PaginationParams>
): Required<PaginationParams> {
  const page = Math.max(
    PAGINATION_DEFAULTS.DEFAULT_PAGE,
    Number(params?.page) || PAGINATION_DEFAULTS.DEFAULT_PAGE
  );

  let limit = Number(params?.limit) || PAGINATION_DEFAULTS.DEFAULT_LIMIT;
  limit = Math.max(PAGINATION_DEFAULTS.MIN_LIMIT, limit);
  limit = Math.min(PAGINATION_DEFAULTS.MAX_LIMIT, limit);

  return {
    page,
    limit,
    sort: params?.sort || '-createdAt',
    order: params?.order || 'desc',
  };
}

/**
 * Calculates pagination metadata from query results
 */
export function calculatePaginationMetadata<T>(
  docs: T[],
  totalDocs: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const offset = (page - 1) * limit;

  return {
    docs,
    totalDocs,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    limit,
    offset,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
}

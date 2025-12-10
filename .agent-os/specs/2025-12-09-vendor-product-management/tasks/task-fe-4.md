# Task: Create useVendorProducts SWR Hook

## Metadata
- **ID**: task-fe-4
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 15-20 min
- **Dependencies**: task-be-3 (API endpoint)
- **Status**: pending

## Description

Create a custom SWR hook for fetching and managing vendor products. This hook provides data fetching, caching, and revalidation for the product list.

## Specifics

### File to Create
`hooks/useVendorProducts.ts`

### Hook Interface

```typescript
interface UseVendorProductsOptions {
  published?: boolean;
  limit?: number;
  page?: number;
}

interface UseVendorProductsReturn {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate: () => void;  // Force revalidation
}

function useVendorProducts(
  vendorId: string | null,
  options?: UseVendorProductsOptions
): UseVendorProductsReturn;
```

### Implementation

```typescript
'use client';

import useSWR from 'swr';
import type { Product } from '@/lib/types';

interface ProductsResponse {
  success: boolean;
  data?: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface UseVendorProductsOptions {
  published?: boolean;
  limit?: number;
  page?: number;
}

const fetcher = async (url: string): Promise<ProductsResponse> => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch products');
  }

  return data;
};

export function useVendorProducts(
  vendorId: string | null,
  options: UseVendorProductsOptions = {}
) {
  const { published, limit = 20, page = 1 } = options;

  // Build URL with query params
  const buildUrl = () => {
    if (!vendorId) return null;

    const params = new URLSearchParams();
    if (published !== undefined) {
      params.set('published', String(published));
    }
    params.set('limit', String(limit));
    params.set('page', String(page));

    const queryString = params.toString();
    return `/api/portal/vendors/${vendorId}/products${queryString ? `?${queryString}` : ''}`;
  };

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    buildUrl(),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  return {
    products: data?.data?.products || [],
    total: data?.data?.total || 0,
    page: data?.data?.page || 1,
    limit: data?.data?.limit || 20,
    isLoading,
    isError: !!error,
    error: error || null,
    mutate,
  };
}
```

## Acceptance Criteria

- [ ] Hook fetches products for given vendorId
- [ ] Returns empty array when vendorId is null
- [ ] Supports filtering by published status
- [ ] Supports pagination (limit, page)
- [ ] Loading state indicates data fetch in progress
- [ ] Error state captures API errors
- [ ] Mutate function forces revalidation
- [ ] Caching works (dedupingInterval)

## Usage Example

```tsx
// In ProductList component
const {
  products,
  isLoading,
  isError,
  mutate
} = useVendorProducts(vendorId);

// With options
const { products } = useVendorProducts(vendorId, {
  published: true,
  limit: 10,
  page: 2,
});

// After create/update/delete
const handleSuccess = async () => {
  await mutate();  // Refresh the list
};
```

## Testing Requirements

- Hook returns loading state initially
- Hook returns products after fetch
- Hook returns error on API failure
- Mutate triggers refetch

## Related Files

- `app/api/portal/vendors/[id]/products/route.ts` - API endpoint
- `lib/types.ts` - Product type

# State Management Library Audit Report

**Date:** 2025-12-06
**Task:** ptnextjs-y4tn - Consolidate state management on TanStack Query

## Executive Summary

Audit of state management libraries revealed:
- **SWR**: Actively used in 2 files for data fetching
- **TanStack Query**: Installed but NOT actively used
- **Zustand**: Installed but NOT actively used in source code
- **Jotai**: Installed but NOT actively used in source code

## Detailed Findings

### 1. SWR (2.2.4) - ACTIVELY USED

**Usage Locations:**

#### File: `/home/edwin/development/ptnextjs/lib/hooks/useVendorProfile.ts`
- **Lines:** 10, 140, 204
- **Purpose:** Custom hook for fetching and managing vendor profile data
- **Features Used:**
  - `useSWR` hook with custom fetcher
  - Cache key generation
  - Revalidation configuration (focus, reconnect)
  - Refresh intervals
  - Optimistic updates via `mutate`
  - Initial data (fallbackData)
- **Two hooks exported:**
  1. `useVendorProfile` - Fetch by vendor ID (authenticated endpoint)
  2. `useVendorProfileBySlug` - Fetch by slug (public endpoint)

#### File: `/home/edwin/development/ptnextjs/lib/context/VendorDashboardContext.tsx`
- **Lines:** 4, 135
- **Purpose:** Context provider for vendor dashboard state management
- **Features Used:**
  - `useSWR` hook with custom fetcher
  - Optimistic updates with `mutate`
  - Local state synchronization
  - Form dirty tracking
  - Save operations with cache updates

**SWR Configuration Patterns:**
```typescript
// Pattern 1: useVendorProfile
useSWR<Vendor, VendorApiError | Error>(swrKey, vendorFetcher, {
  fallbackData: initialData,
  revalidateOnFocus,
  revalidateOnReconnect,
  refreshInterval,
  ...swrOptions,
});

// Pattern 2: VendorDashboardContext
useSWR<Vendor>(
  vendorId ? `/api/portal/vendors/${vendorId}?byUserId=true` : null,
  fetcher,
  {
    fallbackData: initialData,
    revalidateOnFocus: false,
    onSuccess: (data) => { setLocalVendor(data); },
  }
);
```

### 2. TanStack Query (5.0.0) - NOT USED

**Installation Status:** Installed in package.json
**Usage in Source Code:** ZERO occurrences

**Grep Results:**
- No imports of `@tanstack/react-query`
- No usage of `useQuery`, `useMutation`, `QueryClient`
- Only references found in documentation files:
  - `.agent-os/instructions/agents/framework-docs-researcher.md`
  - `.agent-os/specs/2025-10-18-phase3a-discovery-premium/sub-specs/technical-spec.md`
  - `.agent-os/specs/2025-10-18-phase3a-discovery-premium/tasks-sqlite.md`

**Conclusion:** Library was added to package.json but never implemented.

### 3. Zustand (5.0.3) - NOT USED

**Installation Status:** Installed in package.json (line 186)
**Usage in Source Code:** ZERO occurrences

**Grep Results:**
- No imports of `zustand`
- No usage of `create()` from zustand
- Only references found in documentation:
  - `.agent-os/instructions/agents/frontend-react-specialist.md`
  - `.agent-os/standards/frontend/typescript-patterns.md`

**Conclusion:** Library was added to package.json but never used in application code.

### 4. Jotai (2.6.0) - NOT USED

**Installation Status:** Installed in package.json (line 147)
**Usage in Source Code:** ZERO occurrences

**Grep Results:**
- No imports of `jotai`
- No usage of `atom()` or atomic state patterns
- Zero references even in documentation

**Conclusion:** Library was added to package.json but never used anywhere.

## Migration Strategy

### Phase 1: Migrate SWR to TanStack Query

**Files to Migrate:**
1. `/home/edwin/development/ptnextjs/lib/hooks/useVendorProfile.ts`
2. `/home/edwin/development/ptnextjs/lib/context/VendorDashboardContext.tsx`

**TanStack Query Benefits:**
- More powerful devtools
- Better TypeScript support
- More flexible caching strategies
- Superior mutation handling
- Built-in optimistic updates
- Better error handling
- Query cancellation
- Dependent queries support

**SWR to TanStack Query Mapping:**

| SWR Feature | TanStack Query Equivalent |
|------------|---------------------------|
| `useSWR(key, fetcher, options)` | `useQuery({ queryKey: [key], queryFn: fetcher, ...options })` |
| `fallbackData` | `initialData` |
| `revalidateOnFocus` | `refetchOnWindowFocus` |
| `revalidateOnReconnect` | `refetchOnReconnect` |
| `refreshInterval` | `refetchInterval` |
| `mutate()` | `queryClient.invalidateQueries()` or `queryClient.setQueryData()` |
| `onSuccess` | `onSuccess` callback in options |
| `isLoading` | `isLoading` or `isPending` |
| `isValidating` | `isFetching` |

### Phase 2: Remove Unused Libraries

After successful migration and testing, remove from package.json:
- `swr` (2.2.4)
- `zustand` (5.0.3)
- `jotai` (2.6.0)

### Phase 3: Validation

1. Run `npm install` to update lock file
2. Run `npm run type-check` to ensure no TypeScript errors
3. Run `npm run build` to verify build works
4. Test vendor dashboard functionality
5. Test vendor profile hooks in UI

## Risk Assessment

**Low Risk:**
- Zustand and Jotai are completely unused - safe to remove
- SWR usage is limited to 2 well-defined files
- TanStack Query is already installed and compatible

**Medium Risk:**
- Need to ensure TanStack Query provider is set up at app root
- Need to maintain exact same API behavior for context consumers
- Need to preserve optimistic update patterns

**Mitigation:**
- Thorough testing of vendor dashboard after migration
- Keep original files as reference during migration
- Test in development before committing

## Recommended Architecture

### React Query Provider Setup
```typescript
// app/layout.tsx or providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Auth State Management
Continue using React Context for authentication state as it's not data fetching:
- Maintains existing patterns
- Appropriate use case for Context API
- No need for external state management library

## Next Steps

1. Create QueryClient provider wrapper
2. Migrate `useVendorProfile.ts` to TanStack Query
3. Migrate `VendorDashboardContext.tsx` to TanStack Query
4. Update any components using these hooks (verify API compatibility)
5. Test thoroughly
6. Remove unused libraries from package.json
7. Update documentation

## Conclusion

The codebase has 3 unused state management libraries that can be safely removed. Only SWR is actively used, and it should be migrated to the already-installed TanStack Query for better performance, developer experience, and feature set.

**Total Lines of Code to Migrate:** ~520 lines across 2 files
**Estimated Migration Time:** 2-3 hours including testing
**Risk Level:** Low-Medium
**Recommended Action:** Proceed with migration

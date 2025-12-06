# State Management Migration Script

## Step-by-Step Manual Migration Guide

Due to file writing restrictions, follow these steps manually:

### Step 1: Update app/(site)/layout.tsx

Add QueryProvider to the layout:

```typescript
// Add import at top
import { QueryProvider } from "@/lib/providers/QueryProvider";

// Wrap the body content (line 112-129)
<body className={inter.className} suppressHydrationWarning>
  <QueryProvider>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer companyInfo={companyInfo || undefined} />
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  </QueryProvider>
</body>
```

### Step 2: Migrate lib/hooks/useVendorProfile.ts

Replace imports:
```typescript
// OLD:
import useSWR, { SWRConfiguration } from 'swr';

// NEW:
import { useQuery, useQueryClient } from '@tanstack/react-query';
```

Update UseVendorProfileOptions interface:
```typescript
export interface UseVendorProfileOptions {
  vendorId?: string | null;
  initialData?: Vendor;
  refetchOnWindowFocus?: boolean;  // was: revalidateOnFocus
  refetchOnReconnect?: boolean;     // was: revalidateOnReconnect
  refetchInterval?: number;          // was: refreshInterval
  enabled?: boolean;
  staleTime?: number;
}
```

Replace useVendorProfile implementation:
```typescript
export function useVendorProfile(
  options: UseVendorProfileOptions = {}
): UseVendorProfileReturn {
  const {
    vendorId,
    initialData,
    refetchOnWindowFocus = false,
    refetchOnReconnect = true,
    refetchInterval,
    enabled = true,
    staleTime = 5 * 60 * 1000,
  } = options;

  const queryClient = useQueryClient();

  const {
    data: vendor,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Vendor, VendorApiError | Error>({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetchVendor(vendorId!),
    enabled: enabled && !!vendorId,
    initialData,
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
    staleTime,
  });

  const yearsInBusiness = computeYearsInBusiness(vendor?.foundedYear);

  const mutate = async (
    data?:
      | Vendor
      | Promise<Vendor>
      | ((currentData?: Vendor) => Vendor | Promise<Vendor>),
    shouldRevalidate = true
  ): Promise<Vendor | undefined> => {
    if (!vendorId) return undefined;

    let newData: Vendor | undefined;

    if (typeof data === 'function') {
      const currentData = queryClient.getQueryData<Vendor>(['vendor', vendorId]);
      newData = await Promise.resolve(data(currentData));
    } else {
      newData = await Promise.resolve(data);
    }

    if (newData) {
      queryClient.setQueryData(['vendor', vendorId], newData);
    }

    if (shouldRevalidate) {
      await refetch();
    }

    return newData;
  };

  const refresh = async () => {
    await refetch();
  };

  const hasField = (fieldName: string): boolean => {
    if (!vendor) return false;
    const value = vendor[fieldName as keyof Vendor];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };

  return {
    vendor: vendor ?? null,
    isLoading,
    isValidating: isFetching,
    error: error ?? null,
    yearsInBusiness,
    mutate,
    refresh,
    hasField,
  };
}
```

Similarly update useVendorProfileBySlug with queryKey ['vendor', 'slug', slug].

### Step 3: Migrate lib/context/VendorDashboardContext.tsx

Replace imports:
```typescript
// OLD:
import useSWR from 'swr';

// NEW:
import { useQuery, useQueryClient } from '@tanstack/react-query';
```

Update VendorDashboardProvider implementation (lines 128-145):
```typescript
const queryClient = useQueryClient();

const { data, error, isLoading, refetch } = useQuery<Vendor>({
  queryKey: ['vendor', 'dashboard', vendorId],
  queryFn: async () => {
    if (!vendorId) throw new Error('Vendor ID required');
    const response = await fetch(`/api/portal/vendors/${vendorId}?byUserId=true`);
    if (!response.ok) throw new Error('Failed to fetch vendor');
    const json = await response.json();
    return json.success ? json.data : json;
  },
  enabled: !!vendorId,
  initialData,
  refetchOnWindowFocus: false,
});

// Update data when query succeeds
React.useEffect(() => {
  if (data && data !== localVendor) {
    setLocalVendor(data);
  }
}, [data]);
```

Update mutate calls in saveVendor (line 210):
```typescript
// OLD:
await mutate(updatedVendor, { revalidate: false });

// NEW:
queryClient.setQueryData(['vendor', 'dashboard', vendorId], updatedVendor);
```

Update refreshVendor (line 229):
```typescript
const refreshVendor = useCallback(async () => {
  await refetch();
}, [refetch]);
```

### Step 4: Update package.json

Remove unused dependencies:
```json
{
  "dependencies": {
    // REMOVE these lines:
    "swr": "2.2.4",
    "zustand": "5.0.3",
    "jotai": "2.6.0"
  }
}
```

Add devtools (optional):
```json
{
  "devDependencies": {
    "@tanstack/react-query-devtools": "^5.0.0"
  }
}
```

### Step 5: Run installation and validation

```bash
cd /home/edwin/development/ptnextjs
npm install
npm run type-check
npm run build
```

### Step 6: Test

Test vendor dashboard and vendor profile pages to ensure data fetching works.

## Automation Script

If you prefer to automate this, here's a bash script:

```bash
#!/bin/bash

# Backup original files
cp lib/hooks/useVendorProfile.ts lib/hooks/useVendorProfile.ts.backup
cp lib/context/VendorDashboardContext.tsx lib/context/VendorDashboardContext.tsx.backup
cp app/(site)/layout.tsx app/(site)/layout.tsx.backup

# Apply migrations using sed/awk (complex - better to do manually)

# Update package.json
npm uninstall swr zustand jotai
npm install

# Validate
npm run type-check
npm run build
```

## Validation Checklist

- [ ] QueryProvider is added to layout
- [ ] useVendorProfile imports TanStack Query
- [ ] useVendorProfileBySlug is migrated
- [ ] VendorDashboardContext uses useQuery
- [ ] package.json has swr/zustand/jotai removed
- [ ] npm install completes successfully
- [ ] npm run type-check passes
- [ ] npm run build succeeds
- [ ] Vendor dashboard loads correctly
- [ ] Vendor profile pages work
- [ ] Data mutations/updates work

## Rollback Procedure

If migration fails:
```bash
mv lib/hooks/useVendorProfile.ts.backup lib/hooks/useVendorProfile.ts
mv lib/context/VendorDashboardContext.tsx.backup lib/context/VendorDashboardContext.tsx
mv app/(site)/layout.tsx.backup app/(site)/layout.tsx
npm install swr zustand jotai
npm install
```

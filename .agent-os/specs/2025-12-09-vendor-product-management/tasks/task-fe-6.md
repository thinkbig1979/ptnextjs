# Task: Update Dashboard Products Page

## Metadata
- **ID**: task-fe-6
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 20-25 min
- **Dependencies**: task-fe-5
- **Status**: pending

## Description

Update the vendor dashboard products page to use the new ProductList component. Handle tier access control and integrate with existing dashboard layout.

## Specifics

### File to Update
`app/(site)/vendor/dashboard/products/page.tsx`

### Page Requirements

1. **Tier Access Control**: Only Tier 2+ vendors can manage products
2. **Vendor Context**: Get vendorId from dashboard context or auth
3. **Page Header**: Title and description
4. **ProductList**: Pass vendorId to component

### Page Structure

```tsx
'use client';

import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { ProductList } from '@/components/dashboard/ProductList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const { vendor, isLoading } = useVendorDashboard();
  const { hasAccess, tier } = useTierAccess('productManagement');

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Tier restriction - show upgrade prompt
  if (!hasAccess) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Product Management</CardTitle>
            </div>
            <CardDescription>
              Showcase your products and services to potential customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Upgrade Required</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  Product management is available for Tier 2 and above vendors.
                  Your current tier is <strong>{tier || 'Free'}</strong>.
                </p>
                <Button asChild>
                  <Link href="/vendor/dashboard/upgrade">
                    Upgrade Your Plan
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No vendor data
  if (!vendor?.id) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load vendor information. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main content for Tier 2+ vendors
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-muted-foreground">
          Manage your product catalog. Add, edit, or remove products to showcase your offerings.
        </p>
      </div>

      <ProductList vendorId={vendor.id} />
    </div>
  );
}
```

## Acceptance Criteria

- [ ] Page renders within dashboard layout
- [ ] Shows upgrade message for Free/Tier 1 vendors
- [ ] Shows ProductList for Tier 2+ vendors
- [ ] Passes correct vendorId to ProductList
- [ ] Loading state shows skeleton
- [ ] Error state handles missing vendor
- [ ] Page title and description visible

## Context Integration

The page needs to access:
1. **VendorDashboardContext**: For `vendor` object with `id`
2. **useTierAccess hook**: For `hasAccess` to `productManagement` feature

### Verify Context Access

Check these files for existing patterns:
- `app/(site)/vendor/dashboard/layout.tsx` - Context provider
- `lib/context/VendorDashboardContext.tsx` - Context definition
- `hooks/useTierAccess.ts` - Tier access hook

## Testing Requirements

E2E Test 9.1 verifies:
- Tier 2+ vendor can access products page
- Products tab/link visible in dashboard
- Product management text visible

## Related Files

- `components/dashboard/ProductList.tsx` (task-fe-5)
- `lib/context/VendorDashboardContext.tsx`
- `hooks/useTierAccess.ts`
- `app/(site)/vendor/dashboard/layout.tsx`

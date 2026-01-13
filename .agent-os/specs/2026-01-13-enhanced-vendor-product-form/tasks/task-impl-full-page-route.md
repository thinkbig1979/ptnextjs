# Task: impl-full-page-route

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-55 min
- **Dependencies**: pre-1-types, pre-2-form-section, impl-basic-info
- **Status**: pending

## Description

Create full-page form routes for creating and editing products. The UX spec explicitly requires transitioning from Sheet to Full Page for the enhanced form, with routes `/dashboard/products/new` and `/dashboard/products/[id]/edit`.

## Specifics

### Files to Create
- `app/(site)/vendor/dashboard/products/new/page.tsx`
- `app/(site)/vendor/dashboard/products/[id]/edit/page.tsx`

### Files to Modify
- `components/dashboard/ProductForm.tsx` - Adapt for full-page use

### Files to Reference
- `app/(site)/vendor/dashboard/products/page.tsx` - Products list page
- `sub-specs/ux-ui-spec.md` - Full page layout wireframe

### Technical Details

**New Product Page (`/dashboard/products/new`):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                         │
│  [← Back to Products]  Create New Product    [Save Draft] [Save]│
├─────────────────────────────────────────────────────────────────┤
│  Form Content (Scrollable)                                      │
│  - BasicInfoSection (always expanded)                           │
│  - ImagesSection (tier-gated)                                   │
│  - PricingSection (tier-gated)                                  │
│  - ... all sections                                             │
├─────────────────────────────────────────────────────────────────┤
│  Footer                                                         │
│  [Cancel]                              [Save as Draft] [Save]   │
└─────────────────────────────────────────────────────────────────┘
```

**Edit Product Page (`/dashboard/products/[id]/edit`):**
- Same layout as new product
- Pre-populate form with existing product data
- Header shows "Edit Product: {product.name}"

**Features:**
1. Full-page layout with header, scrollable content, sticky footer
2. Back button returns to products list
3. Unsaved changes warning on navigation
4. Header actions: Save Draft, Save
5. Footer actions: Cancel, Save as Draft, Save

## Acceptance Criteria

- [ ] `/dashboard/products/new` route accessible for tier2+ vendors
- [ ] `/dashboard/products/[id]/edit` route loads existing product
- [ ] Header shows appropriate title (Create vs Edit)
- [ ] Back button navigates to products list
- [ ] Unsaved changes prompt on navigation away
- [ ] Form submits successfully
- [ ] Loading state while fetching product (edit mode)
- [ ] 404 handling for non-existent product
- [ ] Redirect to list on successful save

## Testing Requirements

```typescript
describe('New Product Page', () => {
  it('renders full-page form', async () => {});
  it('shows back button to products list', () => {});
  it('prompts on unsaved changes', () => {});
  it('redirects on successful save', () => {});
});

describe('Edit Product Page', () => {
  it('loads existing product data', async () => {});
  it('shows loading state initially', () => {});
  it('handles non-existent product', () => {});
  it('updates product on save', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `sub-specs/ux-ui-spec.md` - Full page layout (lines 9-62)
- `app/(site)/vendor/dashboard/products/page.tsx` - Current products page

## Implementation Notes

```tsx
// app/(site)/vendor/dashboard/products/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useVendorDashboard } from '@/contexts/VendorDashboardContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { ProductFormFull } from '@/components/dashboard/ProductFormFull';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const { vendor } = useVendorDashboard();
  const { hasAccess } = useTierAccess('productManagement', vendor?.tier);

  if (!hasAccess) {
    // Redirect or show upgrade prompt
    return <TierUpgradeRequired feature="productManagement" />;
  }

  const handleSuccess = () => {
    router.push('/vendor/dashboard/products');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/vendor/dashboard/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Create New Product</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Save actions handled by form */}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ProductFormFull
            vendorId={vendor?.id}
            onSuccess={handleSuccess}
            onCancel={() => router.push('/vendor/dashboard/products')}
          />
        </div>
      </main>
    </div>
  );
}

// app/(site)/vendor/dashboard/products/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductFormFull } from '@/components/dashboard/ProductFormFull';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/portal/vendors/${vendorId}/products/${productId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/vendor/dashboard/products');
            return;
          }
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return <ProductFormSkeleton />;
  }

  if (error || !product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="...">
        <h1>Edit Product: {product.name}</h1>
      </header>
      <main>
        <ProductFormFull
          vendorId={vendorId}
          product={product}
          isEdit
          onSuccess={() => router.push('/vendor/dashboard/products')}
        />
      </main>
    </div>
  );
}

// Unsaved changes hook
function useUnsavedChangesWarning(isDirty: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}
```

## Related Files
- `components/dashboard/ProductForm.tsx` - Existing form (may become ProductFormFull)
- All section components in `components/dashboard/product-form/`
- `app/(site)/vendor/dashboard/products/page.tsx` - Products list

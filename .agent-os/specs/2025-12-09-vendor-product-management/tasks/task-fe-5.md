# Task: Create ProductList Container Component

## Metadata
- **ID**: task-fe-5
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 35-45 min
- **Dependencies**: task-fe-1, task-fe-2, task-fe-3, task-fe-4
- **Status**: pending

## Description

Create the ProductList container component that fetches vendor products and orchestrates the UI. Handles loading, empty, error states and manages form/dialog visibility.

## Specifics

### File to Create
`components/dashboard/ProductList.tsx`

### Component Props

```typescript
interface ProductListProps {
  vendorId: string;
}
```

### Required Elements (E2E Test Selectors)

**CRITICAL**: These elements must match E2E test selectors:

1. **Product Names**: Must be visible text
   - Test: `text=/Test Product 1/i`

2. **Add Button**:
   - Test: `button:has-text("Add.*Product")`
   - Implementation: `<Button>Add New Product</Button>`

### Component Structure

```tsx
'use client';

import { useState, useCallback } from 'react';
import { Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';
import { ProductDeleteDialog } from './ProductDeleteDialog';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

interface ProductListProps {
  vendorId: string;
}

export function ProductList({ vendorId }: ProductListProps) {
  const { products, isLoading, isError, mutate } = useVendorProducts(vendorId);

  // State for modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingProductId, setPublishingProductId] = useState<string | null>(null);

  // Handlers
  const handleAddClick = useCallback(() => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    mutate();
  }, [mutate]);

  const handleFormCancel = useCallback(() => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/portal/vendors/${vendorId}/products/${selectedProduct.id}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedProduct, vendorId, mutate]);

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  }, []);

  const handlePublishToggle = useCallback(
    async (product: Product, published: boolean) => {
      setPublishingProductId(product.id);
      try {
        const response = await fetch(
          `/api/portal/vendors/${vendorId}/products/${product.id}/publish`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to update status');
        }

        toast.success(published ? 'Product published' : 'Product unpublished');
        mutate();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update');
      } finally {
        setPublishingProductId(null);
      }
    },
    [vendorId, mutate]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load products. Please try again.</span>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <>
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>

        <ProductForm
          vendorId={vendorId}
          open={isFormOpen}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </>
    );
  }

  // Products grid
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPublishToggle={handlePublishToggle}
              isPublishing={publishingProductId === product.id}
            />
          ))}
        </div>
      </div>

      <ProductForm
        product={selectedProduct || undefined}
        vendorId={vendorId}
        open={isFormOpen}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />

      <ProductDeleteDialog
        product={selectedProduct}
        open={isDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </>
  );
}
```

## Acceptance Criteria

- [ ] Shows loading skeleton during fetch
- [ ] Shows error alert with retry button
- [ ] Shows empty state with CTA when no products
- [ ] Shows responsive grid of ProductCards
- [ ] "Add New Product" button opens form
- [ ] Edit action opens form with product data
- [ ] Delete action opens confirmation dialog
- [ ] Publish toggle updates status via API
- [ ] List refreshes after CRUD operations
- [ ] Toast notifications for all actions

## Testing Requirements

E2E tests verify:
- Products visible: `text=/Test Product 1/i`
- Add button: `button:has-text("Add.*Product")`
- Edit flow: click Edit, modify, save
- Delete flow: click Delete, confirm
- Publish flow: toggle switch

## Related Files

- `components/dashboard/ProductCard.tsx` (task-fe-1)
- `components/dashboard/ProductDeleteDialog.tsx` (task-fe-2)
- `components/dashboard/ProductForm.tsx` (task-fe-3)
- `hooks/useVendorProducts.ts` (task-fe-4)

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProductCard } from './ProductCard';
import { ProductDeleteDialog } from './ProductDeleteDialog';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { toast } from '@/components/ui/sonner';
import type { Product } from '@/lib/types';

interface ProductListProps {
  vendorId: string;
}

/**
 * ProductList
 *
 * Container component for managing vendor products.
 * Handles loading, empty, and error states.
 * Orchestrates product CRUD operations via child components.
 *
 * Updated to use full-page form routes instead of slide-over sheet.
 *
 * @param vendorId - The vendor ID to fetch products for
 */
export function ProductList({ vendorId }: ProductListProps) {
  const router = useRouter();
  const { products, isLoading, isError, mutate } = useVendorProducts(vendorId);

  // State for delete dialog
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingProductId, setPublishingProductId] = useState<string | null>(null);

  // Navigate to edit page
  const handleEditClick = useCallback((product: Product) => {
    router.push(`/vendor/dashboard/products/${product.id}/edit`);
  }, [router]);

  // Open delete confirmation dialog
  const handleDeleteClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle delete confirmation
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

  // Handle publish toggle
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
            <Card key={`skeleton-${i}`}>
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
      <Card className="text-center py-12">
        <CardContent>
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">No products yet</p>
          <Button asChild>
            <Link href="/vendor/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Products grid
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/vendor/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Link>
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

export default ProductList;

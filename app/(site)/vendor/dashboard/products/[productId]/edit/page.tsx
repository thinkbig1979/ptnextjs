'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, ArrowUpRight, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { EnhancedProductForm } from '@/components/dashboard/product-form/EnhancedProductForm';
import type { Product } from '@/lib/types';

/**
 * Edit Product Page
 *
 * Full-page form for editing an existing product.
 * Only available for Tier 2+ vendors.
 */
export default function EditProductPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const { vendor, isLoading: vendorLoading } = useVendorDashboard();
  const vendorTier = (vendor as { tier?: string })?.tier || 'free';
  const { hasAccess, tier } = useTierAccess('productManagement', vendorTier);

  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const isLoading = vendorLoading || productLoading;

  // Fetch product data
  useEffect(() => {
    const vendorId = vendor?.id;
    if (!vendorId || !params.productId) return;

    let cancelled = false;

    async function fetchProduct() {
      try {
        setProductLoading(true);
        setProductError(null);

        const response = await fetch(
          `/api/portal/vendors/${vendorId}/products/${params.productId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to load product');
        }

        const result = await response.json();

        if (!cancelled) {
          setProduct(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setProductError(err instanceof Error ? err.message : 'Failed to load product');
        }
      } finally {
        if (!cancelled) {
          setProductLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [vendor?.id, params.productId]);

  const handleSuccess = () => {
    router.push('/vendor/dashboard/products');
  };

  const handleCancel = () => {
    router.push('/vendor/dashboard/products');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  // Tier restriction - show upgrade prompt
  if (!hasAccess) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/vendor/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Edit Product</CardTitle>
            </div>
            <CardDescription>
              Update your product details.
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
                  <Link href="/vendor/dashboard/subscription">
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
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load vendor information. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Product error (not found or fetch failed)
  if (productError) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/vendor/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {productError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Product not found after loading
  if (!product) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/vendor/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Product Not Found</AlertTitle>
          <AlertDescription>
            The product you&apos;re trying to edit doesn&apos;t exist or has been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main content for Tier 2+ vendors
  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/vendor/dashboard/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-muted-foreground">
          Update the details for <strong>{product.name}</strong>.
        </p>
      </div>

      <EnhancedProductForm
        product={product}
        vendorId={vendor.id}
        currentTier={vendorTier as 'free' | 'tier1' | 'tier2' | 'tier3'}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

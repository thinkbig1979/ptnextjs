'use client';

import { useRouter } from 'next/navigation';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, ArrowUpRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EnhancedProductForm } from '@/components/dashboard/product-form/EnhancedProductForm';

/**
 * New Product Page
 *
 * Full-page form for creating a new product.
 * Only available for Tier 2+ vendors.
 */
export default function NewProductPage() {
  const router = useRouter();
  const { vendor, isLoading } = useVendorDashboard();
  const vendorTier = (vendor as { tier?: string })?.tier || 'free';
  const { hasAccess, tier } = useTierAccess('productManagement', vendorTier);

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
              <CardTitle>Create Product</CardTitle>
            </div>
            <CardDescription>
              Add a new product to showcase your offerings.
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
        <h1 className="text-3xl font-bold mb-2">Create New Product</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new product to your catalog.
        </p>
      </div>

      <EnhancedProductForm
        vendorId={vendor.id}
        currentTier={vendorTier as 'free' | 'tier1' | 'tier2' | 'tier3'}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

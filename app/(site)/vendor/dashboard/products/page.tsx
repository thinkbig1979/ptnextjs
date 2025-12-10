'use client';

import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { useTierAccess } from '@/hooks/useTierAccess';
import { ProductList } from '@/components/dashboard/ProductList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Products Page
 *
 * Vendor dashboard page for managing product listings.
 * Only available for Tier 2+ vendors.
 */
export default function ProductsPage() {
  const { vendor, isLoading } = useVendorDashboard();
  const vendorTier = (vendor as any)?.tier || 'free';
  const { hasAccess, tier } = useTierAccess('productManagement', vendorTier);

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

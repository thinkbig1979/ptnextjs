'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NearbyVendorCard } from '@/components/products/NearbyVendorCard';
import { useLocationPreference } from '@/hooks/useLocationPreference';
import { useNearbyVendorsByCategory } from '@/hooks/useNearbyVendorsByCategory';
import { cn } from '@/lib/utils';
import type { Vendor, Product } from '@/lib/types';

export interface VendorsNearYouProps {
  category: string;
  currentVendorId?: string;
  maxVendors?: number; // Default: 4
  defaultRadius?: number; // Default: 500
  vendors: Vendor[]; // All vendors (passed from parent)
  products: Product[]; // All products (passed from parent)
  className?: string;
}

/**
 * VendorsNearYou Component
 *
 * Sidebar section for product detail pages showing nearby vendors selling products
 * in the same category.
 *
 * Features:
 * - Location-aware vendor discovery
 * - Excludes current product's vendor from results
 * - Shows max 4 vendor cards by default
 * - Links to full vendor search with category filter
 * - Handles no-location and no-results states gracefully
 * - Loading skeleton for better UX
 *
 * @param category - Product category to match vendors against
 * @param currentVendorId - ID of current product's vendor to exclude from results
 * @param maxVendors - Maximum number of vendors to display (default: 4)
 * @param defaultRadius - Search radius in kilometers (default: 500)
 * @param vendors - All available vendors
 * @param products - All available products
 * @param className - Optional CSS class for styling
 */
export function VendorsNearYou({
  category,
  currentVendorId,
  maxVendors = 4,
  defaultRadius = 500,
  vendors,
  products,
  className,
}: VendorsNearYouProps): React.JSX.Element {
  const { location, isExpired } = useLocationPreference();

  // Convert location to coordinates or null
  const userLocation = location && !isExpired
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
      }
    : null;

  // Fetch nearby vendors with category matching
  const { vendors: nearbyVendors, isLoading, error } = useNearbyVendorsByCategory(
    vendors,
    products,
    {
      userLocation,
      category,
      excludeVendorId: currentVendorId,
      radius: defaultRadius,
      maxResults: maxVendors,
    }
  );

  // Show skeleton while initializing (first render, location loading)
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)} data-testid="vendors-near-you">
        <CardHeader className="pb-3 px-0 pt-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Vendors Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-3" data-testid="vendors-near-you-loading">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Show error state if hook failed
  if (error) {
    console.error('Error loading nearby vendors:', error);
    return (
      <Card className={cn('p-4', className)} data-testid="vendors-near-you">
        <CardHeader className="pb-3 px-0 pt-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Vendors Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0" data-testid="vendors-near-you-error">
          <p className="text-sm text-muted-foreground">
            Unable to load nearby vendors. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No location saved - prompt user to set location
  if (!userLocation) {
    return (
      <Card className={cn('p-4', className)} data-testid="vendors-near-you">
        <CardHeader className="pb-3 px-0 pt-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Vendors Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0" data-testid="vendors-near-you-no-location">
          <p className="text-sm text-muted-foreground mb-3" data-testid="vendors-near-you-set-location-prompt">
            Set your location to find nearby vendors
          </p>
          <Link href={`/vendors?category=${encodeURIComponent(category)}`}>
            <Button variant="outline" size="sm" className="w-full">
              Search Vendors
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // No vendors found within radius
  if (nearbyVendors.length === 0) {
    return (
      <Card className={cn('p-4', className)} data-testid="vendors-near-you">
        <CardHeader className="pb-3 px-0 pt-0">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Vendors Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0" data-testid="vendors-near-you-empty">
          <p className="text-sm text-muted-foreground mb-3">
            No vendors found within {defaultRadius} km
          </p>
          <Link href={`/vendors?category=${encodeURIComponent(category)}`}>
            <Button variant="outline" size="sm" className="w-full">
              View All Vendors
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Success state - show vendor cards
  return (
    <Card className={cn('p-4', className)} data-testid="vendors-near-you">
      <CardHeader className="pb-3 px-0 pt-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Vendors Near You
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 pb-0 space-y-3" data-testid="vendors-near-you-list">
        {nearbyVendors.map((vendor) => (
          <NearbyVendorCard
            key={vendor.id}
            vendor={vendor}
            distance={vendor.distance}
          />
        ))}

        <Link href={`/vendors?category=${encodeURIComponent(category)}`}>
          <Button variant="ghost" size="sm" className="w-full mt-2">
            View all vendors
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default VendorsNearYou;

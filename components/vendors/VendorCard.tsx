'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { TierBadge } from '@/components/vendors/TierBadge';
import { YearsInBusinessDisplay } from '@/components/vendors/YearsInBusinessDisplay';
import { MapPin, Star } from 'lucide-react';
import type { Vendor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export interface VendorCardProps {
  vendor: Vendor;
  featured?: boolean;
  showTierBadge?: boolean;
}

/**
 * VendorCard Component
 *
 * Displays vendor information in a card format for listing pages.
 * Features:
 * - Logo, company name, truncated description
 * - Tier badge (optional)
 * - Years in business (Tier 1+)
 * - Location count (all tiers)
 * - Featured star icon (Tier 3 featured vendors only)
 * - Click to navigate to vendor profile
 * - Hover effects (shadow, scale)
 * - Responsive layout (horizontal on desktop, vertical on mobile)
 */
export function VendorCard({
  vendor,
  featured = false,
  showTierBadge = true,
}: VendorCardProps) {
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const locationCount = vendor.locations?.length || 0;
  const showYearsInBusiness = vendor.foundedYear && vendor.tier && vendor.tier !== 'free';
  const showFeaturedStar = featured && vendor.tier === 'tier3';

  return (
    <Link href={`/vendors/${vendor.slug}`} className="block">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-4">
          {/* Mobile: Vertical Layout */}
          <div className="flex flex-col sm:hidden space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto relative">
              {vendor.logo && (
                <OptimizedImage
                  src={vendor.logo}
                  alt={`${vendor.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                  fallbackType="partner"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Tier Badge and Featured Star */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {showTierBadge && vendor.tier && <TierBadge tier={vendor.tier} size="sm" />}
                {showFeaturedStar && (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                )}
              </div>

              {/* Company Name */}
              <h3 className="text-lg font-cormorant font-bold text-center mb-2">
                {vendor.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center mb-3">
                {truncateDescription(vendor.description, 120)}
              </p>

              {/* Metrics */}
              <div className="flex flex-col items-center gap-2">
                {showYearsInBusiness && vendor.foundedYear && (
                  <YearsInBusinessDisplay foundedYear={vendor.foundedYear} variant="badge" />
                )}
                {locationCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {locationCount} {locationCount === 1 ? 'Location' : 'Locations'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Desktop/Tablet: Horizontal Layout */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Logo */}
            <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center relative">
              {vendor.logo && (
                <OptimizedImage
                  src={vendor.logo}
                  alt={`${vendor.name} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                  fallbackType="partner"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Tier Badge and Featured Star */}
              <div className="flex items-center gap-2 mb-2">
                {showTierBadge && vendor.tier && <TierBadge tier={vendor.tier} size="sm" />}
                {showFeaturedStar && (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                )}
              </div>

              {/* Company Name */}
              <h3 className="text-xl font-cormorant font-bold mb-2 truncate">
                {vendor.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {truncateDescription(vendor.description)}
              </p>

              {/* Metrics */}
              <div className="flex items-center gap-2 flex-wrap">
                {showYearsInBusiness && vendor.foundedYear && (
                  <YearsInBusinessDisplay foundedYear={vendor.foundedYear} variant="badge" />
                )}
                {locationCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {locationCount} {locationCount === 1 ? 'Location' : 'Locations'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * VendorCardSkeleton Component
 *
 * Loading skeleton for VendorCard
 */
export function VendorCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {/* Mobile: Vertical Layout */}
        <div className="flex flex-col sm:hidden space-y-4">
          <Skeleton className="w-20 h-20 mx-auto rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-20 mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <div className="flex justify-center gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>

        {/* Desktop/Tablet: Horizontal Layout */}
        <div className="hidden sm:flex items-center space-x-4">
          <Skeleton className="flex-shrink-0 w-20 h-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VendorCard;

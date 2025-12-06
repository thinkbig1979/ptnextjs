'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { TierBadge } from '@/components/vendors/TierBadge';
import { YearsInBusinessDisplay } from '@/components/vendors/YearsInBusinessDisplay';
import { MapPin, Package } from 'lucide-react';
import type { Vendor } from '@/lib/types';
import { formatVendorLocation } from '@/lib/utils/location';

export interface VendorHeroProps {
  vendor: Vendor;
  productCount: number;
}

/**
 * VendorHero Component
 *
 * Displays vendor profile hero section with:
 * - Logo and company name
 * - Description
 * - Tier badge (shows subscription tier)
 * - Years in business (computed from foundedYear)
 * - Quick info (location, products)
 * - Feature badges (Featured, Partner)
 *
 * This component is tier-aware and displays different information based on vendor tier
 */
export function VendorHero({ vendor, productCount }: VendorHeroProps): React.JSX.Element {
  return (
    <div className="mb-8">
      {/* Badges Row */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {vendor.tier && <TierBadge tier={vendor.tier} size="md" showIcon={true} />}
        {vendor.category && <Badge variant="secondary">{vendor.category}</Badge>}
        {vendor.featured && (
          <Badge variant="default" className="bg-accent">
            Featured Vendor
          </Badge>
        )}
        {vendor.partner && (
          <Badge variant="default" className="bg-green-600">
            Partner
          </Badge>
        )}
        {(vendor.foundedYear || vendor.founded) && (
          <YearsInBusinessDisplay foundedYear={vendor.foundedYear || vendor.founded} variant="badge" />
        )}
      </div>

      {/* Company Logo and Name Header */}
      <div className="flex items-center space-x-6 mb-6">
        {vendor.logo && (
          <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center p-2 relative">
            <OptimizedImage
              src={vendor.logo}
              alt={`${vendor.name} logo`}
              width={64}
              height={64}
              className="object-contain"
              fallbackType="partner"
            />
          </div>
        )}
        <div className="flex-grow">
          <h1 className="text-4xl md:text-5xl font-cormorant font-bold leading-tight">
            {vendor.name}
          </h1>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-xl text-muted-foreground mb-6 font-poppins-light leading-relaxed"
        data-testid="vendor-description"
      >
        {vendor.description}
      </p>

      {/* Quick Info */}
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {formatVendorLocation(vendor.location) && (
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{formatVendorLocation(vendor.location)}</span>
          </div>
        )}
        {/* Only show product count for Tier 2+ vendors */}
        {vendor.tier && ['tier2', 'tier3'].includes(vendor.tier) && (
          <div className="flex items-center space-x-1">
            <Package className="w-4 h-4" />
            <span>{productCount} Products</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorHero;

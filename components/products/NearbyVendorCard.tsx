'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation } from 'lucide-react';
import { TierBadge } from '@/components/vendors/TierBadge';
import { formatDistance } from '@/lib/utils/location';
import type { Vendor } from '@/lib/types';

export interface NearbyVendorCardProps {
  vendor: Vendor;
  distance?: number; // kilometers
}

/**
 * NearbyVendorCard Component
 *
 * Compact vendor card for displaying nearby vendors in product page sidebar.
 *
 * Features:
 * - Links to vendor detail page
 * - Shows vendor name, city, country
 * - Displays tier badge
 * - Shows distance with navigation icon (if provided)
 * - Hover state for better UX
 * - Handles missing location data gracefully
 *
 * @param vendor - Vendor to display
 * @param distance - Distance from user location in kilometers (optional)
 */
export function NearbyVendorCard({
  vendor,
  distance,
}: NearbyVendorCardProps): React.JSX.Element {
  const getLocationDisplay = () => {
    if (vendor.locations && vendor.locations.length > 0) {
      const hqLocation = vendor.locations.find(loc => loc.isHQ === true);
      const displayLocation = hqLocation || vendor.locations[0];

      return {
        city: displayLocation.city || 'Unknown',
        country: displayLocation.country || '',
      };
    }

    return {
      city: 'Location',
      country: 'Unknown',
    };
  };

  const { city, country } = getLocationDisplay();

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors duration-150"
      data-testid="nearby-vendor-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{vendor.name}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {city}, {country}
          </p>
        </div>
        <TierBadge tier={vendor.tier || 'free'} size="sm" />
      </div>

      {distance !== undefined && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Navigation className="h-3 w-3" />
          <span>{formatDistance(distance)} away</span>
        </div>
      )}
    </Link>
  );
}

export default NearbyVendorCard;

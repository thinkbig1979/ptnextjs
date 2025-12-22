'use client';

import { useMemo } from 'react';
import { useLocationFilter, VendorWithDistance } from '@/hooks/useLocationFilter';
import type { Vendor, Product, VendorCoordinates } from '@/lib/types';

export interface UseNearbyVendorsByCategoryOptions {
  userLocation: VendorCoordinates | null;
  category: string;
  excludeVendorId?: string;
  radius?: number; // Default: 500km
  maxResults?: number; // Default: 10
}

export interface VendorWithCategoryCount extends VendorWithDistance {
  productsInCategory: number; // Count of products in specified category
}

export interface UseNearbyVendorsByCategoryResult {
  vendors: VendorWithCategoryCount[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for finding nearby vendors that offer products in a specific category
 *
 * Combines location-based filtering with product category matching.
 * Useful for product pages to show "Other vendors near you offering similar products"
 *
 * @param vendors - All available vendors
 * @param products - All available products
 * @param options - Filter options (location, category, exclusions, limits)
 * @returns Vendors within radius that offer products in the category, sorted by distance
 *
 * @example
 * const { vendors, isLoading, error } = useNearbyVendorsByCategory(
 *   allVendors,
 *   allProducts,
 *   {
 *     userLocation: { latitude: 43.7384, longitude: 7.4246 },
 *     category: 'Navigation Systems',
 *     excludeVendorId: 'current-vendor-id',
 *     radius: 100,
 *     maxResults: 5
 *   }
 * );
 */
export function useNearbyVendorsByCategory(
  vendors: Vendor[],
  products: Product[],
  options: UseNearbyVendorsByCategoryOptions
): UseNearbyVendorsByCategoryResult {
  const {
    userLocation,
    category,
    excludeVendorId,
    radius = 500,
    maxResults = 10,
  } = options;

  const result = useMemo(() => {
    try {
      // Step 1: Filter products by category
      const productsInCategory = products.filter((p) => p.category === category);

      if (productsInCategory.length === 0) {
        return {
          vendors: [],
          isLoading: false,
          error: null,
        };
      }

      // Step 2: Get unique vendor IDs from filtered products
      const vendorIdsInCategory = new Set<string>();
      productsInCategory.forEach((product) => {
        const vendorId = product.vendorId || product.partnerId;
        if (vendorId) {
          vendorIdsInCategory.add(vendorId);
        }
      });

      if (vendorIdsInCategory.size === 0) {
        return {
          vendors: [],
          isLoading: false,
          error: null,
        };
      }

      // Step 3: Filter vendors to only those with products in this category
      const vendorsWithCategory = vendors.filter((vendor) =>
        vendorIdsInCategory.has(vendor.id)
      );

      // Step 4: Exclude specified vendor if provided
      const vendorsToFilter = excludeVendorId
        ? vendorsWithCategory.filter((vendor) => vendor.id !== excludeVendorId)
        : vendorsWithCategory;

      if (vendorsToFilter.length === 0) {
        return {
          vendors: [],
          isLoading: false,
          error: null,
        };
      }

      // Step 5: Calculate products in category per vendor
      const productCountsByVendor = productsInCategory.reduce(
        (acc, product) => {
          const vendorId = product.vendorId || product.partnerId;
          if (vendorId) {
            acc[vendorId] = (acc[vendorId] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      // Step 6: If no user location, return vendors without distance filtering
      if (!userLocation) {
        const vendorsWithCounts: VendorWithCategoryCount[] = vendorsToFilter.map(
          (vendor) => ({
            ...vendor,
            productsInCategory: productCountsByVendor[vendor.id] || 0,
          })
        );

        // Limit results
        return {
          vendors: vendorsWithCounts.slice(0, maxResults),
          isLoading: false,
          error: null,
        };
      }

      // Step 7: Apply location filtering using existing hook logic
      // We'll create VendorWithDistance results and then add productsInCategory
      const vendorsWithDistances: VendorWithCategoryCount[] = [];

      vendorsToFilter.forEach((vendor) => {
        // Get all eligible locations for this vendor (tier-aware)
        const eligibleLocations = getVendorLocations(vendor);

        if (eligibleLocations.length === 0) {
          return; // Skip vendors without eligible locations
        }

        // Calculate distance to all eligible locations
        const locationsWithDistances = eligibleLocations
          .map((location) => {
            if (
              location.latitude === undefined ||
              location.longitude === undefined
            ) {
              return null;
            }

            try {
              const distance = calculateDistance(
                userLocation,
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                'km'
              );

              return {
                location,
                distance,
              };
            } catch (error) {
              console.warn(
                `Error calculating distance for vendor ${vendor.name}:`,
                error
              );
              return null;
            }
          })
          .filter((item): item is { location: any; distance: number } => item !== null);

        // Find the closest location within radius
        const closestLocation = locationsWithDistances
          .filter(({ distance }) => distance <= radius)
          .sort((a, b) => a.distance - b.distance)[0];

        if (closestLocation) {
          vendorsWithDistances.push({
            ...vendor,
            distance: closestLocation.distance,
            matchedLocation: closestLocation.location,
            productsInCategory: productCountsByVendor[vendor.id] || 0,
          });
        }
      });

      // Step 8: Sort by distance (closest first)
      vendorsWithDistances.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      // Step 9: Limit to maxResults
      const limitedVendors = vendorsWithDistances.slice(0, maxResults);

      return {
        vendors: limitedVendors,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('Error in useNearbyVendorsByCategory:', error);
      return {
        vendors: [],
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }, [vendors, products, userLocation, category, excludeVendorId, radius, maxResults]);

  return result;
}

// Helper functions (copied from useLocationFilter for self-contained implementation)

/**
 * Extracts all eligible locations for a vendor based on tier
 */
function getVendorLocations(vendor: Vendor): any[] {
  // Handle locations array (multi-location support)
  if (vendor.locations && vendor.locations.length > 0) {
    const tier = vendor.tier || 'free';

    // Tier-based filtering
    const eligibleLocations = vendor.locations.filter((loc) => {
      // Must have valid coordinates
      if (loc.latitude === undefined || loc.longitude === undefined) return false;

      // Tier 0/1: Only HQ location
      if (tier === 'free' || tier === 'tier1') {
        return loc.isHQ === true;
      }

      // Tier 2+: All locations
      return true;
    });

    return eligibleLocations;
  }

  // Fallback to legacy location field (backward compatibility)
  if (vendor.location && typeof vendor.location !== 'string') {
    const location = vendor.location as any;
    if (location.latitude !== undefined && location.longitude !== undefined) {
      // Mark legacy location as HQ for consistency
      return [{ ...location, isHQ: true }];
    }
  }

  return [];
}

/**
 * Calculates distance between two coordinates using Haversine formula
 */
function calculateDistance(
  coords1: VendorCoordinates,
  coords2: VendorCoordinates,
  unit: 'km' | 'miles' = 'km'
): number {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.latitude)) *
      Math.cos(toRad(coords2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

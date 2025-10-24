'use client';

import { useMemo } from 'react';
import { Vendor, VendorCoordinates, VendorLocation } from '@/lib/types';
import { calculateDistance } from '@/lib/utils/location';

/**
 * Extracts coordinates from a vendor's location field
 * Handles both VendorLocation objects and legacy string locations
 * @deprecated Use getVendorLocations for multi-location support
 */
function getVendorCoordinates(vendor: Vendor): VendorCoordinates | null {
  if (!vendor.location) return null;

  // Handle legacy string location (no coordinates)
  if (typeof vendor.location === 'string') return null;

  // Extract coordinates from VendorLocation object
  const location = vendor.location as VendorLocation;
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  return null;
}

/**
 * Extracts all eligible locations for a vendor based on tier
 * Supports both new locations[] array and legacy location object
 * @param vendor - Vendor to get locations from
 * @returns Array of eligible VendorLocation objects with coordinates
 */
function getVendorLocations(vendor: Vendor): VendorLocation[] {
  // NEW: Handle locations array (multi-location support)
  if (vendor.locations && vendor.locations.length > 0) {
    const tier = vendor.tier || 'free';

    // Tier-based filtering
    const eligibleLocations = vendor.locations.filter(loc => {
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

  // LEGACY: Handle single location object (backward compatibility)
  if (vendor.location && typeof vendor.location !== 'string') {
    const location = vendor.location as VendorLocation;
    if (location.latitude !== undefined && location.longitude !== undefined) {
      // Mark legacy location as HQ for consistency
      return [{ ...location, isHQ: true }];
    }
  }

  return [];
}

export interface VendorWithDistance extends Vendor {
  /** Calculated distance from user location in kilometers */
  distance?: number;
  /** The specific location that matched the search (for multi-location vendors) */
  matchedLocation?: VendorLocation;
}

export interface UseLocationFilterResult {
  /** Vendors filtered by distance */
  filteredVendors: VendorWithDistance[];
  /** Number of vendors with valid coordinates */
  vendorsWithCoordinates: number;
  /** Number of vendors without coordinates */
  vendorsWithoutCoordinates: number;
  /** Whether filtering is currently active */
  isFiltering: boolean;
}

/**
 * Custom hook for filtering vendors by location proximity
 *
 * @param vendors - Array of all vendors
 * @param userLocation - User's current location coordinates (null if not set)
 * @param maxDistance - Maximum distance in kilometers for filtering
 * @returns Filtered vendors with calculated distances and metadata
 *
 * @example
 * const { filteredVendors, isFiltering } = useLocationFilter(
 *   vendors,
 *   { latitude: 43.7384, longitude: 7.4246 },
 *   100
 * );
 */
export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): UseLocationFilterResult {
  const result = useMemo(() => {
    // Count vendors with/without coordinates (using new multi-location aware function)
    const vendorsWithCoordinates = vendors.filter(v => getVendorLocations(v).length > 0).length;
    const vendorsWithoutCoordinates = vendors.length - vendorsWithCoordinates;

    // If no user location set, return all vendors without filtering
    if (!userLocation) {
      return {
        filteredVendors: vendors,
        vendorsWithCoordinates,
        vendorsWithoutCoordinates,
        isFiltering: false,
      };
    }

    // Calculate distances and filter vendors (NEW: multi-location support)
    const vendorsWithDistances: VendorWithDistance[] = vendors
      .map(vendor => {
        // Get all eligible vendor locations (tier-aware)
        const eligibleLocations = getVendorLocations(vendor);

        // Skip vendors without any eligible locations
        if (eligibleLocations.length === 0) {
          return { ...vendor, distance: undefined, matchedLocation: undefined };
        }

        try {
          // Calculate distance to ALL eligible locations
          const locationsWithDistances = eligibleLocations.map(location => ({
            location,
            distance: calculateDistance(
              userLocation,
              {
                latitude: location.latitude!,
                longitude: location.longitude!,
              },
              'km'
            ),
          }));

          // Find the closest location within maxDistance
          const closestLocation = locationsWithDistances
            .filter(({ distance }) => distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance)[0];

          // If no location is within range, exclude this vendor
          if (!closestLocation) {
            return { ...vendor, distance: undefined, matchedLocation: undefined };
          }

          // Return vendor with distance to closest location
          return {
            ...vendor,
            distance: closestLocation.distance,
            matchedLocation: closestLocation.location,
          };
        } catch (error) {
          // Log error but don't fail - just exclude this vendor
          console.warn(
            `Error calculating distance for vendor ${vendor.name}:`,
            error
          );
          return { ...vendor, distance: undefined, matchedLocation: undefined };
        }
      })
      .filter(vendor => {
        // Exclude vendors without coordinates or outside range
        return vendor.distance !== undefined;
      })
      .sort((a, b) => {
        // Sort by distance (closest first)
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

    return {
      filteredVendors: vendorsWithDistances,
      vendorsWithCoordinates,
      vendorsWithoutCoordinates,
      isFiltering: true,
    };
  }, [vendors, userLocation, maxDistance]);

  return result;
}

/**
 * Helper hook for getting vendors within a specific distance
 * (simplified version without metadata)
 *
 * @param vendors - Array of all vendors
 * @param userLocation - User's current location coordinates
 * @param maxDistance - Maximum distance in kilometers
 * @returns Array of vendors within distance, sorted by proximity
 *
 * @example
 * const nearbyVendors = useNearbyVendors(vendors, userLocation, 50);
 */
export function useNearbyVendors(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): VendorWithDistance[] {
  return useLocationFilter(vendors, userLocation, maxDistance).filteredVendors;
}

/**
 * Helper hook for checking if a specific vendor is nearby
 *
 * @param vendor - Vendor to check
 * @param userLocation - User's current location coordinates
 * @param maxDistance - Maximum distance in kilometers
 * @returns Object with isNearby flag and calculated distance
 *
 * @example
 * const { isNearby, distance } = useIsVendorNearby(vendor, userLocation, 100);
 */
export function useIsVendorNearby(
  vendor: Vendor,
  userLocation: VendorCoordinates | null,
  maxDistance: number
): { isNearby: boolean; distance?: number } {
  return useMemo(() => {
    const vendorCoords = getVendorCoordinates(vendor);

    if (!userLocation || !vendorCoords) {
      return { isNearby: false, distance: undefined };
    }

    try {
      const distance = calculateDistance(userLocation, vendorCoords, 'km');
      const isNearby = distance <= maxDistance;

      return { isNearby, distance };
    } catch (error) {
      console.warn(`Error checking if vendor ${vendor.name} is nearby:`, error);
      return { isNearby: false, distance: undefined };
    }
  }, [vendor, userLocation, maxDistance]);
}

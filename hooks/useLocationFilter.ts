'use client';

import { useMemo } from 'react';
import { VendorCoordinates, VendorLocation, SerializedVendorLocation } from '@/lib/types';
import { calculateDistance } from '@/lib/utils/location';

/**
 * Base type for vendors that can be used with location filtering.
 * Both Vendor and SerializedVendor satisfy this interface.
 */
export interface VendorForLocation {
  id: string;
  name: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  locations?: (VendorLocation | SerializedVendorLocation)[];
}

/**
 * Location type returned by getVendorLocations - normalized for internal use
 */
interface NormalizedLocation {
  id?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isHQ?: boolean;
}

/**
 * Extracts all eligible locations for a vendor based on tier
 * Extracts all locations from a vendor's locations array based on tier
 * @param vendor - Vendor to get locations from
 * @returns Array of eligible location objects with coordinates
 */
function getVendorLocations(vendor: VendorForLocation): NormalizedLocation[] {
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

  return [];
}

/**
 * Extended vendor type with distance information.
 * Generic to preserve the input vendor type (Vendor or SerializedVendor).
 */
export type VendorWithDistance<T extends VendorForLocation = VendorForLocation> = T & {
  /** Calculated distance from user location in kilometers */
  distance?: number;
  /** The specific location that matched the search (for multi-location vendors) */
  matchedLocation?: NormalizedLocation;
};

export interface UseLocationFilterResult<T extends VendorForLocation> {
  /** Vendors filtered by distance */
  filteredVendors: VendorWithDistance<T>[];
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
 * @param vendors - Array of all vendors (Vendor or SerializedVendor)
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
export function useLocationFilter<T extends VendorForLocation>(
  vendors: T[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): UseLocationFilterResult<T> {
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

    console.log(`🎯 Searching from coordinates: lat=${userLocation.latitude}, lng=${userLocation.longitude}, radius=${maxDistance}km`);

    // Calculate distances and filter vendors (NEW: multi-location support)
    const vendorsWithDistances: VendorWithDistance<T>[] = vendors
      .map(vendor => {
        // Get all eligible vendor locations (tier-aware)
        const eligibleLocations = getVendorLocations(vendor);

        // Skip vendors without any eligible locations
        if (eligibleLocations.length === 0) {
          console.log(`⚠️  ${vendor.name}: No eligible locations (tier: ${vendor.tier})`);
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

          // Log distances for debugging
          console.log(`📏 ${vendor.name} (tier: ${vendor.tier}):`,
            locationsWithDistances.map(({ location, distance }) =>
              `${location.city || 'Unknown'}: ${distance.toFixed(1)}km`
            ).join(', ')
          );

          // Find the closest location within maxDistance
          const closestLocation = locationsWithDistances
            .filter(({ distance }) => distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance)[0];

          // If no location is within range, exclude this vendor
          if (!closestLocation) {
            console.log(`❌ ${vendor.name}: All locations outside ${maxDistance}km range`);
            return { ...vendor, distance: undefined, matchedLocation: undefined };
          }

          console.log(`✅ ${vendor.name}: Matched at ${closestLocation.distance.toFixed(1)}km (${closestLocation.location.city})`);

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
 * @param vendors - Array of all vendors (Vendor or SerializedVendor)
 * @param userLocation - User's current location coordinates
 * @param maxDistance - Maximum distance in kilometers
 * @returns Array of vendors within distance, sorted by proximity
 *
 * @example
 * const nearbyVendors = useNearbyVendors(vendors, userLocation, 50);
 */
export function useNearbyVendors<T extends VendorForLocation>(
  vendors: T[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): VendorWithDistance<T>[] {
  return useLocationFilter(vendors, userLocation, maxDistance).filteredVendors;
}

/**
 * Helper hook for checking if a specific vendor is nearby
 *
 * @param vendor - Vendor to check (Vendor or SerializedVendor)
 * @param userLocation - User's current location coordinates
 * @param maxDistance - Maximum distance in kilometers
 * @returns Object with isNearby flag and calculated distance
 *
 * @example
 * const { isNearby, distance } = useIsVendorNearby(vendor, userLocation, 100);
 */
export function useIsVendorNearby<T extends VendorForLocation>(
  vendor: T,
  userLocation: VendorCoordinates | null,
  maxDistance: number
): { isNearby: boolean; distance?: number } {
  return useMemo(() => {
    const locations = getVendorLocations(vendor);
    const firstLoc = locations[0];

    if (!userLocation || !firstLoc || firstLoc.latitude === undefined || firstLoc.longitude === undefined) {
      return { isNearby: false, distance: undefined };
    }

    try {
      const distance = calculateDistance(userLocation, { latitude: firstLoc.latitude, longitude: firstLoc.longitude }, 'km');
      const isNearby = distance <= maxDistance;

      return { isNearby, distance };
    } catch (error) {
      console.warn(`Error checking if vendor ${vendor.name} is nearby:`, error);
      return { isNearby: false, distance: undefined };
    }
  }, [vendor, userLocation, maxDistance]);
}

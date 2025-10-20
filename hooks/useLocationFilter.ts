'use client';

import { useMemo } from 'react';
import { Vendor, VendorCoordinates, VendorLocation } from '@/lib/types';
import { calculateDistance } from '@/lib/utils/location';

/**
 * Extracts coordinates from a vendor's location field
 * Handles both VendorLocation objects and legacy string locations
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

export interface VendorWithDistance extends Vendor {
  /** Calculated distance from user location in miles */
  distance?: number;
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
 * @param maxDistance - Maximum distance in miles for filtering
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
    // Count vendors with/without coordinates
    const vendorsWithCoordinates = vendors.filter(v => getVendorCoordinates(v) !== null).length;
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

    // Calculate distances and filter vendors
    const vendorsWithDistances: VendorWithDistance[] = vendors
      .map(vendor => {
        // Get vendor coordinates
        const vendorCoords = getVendorCoordinates(vendor);

        // Skip vendors without coordinates
        if (!vendorCoords) {
          return { ...vendor, distance: undefined };
        }

        try {
          // Calculate distance from user location (in miles)
          const distance = calculateDistance(
            userLocation,
            vendorCoords,
            'miles'
          );

          return { ...vendor, distance };
        } catch (error) {
          // Log error but don't fail - just exclude this vendor
          console.warn(
            `Error calculating distance for vendor ${vendor.name}:`,
            error
          );
          return { ...vendor, distance: undefined };
        }
      })
      .filter(vendor => {
        // Exclude vendors without coordinates when searching by location
        if (vendor.distance === undefined) {
          return false;
        }

        // Filter by distance
        return vendor.distance <= maxDistance;
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
 * @param maxDistance - Maximum distance in miles
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
 * @param maxDistance - Maximum distance in miles
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
      const distance = calculateDistance(userLocation, vendorCoords, 'miles');
      const isNearby = distance <= maxDistance;

      return { isNearby, distance };
    } catch (error) {
      console.warn(`Error checking if vendor ${vendor.name} is nearby:`, error);
      return { isNearby: false, distance: undefined };
    }
  }, [vendor, userLocation, maxDistance]);
}

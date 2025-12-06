/**
 * LocationService - Business logic for vendor location management
 *
 * Provides:
 * - Location validation (coordinates, field lengths)
 * - HQ uniqueness enforcement
 * - Tier-based access control for multiple locations
 * - Distance calculation (Haversine formula)
 * - Auto-HQ designation logic
 */

import { VendorLocation } from '@/lib/types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface TierAccessResult {
  allowed: boolean;
  error?: string;
}

/**
 * Validates vendor locations array
 * Checks: coordinate ranges, field lengths, HQ uniqueness
 */
export function validateVendorLocations(locations: VendorLocation[]): ValidationResult {
  const errors: string[] = [];

  // Empty array is valid
  if (!locations || locations.length === 0) {
    return { valid: true, errors: [] };
  }

  // Validate each location
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];

    // Validate latitude range
    if (loc.latitude !== undefined && (loc.latitude < -90 || loc.latitude > 90)) {
      errors.push('Latitude must be between -90 and 90');
    }

    // Validate longitude range
    if (loc.longitude !== undefined && (loc.longitude < -180 || loc.longitude > 180)) {
      errors.push('Longitude must be between -180 and 180');
    }

    // Validate address length
    if (loc.address && loc.address.length > 500) {
      errors.push('Address must not exceed 500 characters');
    }

    // Validate city length
    if (loc.city && loc.city.length > 255) {
      errors.push('City must not exceed 255 characters');
    }

    // Validate country length
    if (loc.country && loc.country.length > 255) {
      errors.push('Country must not exceed 255 characters');
    }
  }

  // Validate HQ uniqueness
  const hqLocations = locations.filter(loc => loc.isHQ === true);

  if (hqLocations.length === 0 && locations.length > 0) {
    // If no HQ is explicitly set, this will be handled by auto-designation hook
    // But if all locations are explicitly set to isHQ: false, that's an error
    const allExplicitlyFalse = locations.every(loc => loc.isHQ === false);
    if (allExplicitlyFalse) {
      errors.push('Exactly one location must be designated as Headquarters');
    }
  }

  if (hqLocations.length > 1) {
    errors.push('Only one location can be designated as Headquarters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if vendor tier allows multiple locations
 * Tier 2 = unlimited locations
 * Tier 0/1 = max 1 location
 */
export function checkTierLocationAccess(tier: string, locations: VendorLocation[]): TierAccessResult {
  // Empty or single location is always allowed
  if (!locations || locations.length <= 1) {
    return { allowed: true };
  }

  // Multiple locations require tier2
  if (tier === 'free' || tier === 'tier1') {
    return {
      allowed: false,
      error: 'Multiple locations require Tier 2 subscription',
    };
  }

  return { allowed: true };
}

/**
 * Auto-designates first location as HQ if no HQ exists
 * Used in beforeChange hook
 */
export function autoDesignateHQLocation(locations: VendorLocation[]): VendorLocation[] {
  if (!locations || locations.length === 0) {
    return locations;
  }

  // Check if any location has isHQ: true
  const hasHQ = locations.some(loc => loc.isHQ === true);

  if (!hasHQ) {
    // Designate first location as HQ
    const updatedLocations = [...locations];
    updatedLocations[0] = {
      ...updatedLocations[0],
      isHQ: true,
    };

    // Ensure all others are false
    for (let i = 1; i < updatedLocations.length; i++) {
      updatedLocations[i] = {
        ...updatedLocations[i],
        isHQ: false,
      };
    }

    return updatedLocations;
  }

  return locations;
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filters vendor locations based on tier for public display
 * All tiers: Show HQ location
 * Tier 2: Show all locations
 * Tier 0/1: Show only HQ
 */
export function filterLocationsByTier(
  locations: VendorLocation[],
  tier: string
): VendorLocation[] {
  if (!locations || locations.length === 0) {
    return [];
  }

  // Tier 2 vendors show all locations
  if (tier === 'tier2') {
    return locations;
  }

  // Tier 0/1 vendors show only HQ
  return locations.filter(loc => loc.isHQ === true);
}

/**
 * Searches for vendors within a radius of given coordinates
 * Returns vendors with at least one location within the radius
 */
export function findVendorsWithinRadius(
  vendors: Array<{ locations?: VendorLocation[]; tier: string }>,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): Array<{ locations?: VendorLocation[]; tier: string }> {
  return vendors.filter(vendor => {
    if (!vendor.locations || vendor.locations.length === 0) {
      return false;
    }

    // Filter locations based on tier first
    const visibleLocations = filterLocationsByTier(vendor.locations, vendor.tier);

    // Check if any visible location is within radius
    return visibleLocations.some(loc => {
      if (loc.latitude === undefined || loc.longitude === undefined) {
        return false;
      }

      const distance = calculateDistance(
        centerLat,
        centerLon,
        loc.latitude,
        loc.longitude
      );

      return distance <= radiusKm;
    });
  });
}

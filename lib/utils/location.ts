import { VendorLocation, VendorCoordinates } from '../types';

/**
 * Returns the HQ location from a vendor's locations array,
 * falling back to the first location if no HQ is designated.
 * @param locations - Vendor locations array
 * @returns The HQ location, or undefined if no locations exist
 */
export function getHQLocation(locations?: VendorLocation[]): VendorLocation | undefined {
  if (!locations || locations.length === 0) return undefined;
  return locations.find(loc => loc.isHQ) || locations[0];
}

/**
 * Formats vendor location for display
 * @param location - Vendor location object
 * @returns Formatted location string for display
 */
export function formatVendorLocation(location: VendorLocation | undefined): string {
  if (!location) {
    return '';
  }

  // Priority: City, Country > Address > City > Country
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }

  if (location.address) {
    return location.address;
  }

  if (location.city) {
    return location.city;
  }

  if (location.country) {
    return location.country;
  }

  return '';
}

/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Earth's radius in miles
 */
const EARTH_RADIUS_MILES = 3959;

/**
 * Validates that a coordinate value is within valid ranges
 */
function validateCoordinate(lat: number, lng: number): void {
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
  }
  if (lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
  }
}

/**
 * Converts degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the great-circle distance between two points on Earth
 * using the Haversine formula
 *
 * Formula:
 * a = sin²(Δφ/2) + cos φ1 * cos φ2 * sin²(Δλ/2)
 * c = 2 * atan2(√a, √(1−a))
 * d = R * c
 *
 * Where:
 * - φ is latitude
 * - λ is longitude
 * - R is earth's radius
 *
 * @param coord1 - First coordinate (origin)
 * @param coord2 - Second coordinate (destination)
 * @param unit - Unit of measurement ('km' or 'miles'), defaults to 'km'
 * @returns Distance between the two coordinates in the specified unit, rounded to 2 decimal places
 * @throws Error if coordinates are invalid
 *
 * @example
 * const monaco = { latitude: 43.7384, longitude: 7.4246 };
 * const paris = { latitude: 48.8566, longitude: 2.3522 };
 * const distance = calculateDistance(monaco, paris); // ~688 km
 */
export function calculateDistance(
  coord1: VendorCoordinates,
  coord2: VendorCoordinates,
  unit: 'km' | 'miles' = 'km'
): number {
  // Validate coordinates
  validateCoordinate(coord1.latitude, coord1.longitude);
  validateCoordinate(coord2.latitude, coord2.longitude);

  // Select earth radius based on unit
  const earthRadius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;

  // Convert to radians
  const lat1 = degreesToRadians(coord1.latitude);
  const lat2 = degreesToRadians(coord2.latitude);
  const deltaLat = degreesToRadians(coord2.latitude - coord1.latitude);
  const deltaLng = degreesToRadians(coord2.longitude - coord1.longitude);

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Checks if a coordinate is within a specified distance from a reference point
 *
 * @param origin - Reference coordinate (user location)
 * @param target - Coordinate to check (vendor location)
 * @param maxDistance - Maximum distance in km
 * @param unit - Unit of measurement ('km' or 'miles'), defaults to 'km'
 * @returns true if target is within maxDistance from origin, false otherwise
 *
 * @example
 * const userLocation = { latitude: 43.7384, longitude: 7.4246 };
 * const vendorLocation = { latitude: 43.7500, longitude: 7.4300 };
 * const isNearby = isWithinDistance(userLocation, vendorLocation, 80); // true
 */
function isWithinDistance(
  origin: VendorCoordinates,
  target: VendorCoordinates,
  maxDistance: number,
  unit: 'km' | 'miles' = 'km'
): boolean {
  try {
    const distance = calculateDistance(origin, target, unit);
    return distance <= maxDistance;
  } catch (error) {
    // If coordinates are invalid, return false
    console.warn('Invalid coordinates in isWithinDistance:', error);
    return false;
  }
}

/**
 * Formats a distance value for display
 *
 * @param distance - Distance in km
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted distance string with unit
 *
 * @example
 * formatDistance(68.5, 1) // "68.5 km"
 * formatDistance(1.2, 2) // "1.20 km"
 */
export function formatDistance(distance: number, decimals: number = 1): string {
  return `${distance.toFixed(decimals)} km`;
}

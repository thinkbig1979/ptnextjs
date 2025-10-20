import { VendorLocation } from "../types";

/**
 * Type guard to check if location is structured object with required coordinates
 * @param location - Vendor location field (string or object)
 * @returns true if location is VendorLocation object with coordinates
 */
export function isVendorLocationObject(
  location: VendorLocation | string | undefined
): location is VendorLocation & { latitude: number; longitude: number } {
  return (
    typeof location === "object" &&
    location !== null &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  );
}

/**
 * Validates coordinate bounds
 * @param coords - Coordinate object to validate
 * @returns true if coordinates are within valid WGS84 bounds
 */
export function areValidCoordinates(coords: {
  latitude: number;
  longitude: number;
}): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

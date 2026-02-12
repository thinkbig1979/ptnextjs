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

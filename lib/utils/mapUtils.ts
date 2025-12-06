/**
 * mapUtils - Leaflet map utilities and configuration
 */

import { LatLngBounds, LatLngExpression } from 'leaflet';
import { VendorLocation } from '@/lib/types';

export const DEFAULT_MAP_CENTER: LatLngExpression = [43.7384, 7.4246];
export const DEFAULT_ZOOM = 12;

export const TILE_PROVIDERS = {
  openStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

export const DEFAULT_TILE_LAYER = TILE_PROVIDERS.openStreetMap;

export const MARKER_COLORS = {
  hq: { color: '#ef4444', accent: '#dc2626' },
  additional: { color: '#3b82f6', accent: '#1d4ed8' },
};

export function locationToCoordinates(location: VendorLocation): LatLngExpression | null {
  if (location.latitude === undefined || location.longitude === undefined) {
    return null;
  }
  return [location.latitude, location.longitude];
}

export function calculateBounds(locations: VendorLocation[]): LatLngBounds | null {
  const validLocations = locations.filter((loc) =>
    typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
  );

  if (validLocations.length === 0) return null;

  let minLat = validLocations[0].latitude!;
  let maxLat = validLocations[0].latitude!;
  let minLng = validLocations[0].longitude!;
  let maxLng = validLocations[0].longitude!;

  validLocations.forEach((loc) => {
    const lat = loc.latitude!;
    const lng = loc.longitude!;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  return new LatLngBounds([minLat, minLng], [maxLat, maxLng]);
}

export function getMarkerColor(isHQ?: boolean): { color: string; accent: string } {
  return isHQ ? MARKER_COLORS.hq : MARKER_COLORS.additional;
}

export function isValidCoordinates(latitude?: number, longitude?: number): boolean {
  if (latitude === undefined || longitude === undefined) return false;
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export const MAP_BOUNDS_PADDING = { padding: [50, 50] as [number, number], maxZoom: 15 };

export default {
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM,
  TILE_PROVIDERS,
  DEFAULT_TILE_LAYER,
  MARKER_COLORS,
  locationToCoordinates,
  calculateBounds,
  getMarkerColor,
  isValidCoordinates,
  MAP_BOUNDS_PADDING,
};

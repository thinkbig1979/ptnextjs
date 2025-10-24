'use client';

import React, { useMemo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorLocation } from '@/lib/types';
import {
  DEFAULT_TILE_LAYER,
  calculateBounds,
  locationToCoordinates,
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM,
  isValidCoordinates,
} from '@/lib/utils/mapUtils';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export interface LocationMapPreviewProps {
  locations: VendorLocation[];
  vendorName?: string;
  className?: string;
  height?: number;
}

/**
 * LocationMapPreview - Display vendor locations on interactive map
 */
export function LocationMapPreview({
  locations,
  vendorName = 'Vendor',
  className = '',
  height = 400,
}: LocationMapPreviewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validLocations = useMemo(
    () =>
      locations.filter((loc) =>
        isValidCoordinates(loc.latitude, loc.longitude)
      ) || [],
    [locations]
  );

  const { hqLocation, additionalLocations } = useMemo(() => {
    const hq = validLocations.find((loc) => loc.isHQ);
    const additional = validLocations.filter((loc) => !loc.isHQ);
    return { hqLocation: hq, additionalLocations: additional };
  }, [validLocations]);

  const mapCenter = useMemo(() => {
    if (hqLocation) {
      const coords = locationToCoordinates(hqLocation);
      if (coords) return coords;
    }
    if (validLocations.length > 0) {
      const coords = locationToCoordinates(validLocations[0]);
      if (coords) return coords;
    }
    return DEFAULT_MAP_CENTER;
  }, [hqLocation, validLocations]);

  const bounds = useMemo(
    () => calculateBounds(validLocations) ?? undefined,
    [validLocations]
  );

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{vendorName} Locations</CardTitle>
          <CardDescription>Loading map...</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="bg-gray-100 rounded-lg flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <span className="text-gray-500">Map loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validLocations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{vendorName} Locations</CardTitle>
          <CardDescription>No location data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="bg-gray-50 rounded-lg flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <span className="text-gray-500">No locations to display</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{vendorName} Locations</CardTitle>
        <CardDescription>
          {validLocations.length} location{validLocations.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={false}
            style={{ height: `${height}px`, width: '100%' }}
            bounds={bounds}
            boundsOptions={{ padding: [50, 50], maxZoom: 15 }}
          >
            <TileLayer
              url={DEFAULT_TILE_LAYER.url}
              attribution={DEFAULT_TILE_LAYER.attribution}
              maxZoom={DEFAULT_TILE_LAYER.maxZoom}
            />

            {hqLocation && (
              <Marker position={locationToCoordinates(hqLocation)!}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-red-600">[HQ] {hqLocation.address || 'Headquarters'}</p>
                    {hqLocation.city && <p>{hqLocation.city}</p>}
                    {hqLocation.country && <p>{hqLocation.country}</p>}
                  </div>
                </Popup>
              </Marker>
            )}

            {additionalLocations.map((location, idx) => (
              <Marker
                key={`location-${idx}`}
                position={locationToCoordinates(location)!}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold text-blue-600">{location.address || 'Office Location'}</p>
                    {location.city && <p>{location.city}</p>}
                    {location.country && <p>{location.country}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default LocationMapPreview;

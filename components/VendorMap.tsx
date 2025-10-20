'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import { VendorCoordinates } from '@/lib/types';

// Fix for default marker icons in Next.js
// This is required because Webpack doesn't properly bundle Leaflet's marker images
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface VendorMapProps {
  /** Vendor name for display in marker popup */
  name: string;
  /** Geographic coordinates */
  coordinates: VendorCoordinates;
  /** Optional className for styling */
  className?: string;
  /** Optional zoom level (default: 13) */
  zoom?: number;
  /** Optional map height (default: "400px") */
  height?: string;
}

export function VendorMap({
  name,
  coordinates,
  className = '',
  zoom = 13,
  height = '400px',
}: VendorMapProps) {
  // Validate coordinates
  const { latitude, longitude } = coordinates;

  if (
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
        data-testid="vendor-map-error"
      >
        <div className="text-center p-6">
          <p className="text-gray-600 text-sm">
            Invalid coordinates: {latitude}, {longitude}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`vendor-map-wrapper rounded-lg overflow-hidden shadow-md ${className}`}
      style={{ height }}
      data-testid="vendor-map"
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="vendor-map-container"
        attributionControl={true}
        aria-label={`Map showing location of ${name}`}
      >
        {/* OpenStreetMap tiles via tile.openstreetmap.org - NO API KEY REQUIRED */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={1}
          crossOrigin={true}
        />

        {/* Vendor location marker */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="vendor-map-popup">
              <h3 className="font-semibold text-sm mb-1">{name}</h3>
              <p className="text-xs text-gray-600">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

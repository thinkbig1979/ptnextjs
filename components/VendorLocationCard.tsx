'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { VendorLocation } from '@/lib/types';

interface VendorLocationCardProps {
  /** Vendor name for display */
  name: string;
  /** Location data (can be string for legacy or VendorLocation object) */
  location?: VendorLocation | string;
  /** Optional distance from user location (in miles) */
  distance?: number;
  /** Optional className for styling */
  className?: string;
}

export function VendorLocationCard({
  name,
  location,
  distance,
  className = '',
}: VendorLocationCardProps) {
  // Handle legacy string location
  if (typeof location === 'string') {
    return (
      <Card className={className} data-testid="vendor-location-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div data-testid="vendor-location">
            <p className="text-base">{location}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle VendorLocation object
  if (!location) {
    return (
      <Card className={className} data-testid="vendor-location-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 italic">
            Location information not available
          </p>
        </CardContent>
      </Card>
    );
  }

  const { address, latitude, longitude, city, country } = location;

  // Generate Google Maps directions URL
  const getDirectionsUrl = (): string | null => {
    if (latitude === undefined || longitude === undefined) return null;
    const query = encodeURIComponent(name);
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&query=${query}`;
  };

  // Format location display
  const formatLocationDisplay = (): string => {
    const parts: string[] = [];
    if (city) parts.push(city);
    if (country) parts.push(country);
    return parts.join(', ') || 'Location available';
  };

  const directionsUrl = getDirectionsUrl();
  const locationDisplay = formatLocationDisplay();

  return (
    <Card className={className} data-testid="vendor-location-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Location/City/Country */}
        {(city || country) && (
          <div data-testid="vendor-location">
            <p className="text-base font-medium">{locationDisplay}</p>
          </div>
        )}

        {/* Display Distance (if calculated) */}
        {distance !== undefined && (
          <div data-testid="vendor-distance" className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{distance.toFixed(1)} miles</span> away
            </p>
          </div>
        )}

        {/* Display Full Address */}
        {address && (
          <div data-testid="vendor-address">
            <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
            <address className="not-italic text-sm text-gray-600">
              {address}
            </address>
          </div>
        )}

        {/* Display Coordinates */}
        {latitude !== undefined && longitude !== undefined && (
          <div data-testid="vendor-coordinates">
            <p className="text-sm font-medium text-gray-700 mb-1">Coordinates</p>
            <p className="text-xs font-mono text-gray-500">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
        )}

        {/* Get Directions Button */}
        {directionsUrl && (
          <Button
            asChild
            variant="outline"
            className="w-full"
            data-testid="get-directions"
          >
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

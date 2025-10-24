import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { VendorLocation } from '@/lib/types';

export interface LocationCardProps {
  location: VendorLocation;
  isHQ?: boolean;
}

/**
 * LocationCard - Display individual location details with "Get Directions" link
 */
export function LocationCard({ location, isHQ = false }: LocationCardProps) {
  // Construct Google Maps directions URL
  const mapsUrl = location.latitude && location.longitude
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : undefined;

  // Build display address
  const addressParts = [
    location.address,
    location.city,
    location.country
  ].filter(Boolean);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {location.city || location.country || 'Location'}
              </CardTitle>
            </div>
          </div>
          {isHQ && (
            <Badge variant="default" className="bg-red-600 ml-2 flex-shrink-0">
              HQ
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Address Information */}
        <div className="space-y-1">
          {location.address && (
            <p className="text-sm text-muted-foreground">{location.address}</p>
          )}
          {(location.city || location.country) && (
            <p className="text-sm text-muted-foreground">
              {[location.city, location.country].filter(Boolean).join(', ')}
            </p>
          )}
          {location.postalCode && (
            <p className="text-sm text-muted-foreground">{location.postalCode}</p>
          )}
        </div>

        {/* Get Directions Button */}
        {mapsUrl && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full group"
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default LocationCard;

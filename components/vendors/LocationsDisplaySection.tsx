'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocationCard } from './LocationCard';
import { VendorLocation } from '@/lib/types';
import { Globe, Map as MapIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/**
 * MapController - Component to handle map view changes
 * Must be used inside MapContainer
 */
function MapController({ center, zoom }: { center: [number, number]; zoom: number }): null {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.5,
    });
  }, [center, zoom, map]);

  return null;
}

export interface LocationsDisplaySectionProps {
  locations: VendorLocation[];
  vendorTier?: string;
  isLoading?: boolean;
  error?: string;
}

/**
 * LocationsDisplaySection - Display vendor locations on interactive map with list view
 *
 * Features:
 * - Interactive map showing all locations
 * - Tier-based filtering (tier2+ shows all, tier0/1 shows HQ only)
 * - List of location cards with "Get Directions" links
 * - Responsive layout (side-by-side on desktop, stacked on mobile)
 */
export function LocationsDisplaySection({
  locations,
  vendorTier,
  isLoading = false,
  error,
}: LocationsDisplaySectionProps): React.JSX.Element {
  // State for focused location (for "Show on Map" feature)
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null);

  // Validate coordinates
  const validLocations = useMemo(
    () =>
      locations?.filter(
        (loc) =>
          loc.latitude !== undefined &&
          loc.longitude !== undefined &&
          !isNaN(loc.latitude) &&
          !isNaN(loc.longitude)
      ) || [],
    [locations]
  );

  // Apply tier-based filtering
  const filteredLocations = useMemo(() => {
    if (!validLocations || validLocations.length === 0) {
      return [];
    }

    // If no tier specified, show all locations (default behavior)
    if (!vendorTier) {
      return validLocations;
    }

    // Tier 2+ vendors show all locations
    if (vendorTier === 'tier2' || vendorTier === 'tier3') {
      return validLocations;
    }

    // Tier 0/1 vendors show only HQ
    const hqLocations = validLocations.filter((loc) => loc.isHQ === true);

    // If no HQ is explicitly marked, treat first location as HQ
    if (hqLocations.length === 0 && validLocations.length > 0) {
      return [{ ...validLocations[0], isHQ: true }];
    }

    return hqLocations;
  }, [validLocations, vendorTier]);

  // Find HQ location for map centering
  const hqLocation = useMemo(
    () => filteredLocations.find((loc) => loc.isHQ === true) || filteredLocations[0],
    [filteredLocations]
  );

  // Find focused location if one is selected
  const focusedLocation = useMemo(
    () => focusedLocationId ? filteredLocations.find((loc) => loc.id === focusedLocationId) : null,
    [focusedLocationId, filteredLocations]
  );

  // Calculate map center (use focused location if selected, otherwise HQ)
  const mapCenter: [number, number] = useMemo(() => {
    const targetLocation = focusedLocation || hqLocation;
    if (targetLocation?.latitude && targetLocation?.longitude) {
      return [targetLocation.latitude, targetLocation.longitude];
    }
    return [43.7384, 7.4246]; // Default: Monaco
  }, [focusedLocation, hqLocation]);

  // Calculate appropriate zoom level
  const mapZoom = useMemo(() => {
    // If focusing on a specific location, zoom in closer
    if (focusedLocationId) {
      return 14;
    }

    // If only one location, use medium zoom
    if (filteredLocations.length <= 1) {
      return 12;
    }

    // Calculate bounds for multiple locations
    const lats = filteredLocations.map((loc) => loc.latitude!);
    const lngs = filteredLocations.map((loc) => loc.longitude!);
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);

    // Adjust zoom based on spread
    if (maxDiff > 50) return 4;
    if (maxDiff > 20) return 6;
    if (maxDiff > 10) return 8;
    if (maxDiff > 5) return 10;
    return 12;
  }, [focusedLocationId, filteredLocations]);

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-testid="loading-spinner"
      >
        <div className="text-muted-foreground">Loading locations...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">{error}</div>
      </Card>
    );
  }

  // Show empty state
  if (!locations || locations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No locations available</p>
          </div>
        </div>
      </Card>
    );
  }

  // Show invalid coordinates error
  if (validLocations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Location data is incomplete. Please ensure all locations have valid coordinates.
        </div>
      </Card>
    );
  }

  // Final safety check - ensure filtered locations have valid coordinates
  if (filteredLocations.length === 0 || !filteredLocations.every(loc => loc.latitude && loc.longitude)) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Location data is incomplete. Please ensure all locations have valid coordinates.
        </div>
      </Card>
    );
  }

  // Determine if we need to show upgrade message
  const showUpgradeMessage =
    (vendorTier === 'free' || vendorTier === 'tier1') &&
    validLocations.length > filteredLocations.length;

  return (
    <div className="space-y-6" role="region" aria-label="Locations map">
      {/* Upgrade Message */}
      {showUpgradeMessage && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-accent">
            Upgrade to see all locations. Currently showing headquarters only.
          </p>
        </Card>
      )}

      {/* Map Section */}
      <div className="rounded-lg overflow-hidden border border-border relative">
        {/* Back to HQ Button - shown when viewing a non-HQ location */}
        {focusedLocationId && hqLocation && focusedLocationId !== hqLocation.id && (
          <Button
            onClick={() => setFocusedLocationId(null)}
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-[1000] shadow-lg"
            title="Return to headquarters view"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Show HQ
          </Button>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          dragging={true}
          zoomControl={true}
          className="h-64 md:h-80 lg:h-[500px]"
          style={{ width: '100%' }}
          data-testid="map-container"
        >
          {/* Map controller to handle view changes */}
          <MapController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Render markers for all filtered locations */}
          {filteredLocations.map((location, index) => (
            <Marker
              key={location.id || `location-${index}`}
              position={[location.latitude!, location.longitude!]}
              data-testid="marker"
              data-position={JSON.stringify([location.latitude, location.longitude])}
              data-is-hq={location.isHQ ? 'true' : 'false'}
            >
              <Popup data-testid="popup">
                <div className="text-sm">
                  {location.locationName && (
                    <p className="font-bold mb-1">{location.locationName}</p>
                  )}
                  {location.isHQ && (
                    <Badge variant="default" className="bg-red-600 mb-2 text-xs">
                      Headquarters
                    </Badge>
                  )}
                  {location.address && <p>{location.address}</p>}
                  {location.city && <p>{location.city}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Locations List Section */}
      <div className="mt-6 space-y-4">
        {filteredLocations.map((location, index) => (
          <LocationCard
            key={location.id || `location-${index}`}
            location={location}
            isHQ={location.isHQ || false}
            onShowOnMap={setFocusedLocationId}
            isFocused={focusedLocationId === location.id}
          />
        ))}
      </div>
    </div>
  );
}

export default LocationsDisplaySection;

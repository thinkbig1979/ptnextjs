'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, Search, X, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VendorCoordinates, PhotonFeature, GeocodeSuccessResponse } from '@/lib/types';
import { LocationResultSelector } from '@/components/location-result-selector';

interface LocationSearchFilterProps {
  onSearch: (userLocation: VendorCoordinates, distance: number) => void;
  onReset: () => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export function LocationSearchFilter({
  onSearch,
  onReset,
  resultCount,
  totalCount,
  className = '',
}: LocationSearchFilterProps) {
  // Location name search state
  const [locationInput, setLocationInput] = useState('');
  const [searchResults, setSearchResults] = useState<PhotonFeature[]>([]);
  const [showResultSelector, setShowResultSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual coordinate input state (advanced mode)
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Filter state
  const [distance, setDistance] = useState<number>(160); // Default 160 km
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<VendorCoordinates | null>(null);

  /**
   * Debounced geocoding API call
   * Waits 300ms after user stops typing before making API call
   */
  useEffect(() => {
    // Only search if location input has at least 2 characters
    if (locationInput.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Debounce: Wait 300ms before making API call
    const debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(locationInput.trim())}&limit=5`
        );

        if (!response.ok) {
          // Handle specific error codes
          switch (response.status) {
            case 400:
              setError('Invalid location search. Please try a different term.');
              break;
            case 429:
              setError('Too many requests. Please wait a moment and try again.');
              break;
            case 503:
              setError('Service temporarily unavailable. Try using manual coordinates.');
              break;
            case 500:
            default:
              setError('Service error. Please try again.');
              break;
          }
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as GeocodeSuccessResponse;

        if (data.results.length === 0) {
          setError('No locations found. Please try a different search term.');
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        setSearchResults(data.results);

        // Handle single result: auto-apply
        if (data.results.length === 1) {
          const result = data.results[0];
          const coords: VendorCoordinates = {
            latitude: result.geometry.coordinates[1],
            longitude: result.geometry.coordinates[0],
          };
          setSelectedCoordinates(coords);
          setIsSearchActive(true);
          onSearch(coords, distance);
        } else {
          // Multiple results: show selector dialog
          setShowResultSelector(true);
        }

        setIsLoading(false);
      } catch (err) {
        setError('Network error. Please check your connection and try again.');
        setSearchResults([]);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [locationInput, distance, onSearch]);

  /**
   * Handle location selection from result selector dialog
   */
  const handleLocationSelect = useCallback(
    (result: PhotonFeature) => {
      const coords: VendorCoordinates = {
        latitude: result.geometry.coordinates[1],
        longitude: result.geometry.coordinates[0],
      };

      setSelectedCoordinates(coords);
      setShowResultSelector(false);
      setIsSearchActive(true);
      onSearch(coords, distance);
    },
    [distance, onSearch]
  );

  /**
   * Handle manual coordinate search (advanced mode)
   */
  const handleManualSearch = () => {
    setError(null);

    const latitude = parseFloat(manualLatitude);
    const longitude = parseFloat(manualLongitude);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Invalid coordinates. Please enter valid numbers.');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    const userLocation: VendorCoordinates = { latitude, longitude };
    setSelectedCoordinates(userLocation);
    setIsSearchActive(true);
    onSearch(userLocation, distance);
  };

  /**
   * Handle reset - clear all inputs and filters
   */
  const handleReset = () => {
    setLocationInput('');
    setManualLatitude('');
    setManualLongitude('');
    setDistance(160);
    setError(null);
    setIsSearchActive(false);
    setSelectedCoordinates(null);
    setSearchResults([]);
    setShowResultSelector(false);
    onReset();
  };

  /**
   * Format result count message
   */
  const getResultMessage = (): string | null => {
    if (!isSearchActive || resultCount === undefined) return null;

    if (resultCount === 0) {
      return `No vendors found within ${distance} km`;
    }

    if (totalCount !== undefined) {
      return `Showing ${resultCount} of ${totalCount} vendors within ${distance} km`;
    }

    return `${resultCount} vendors found within ${distance} km`;
  };

  const resultMessage = getResultMessage();

  return (
    <>
      <Card className={className} data-testid="location-search-filter">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Search by Location
          </CardTitle>
          <CardDescription>
            Find vendors near you by searching for a location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Name Input */}
          <div className="space-y-2">
            <Label htmlFor="location-name-input">
              Location Name
            </Label>
            <div className="relative">
              <Input
                id="location-name-input"
                type="text"
                placeholder="Search for a location (e.g., Monaco, Paris)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                disabled={isLoading}
                data-testid="location-input"
                aria-describedby="location-name-help"
                className={cn(
                  "pr-10 transition-opacity duration-150",
                  isLoading && "opacity-70"
                )}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p id="location-name-help" className="text-xs text-gray-500">
              Type at least 2 characters to search
            </p>
          </div>

          {/* Distance Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="distance-slider">
                Distance Radius
              </Label>
              <span className="text-sm font-medium" data-testid="distance-value">
                {distance} km
              </span>
            </div>
            <Slider
              id="distance-slider"
              min={16}
              max={800}
              step={16}
              value={[distance]}
              onValueChange={(value) => {
                setDistance(value[0]);
                // Update filter if already active
                if (isSearchActive && selectedCoordinates) {
                  onSearch(selectedCoordinates, value[0]);
                }
              }}
              data-testid="distance-slider"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>16 km</span>
              <span>800 km</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md"
              data-testid="error-message"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Result Count */}
          {resultMessage && (
            <div
              className="p-3 bg-accent/10 border border-accent/30 rounded-md"
              data-testid="result-count"
            >
              <p className="text-sm text-accent-foreground">{resultMessage}</p>
            </div>
          )}

          {/* Advanced: Manual Coordinate Input */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-md",
                "text-sm font-medium text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-all duration-200",
                "min-h-[44px] sm:min-h-[36px]",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <span>Advanced Options</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isAdvancedOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude-input" className="text-sm">
                    Latitude
                  </Label>
                  <Input
                    id="latitude-input"
                    type="text"
                    placeholder="e.g., 43.7384"
                    value={manualLatitude}
                    onChange={(e) => setManualLatitude(e.target.value)}
                    data-testid="latitude-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude-input" className="text-sm">
                    Longitude
                  </Label>
                  <Input
                    id="longitude-input"
                    type="text"
                    placeholder="e.g., 7.4246"
                    value={manualLongitude}
                    onChange={(e) => setManualLongitude(e.target.value)}
                    data-testid="longitude-input"
                  />
                </div>
              </div>
              <Button
                onClick={handleManualSearch}
                disabled={!manualLatitude.trim() || !manualLongitude.trim()}
                variant="outline"
                className={cn(
                  "w-full",
                  "min-h-[44px] sm:min-h-[36px]",
                  "transition-all duration-150"
                )}
              >
                <Search className="w-4 h-4 mr-2" />
                Search by Coordinates
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isSearchActive && (
              <Button
                onClick={handleReset}
                variant="outline"
                data-testid="reset-button"
                className={cn(
                  "flex-1",
                  "min-h-[44px] sm:min-h-[36px]",
                  "transition-all duration-150"
                )}
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Result Selector Dialog */}
      <LocationResultSelector
        results={searchResults}
        open={showResultSelector}
        onSelect={handleLocationSelect}
        onCancel={() => setShowResultSelector(false)}
      />
    </>
  );
}

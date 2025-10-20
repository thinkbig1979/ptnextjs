'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { MapPin, Search, X, AlertCircle } from 'lucide-react';
import { VendorCoordinates } from '@/lib/types';

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
  const [locationInput, setLocationInput] = useState('');
  const [distance, setDistance] = useState<number>(100); // Default 100 miles
  const [error, setError] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Parse location input (expects "latitude, longitude" format)
  const parseLocationInput = (input: string): VendorCoordinates | null => {
    // Remove whitespace and split by comma
    const parts = input.trim().split(',').map(p => p.trim());

    if (parts.length !== 2) {
      setError('Please enter coordinates as: latitude, longitude');
      return null;
    }

    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Invalid coordinates. Please enter valid numbers.');
      return null;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90');
      return null;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180');
      return null;
    }

    return { latitude, longitude };
  };

  const handleSearch = () => {
    setError(null);

    const userLocation = parseLocationInput(locationInput);
    if (!userLocation) return;

    setIsSearchActive(true);
    onSearch(userLocation, distance);
  };

  const handleReset = () => {
    setLocationInput('');
    setDistance(100);
    setError(null);
    setIsSearchActive(false);
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format result count message
  const getResultMessage = (): string | null => {
    if (!isSearchActive || resultCount === undefined) return null;

    if (resultCount === 0) {
      return `No vendors found within ${distance} miles`;
    }

    if (totalCount !== undefined) {
      return `Showing ${resultCount} of ${totalCount} vendors within ${distance} miles`;
    }

    return `${resultCount} vendors found within ${distance} miles`;
  };

  const resultMessage = getResultMessage();

  return (
    <Card className={className} data-testid="location-search-filter">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Search by Location
        </CardTitle>
        <CardDescription>
          Find vendors near you by entering coordinates and distance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location-input">
            Your Location (Latitude, Longitude)
          </Label>
          <Input
            id="location-input"
            type="text"
            placeholder="e.g., 43.7384, 7.4246"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="location-input"
            aria-describedby="location-help"
          />
          <p id="location-help" className="text-xs text-gray-500">
            Use Google Maps to find your coordinates: right-click on map → "What's here?"
          </p>
        </div>

        {/* Distance Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="distance-slider">
              Distance Radius
            </Label>
            <span className="text-sm font-medium" data-testid="distance-value">
              {distance} miles
            </span>
          </div>
          <Slider
            id="distance-slider"
            min={10}
            max={500}
            step={10}
            value={[distance]}
            onValueChange={(value) => setDistance(value[0])}
            data-testid="distance-slider"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10 miles</span>
            <span>500 miles</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
            data-testid="error-message"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Result Count */}
        {resultMessage && (
          <div
            className="p-3 bg-blue-50 border border-blue-200 rounded-md"
            data-testid="result-count"
          >
            <p className="text-sm text-blue-800">{resultMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={!locationInput.trim()}
            className="flex-1"
            data-testid="search-button"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          {isSearchActive && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              data-testid="reset-button"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

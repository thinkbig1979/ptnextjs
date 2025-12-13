'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, X, AlertCircle, Loader2, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { VendorCoordinates, PhotonFeature, GeocodeSuccessResponse } from '@/lib/types';

interface VendorSearchBarProps {
  // Name search props
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Category filter props
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  // Location search props
  onLocationSearch: (userLocation: VendorCoordinates, distance: number) => void;
  onLocationReset: () => void;
  locationResultCount?: number;
  locationTotalCount?: number;

  // General props
  placeholder?: string;
  className?: string;
}

export function VendorSearchBar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onLocationSearch,
  onLocationReset,
  locationResultCount,
  locationTotalCount,
  placeholder = "Search vendors by name, description, or technology...",
  className = '',
}: VendorSearchBarProps): React.JSX.Element {
  const [searchMode, setSearchMode] = useState<'name' | 'location'>('name');

  // Location search state
  const [locationInput, setLocationInput] = useState('');
  const [searchResults, setSearchResults] = useState<PhotonFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(160);
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<VendorCoordinates | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Manual coordinates for advanced mode
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    if (searchResults.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchResults]);

  /**
   * Debounced geocoding API call
   */
  useEffect(() => {
    if (locationInput.trim().length < 3) {
      setSearchResults([]);
      setIsLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    if (selectedCoordinates) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setError(null);

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(locationInput.trim())}&limit=5`,
          { signal: abortController.signal }
        );

        if (abortController.signal.aborted) return;

        if (!response.ok) {
          switch (response.status) {
            case 400:
              setError('Invalid location. Try a different search term.');
              break;
            case 429:
              setError('Too many requests. Please wait and try again.');
              break;
            case 503:
              setError('Service unavailable. Try manual coordinates.');
              break;
            default:
              setError('Service error. Please try again.');
              break;
          }
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as GeocodeSuccessResponse;

        if (abortController.signal.aborted) return;

        if (data.results.length === 0) {
          setError('No locations found. Try a different term.');
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        setSearchResults(data.results);
        setSelectedResultIndex(-1);
        setIsLoading(false);
        abortControllerRef.current = null;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Network error. Check connection and try again.');
        setSearchResults([]);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [locationInput, selectedCoordinates]);

  /**
   * Handle location selection from dropdown
   */
  const handleLocationSelect = useCallback(
    (result: PhotonFeature) => {
      const coords: VendorCoordinates = {
        latitude: result.geometry.coordinates[1],
        longitude: result.geometry.coordinates[0],
      };

      const displayName = [
        result.properties.name,
        result.properties.city,
        result.properties.country
      ]
        .filter(Boolean)
        .filter((value, idx, arr) => arr.indexOf(value) === idx)
        .join(', ');

      setLocationInput(displayName);
      setSelectedCoordinates(coords);
      setSearchResults([]);
      setIsLocationActive(true);
      onLocationSearch(coords, distance);

      setTimeout(() => {
        locationInputRef.current?.focus();
      }, 0);
    },
    [distance, onLocationSearch]
  );

  /**
   * Handle manual coordinate search
   */
  const handleManualSearch = () => {
    setError(null);
    const latitude = parseFloat(manualLatitude);
    const longitude = parseFloat(manualLongitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Invalid coordinates. Enter valid numbers.');
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
    setIsLocationActive(true);
    setLocationInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    onLocationSearch(userLocation, distance);
  };

  /**
   * Reset location search
   */
  const handleLocationReset = () => {
    setLocationInput('');
    setManualLatitude('');
    setManualLongitude('');
    setDistance(160);
    setError(null);
    setIsLocationActive(false);
    setSelectedCoordinates(null);
    setSearchResults([]);
    onLocationReset();
  };

  /**
   * Handle search mode change
   */
  const handleModeChange = (mode: string) => {
    if (mode === 'name' || mode === 'location') {
      setSearchMode(mode);
      // Reset the other mode when switching
      if (mode === 'name' && isLocationActive) {
        handleLocationReset();
      } else if (mode === 'location' && searchQuery) {
        onSearchChange('');
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={searchMode} onValueChange={handleModeChange} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Mode Tabs */}
          <TabsList className="grid w-full sm:w-[240px] grid-cols-2">
            <TabsTrigger value="name" className="gap-2" data-testid="search-tab-name">
              <Search className="h-4 w-4" />
              Name
            </TabsTrigger>
            <TabsTrigger value="location" className="gap-2" data-testid="search-tab-location">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger
                className="w-full sm:w-[200px]"
                data-testid="category-filter"
                aria-label="Filter by category"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Name Search Tab */}
        <TabsContent value="name" className="mt-4 space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              data-testid="name-search-input"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Location Search Tab */}
        <TabsContent value="location" className="mt-4 space-y-4">
          <div className="space-y-4">
            {/* Location Input */}
            <div className="flex gap-2">
              <div className="relative flex-1" ref={dropdownRef}>
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Search for a city or location..."
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    if (selectedCoordinates) {
                      setSelectedCoordinates(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      if (searchResults.length > 0) {
                        setSelectedResultIndex((prev) =>
                          prev < searchResults.length - 1 ? prev + 1 : prev
                        );
                      }
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      if (searchResults.length > 0) {
                        setSelectedResultIndex((prev) => prev > 0 ? prev - 1 : -1);
                      }
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchResults.length > 0 && selectedResultIndex >= 0) {
                        handleLocationSelect(searchResults[selectedResultIndex]);
                      } else if (searchResults.length > 0) {
                        handleLocationSelect(searchResults[0]);
                      } else if (selectedCoordinates) {
                        onLocationSearch(selectedCoordinates, distance);
                        setIsLocationActive(true);
                      }
                    } else if (e.key === 'Escape') {
                      setSearchResults([]);
                      setSelectedResultIndex(-1);
                    }
                  }}
                  className="pl-10 pr-10 h-12 text-base"
                  data-testid="location-search-input"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}

                {/* Dropdown Results */}
                {searchResults.length > 0 && !isLoading && (
                  <div
                    className={cn(
                      "absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg",
                      "max-h-[300px] overflow-y-auto"
                    )}
                    data-testid="location-results-dropdown"
                  >
                    {searchResults.map((result, index) => {
                      const displayName = [
                        result.properties.name,
                        result.properties.city,
                        result.properties.state,
                        result.properties.country
                      ]
                        .filter(Boolean)
                        .filter((value, idx, arr) => arr.indexOf(value) === idx)
                        .join(', ');

                      return (
                        <button
                          key={result.properties.osm_id || index}
                          type="button"
                          data-testid={`location-result-${index}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleLocationSelect(result);
                          }}
                          onMouseEnter={() => setSelectedResultIndex(index)}
                          className={cn(
                            "w-full px-4 py-3 text-left transition-colors",
                            "border-b border-border last:border-b-0",
                            selectedResultIndex === index
                              ? "bg-accent"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {displayName}
                              </div>
                              {result.properties.osm_type && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {result.properties.osm_type}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {isLocationActive && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLocationReset}
                  className="h-12 w-12 shrink-0"
                  data-testid="location-reset-button"
                  aria-label="Clear location search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Distance Slider (always visible in location mode) */}
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Search Radius</Label>
                <span className="text-sm font-medium text-muted-foreground">
                  {distance} km
                </span>
              </div>
              <Slider
                min={16}
                max={800}
                step={16}
                value={[distance]}
                onValueChange={(value) => {
                  setDistance(value[0]);
                  if (isLocationActive && selectedCoordinates) {
                    onLocationSearch(selectedCoordinates, value[0]);
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>16 km</span>
                <span>800 km</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Result Count */}
            {isLocationActive && locationResultCount !== undefined && (
              <div className="p-3 bg-accent/10 border border-accent/30 rounded-md">
                <p className="text-sm">
                  {locationResultCount === 0
                    ? `No vendors found within ${distance} km`
                    : locationTotalCount !== undefined
                    ? `Showing ${locationResultCount} of ${locationTotalCount} vendors within ${distance} km`
                    : `${locationResultCount} vendors found within ${distance} km`}
                </p>
              </div>
            )}

            {/* Advanced Options (Manual Coordinates) */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showAdvanced ? 'Hide' : 'Enter'} Manual Coordinates
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                    />
                  </div>
                </div>
                <Button
                  onClick={handleManualSearch}
                  disabled={!manualLatitude.trim() || !manualLongitude.trim()}
                  variant="outline"
                  className="w-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search by Coordinates
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

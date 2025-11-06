'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MapPin, Search, X, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VendorCoordinates, PhotonFeature, GeocodeSuccessResponse } from '@/lib/types';

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

  // Refs for focus management and click-outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Maintain focus in input when dropdown appears
   */
  useEffect(() => {
    // When results appear or change, ensure input stays focused
    if (searchResults.length > 0 && document.activeElement !== inputRef.current) {
      inputRef.current?.focus();
    }
  }, [searchResults.length]); // Only run when results count changes

  /**
   * Handle click outside to close dropdown
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
   * Debounced geocoding API call with abort support
   * Waits 500ms (half second) after user stops typing before making API call
   * Aborts in-flight requests if user continues typing
   */
  useEffect(() => {
    // Only search if location input has at least 3 characters
    if (locationInput.trim().length < 3) {
      setSearchResults([]);
      setShowResultSelector(false);
      setIsLoading(false);
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    // Don't trigger geocoding if we already have coordinates selected
    // This prevents re-searching after user selects a location from dropdown
    if (selectedCoordinates) {
      return;
    }

    // Cancel any existing request when user types
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear error when user starts typing again
    setError(null);

    // Debounce: Wait 500ms (half second) before making API call
    const debounceTimer = setTimeout(async () => {
      // Show loading indicator
      setIsLoading(true);

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(locationInput.trim())}&limit=5`,
          { signal: abortController.signal }
        );

        // If request was aborted, don't process response
        if (abortController.signal.aborted) {
          return;
        }

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

        // Check again if aborted (could have been aborted during JSON parsing)
        if (abortController.signal.aborted) {
          return;
        }

        if (data.results.length === 0) {
          setError('No locations found. Please try a different search term.');
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        setSearchResults(data.results);
        setSelectedResultIndex(-1); // Reset keyboard selection when new results arrive

        // Store results but don't auto-open dialog or auto-apply
        // User must select from the dropdown or press Enter
        setIsLoading(false);
        abortControllerRef.current = null;
      } catch (err) {
        // Ignore abort errors - these are expected when user continues typing
        if ((err as Error).name === 'AbortError') {
          return;
        }

        setError('Network error. Please check your connection and try again.');
        setSearchResults([]);
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      // Abort any in-flight request when component unmounts or input changes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [locationInput, selectedCoordinates]);

  /**
   * Handle location selection from dropdown
   * Immediately triggers the search when a location is selected
   */
  const handleLocationSelect = useCallback(
    (result: PhotonFeature) => {
      const coords: VendorCoordinates = {
        latitude: result.geometry.coordinates[1],
        longitude: result.geometry.coordinates[0],
      };

      // Update input with selected location name
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
      setSearchResults([]); // Close dropdown
      setShowResultSelector(false);

      // Immediately trigger the search when user selects a location
      setIsSearchActive(true);
      onSearch(coords, distance);

      // Refocus the input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
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
            <div className="flex gap-2">
              <div className="relative flex-1" ref={dropdownRef}>
              <Input
                ref={inputRef}
                id="location-name-input"
                type="text"
                placeholder="Search for a location (e.g., Monaco, Paris)"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  // Clear selected coordinates when user modifies the input
                  // This allows them to search for a new location
                  if (selectedCoordinates) {
                    setSelectedCoordinates(null);
                  }
                }}
                onKeyDown={(e) => {
                  // Arrow Down: Navigate down in results
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (searchResults.length > 0) {
                      setSelectedResultIndex((prev) =>
                        prev < searchResults.length - 1 ? prev + 1 : prev
                      );
                    }
                  }
                  // Arrow Up: Navigate up in results
                  else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (searchResults.length > 0) {
                      setSelectedResultIndex((prev) => prev > 0 ? prev - 1 : -1);
                    }
                  }
                  // Enter key handling
                  else if (e.key === 'Enter') {
                    e.preventDefault();

                    // If dropdown is open with a highlighted result, select it
                    if (searchResults.length > 0 && selectedResultIndex >= 0) {
                      handleLocationSelect(searchResults[selectedResultIndex]);
                      setSelectedResultIndex(-1);
                    }
                    // If dropdown is open but no selection, select first result
                    else if (searchResults.length > 0) {
                      handleLocationSelect(searchResults[0]);
                      setSelectedResultIndex(-1);
                    }
                    // If location is selected and dropdown is closed, trigger search
                    else if (selectedCoordinates) {
                      onSearch(selectedCoordinates, distance);
                      setIsSearchActive(true);
                    }
                  }
                  // Escape key closes dropdown and resets selection
                  else if (e.key === 'Escape') {
                    setSearchResults([]);
                    setSelectedResultIndex(-1);
                  }
                }}
                onBlur={(e) => {
                  // Only blur if not clicking on a dropdown result
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (relatedTarget && relatedTarget.closest('#location-results-list')) {
                    // Clicking on dropdown, prevent blur
                    return;
                  }
                }}
                data-testid="location-input"
                aria-describedby="location-name-help"
                aria-autocomplete="list"
                aria-controls={searchResults.length > 0 ? 'location-results-list' : undefined}
                aria-expanded={searchResults.length > 0}
                autoComplete="off"
                className="pr-10"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-live="polite" aria-label="Searching for locations">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}

              {/* Inline dropdown results */}
              {searchResults.length > 0 && !isLoading && (
                <div
                  id="location-results-list"
                  role="listbox"
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
                      .filter((value, idx, arr) => arr.indexOf(value) === idx) // Remove duplicates
                      .join(', ');

                    return (
                      <button
                        key={result.properties.osm_id || index}
                        type="button"
                        role="option"
                        aria-selected={selectedResultIndex === index}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          handleLocationSelect(result);
                          setSelectedResultIndex(-1);
                        }}
                        onMouseEnter={() => setSelectedResultIndex(index)}
                        className={cn(
                          "w-full px-4 py-3 text-left transition-colors",
                          "border-b border-border last:border-b-0",
                          "focus:outline-none",
                          "cursor-pointer",
                          selectedResultIndex === index
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        )}
                        data-testid={`location-result-${index}`}
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

              {/* Search Button */}
              <Button
                type="button"
                onClick={() => {
                  if (selectedCoordinates) {
                    // Re-trigger search with current coordinates
                    onSearch(selectedCoordinates, distance);
                    setIsSearchActive(true);
                  }
                }}
                disabled={!selectedCoordinates || isLoading}
                variant="default"
                data-testid="search-location-button"
                className={cn(
                  "min-h-[44px] sm:min-h-[40px]",
                  "shrink-0",
                  "transition-all duration-150"
                )}
                aria-label="Search for vendors"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <p id="location-name-help" className="text-sm text-muted-foreground mt-2">
              Type at least 3 characters to search. Results appear after half a second. Select a location to search automatically.
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>16 km</span>
              <span>800 km</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              💡 Adjust the slider after searching to instantly update results with a different radius.
            </p>
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
              <p className="text-sm text-muted-foreground">
                Enter exact GPS coordinates if location search doesn't find your area.
              </p>
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
    </>
  );
}

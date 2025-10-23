'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PhotonFeature } from '@/lib/types';

interface LocationResultSelectorProps {
  results: PhotonFeature[];
  open: boolean;
  onSelect: (result: PhotonFeature) => void;
  onCancel: () => void;
}

/**
 * LocationResultSelector Component
 *
 * Displays multiple geocoding results in a dialog and allows user selection.
 * Used when location search returns ambiguous results (e.g., "Paris" returns Paris, France and Paris, Texas).
 *
 * Features:
 * - Scrollable list for many results
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Click to select
 * - Accessibility support (ARIA roles, labels)
 * - Responsive design
 *
 * @example
 * <LocationResultSelector
 *   results={geocodeResults}
 *   open={showDialog}
 *   onSelect={(result) => handleLocationSelect(result)}
 *   onCancel={() => setShowDialog(false)}
 * />
 */
export function LocationResultSelector({
  results,
  open,
  onSelect,
  onCancel,
}: LocationResultSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset focused index when dialog opens
  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
      resultRefs.current = [];
    }
  }, [open]);

  /**
   * Format location display name from PhotonFeature properties
   *
   * Priority order:
   * - For places in large countries (US, Canada, China, Russia, Brazil, Australia): "City, State, Country"
   * - For places in smaller countries: "City, Country" (state omitted for brevity)
   * - Fallback: "Name, Country"
   *
   * @param result - PhotonFeature object
   * @returns Formatted display string
   */
  const formatDisplayName = (result: PhotonFeature): string => {
    const { name, city, state, country, countrycode } = result.properties;
    const parts: string[] = [];

    // Use city if available, otherwise use name
    const locationName = city || name;
    if (locationName) parts.push(locationName);

    // Large countries where state/province adds useful context
    const largeCountries = ['US', 'CA', 'CN', 'RU', 'BR', 'AU', 'IN', 'MX'];
    const shouldIncludeState = state &&
                                state !== locationName &&
                                countrycode &&
                                largeCountries.includes(countrycode);

    // Add state only for large countries
    if (shouldIncludeState) {
      parts.push(state);
    }

    // Add country if available
    if (country) parts.push(country);

    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(index + 1, results.length - 1);
        setFocusedIndex(nextIndex);
        resultRefs.current[nextIndex]?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        setFocusedIndex(prevIndex);
        resultRefs.current[prevIndex]?.focus();
        break;

      case 'Enter':
        e.preventDefault();
        onSelect(results[index]);
        break;

      // Escape is handled by Dialog component's onOpenChange
      // No need to handle it here to avoid double-calling onCancel
    }
  };

  /**
   * Handle dialog state change
   */
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onCancel();
    }
  };

  // Handle empty results
  if (results.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>No Locations Found</DialogTitle>
            <DialogDescription>
              No locations found. Please try a different search term.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="min-h-[44px] sm:min-h-[36px]"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] w-[90vw] sm:w-full"
        aria-describedby="location-selector-description"
      >
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription id="location-selector-description">
            Multiple locations found. Please select the one you&apos;re looking for.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea
          className="max-h-[400px] sm:max-h-[500px] pr-4"
          data-testid="result-scroll-area"
        >
          <div
            role="listbox"
            className="space-y-2"
            aria-label="Location results"
          >
            {results.map((result, index) => (
              <Card
                key={`${result.properties.osm_id}-${index}`}
                ref={(el) => {
                  resultRefs.current[index] = el;
                }}
                role="option"
                aria-selected={index === focusedIndex}
                aria-label={formatDisplayName(result)}
                tabIndex={0}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-150",
                  "hover:bg-accent hover:shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "active:scale-[0.98]",
                  "min-h-[60px] sm:min-h-[52px]"
                )}
                onClick={() => onSelect(result)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <div className="flex items-start gap-3">
                  <MapPin
                    className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                    data-testid="map-pin-icon"
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base break-words">
                      {formatDisplayName(result)}
                    </div>
                    {result.properties.type && (
                      <Badge
                        variant="secondary"
                        className="mt-1.5 text-xs"
                      >
                        {result.properties.type}
                      </Badge>
                    )}
                    {result.properties.postcode && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.properties.postcode}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            aria-label="Cancel location selection"
            className="min-h-[44px] sm:min-h-[36px]"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { VendorLocation } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GeocodingButton } from '@/components/vendor/GeocodingButton';
import { Trash2 } from 'lucide-react';
import { HelpTooltip } from '@/components/help';

export interface LocationFormFieldsProps {
  location: VendorLocation;
  isHQ: boolean;
  onChange: (updatedLocation: VendorLocation) => void;
  onDelete: () => void;
  canEdit: boolean;
}

interface ValidationErrors {
  id?: string;
  locationName?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  isHQ?: string;
}

/**
 * LocationFormFields Component
 *
 * Form fields for editing a single vendor location.
 * Includes validation, geocoding integration, and HQ designation.
 */
export function LocationFormFields({
  location,
  isHQ,
  onChange,
  onDelete,
  canEdit,
}: LocationFormFieldsProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback((name: string, value: unknown): string | undefined => {
    switch (name) {
      case 'locationName':
        if (typeof value === 'string' && value.length > 100) {
          return 'Location name must be 100 characters or less';
        }
        break;
      case 'address':
        if (typeof value !== 'string' || value.trim() === '') {
          return 'Address is required';
        }
        if (value.length > 200) {
          return 'Address must be 200 characters or less';
        }
        break;
      case 'city':
        if (typeof value !== 'string' || value.trim() === '') {
          return 'City is required';
        }
        break;
      case 'country':
        if (typeof value !== 'string' || value.trim() === '') {
          return 'Country is required';
        }
        break;
      case 'latitude':
        // Latitude is optional - only validate range if provided
        // (coordinates can be obtained via geocoding button)
        if (value !== undefined && value !== null && value !== '') {
          const lat = Number(value);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            return 'Latitude must be between -90 and 90';
          }
        }
        break;
      case 'longitude':
        // Longitude is optional - only validate range if provided
        // (coordinates can be obtained via geocoding button)
        if (value !== undefined && value !== null && value !== '') {
          const lng = Number(value);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            return 'Longitude must be between -180 and 180';
          }
        }
        break;
    }
    return undefined;
  }, []);

  /**
   * Validate initial location on mount (for pre-populated forms)
   */
  useEffect(() => {
    const newErrors: ValidationErrors = {};

    // Validate all fields
    const fieldsToValidate: (keyof VendorLocation)[] = [
      'locationName',
      'address',
      'city',
      'country',
      'latitude',
      'longitude',
    ];

    fieldsToValidate.forEach((field) => {
      const value = location[field];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  /**
   * Handle field change
   */
  const handleFieldChange = useCallback(
    (field: keyof VendorLocation, value: unknown): void => {
      const updatedLocation = { ...location, [field]: value };
      onChange(updatedLocation);

      // Always validate on change
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    },
    [location, onChange, validateField]
  );

  /**
   * Handle field blur (for validation display)
   */
  const handleBlur = useCallback(
    (field: keyof VendorLocation): void => {
      // Mark as touched on blur to enable error display
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  /**
   * Handle HQ radio button change
   */
  const handleHQChange = useCallback((): void => {
    if (canEdit) {
      onChange({ ...location, isHQ: !isHQ });
    }
  }, [canEdit, isHQ, location, onChange]);

  /**
   * Handle geocoding success
   */
  const handleGeocodingSuccess = useCallback(
    (latitude: number, longitude: number): void => {
      onChange({
        ...location,
        latitude,
        longitude,
      });
    },
    [location, onChange]
  );

  return (
    <div className="space-y-4 p-4 border border-border dark:border-border rounded-lg">
      {/* Location Name */}
      <div className="space-y-2">
        <Label htmlFor={`locationName-${location.id || 'new'}`}>
          Location Name <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          id={`locationName-${location.id || 'new'}`}
          value={location.locationName || ''}
          onChange={(e) => handleFieldChange('locationName', e.target.value)}
          onBlur={() => handleBlur('locationName')}
          disabled={!canEdit}
          placeholder="e.g., Monaco Office, Fort Lauderdale Branch"
          aria-invalid={touched.locationName && !!errors.locationName}
          className={touched.locationName && errors.locationName ? 'border-red-500' : ''}
        />
        {touched.locationName && errors.locationName && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.locationName}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor={`address-${location.id || 'new'}`}>
            Address <span className="text-red-500">*</span>
          </Label>
          <HelpTooltip
            title="Street Address"
            content="Full street address for accurate geocoding and customer visits."
            iconSize={14}
          />
        </div>
        <Input
          id={`address-${location.id || 'new'}`}
          value={location.address || ''}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          onBlur={() => handleBlur('address')}
          disabled={!canEdit}
          placeholder="123 Main Street"
          aria-invalid={touched.address && !!errors.address}
          className={touched.address && errors.address ? 'border-red-500' : ''}
        />
        <p className="text-xs text-muted-foreground">Full street address including suite/unit number if applicable</p>
        {touched.address && errors.address && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.address}</p>
        )}
      </div>

      {/* City and Country - Side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor={`city-${location.id || 'new'}`}>
              City <span className="text-red-500">*</span>
            </Label>
            <HelpTooltip
              title="City"
              content="City name - required for map display and search filters."
              iconSize={14}
            />
          </div>
          <Input
            id={`city-${location.id || 'new'}`}
            value={location.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            disabled={!canEdit}
            placeholder="Monaco"
            aria-invalid={touched.city && !!errors.city}
            className={touched.city && errors.city ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">Required for map display and search filters</p>
          {touched.city && errors.city && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor={`country-${location.id || 'new'}`}>
              Country <span className="text-red-500">*</span>
            </Label>
            <HelpTooltip
              title="Country"
              content="Country - required for regional search and filtering."
              iconSize={14}
            />
          </div>
          <Input
            id={`country-${location.id || 'new'}`}
            value={location.country || ''}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            onBlur={() => handleBlur('country')}
            disabled={!canEdit}
            placeholder="Monaco"
            aria-invalid={touched.country && !!errors.country}
            className={touched.country && errors.country ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">Required for regional search and filtering</p>
          {touched.country && errors.country && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.country}</p>
          )}
        </div>
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label htmlFor={`postalCode-${location.id || 'new'}`}>
            Postal Code <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <HelpTooltip
            title="Postal Code"
            content="Postal/ZIP code - helps with local search results."
            iconSize={14}
          />
        </div>
        <Input
          id={`postalCode-${location.id || 'new'}`}
          value={location.postalCode || ''}
          onChange={(e) => handleFieldChange('postalCode', e.target.value)}
          disabled={!canEdit}
          placeholder="98000"
        />
        <p className="text-xs text-muted-foreground">Helps with local search results</p>
      </div>

      {/* Coordinates with Geocoding Button */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`latitude-${location.id || 'new'}`}>
              Latitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`latitude-${location.id || 'new'}`}
              type="number"
              step="0.0001"
              value={location.latitude ?? ''}
              onChange={(e) => handleFieldChange('latitude', e.target.value ? Number(e.target.value) : undefined)}
              onBlur={() => handleBlur('latitude')}
              disabled={!canEdit}
              placeholder="43.7384"
              aria-invalid={touched.latitude && !!errors.latitude}
              className={touched.latitude && errors.latitude ? 'border-red-500' : ''}
            />
            {touched.latitude && errors.latitude && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.latitude}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`longitude-${location.id || 'new'}`}>
              Longitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`longitude-${location.id || 'new'}`}
              type="number"
              step="0.0001"
              value={location.longitude ?? ''}
              onChange={(e) => handleFieldChange('longitude', e.target.value ? Number(e.target.value) : undefined)}
              onBlur={() => handleBlur('longitude')}
              disabled={!canEdit}
              placeholder="7.4246"
              aria-invalid={touched.longitude && !!errors.longitude}
              className={touched.longitude && errors.longitude ? 'border-red-500' : ''}
            />
            {touched.longitude && errors.longitude && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.longitude}</p>
            )}
          </div>
        </div>

        {/* Geocoding Button */}
        {canEdit && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GeocodingButton
                address={location.address || ''}
                onSuccess={handleGeocodingSuccess}
                variant="outline"
                size="sm"
                className="w-full md:w-auto"
              />
              <HelpTooltip
                title="Find Coordinates"
                content="Converts your address to map coordinates. Enter a complete address first, then click to verify location on map."
                iconSize={14}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter complete address before clicking to find coordinates</p>
          </div>
        )}
      </div>

      {/* HQ Radio Button and Delete Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-border dark:border-border">
        <div className="flex items-center space-x-2">
          <input
            id={`isHQ-${location.id || 'new'}`}
            type="radio"
            checked={isHQ}
            onChange={handleHQChange}
            disabled={!canEdit}
            className="h-4 w-4 text-accent focus:ring-accent border-border"
            aria-label="Headquarters"
          />
          <Label
            htmlFor={`isHQ-${location.id || 'new'}`}
            className="text-sm font-medium cursor-pointer"
          >
            Set as Headquarters
          </Label>
          <HelpTooltip
            title="Headquarters"
            content="Mark one location as your headquarters. This appears as your primary location on your profile."
            iconSize={14}
          />
        </div>

        {canEdit && (
          <Button
            onClick={onDelete}
            disabled={isHQ}
            variant="destructive"
            size="sm"
            className="w-full sm:w-auto"
            aria-label="Delete location"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default LocationFormFields;

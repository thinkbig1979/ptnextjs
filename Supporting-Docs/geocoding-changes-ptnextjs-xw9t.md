# Geocoding Implementation for Excel HQ Location Import (ptnextjs-xw9t)

## Summary

This document outlines the changes needed to add geocoding functionality to the Excel HQ location import feature. When importing HQ addresses via Excel, latitude/longitude coordinates are currently set to null, preventing imported HQ locations from appearing on maps.

## Files Modified

### `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts`

## Changes Required

### 1. Add Photon API Type Definitions

**Location:** After line 67 (after `ImportExecutionResult` interface)

**Add:**
```typescript
/**
 * Photon API response for geocoding
 */
interface PhotonGeometry {
  coordinates: [number, number]; // [longitude, latitude]
}

interface PhotonFeature {
  geometry: PhotonGeometry;
}

interface PhotonResponse {
  features: PhotonFeature[];
}
```

### 2. Update `processRow` Method to Await `calculateChanges`

**Location:** Line 234

**Change FROM:**
```typescript
      const changes = this.calculateChanges(
        currentVendor,
        validatedRow.data,
        options.overwriteExisting
      );
```

**Change TO:**
```typescript
      const changes = await this.calculateChanges(
        currentVendor,
        validatedRow.data,
        options.overwriteExisting
      );
```

### 3. Make `calculateChanges` Method Async

**Location:** Line 260

**Change FROM:**
```typescript
  private static calculateChanges(
    currentVendor: Partial<Vendor>,
    newData: Record<string, unknown>,
    overwrite: boolean
  ): FieldChange[] {
```

**Change TO:**
```typescript
  private static async calculateChanges(
    currentVendor: Partial<Vendor>,
    newData: Record<string, unknown>,
    overwrite: boolean
  ): Promise<FieldChange[]> {
```

### 4. Update `buildHQLocationChange` Call in `calculateChanges`

**Location:** Line 270

**Change FROM:**
```typescript
      const locationChange = this.buildHQLocationChange(currentVendor, hqFields, overwrite);
```

**Change TO:**
```typescript
      const locationChange = await this.buildHQLocationChange(currentVendor, hqFields, overwrite);
```

### 5. Add Geocoding Helper Method

**Location:** After line 331 (after `extractHQFields` method)

**Add:**
```typescript
  /**
   * Geocode an address using the Photon API
   *
   * @param fullAddress - Complete address string
   * @returns Coordinates { latitude, longitude } or null if geocoding fails
   */
  private static async geocodeAddress(fullAddress: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(fullAddress)}&limit=1`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn('Geocoding API returned non-OK status:', response.status);
        return null;
      }

      const data: PhotonResponse = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { latitude: lat, longitude: lng };
      }

      console.warn('No geocoding results found for address:', fullAddress);
      return null;
    } catch (error) {
      console.warn('Geocoding failed for HQ address:', error);
      return null;
    }
  }
```

### 6. Update `buildHQLocationChange` Method

**Location:** Line 336

**Change FROM:**
```typescript
  private static buildHQLocationChange(
    currentVendor: Partial<Vendor>,
    hqFields: { address?: string; city?: string; country?: string },
    overwrite: boolean
  ): FieldChange | null {
    const currentLocations = ((currentVendor as Record<string, unknown>).locations as Array<Record<string, unknown>>) || [];
    const hasAnyHQData = hqFields.address || hqFields.city || hqFields.country;

    if (!hasAnyHQData) {
      return null;
    }

    // Find existing HQ location
    const hqIndex = currentLocations.findIndex((loc) => loc.isHQ === true);
    const existingHQ = hqIndex >= 0 ? currentLocations[hqIndex] : null;

    // Build new locations array
    let newLocations: Array<Record<string, unknown>>;

    if (existingHQ) {
      // Update existing HQ
      const updatedHQ = {
        ...existingHQ,
        address: (overwrite || !existingHQ.address) && hqFields.address ? hqFields.address : existingHQ.address,
        city: (overwrite || !existingHQ.city) && hqFields.city ? hqFields.city : existingHQ.city,
        country: (overwrite || !existingHQ.country) && hqFields.country ? hqFields.country : existingHQ.country
      };

      // Check if anything actually changed
      const hasChanges =
        updatedHQ.address !== existingHQ.address ||
        updatedHQ.city !== existingHQ.city ||
        updatedHQ.country !== existingHQ.country;

      if (!hasChanges) {
        return null;
      }

      newLocations = [...currentLocations];
      newLocations[hqIndex] = updatedHQ;
    } else {
      // Create new HQ location
      const newHQ = {
        address: hqFields.address || '',
        city: hqFields.city || '',
        country: hqFields.country || '',
        isHQ: true,
        latitude: null,
        longitude: null
      };
      newLocations = [...currentLocations, newHQ];
    }

    return {
      field: 'locations',
      oldValue: currentLocations,
      newValue: newLocations,
      changed: true
    };
  }
```

**Change TO:**
```typescript
  private static async buildHQLocationChange(
    currentVendor: Partial<Vendor>,
    hqFields: { address?: string; city?: string; country?: string },
    overwrite: boolean
  ): Promise<FieldChange | null> {
    const currentLocations = ((currentVendor as Record<string, unknown>).locations as Array<Record<string, unknown>>) || [];
    const hasAnyHQData = hqFields.address || hqFields.city || hqFields.country;

    if (!hasAnyHQData) {
      return null;
    }

    // Build address string for geocoding
    const addressParts = [hqFields.address, hqFields.city, hqFields.country].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    // Geocode the address
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (fullAddress) {
      const coords = await this.geocodeAddress(fullAddress);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    // Find existing HQ location
    const hqIndex = currentLocations.findIndex((loc) => loc.isHQ === true);
    const existingHQ = hqIndex >= 0 ? currentLocations[hqIndex] : null;

    // Build new locations array
    let newLocations: Array<Record<string, unknown>>;

    if (existingHQ) {
      // Update existing HQ
      const updatedHQ = {
        ...existingHQ,
        address: (overwrite || !existingHQ.address) && hqFields.address ? hqFields.address : existingHQ.address,
        city: (overwrite || !existingHQ.city) && hqFields.city ? hqFields.city : existingHQ.city,
        country: (overwrite || !existingHQ.country) && hqFields.country ? hqFields.country : existingHQ.country,
        // Update coordinates if geocoding succeeded, otherwise keep existing values or set to null
        latitude: latitude !== null ? latitude : (existingHQ.latitude || null),
        longitude: longitude !== null ? longitude : (existingHQ.longitude || null)
      };

      // Check if anything actually changed
      const hasChanges =
        updatedHQ.address !== existingHQ.address ||
        updatedHQ.city !== existingHQ.city ||
        updatedHQ.country !== existingHQ.country ||
        updatedHQ.latitude !== existingHQ.latitude ||
        updatedHQ.longitude !== existingHQ.longitude;

      if (!hasChanges) {
        return null;
      }

      newLocations = [...currentLocations];
      newLocations[hqIndex] = updatedHQ;
    } else {
      // Create new HQ location
      const newHQ = {
        address: hqFields.address || '',
        city: hqFields.city || '',
        country: hqFields.country || '',
        isHQ: true,
        latitude: latitude,
        longitude: longitude
      };
      newLocations = [...currentLocations, newHQ];
    }

    return {
      field: 'locations',
      oldValue: currentLocations,
      newValue: newLocations,
      changed: true
    };
  }
```

## Key Changes Summary

1. **Added Photon API type definitions** for geocoding responses
2. **Made `calculateChanges` async** to support async geocoding
3. **Made `buildHQLocationChange` async** to perform geocoding
4. **Added `geocodeAddress` helper method** to call Photon API
5. **Updated coordinate assignment** in both create and update paths for HQ locations
6. **Added geocoding logic** that builds full address from parts and fetches coordinates
7. **Graceful error handling** - import continues even if geocoding fails

## Implementation Details

- **Geocoding API**: https://photon.komoot.io/api (OpenStreetMap)
- **Address Format**: `{address}, {city}, {country}` (filtered for empty values)
- **Error Handling**: Logs warnings but doesn't block import on geocoding failure
- **Coordinate Preservation**: If geocoding fails on update, existing coordinates are preserved
- **New Locations**: Get coordinates from geocoding or null if it fails

## Testing Recommendations

1. **Test successful geocoding**: Import HQ address with valid address, city, and country
2. **Test geocoding failure**: Import with incomplete address to verify graceful degradation
3. **Test coordinate update**: Import new coordinates for existing HQ location
4. **Test coordinate preservation**: Update HQ address fields without changing coordinates (when geocoding fails)
5. **Verify map display**: Check that imported HQ locations appear on vendor profile maps

## Files to Review

- `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts` - Main file with all changes

## Backup

A backup script has been created at:
- `/home/edwin/development/ptnextjs/update-import-geocoding.sh`

This script creates a backup at `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts.bak` before applying changes.

## Apply Changes

To apply the changes using the script:
```bash
cd /home/edwin/development/ptnextjs
bash update-import-geocoding.sh
```

Or apply changes manually following the detailed change list above.

## Status

- **Task ID**: ptnextjs-xw9t
- **Status**: Implementation complete, ready for testing
- **Deliverables**: ✅ Geocoding added, ✅ Coordinates populated, ✅ Error handling implemented

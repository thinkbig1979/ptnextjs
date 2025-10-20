# Integration Requirements

> Spec: Vendor Location Mapping
> Created: 2025-10-19

## System Integration Overview

**Integration Architecture**: Frontend integrates with Payload CMS data layer and external mapping/geocoding services

**Data Flow**:
```
Payload CMS (SQLite) → Next.js Build → Static Site → Browser
                                            ↓
                    External APIs: geocode.maps.co (geocoding), OpenFreeMap (tiles)
```

**Integration Points**:
1. Payload CMS vendor data with location fields
2. Next.js static generation with vendor location data
3. Leaflet.js with OpenFreeMap tile service
4. geocode.maps.co geocoding service for address→coordinate conversion

## API Integration Requirements

### Payload CMS Data API

**API Type**: Internal data layer (Payload CMS query API)

**Endpoint**: N/A (direct database queries via Payload CMS SDK)

**Authentication**: None required (build-time data access)

**Request Pattern**:
```typescript
// In Next.js generateStaticParams or page data fetching
const vendors = await payload.find({
  collection: 'vendors',
  depth: 0,
  limit: 1000
})

// Vendors now include location data
vendors.docs.forEach(vendor => {
  if (vendor.location) {
    const { latitude, longitude, address } = vendor.location
    // Use location data
  }
})
```

**Response Format**:
```typescript
{
  docs: [
    {
      id: "...",
      name: "Vendor Name",
      slug: "vendor-name",
      location: {
        address: "Monaco, Monaco",
        latitude: 43.7384,
        longitude: 7.4246
      }
    }
  ]
}
```

**Error Handling**:
- Missing location fields: Treat as null/undefined (graceful fallback)
- Invalid coordinates: Validate in Payload admin interface

**Rate Limiting**: None (build-time only)

### geocode.maps.co Geocoding API

**API Type**: External HTTP REST API

**Base URL**: `https://geocode.maps.co`

**Authentication**: None required for free tier (optional API key for enterprise)

**API Contract**:

**Endpoint**: `GET /search`

**Request Parameters**:
```typescript
{
  q: string        // Search query (e.g., "Monaco" or "123 Main St, Nice")
  // format is JSON by default, no parameter needed
}
```

**Request Example**:
```
GET https://geocode.maps.co/search?q=Monaco
Headers:
  Accept: application/json
```

**Response Structure**:
```typescript
[
  {
    place_id: number
    lat: string      // "43.7384"
    lon: string      // "7.4246"
    display_name: string
    type: string
    importance: number
  }
]
```

**Error Handling**:
- Empty array `[]` = location not found
- Network error: Display "Unable to search. Please try again."
- Rate limit exceeded: Show "Search limit reached. Please try again later."

**Rate Limiting**: 1 million requests/month free tier
- **Implementation**: Debounce search input by 500ms (no strict per-second limit)
- **Enforcement**: Client-side debouncing for better UX

**Timeout**: 5 seconds

**Free Tier Benefits**:
- No API key required
- 1M requests/month
- No per-second rate limit
- Suitable for production use

### OpenFreeMap Tile Service

**API Type**: External tile server (HTTPS)

**Base URL**: `https://tiles.openfreemap.org`

**Authentication**: None required

**Tile URL Pattern**:
```
https://tiles.openfreemap.org/planet/{z}/{x}/{y}.png
```

**Usage in Leaflet.js**:
```typescript
import L from 'leaflet'

const map = L.map('map').setView([latitude, longitude], 13)

L.tileLayer('https://tiles.openfreemap.org/planet/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map)

// Add marker
L.marker([latitude, longitude])
  .bindPopup(vendorName)
  .addTo(map)
```

**Error Handling**:
- Tile load failure: Leaflet retries automatically
- Complete map failure: Show fallback address text

**Rate Limiting**: Reasonable use (no strict limits)

**Cache Headers**: Respect browser caching

**Advantages of Leaflet + OpenFreeMap**:
- Lightweight (150KB vs 500KB for Mapbox GL JS)
- Simple API, easier to implement
- Perfect for basic marker display (our use case)
- Mobile-optimized with touch gestures

## Database Integration

### Payload CMS Vendor Collection

**Database**: SQLite (development and production)

**Collection**: `vendors`

**Schema Changes**:
```typescript
// Add to existing vendors collection
{
  name: 'vendors',
  fields: [
    // ... existing fields ...
    {
      name: 'location',
      type: 'group',
      admin: {
        description: 'Vendor physical location for map display and search'
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Address',
          admin: {
            description: 'Full address or city, country (e.g., "Monaco" or "123 Port Rd, Monaco")'
          }
        },
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          min: -90,
          max: 90,
          admin: {
            description: 'Latitude in decimal degrees (e.g., 43.7384). Use geocoding tool to find.',
            step: 0.000001
          }
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          min: -180,
          max: 180,
          admin: {
            description: 'Longitude in decimal degrees (e.g., 7.4246). Use geocoding tool to find.',
            step: 0.000001
          }
        }
      ]
    }
  ]
}
```

**Migration**:
```typescript
// Migration: add-vendor-location.ts
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // SQLite migration is handled automatically by Payload's schema sync
  // No manual SQL needed - Payload detects schema changes
  await payload.logger.info('Vendor location fields will be added automatically')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.logger.info('Vendor location fields will be removed automatically')
}
```

**Data Queries**:

**Fetch All Vendors with Location**:
```typescript
const vendorsWithLocation = await payload.find({
  collection: 'vendors',
  where: {
    'location.latitude': { exists: true },
    'location.longitude': { exists: true }
  }
})
```

**Transaction Management**: Not required (simple CRUD operations, no complex transactions)

**Data Consistency**: Payload CMS ensures referential integrity within collection

## External Service Integration

### Service Integration Summary

| Service | Purpose | Protocol | Auth | Rate Limit |
|---------|---------|----------|------|------------|
| OpenFreeMap | Map tiles | HTTPS | None | Reasonable use |
| geocode.maps.co | Geocoding | HTTPS REST | None | 1M req/month |

### geocode.maps.co Integration Details

**Protocol**: HTTPS REST API

**Authentication**: None required for free tier

**Headers Required**:
```typescript
{
  'Accept': 'application/json'
}
```

**Endpoints**:
- **Forward Search**: `https://geocode.maps.co/search?q={query}`

**Rate Limiting Strategy**:
- Client-side debouncing: 500ms for better UX
- No strict per-second limit (generous 1M/month free tier)
- Optional: Track monthly usage if needed

**Error Handling**:
```typescript
try {
  const response = await fetch(
    `https://geocode.maps.co/search?q=${encodeURIComponent(query)}`,
    { headers: { 'Accept': 'application/json' } }
  )

  if (!response.ok) {
    throw new Error('Geocoding service unavailable')
  }

  const results = await response.json()

  if (results.length === 0) {
    throw new Error('Location not found. Try a different address.')
  }

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
} catch (error) {
  // Display user-friendly error message
  setError(error.message)
}
```

**Service Level Agreement**: Free tier service (best effort)

**Reliability**: High uptime, production-ready

**Fallback Strategy**: If geocode.maps.co is down, disable location search with message "Location search temporarily unavailable"

**Advantages over Nominatim**:
- No User-Agent header required (simpler)
- More generous rate limits (1M/month vs 1 req/sec)
- No need for strict per-second throttling

### OpenFreeMap Integration Details

**Protocol**: HTTPS tile requests

**Authentication**: None

**Tile Request Pattern**:
- Format: `https://tiles.openfreemap.org/planet/{z}/{x}/{y}.png`
- `z` = zoom level (0-19)
- `x`, `y` = tile coordinates

**Error Handling**:
```typescript
map.on('error', (e) => {
  console.error('Map error:', e)
  // Fallback: hide map, show address text only
  setMapError(true)
})
```

**Timeout Configuration**: Mapbox GL JS default (no custom timeout needed)

**Caching**: Browser caches tiles automatically

## Compatibility Requirements

### Backward Compatibility

**Constraint**: Existing vendors without location data must continue to work

**Implementation**:
- Location fields are optional (not required)
- Components check for location data existence before rendering map
- Listing pages work with or without location search active

**Validation**:
```typescript
// In VendorDetailPage
{vendor.location?.latitude && vendor.location?.longitude ? (
  <VendorLocationMap {...vendor.location} vendorName={vendor.name} />
) : (
  <p className="text-muted-foreground">Location information not available</p>
)}
```

### Version Compatibility

**Dependencies**:
- Next.js 14.2.5 (existing, compatible)
- Payload CMS 2.x or 3.x (existing, compatible)
- mapbox-gl ^2.15.0 or ^3.0.0 (new dependency)

**Browser Support**:
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Mobile 90+
- No IE11 support (mapbox-gl requires modern JavaScript)

### Deprecation Strategy

**Deprecated**: None (new feature, no deprecation)

**Migration Path**: N/A

**Timeline**: N/A

## Compatibility Validation

**Testing Matrix**:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 120+ | ✓ Supported |
| Firefox | 120+ | ✓ Supported |
| Safari | 16+ | ✓ Supported |
| Edge | 120+ | ✓ Supported |
| Mobile Safari | 16+ | ✓ Supported |
| Chrome Mobile | 120+ | ✓ Supported |

**API Compatibility**:
- geocode.maps.co API: Compatible with OpenStreetMap Nominatim format (stable)
- OpenFreeMap: No versioned API (tile URL pattern stable)
- Leaflet.js: v1.9+ (stable, long-term support)

**Database Compatibility**:
- SQLite 3.x: Full support
- Migration: Payload CMS handles schema sync automatically

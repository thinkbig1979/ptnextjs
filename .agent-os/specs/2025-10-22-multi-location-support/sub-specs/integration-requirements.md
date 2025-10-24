# Integration Requirements

**Spec:** Multi-Location Support for Vendors
**Date:** 2025-10-22
**Updated:** 2025-10-23 (Coordination with location-name-search)
**Integration Systems:** Payload CMS, Next.js App Router, Photon Geocoding API (via `/api/geocode`)

## System Integration Overview

### Integration Architecture and Patterns

The multi-location feature integrates with three primary systems:

1. **Payload CMS Backend**: Database schema, validation hooks, REST API
2. **Next.js Frontend**: Dashboard UI, public profile pages, API routes
3. **Photon Geocoding API** (via existing `/api/geocode` backend proxy from location-name-search): Address-to-coordinates conversion
4. **useLocationFilter Hook** (from location-name-search): Client-side distance filtering - **requires update to support `locations[]` array**

**Integration Pattern**: RESTful API with JSON payloads, event-driven validation hooks, external HTTP API calls

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────┐      ┌──────────────────────────┐│
│  │   Dashboard UI        │      │   Public Profile Pages   ││
│  │   (React Components)  │      │   (Server Components)    ││
│  └──────────┬────────────┘      └──────────┬───────────────┘│
│             │                               │                 │
│             │ HTTP/JSON                     │ HTTP/JSON       │
│             ▼                               ▼                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Payload CMS REST API                        │    │
│  │  /api/vendors/:id (PATCH, GET)                       │    │
│  │  /api/vendors/search (GET with location params)      │    │
│  └────────────────────┬─────────────────────────────────┘    │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        ▼ CRUD Operations
         ┌──────────────────────────────────┐
         │   Payload CMS ORM Layer           │
         │   - Validation Hooks              │
         │   - beforeChange / afterChange    │
         │   - Access Control (RBAC)         │
         └──────────┬───────────────────────┘
                    │
                    ▼ SQL Queries
         ┌──────────────────────────────────┐
         │   SQLite Database                 │
         │   vendors.locations (JSON array)  │
         └──────────────────────────────────┘

         External API Integration:
         ┌──────────────────────────────────┐
         │   Photon API via /api/geocode     │
         │   (from location-name-search)     │
         │   HTTPS GET with address query    │
         │   Returns GeoJSON FeatureCollection│
         └──────────────────────────────────┘
```

### Critical Integration with Location-Name-Search Feature

**Dependency**: Multi-location support **builds on** and **extends** the location-name-search feature.

**Required Components from location-name-search:**
1. ✅ `/api/geocode` backend proxy (Photon API) - **Reused for address geocoding**
2. ⚠️ `useLocationFilter` hook - **Requires update to support `locations[]` array**
3. ✅ `VendorCoordinates` type - **Compatible with `VendorLocation` type**

**Coordination Required:**

#### 1. useLocationFilter Hook Update

**Current Implementation** (location-name-search):
```typescript
// hooks/useLocationFilter.ts
export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
) {
  if (!userLocation) return { filteredVendors: vendors, isFiltering: false };

  const filtered = vendors
    .filter(vendor => {
      if (!vendor.location?.latitude || !vendor.location?.longitude) {
        return false;
      }
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vendor.location.latitude,
        vendor.location.longitude
      );
      return distance <= maxDistance;
    })
    .map(vendor => ({
      ...vendor,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vendor.location.latitude,
        vendor.location.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  return { filteredVendors: filtered, isFiltering: true };
}
```

**Required Update** (for multi-location support):
```typescript
// hooks/useLocationFilter.ts
export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
) {
  if (!userLocation) return { filteredVendors: vendors, isFiltering: false };

  const filtered = vendors
    .map(vendor => {
      // Support both old single location and new locations array
      const locations = vendor.locations?.length
        ? vendor.locations
        : vendor.location
          ? [{ ...vendor.location, isHQ: true }]
          : [];

      if (locations.length === 0) return null;

      // Filter locations by tier
      const eligibleLocations = locations.filter(loc => {
        // Tier 0/1: Only HQ location
        if (vendor.tier === 'free' || vendor.tier === 'tier1') {
          return loc.isHQ === true;
        }
        // Tier 2+: All locations
        return true;
      });

      // Find closest eligible location
      const closestLocation = eligibleLocations
        .map(loc => ({
          location: loc,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            loc.latitude,
            loc.longitude
          )
        }))
        .filter(({ distance }) => distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)[0];

      if (!closestLocation) return null;

      return {
        ...vendor,
        distance: closestLocation.distance,
        matchedLocation: closestLocation.location
      };
    })
    .filter((vendor): vendor is VendorWithDistance => vendor !== null)
    .sort((a, b) => a.distance - b.distance);

  return {
    filteredVendors: filtered,
    isFiltering: true,
    vendorsWithCoordinates: vendors.filter(v => v.locations?.length || v.location)
  };
}
```

**Key Changes:**
- Support both `vendor.location` (old) and `vendor.locations[]` (new) for backward compatibility
- Apply tier-based filtering (Tier 0/1 = HQ only, Tier 2+ = all locations)
- Find **closest location** for each vendor (not just first location)
- Return `matchedLocation` to show which office matched the search
- Maintain backward compatibility during transition period

#### 2. Type System Coordination

**Existing Types** (location-name-search):
```typescript
// lib/types.ts
export interface VendorCoordinates {
  latitude: number;
  longitude: number;
}
```

**New Types** (multi-location):
```typescript
// lib/types.ts
export interface VendorLocation extends VendorCoordinates {
  address: string;
  city: string;
  country: string;
  isHQ: boolean;
}

export interface VendorWithDistance extends Vendor {
  distance: number;
  matchedLocation?: VendorLocation; // Which location matched the search
}
```

**Compatibility**: ✅ `VendorLocation` is a superset of `VendorCoordinates` - fully compatible

#### 3. Geocoding API Unification

**Before** (inconsistent):
- location-name-search: Uses Photon API via `/api/geocode`
- multi-location: Uses geocode.maps.co directly from client

**After** (unified):
- Both features use: Photon API via `/api/geocode` backend proxy
- Benefits: Consistent API, single rate limit management, easier to maintain

**Implementation**: Multi-location `GeocodingButton` component calls `/api/geocode?q={address}&limit=1`

```

### Data Flow Between Systems

**Vendor Profile Update Flow:**
```
User edits location in Dashboard UI
  ↓
React component updates local state
  ↓
User clicks "Save"
  ↓
SWR mutation triggers PATCH /api/vendors/:id
  ↓ HTTP Request (JSON)
Payload CMS REST API receives request
  ↓
Authentication middleware validates JWT token
  ↓
Authorization check: Is user owner or admin?
  ↓
beforeChange hook: Validate HQ uniqueness, tier restrictions
  ↓ (if validation passes)
ORM updates vendors.locations field
  ↓
Database writes JSON array to SQLite
  ↓
afterChange hook (optional): Log update, send notifications
  ↓
HTTP Response (JSON with updated vendor)
  ↓
SWR revalidates cache, updates UI
```

**Location-Based Search Flow:**
```
User enters location search (lat, lng, radius)
  ↓
Frontend calls GET /api/vendors/search?latitude=X&longitude=Y&radius=Z
  ↓ HTTP Request
Payload CMS REST API receives request
  ↓
Query vendors with geo bounds filter
  ↓
For each vendor:
  - If tier >= tier2, include all locations
  - If tier < tier2, include only HQ location
  ↓
Calculate distance from search center to each location
  ↓
Sort results by distance
  ↓
HTTP Response (JSON with vendors + matched locations)
  ↓
Frontend renders results on map + list
```

### Integration Points and Interfaces

**Payload CMS Collection Schema Integration:**
- **Location**: `payload/collections/Vendors.ts:1015-1083` (existing location group field)
- **Action**: Replace with `locations` array field at same location
- **Interface Contract**:
  ```typescript
  {
    name: 'locations',
    type: 'array',
    fields: [
      { name: 'address', type: 'text', required: true, maxLength: 500 },
      { name: 'latitude', type: 'number', required: true, min: -90, max: 90 },
      { name: 'longitude', type: 'number', required: true, min: -180, max: 180 },
      { name: 'city', type: 'text', required: true, maxLength: 255 },
      { name: 'country', type: 'text', required: true, maxLength: 255 },
      { name: 'isHQ', type: 'checkbox', defaultValue: false },
    ],
    validate: (locations, { siblingData }) => {
      // HQ uniqueness + tier restriction validation
    },
  }
  ```

**Dashboard Profile Page Integration:**
- **Location**: `app/dashboard/profile/page.tsx` (existing page)
- **Action**: Add LocationsManagerCard component after basic info section
- **Interface Contract**:
  ```typescript
  interface DashboardProfilePageProps {
    vendor: Vendor; // from SWR hook
  }

  // Within page component:
  {vendor.tier === 'tier2' ? (
    <LocationsManagerCard vendor={vendor} onUpdate={handleVendorUpdate} />
  ) : (
    <TierUpgradePrompt tier={vendor.tier} feature="multiple-locations" />
  )}
  ```

**Vendor Public Profile Page Integration:**
- **Location**: `app/vendors/[slug]/page.tsx` (existing page)
- **Action**: Add LocationsTab with LocationsDisplaySection
- **Interface Contract**:
  ```typescript
  interface VendorProfilePageProps {
    params: { slug: string };
  }

  export async function generateStaticParams() {
    // Include vendors with locations in static generation
  }

  // Within page component:
  <Tabs defaultValue="about">
    <TabsList>
      <TabsTrigger value="about">About</TabsTrigger>
      <TabsTrigger value="locations">Locations</TabsTrigger>
      {/* ... other tabs */}
    </TabsList>
    <TabsContent value="locations">
      <LocationsDisplaySection
        locations={vendor.locations}
        tier={vendor.tier}
      />
    </TabsContent>
  </Tabs>
  ```

## API Integration Requirements

### REST API Specifications and Contracts

#### PATCH /api/vendors/:id

**Endpoint**: `/api/vendors/:id`
**Method**: PATCH
**Content-Type**: `application/json`
**Authentication**: Required (JWT Bearer token in Authorization header)

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "locations": [
    {
      "address": "123 Harbor View Drive, Fort Lauderdale, FL 33316",
      "latitude": 26.122439,
      "longitude": -80.137314,
      "city": "Fort Lauderdale",
      "country": "United States",
      "isHQ": true
    },
    {
      "address": "456 Yachting Way, Monaco 98000",
      "latitude": 43.738418,
      "longitude": 7.424616,
      "city": "Monaco",
      "country": "Monaco",
      "isHQ": false
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "vendor-123",
    "companyName": "Marine Tech Solutions",
    "slug": "marine-tech-solutions",
    "tier": "tier2",
    "locations": [
      {
        "address": "123 Harbor View Drive, Fort Lauderdale, FL 33316",
        "latitude": 26.122439,
        "longitude": -80.137314,
        "city": "Fort Lauderdale",
        "country": "United States",
        "isHQ": true
      },
      {
        "address": "456 Yachting Way, Monaco 98000",
        "latitude": 43.738418,
        "longitude": 7.424616,
        "city": "Monaco",
        "country": "Monaco",
        "isHQ": false
      }
    ],
    "updatedAt": "2025-10-22T14:30:00.000Z"
  }
}
```

**Error Responses:**

400 Bad Request (Validation Error):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Only one location can be designated as Headquarters",
    "details": "Found 2 locations with isHQ=true",
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
}
```

403 Forbidden (Tier Restriction):
```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTION",
    "message": "Multiple locations require Tier 2 subscription",
    "details": "Current tier: tier1, attempted locations: 2",
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
}
```

401 Unauthorized:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
}
```

403 Forbidden (Not Owner):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to update this vendor profile",
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
}
```

#### GET /api/vendors/search

**Endpoint**: `/api/vendors/search`
**Method**: GET
**Authentication**: Public (no authentication required)

**Query Parameters:**
- `latitude` (number, required): Search center latitude (-90 to 90)
- `longitude` (number, required): Search center longitude (-180 to 180)
- `radius` (number, optional): Search radius in kilometers (default: 50, max: 500)

**Example Request:**
```
GET /api/vendors/search?latitude=26.122&longitude=-80.137&radius=50
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "vendor-123",
        "companyName": "Marine Tech Solutions",
        "slug": "marine-tech-solutions",
        "tier": "tier2",
        "logo": "/uploads/marine-tech-logo.png",
        "matchedLocations": [
          {
            "address": "123 Harbor View Drive, Fort Lauderdale, FL 33316",
            "latitude": 26.122439,
            "longitude": -80.137314,
            "city": "Fort Lauderdale",
            "country": "United States",
            "isHQ": true,
            "distance": 1.2
          },
          {
            "address": "456 Beach Road, Miami, FL 33139",
            "latitude": 25.761681,
            "longitude": -80.191788,
            "city": "Miami",
            "country": "United States",
            "isHQ": false,
            "distance": 43.5
          }
        ]
      },
      {
        "id": "vendor-456",
        "companyName": "Ocean Electronics Ltd",
        "slug": "ocean-electronics",
        "tier": "tier1",
        "logo": "/uploads/ocean-electronics-logo.png",
        "matchedLocations": [
          {
            "address": "789 Marina Drive, Fort Lauderdale, FL 33301",
            "latitude": 26.119,
            "longitude": -80.140,
            "city": "Fort Lauderdale",
            "country": "United States",
            "isHQ": true,
            "distance": 0.5
          }
        ]
      }
    ],
    "total": 2,
    "searchCenter": {
      "latitude": 26.122,
      "longitude": -80.137
    },
    "radius": 50
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid latitude or longitude",
    "details": "Latitude must be between -90 and 90",
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
}
```

### Authentication and Authorization Requirements

**Authentication Method**: JWT (JSON Web Token) issued by Payload CMS

**Token Structure:**
```json
{
  "sub": "user-123",
  "email": "vendor@example.com",
  "role": "vendor",
  "vendorId": "vendor-123",
  "iat": 1729612800,
  "exp": 1729616400
}
```

**Authorization Rules:**
- **PATCH /api/vendors/:id**:
  - Authenticated users only
  - User must be vendor owner (user.vendorId === params.id) OR admin
  - Tier restrictions enforced: tier 0/1 cannot save multiple locations
- **GET /api/vendors/search**:
  - Public access (no authentication required)
  - Tier filtering applied server-side (tier 2+ includes all locations, others only HQ)

**Access Control Implementation:**
```typescript
// In Payload CMS Vendors collection
access: {
  update: ({ req: { user }, id }) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    // Vendor can only update their own profile
    return user.vendorId === id;
  },
}

// Field-level access for locations array
fields: [
  {
    name: 'locations',
    type: 'array',
    access: {
      update: ({ req: { user }, data }) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        // Vendors can manage locations only if tier2+
        return data?.tier === 'tier2';
      },
    },
  },
]
```

### Rate Limiting and Error Handling

**Rate Limiting Strategy:**
- **PATCH /api/vendors/:id**: 10 requests per minute per user (prevents spam)
- **GET /api/vendors/search**: 100 requests per minute per IP (public endpoint)
- **geocode.maps.co API**: 1 request per second (free tier) - enforce client-side debouncing

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60,
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
}
```

**Error Handling Strategy:**

1. **Client-Side Validation** (Fast Feedback):
   - Zod schema validates all fields before API call
   - Inline error messages below form inputs
   - Prevents invalid API requests

2. **Server-Side Validation** (Security):
   - Payload CMS validation hooks enforce business rules
   - Returns structured error responses with actionable messages
   - Logs validation failures for debugging

3. **Graceful Degradation**:
   - If geocoding API fails, allow manual lat/long entry
   - If map component fails, show location list only
   - If location search fails, fall back to non-location search

**Error Response Standardization:**
All API errors follow this structure:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // Machine-readable error code
    message: string; // User-friendly error message
    details?: string; // Additional technical details (optional)
    timestamp: string; // ISO 8601 timestamp
  };
}
```

## Database Integration

### Database Connection and Query Patterns

**Database System**: SQLite (development), PostgreSQL (production future)

**Connection Management**:
- Payload CMS handles database connection pooling automatically
- SQLite: Single file-based database at `./data/payload.db`
- Connection string from environment variable: `DATABASE_URL`

**Query Patterns for Multi-Location Feature**:

**1. Update Vendor Locations:**
```typescript
// Payload CMS ORM (abstracted)
await payload.update({
  collection: 'vendors',
  id: vendorId,
  data: {
    locations: [
      { address: '...', latitude: 26.122, longitude: -80.137, city: 'Miami', country: 'USA', isHQ: true },
      { address: '...', latitude: 43.738, longitude: 7.424, city: 'Monaco', country: 'Monaco', isHQ: false },
    ],
  },
});

// Equivalent raw SQL (for reference):
UPDATE vendors
SET locations = ?
WHERE id = ?;
-- locations is JSON array column
```

**2. Location-Based Search (Geo Bounds Query):**
```typescript
// Calculate geo bounds from center + radius
const bounds = calculateGeoBounds(latitude, longitude, radius);

// Payload CMS query with geo filtering
const vendors = await payload.find({
  collection: 'vendors',
  where: {
    and: [
      {
        'locations.latitude': {
          greater_than_equal: bounds.minLat,
          less_than_equal: bounds.maxLat,
        },
      },
      {
        'locations.longitude': {
          greater_than_equal: bounds.minLng,
          less_than_equal: bounds.maxLng,
        },
      },
    ],
  },
});

// Equivalent raw SQL (for reference):
SELECT * FROM vendors
WHERE JSON_EXTRACT(locations, '$[*].latitude') BETWEEN ? AND ?
AND JSON_EXTRACT(locations, '$[*].longitude') BETWEEN ? AND ?;
```

**3. Find Vendors with Multiple Locations (Analytics Query):**
```typescript
const vendorsWithMultipleLocations = await payload.find({
  collection: 'vendors',
  where: {
    'locations': {
      exists: true,
    },
  },
});

// Filter in application code
const multiLocationVendors = vendorsWithMultipleLocations.docs.filter(
  (vendor) => vendor.locations && vendor.locations.length > 1
);
```

### Data Migration and Synchronization

**Migration Script**: Convert existing `location` group field to `locations` array field

**Migration File**: `migrations/2025-10-22-convert-location-to-array.ts`

```typescript
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite';

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  console.log('Starting migration: location → locations array');

  // Fetch all vendors
  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0, // Get all vendors
  });

  console.log(`Found ${vendors.totalDocs} vendors to migrate`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const vendor of vendors.docs) {
    // Check if vendor has old location structure
    if (vendor.location && vendor.location.address) {
      try {
        // Convert single location to array with isHQ=true
        await payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: {
            locations: [
              {
                address: vendor.location.address,
                latitude: vendor.location.latitude,
                longitude: vendor.location.longitude,
                city: vendor.location.city || '',
                country: vendor.location.country || '',
                isHQ: true,
              },
            ],
          },
        });
        migratedCount++;
        console.log(`Migrated vendor ${vendor.id} (${vendor.companyName})`);
      } catch (error) {
        console.error(`Failed to migrate vendor ${vendor.id}:`, error);
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`);
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  console.log('Starting rollback: locations array → location');

  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0,
  });

  console.log(`Found ${vendors.totalDocs} vendors to rollback`);

  let rolledBackCount = 0;

  for (const vendor of vendors.docs) {
    if (vendor.locations && vendor.locations.length > 0) {
      try {
        // Find HQ location
        const hqLocation = vendor.locations.find((loc: any) => loc.isHQ) || vendor.locations[0];

        // Convert back to single location structure
        await payload.update({
          collection: 'vendors',
          id: vendor.id,
          data: {
            location: {
              address: hqLocation.address,
              latitude: hqLocation.latitude,
              longitude: hqLocation.longitude,
              city: hqLocation.city,
              country: hqLocation.country,
            },
          },
        });
        rolledBackCount++;
        console.log(`Rolled back vendor ${vendor.id} (${vendor.companyName})`);
      } catch (error) {
        console.error(`Failed to rollback vendor ${vendor.id}:`, error);
      }
    }
  }

  console.log(`Rollback complete: ${rolledBackCount} rolled back`);
}
```

**Migration Execution:**
```bash
# Run migration
pnpm run payload:migrate

# Rollback migration (if needed)
pnpm run payload:migrate:rollback
```

**Data Validation Post-Migration:**
```typescript
// Validation script to verify migration success
export async function validateMigration(payload: Payload) {
  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0,
  });

  const issues: string[] = [];

  for (const vendor of vendors.docs) {
    // Check: Vendor has at least one location
    if (!vendor.locations || vendor.locations.length === 0) {
      issues.push(`Vendor ${vendor.id} has no locations`);
    }

    // Check: Exactly one HQ location
    const hqCount = vendor.locations?.filter((loc: any) => loc.isHQ).length || 0;
    if (hqCount !== 1) {
      issues.push(`Vendor ${vendor.id} has ${hqCount} HQ locations (expected 1)`);
    }

    // Check: All required fields populated
    vendor.locations?.forEach((loc: any, idx: number) => {
      if (!loc.address || !loc.city || !loc.country) {
        issues.push(`Vendor ${vendor.id} location ${idx} missing required fields`);
      }
      if (typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
        issues.push(`Vendor ${vendor.id} location ${idx} has invalid coordinates`);
      }
    });
  }

  if (issues.length > 0) {
    console.error('Migration validation failed:');
    issues.forEach((issue) => console.error(`  - ${issue}`));
    throw new Error(`Migration validation failed with ${issues.length} issues`);
  } else {
    console.log('Migration validation passed: All vendors have valid locations');
  }
}
```

### Transaction Management and Consistency

**Transaction Strategy**: Payload CMS does not expose explicit transaction API for SQLite, but updates are atomic at document level

**Consistency Guarantees**:
- Vendor updates are atomic (all-or-nothing)
- If validation fails, no database changes are committed
- Payload CMS beforeChange hooks run before database write

**Handling Concurrent Updates**:
- Optimistic locking: Include `updatedAt` timestamp in PATCH request
- If timestamps don't match, return 409 Conflict error
- Frontend should refetch latest data and prompt user to retry

**Example Optimistic Lock Check:**
```typescript
// In Payload CMS beforeChange hook
hooks: {
  beforeChange: [
    async ({ req, data, operation }) => {
      if (operation === 'update' && req.body.updatedAt) {
        const existing = await payload.findByID({
          collection: 'vendors',
          id: req.params.id,
        });

        if (new Date(existing.updatedAt) > new Date(req.body.updatedAt)) {
          throw new Error('Conflict: Vendor was updated by another user. Please refresh and try again.');
        }
      }
      return data;
    },
  ],
}
```

## External Service Integration

### Third-Party Service Dependencies

**Service**: Photon Geocoding API (via existing `/api/geocode` backend proxy)

**Purpose**: Convert address strings to latitude/longitude coordinates

**Integration Pattern**: Reuse existing geocoding infrastructure from location-name-search feature

**Backend Endpoint**: `GET /api/geocode` (already implemented in location-name-search)

**Protocol**: HTTPS REST API (internal Next.js API route)

**Authentication**: None required (public endpoint with IP-based rate limiting)

**Rate Limits**:
- Backend enforces: 10 requests/minute per IP address
- Photon API: No official limits (reasonable use encouraged)

**Request Format:**
```
GET /api/geocode?q={address}&limit=1
```

**Example Request:**
```
GET /api/geocode?q=123%20Harbor%20View%20Drive,%20Fort%20Lauderdale,%20FL%2033316&limit=1
```

**Example Response (200 OK):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-80.137314, 26.122439]
      },
      "properties": {
        "name": "Harbor View Drive",
        "city": "Fort Lauderdale",
        "state": "Florida",
        "country": "United States",
        "countrycode": "US",
        "postcode": "33316",
        "osm_type": "W",
        "osm_key": "highway",
        "osm_value": "residential"
      }
    }
  ]
}
```

**Error Responses:**

400 Bad Request (invalid query):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Query parameter required"
  }
}
```

429 Too Many Requests:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests"
  }
}
```

Empty results (address not found):
```json
{
  "type": "FeatureCollection",
  "features": []
}
```

**Frontend Integration:**
```typescript
// lib/services/GeocodingService.ts
export class GeocodingService {
  private static readonly API_URL = '/api/geocode';
  private static cache = new Map<string, { lat: number; lng: number }>();

  static async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    // Check cache first (24-hour expiry)
    const cached = this.cache.get(address);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.API_URL}?q=${encodeURIComponent(address)}&limit=1`);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      // Check for error response format
      if (data.success === false) {
        throw new Error(data.error.message);
      }

      // Check for empty results
      if (!data.features || data.features.length === 0) {
        return null; // Address not found
      }

      // Extract coordinates from GeoJSON format
      const [lng, lat] = data.features[0].geometry.coordinates;
      const coords = { lat, lng };

      // Cache result
      this.cache.set(address, coords);

      return coords;
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw error;
    }
  }
}
```

**Integration Dependencies:**
- Requires location-name-search feature to be deployed first (provides `/api/geocode` endpoint)
- GeoJSON response format from Photon API (standard format)
- Coordinates in [longitude, latitude] order (GeoJSON spec)

### Webhook and Event-Driven Integration

**Payload CMS Hooks**: Event-driven hooks for vendor updates

**afterChange Hook**: Trigger actions after vendor location update

```typescript
// payload/collections/Vendors.ts
hooks: {
  afterChange: [
    async ({ req, doc, operation }) => {
      if (operation === 'update' && doc.locations) {
        // Optional: Send notification to vendor about profile update
        // Optional: Log location changes for analytics
        console.log(`Vendor ${doc.id} updated locations: ${doc.locations.length} total`);

        // Optional: Invalidate search cache
        // await cacheService.invalidate(`vendor-search-*`);
      }
    },
  ],
}
```

**Future Webhook Integration** (if needed):
- Webhook to notify external systems when vendor locations change
- Webhook to sync location data to external CRM/analytics platforms

### Service Level Agreements and Reliability

**SLA Requirements**:

**Payload CMS API**:
- Uptime: 99.9% (internal service)
- Response Time: < 500ms for PATCH /api/vendors/:id
- Response Time: < 1000ms for GET /api/vendors/search

**geocode.maps.co API**:
- Uptime: No SLA (third-party free tier)
- Response Time: ~500-1000ms typical
- Rate Limit: 1 request/second (free tier)

**Reliability Strategy**:
- Cache geocoding results locally (24-hour expiry) to reduce API calls
- Provide manual lat/long entry fallback if geocoding fails
- Debounce geocoding button clicks (500ms) to prevent accidental rate limit hits
- Display user-friendly error messages on service failures

**Monitoring and Alerting**:
- Monitor geocoding API success rate (should be > 95%)
- Alert if geocoding API returns 429 errors frequently
- Monitor average location search response time (should be < 1000ms)
- Alert if vendor update API errors exceed 1% of requests

## Compatibility Requirements

### Backward Compatibility Constraints

**Database Schema Backward Compatibility**:
- Migration script must preserve existing location data (convert to locations[0] with isHQ=true)
- Old `location` field should be kept temporarily (dual-write during transition period)
- Frontend must handle vendors with either `location` or `locations` format during migration

**API Backward Compatibility**:
- Existing `GET /api/vendors/:id` must include both `location` (deprecated) and `locations` (new) fields during transition
- Frontend components must gracefully handle missing `locations` array (fallback to `location`)

**Transition Period Strategy**:
1. Week 1: Deploy migration, both fields populated (location + locations)
2. Week 2-3: Monitor for issues, all new updates use locations array
3. Week 4: Remove old location field from API responses
4. Week 5+: Remove location field from database schema

### Version Compatibility Matrix

| Component | Current Version | Updated Version | Breaking Changes |
|-----------|----------------|-----------------|------------------|
| Payload CMS | 3.x | 3.x | None (schema addition) |
| Next.js | 14.2.5 | 14.2.5 | None |
| React | 18.2.0 | 18.2.0 | None |
| TypeScript | 5.2.2 | 5.2.2 | None |
| payload-types.ts | N/A | Regenerated | New VendorLocation type added |

**TypeScript Type Compatibility**:
```typescript
// Old type (deprecated)
interface Vendor {
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
}

// New type
interface Vendor {
  locations?: VendorLocation[];
}

interface VendorLocation {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  isHQ: boolean;
}

// Backward-compatible helper
function getHQLocation(vendor: Vendor): VendorLocation | null {
  // New format
  if (vendor.locations && vendor.locations.length > 0) {
    return vendor.locations.find((loc) => loc.isHQ) || vendor.locations[0];
  }
  // Old format (fallback)
  if (vendor.location && vendor.location.address) {
    return {
      address: vendor.location.address,
      latitude: vendor.location.latitude!,
      longitude: vendor.location.longitude!,
      city: vendor.location.city || '',
      country: vendor.location.country || '',
      isHQ: true,
    };
  }
  return null;
}
```

### Deprecation and Migration Strategies

**Deprecation Timeline**:

**Phase 1 (Week 1-2): Deprecation Notice**
- Add deprecation warning to `location` field in API documentation
- Update TypeScript types with `@deprecated` JSDoc comments
- Log warning when old `location` field is accessed

**Phase 2 (Week 3-4): Transition Period**
- Both `location` and `locations` fields available in API responses
- Frontend updated to use `locations` array, fallback to `location`
- Migration script runs, populating `locations` for all vendors

**Phase 3 (Week 5+): Removal**
- Remove `location` field from API responses
- Remove deprecated code paths from frontend
- Update database schema to remove `location` field
- Clean up migration scripts and temporary compatibility code

**Communication Plan**:
- Notify all API consumers (if any external integrations) 2 weeks before deprecation
- Add prominent notice in API documentation
- Send email to tier 2+ vendors announcing multi-location feature

**Rollback Plan**:
- Keep migration rollback script tested and ready
- If critical issues found, can revert to single location within 24 hours
- Database backup before migration execution

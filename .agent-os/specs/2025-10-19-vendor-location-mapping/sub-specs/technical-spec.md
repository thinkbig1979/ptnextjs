# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-19-vendor-location-mapping/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: Requires database schema changes to store location data (backend), frontend map component for display, and location-based filtering logic that can be handled on the frontend using static data.

---

## Backend Implementation

### Database Schema

**Tables/Collections Required**:

#### **vendors** (existing table - add fields)

Add location fields to existing vendors table in Payload CMS:

```typescript
// Add to existing vendor collection schema
{
  name: 'vendors',
  fields: [
    // ... existing fields ...
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Address',
          admin: {
            description: 'Full street address or city, country'
          }
        },
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          admin: {
            description: 'Decimal degrees (e.g., 43.6532)'
          }
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          admin: {
            description: 'Decimal degrees (e.g., -79.3832)'
          }
        }
      ]
    }
  ]
}
```

**Migration**:
- Create Payload CMS migration to add location fields
- Existing vendors will have null/undefined location data (graceful handling required)
- Admin users manually enter location data via Payload admin panel

**Indexes**:
- No special indexes required for initial simple implementation
- SQLite will handle small vendor dataset efficiently without geospatial indexes

---

## Frontend Implementation

### UI Components

#### **VendorLocationMap**
- **Type**: Map Component
- **Purpose**: Display vendor location on an interactive map
- **User Interactions**: Pan, zoom, click marker for popup
- **State Management**: Local component state for map initialization
- **Location**: Display on vendor detail page

**Props**:
```typescript
interface VendorLocationMapProps {
  latitude: number
  longitude: number
  vendorName: string
  address?: string
}
```

#### **LocationSearchFilter**
- **Type**: Form Component
- **Purpose**: Allow users to search for vendors by location
- **User Interactions**: Text input, radius selection, submit
- **State Management**: Local state for search parameters, URL query params for persistence
- **Location**: Vendor and partner listing pages

**Props**:
```typescript
interface LocationSearchFilterProps {
  onLocationSearch: (location: { lat: number; lng: number; address: string; radius: number }) => void
}
```

#### **VendorListWithDistance**
- **Type**: Enhanced List Component
- **Purpose**: Display vendors with distance from search location
- **Props**: Vendor data + calculated distances
- **Events**: Filter and sort by distance

### Frontend State Management

**State Management Pattern**: React useState (local component state) + URL query parameters

**State Stores Required**:
- **Location Search State**: Local state in listing page component
  - State shape: `{ searchLocation: { lat: number, lng: number, address: string } | null, radius: number }`
  - Actions: setSearchLocation, setRadius, clearLocationFilter
  - URL sync: Persist search params in query string for shareable links

### Frontend Routing

**Routes Required**:
- Existing routes - no new routes needed
- `/vendors` - Enhanced with location search
- `/partners` - Enhanced with location search
- `/vendors/[slug]` - Enhanced with map component

**Route Guards**: None required (public pages)

### User Interface Specifications

**Design Requirements**:
- **Responsive Breakpoints**:
  - Desktop: Map 600px height
  - Mobile: Map 300px height, collapsible
- **Accessibility**: WCAG 2.1 AA - keyboard navigation for map controls, ARIA labels
- **Loading States**: Skeleton loader for map initialization
- **Error States**: Fallback message if vendor has no location data
- **Empty States**: Message explaining no vendors found within radius

**Form Validations**:
- **Location Input**: Required, must successfully geocode to valid coordinates
- **Radius**: Required, must be one of the predefined options (10, 25, 50, 100)

### Component Architecture

**UI Component Strategy**: shadcn/ui + Leaflet.js Map Component

**Map Library**: Leaflet.js 1.9+ (lightweight, mobile-friendly mapping library)

**Component Library**: shadcn/ui (existing)

**Library Components to Use**:
- **Input** (`components/ui/input`): Location search text field
  - Usage: Geocoding address input
  - Variants: Default
  - Props: placeholder, value, onChange

- **Select** (`components/ui/select`): Radius dropdown
  - Usage: Choose search radius
  - Props: value, onValueChange
  - Options: 10, 25, 50, 100 miles

- **Button** (`components/ui/button`): Search submit
  - Usage: Trigger location search
  - Variants: default
  - Props: onClick, disabled, loading

- **Card** (`components/ui/card`): Map container
  - Usage: Wrap map component with proper styling
  - Sub-components: CardHeader, CardContent

**Custom Components** (built on library):
- **VendorLocationMap**: Leaflet.js integration for displaying vendor location
  - Built from: Custom implementation using leaflet library
  - Purpose: Interactive map display on vendor pages
  - Props: latitude, longitude, vendorName, address
  - Bundle size: ~150KB (vs 500KB for Mapbox GL JS)

- **LocationSearchFilter**: Combined location input + radius selector + search button
  - Built from: Input, Select, Button
  - Purpose: Unified location search interface
  - Props: onLocationSearch callback

### Page Layout Architecture

**Layout Approach**: Existing Next.js App Router layouts

**Page-Specific Layouts**:

#### Vendor Detail Page Layout
- **Layout Pattern**: Single column with sections
- **Structure**:
  ```
  - Header: Vendor name, logo, quick actions
  - Main content: Vendor details
  - Location section: Address + Interactive map (NEW)
  - Additional sections: Products, description, etc.
  ```
- **Responsive Behavior**:
  - Desktop: Map 600px height, full width
  - Mobile: Map 300px height, full width, collapsible accordion

#### Vendor Listing Page Layout
- **Layout Pattern**: Filters + List
- **Structure**:
  ```
  - Header: Page title, vendor count
  - Filters sidebar: Category, location (NEW), etc.
  - Main content: Vendor grid/list with distance badges (if location search active)
  ```
- **Responsive Behavior**:
  - Desktop: Filters in left sidebar
  - Mobile: Filters in drawer/accordion

**Component Hierarchy**:
```
VendorDetailPage
├── VendorHeader
├── VendorInfo
├── LocationSection (NEW)
│   ├── AddressDisplay
│   └── VendorLocationMap
└── ProductsSection

VendorListingPage
├── PageHeader
├── FiltersPanel
│   ├── CategoryFilter
│   └── LocationSearchFilter (NEW)
└── VendorList
    └── VendorCard (enhanced with distance badge)
```

### Navigation Architecture

**Navigation Pattern**: Existing navigation (no changes)

### User Flow & Interaction Patterns

**Primary User Flows**:

#### Flow 1: Viewing Vendor Location
1. **Starting Point**: Vendor listing page
2. **Trigger**: Click vendor card
3. **Action**: Navigate to `/vendors/[slug]`
4. **Page Loads**: VendorDetailPage renders
   - Fetches vendor data including location fields
   - Loading state: Skeleton for map area
5. **Location Section Renders**:
   - If location data exists: Show address + VendorLocationMap
   - If no location: Show message "Location not available"
6. **Map Initialization**:
   - MapboxGL initializes with OpenFreeMap tiles
   - Centers on vendor coordinates
   - Displays single marker
   - Popup shows vendor name + address
7. **User Interaction**: Pan/zoom map to explore area
8. **Success Path**: Interactive map displays correctly
9. **Error Path**: Map fails to load → show fallback address text only

#### Flow 2: Searching Vendors by Location
1. **Starting Point**: Vendor/partner listing page
2. **Trigger**: User wants to find local vendors
3. **Action**: LocationSearchFilter component visible in filters panel
4. **User Interaction**:
   - Type location in input field (e.g., "Monaco" or "Fort Lauderdale, FL")
   - Select radius from dropdown (10, 25, 50, or 100 miles)
   - Real-time feedback: Input validation
5. **Submit**: Click "Search" button
   - Loading indicator: Button shows spinner
   - Geocoding: Convert address to coordinates using geocoding API
6. **Success Path**:
   - Calculate distances for all vendors with location data
   - Filter vendors within radius
   - Sort by distance (nearest first)
   - Display results with distance badges ("12 miles away")
   - Update URL with search params for shareability
7. **Error Path**:
   - Geocoding fails: Show error "Location not found. Try a different address."
   - No results: Show "No vendors found within [radius] of [location]"
   - Form state: Preserved for retry

#### Flow 3: Clearing Location Filter
1. **Starting Point**: Vendor list with active location filter
2. **Trigger**: Click "Clear location filter" button
3. **Action**: Reset to show all vendors, remove distance sorting
4. **Success Path**: Full vendor list restored, URL params cleared

**Component Interaction Patterns**:

- **Location Search Pattern**:
  - LocationSearchFilter (local state) →
  - User submits search →
  - Geocoding API called →
  - Parent page component receives coordinates →
  - Distance calculation function runs →
  - Vendor list re-filtered and re-sorted

**Form Submission Pattern**:
1. User fills LocationSearchFilter (Input + Select)
2. Client-side validation: Location required, radius required
3. Submit button: Shows loading spinner
4. Geocoding API call: Fetch coordinates for address
5. Success: Parent receives location data, filters vendors
6. Error: Display inline error message, preserve form state

---

## Frontend-Backend Integration

### API Contract

**Contract Owner**: Frontend handles geocoding and distance calculations using static vendor data

**Type Sharing Strategy**:
- Shared TypeScript types in `lib/types.ts`
- Vendor interface extended with optional location fields

**Data Flow**:
1. Vendor data fetched during static generation (includes location) →
2. Frontend displays map with location →
3. User searches by location →
4. Frontend geocodes address to coordinates →
5. Frontend calculates distances and filters →
6. No backend API calls needed for distance filtering

### Integration Points

**Geocoding Service**:
- Use geocode.maps.co (free tier: 1 million requests/month)
- Called from frontend when user submits location search
- Returns coordinates for address string

**Distance Calculation**:
- Haversine formula implemented in frontend utility function
- No backend processing required
- Works with static vendor data

### Error Handling Strategy

- **Geocoding Errors**: Display user-friendly message, allow retry
- **Map Load Errors**: Fallback to address text display only
- **Missing Location Data**: Gracefully hide map, show "Location not available"

### Testing Strategy

**Frontend Tests**:
- Unit tests: Distance calculation function, coordinate validation
- Component tests: VendorLocationMap renders correctly, LocationSearchFilter form validation
- Mock geocoding API responses

**E2E Tests**:
- Search for vendors by location
- View vendor detail page with map
- Handle vendors without location data gracefully

---

## Implementation Architecture

### Component Structure

#### **VendorLocationMap Component**

- **Responsibilities**: Render interactive map with vendor marker
- **Implementation approach**: Leaflet.js with OpenFreeMap tiles
- **Dependencies**: leaflet library, vendor coordinates
- **Interface contracts**:
  ```typescript
  interface VendorLocationMapProps {
    latitude: number
    longitude: number
    vendorName: string
    address?: string
  }
  ```
- **Why Leaflet over Mapbox GL JS**: 70% smaller bundle (150KB vs 500KB), simpler API, perfectly suited for basic marker display

#### **LocationSearchFilter Component**

- **Responsibilities**: Capture location input, geocode, emit search parameters
- **Implementation approach**: Controlled form with geocoding API integration
- **Dependencies**: Geocoding service, shadcn/ui form components
- **Interface contracts**:
  ```typescript
  interface LocationSearchFilterProps {
    onLocationSearch: (params: {
      lat: number
      lng: number
      address: string
      radius: number
    }) => void
  }
  ```

#### **useLocationFilter Hook**

- **Responsibilities**: Manage location search state, distance calculations
- **Implementation approach**: Custom React hook
- **Dependencies**: Haversine distance utility
- **Interface contracts**:
  ```typescript
  function useLocationFilter(vendors: Vendor[]) {
    return {
      filteredVendors: Vendor[]
      searchLocation: { lat: number; lng: number; address: string } | null
      radius: number
      setLocationSearch: (location, radius) => void
      clearLocationSearch: () => void
    }
  }
  ```

### Data Flow

1. **Static Generation** → Vendor data with location fields loaded from Payload CMS →
2. **Vendor Detail Page** → VendorLocationMap receives coordinates and renders map →
3. **Vendor Listing Page** → LocationSearchFilter displays →
4. **User Search** → Address geocoded to coordinates →
5. **Distance Calculation** → useLocationFilter calculates distances for all vendors →
6. **Filtered Results** → Vendors within radius sorted by distance

**Flow Details**:
- **Static Generation**: All vendor location data included in static build (no runtime fetching)
- **Geocoding**: Client-side API call to geocoding service when user searches
- **Filtering**: Pure function calculates distances and filters in-memory on client

### State Management

**State Management Pattern**: React useState + URL query parameters

**Implementation Details**: Location search params stored in URL for shareability

**State Stores**:
- **Component Local State**: Map instance, search form inputs
- **URL Query Params**: `?location=Monaco&radius=50` for persistent search

### Error Handling

**Error Handling Strategy**: Graceful degradation with user-friendly messages

**Error Scenarios**:
- **Geocoding Failure** (geocode.maps.co): Display "Unable to find location. Please try a different address." Keep form intact.
- **Map Load Failure** (Leaflet/OpenFreeMap): Hide map, display address as text only
- **No Location Data**: Show "Location information not available for this vendor"
- **No Results in Radius**: Display "No vendors found within [X] miles of [location]. Try increasing the radius."

**Error Response Format**:
```typescript
{
  success: false,
  error: {
    code: "GEOCODING_FAILED" | "MAP_LOAD_ERROR" | "NO_RESULTS",
    message: "User-friendly error message",
    timestamp: "2025-10-19T12:00:00Z"
  }
}
```

**Geocoding Error Example**:
```typescript
try {
  const response = await fetch(
    `https://geocode.maps.co/search?q=${encodeURIComponent(query)}`
  )
  const results = await response.json()

  if (results.length === 0) {
    throw new Error('Location not found. Try a different address.')
  }

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
} catch (error) {
  setError(error.message)
}
```

---

## Integration Points

### Existing Code Dependencies

#### **Payload CMS Vendor Schema Integration**

- **Purpose**: Extend vendor collection with location fields
- **Interface requirements**: Add location group field to existing schema
- **Data exchange**: Vendor CRUD operations include location data
- **Error handling**: Validate latitude/longitude ranges during admin entry

#### **Vendor Data Service Integration**

- **Purpose**: Fetch vendor data including location fields
- **Interface requirements**: Extend Vendor interface with optional location
- **Data exchange**: Static generation queries include location data
- **Error handling**: Handle vendors with missing/null location gracefully

### API Contracts

#### **GET /api/vendors (Static Data)**

**Purpose**: Fetch all vendors with location data during build

**Response Structure**:
```typescript
interface VendorWithLocation extends Vendor {
  location?: {
    address: string
    latitude: number
    longitude: number
  }
}
```

#### **Geocoding API (External - geocode.maps.co)**

**Purpose**: Convert address string to coordinates

**Request**:
```
GET https://geocode.maps.co/search?q={address}
```

**Response**:
```json
[{
  "lat": "43.7384",
  "lon": "7.4246",
  "display_name": "Monaco",
  "type": "city"
}]
```

**Error Responses**: Empty array if location not found

**Free Tier**: 1 million requests/month (no API key required for basic use)

### External Services Integration

#### **OpenFreeMap Tile Service**

**Protocol**: HTTPS tile requests
**Authentication**: None required (public tiles)

**Endpoints**:
- Tile URL pattern: `https://tiles.openfreemap.org/planet/{z}/{x}/{y}.png`

**Integration with Leaflet**:
```typescript
L.tileLayer('https://tiles.openfreemap.org/planet/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);
```

**Rate Limiting**: No strict limits for reasonable use
**Error Handling**: Fall back to showing address text if tiles fail to load
**Timeout Configuration**: 10 seconds for map initialization

#### **geocode.maps.co Geocoding Service**

**Protocol**: HTTPS REST API
**Authentication**: None required for free tier (optional API key for higher limits)

**Endpoints**:
- Forward Search: `https://geocode.maps.co/search?q={query}`

**Rate Limiting**: 1 million requests/month free tier (generous, no per-second limit)
**Error Handling**: Show error message if geocoding fails, allow user retry
**Timeout Configuration**: 5 seconds

---

## Implementation Patterns

### Design Patterns

**Primary Patterns**:
- **Component Composition**: Build LocationSearchFilter from smaller UI components
- **Custom Hooks**: useLocationFilter for reusable location filtering logic
- **Pure Functions**: Distance calculation has no side effects, easily testable

**Pattern Selection Rationale**: Simple, testable patterns that work well with React and Next.js static generation

### Code Organization

```
app/
├── vendors/
│   ├── page.tsx (enhanced with location search)
│   └── [slug]/
│       └── page.tsx (enhanced with map)
├── partners/
│   └── page.tsx (enhanced with location search)
components/
├── ui/ (shadcn components)
│   ├── input.tsx
│   ├── select.tsx
│   ├── button.tsx
│   └── card.tsx
├── vendor/
│   ├── VendorLocationMap.tsx (NEW)
│   └── LocationSearchFilter.tsx (NEW)
lib/
├── utils/
│   └── distance.ts (NEW - Haversine formula)
├── hooks/
│   └── useLocationFilter.ts (NEW)
├── types.ts (extend Vendor interface)
payload/
└── collections/
    └── Vendors.ts (add location fields)
```

**File Organization Guidelines**:
- **Component files**: One component per file, co-locate styles if needed
- **Utility files**: Pure functions in lib/utils/
- **Hook files**: Custom hooks in lib/hooks/
- **Type files**: Extend existing types.ts with location interfaces

### Naming Conventions

**Components**: PascalCase (VendorLocationMap, LocationSearchFilter)
**Utilities**: camelCase (calculateDistance, geocodeAddress)
**Hooks**: camelCase with 'use' prefix (useLocationFilter)
**Types/Interfaces**: PascalCase (VendorLocation, LocationSearchParams)
**Constants**: UPPER_SNAKE_CASE (DEFAULT_MAP_ZOOM, RADIUS_OPTIONS)

**Variable Naming**:
- **Functions**: camelCase (geocodeAddress, filterByDistance)
- **Variables**: camelCase (searchLocation, filteredVendors)

### Coding Standards

**Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

**Key Standards**:
- **Indentation**: 2 spaces (never tabs)
- **Line length**: Maximum 100 characters
- **Comments**: Explain "why" not "what"
- **Error handling**: Always include proper error handling for geocoding and map loading
- **Type safety**: Use TypeScript for type safety, define all interfaces

**Quality Requirements**:
- **Test coverage**: Minimum 80% coverage for distance calculation and filtering logic
- **Documentation**: Document VendorLocationMap props and usage
- **Performance**: Debounce geocoding requests, memoize distance calculations
- **Security**: Validate coordinates server-side during vendor data entry

---

## Performance Criteria

### Response Time Requirements

**Target Response Time**:
- Map rendering: < 2 seconds
- Location search (geocoding + filtering): < 1 second
- Page load with map: < 3 seconds

**Measurement Points**:
- Time to interactive for map
- Geocoding API response time
- Distance calculation and filtering time

**Optimization Strategies**:
- Lazy load map component
- Memoize distance calculations
- Debounce geocoding requests

### Throughput Requirements

**Target Throughput**: Handle 100 concurrent users viewing vendor pages with maps
**Load Testing Scenarios**: N/A (static site, no backend load)
**Scalability Requirements**: Static generation scales horizontally with CDN

### Concurrency Requirements

**Concurrent Users**: No backend concurrency concerns (static site)
**Resource Management**: Limit geocoding API requests with debouncing
**Bottleneck Prevention**: Use CDN for tile serving, cache geocoding results in session storage

---

## Security Requirements

### Authentication Requirements

**Authentication Method**: None required (public vendor information)
**Token Management**: N/A
**Session Handling**: N/A

### Authorization Requirements

**Authorization Model**: Public access to all vendor location data
**Permission Validation**: N/A
**Access Control**: Vendor location editing restricted to Payload CMS admin users

### Data Protection

**Encryption Standard**: HTTPS for all API requests
**Data at Rest**: SQLite database file permissions (OS-level)
**Data in Transit**: HTTPS for geocoding API and map tiles
**Sensitive Data Handling**: Location data is public, no PII concerns

### Input Validation

**Validation Approach**:
- Client-side: Validate address format, radius selection
- Server-side: Validate latitude (-90 to 90) and longitude (-180 to 180) in Payload CMS

**Sanitization Rules**: Sanitize address input to prevent XSS
**Injection Prevention**: Use parameterized queries in Payload CMS (built-in protection)

---

## Quality Validation Requirements

### Technical Depth Validation

**Implementation Readiness**: All components have clear interfaces and dependencies defined
**Technical Accuracy**: Haversine formula and geocoding approach validated
**Completeness Check**: All required functionality specified with implementation details

### Integration Validation

**Compatibility Assessment**: Compatible with existing Next.js App Router and Payload CMS setup
**Dependency Validation**: mapbox-gl, geocoding API dependencies identified
**API Contract Validation**: Vendor data structure extended consistently

### Performance Validation

**Performance Benchmarks**: Map load < 2s, search < 1s measurable and achievable
**Resource Requirements**: Minimal - static site with client-side processing
**Scalability Assessment**: Static generation scales with CDN distribution

### Security Validation

**Security Standards Compliance**: HTTPS for external APIs, input validation
**Vulnerability Assessment**: Potential XSS in address input mitigated with sanitization
**Authentication/Authorization Validation**: N/A for public data

---

## Technical Requirements

- **Mapbox GL JS** v2.x or v3.x for map rendering with OpenFreeMap tiles
- **Geocoding Service**: OpenStreetMap Nominatim (free, no API key) or Mapbox Geocoding API (requires key)
- **Haversine Distance Formula** implemented in TypeScript for client-side distance calculations
- **Payload CMS Schema Migration** to add location fields to vendors collection
- **TypeScript Interfaces** extended to include optional location data on Vendor type
- **Responsive Map Component** that works on mobile and desktop
- **URL Query Parameters** for persistent and shareable location searches

## External Dependencies

- **leaflet** - Lightweight map rendering library
  - **Justification:** 70% smaller than Mapbox GL JS (150KB vs 500KB), simpler API, perfect for basic marker display
  - **Version Requirements:** ^1.9.4

- **react-leaflet** (optional) - React wrapper for Leaflet
  - **Justification:** Provides React components for Leaflet integration (alternative to vanilla Leaflet)
  - **Version Requirements:** ^4.2.1
  - **Note:** Evaluate during implementation - may be simpler to use vanilla Leaflet with useEffect

**Geocoding Implementation**:
- Use fetch() to call geocode.maps.co API directly (no additional library needed)
- Simple input field with button (no autocomplete in v1 for simplicity)

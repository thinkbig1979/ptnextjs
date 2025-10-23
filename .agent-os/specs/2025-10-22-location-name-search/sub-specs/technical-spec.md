# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-22-location-name-search/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: Frontend changes are needed to update the LocationSearchFilter component UI and add location result selection. Backend changes (API route or server action) are needed to proxy Photon API requests to avoid CORS issues and protect against client-side API abuse, though Photon itself doesn't require authentication.

---

## Frontend Implementation

### UI Components

#### **LocationSearchFilter** (Modified)
- **Type**: Card / Form Component
- **Purpose**: Allow users to search for vendors by location name instead of coordinates
- **User Interactions**: Text input for location name, button click to search, dropdown/modal selection for disambiguation
- **State Management**: Local component state for input value, search results, selected location, loading states
- **Location**: `components/LocationSearchFilter.tsx`

#### **LocationResultSelector** (New)
- **Type**: Dropdown / Modal Component
- **Purpose**: Display multiple geocoding results when location name is ambiguous
- **Props**: `results: PhotonFeature[]`, `onSelect: (location: PhotonFeature) => void`, `onCancel: () => void`
- **Events**: `onSelect` when user clicks a location result, `onCancel` to close without selection
- **Location**: `components/location-result-selector.tsx`

### Frontend State Management

**State Management Pattern**: React useState (local component state)

**State Stores Required**:
- **LocationSearchFilter state**: Manages search input, API interaction, and selection
  - State shape:
    ```typescript
    {
      locationInput: string;           // User's text input
      distance: number;                // Radius in km
      error: string | null;            // Error messages
      isSearchActive: boolean;         // Whether search is applied
      isLoading: boolean;              // API call in progress
      searchResults: PhotonFeature[]; // Geocoding results from Photon
      showResultSelector: boolean;     // Show disambiguation UI
      selectedLocation: VendorCoordinates | null; // Selected coords
    }
    ```
  - Actions: `handleLocationSearch`, `handleLocationSelect`, `handleReset`, `setLocationInput`, `setDistance`

### Frontend Routing

**Routes Required**: No new routes - component is embedded in existing `/vendors` page

**Route Guards**: None required (public page)

### User Interface Specifications

**Design Requirements**:
- **Responsive Breakpoints**:
  - Mobile (<640px): Full-width input, stacked buttons
  - Tablet (640-1024px): Standard card layout
  - Desktop (≥1024px): Standard card layout with side-by-side buttons
- **Accessibility**: WCAG 2.1 AA compliance - proper labels, ARIA attributes, keyboard navigation for result selection
- **Loading States**: Show spinner icon in search button during API call, disable button during loading
- **Error States**: Display error alert with AlertCircle icon for API failures, validation errors, or empty results
- **Empty States**: Show helpful message "No locations found. Try a different search term." when Photon returns empty array

**Form Validations**:
- **locationInput**: Required, minimum 2 characters, trim whitespace
- **distance**: Required, between 16-800 km (existing validation preserved)

### Component Architecture

**UI Component Strategy**: shadcn/ui component library

**Component Library**: shadcn/ui (already in project)

**Library Components to Use**:
- **Card** (`@/components/ui/card`): Container for location search form
  - Usage: Wraps entire location search interface
  - Sub-components: CardHeader, CardTitle, CardDescription, CardContent

- **Input** (`@/components/ui/input`): Text input for location name
  - Usage: Captures user's location search query
  - Props: value, onChange, placeholder, disabled

- **Button** (`@/components/ui/button`): Search, Reset, and Advanced Options buttons
  - Usage: Trigger search, reset filters, toggle coordinate input
  - Variants: default (search), outline (reset), ghost (advanced)
  - Props: onClick, disabled, variant

- **Slider** (`@/components/ui/slider`): Distance radius control (existing)
  - Usage: Set search radius in kilometers
  - Props: min, max, step, value, onValueChange

- **Label** (`@/components/ui/label`): Form labels for accessibility
  - Usage: Label input fields and slider
  - Props: htmlFor

- **Dialog** (`@/components/ui/dialog`): Location result selector modal
  - Usage: Display multiple location options for user selection
  - Sub-components: DialogContent, DialogHeader, DialogTitle, DialogDescription
  - Props: open, onOpenChange

- **ScrollArea** (`@/components/ui/scroll-area`): Scrollable result list
  - Usage: Show list of locations when results exceed viewport
  - Props: className

- **Collapsible** (`@/components/ui/collapsible`): Advanced options section
  - Usage: Hide/show coordinate input option for advanced users
  - Sub-components: CollapsibleTrigger, CollapsibleContent
  - Props: open, onOpenChange

**Custom Components** (built on library):
- **LocationResultItem**: Displays single location result with name, city, region, country
  - Built from: Button (variant="ghost") + MapPin icon + text formatting
  - Purpose: Selectable location option in result selector
  - Props: `result: PhotonFeature`, `onClick: () => void`, `isSelected: boolean`

### Page Layout Architecture

**Layout Approach**: Existing vendors page layout preserved

**Component Integration**: LocationSearchFilter remains in same position on vendors page, integrated into VendorsClient component

**Layout Pattern**: Card-based filter UI above vendor grid

### Navigation Architecture

**Navigation Pattern**: No navigation changes - component embedded in existing page

**Navigation Implementation**: None required

### User Flow & Interaction Patterns

**Primary User Flows**:

#### Flow 1: Simple Location Search (Single Result)
1. **Starting Point**: User on `/vendors` page viewing all vendors
2. **Trigger**: Click into location search input field (Input component)
3. **Action**: Type "Monaco" or "Miami"
4. **Page/Component Loads**: Input updates reactively as user types
5. **User Interaction**: Click "Search" button (Button component, primary variant)
   - Loading state: Button shows spinner, text changes to "Searching..."
6. **Submit/Complete**: API call to `/api/geocode?q=Monaco&limit=5`
7. **Success Path**:
   - Single result returned from Photon API
   - Automatically apply coordinates to vendor filter
   - Notification: Toast/Alert showing "Location set to Monaco"
   - UI update: Vendor list filters to show only vendors within distance radius, sorted by proximity
   - Distance badges appear on vendor cards
8. **Error Path**:
   - API error: Show error alert "Unable to search location. Please try again."
   - Empty results: Show info alert "Location not found. Try a different name."
   - Form state: Input value preserved
   - Recovery action: User can edit search and retry

#### Flow 2: Ambiguous Location Search (Multiple Results)
1. **Starting Point**: User on `/vendors` page
2. **Trigger**: Enter "Paris" in search input
3. **Action**: Click "Search" button
4. **API Call**: `/api/geocode?q=Paris&limit=5`
5. **Success Path (Multiple Results)**:
   - Dialog/Modal opens (Dialog component from shadcn/ui)
   - Displays list in ScrollArea showing:
     - "Paris, Île-de-France, France"
     - "Paris, Texas, United States"
     - "Paris, Ontario, Canada"
   - Each result is a LocationResultItem button
6. **User Interaction**: Click intended location
7. **Navigation**: Dialog closes automatically
8. **UI Update**:
   - Notification shows "Location set to Paris, France"
   - Vendor list filters by selected location's coordinates
   - Result count updates
9. **Error Path**:
   - User clicks outside dialog: Dialog closes, search canceled, no filter applied
   - User clicks "Cancel" button: Same as above

#### Flow 3: Advanced Coordinate Input (Fallback)
1. **Starting Point**: User on `/vendors` page
2. **Trigger**: Click "Advanced Options" button (Collapsible trigger)
3. **Action**: Collapsible section expands
4. **Page/Component Loads**: Shows two Input fields for latitude and longitude
5. **User Interaction**: Enter coordinates "43.7384, 7.4246"
6. **Submit/Complete**: Click "Search by Coordinates" button
7. **Success Path**:
   - No API call needed - direct coordinate validation
   - Notification: "Location set to coordinates"
   - UI update: Vendor filter applies immediately
8. **Error Path**:
   - Invalid format: Show inline error "Please enter: latitude, longitude"
   - Out of range: Show inline error "Latitude must be between -90 and 90"
   - Form state: Preserved for editing
   - Recovery action: Correct format and retry

#### Flow 4: Regional/Postal Code Search
1. **Starting Point**: User on `/vendors` page
2. **Trigger**: Enter "California" or "90210" in search
3. **Action**: Click "Search"
4. **API Call**: `/api/geocode?q=California&layer=state` or `/api/geocode?q=90210`
5. **Page/Component Loads**: Loading spinner on button
6. **Success Path**:
   - For region: May return multiple results (California, USA vs California, Colombia)
   - For postal code: Usually single result
   - Dialog shows results if multiple
   - Filter applies after selection
7. **Error Path**: Same as Flow 1 error handling

**Component Interaction Patterns**:

- **Master-Detail Pattern**:
  - LocationSearchFilter (master) manages search state
  - User action: Click "Search"
  - LocationResultSelector (detail) displays when multiple results
  - State management: Parent manages `showResultSelector` boolean
  - Data flow: LocationSearchFilter → searchResults state → LocationResultSelector receives as props

- **Conditional Rendering Pattern**:
  - Collapsible component for advanced coordinate input
  - Only renders when user explicitly requests via "Advanced Options"
  - State: `showAdvancedOptions: boolean`

**Form Submission Pattern** (standardized):
1. User fills location search field (Input component)
2. Client-side validation: Check minimum 2 characters
3. Submit button: Shows loading spinner, disabled during API call
4. API call: POST/GET `/api/geocode` with query parameter
5. Success: Toast notification + update vendor filter via `onSearch` callback
6. Error: Inline error alert below input + form state preserved

### Component Integration Map

**How Components Work Together**:

#### Location Search Integration Flow
```
User Action: Types "Paris" and clicks Search
↓
LocationSearchFilter (manages all search state)
↓
Makes API call: fetch('/api/geocode?q=Paris')
↓
Receives multiple results (3+ locations)
↓
Sets showResultSelector = true
↓
LocationResultSelector renders in Dialog
  ↓ receives searchResults as props
  Displays:
    ├→ LocationResultItem (Paris, France)
    ├→ LocationResultItem (Paris, Texas)
    └→ LocationResultItem (Paris, Ontario)
↓
User clicks "Paris, France" LocationResultItem
↓
onSelect callback fires with selected feature
↓
LocationSearchFilter extracts coordinates
↓
Calls parent onSearch(coordinates, distance)
↓
VendorsClient receives coordinates via useLocationFilter hook
↓
Vendors filtered and sorted by distance
```

#### Component Communication Patterns

**Page → Container → Presentational Pattern**:
```
VendorsClient (page component - manages vendor data)
  ↓ passes onSearch callback prop
LocationSearchFilter (container - manages search state, API calls)
  ↓ passes results and callbacks
LocationResultSelector (presentational - displays options)
  ↑ emits onSelect when user chooses location
LocationSearchFilter (handles selection, extracts coordinates)
  ↑ calls onSearch callback with coordinates
VendorsClient (updates filtered vendor list)
```

**State Flow Between Components**:
- **Global State**: None required (no Redux/Zustand needed)

- **Shared Component State** (props drilling):
  - `VendorsClient` manages `userLocation` and `maxDistance`
  - Passes `onSearch` callback to `LocationSearchFilter`
  - `LocationSearchFilter` passes `searchResults` to `LocationResultSelector`

- **API Data Flow**:
  - Fetched in: LocationSearchFilter component
  - Cached with: Browser fetch cache (default behavior)
  - Shared via: Callback prop to parent component

---

## Backend Implementation

### API Endpoints

#### **GET /api/geocode**

**Purpose**: Proxy requests to Photon API to avoid CORS and add rate limiting

**Authentication**: Public (no authentication required)
**Authorization**: None (rate limiting via IP address)

**Request**:
```typescript
interface QueryParams {
  q: string;                    // Search query (required)
  limit?: number;               // Max results (default 5, max 10)
  lang?: string;                // Language code (default 'en')
  lat?: number;                 // Bias latitude (optional)
  lon?: number;                 // Bias longitude (optional)
  layer?: string;               // Location type filter (optional)
}
```

**Response**:
```typescript
interface SuccessResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

interface PhotonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name: string;
    country: string;
    countrycode: string;
    city?: string;
    state?: string;
    postcode?: string;
    osm_type: 'N' | 'W' | 'R';
    osm_key: string;
    osm_value: string;
    extent?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**Status Codes**:
- 200: Success
- 400: Validation error (missing query parameter, invalid format)
- 429: Rate limit exceeded
- 500: Photon API error or server error
- 503: Photon service unavailable

### Business Logic

**Core Business Rules**:
1. All geocoding requests must be proxied through our API to prevent CORS issues and enable rate limiting
2. Location search results should be limited to reasonable maximum (10 results) to simplify user selection
3. Default language should be English ('en') unless user's browser language suggests otherwise
4. Search query must be at least 2 characters to prevent spam and excessive API usage

**Validation Requirements**:
- **Server-side**:
  - Query parameter `q` is required and minimum 2 characters
  - `limit` parameter must be between 1-10
  - Optional `lat`/`lon` must be valid coordinate ranges if provided
- **Data Integrity**: None required (read-only API)
- **Business Constraints**: Rate limiting per IP address (10 requests per minute suggested)

**Service Layer Architecture**:
- **PhotonGeocodingService**: Wrapper for Photon API interactions
  - Methods: `geocodeLocation(query, options)`, `parsePhotonResponse(data)`
  - Dependencies: fetch API, URL construction utilities

### Database Schema

**No database changes required** - this feature only consumes external API data and does not persist any geocoding information.

---

## Frontend-Backend Integration

### API Contract

**Contract Owner**: Backend provides geocoding proxy endpoint, Frontend consumes

**Type Sharing Strategy**:
- Manual TypeScript type definitions in `lib/types.ts`
- Types defined: `PhotonFeature`, `PhotonResponse`, `GeocodeQueryParams`

**Data Flow**:
1. User enters location name in Frontend →
2. Frontend calls `/api/geocode?q={query}&limit=5` →
3. Backend proxies request to `https://photon.komoot.io/api?q={query}&limit=5` →
4. Backend receives Photon response and forwards to Frontend →
5. Frontend extracts coordinates from selected feature and updates vendor filter

### Integration Points

**Frontend Calls Backend For**:
- **Location name search** → `GET /api/geocode?q={locationName}&limit=5`
- **Regional search** → `GET /api/geocode?q={regionName}&layer=state&limit=5`
- **Postal code search** → `GET /api/geocode?q={postalCode}&limit=5`

**Error Handling Strategy**:
- **Network Errors**: Show user-friendly message "Unable to connect. Check your internet connection." with retry option
- **Validation Errors**: Display inline error messages below input field (e.g., "Enter at least 2 characters")
- **Empty Results**: Show info alert "No locations found for '{query}'. Try a different search term."
- **Rate Limit Errors**: Display "Too many searches. Please wait a moment and try again."

### Testing Strategy

**Frontend Tests**:
- Unit tests for LocationSearchFilter component (search, selection, validation)
- Unit tests for LocationResultSelector component (display, selection, cancellation)
- Mock Photon API responses with MSW (Mock Service Worker)

**Backend Tests**:
- Unit tests for geocoding API route handler
- Integration tests for Photon API proxy with real API calls (in staging only)
- Error handling tests for API failures and validation errors

**E2E Tests** (Playwright):
- Full user workflow: Enter "Monaco", click search, verify vendor filter applied
- Ambiguous location workflow: Enter "Paris", select "Paris, France" from dialog, verify filter
- Error scenario: Enter invalid location, verify error message displayed
- Reset workflow: Apply location filter, click reset, verify all vendors shown again
- Advanced coordinate input: Toggle advanced options, enter coordinates, verify filter applied

---

## Implementation Architecture

### Component Structure

#### **LocationSearchFilter Component** (Modified)

- **Responsibilities**:
  - Manage location search input and API interaction
  - Handle geocoding API calls via `/api/geocode`
  - Display search results and manage result selection flow
  - Coordinate with parent component (VendorsClient) via `onSearch` callback
- **Implementation approach**:
  - Convert existing coordinate parsing to location name geocoding
  - Add state for `searchResults`, `showResultSelector`, `isLoading`
  - Implement `handleLocationSearch` to call geocoding API
  - Add conditional rendering of LocationResultSelector component
- **Dependencies**:
  - `@/components/location-result-selector` (new)
  - `@/lib/types` (PhotonFeature types)
  - shadcn/ui components (Dialog, Button, Input, Collapsible)
- **Interface contracts**:
  ```typescript
  interface LocationSearchFilterProps {
    onSearch: (userLocation: VendorCoordinates, distance: number) => void;
    onReset: () => void;
    resultCount?: number;
    totalCount?: number;
    className?: string;
  }
  ```

#### **LocationResultSelector Component** (New)

- **Responsibilities**:
  - Display list of geocoding results in user-friendly format
  - Allow user to select specific location from multiple options
  - Show location context (city, region, country) for disambiguation
  - Handle selection and cancellation events
- **Implementation approach**:
  - Render Dialog component with ScrollArea for result list
  - Map over `results` array to create LocationResultItem components
  - Emit `onSelect` callback with selected PhotonFeature
  - Close dialog on selection or cancel
- **Dependencies**:
  - shadcn/ui Dialog, ScrollArea, Button
  - lucide-react icons (MapPin)
  - `@/lib/types` (PhotonFeature)
- **Interface contracts**:
  ```typescript
  interface LocationResultSelectorProps {
    results: PhotonFeature[];
    isOpen: boolean;
    onSelect: (location: PhotonFeature) => void;
    onCancel: () => void;
  }
  ```

#### **Geocoding API Route** (New)

- **Responsibilities**:
  - Proxy requests to Photon API at https://photon.komoot.io
  - Add rate limiting to prevent API abuse
  - Transform and validate query parameters
  - Handle Photon API errors and return standardized responses
- **Implementation approach**:
  - Create Next.js API route at `app/api/geocode/route.ts`
  - Use `fetch` to call Photon API with validated parameters
  - Implement simple in-memory rate limiting with Map<IP, timestamp[]>
  - Return standardized JSON responses with error handling
- **Dependencies**:
  - Next.js Request/Response (NextRequest, NextResponse)
  - Node.js built-in URL module for query parsing
- **Interface contracts**:
  ```typescript
  // GET /api/geocode?q={query}&limit={number}
  export async function GET(request: NextRequest): Promise<NextResponse>
  ```

### Data Flow

1. **User Input → Component State**: User types location name → `locationInput` state updates →
2. **Component State → API Call**: User clicks Search → `handleLocationSearch` validates input → API call to `/api/geocode?q={input}` →
3. **API Response → Component State**: Geocoding results received → stored in `searchResults` state → conditional UI rendering based on result count

**Flow Details**:
- **User Input → Component State**: React controlled input component with `onChange` handler updates `locationInput` state in real-time, enabling Submit button when input length ≥ 2 characters
- **Component State → API Call**: `handleLocationSearch` async function validates input, sets `isLoading=true`, constructs API URL with query parameters, makes fetch request with error handling, updates state based on response
- **API Response → Component State**: If 0 results, show error alert; if 1 result, auto-apply coordinates; if 2+ results, show LocationResultSelector dialog with results array

### State Management

**State Management Pattern**: React useState hooks (local component state)
**Implementation Details**: No global state management needed - all location search state is local to LocationSearchFilter component

**State Stores**:
- **LocationSearchFilter state**:
  ```typescript
  {
    locationInput: string;
    distance: number;
    error: string | null;
    isSearchActive: boolean;
    isLoading: boolean;
    searchResults: PhotonFeature[];
    showResultSelector: boolean;
    selectedLocation: VendorCoordinates | null;
    showAdvancedOptions: boolean; // For coordinate fallback UI
  }
  ```

### Error Handling

**Error Handling Strategy**: Try-catch blocks for API calls with user-friendly error messages

**Error Scenarios**:
- **Network failure**: Catch fetch error → display "Unable to connect to location service" alert → preserve form state → enable retry
- **Empty results**: Photon returns empty features array → display "Location not found. Try different search terms" info message → clear loading state → allow user to edit search
- **API error (500/503)**: Photon API down or error → display "Location search temporarily unavailable" alert → log error to console → enable retry after delay

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "GEOCODING_FAILED",
    "message": "Unable to geocode location",
    "details": "Photon API returned error 503",
    "timestamp": "2025-10-22T10:30:00Z"
  }
}
```

## Integration Points

### Existing Code Dependencies

#### **VendorsClient Component Integration**

- **Purpose**: Parent component that manages vendor filtering and displays location search filter
- **Interface requirements**:
  - Receives `onSearch` callback from VendorsClient
  - Must call `onSearch(coordinates, distance)` when location is selected
  - Must preserve existing distance slider functionality
- **Data exchange**:
  - Input: `onSearch` and `onReset` callbacks via props
  - Output: Calls `onSearch` with `VendorCoordinates` object and distance number
- **Error handling**: Errors contained within LocationSearchFilter component, does not propagate to parent

#### **useLocationFilter Hook Integration**

- **Purpose**: Existing hook that filters vendors by distance from coordinates
- **Interface requirements**: Hook expects `VendorCoordinates | null` and `number` (distance)
- **Data exchange**:
  - LocationSearchFilter provides coordinates via `onSearch` callback
  - VendorsClient passes coordinates to `useLocationFilter` hook
  - Hook returns filtered vendor list with distance calculations
- **Error handling**: Hook handles invalid coordinates gracefully by returning unfiltered list

### API Contracts

#### **GET /api/geocode**

**Purpose**: Geocode location names to coordinates using Photon API

**Request Structure**:
```json
{
  "query_params": {
    "q": "Monaco",
    "limit": 5,
    "lang": "en"
  }
}
```

**Response Structure**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [7.4246, 43.7384]
      },
      "properties": {
        "name": "Monaco",
        "country": "Monaco",
        "countrycode": "MC",
        "osm_type": "R",
        "osm_key": "place",
        "osm_value": "city"
      }
    }
  ]
}
```

**Error Responses**:
- 400: `{"success": false, "error": {"code": "INVALID_QUERY", "message": "Query parameter required"}}`
- 429: `{"success": false, "error": {"code": "RATE_LIMIT", "message": "Too many requests"}}`
- 500: `{"success": false, "error": {"code": "SERVER_ERROR", "message": "Internal server error"}}`

### Database Interactions

**No database interactions required** - this feature only consumes external API data without persistence.

### External Services Integration

#### **Photon Geocoding API Integration**

**Protocol**: HTTPS REST API
**Authentication**: None (public API)

**Endpoints**:
- **Forward Geocoding**: `GET https://photon.komoot.io/api`
  - Parameters: `q` (query), `limit` (max results), `lang` (language), `layer` (location type filter)
  - Returns: GeoJSON FeatureCollection with location results

**Rate Limiting**:
- Public API encourages "reasonable" usage
- Recommend implementing client-side rate limiting: 10 requests/minute per IP
- For production, consider self-hosting Photon instance if usage is high

**Error Handling**:
- Timeout: Set 5-second timeout on fetch requests
- Retry logic: Single retry with exponential backoff for 5xx errors
- Fallback: Display error message and allow coordinate input fallback

**Timeout Configuration**:
- Request timeout: 5000ms
- Keep-alive timeout: Not applicable (stateless HTTP requests)

## Implementation Patterns

### Design Patterns

**Primary Patterns**:
- **Proxy Pattern**: API route proxies requests to external Photon API to handle CORS and add rate limiting layer
- **Adapter Pattern**: Transform Photon API GeoJSON response format to simpler VendorCoordinates format consumed by existing vendor filtering logic

**Pattern Selection Rationale**: Proxy pattern prevents exposing external API directly to client, enables request monitoring and rate limiting. Adapter pattern decouples Photon-specific response structure from application's coordinate model, allowing future geocoding service changes without modifying vendor filtering code.

### Code Organization

```
ptnextjs/
├── app/
│   └── api/
│       └── geocode/
│           └── route.ts                          # Photon API proxy endpoint
├── components/
│   ├── LocationSearchFilter.tsx                  # Modified: Add name-based search
│   ├── location-result-selector.tsx              # New: Result disambiguation UI
│   └── ui/                                       # shadcn/ui components
│       ├── dialog.tsx
│       ├── collapsible.tsx
│       └── scroll-area.tsx
├── hooks/
│   └── useLocationFilter.ts                      # Existing: No changes needed
├── lib/
│   ├── types.ts                                  # Add PhotonFeature interfaces
│   └── geocoding-utils.ts                        # New: Helper functions
└── tests/
    ├── components/
    │   └── location-search-filter.test.tsx       # Updated tests
    └── e2e/
        └── location-search.spec.ts               # New E2E tests
```

**File Organization Guidelines**:
- **Component files**: Components in `/components`, one component per file, co-locate tests
- **Service files**: API routes in `/app/api/*`, utility functions in `/lib/*`
- **Utility files**: Geocoding-specific helpers in `/lib/geocoding-utils.ts`
- **Test files**: Component tests in `/__tests__/components`, E2E in `/tests/e2e`

### Naming Conventions

**Components**: PascalCase for React components (LocationSearchFilter, LocationResultSelector)
**Services**: camelCase for functions (geocodeLocation, parsePhotonResponse)
**Utilities**: camelCase for utility functions (extractCoordinates, formatLocationName)
**Types/Interfaces**: PascalCase for types (PhotonFeature, GeocodeQueryParams, LocationSearchState)
**Constants**: SCREAMING_SNAKE_CASE for constants (DEFAULT_RESULT_LIMIT, PHOTON_API_BASE_URL)

**Variable Naming**:
- **Functions**: camelCase with verb prefix (handleSearch, validateInput, fetchLocations)
- **Variables**: camelCase descriptive names (locationInput, searchResults, isLoading)
- **Class methods**: camelCase instance methods (N/A - functional components only)

### Coding Standards

**Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

**Key Standards**:
- **Indentation**: 2 spaces (never tabs) - matches existing project style
- **Line length**: Maximum 100 characters where practical
- **Comments**: Explain "why" not "what" - document complex logic and business rules
- **Error handling**: Always include try-catch for async operations, provide user-friendly messages
- **Type safety**: Use TypeScript strict mode, define interfaces for all API responses

**Quality Requirements**:
- **Test coverage**: Minimum 80% coverage for new code (LocationSearchFilter, API route)
- **Documentation**: JSDoc comments for exported functions and components
- **Performance**: API calls should complete within 5 seconds, show loading indicators
- **Security**: Validate all user inputs, implement rate limiting on API endpoint

## Performance Criteria

### Response Time Requirements

**Target Response Time**:
- Location search API call: < 2 seconds (P95)
- UI interaction (button click to loading state): < 100ms
- Result selection to vendor filter update: < 200ms

**Measurement Points**:
- Measure from button click to API response received
- Measure from API response to UI update complete

**Optimization Strategies**:
- Debounce API calls if auto-complete added in future (not in current scope)
- Cache recent geocoding results in session storage (optional enhancement)
- Limit result count to 5-10 to reduce response payload size

### Throughput Requirements

**Target Throughput**: Support 10 concurrent location searches without degradation

**Load Testing Scenarios**:
- 10 users simultaneously searching different locations
- 5 users searching same popular location (e.g., "Paris")

**Scalability Requirements**: API route should handle 100 requests/minute across all users (with rate limiting per IP)

### Concurrency Requirements

**Concurrent Users**: Support 50 concurrent users on vendors page with location search active

**Resource Management**:
- Use AbortController to cancel previous search if user initiates new search
- Clean up event listeners and cancel pending requests on component unmount

**Bottleneck Prevention**:
- Rate limit API endpoint to prevent Photon API abuse
- Implement request queueing if rate limit exceeded (show user message)

## Security Requirements

### Authentication Requirements

**Authentication Method**: None required (public feature)
**Token Management**: N/A
**Session Handling**: N/A

### Authorization Requirements

**Authorization Model**: None (public endpoint)
**Permission Validation**: N/A
**Access Control**: Rate limiting by IP address only

### Data Protection

**Encryption Standard**: TLS 1.2+ for all API requests (enforced by Next.js/Vercel)
**Data at Rest**: No data persistence required
**Data in Transit**: All requests to Photon API over HTTPS
**Sensitive Data Handling**: No sensitive data involved (location names are public information)

### Input Validation

**Validation Approach**:
- Client-side: Basic validation (minimum length, character whitelist)
- Server-side: Strict validation on API route (sanitize query, validate parameters)

**Sanitization Rules**:
- Remove leading/trailing whitespace
- Allow alphanumeric, spaces, commas, hyphens only
- Maximum query length: 100 characters
- Encode query parameters properly for URL construction

**Injection Prevention**:
- Use URL.searchParams for query parameter construction (automatic encoding)
- Validate all user inputs before passing to fetch
- Do not interpolate user input directly into API URLs

## Quality Validation Requirements

### Technical Depth Validation

**Implementation Readiness**: All component interfaces defined with TypeScript, API endpoint structure specified, data flow documented with examples
**Technical Accuracy**: Photon API documentation verified, coordinate transformation tested, existing vendor filter integration confirmed
**Completeness Check**: UI component hierarchy defined, state management specified, error handling scenarios covered, testing strategy documented

### Integration Validation

**Compatibility Assessment**:
- Compatible with existing VendorsClient component (props unchanged)
- Compatible with existing useLocationFilter hook (coordinate format unchanged)
- Compatible with current shadcn/ui component library versions

**Dependency Validation**:
- External: Photon API (public, no authentication)
- Internal: VendorsClient, useLocationFilter, shadcn/ui Dialog/Input/Button
- New: LocationResultSelector component (clearly defined interface)

**API Contract Validation**:
- Request/response structures defined with TypeScript interfaces
- Error response format standardized
- Query parameter validation rules specified

### Performance Validation

**Performance Benchmarks**:
- API response time < 2s (P95) - measurable via browser Network tab
- UI interaction < 100ms - measurable via React DevTools Profiler
- Vendor filter update < 200ms - measurable via console.time/timeEnd

**Resource Requirements**:
- Memory: Minimal increase (search results array typically < 50KB)
- Network: ~5KB per geocoding request
- CPU: Negligible (coordinate calculations are lightweight)

**Scalability Assessment**:
- Can handle 100 req/min with rate limiting
- No database queries or heavy computations
- Stateless API route scales horizontally

### Security Validation

**Security Standards Compliance**:
- HTTPS enforced for all external API calls
- Input validation on both client and server
- Rate limiting prevents abuse

**Vulnerability Assessment**:
- No SQL injection risk (no database queries)
- No XSS risk (React escapes rendered content)
- No CSRF risk (GET endpoint, no state mutation)

**Authentication/Authorization Validation**: N/A (public endpoint, no auth required)

## Technical Requirements

- Next.js 14 with App Router (existing)
- React 18 for component implementation (existing)
- TypeScript for type safety (existing)
- shadcn/ui component library (existing - Dialog, Collapsible, ScrollArea components)
- Photon Geocoding API (external, free, public) at https://photon.komoot.io
- fetch API for HTTP requests (built-in)
- Playwright for E2E testing (existing)

## External Dependencies

**None required** - all necessary libraries and APIs are already in the project or are free public services.

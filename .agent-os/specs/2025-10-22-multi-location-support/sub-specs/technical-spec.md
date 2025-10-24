# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-22-multi-location-support/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: This feature requires database schema changes (Payload CMS collection), backend API modifications for location-based search with tier filtering, and frontend UI for displaying and managing multiple locations with tier-appropriate access controls.

---

## Frontend Implementation

### UI Components

#### **LocationsManagerCard**
- **Type**: Card/Form Component
- **Purpose**: Allow Tier 2+ vendors to view, add, edit, and delete multiple office locations
- **User Interactions**: Add location button, edit location inline, delete location, reorder locations, designate HQ
- **State Management**: Local state for form inputs, API calls to Payload CMS for CRUD operations
- **Routing**: Embedded in `/dashboard/profile` page

#### **LocationFormFields**
- **Type**: Form Group
- **Purpose**: Reusable form fields for address input with geocoding button
- **Props**: `location` (object), `onUpdate` (callback), `isHQ` (boolean), `canEdit` (boolean)
- **Events**: `onGeocode` (fetches lat/long from address), `onChange` (field updates)

#### **LocationsDisplaySection**
- **Type**: Display Card
- **Purpose**: Show all vendor locations on public profile page
- **User Interactions**: View map markers, click location for details, filter by distance
- **State Management**: Fetched location data from API, map state (zoom, center)
- **Routing**: Embedded in `/vendors/[slug]` page

#### **TierUpgradePrompt**
- **Type**: Card with CTA
- **Purpose**: Show free/tier 1 vendors what they're missing and encourage upgrade
- **Props**: `tier` (current tier), `feature` (feature name)
- **Events**: `onUpgrade` (navigate to subscription management)

### Frontend State Management

**State Management Pattern**: React state with SWR for data fetching

**State Stores Required**:
- **VendorProfileState**: Manages vendor profile data including locations array
  - State shape:
    ```typescript
    {
      vendor: Vendor | null;
      locations: VendorLocation[];
      isLoading: boolean;
      error: Error | null;
    }
    ```
  - Actions: `fetchVendorProfile`, `addLocation`, `updateLocation`, `deleteLocation`, `setHQLocation`
  - Computed/Selectors: `hqLocation`, `additionalLocations`, `canManageLocations` (based on tier)

### Frontend Routing

**Routes Required**:
- **/dashboard/profile** - Vendor dashboard profile editor (existing, extended with locations manager)
- **/vendors/[slug]** - Public vendor profile page (existing, extended with locations display)

**Route Guards**: Authentication required for `/dashboard/*` routes, vendor ownership check for profile editing

### User Interface Specifications

**Design Requirements**:
- **Responsive Breakpoints**:
  - Desktop (≥1024px): Side-by-side form and map, multi-column location list
  - Tablet (640-1024px): Stacked form above map, two-column location list
  - Mobile (<640px): Full-width stacked, single-column location list with collapsible map
- **Accessibility**: WCAG 2.1 AA - proper labels, keyboard navigation, screen reader announcements for location changes
- **Loading States**: Skeleton loaders for location list, spinner on geocoding button, map loading placeholder
- **Error States**: Inline validation errors on form fields, toast notifications for API failures, map error fallback
- **Empty States**: "No additional locations" message with add button for tier 2+, upgrade prompt for tier 0/1

**Form Validations**:
- **address**: Required, max 500 characters
- **latitude**: Required, -90 to 90, precision to 6 decimals
- **longitude**: Required, -180 to 180, precision to 6 decimals
- **city**: Required, max 255 characters
- **country**: Required, max 255 characters
- **isHQ**: Only one location can be HQ (radio button logic)

### Component Architecture

**UI Component Strategy**: shadcn/ui with Radix UI primitives

**Component Library**: shadcn/ui (installed)

**Library Components to Use**:
- **Card** (`@/components/ui/card`): Container for locations manager and display sections
  - Usage: Wrap location form, location list items, tier upgrade prompt
  - Variants: default
  - Props: className

- **Button** (`@/components/ui/button`): Action buttons throughout
  - Usage: Add location, save, delete, geocode, upgrade
  - Variants: default, destructive, outline, ghost
  - Props: variant, size, loading, disabled, onClick

- **Input** (`@/components/ui/input`): Text input fields
  - Usage: Address, city, country, lat/long fields
  - Props: type, placeholder, value, onChange, error

- **Label** (`@/components/ui/label`): Form field labels
  - Usage: All form fields
  - Props: htmlFor, children

- **Badge** (`@/components/ui/badge`): Status indicators
  - Usage: "HQ" badge on headquarters location, tier badges
  - Variants: default, secondary, destructive, outline
  - Props: variant, children

- **Dialog** (`@/components/ui/dialog`): Modal dialogs
  - Usage: Delete location confirmation, edit location modal on mobile
  - Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
  - Props: open, onOpenChange

- **Separator** (`@/components/ui/separator`): Visual dividers
  - Usage: Between location list items
  - Props: orientation

- **Alert** (`@/components/ui/alert`): Notification banners
  - Usage: Tier restriction messages, geocoding errors
  - Variants: default, destructive
  - Sub-components: AlertTitle, AlertDescription
  - Props: variant, children

**Custom Components** (built on library):
- **GeocodingButton**: Combines Button with geocoding API integration
  - Built from: Button, Loading spinner from lucide-react
  - Purpose: Fetch lat/long from address using **Photon API via `/api/geocode` backend proxy** (reuses existing location-name-search infrastructure)
  - Props: address (string), onCoordinates (callback with {lat, lng})
  - API Integration: Calls existing `/api/geocode?q={address}` endpoint from location-name-search feature

- **LocationMapPreview**: Interactive map component
  - Built from: Third-party map library (react-leaflet or mapbox-gl)
  - Purpose: Display all vendor locations on map with markers
  - Props: locations (VendorLocation[]), center ({lat, lng}), zoom (number), onMarkerClick (callback)

- **TierGate**: Conditional rendering wrapper
  - Built from: Custom React component
  - Purpose: Show/hide content based on vendor tier with upgrade prompts
  - Props: requiredTier ('tier1' | 'tier2'), currentTier (string), fallback (ReactNode)

### Page Layout Architecture

**Layout Approach**: Next.js App Router with shadcn/ui layout primitives

**Global Layout Structure**:
```
┌─────────────────────────────────────┐
│  Header (h-16)                       │
│  - Logo, Navigation, User Menu       │
├──────┬──────────────────────────────┤
│      │                              │
│ Nav  │  Main Content Area           │
│ Bar  │  (Dashboard or Public Pages) │
│      │                              │
└──────┴──────────────────────────────┘
```

**Layout Implementation**:
- Using: Custom CSS Grid for page structure, Flexbox for components
- Grid configuration:
  - Desktop: `grid-cols-[240px_1fr]` (sidebar + content)
  - Mobile: `grid-cols-1` (stacked)
- Breakpoints: 640px (mobile/tablet), 1024px (tablet/desktop)

**Page-Specific Layouts**:

#### Dashboard Profile Layout
- **Layout Pattern**: Form Centered with Sidebar
- **Structure**:
  ```
  ┌────────────────────────────────────────┐
  │ Breadcrumbs: Dashboard > Profile       │
  ├────────────────┬───────────────────────┤
  │                │                       │
  │  Form Sections │  Preview/Help Sidebar │
  │  - Basic Info  │  - Current Tier Badge │
  │  - Locations   │  - Feature Access     │
  │  - Contact     │  - Upgrade CTA        │
  │                │                       │
  └────────────────┴───────────────────────┘
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Two-column grid, sidebar fixed on right
  - Tablet (640-1024px): Sidebar below form, full width
  - Mobile (<640px): Single column stack, sidebar collapsed by default

#### Vendor Public Profile Layout
- **Layout Pattern**: Detail Page with Hero
- **Structure**:
  ```
  ┌─────────────────────────────────────┐
  │ Hero Section (Logo, Name, HQ)       │
  ├─────────────────────────────────────┤
  │ Tabs Navigation (About, Locations,  │
  │                  Products, Reviews)  │
  ├─────────────────────────────────────┤
  │ Tab Content Area                     │
  │ - Locations Tab: Map + Location List│
  └─────────────────────────────────────┘
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Map side-by-side with location list
  - Tablet (640-1024px): Map above location list, 2-column list
  - Mobile (<640px): Map above location list, single-column list

**Component Hierarchy** (page structure):
```
DashboardProfilePage
├── DashboardHeader
│   └── Breadcrumbs
├── MainContentContainer
│   ├── ProfileFormSections
│   │   ├── BasicInfoSection
│   │   ├── LocationsManagerCard (tier 2+)
│   │   │   ├── HQLocationDisplay
│   │   │   ├── AdditionalLocationsList
│   │   │   │   ├── LocationFormFields (per location)
│   │   │   │   └── GeocodingButton
│   │   │   └── AddLocationButton
│   │   └── TierUpgradePrompt (tier 0/1)
│   └── ProfileSidebar
│       ├── TierBadge
│       └── UpgradeCTA
```

```
VendorPublicProfilePage
├── VendorHero
│   ├── CompanyLogo
│   ├── CompanyName
│   └── HQAddressDisplay
├── TabNavigation
│   └── LocationsTab
└── LocationsTabContent
    ├── LocationMapPreview (all locations as markers)
    └── LocationList
        ├── HQLocationCard
        └── AdditionalLocationsCards (tier 2+ only)
```

### Navigation Architecture

**Navigation Pattern**: Hybrid (top nav for public, sidebar for dashboard)

**Navigation Structure**:
```
Public Navigation (Top Bar)
├── Home (/)
├── Vendors (/vendors)
├── Products (/products)
├── Blog (/blog)
└── User Menu (dropdown)
    ├── Dashboard (/dashboard) [if logged in]
    ├── Profile (/dashboard/profile) [if vendor]
    ├── Settings (/dashboard/settings)
    └── Logout

Dashboard Navigation (Sidebar)
├── Overview (/dashboard)
├── Profile (/dashboard/profile) [EXTENDED WITH LOCATIONS]
├── Products (/dashboard/products)
├── Analytics (/dashboard/analytics)
└── Settings (/dashboard/settings)
```

**Navigation Implementation**:
- **Primary Nav**: shadcn/ui NavigationMenu component for public top nav
- **Mobile Menu**: Sheet component from shadcn/ui (slide-in drawer)
- **Breadcrumbs**: Custom breadcrumb component with ChevronRight separators
- **User Menu**: DropdownMenu component from shadcn/ui

**Navigation Components**:

- **DashboardSidebar**: Sidebar navigation
  - Position: fixed-left
  - Width: 240px desktop, full-width mobile overlay
  - Active state: bg-accent with left border
  - Collapsible: No (desktop), overlay drawer (mobile)
  - Mobile behavior: Sheet overlay with backdrop

- **TopNavBar**: Horizontal navigation bar
  - Layout: Flex layout with logo left, nav center, user menu right
  - Sticky: Yes (sticky top-0)
  - Mobile: Collapse to hamburger menu

- **BreadcrumbsComponent**: Shown on all dashboard pages
  - Pattern: Dashboard > Profile > Locations
  - Implementation: Custom component with Next.js Link

- **UserMenuComponent**: User account dropdown
  - Location: top-right corner
  - Trigger: Avatar click
  - Items: Dashboard, Profile, Settings, Logout

**Navigation State Management**:
- **Active Route Tracking**: usePathname hook from Next.js
- **Mobile Menu State**: Local component state (useState)
- **Breadcrumb Data**: Auto-generated from route pathname

### User Flow & Interaction Patterns

**Primary User Flows**:

#### Flow 1: Tier 2+ Vendor Adding Additional Location
1. **Starting Point**: Dashboard profile page, logged in as Tier 2+ vendor
2. **Trigger**: User scrolls to "Locations" section, clicks "Add Location" button (Button from shadcn/ui, variant: outline, icon: Plus from lucide-react)
3. **Action**: New empty location form appears below existing locations
   - Component: LocationFormFields renders with empty inputs
   - State change: `locations` array in parent state gains new empty object
4. **Page/Component Loads**: LocationFormFields component renders
   - Uses: Input, Label components from shadcn/ui
   - Validation: Zod schema for location fields
   - Loading state: None initially
5. **User Interaction**: User fills in address fields
   - Real-time feedback: Character count on address field, format hints on coordinates
   - Error states: Inline error messages below inputs using Alert component
6. **Geocoding Action**: User clicks "Geocode" button (GeocodingButton component)
   - Loading indicator: Button shows Loader2 icon and "Geocoding..." text
   - API call: POST to geocode.maps.co API
7. **Success Path**:
   - Notification: Toast notification "Coordinates retrieved successfully" (using sonner toast library)
   - UI update: Latitude and longitude fields populate automatically
   - Map update: LocationMapPreview component shows new marker
8. **Error Path**:
   - Error display: Alert component (variant: destructive) below form: "Unable to geocode address. Please enter coordinates manually."
   - Form state: Address preserved, coordinates remain empty
   - Recovery action: User can manually enter lat/long or edit address and retry

#### Flow 2: Free/Tier 1 Vendor Viewing Locked Feature
1. **Starting Point**: Dashboard profile page, logged in as Free or Tier 1 vendor
2. **Trigger**: User scrolls to "Locations" section
3. **Display**: TierUpgradePrompt component renders instead of LocationsManagerCard
   - Shows: Lock icon (from lucide-react), "Additional Locations" heading, benefit description
   - Components: Card, Badge (showing current tier), Button (variant: default, "Upgrade to Tier 2")
4. **User Action**: User clicks "Upgrade to Tier 2" button
5. **Navigation**: Navigate to `/dashboard/subscription` page
6. **Note**: Location management UI completely hidden, replaced by upgrade prompt

#### Flow 3: Public User Viewing Vendor Profile with Multiple Locations
1. **Starting Point**: Search results page or direct navigation to vendor profile
2. **Trigger**: User clicks vendor card to view full profile
3. **Navigation**: Navigate to `/vendors/[slug]`
4. **Page Loads**: VendorPublicProfilePage renders
   - Hero shows: Company logo, name, HQ address badge
   - Tab navigation: About (default), Locations, Products, Reviews
5. **User Action**: User clicks "Locations" tab
6. **Tab Content Loads**: LocationsTabContent component renders
   - Conditional rendering: If vendor tier < tier2, only show HQ location
   - If vendor tier >= tier2, show LocationMapPreview with all locations
7. **Map Interaction**: User zooms/pans map, clicks location markers
   - Marker click: Map popup shows location details (address, city, country)
   - Marker style: HQ location has different color (primary) vs additional locations (secondary)
8. **Location List Interaction**: User scrolls through location cards below map
   - Each card shows: Full address, city, country, "Get Directions" link
   - HQ card has Badge (variant: default, text: "Headquarters")

**Component Interaction Patterns**:

- **Parent-Child Form Pattern**:
  - LocationsManagerCard (parent, manages locations array state) →
  - User adds location via "Add Location" button →
  - LocationFormFields (child, receives location object and onChange callback) →
  - User edits fields, triggers onChange →
  - LocationsManagerCard updates locations array →
  - State flows back down to LocationFormFields as updated location prop

**Form Submission Pattern**:
1. User fills LocationFormFields (using Input, Label components from shadcn/ui)
2. Client-side validation: Zod schema validates address (required, max 500), lat/long (required, range), city/country (required, max 255)
3. Submit button: Shows loading spinner (Loader2 from lucide-react) during save
4. API call: PATCH `/api/vendors/[id]` with updated locations array
5. Success: Toast notification "Location saved" (sonner) + location list updates
6. Error: Alert component (variant: destructive) displays error message + form state preserved

### Component Integration Map

**How Components Work Together**:

#### Multi-Location Feature Integration Flow
```
User Action: Navigate to Dashboard Profile Page
↓
DashboardProfilePage (fetches vendor data including tier)
↓
Conditional render based on tier:
  If tier >= tier2:
    → LocationsManagerCard (manages locations CRUD)
      ↓ passes locations array and callbacks
      → LocationFormFields for each location
        ↓ user edits, triggers onChange
      → GeocodingButton (fetches coordinates)
        ↓ API call to geocode.maps.co
      → LocationMapPreview (displays markers)
  If tier < tier2:
    → TierUpgradePrompt (locked feature state)
      ↓ user clicks upgrade
      → Navigate to subscription management
```

#### Component Communication Patterns

**Page → Container → Presentational Pattern**:
```
DashboardProfilePage (fetches vendor data via SWR, manages form submission)
  ↓ passes vendor object, tier, updateVendor callback
LocationsManagerCard (manages locations array state, handles add/edit/delete)
  ↓ passes individual location objects, onChange handlers
LocationFormFields (presentational, displays inputs, emits events)
  ↑ emits onChange events with updated location data
LocationsManagerCard (updates locations array in state)
  ↑ calls updateVendor callback to persist to API
DashboardProfilePage (submits PATCH to /api/vendors/[id])
```

**State Flow Between Components**:
- **Global State**: None (no global state management needed)

- **Shared Component State** (props drilling):
  - DashboardProfilePage manages vendor state
  - Passes to: LocationsManagerCard, TierBadge, ProfileSidebar

- **API Data Flow**:
  - Fetched in: DashboardProfilePage using SWR hook
  - Cached with: SWR cache (5-minute default)
  - Shared via: Props to child components

---

## Backend Implementation

### API Endpoints

#### **PATCH /api/vendors/:id**

**Purpose**: Update vendor profile including locations array

**Authentication**: Required
**Authorization**: Vendor (own profile) or Admin

**Request**:
```typescript
interface RequestBody {
  locations?: VendorLocation[];
  // ... other vendor fields
}

interface VendorLocation {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  isHQ: boolean;
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true;
  data: {
    id: string;
    companyName: string;
    locations: VendorLocation[];
    updatedAt: string;
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
- 400: Validation error (multiple HQs, tier restriction, missing required fields)
- 401: Unauthorized (not logged in)
- 403: Forbidden (not vendor owner or admin)
- 500: Server error

#### **GET /api/vendors/search**

**Purpose**: Search vendors by location with tier-based filtering

**Authentication**: Public
**Authorization**: None

**Request**:
```typescript
interface QueryParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  tier?: 'free' | 'tier1' | 'tier2';
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true;
  data: {
    vendors: Array<{
      id: string;
      companyName: string;
      slug: string;
      tier: string;
      matchedLocations: Array<{
        address: string;
        city: string;
        country: string;
        latitude: number;
        longitude: number;
        isHQ: boolean;
        distance?: number; // distance from search center in km
      }>;
    }>;
    total: number;
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
- 400: Invalid parameters (latitude/longitude out of range)
- 500: Server error

### Business Logic

**Core Business Rules**:
1. Only one location per vendor can have `isHQ: true`
2. Tier 2+ vendors can have unlimited additional locations
3. Free/Tier 1 vendors can only have one location (HQ)
4. Location-based search includes HQ for all tiers, additional locations only for tier 2+
5. At least one location (HQ) is required for all vendors

**Validation Requirements**:
- **Server-side**:
  - Validate exactly one HQ per vendor
  - Validate tier restrictions (tier 0/1 cannot have multiple locations)
  - Validate coordinate ranges (-90 to 90 lat, -180 to 180 long)
  - Validate required fields (address, lat, long, city, country)
  - Validate address max length (500 chars)
- **Data Integrity**:
  - Ensure isHQ flag uniqueness within vendor's locations array
  - Prevent deletion of HQ location if other locations exist (must designate new HQ first)
- **Business Constraints**:
  - If vendor tier is downgraded from tier2 to tier1, remove all non-HQ locations
  - Automatic HQ designation: If vendor has no locations, first location added becomes HQ
  - If vendor adds second location without specifying isHQ, it defaults to false

**Service Layer Architecture**:
- **VendorService**: Vendor CRUD operations
  - Methods: `updateVendorLocations(vendorId, locations)`, `validateLocationsTier(vendor, locations)`
  - Dependencies: Payload CMS ORM, LocationService

- **LocationService**: Location-specific business logic
  - Methods: `validateHQUniqueness(locations)`, `geocodeAddress(address)`, `calculateDistance(coord1, coord2)`
  - Dependencies: Geocoding API client

- **SearchService**: Location-based search
  - Methods: `searchVendorsByLocation(lat, long, radius)`, `filterLocationsByTier(vendors)`
  - Dependencies: Payload CMS ORM, LocationService

### Database Schema

**Tables/Collections Required**:

#### **vendors** (existing, modified)

**Changes**:
- Replace single `location` group field with `locations` array field
- Add migration to convert existing location to HQ location in array

```typescript
// Payload CMS Collection Schema (vendors.locations field)
{
  name: 'locations',
  type: 'array',
  label: 'Office Locations',
  admin: {
    description: 'Company office locations. One location must be designated as Headquarters.',
  },
  access: {
    read: () => true,
    update: ({ req: { user }, data }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Vendors can manage locations only if tier2+
      return data?.tier === 'tier2';
    },
  },
  fields: [
    {
      name: 'address',
      type: 'text',
      required: true,
      maxLength: 500,
      admin: {
        description: 'Full mailing address',
      },
    },
    {
      name: 'latitude',
      type: 'number',
      required: true,
      min: -90,
      max: 90,
      admin: {
        step: 0.000001,
        description: 'Latitude coordinate',
      },
    },
    {
      name: 'longitude',
      type: 'number',
      required: true,
      min: -180,
      max: 180,
      admin: {
        step: 0.000001,
        description: 'Longitude coordinate',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'City name',
      },
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Country name',
      },
    },
    {
      name: 'isHQ',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Designate as Headquarters',
      },
    },
  ],
  validate: (locations, { siblingData }) => {
    // Validate exactly one HQ
    const hqCount = locations?.filter((loc: any) => loc.isHQ).length || 0;
    if (hqCount === 0) {
      return 'At least one location must be designated as Headquarters';
    }
    if (hqCount > 1) {
      return 'Only one location can be designated as Headquarters';
    }

    // Validate tier restrictions
    const tier = siblingData.tier || 'free';
    if ((tier === 'free' || tier === 'tier1') && locations && locations.length > 1) {
      return 'Multiple locations require Tier 2 subscription';
    }

    return true;
  },
  hooks: {
    beforeChange: [
      ({ value, siblingData }) => {
        // Auto-designate first location as HQ if none specified
        if (value && value.length === 1 && !value[0].isHQ) {
          value[0].isHQ = true;
        }
        return value;
      },
    ],
  },
}
```

**Relationships**: None (embedded array within vendors collection)

**Migrations**:

```typescript
// Migration: Convert single location to locations array
export async function up() {
  const payload = await getPayloadClient();
  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0, // get all
  });

  for (const vendor of vendors.docs) {
    if (vendor.location && vendor.location.address) {
      // Convert old location structure to new locations array
      await payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: {
          locations: [
            {
              address: vendor.location.address,
              latitude: vendor.location.latitude,
              longitude: vendor.location.longitude,
              city: vendor.location.city,
              country: vendor.location.country,
              isHQ: true,
            },
          ],
        },
      });
    }
  }
}

export async function down() {
  const payload = await getPayloadClient();
  const vendors = await payload.find({
    collection: 'vendors',
    limit: 0,
  });

  for (const vendor of vendors.docs) {
    if (vendor.locations && vendor.locations.length > 0) {
      const hqLocation = vendor.locations.find((loc: any) => loc.isHQ);
      if (hqLocation) {
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
      }
    }
  }
}
```

---

## Frontend-Backend Integration

### API Contract

**Contract Owner**: Backend (Payload CMS) provides, Frontend consumes

**Type Sharing Strategy**:
- Payload CMS auto-generates TypeScript types in `payload-types.ts`
- Frontend imports types from `payload-types.ts` for type safety
- Custom frontend types extend Payload types for UI-specific needs

**Data Flow**:
1. User edits locations in LocationsManagerCard (Frontend) →
2. Frontend validates with Zod schema and calls PATCH `/api/vendors/:id` (API call) →
3. Payload CMS validates tier restrictions and HQ uniqueness (Backend) →
4. Database updated with new locations array →
5. Backend responds with updated vendor object →
6. Frontend updates UI via SWR revalidation

### Integration Points

**Frontend Calls Backend For**:
- User adds/edits location → PATCH `/api/vendors/:id` with updated locations array
- User geocodes address → External geocode.maps.co API (frontend direct call)
- User searches by location → GET `/api/vendors/search?latitude=X&longitude=Y&radius=Z`
- Dashboard loads vendor profile → GET `/api/vendors/:id` (SWR hook)
- Public profile page loads vendor → GET `/api/vendors?slug=:slug` (Payload CMS REST API)

**Error Handling Strategy**:
- **Network Errors**: Toast notification "Unable to connect to server. Please check your connection." + retry button
- **Validation Errors**: Inline error messages below form fields, highlighting invalid inputs
- **Authentication Errors**: Redirect to `/login` with return URL parameter
- **Tier Restriction Errors**: Modal dialog explaining feature requires upgrade, with "Upgrade Now" button

### Testing Strategy

**Frontend Tests**:
- Unit tests for components: LocationFormFields validation, TierGate conditional rendering, GeocodingButton API mocking
- Integration tests for state management: Locations array CRUD operations, HQ designation logic
- Mock backend API responses using MSW (Mock Service Worker)

**Backend Tests**:
- Unit tests for business logic: HQ uniqueness validation, tier restriction checks, coordinate range validation
- Integration tests for API endpoints: PATCH vendor with valid/invalid locations, search with tier filtering
- Database integration tests: Migration script (location to locations array), Payload CMS hooks

**E2E Tests**:
- Full user workflows from UI to database and back:
  - Tier 2 vendor adds additional location, saves, sees on public profile
  - Free vendor attempts to add second location, sees tier restriction error
  - Public user searches by location, sees tier-appropriate results
- Critical path scenarios: Geocoding button success/failure, map rendering with multiple markers
- Error handling scenarios: Network failure during save, invalid coordinates, multiple HQ designation attempt

---

## Implementation Architecture

### Component Structure

#### **LocationsManagerCard**

- **Responsibilities**: Manage vendor locations array state, handle CRUD operations, enforce tier restrictions
- **Implementation approach**: React functional component using useState for locations array, SWR mutation for API calls, conditional rendering based on vendor tier
- **Dependencies**: Payload CMS REST API, VendorLocation TypeScript type, LocationFormFields child component, GeocodingButton
- **Interface contracts**:
  ```typescript
  interface LocationsManagerCardProps {
    vendor: Vendor;
    onUpdate: (updatedVendor: Vendor) => void;
  }
  ```

#### **LocationFormFields**

- **Responsibilities**: Render form inputs for single location, handle input changes, emit events to parent
- **Implementation approach**: Controlled inputs with React Hook Form and Zod validation, geocoding button integration
- **Dependencies**: react-hook-form, zod, shadcn/ui Input/Label components, GeocodingButton
- **Interface contracts**:
  ```typescript
  interface LocationFormFieldsProps {
    location: VendorLocation;
    onChange: (updatedLocation: VendorLocation) => void;
    onDelete: () => void;
    isHQ: boolean;
    canEdit: boolean;
  }
  ```

#### **LocationMapPreview**

- **Responsibilities**: Display interactive map with vendor location markers, handle marker clicks
- **Implementation approach**: React-Leaflet wrapper component with custom marker icons for HQ vs additional locations
- **Dependencies**: react-leaflet, leaflet CSS, VendorLocation type
- **Interface contracts**:
  ```typescript
  interface LocationMapPreviewProps {
    locations: VendorLocation[];
    center: { lat: number; lng: number };
    zoom: number;
    onMarkerClick: (location: VendorLocation) => void;
  }
  ```

### Data Flow

1. **Dashboard Profile Page Load**: DashboardProfilePage component fetches vendor data via SWR hook → `GET /api/vendors/:id` →
2. **Vendor Data Retrieved**: Response includes vendor object with locations array, tier field →
3. **Conditional Render**: If tier >= 'tier2', render LocationsManagerCard; else render TierUpgradePrompt →
4. **Locations Display**: LocationsManagerCard maps over locations array, rendering LocationFormFields for each →
5. **User Edits Location**: User types in address field → onChange event → LocationFormFields updates local state → emits to parent →
6. **Parent State Update**: LocationsManagerCard updates locations array in state →
7. **User Geocodes**: User clicks GeocodingButton → API call to geocode.maps.co → response populates lat/long fields →
8. **User Saves**: User clicks "Save" button → PATCH `/api/vendors/:id` with updated locations array →
9. **Backend Validation**: Payload CMS validates HQ uniqueness, tier restrictions → updates database →
10. **Response Handling**: Success response → SWR revalidates cache → UI updates with latest data

**Flow Details**:
- **Dashboard Profile Page Load**: SWR hook `useSWR('/api/vendors/' + vendorId)` fetches vendor data, caches for 5 minutes, auto-revalidates on focus
- **Conditional Render**: `vendor.tier === 'tier2' ? <LocationsManagerCard /> : <TierUpgradePrompt />`
- **User Saves**: SWR mutation `trigger('/api/vendors/' + vendorId, { method: 'PATCH', body: JSON.stringify({ locations }) })`, optimistic update with rollback on error

### State Management

**State Management Pattern**: Local React state with SWR for server state synchronization

**Implementation Details**: Use useState for form-level state (e.g., locations array being edited), SWR for fetching and caching vendor data, SWR mutation for updates with optimistic UI updates

**State Stores**:
- **Local Component State (LocationsManagerCard)**:
  ```typescript
  const [locations, setLocations] = useState<VendorLocation[]>(vendor.locations || []);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  ```
- **SWR Cache**:
  ```typescript
  const { data: vendor, mutate } = useSWR<Vendor>(`/api/vendors/${vendorId}`);
  ```

### Error Handling

**Error Handling Strategy**: Multi-layered error handling with client-side validation, server-side validation, and user-friendly error messaging

**Error Scenarios**:
- **Invalid Coordinates**: User enters lat > 90 or < -90
  - Zod validation catches immediately, inline error below input: "Latitude must be between -90 and 90"
- **Multiple HQ Designation**: User checks isHQ on second location without unchecking first
  - Client-side validation prevents save button, alert message: "Only one location can be Headquarters. Please uncheck the existing HQ first."
  - Server-side validation as fallback: returns 400 error with same message
- **Tier Restriction Violation**: Tier 1 vendor attempts to save multiple locations
  - Client-side: LocationsManagerCard checks tier before allowing add location button, shows TierUpgradePrompt instead
  - Server-side validation as fallback: returns 403 error "Multiple locations require Tier 2 subscription"
- **Geocoding Failure**: geocode.maps.co API returns error or invalid address
  - GeocodingButton shows error toast: "Unable to geocode address. Please check address or enter coordinates manually."
  - Form remains in editable state, coordinates fields remain empty

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "TIER_RESTRICTION",
    "message": "Multiple locations require Tier 2 subscription",
    "details": "Current tier: tier1",
    "timestamp": "2025-10-22T14:30:00Z"
  }
}
```

## Integration Points

### Existing Code Dependencies

#### **Payload CMS Vendors Collection Integration**

- **Purpose**: Extend existing vendors schema with locations array field
- **Interface requirements**: Modify `/payload/collections/Vendors.ts` to add locations array field, replace location group field
- **Data exchange**: Frontend sends locations array via PATCH `/api/vendors/:id`, backend validates and persists to database
- **Error handling**: Payload CMS validation hooks throw errors for tier restrictions, HQ uniqueness violations

#### **Dashboard Profile Page Integration**

- **Purpose**: Embed LocationsManagerCard into existing dashboard profile page
- **Interface requirements**: Pass vendor object and onUpdate callback to LocationsManagerCard component
- **Data exchange**: LocationsManagerCard emits updated vendor object via onUpdate callback, parent page handles API call
- **Error handling**: Parent page catches API errors, displays toast notifications, reverts optimistic UI updates

#### **Vendor Public Profile Page Integration**

- **Purpose**: Display locations in new "Locations" tab on vendor profile page
- **Interface requirements**: Fetch vendor with locations array, conditionally render based on tier
- **Data exchange**: Static props passed to page at build time for SSG, locations array included in vendor object
- **Error handling**: If locations array empty, show "No locations available" message

### API Contracts

#### **PATCH /api/vendors/:id**

**Purpose**: Update vendor profile including locations array

**Request Structure**:
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

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "id": "vendor-123",
    "companyName": "Marine Tech Solutions",
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
    "updatedAt": "2025-10-22T14:30:00Z"
  }
}
```

**Error Responses**:
- 400 Bad Request: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Only one location can be designated as Headquarters" } }`
- 403 Forbidden: `{ "success": false, "error": { "code": "TIER_RESTRICTION", "message": "Multiple locations require Tier 2 subscription" } }`

### Database Interactions

#### **vendors Table**

**Operations**: UPDATE locations array field

**Queries**:
- **Update Vendor Locations**:
  ```typescript
  await payload.update({
    collection: 'vendors',
    id: vendorId,
    data: { locations: updatedLocationsArray }
  });
  ```
- **Search Vendors by Location**:
  ```typescript
  const vendors = await payload.find({
    collection: 'vendors',
    where: {
      'locations.latitude': {
        greater_than_equal: minLat,
        less_than_equal: maxLat,
      },
      'locations.longitude': {
        greater_than_equal: minLng,
        less_than_equal: maxLng,
      },
    },
  });
  ```

**Indexes**:
- Create index on `locations.latitude` and `locations.longitude` for location-based search performance
- Create index on `locations.isHQ` for HQ filtering queries

**Constraints**:
- Validate exactly one location has `isHQ: true` (application-level constraint via Payload validation hook)
- Validate tier restrictions (application-level constraint via Payload beforeChange hook)

### External Services Integration

#### **geocode.maps.co API Integration**

**Protocol**: HTTPS REST API

**Authentication**: None (public API with rate limits)

**Endpoints**:
- **Forward Geocoding**: `GET https://geocode.maps.co/search?q={address}`
  - Usage: Convert address string to lat/long coordinates
  - Response:
    ```json
    [
      {
        "lat": "26.122439",
        "lon": "-80.137314",
        "display_name": "123 Harbor View Drive, Fort Lauderdale, FL 33316, USA"
      }
    ]
    ```

**Rate Limiting**: 1 request per second for free tier, 10 requests per second for paid tier

**Error Handling**:
- 429 Too Many Requests: Show error toast "Geocoding service temporarily unavailable. Please try again in a moment."
- 404 Not Found: Show error toast "Address not found. Please check address or enter coordinates manually."
- Network error: Show error toast "Unable to connect to geocoding service. Please check your connection."

**Timeout Configuration**: 10 second timeout for geocoding API calls

## Implementation Patterns

### Design Patterns

**Primary Patterns**:
- **Composite Pattern**: LocationsManagerCard composes multiple LocationFormFields components, managing them as a collection
- **Strategy Pattern**: Tier-based access control implements different strategies for free, tier1, tier2 vendors (TierGateStrategy)
- **Observer Pattern**: SWR library implements observer pattern for cache updates and revalidation

**Pattern Selection Rationale**: Composite pattern allows flexible management of variable number of locations without coupling to specific array operations. Strategy pattern cleanly separates tier-specific business logic without if/else chains throughout codebase.

### Code Organization

```
/home/edwin/development/ptnextjs/
├── app/
│   ├── dashboard/
│   │   └── profile/
│   │       └── page.tsx (Extended with LocationsManagerCard)
│   └── vendors/
│       └── [slug]/
│           └── page.tsx (Extended with LocationsDisplaySection)
├── components/
│   ├── dashboard/
│   │   ├── LocationsManagerCard.tsx
│   │   ├── LocationFormFields.tsx
│   │   └── TierUpgradePrompt.tsx
│   ├── vendors/
│   │   ├── LocationsDisplaySection.tsx
│   │   └── LocationMapPreview.tsx
│   └── ui/
│       ├── GeocodingButton.tsx
│       └── TierGate.tsx
├── lib/
│   ├── hooks/
│   │   ├── useVendorLocations.ts
│   │   └── useGeocoding.ts
│   ├── services/
│   │   ├── LocationService.ts
│   │   └── TierService.ts
│   └── types/
│       └── locations.ts (VendorLocation type)
├── payload/
│   ├── collections/
│   │   └── Vendors.ts (Modified with locations array)
│   └── migrations/
│       └── 2025-10-22-convert-location-to-array.ts
└── tests/
    ├── components/
    │   ├── LocationsManagerCard.test.tsx
    │   └── LocationFormFields.test.tsx
    └── e2e/
        └── multi-location-workflow.spec.ts
```

**File Organization Guidelines**:
- **Component files**: Group by feature (dashboard, vendors), one component per file, co-locate tests
- **Service files**: Business logic services in lib/services/, pure functions with no React dependencies
- **Utility files**: Reusable helpers in lib/utils/, tier checking functions in lib/services/TierService.ts
- **Test files**: Mirror source structure in tests/ directory, .test.tsx for component tests, .spec.ts for E2E

### Naming Conventions

**Components**: PascalCase with descriptive names (LocationsManagerCard, LocationFormFields, TierUpgradePrompt)

**Services**: PascalCase for class/object names, camelCase for methods (LocationService.validateHQUniqueness)

**Utilities**: camelCase for functions (geocodeAddress, calculateDistance, checkTierAccess)

**Types/Interfaces**: PascalCase with descriptive names, I prefix optional (VendorLocation, LocationFormData, TierAccessLevel)

**Constants**: UPPER_SNAKE_CASE for true constants, camelCase for configuration objects (GEOCODING_API_URL, tierFeatureMap)

**Variable Naming**:
- **Functions**: camelCase, verb + noun (addLocation, updateVendorProfile, fetchGeocodedCoordinates)
- **Variables**: camelCase, descriptive nouns (vendorLocations, hqLocation, additionalOffices)
- **Class methods**: camelCase, verb + noun (validateLocations, saveToDatabase, renderLocationCard)

### Coding Standards

**Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

**Key Standards**:
- **Indentation**: 2 spaces (never tabs)
- **Line length**: Maximum 100 characters (enforced by Prettier)
- **Comments**: Explain "why" not "what", use JSDoc for public APIs
- **Error handling**: Always include proper error handling with try/catch, never swallow errors
- **Type safety**: Use TypeScript for type safety, avoid `any` type, prefer interfaces over types for object shapes

**Quality Requirements**:
- **Test coverage**: Minimum 80% coverage for new code (measured by Jest coverage report)
- **Documentation**: All public APIs must be documented with JSDoc comments, including LocationService methods, component props
- **Performance**:
  - LocationsManagerCard should render < 100ms for up to 10 locations
  - Location-based search should return results < 500ms for 1000 vendors
  - Map should load and display markers < 1 second for up to 50 locations
- **Security**:
  - Validate all user inputs on both client and server
  - Sanitize address strings before geocoding API calls to prevent injection
  - Implement rate limiting on geocoding API calls to prevent abuse
  - Enforce tier restrictions on server side, never trust client-side checks alone

## Performance Criteria

### Response Time Requirements

**Target Response Time**:
- PATCH `/api/vendors/:id` with locations update: < 500ms
- GET `/api/vendors/search` location-based search: < 1000ms
- LocationsManagerCard component render: < 100ms

**Measurement Points**:
- Backend API response time measured via Payload CMS hooks (beforeChange, afterChange)
- Frontend render time measured via React DevTools Profiler
- Network latency measured via browser DevTools Network tab

**Optimization Strategies**:
- Use database indexes on location lat/long fields for fast spatial queries
- Implement SWR caching with 5-minute TTL to reduce API calls
- Use React.memo for LocationFormFields to prevent unnecessary re-renders
- Debounce geocoding button clicks (500ms) to prevent rapid API calls

### Throughput Requirements

**Target Throughput**:
- Location-based search API: 100 requests/second
- Vendor profile update API: 50 requests/second
- Geocoding API calls: 1 request/second (free tier), 10 requests/second (paid tier)

**Load Testing Scenarios**:
- Simulate 1000 concurrent users searching by location
- Simulate 100 vendors simultaneously updating profiles
- Measure database query performance with 10,000 vendors, each with 5 locations

**Scalability Requirements**:
- System should handle 10,000+ vendors with up to 10 locations each
- Location-based search should scale to 50km radius searches with <1s response time
- Database should support 100,000+ location records without performance degradation

### Concurrency Requirements

**Concurrent Users**: Support 1000 concurrent users browsing vendor profiles and performing location searches

**Resource Management**:
- Implement connection pooling for database queries (max 20 concurrent connections)
- Use SWR request deduplication to prevent duplicate API calls from multiple components
- Implement optimistic UI updates to reduce perceived latency

**Bottleneck Prevention**:
- Cache geocoding API responses locally (24-hour expiry) to avoid rate limits
- Use CDN for map tile images to reduce server load
- Implement pagination for location-based search results (max 50 results per page)

## Security Requirements

### Authentication Requirements

**Authentication Method**: Payload CMS built-in JWT authentication

**Token Management**:
- JWT tokens stored in HTTP-only cookies
- Access token expiry: 1 hour
- Refresh token expiry: 7 days

**Session Handling**:
- Payload CMS handles session management automatically
- Frontend checks authentication status via SWR hook `useAuth()`
- Redirect to `/login` if unauthenticated user attempts to access `/dashboard/*`

### Authorization Requirements

**Authorization Model**: Role-Based Access Control (RBAC) with tier-based feature gating

**Permission Validation**:
- Vendor users can only update their own vendor profile
- Admin users can update any vendor profile
- Tier 2+ vendors can access locations array field
- Free/Tier 1 vendors cannot add multiple locations (enforced server-side)

**Access Control**:
- Payload CMS field-level access control on locations array
- Frontend conditional rendering based on vendor tier
- API endpoint checks user ownership before allowing updates

### Data Protection

**Encryption Standard**: TLS 1.3 for all network communication

**Data at Rest**: SQLite database file stored with filesystem permissions (600)

**Data in Transit**: All API calls use HTTPS, enforce HSTS headers

**Sensitive Data Handling**:
- Do not store PII beyond business address (no personal home addresses)
- Geocoding API calls do not include vendor IDs or sensitive metadata
- Vendor email/phone not included in public search results

### Input Validation

**Validation Approach**: Defense in depth with client-side and server-side validation

**Sanitization Rules**:
- Address field: Strip HTML tags, trim whitespace, max 500 chars
- City/Country fields: Alphanumeric with spaces/hyphens only, max 255 chars
- Latitude/Longitude: Numeric validation, range checks (-90 to 90, -180 to 180)

**Injection Prevention**:
- Use parameterized queries for all database operations (Payload CMS ORM handles this)
- Escape special characters in geocoding API calls
- Content Security Policy headers to prevent XSS attacks

## Quality Validation Requirements

### Technical Depth Validation

**Implementation Readiness**:
- All Payload CMS schema changes documented with exact field definitions and validation logic
- All API endpoints documented with request/response structures and TypeScript interfaces
- All React components documented with props interfaces and state management approach

**Technical Accuracy**:
- Database migration script tested with sample data (10 vendors with existing location data)
- Location-based search algorithm validated against known coordinate datasets
- Tier restriction logic verified with unit tests covering all tier combinations

**Completeness Check**:
- All user stories have corresponding implementation components identified
- All error scenarios have defined error handling strategies
- All integration points documented with interface contracts

### Integration Validation

**Compatibility Assessment**:
- Payload CMS version 3.x supports array fields with validation hooks (verified in docs)
- Next.js App Router supports dynamic routes for vendor profiles (existing pattern)
- shadcn/ui components compatible with React 18 (verified in package.json)

**Dependency Validation**:
- react-leaflet library for map component (add to package.json)
- geocode.maps.co API available with free tier (no auth required)
- SWR library already installed for data fetching

**API Contract Validation**:
- PATCH `/api/vendors/:id` matches existing Payload CMS REST API pattern
- Response structure consistent with other API endpoints (success/error format)

### Performance Validation

**Performance Benchmarks**:
- Location-based search with 1000 vendors: measure query time, target < 500ms
- LocationsManagerCard render with 10 locations: measure via React Profiler, target < 100ms
- Database migration with 1000 vendors: measure execution time, target < 5 minutes

**Resource Requirements**:
- Additional database storage: ~500 bytes per location * 10 locations * 1000 vendors = ~5 MB
- Additional API bandwidth: Minimal (locations array adds ~1 KB per vendor profile request)
- Map tile CDN bandwidth: Depends on traffic, estimate ~100 MB/month for 1000 active users

**Scalability Assessment**:
- Database can handle 100,000 location records without index degradation (SQLite limitation: ~140 TB max database size)
- Location-based search algorithm scales O(n) with number of locations, acceptable for < 50,000 locations

### Security Validation

**Security Standards Compliance**:
- Follows OWASP Top 10 guidelines for input validation and authentication
- Implements least privilege principle (vendors can only edit their own profiles)
- Uses secure HTTP-only cookies for JWT tokens

**Vulnerability Assessment**:
- Risk: Geocoding API calls could expose addresses to third-party
  - Mitigation: Use HTTPS, no PII in API calls, rate limit to prevent abuse
- Risk: Malicious vendor could add fake locations
  - Mitigation: Admin approval workflow for new vendors, abuse reporting system (future)

**Authentication/Authorization Validation**:
- Payload CMS JWT authentication tested with Postman
- Tier-based access control unit tested with all tier combinations
- Frontend route guards tested with E2E tests (authenticated vs unauthenticated users)

## Technical Requirements

- **Payload CMS 3.x** with array field support and validation hooks
- **TypeScript 5.x** for type safety across frontend and backend
- **Next.js 14.x App Router** for SSG vendor profile pages with dynamic locations
- **shadcn/ui component library** for consistent UI components
- **react-leaflet or mapbox-gl** for interactive map component
- **SWR library** for data fetching and caching with optimistic updates
- **geocode.maps.co API** for address-to-coordinates conversion
- **SQLite database** (development) with spatial query support via raw SQL queries
- **PostgreSQL database** (production, future) with PostGIS extension for spatial queries
- **Zod validation library** for client-side form validation
- **React Hook Form** for form state management
- **Jest and React Testing Library** for unit tests
- **Playwright** for E2E tests

## External Dependencies

**react-leaflet** - Interactive map component library
- **Justification:** Required to display vendor locations on interactive map with markers and popups
- **Version Requirements:** ^4.2.1 (latest stable, compatible with React 18)

**leaflet** - Core mapping library (peer dependency of react-leaflet)
- **Justification:** Required by react-leaflet for map rendering and marker management
- **Version Requirements:** ^1.9.4 (latest stable)

**@types/leaflet** - TypeScript type definitions for Leaflet
- **Justification:** Provides type safety for Leaflet API usage in TypeScript codebase
- **Version Requirements:** ^1.9.8 (matches leaflet version)

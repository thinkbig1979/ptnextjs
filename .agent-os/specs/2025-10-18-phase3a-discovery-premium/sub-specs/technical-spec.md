# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-18-phase3a-discovery-premium/spec.md

## Feature Classification

**Feature Type**: FULL_STACK

**Frontend Required**: YES
**Backend Required**: YES

**Justification**: This feature requires both frontend components for vendor profile display, tier selection UI, geographic filtering, and premium feature showcases, as well as backend API endpoints for tier upgrade requests, admin approval workflows, geographic data management, and tier-specific access control enforcement.

---

## Backend Implementation

### API Endpoints

#### **GET /api/vendors**

**Purpose**: Retrieve vendors with optional geographic and category filtering

**Authentication**: Public (no auth required for browsing)
**Authorization**: None

**Request**:
```typescript
interface QueryParams {
  country?: string
  state?: string
  city?: string
  lat?: number
  lon?: number
  radius?: number // in kilometers
  category?: string // category slug
  limit?: number
  offset?: number
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    vendors: Vendor[]
    total: number
    filters: {
      countries: string[]
      states: string[]
      cities: string[]
    }
  }
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid query parameters
- 500: Server error

#### **GET /api/vendors/:id/service-regions**

**Purpose**: Get detailed service region data for a specific vendor

**Authentication**: Public
**Authorization**: None

**Request**:
```typescript
// No body, vendor ID in path
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    vendor_id: string
    service_regions: {
      countries: string[]
      states: { country: string, state: string }[]
      cities: { country: string, state: string, city: string }[]
      coordinates: { lat: number, lon: number }[]
      coverage_notes: string
    }
  }
}
```

**Status Codes**:
- 200: Success
- 404: Vendor not found
- 500: Server error

#### **POST /api/tier-requests**

**Purpose**: Vendor initiates a tier upgrade or downgrade request

**Authentication**: Required (JWT)
**Authorization**: Vendor role only

**Request**:
```typescript
interface RequestBody {
  requested_tier: 'free' | 'tier1' | 'tier2'
  reason?: string // optional explanation for the request
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    request_id: string
    vendor_id: string
    current_tier: string
    requested_tier: string
    status: 'pending'
    created_at: string
  }
}

interface ErrorResponse {
  success: false
  error: {
    code: 'INVALID_TIER' | 'DUPLICATE_REQUEST' | 'UNAUTHORIZED'
    message: string
  }
}
```

**Status Codes**:
- 201: Request created successfully
- 400: Invalid tier or duplicate pending request
- 401: Not authenticated
- 403: Not a vendor
- 500: Server error

#### **GET /api/tier-requests**

**Purpose**: Get tier change requests (vendors see their own, admins see all)

**Authentication**: Required (JWT)
**Authorization**: Vendor or Admin role

**Request**:
```typescript
interface QueryParams {
  status?: 'pending' | 'approved' | 'rejected'
  limit?: number
  offset?: number
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    requests: {
      id: string
      vendor_id: string
      vendor_name: string
      current_tier: string
      requested_tier: string
      status: 'pending' | 'approved' | 'rejected'
      reason?: string
      created_at: string
      updated_at: string
      admin_notes?: string
    }[]
    total: number
  }
}
```

**Status Codes**:
- 200: Success
- 401: Not authenticated
- 500: Server error

#### **PATCH /api/tier-requests/:id**

**Purpose**: Admin approves or rejects a tier change request

**Authentication**: Required (JWT)
**Authorization**: Admin role only

**Request**:
```typescript
interface RequestBody {
  status: 'approved' | 'rejected'
  admin_notes?: string
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    request_id: string
    vendor_id: string
    previous_tier: string
    new_tier: string // only if approved
    status: 'approved' | 'rejected'
    admin_notes?: string
    updated_at: string
  }
}
```

**Status Codes**:
- 200: Request processed successfully
- 400: Invalid status or request already processed
- 401: Not authenticated
- 403: Not an admin
- 404: Request not found
- 500: Server error

#### **POST /api/admin/vendors/:id/tier**

**Purpose**: Admin directly assigns a tier to a vendor (bypass request system)

**Authentication**: Required (JWT)
**Authorization**: Admin role only

**Request**:
```typescript
interface RequestBody {
  tier: 'free' | 'tier1' | 'tier2'
  admin_notes?: string
  bypass_audit?: boolean // default false, logs in audit trail
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    vendor_id: string
    previous_tier: string
    new_tier: string
    assigned_by: string // admin user ID
    assigned_at: string
  }
}
```

**Status Codes**:
- 200: Tier assigned successfully
- 400: Invalid tier
- 401: Not authenticated
- 403: Not an admin
- 404: Vendor not found
- 500: Server error

#### **GET /api/admin/tier-audit**

**Purpose**: Get complete tier change history for audit purposes

**Authentication**: Required (JWT)
**Authorization**: Admin role only

**Request**:
```typescript
interface QueryParams {
  vendor_id?: string // optional filter by vendor
  from_date?: string // ISO date
  to_date?: string // ISO date
  limit?: number
  offset?: number
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: {
    audit_logs: {
      id: string
      vendor_id: string
      vendor_name: string
      previous_tier: string
      new_tier: string
      change_type: 'request_approved' | 'request_rejected' | 'admin_override'
      admin_id?: string
      admin_name?: string
      notes?: string
      timestamp: string
    }[]
    total: number
  }
}
```

**Status Codes**:
- 200: Success
- 401: Not authenticated
- 403: Not an admin
- 500: Server error

### Business Logic

**Core Business Rules**:
1. **Geographic Matching**: Vendors must have at least one service region defined to appear in location-based search results
2. **Tier Constraints**: Vendors cannot have multiple pending tier requests; new requests require previous request resolution
3. **Tier Hierarchy**: Tier downgrades are allowed but require admin approval to prevent accidental loss of premium features
4. **Audit Trail**: All tier changes (whether via request or admin override) must be logged for compliance and billing purposes
5. **Feature Access**: Tier-specific features are enforced both on frontend (UI hiding) and backend (API validation) to prevent unauthorized access

**Validation Requirements**:
- **Server-side**:
  - Validate tier request status transitions (pending → approved/rejected only)
  - Verify no duplicate pending requests for same vendor
  - Ensure requested tier is valid enum value ('free', 'tier1', 'tier2')
  - Check vendor authentication and ownership for tier request creation
  - Validate admin role for approval/rejection operations
- **Data Integrity**:
  - Ensure vendor_id foreign key references valid vendor record
  - Maintain referential integrity between tier_requests and vendors tables
  - Prevent orphaned tier requests when vendor is deleted (cascade or restrict)
- **Business Constraints**:
  - Cannot request same tier as current tier
  - Must have valid vendor profile to request tier upgrade
  - Geographic coordinates must be valid lat/lon ranges (-90 to 90, -180 to 180)

**Service Layer Architecture**:
- **TierRequestService**: Handles tier upgrade request workflow
  - Methods: createTierRequest, getTierRequests, approveTierRequest, rejectTierRequest
  - Dependencies: VendorService, AuditService, NotificationService
- **VendorGeographyService**: Manages vendor service regions and location-based queries
  - Methods: getVendorsByRegion, getVendorsByProximity, updateServiceRegions, geocodeLocation
  - Dependencies: GeolocationAPI (external), VendorService
- **TierFeatureService**: Validates tier-specific feature access
  - Methods: checkFeatureAccess, getAvailableFeatures, getTierLimits
  - Dependencies: VendorService
- **AuditService**: Logs all tier changes for compliance
  - Methods: logTierChange, getTierAuditHistory, exportAuditLog
  - Dependencies: Database access

### Database Schema

**Tables/Collections Required**:

#### **vendors** (extends existing schema)

```sql
-- Add new columns to existing vendors table
ALTER TABLE vendors ADD COLUMN service_countries TEXT[] DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN service_states JSONB DEFAULT '[]';
-- Format: [{"country": "US", "state": "California"}, ...]
ALTER TABLE vendors ADD COLUMN service_cities JSONB DEFAULT '[]';
-- Format: [{"country": "US", "state": "CA", "city": "San Diego"}, ...]
ALTER TABLE vendors ADD COLUMN service_coordinates JSONB DEFAULT '[]';
-- Format: [{"lat": 32.7157, "lon": -117.1611, "label": "San Diego HQ"}, ...]
ALTER TABLE vendors ADD COLUMN coverage_notes TEXT;

-- Geographic search indexes
CREATE INDEX idx_vendors_service_countries ON vendors USING GIN(service_countries);
CREATE INDEX idx_vendors_service_states ON vendors USING GIN(service_states);
CREATE INDEX idx_vendors_service_cities ON vendors USING GIN(service_cities);
```

#### **tier_requests**

```sql
CREATE TABLE tier_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  current_tier VARCHAR(10) NOT NULL CHECK (current_tier IN ('free', 'tier1', 'tier2')),
  requested_tier VARCHAR(10) NOT NULL CHECK (requested_tier IN ('free', 'tier1', 'tier2')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  vendor_reason TEXT,
  admin_notes TEXT,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  CONSTRAINT no_duplicate_pending UNIQUE (vendor_id, status) WHERE status = 'pending'
);

CREATE INDEX idx_tier_requests_vendor ON tier_requests(vendor_id);
CREATE INDEX idx_tier_requests_status ON tier_requests(status);
CREATE INDEX idx_tier_requests_created ON tier_requests(created_at DESC);
```

#### **tier_audit_log**

```sql
CREATE TABLE tier_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  previous_tier VARCHAR(10) NOT NULL,
  new_tier VARCHAR(10) NOT NULL,
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('request_approved', 'request_rejected', 'admin_override', 'system_automatic')),
  admin_id UUID REFERENCES users(id),
  tier_request_id UUID REFERENCES tier_requests(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tier_audit_vendor ON tier_audit_log(vendor_id);
CREATE INDEX idx_tier_audit_created ON tier_audit_log(created_at DESC);
CREATE INDEX idx_tier_audit_admin ON tier_audit_log(admin_id) WHERE admin_id IS NOT NULL;
```

#### **vendor_premium_content** (for tier-specific features)

```sql
CREATE TABLE vendor_premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
    'certification', 'case_study', 'media_gallery', 'team_member',
    'product_catalog', 'performance_metric'
  )),
  required_tier VARCHAR(10) NOT NULL CHECK (required_tier IN ('tier1', 'tier2')),
  content_data JSONB NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_premium_content_vendor ON vendor_premium_content(vendor_id);
CREATE INDEX idx_premium_content_type ON vendor_premium_content(content_type);
CREATE INDEX idx_premium_content_published ON vendor_premium_content(is_published) WHERE is_published = true;
```

**Relationships**:
- **tier_requests.vendor_id** → **vendors.id**: Many tier requests belong to one vendor
- **tier_requests.admin_id** → **users.id**: Tier request processed by one admin
- **tier_audit_log.vendor_id** → **vendors.id**: Audit logs track vendor tier changes
- **tier_audit_log.admin_id** → **users.id**: Audit logs record which admin made the change
- **tier_audit_log.tier_request_id** → **tier_requests.id**: Links audit entry to originating request
- **vendor_premium_content.vendor_id** → **vendors.id**: Premium content belongs to vendor

**Migrations**:
- **Migration 001**: Add geographic fields to existing vendors table
- **Migration 002**: Create tier_requests table with constraints
- **Migration 003**: Create tier_audit_log table
- **Migration 004**: Create vendor_premium_content table
- **Migration 005**: Backfill service_countries for existing vendors (default to empty array, manual data entry required)

---

## Frontend Implementation

### UI Components

#### **VendorLocationFilter**
- **Type**: Filter Panel / Card
- **Purpose**: Allows users to filter vendor listings by geographic location
- **User Interactions**: Select country dropdown, select state/province dropdown (filtered by country), select city dropdown (filtered by state), toggle proximity search with radius slider
- **State Management**: Local component state for filter selections, URL query params for shareable filtered results
- **Routing**: N/A (component used on /vendors and /products/[slug] pages)

#### **VendorServiceAreaMap**
- **Type**: Interactive Map Component
- **Purpose**: Displays vendor service regions visually on an interactive map
- **User Interactions**: Pan/zoom map, click vendor markers to view details, hover over regions to see coverage areas
- **State Management**: Props-based (receives vendor service region data from parent)
- **Technology**: Leaflet.js with OpenFreeMap tiles (free, open-source map tiles)

#### **TierComparisonTable**
- **Type**: Feature Comparison Card
- **Purpose**: Shows side-by-side comparison of Free, Tier 1, and Tier 2 subscription features
- **User Interactions**: Highlight current tier, click "Select Tier" button to initiate upgrade request
- **State Management**: Context API (AuthContext for current vendor tier)
- **Routing**: Displayed on /vendor/dashboard/subscription page

#### **TierUpgradeRequestForm**
- **Type**: Modal / Form
- **Purpose**: Allows vendor to submit tier upgrade/downgrade request with optional explanation
- **User Interactions**: Select desired tier (radio buttons), enter optional reason (textarea), submit request
- **State Management**: Local form state with React Hook Form, API mutation with TanStack Query
- **Events**: onSubmitSuccess (show success toast, close modal, refresh tier requests list)

#### **AdminTierApprovalQueue**
- **Type**: Data Table / List
- **Purpose**: Shows pending tier change requests for admin review
- **User Interactions**: Filter by status, sort by date, click "Approve" or "Reject" buttons, add admin notes
- **State Management**: TanStack Query for data fetching and cache management
- **Routing**: Displayed on /admin/tier-requests page

#### **TierGate** (enhanced version)
- **Type**: Higher-Order Component / Wrapper
- **Purpose**: Conditionally renders premium features based on vendor's current tier
- **Props**:
  - requiredTier: 'free' | 'tier1' | 'tier2'
  - children: React.ReactNode (the gated content)
  - fallback?: React.ReactNode (what to show when access denied, defaults to upgrade prompt)
  - showUpgradePrompt?: boolean (default true)
- **Usage**: Wrap any tier-specific UI element or component
- **Example**:
  ```tsx
  <TierGate requiredTier="tier2">
    <AnalyticsDashboard />
  </TierGate>
  ```

#### **TierUpgradePrompt**
- **Type**: Call-to-Action Card
- **Purpose**: Strategically placed prompts encouraging vendors to upgrade their tier
- **User Interactions**: Click "Upgrade" button navigates to tier comparison page
- **Variants**: Inline (small banner), Modal (full-screen takeover), Toast (dismissible notification)
- **Props**:
  - feature: string (name of locked feature being promoted)
  - requiredTier: 'tier1' | 'tier2'
  - variant: 'inline' | 'modal' | 'toast'

### Frontend State Management

**State Management Pattern**: Context API + TanStack Query

**State Stores Required**:
- **VendorTierContext**: Manages current vendor's tier and tier request status
  - State shape:
    ```typescript
    interface VendorTierState {
      currentTier: 'free' | 'tier1' | 'tier2'
      pendingRequest: TierRequest | null
      availableFeatures: string[]
      tierLimits: Record<string, number>
    }
    ```
  - Actions: refreshTierStatus, submitTierRequest
  - Computed: canAccessFeature(feature: string) => boolean

- **LocationFilterState**: Manages geographic filter selections (URL-based)
  - State shape:
    ```typescript
    interface LocationFilterState {
      country: string | null
      state: string | null
      city: string | null
      proximity: { lat: number, lon: number, radius: number } | null
    }
    ```
  - Actions: setCountry, setState, setCity, setProximity, clearFilters
  - Synced with URL search params for shareable filter links

### Frontend Routing

**Routes Required**:
- **/vendor/dashboard/subscription**: TierComparisonTable + TierUpgradeRequestForm - Vendor selects and requests tier upgrades
- **/vendor/dashboard/profile/premium**: Premium feature editor (gated by tier) - Tier 2/3 vendors manage certifications, case studies, etc.
- **/admin/tier-requests**: AdminTierApprovalQueue - Admin reviews and approves/rejects tier requests
- **/admin/tier-audit**: TierAuditLogViewer - Admin views complete tier change history
- **/vendors**: VendorLocationFilter + VendorListingGrid - Public vendor browsing with location filters
- **/products/[slug]**: VendorLocationFilter + VendorListForProduct - Shows vendors offering specific product, filterable by location

**Route Guards**:
- Vendor routes require authenticated vendor role
- Admin routes require authenticated admin role
- Premium profile editor checks tier eligibility

### User Interface Specifications

**Design Requirements**:
- **Responsive Breakpoints**:
  - Mobile (<640px): Single column layout, full-width components, collapsible filters
  - Tablet (640-1024px): Two-column grid for vendor cards, side panel filters
  - Desktop (≥1024px): Three-column grid for vendor cards, persistent sidebar filters, larger map view
- **Accessibility**:
  - WCAG 2.1 AA compliance for all interactive elements
  - Keyboard navigation for tier selection and map interactions
  - Screen reader announcements for filter changes and tier status updates
  - Color contrast ratios meeting AA standards for tier badges and CTAs
- **Loading States**:
  - Skeleton loaders for vendor cards while fetching data
  - Map loading spinner with progress indicator
  - Disabled state for tier request button while submitting
- **Error States**:
  - Inline error messages for tier request form validation failures
  - Toast notification for API errors (e.g., "Unable to submit request, please try again")
  - Empty state for admin approval queue when no pending requests
- **Empty States**:
  - "No vendors found in your region" with suggestion to expand search radius
  - "No tier requests pending" in admin queue with friendly illustration
  - "Upgrade to Tier 2 to unlock this feature" with clear CTA button

**Form Validations** (for TierUpgradeRequestForm):
- **requested_tier**: Required, must be different from current tier, must be valid enum value
- **vendor_reason**: Optional, max 500 characters, plain text only (no HTML)

### Component Architecture

**UI Component Strategy**: shadcn/ui with Radix UI primitives

**Component Library**: shadcn/ui (latest version)

**Library Components to Use**:
- **Select** (`@/components/ui/select`): For country/state/city dropdown filters
  - Usage: VendorLocationFilter for geographic selections
  - Variants: Default (single select)
  - Props: value, onValueChange, placeholder, disabled

- **Card** (`@/components/ui/card`): Container for tier comparison features
  - Usage: TierComparisonTable individual tier cards
  - Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

- **Badge** (`@/components/ui/badge`): For tier labels and status indicators
  - Usage: Display current tier, tier request status (pending/approved/rejected)
  - Variants: default, secondary, destructive, outline

- **Button** (`@/components/ui/button`): CTAs for tier upgrade, approve/reject actions
  - Usage: "Select Tier", "Approve Request", "Reject Request", "Upgrade Now"
  - Variants: default, outline, ghost, destructive
  - States: loading (with spinner), disabled

- **Dialog** (`@/components/ui/dialog`): For tier upgrade request modal
  - Usage: TierUpgradeRequestForm modal overlay
  - Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter

- **Table** (`@/components/ui/table`): For admin tier approval queue
  - Usage: AdminTierApprovalQueue data grid
  - Sub-components: Table, TableHeader, TableBody, TableRow, TableHead, TableCell

- **Textarea** (`@/components/ui/textarea`): For tier request reason field
  - Usage: Optional explanation field in TierUpgradeRequestForm
  - Props: placeholder, maxLength, rows

- **Toast** (`@/components/ui/toast`): Success/error notifications
  - Usage: Tier request submission feedback, admin action confirmations
  - Variants: default, destructive

- **RadioGroup** (`@/components/ui/radio-group`): For tier selection
  - Usage: Select desired tier in TierUpgradeRequestForm
  - Sub-components: RadioGroupItem, Label

**Custom Components** (built on library):
- **VendorServiceAreaMap**: Combines Leaflet.js with OpenFreeMap tiles and shadcn Card for map container
  - Built from: Card (wrapper), Leaflet.js map instance with OpenFreeMap tile layer
  - Purpose: Display interactive service region maps on vendor profiles
  - Map Tiles: OpenFreeMap (https://openfreemap.org) - free, open-source alternative to Google Maps/Mapbox
  - Props: serviceRegions (geographic data), zoom, center, interactive

- **TierFeatureList**: Custom list component showing tier-specific features
  - Built from: Card, Badge, custom CheckCircle icons
  - Purpose: Display feature availability per tier in comparison table
  - Props: tier ('free' | 'tier1' | 'tier2'), features (string[]), highlightAvailable

- **LocationProximitySlider**: Custom slider for radius-based search
  - Built from: shadcn Slider, Label, custom distance formatting
  - Purpose: Allow users to specify search radius for proximity filtering
  - Props: value (km), onChange, min, max, step

### Page Layout Architecture

**Layout Approach**: Next.js App Router with nested layouts, CSS Grid for page structure

**Global Layout Structure**:
```
┌─────────────────────────────────────┐
│  Header (h-16)                       │
│  - Logo, Main Nav, User Menu         │
├──────┬──────────────────────────────┤
│      │                              │
│ Side │  Main Content Area           │
│ Nav  │  (Dashboard or Public Pages) │
│(240px│  - Dynamic content           │
│      │                              │
└──────┴──────────────────────────────┘
```

**Layout Implementation**:
- Using: CSS Grid for dashboard layout, Flexbox for components
- Grid configuration: `grid-cols-[240px_1fr]` for dashboard, gap-4
- Breakpoints: Mobile (<1024px) collapses sidebar to drawer overlay

**Page-Specific Layouts**:

#### Vendor Dashboard - Subscription Page Layout
- **Layout Pattern**: Form Centered with sidebar navigation
- **Structure**:
  ```
  ┌─────────────────────────────────────┐
  │ Dashboard Header                    │
  │ - Breadcrumbs: Dashboard > Subscription
  │ - Current Tier Badge                │
  ├──────┬──────────────────────────────┤
  │ Nav  │ Tier Comparison Table        │
  │ Side │ ┌──────┬──────┬──────┐       │
  │ bar  │ │ Free │Tier 1│Tier 2│       │
  │      │ └──────┴──────┴──────┘       │
  │      │                              │
  │      │ Tier Request Status          │
  │      │ (if pending request exists)  │
  └──────┴──────────────────────────────┘
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Side-by-side tier comparison cards, persistent nav
  - Tablet (640-1024px): Stacked tier cards (2 per row), collapsible nav
  - Mobile (<640px): Single column, drawer nav, accordion tier details

#### Admin Tier Approval Queue Layout
- **Layout Pattern**: Data Table with filters header
- **Structure**:
  ```
  ┌─────────────────────────────────────┐
  │ Admin Header                        │
  │ - Title: "Tier Requests"            │
  │ - Filter: Status dropdown, Search   │
  ├─────────────────────────────────────┤
  │ Requests Table                      │
  │ ┌──────┬──────┬──────┬──────────┐   │
  │ │Vendor│Req.  │Curr. │Actions   │   │
  │ │Name  │Tier  │Tier  │Appr./Rej.│   │
  │ └──────┴──────┴──────┴──────────┘   │
  └─────────────────────────────────────┘
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): Full table with all columns visible
  - Tablet (640-1024px): Hide less critical columns (request date)
  - Mobile (<640px): Card-based view instead of table

#### Public Vendor Listing with Location Filter Layout
- **Layout Pattern**: Sidebar Filter + Grid List
- **Structure**:
  ```
  ┌─────────────────────────────────────┐
  │ Page Header                         │
  │ - Title: "Marine Technology Vendors"│
  ├──────┬──────────────────────────────┤
  │      │ Vendor Grid                  │
  │Filter│ ┌────┬────┬────┐             │
  │Panel │ │Card│Card│Card│             │
  │ -Loc.│ ├────┼────┼────┤             │
  │ -Cat.│ │Card│Card│Card│             │
  │      │ └────┴────┴────┘             │
  │      │ Service Area Map (optional)  │
  └──────┴──────────────────────────────┘
  ```
- **Responsive Behavior**:
  - Desktop (≥1024px): 3-column grid, fixed sidebar filter
  - Tablet (640-1024px): 2-column grid, collapsible filter drawer
  - Mobile (<640px): 1-column grid, filter bottom sheet

**Component Hierarchy** (Subscription Page):
```
SubscriptionPage
├── DashboardHeader
│   ├── Breadcrumbs
│   ├── PageTitle
│   └── CurrentTierBadge
├── DashboardSidebar (persistent nav)
└── MainContentContainer
    ├── TierComparisonTable
    │   ├── FreeTierCard
    │   │   ├── CardHeader (tier name, badge)
    │   │   ├── CardContent (feature list)
    │   │   └── CardFooter (CTA button - disabled)
    │   ├── Tier1Card
    │   │   ├── CardHeader
    │   │   ├── CardContent
    │   │   └── CardFooter (Select Tier button)
    │   └── Tier2Card
    │       ├── CardHeader
    │       ├── CardContent
    │       └── CardFooter (Select Tier button)
    └── TierRequestStatusCard (conditional)
        ├── StatusBadge (pending/approved/rejected)
        ├── RequestDetails
        └── CancelRequestButton (if pending)
```

### Navigation Architecture

**Navigation Pattern**: Sidebar navigation for dashboard, top bar for public pages

**Navigation Structure**:
```
Vendor Dashboard Sidebar
├── Overview (/vendor/dashboard)
├── Profile (/vendor/dashboard/profile)
│   ├── Basic Info
│   ├── Premium Content (Tier 2+ only)
│   └── Service Regions
├── Subscription (/vendor/dashboard/subscription)
├── Analytics (Tier 3 only) (/vendor/dashboard/analytics)
└── Settings (/vendor/dashboard/settings)

Admin Dashboard Sidebar
├── Overview (/admin)
├── Vendors (/admin/vendors)
├── Tier Requests (/admin/tier-requests)
├── Tier Audit (/admin/tier-audit)
└── Users (/admin/users)
```

**Navigation Implementation**:
- **Primary Nav**: Custom NavSidebar component (vendor/admin dashboards)
  - Structure: Vertical list with nested items, active state highlighting
  - Styling: Tailwind CSS with shadcn styling patterns
  - Mobile: Drawer overlay with backdrop, triggered by hamburger button
- **Breadcrumbs**: Auto-generated from route segments
  - Generation: Auto from routes using Next.js pathname
  - Pattern: Home > Dashboard > Subscription
- **User Menu**: shadcn DropdownMenu component
  - Trigger: User avatar click in top-right corner
  - Items: Profile, Settings, Tier Status, Logout

**Navigation Components**:

- **VendorDashboardNav**: Sidebar navigation for vendor dashboard
  - Position: fixed-left on desktop, overlay drawer on mobile
  - Width: 240px desktop, full-width mobile overlay
  - Active state: Primary color background for current page
  - Collapsible: No (always visible on desktop)
  - Mobile behavior: Overlay drawer with backdrop, close on navigation

- **Breadcrumbs**: Shown on all dashboard pages
  - Pattern: Home > Section > Page
  - Implementation: Custom component using Next.js usePathname

- **UserMenu**: User account dropdown in header
  - Location: top-right corner of header
  - Trigger: Click on user avatar or name
  - Items: View Profile, Subscription (current tier badge), Settings, Logout

**Navigation State Management**:
- **Active Route Tracking**: Next.js usePathname hook
- **Mobile Menu State**: Local component state (useState)
- **Breadcrumb Data**: Auto-generated from routes, no manual state needed

### User Flow & Interaction Patterns

**Primary User Flows**:

#### Flow 1: Vendor Tier Upgrade Request
1. **Starting Point**: Vendor dashboard homepage
2. **Trigger**: User clicks "Upgrade Subscription" link in sidebar (Button component from shadcn)
3. **Action**: Navigate to /vendor/dashboard/subscription
4. **Page/Component Loads**: SubscriptionPage renders TierComparisonTable
   - Uses Card components from shadcn for each tier
   - Validation: Client-side check that user is authenticated vendor
   - Loading state: Skeleton loaders while fetching current tier data
5. **User Interaction**: Vendor reviews tier features, clicks "Select Tier 2" button
   - Opens TierUpgradeRequestForm modal (Dialog component from shadcn)
   - Real-time feedback: Form shows current tier vs requested tier
6. **Submit/Complete**: Vendor enters optional reason, clicks "Submit Request"
   - Loading indicator: Button shows spinner during API call
   - API call: POST /api/tier-requests
7. **Success Path**:
   - Notification: Toast notification "Tier upgrade request submitted successfully" (shadcn Toast)
   - Navigation: Modal closes, stays on subscription page
   - UI update: TierRequestStatusCard appears showing "Pending" status
8. **Error Path**:
   - Error display: Toast notification with error message
   - Form state: Preserved (user can retry submission)
   - Recovery action: Edit reason and resubmit, or contact support

#### Flow 2: Admin Tier Request Approval
1. **Starting Point**: Admin dashboard
2. **Trigger**: Admin clicks "Tier Requests" in sidebar
3. **Action**: Navigate to /admin/tier-requests
4. **Page/Component Loads**: AdminTierApprovalQueue renders data table
   - Uses Table components from shadcn
   - Validation: Admin role check (redirects non-admins)
   - Loading state: Skeleton rows in table while fetching pending requests
5. **User Interaction**: Admin reviews request details, clicks "Approve" button (shadcn Button)
   - Opens confirmation dialog (Dialog component)
   - Real-time feedback: Shows vendor name, current tier, requested tier
6. **Submit/Complete**: Admin optionally adds notes, confirms approval
   - Loading indicator: Button disabled with spinner
   - API call: PATCH /api/tier-requests/:id with status: 'approved'
7. **Success Path**:
   - Notification: Toast "Tier request approved for [Vendor Name]"
   - Navigation: Stays on admin tier requests page
   - UI update: Request row updated to show "Approved" badge, moves to filtered view
8. **Error Path**:
   - Error display: Toast with error message
   - Form state: Dialog remains open for retry
   - Recovery action: Admin can retry approval or reject instead

#### Flow 3: Location-Based Vendor Discovery
1. **Starting Point**: Public vendor listing page (/vendors)
2. **Trigger**: User selects "United States" from country filter (Select component from shadcn)
3. **Action**: Update URL query params (?country=US), trigger vendor re-fetch
4. **Page/Component Loads**: VendorLocationFilter + VendorListingGrid update
   - Uses Select for dropdowns, Card grid for vendor listings
   - Validation: N/A (public page)
   - Loading state: Skeleton cards while fetching filtered vendors
5. **User Interaction**: User further filters by state "California"
   - Real-time feedback: State dropdown now shows only US states
   - Error states: If no vendors found, show empty state message
6. **Submit/Complete**: N/A (filter updates are immediate)
7. **Success Path**:
   - Notification: N/A (visual update is sufficient)
   - Navigation: URL updates with filter params (shareable)
   - UI update: Vendor grid shows only California-based vendors
8. **Error Path**:
   - Error display: Empty state with helpful message ("No vendors in California. Try nearby states?")
   - Form state: Filters preserved
   - Recovery action: User can clear filters or expand to nearby regions

**Component Interaction Patterns**:

- **Master-Detail Pattern** (Tier Requests):
  - AdminTierApprovalQueue (Table component from shadcn) →
  - User action: Click on table row →
  - TierRequestDetailModal (Dialog component) displays with full request details
  - State management: TanStack Query cache provides request data
  - Data flow: AdminTierApprovalQueue → selectedRequestId state → TierRequestDetailModal receives data via props

**Form Submission Pattern** (standardized across all forms):
  1. User fills form (shadcn Input, Select, Textarea components)
  2. Client-side validation: React Hook Form with Zod schema validation
  3. Submit button: Loading state with shadcn Button (disabled + spinner)
  4. API call: TanStack Query mutation (POST/PATCH endpoint)
  5. Success: Toast notification + modal close + data refetch
  6. Error: Toast notification + form remains open + error message under fields

### Component Integration Map

**How Components Work Together**:

#### Tier Upgrade Request Flow Integration
```
User Action: Click "Select Tier 2" button
↓
SubscriptionPage (manages tier comparison state)
↓
Data flows to child components:
  ├→ TierComparisonTable (receives available tiers, current tier)
  ├→ TierUpgradeRequestForm (receives selected tier, current tier)
  └→ TierRequestStatusCard (receives pending request data if exists)
↓
User interacts: Submits tier upgrade request form
↓
API mutation triggers:
  - POST /api/tier-requests (create new request)
  - TanStack Query invalidates tier request cache
  - TierRequestStatusCard updates to show "Pending" status
  - Toast notification confirms submission
```

#### Admin Approval Flow Integration
```
Admin Action: Click "Approve" on tier request
↓
AdminTierApprovalQueue (fetches pending requests via TanStack Query)
↓
Data flows to child components:
  ├→ TierRequestTable (receives requests array)
  ├→ TierRequestRow (receives individual request data)
  └→ ApprovalActionButtons (receives request ID, status)
↓
Admin interacts: Confirms approval in dialog
↓
API mutation triggers:
  - PATCH /api/tier-requests/:id (update request status)
  - Background: Backend updates vendor.tier field automatically
  - TanStack Query invalidates requests cache
  - Row updates to show "Approved" badge
  - Toast confirms successful approval
```

#### Component Communication Patterns

**Page → Container → Presentational Pattern**:
```
SubscriptionPage (manages routing, fetches tier data via TanStack Query)
  ↓ passes tierData, currentTier props
TierComparisonTable (manages tier selection state, handles button clicks)
  ↓ passes individual tier props + onSelectTier event handler
TierCard (displays tier features, emits selection event)
  ↑ emits onSelectTier(tier) event on button click
TierComparisonTable (opens modal with selected tier)
  ↑ updates selectedTier state
SubscriptionPage (re-renders with modal open)
```

**State Flow Between Components**:
- **Global State** (Context API - VendorTierContext):
  - Current tier, pending request status, available features
  - Accessed by: TierGate, TierComparisonTable, TierRequestStatusCard
  - How: useVendorTier() custom hook

- **Shared Component State** (props drilling):
  - TierComparisonTable manages tier selection state
  - Passes to: TierCard (display), TierUpgradeRequestForm (submission)

- **API Data Flow**:
  - Fetched in: SubscriptionPage using TanStack Query
  - Cached with: TanStack Query default 5-minute stale time
  - Shared via: Props to child components, Context for tier status

---

## Frontend-Backend Integration

### API Contract

**Contract Owner**: Backend provides REST API, Frontend consumes via TanStack Query

**Type Sharing Strategy**:
- Shared TypeScript types package in `/lib/types/` directory
- Backend API response types defined in `/lib/types/api.ts`
- Frontend components import types from shared package
- No code generation needed (manual type definitions)

**Data Flow**:
1. User selects tier in Frontend (TierUpgradeRequestForm) →
2. API call to Backend POST /api/tier-requests →
3. Backend validates request, creates tier_request record →
4. Backend responds with request details →
5. Frontend updates UI (shows pending status, toast notification)

### Integration Points

**Frontend Calls Backend For**:
- Vendor clicks "Submit Tier Request" → POST /api/tier-requests
- Admin clicks "Approve Request" → PATCH /api/tier-requests/:id
- User filters vendors by location → GET /api/vendors?country=US&state=CA
- Vendor dashboard loads → GET /api/tier-requests (fetch pending request status)
- Admin loads audit history → GET /api/admin/tier-audit

**Error Handling Strategy**:
- **Network Errors**: TanStack Query retry with exponential backoff (3 attempts), then show toast "Unable to connect. Please check your internet."
- **Validation Errors**: Display field-level errors from backend response under form inputs, e.g., "Requested tier must be different from current tier"
- **Authentication Errors**: Redirect to /login with return URL, clear auth tokens from localStorage

### Testing Strategy

**Frontend Tests**:
- Unit tests for components: TierGate logic, TierCard rendering
- Integration tests for state management: VendorTierContext provider
- Mock backend API responses using Mock Service Worker (MSW)

**Backend Tests**:
- Unit tests for business logic: TierRequestService methods
- Integration tests for API endpoints: POST /api/tier-requests validation
- Database integration tests: tier_requests table constraints, foreign keys

**E2E Tests**:
- Full vendor tier upgrade workflow: Submit request → Admin approval → Tier updates
- Location-based filtering: Select country → Filter vendors → Map display
- Tier-gated feature access: Free vendor tries to access Tier 2 feature → Upgrade prompt

---

## Implementation Architecture

### Component Structure

#### **TierRequestService**

- **Responsibilities**: Handle tier upgrade request creation, retrieval, approval/rejection
- **Implementation approach**: Service class with methods for each tier request operation, validates business rules before database operations
- **Dependencies**: Payload CMS API for vendor lookup, TierAuditService for logging, NotificationService for request status updates
- **Interface contracts**:
  ```typescript
  interface ITierRequestService {
    createTierRequest(vendorId: string, requestedTier: string, reason?: string): Promise<TierRequest>
    getTierRequests(filters: TierRequestFilters): Promise<TierRequest[]>
    approveTierRequest(requestId: string, adminId: string, notes?: string): Promise<void>
    rejectTierRequest(requestId: string, adminId: string, notes?: string): Promise<void>
  }
  ```

#### **VendorGeographyService**

- **Responsibilities**: Manage vendor service regions, perform location-based queries, geocode addresses
- **Implementation approach**: Use OpenFreeMap for map display, implement server-side geocoding with OpenStreetMap Nominatim API (free), cache geocoded results, provide proximity search via PostGIS or haversine formula
- **Dependencies**: OpenStreetMap Nominatim geocoding API (free), Payload CMS vendor collection, geographic coordinate validation utilities
- **Interface contracts**:
  ```typescript
  interface IVendorGeographyService {
    getVendorsByRegion(region: GeographicRegion): Promise<Vendor[]>
    getVendorsByProximity(lat: number, lon: number, radiusKm: number): Promise<Vendor[]>
    updateServiceRegions(vendorId: string, regions: ServiceRegion[]): Promise<void>
    geocodeLocation(address: string): Promise<{ lat: number, lon: number }>
  }
  ```

#### **TierFeatureService**

- **Responsibilities**: Validate tier-specific feature access, return available features for a tier, enforce tier limits
- **Implementation approach**: Configuration-driven feature gates using TypeScript enum or JSON config, middleware for backend API validation
- **Dependencies**: Vendor tier lookup (from VendorService), feature configuration file
- **Interface contracts**:
  ```typescript
  interface ITierFeatureService {
    checkFeatureAccess(vendorId: string, feature: string): Promise<boolean>
    getAvailableFeatures(tier: VendorTier): string[]
    getTierLimits(tier: VendorTier): Record<string, number>
  }
  ```

### Data Flow

1. **User Initiates Tier Upgrade**: User clicks "Select Tier 2" button on SubscriptionPage →
2. **Frontend Validation**: React Hook Form validates that selected tier differs from current tier →
3. **API Request Submitted**: TanStack Query mutation sends POST /api/tier-requests with { requested_tier: 'tier2', reason: 'Want advanced analytics' } →
4. **Backend Processing**: TierRequestService creates tier_request record, validates no duplicate pending request, logs audit entry →
5. **Response Returned**: Backend responds with { success: true, data: { request_id, status: 'pending' } } →
6. **UI Update**: Frontend displays "Pending" badge, invalidates tier request cache, shows success toast

**Flow Details**:
- **Step 1**: User interaction triggers local state update (selectedTier set to 'tier2')
- **Step 2**: Form submission handler runs Zod schema validation, checks requiredTier !== currentTier
- **Step 3**: TanStack Query useMutation hook executes fetch to /api/tier-requests endpoint
- **Step 4**: API route handler calls TierRequestService.createTierRequest, inserts into tier_requests table, calls AuditService.logTierChange
- **Step 5**: Response JSON serialized and returned to frontend
- **Step 6**: Mutation onSuccess callback invalidates 'tierRequests' query key, TierRequestStatusCard re-renders with new data

### State Management

**State Management Pattern**: Combination of Context API (VendorTierContext) and TanStack Query (API data caching)

**Implementation Details**:
- **VendorTierContext**: Wraps vendor dashboard pages, provides currentTier and helper functions
- **TanStack Query**: Manages server state (tier requests, vendor data), automatic background refetching

**State Stores**:
- **VendorTierContext State**:
  ```typescript
  interface VendorTierState {
    currentTier: 'free' | 'tier1' | 'tier2'
    pendingRequest: TierRequest | null
    availableFeatures: string[]
    tierLimits: { maxProducts: number, maxGalleryImages: number }
  }
  ```
- **TanStack Query Cache Keys**:
  - `['tierRequests', vendorId]`: Vendor's tier request history
  - `['vendors', { country, state, city }]`: Filtered vendor listings
  - `['admin', 'tierRequests', 'pending']`: Admin pending approval queue

### Error Handling

**Error Handling Strategy**: Centralized error handling with user-friendly messages, logging for debugging

**Error Scenarios**:
- **Duplicate Tier Request**: User tries to submit second request while one is pending
  - **Handling**: Backend returns 400 error with code 'DUPLICATE_REQUEST', frontend displays toast "You already have a pending tier request"
- **Invalid Tier Selection**: User manipulates form to select invalid tier (e.g., 'tier3')
  - **Handling**: Backend validation rejects with 400 error, frontend Zod schema prevents submission
- **Network Failure During Submission**: API call times out or returns 500 error
  - **Handling**: TanStack Query retries 3 times with exponential backoff, then shows error toast "Unable to submit request. Please try again later."
- **Unauthorized Access to Premium Feature**: Free tier vendor tries to access Tier 2 analytics dashboard
  - **Handling**: TierGate component renders TierUpgradePrompt instead of analytics, backend API endpoint returns 403 Forbidden if called directly

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REQUEST",
    "message": "You already have a pending tier upgrade request",
    "details": "Wait for admin approval or cancel existing request before submitting a new one",
    "timestamp": "2025-10-18T14:32:10Z"
  }
}
```

## Integration Points

### Existing Code Dependencies

#### **Payload CMS Vendors Collection Integration**

- **Purpose**: Extend existing vendor schema with geographic and tier-related fields
- **Interface requirements**: Add new fields to Payload vendors collection schema (serviceCountries, serviceStates, serviceCities, serviceCoordinates)
- **Data exchange**: TierRequestService reads/updates vendor.tier field, VendorGeographyService reads/updates service region fields
- **Error handling**: If vendor not found (invalid vendor_id), return 404 error; if Payload API fails, log error and return 500

#### **Existing TierGate Component Integration**

- **Purpose**: Enhance current tier gating logic with more granular feature access and upgrade prompts
- **Interface requirements**: Maintain existing props (requiredTier, children, fallback), add new props (showUpgradePrompt, upgradeCallToAction)
- **Data exchange**: TierGate reads currentTier from VendorTierContext, conditionally renders children or TierUpgradePrompt
- **Error handling**: If tier context is undefined (e.g., non-vendor user), default to free tier assumptions

#### **Existing Vendor Dashboard Layout Integration**

- **Purpose**: Add new "Subscription" and "Premium Features" menu items to vendor dashboard sidebar
- **Interface requirements**: Extend DashboardNav component with new navigation links, conditionally render premium features link based on tier
- **Data exchange**: DashboardNav receives currentTier from context to highlight tier-specific menu items
- **Error handling**: N/A (navigation links always visible, access control handled at page level)

### API Contracts

#### **POST /api/tier-requests**

**Purpose**: Create new tier upgrade/downgrade request

**Request Structure**:
```json
{
  "requested_tier": "tier2",
  "vendor_reason": "I want to showcase my certifications and case studies to attract more leads"
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "vendor_id": "vendor-uuid",
    "current_tier": "free",
    "requested_tier": "tier2",
    "status": "pending",
    "created_at": "2025-10-18T14:30:00Z"
  }
}
```

**Error Responses**:
- 400: `{ success: false, error: { code: 'INVALID_TIER', message: 'Requested tier must be free, tier1, or tier2' } }`
- 400: `{ success: false, error: { code: 'DUPLICATE_REQUEST', message: 'You already have a pending tier request' } }`
- 401: `{ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }`

#### **PATCH /api/tier-requests/:id**

**Purpose**: Admin approves or rejects tier change request

**Request Structure**:
```json
{
  "status": "approved",
  "admin_notes": "Vendor has good track record, approved for Tier 2"
}
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "vendor_id": "vendor-uuid",
    "previous_tier": "free",
    "new_tier": "tier2",
    "status": "approved",
    "admin_notes": "Vendor has good track record, approved for Tier 2",
    "updated_at": "2025-10-18T15:00:00Z"
  }
}
```

**Error Responses**:
- 400: `{ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be approved or rejected' } }`
- 403: `{ success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } }`
- 404: `{ success: false, error: { code: 'NOT_FOUND', message: 'Tier request not found' } }`

### Database Interactions

#### **vendors Table**

**Operations**: Read vendor tier and service regions, update service regions

**Queries**:
- **Get Vendors by Region**:
  ```sql
  SELECT * FROM vendors
  WHERE 'United States' = ANY(service_countries)
    AND service_states @> '[{"country": "US", "state": "California"}]'::jsonb
  LIMIT 20 OFFSET 0;
  ```
- **Update Vendor Service Regions**:
  ```sql
  UPDATE vendors
  SET service_countries = $1,
      service_states = $2,
      service_cities = $3,
      service_coordinates = $4,
      updated_at = NOW()
  WHERE id = $5;
  ```

**Indexes**:
- `idx_vendors_service_countries` (GIN index on service_countries array)
- `idx_vendors_service_states` (GIN index on service_states JSONB)

**Constraints**:
- `tier` ENUM constraint ('free', 'tier1', 'tier2')
- Foreign key constraint on categories (existing)

#### **tier_requests Table**

**Operations**: Insert new tier request, update request status, query pending requests

**Queries**:
- **Create Tier Request**:
  ```sql
  INSERT INTO tier_requests (vendor_id, current_tier, requested_tier, vendor_reason)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  ```
- **Get Pending Requests (Admin)**:
  ```sql
  SELECT tr.*, v.name as vendor_name
  FROM tier_requests tr
  JOIN vendors v ON tr.vendor_id = v.id
  WHERE tr.status = 'pending'
  ORDER BY tr.created_at ASC;
  ```
- **Approve Tier Request**:
  ```sql
  UPDATE tier_requests
  SET status = 'approved',
      admin_id = $1,
      admin_notes = $2,
      processed_at = NOW(),
      updated_at = NOW()
  WHERE id = $3
  RETURNING *;
  ```

**Indexes**:
- `idx_tier_requests_vendor` (on vendor_id for vendor's request history)
- `idx_tier_requests_status` (on status for admin filtering)

**Constraints**:
- `no_duplicate_pending` UNIQUE partial index (prevents multiple pending requests per vendor)
- Foreign key to `vendors(id)` with ON DELETE CASCADE

### External Services Integration

#### **OpenFreeMap Tile Server Integration**

**Protocol**: HTTPS
**Authentication**: None required (public tile server)

**Tile URL Pattern**:
- **Base URL**: `https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png`
- **Usage**: Display interactive maps in VendorServiceAreaMap component
- **Attribution**: © OpenStreetMap contributors (required by license)

**Configuration**:
```typescript
const mapConfig = {
  tileUrl: 'https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png',
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  minZoom: 2
}
```

**Rate Limiting**: No explicit rate limits (public service), but implement client-side tile caching

**Benefits**:
- **Free**: No API key required, no usage limits
- **Open Source**: Based on OpenStreetMap data
- **Privacy**: No tracking or data collection
- **Fast**: CDN-backed tile delivery

#### **OpenStreetMap Nominatim Geocoding API Integration**

**Protocol**: HTTPS REST API
**Authentication**: None required (free public API)

**Endpoints**:
- **Geocode Address (Search)**:
  ```
  GET https://nominatim.openstreetmap.org/search?q=123+Main+St+San+Diego+CA&format=json
  ```
  - **Usage**: Convert vendor address to lat/lon coordinates for service region mapping
  - **Response**: JSON array with lat/lon and address details

- **Reverse Geocode**:
  ```
  GET https://nominatim.openstreetmap.org/reverse?lat=32.7157&lon=-117.1611&format=json
  ```
  - **Usage**: Get location name from coordinates for proximity search results
  - **Response**: JSON object with address components

**Rate Limiting**:
- **Limit**: 1 request per second (strictly enforced)
- **Implementation**: Queue geocoding requests with 1-second delay between calls
- **Bulk Operations**: Use batch geocoding for initial vendor data import

**Required Headers**:
```typescript
headers: {
  'User-Agent': 'Marine-Tech-Platform/1.0 (contact@yourplatform.com)'
}
```

**Error Handling**:
- If geocoding fails (invalid address), log error and fallback to manual coordinate entry
- Cache geocoding results in database to minimize API calls (essential due to rate limits)
- Show user-friendly error: "Unable to geocode address. Please enter coordinates manually."
- Implement exponential backoff for rate limit errors (429 status)

**Timeout Configuration**: 10 second timeout for geocoding requests, 3 retry attempts with exponential backoff

**Best Practices**:
- **Always cache results**: Store lat/lon in database to avoid repeated API calls
- **Respect rate limits**: Implement request queue with 1s minimum interval
- **Provide User-Agent**: Required by Nominatim usage policy
- **Manual fallback**: Allow vendors to manually enter coordinates if geocoding fails

## Implementation Patterns

### Design Patterns

**Primary Patterns**:
- **Repository Pattern**: Centralize database access logic in repository classes (VendorRepository, TierRequestRepository)
  - **Usage**: All database queries go through repository methods, controllers never directly query database
  - **Benefits**: Easier to mock for testing, centralized query optimization, consistent error handling

- **Service Layer Pattern**: Business logic lives in service classes (TierRequestService, VendorGeographyService)
  - **Implementation**: Services orchestrate repositories and external APIs, enforce business rules
  - **Benefits**: Controllers stay thin, business logic is reusable and testable

**Pattern Selection Rationale**: Repository and Service Layer patterns are standard for backend API development, providing clear separation of concerns between data access, business logic, and HTTP request handling. This makes the codebase easier to test, maintain, and scale.

### Code Organization

```
/home/edwin/development/ptnextjs/
├── app/
│   ├── vendor/
│   │   └── dashboard/
│   │       ├── subscription/
│   │       │   └── page.tsx (SubscriptionPage)
│   │       └── profile/
│   │           └── premium/
│   │               └── page.tsx (PremiumProfileEditor)
│   ├── admin/
│   │   ├── tier-requests/
│   │   │   └── page.tsx (AdminTierApprovalQueue)
│   │   └── tier-audit/
│   │       └── page.tsx (TierAuditLogViewer)
│   ├── vendors/
│   │   └── page.tsx (VendorListingPage with location filters)
│   └── api/
│       ├── tier-requests/
│       │   ├── route.ts (POST, GET)
│       │   └── [id]/
│       │       └── route.ts (PATCH)
│       ├── admin/
│       │   ├── vendors/
│       │   │   └── [id]/
│       │   │       └── tier/
│       │   │           └── route.ts (POST admin tier override)
│       │   └── tier-audit/
│       │       └── route.ts (GET audit logs)
│       └── vendors/
│           ├── route.ts (GET vendors with location filters)
│           └── [id]/
│               └── service-regions/
│                   └── route.ts (GET vendor service regions)
├── components/
│   ├── vendor/
│   │   ├── TierComparisonTable.tsx
│   │   ├── TierCard.tsx
│   │   ├── TierUpgradeRequestForm.tsx
│   │   ├── TierRequestStatusCard.tsx
│   │   ├── VendorServiceAreaMap.tsx
│   │   └── VendorLocationFilter.tsx
│   ├── admin/
│   │   ├── AdminTierApprovalQueue.tsx
│   │   ├── TierRequestTable.tsx
│   │   └── TierAuditLogViewer.tsx
│   ├── shared/
│   │   ├── TierGate.tsx (enhanced version)
│   │   └── TierUpgradePrompt.tsx
│   └── ui/ (shadcn components)
├── lib/
│   ├── services/
│   │   ├── TierRequestService.ts
│   │   ├── VendorGeographyService.ts
│   │   ├── TierFeatureService.ts
│   │   └── AuditService.ts
│   ├── repositories/
│   │   ├── VendorRepository.ts
│   │   └── TierRequestRepository.ts
│   ├── contexts/
│   │   └── VendorTierContext.tsx
│   ├── hooks/
│   │   ├── useVendorTier.ts
│   │   └── useTierRequests.ts
│   ├── types/
│   │   ├── vendor.ts
│   │   ├── tier.ts
│   │   └── api.ts
│   └── utils/
│       ├── tierValidation.ts
│       └── geolocation.ts
└── tests/
    ├── unit/
    │   ├── TierRequestService.test.ts
    │   └── TierGate.test.tsx
    ├── integration/
    │   ├── tier-requests-api.test.ts
    │   └── vendor-location-filter.test.ts
    └── e2e/
        ├── tier-upgrade-flow.spec.ts
        └── location-based-search.spec.ts
```

**File Organization Guidelines**:
- **Component files**: Group by feature domain (vendor/, admin/, shared/), each component in its own file with .tsx extension
- **Service files**: All services in lib/services/ directory, one service per file, named {Feature}Service.ts
- **Utility files**: Pure functions in lib/utils/, organized by domain (tierValidation.ts, geolocation.ts)
- **Test files**: Mirror source file structure in tests/, use .test.ts/.test.tsx extension

### Naming Conventions

**Components**: PascalCase, descriptive noun phrases (TierComparisonTable, VendorServiceAreaMap)
**Services**: PascalCase with "Service" suffix (TierRequestService, VendorGeographyService)
**Utilities**: camelCase function names (checkTierAccess, geocodeAddress)
**Types/Interfaces**: PascalCase with "I" prefix for interfaces (IVendorTierState, ITierRequest)
**Constants**: UPPER_SNAKE_CASE for true constants (MAX_TIER_REQUESTS, DEFAULT_SEARCH_RADIUS)

**Variable Naming**:
- **Functions**: camelCase, verb phrases (createTierRequest, getVendorsByRegion)
- **Variables**: camelCase, descriptive nouns (currentTier, pendingRequest, serviceRegions)
- **Class methods**: camelCase, verb phrases matching functionality (approveTierRequest, logAuditEntry)

### Coding Standards

**Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

**Key Standards**:
- **Indentation**: 2 spaces (never tabs)
- **Line length**: Maximum 100 characters (enforced by ESLint)
- **Comments**: Explain "why" not "what" - focus on business logic rationale and complex algorithms
- **Error handling**: Always include proper error handling with try/catch blocks and meaningful error messages
- **Type safety**: Use TypeScript for all new code, no `any` types without explicit justification

**Quality Requirements**:
- **Test coverage**: Minimum 80% coverage for new services and components
- **Documentation**: All public API endpoints must have OpenAPI/JSDoc comments
- **Performance**: API endpoints must respond within 500ms for p95 percentile
- **Security**: All tier change operations must validate admin authentication and log audit trail

## Performance Criteria

### Response Time Requirements

**Target Response Time**:
- API endpoints: < 500ms for p95 (95th percentile)
- Page loads: < 2s for initial render (with loading states)
- Tier upgrade request submission: < 1s

**Measurement Points**:
- Backend: Measure at API route handler entry/exit with performance.now()
- Frontend: Measure with TanStack Query devtools, Core Web Vitals (LCP, FID, CLS)

**Optimization Strategies**:
- Database query optimization: Add indexes for frequently filtered columns (service_countries, tier_requests.status)
- API response caching: Use TanStack Query with 5-minute stale time for vendor listings
- Lazy loading: Code-split premium feature components to reduce initial bundle size
- Image optimization: Use Next.js Image component for vendor logos and gallery images

### Throughput Requirements

**Target Throughput**:
- 100 concurrent users browsing vendor listings
- 20 tier requests per minute during peak hours
- 10 admin approvals per minute

**Load Testing Scenarios**:
- Simulate 100 users filtering vendors by location simultaneously
- Simulate 50 vendors submitting tier requests concurrently
- Simulate 10 admins reviewing and approving requests in parallel

**Scalability Requirements**:
- Horizontal scaling: API can scale to 3+ Next.js server instances behind load balancer
- Database connection pooling: Payload CMS uses connection pool (max 20 connections)
- Cache invalidation: TanStack Query invalidates stale data on mutations

### Concurrency Requirements

**Concurrent Users**:
- Support 200 concurrent vendor dashboard sessions
- Support 500 concurrent public vendor browsing sessions

**Resource Management**:
- Database connection pooling with max 20 connections per instance
- API rate limiting: 100 requests per minute per IP address (public endpoints)
- Memory usage: Keep heap size < 512MB per Next.js instance

**Bottleneck Prevention**:
- Add database indexes for frequently queried fields (vendor.tier, tier_requests.status)
- Implement pagination for vendor listings (default 20 per page, max 100)
- Use TanStack Query background refetching to avoid blocking UI on stale data

## Security Requirements

### Authentication Requirements

**Authentication Method**:
- JWT-based authentication (existing Payload CMS auth system)
- Tokens stored in httpOnly cookies (not localStorage for XSS protection)

**Token Management**:
- Access tokens expire after 1 hour, refresh tokens after 7 days
- Automatic token refresh on API calls if access token expired but refresh token valid
- Logout clears both access and refresh tokens

**Session Handling**:
- Server-side session validation on protected API routes (verify JWT signature)
- Client-side session check on protected pages (redirect to /login if unauthenticated)

### Authorization Requirements

**Authorization Model**:
- Role-Based Access Control (RBAC)
- Roles: Vendor, Admin (existing Payload CMS roles)

**Permission Validation**:
- Vendor role: Can create tier requests, view own tier request history, edit own profile
- Admin role: Can approve/reject tier requests, view all tier requests, assign tiers manually, view audit logs

**Access Control**:
- API route middleware checks user role before processing request
- Frontend TierGate component hides UI elements based on tier
- Backend API endpoints validate tier access even if frontend bypassed

### Data Protection

**Encryption Standard**:
- HTTPS/TLS 1.3 for all data in transit
- No additional encryption for data at rest (database-level encryption if using managed PostgreSQL)

**Data at Rest**:
- Sensitive fields (admin_notes) stored in database without additional encryption (Payload CMS default)
- No credit card data stored (payment integration deferred to Phase 3B)

**Data in Transit**:
- All API calls use HTTPS with TLS 1.3
- Environment variables for API keys (geocoding API) stored in .env.local (not committed to Git)

**Sensitive Data Handling**:
- Admin notes in tier requests are only visible to admins (not shown to vendors)
- Vendor reasons for tier requests are visible to both vendor and admin
- Audit logs record admin IDs for accountability

### Input Validation

**Validation Approach**:
- Client-side: Zod schema validation in forms (React Hook Form integration)
- Server-side: Re-validate all inputs in API route handlers (never trust client)

**Sanitization Rules**:
- Escape HTML in user-provided text fields (vendor_reason, admin_notes) to prevent XSS
- Validate geographic coordinates are within valid ranges (lat: -90 to 90, lon: -180 to 180)

**Injection Prevention**:
- Use parameterized SQL queries for all database operations (no string concatenation)
- Payload CMS ORM automatically escapes inputs, but double-check for raw SQL queries
- Validate enum values (tier must be 'free', 'tier1', or 'tier2')

## Quality Validation Requirements

### Technical Depth Validation

**Implementation Readiness**:
- All API endpoints must have complete request/response TypeScript interfaces defined
- Database schema migrations must include rollback scripts
- Service methods must have detailed JSDoc comments explaining parameters and return values

**Technical Accuracy**:
- Geographic coordinate validation logic must be tested with edge cases (poles, date line)
- Tier request unique constraint must be tested with concurrent submissions
- Audit log entries must be verified to match tier change events exactly

**Completeness Check**:
- All tier-specific features must be documented in TierFeatureService configuration
- All error codes must be listed in API documentation with example responses
- All database indexes must be justified with query performance testing

### Integration Validation

**Compatibility Assessment**:
- Verify new geographic fields don't break existing vendor profile editor
- Ensure TierGate enhancements maintain backward compatibility with current usage
- Test that tier request workflow integrates with existing Payload CMS authentication

**Dependency Validation**:
- Confirm OpenFreeMap tile server is accessible and CDN is performant
- Verify Nominatim API rate limits (1 req/sec) are respected with request queue
- Verify TanStack Query version is compatible with Next.js 14.2.5
- Check shadcn/ui components support required Radix UI primitives

**API Contract Validation**:
- All API endpoints must have matching frontend TanStack Query hooks
- Request/response types must be shared between frontend and backend
- Error response format must be consistent across all endpoints

### Performance Validation

**Performance Benchmarks**:
- Load test vendor location filtering with 1000 vendors, target < 500ms response time
- Benchmark tier request creation with concurrent submissions (20/second), target < 1s
- Measure admin approval queue load time with 100 pending requests, target < 2s initial render

**Resource Requirements**:
- Database query execution plans must show index usage for location filters
- Frontend bundle size increase must be < 50KB after adding new components
- API memory usage must remain < 100MB per request under normal load

**Scalability Assessment**:
- Database must handle 10,000 vendor records with geographic data without performance degradation
- TanStack Query cache must efficiently handle 500 concurrent vendor browsing sessions
- Pagination must prevent loading more than 100 vendor records at once

### Security Validation

**Security Standards Compliance**:
- All API endpoints must require authentication except public vendor listings
- JWT tokens must be validated on every protected route with proper error handling
- Admin-only operations must check role and return 403 if non-admin attempts access

**Vulnerability Assessment**:
- Test for SQL injection by submitting malicious input to location filter parameters
- Verify XSS prevention by submitting HTML/JavaScript in tier request reason field
- Check that direct tier manipulation via API (bypassing frontend) is blocked without admin role

**Authentication/Authorization Validation**:
- Verify expired JWT tokens are rejected with 401 Unauthorized
- Confirm vendors can only view their own tier requests (not other vendors')
- Ensure admin tier override logs audit trail with admin user ID

## Technical Requirements

- **Next.js 14.2.5** with App Router for frontend pages and API routes
- **Payload CMS 3+** for vendor data management and authentication
- **PostgreSQL** for production database (SQLite for local development)
- **TanStack Query 5.0** for frontend data fetching and caching
- **React Hook Form 7.53** with Zod 3.23 for form validation
- **shadcn/ui** (latest) with Radix UI primitives for UI components
- **Leaflet.js 1.9+** for interactive service area maps with OpenFreeMap tiles
- **TypeScript 5.2.2** for type safety across frontend and backend
- **Tailwind CSS 3.3.3** for styling
- **Jest** and **React Testing Library** for unit/integration tests
- **Playwright** for E2E tests

## External Dependencies

- **OpenFreeMap Tile Server** (https://openfreemap.org) - Free, open-source map tiles for interactive maps
  - **Justification:** Essential for visualizing vendor service areas without API costs
  - **Version Requirements:** Public tile server (no versioning)
  - **Cost**: Free (no API key required)
  - **Rate Limits**: None (public CDN)

- **OpenStreetMap Nominatim API** (https://nominatim.openstreetmap.org) - Free geocoding service for address → lat/lon conversion
  - **Justification:** Required for location-based vendor discovery and service region mapping
  - **Version Requirements:** Public API (no versioning)
  - **Cost**: Free (usage policy compliance required)
  - **Rate Limits**: 1 request per second (strict enforcement)

- **Leaflet.js** - Open-source JavaScript library for interactive maps
  - **Justification:** Industry-standard mapping library with excellent OpenFreeMap integration
  - **Version Requirements:** Leaflet 1.9+
  - **Cost**: Free (open source, BSD 2-Clause license)

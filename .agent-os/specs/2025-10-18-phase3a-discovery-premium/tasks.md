# Phase 3A Implementation Tasks - Overview

> **Spec**: Phase 3A - Enhanced Discovery & Premium Services  
> **Created**: 2025-10-18  
> **Status**: Ready for Implementation

## ⚠️ Database Implementation Strategy

**This project uses a dual-path implementation approach:**

### 📘 SQLite Implementation (Primary - Start Here)
- **File**: `tasks-sqlite.md`
- **Purpose**: Rapid development and initial deployment
- **Database**: SQLite with JSON serialization
- **Timeline**: 3-4 weeks
- **Use For**: Development, testing, initial production (<1000 vendors)

### 📗 PostgreSQL Migration (Secondary - After SQLite)
- **File**: `tasks-postgres.md`
- **Purpose**: Production scaling and performance optimization
- **Database**: PostgreSQL with native types, GIN indexes, PostGIS
- **Timeline**: 1-2 weeks (after SQLite complete)
- **Use For**: Production scaling (>1000 vendors), high-performance needs

**Recommendation**: Start with SQLite implementation, migrate to PostgreSQL when needed.

---

## Overview

This document provides a detailed, actionable task breakdown for implementing Phase 3A features:
- Location-based vendor discovery with intelligent geographic matching
- Subscription tier selection and upgrade request system
- Enhanced premium profile features for Tier 2 and Tier 3 vendors
- Admin tier management tools

**Estimated Timeline**: 3-4 weeks (SQLite) + 1-2 weeks (PostgreSQL migration when needed)  
**Complexity**: High (database schema changes, geographic features, premium content system)

## Implementation Paths

### Path 1: SQLite-First (Recommended for Initial Implementation)
✅ **Start Here**: See `tasks-sqlite.md` for complete SQLite implementation  
- JSON serialization for arrays and nested objects
- Application-layer UUID generation
- Boolean as INTEGER (0/1)
- Application-layer unique constraint enforcement
- Performance target: <1000ms p95 for <1000 vendors

### Path 2: PostgreSQL Migration (For Production Scale)
🔄 **Later**: See `tasks-postgres.md` for PostgreSQL migration  
- Native TEXT[], JSONB, UUID, BOOLEAN types
- GIN indexes for 10-20x faster geographic queries
- Database-enforced constraints
- Performance target: <50ms p95 for 10,000+ vendors

---

## Quick Start

1. **Read the spec**: `spec.md` for feature requirements
2. **Choose your path**: Start with `tasks-sqlite.md` (recommended)
3. **Follow the tasks**: Complete sections 1-5 in order
4. **Plan migration**: Review `tasks-postgres.md` for future scaling

---

## Task Categories

### 1. Database Schema & Migrations (5-7 days)
### 2. Backend API Development (7-10 days)
### 3. Frontend Components & UI (7-10 days)
### 4. Integration & Testing (3-5 days)
### 5. Documentation & Deployment (2-3 days)

---

## 1. Database Schema & Migrations

### 1.1 Geographic Vendor Fields
**Priority**: HIGH | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Create migration file: `add-vendor-geographic-fields.ts`
  - Add `service_countries` TEXT[] column with default empty array
  - Add `service_states` JSONB column with default empty array  
  - Add `service_cities` JSONB column with default empty array
  - Add `service_coordinates` JSONB column with default empty array
  - Add `coverage_notes` TEXT column
- [ ] Create GIN indexes for geographic search performance
  - Index on `service_countries` using GIN
  - Index on `service_states` using GIN  
  - Index on `service_cities` using GIN
- [ ] Update Payload CMS vendor collection schema
  - Add `serviceCountries` array field with country autocomplete
  - Add `serviceStates` array field with nested country/state structure
  - Add `serviceCities` array field with nested country/state/city structure
  - Add `serviceCoordinates` array field with lat/lon/label structure
  - Add `coverageNotes` textarea field
- [ ] Create rollback migration for geographic fields
- [ ] Test migration on development database
- [ ] Document geographic data format in schema documentation

**Acceptance Criteria**:
- Migration runs successfully without errors
- All indexes created and verified with `EXPLAIN ANALYZE`
- Payload admin UI shows new geographic fields in vendor editor
- Existing vendors have default empty arrays (no null values)

### 1.2 Tier Requests Table
**Priority**: HIGH | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Create migration file: `create-tier-requests-table.ts`
  - Define table schema with UUID primary key
  - Add foreign key to vendors table with CASCADE delete
  - Add tier enum constraints (free, tier1, tier2)
  - Add status enum constraints (pending, approved, rejected)
  - Add unique constraint for single pending request per vendor
- [ ] Create indexes for tier requests
  - Index on `vendor_id` for vendor-specific queries
  - Index on `status` for admin approval queue
  - Index on `created_at DESC` for chronological sorting
- [ ] Update TypeScript types in `lib/types.ts`
  - Add `TierRequest` interface matching database schema
  - Add `TierRequestStatus` enum type
  - Export types for frontend use
- [ ] Create rollback migration for tier_requests table
- [ ] Test constraint: verify single pending request enforcement
- [ ] Document tier request workflow in schema docs

**Acceptance Criteria**:
- Table created with all constraints enforced
- Duplicate pending requests rejected by database
- Foreign key cascade deletes work correctly
- TypeScript types match database schema exactly

### 1.3 Tier Audit Log Table
**Priority**: HIGH | **Size**: S | **Dependencies**: 1.2

**Tasks**:
- [ ] Create migration file: `create-tier-audit-log-table.ts`
  - Define table schema with UUID primary key
  - Add foreign keys to vendors, users, tier_requests tables
  - Add change_type enum constraints
  - Set created_at with automatic timestamp
- [ ] Create indexes for audit queries
  - Index on `vendor_id` for vendor history
  - Index on `created_at DESC` for chronological audit trail
  - Partial index on `admin_id` (WHERE admin_id IS NOT NULL)
- [ ] Update TypeScript types in `lib/types.ts`
  - Add `TierAuditLog` interface
  - Add `TierChangeType` enum type
- [ ] Create rollback migration for tier_audit_log table
- [ ] Test audit log integrity (immutable, append-only)
- [ ] Document audit log purpose and retention policy

**Acceptance Criteria**:
- Audit log table created successfully
- All foreign key relationships work correctly
- Indexes optimize audit history queries (verify with EXPLAIN)
- TypeScript types exported and usable

### 1.4 Vendor Premium Content Table
**Priority**: MEDIUM | **Size**: L | **Dependencies**: None

**Tasks**:
- [ ] Create migration file: `create-vendor-premium-content-table.ts`
  - Define table schema with UUID primary key
  - Add foreign key to vendors table with CASCADE delete
  - Add content_type enum (certification, case_study, media_gallery, etc.)
  - Add required_tier enum (tier1, tier2)
  - Add content_data JSONB column for flexible content storage
  - Add is_published boolean with default false
- [ ] Create indexes for content queries
  - Index on `vendor_id` for vendor content lookup
  - Index on `content_type` for filtering by type
  - Partial index on `is_published` (WHERE is_published = true)
- [ ] Define JSONB schemas for each content type
  - Document certification schema (name, issuing_org, dates, badge)
  - Document case study schema (title, yacht, challenge, solution, results)
  - Document media gallery schema (images, videos, 3D models)
  - Document team member schema (name, role, expertise, photo)
  - Document product catalog schema (specs, pricing, availability)
- [ ] Update TypeScript types in `lib/types.ts`
  - Add `VendorPremiumContent` interface
  - Add `ContentType` enum
  - Add specific interfaces for each content type (Certification, CaseStudy, etc.)
- [ ] Create rollback migration for vendor_premium_content table
- [ ] Test JSONB storage and retrieval with sample data
- [ ] Document content type schemas with examples

**Acceptance Criteria**:
- Premium content table created with all constraints
- JSONB content_data stores and retrieves complex objects
- Indexes optimize content queries
- TypeScript types cover all content type variations

### 1.5 Migration Execution & Verification
**Priority**: HIGH | **Size**: S | **Dependencies**: 1.1, 1.2, 1.3, 1.4

**Tasks**:
- [ ] Run all migrations in order on local development database
- [ ] Verify schema changes with database inspection tools
- [ ] Seed test data for each new table
  - Create sample tier requests (pending, approved, rejected)
  - Create sample audit log entries
  - Create sample premium content items
  - Add geographic data to test vendors
- [ ] Test foreign key constraints with delete operations
- [ ] Verify index performance with EXPLAIN ANALYZE
- [ ] Backup production-ready migration scripts
- [ ] Document migration order and dependencies

**Acceptance Criteria**:
- All migrations run successfully in sequence
- No database errors or constraint violations
- Test data populates all new tables
- Schema matches technical specification exactly

---

## 2. Backend API Development

### 2.1 Vendor Geography Service
**Priority**: HIGH | **Size**: L | **Dependencies**: 1.1, 1.5

**Tasks**:
- [ ] Create `lib/services/vendor-geography-service.ts`
  - Implement `getVendorsByRegion(region)` method
  - Implement `getVendorsByProximity(lat, lon, radius)` method using haversine formula
  - Implement `updateServiceRegions(vendorId, regions)` method
  - Implement `geocodeLocation(address)` method using OpenStreetMap Nominatim API
  - Add result caching for geocoded addresses (5-minute TTL)
- [ ] Write unit tests for VendorGeographyService
  - Test region filtering with various country/state/city combinations
  - Test proximity search with sample coordinates
  - Test geocoding API integration (mock external API)
  - Test coordinate validation (lat/lon ranges)
- [ ] Implement geographic query optimization
  - Use GIN indexes for array containment queries
  - Add pagination for large result sets (max 100 vendors)
  - Add distance sorting for proximity queries
- [ ] Add error handling for geocoding API failures
  - Retry logic with exponential backoff
  - Fallback to existing coordinates if geocoding fails
  - Log errors for monitoring
- [ ] Document service API in JSDoc comments

**Acceptance Criteria**:
- Service methods return correctly filtered vendors
- Proximity search calculates distances accurately
- Unit tests achieve >90% code coverage
- Geographic queries execute in <500ms for typical datasets

### 2.2 Tier Request Service
**Priority**: HIGH | **Size**: L | **Dependencies**: 1.2, 1.3, 1.5

**Tasks**:
- [ ] Create `lib/services/tier-request-service.ts`
  - Implement `createTierRequest(vendorId, requestedTier, reason)` method
  - Implement `getTierRequests(filters)` method for vendors and admins
  - Implement `approveTierRequest(requestId, adminId, notes)` method
  - Implement `rejectTierRequest(requestId, adminId, notes)` method
  - Add validation: prevent duplicate pending requests
  - Add validation: requested tier must differ from current tier
- [ ] Integrate with TierAuditService for logging
  - Call `logTierChange()` on approval
  - Call `logTierChange()` on rejection with change_type='request_rejected'
  - Pass admin_id and tier_request_id to audit log
- [ ] Implement automatic vendor tier update on approval
  - Update vendors.tier field when request approved
  - Create transaction to ensure atomicity (update vendor + update request + log audit)
  - Rollback on any failure
- [ ] Write unit tests for TierRequestService
  - Test duplicate pending request rejection
  - Test tier validation (current vs requested)
  - Test approval workflow with vendor tier update
  - Test rejection workflow without tier change
  - Test transaction rollback on failure
- [ ] Add notification hooks for request status changes
  - Placeholder for email notifications (implementation in Phase 3B)
  - Log notification events for debugging
- [ ] Document service API and business rules

**Acceptance Criteria**:
- Service enforces single pending request constraint
- Approval updates vendor tier atomically
- Audit log entries created for all tier changes
- Unit tests achieve >90% code coverage
- Business rules documented in code comments

### 2.3 Tier Feature Service
**Priority**: MEDIUM | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Create `lib/services/tier-feature-service.ts`
  - Implement `checkFeatureAccess(vendorId, feature)` method
  - Implement `getAvailableFeatures(tier)` method returning feature list
  - Implement `getTierLimits(tier)` method returning limit config
  - Define tier feature configuration object (JSON or TypeScript config)
- [ ] Define tier feature mapping configuration
  - Free tier: Basic profile, product listings
  - Tier 1: + Certification badges, enhanced analytics
  - Tier 2: + Case studies, media galleries, team profiles, service maps
  - Tier 3: + Product catalogs, performance dashboards, featured placement
- [ ] Create TypeScript types for features
  - Add `TierFeature` enum with all feature names
  - Add `TierLimits` interface (maxProducts, maxGalleryImages, etc.)
- [ ] Write unit tests for TierFeatureService
  - Test feature access for each tier
  - Test tier limit enforcement
  - Test invalid feature name handling
- [ ] Document feature access rules in code comments

**Acceptance Criteria**:
- Feature access check returns correct boolean for all tiers
- Tier limits accurately reflect specification
- Configuration is easily maintainable (add new features without code changes)
- Unit tests cover all tier combinations

### 2.4 Tier Audit Service
**Priority**: MEDIUM | **Size**: S | **Dependencies**: 1.3, 1.5

**Tasks**:
- [ ] Create `lib/services/tier-audit-service.ts`
  - Implement `logTierChange(vendorId, previousTier, newTier, changeType, adminId, notes)` method
  - Implement `getTierAuditHistory(filters)` method for admin queries
  - Implement `exportAuditLog(filters)` method for CSV export
- [ ] Add validation for audit log entries
  - Ensure previous_tier and new_tier are valid enums
  - Validate change_type enum
  - Verify vendor_id and admin_id foreign keys
- [ ] Write unit tests for TierAuditService
  - Test audit log creation for all change types
  - Test audit history filtering by vendor and date range
  - Test CSV export formatting
- [ ] Document audit log retention policy (if applicable)

**Acceptance Criteria**:
- Audit log entries created for all tier changes
- Audit history queries support filtering and pagination
- CSV export includes all relevant fields
- Unit tests achieve >90% code coverage

### 2.5 API Endpoints - Vendor Geography
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.1

**Tasks**:
- [ ] Create API route: `app/api/vendors/route.ts` (extend existing)
  - Add query param support for geographic filtering (country, state, city)
  - Add query param support for proximity search (lat, lon, radius)
  - Add query param support for category filtering
  - Implement pagination (limit, offset)
  - Return vendors array + total count + available filter options
- [ ] Create API route: `app/api/vendors/[id]/service-regions/route.ts`
  - Return detailed service region data for specific vendor
  - Include countries, states, cities, coordinates, coverage_notes
- [ ] Add input validation with Zod schemas
  - Validate lat/lon ranges (-90 to 90, -180 to 180)
  - Validate radius (1-1000 km)
  - Validate pagination limits (max 100)
- [ ] Implement error handling
  - 400 for invalid query params
  - 404 for vendor not found
  - 500 for service errors
- [ ] Write integration tests for geography endpoints
  - Test country filtering
  - Test state filtering
  - Test city filtering
  - Test proximity search with various radii
  - Test pagination behavior
- [ ] Document API endpoints in OpenAPI/Swagger format

**Acceptance Criteria**:
- Endpoints return correctly filtered vendor data
- Input validation rejects invalid params with clear error messages
- Integration tests achieve >85% coverage
- API documentation is accurate and complete

### 2.6 API Endpoints - Tier Requests
**Priority**: HIGH | **Size**: L | **Dependencies**: 2.2

**Tasks**:
- [ ] Create API route: `app/api/tier-requests/route.ts`
  - POST: Create new tier upgrade/downgrade request (vendor auth required)
  - GET: Retrieve tier requests (vendors see own, admins see all)
  - Add authentication middleware for JWT verification
  - Add authorization checks (vendor role for POST, vendor/admin for GET)
- [ ] Create API route: `app/api/tier-requests/[id]/route.ts`
  - PATCH: Admin approve/reject tier request (admin auth required)
  - Add admin-only authorization middleware
  - Validate status transitions (pending → approved/rejected only)
- [ ] Create API route: `app/api/admin/vendors/[id]/tier/route.ts`
  - POST: Admin direct tier assignment (bypass request system)
  - Add admin-only authorization
  - Log as 'admin_override' in audit trail
- [ ] Create API route: `app/api/admin/tier-audit/route.ts`
  - GET: Retrieve complete tier audit history
  - Support filtering by vendor, date range
  - Support pagination
  - Admin-only access
- [ ] Add request validation with Zod schemas
  - Validate tier enums (free, tier1, tier2)
  - Validate status enums (pending, approved, rejected)
  - Validate reason max length (500 characters)
- [ ] Implement comprehensive error handling
  - 400: Invalid tier, duplicate request, invalid status
  - 401: Not authenticated
  - 403: Not authorized (wrong role)
  - 404: Request not found
  - 500: Server error
- [ ] Write integration tests for tier request endpoints
  - Test vendor tier request creation
  - Test duplicate request rejection
  - Test admin approval workflow
  - Test admin rejection workflow
  - Test direct tier assignment
  - Test audit history retrieval
- [ ] Document API endpoints with request/response examples

**Acceptance Criteria**:
- All tier request endpoints function correctly
- Authentication and authorization enforced properly
- Validation rejects invalid requests with clear errors
- Integration tests achieve >90% coverage
- API documentation includes all error scenarios

### 2.7 Vendor Premium Content API
**Priority**: MEDIUM | **Size**: L | **Dependencies**: 1.4, 1.5, 2.3

**Tasks**:
- [ ] Create API route: `app/api/vendors/[id]/premium-content/route.ts`
  - POST: Create new premium content item (vendor auth required)
  - GET: Retrieve vendor's premium content (public for published, vendor-only for drafts)
  - Validate tier access for content_type creation
  - Enforce tier-specific content limits
- [ ] Create API route: `app/api/vendors/[id]/premium-content/[contentId]/route.ts`
  - PATCH: Update premium content item (vendor auth required)
  - DELETE: Delete premium content item (vendor auth required)
  - Validate content_data JSONB structure based on content_type
- [ ] Implement content type validation
  - Create Zod schemas for each content type (certification, case_study, etc.)
  - Validate JSONB structure matches expected schema
  - Reject invalid content_data with field-level errors
- [ ] Add tier-based access control
  - Check vendor tier before allowing premium content creation
  - Return 403 if vendor tier insufficient for content_type
  - Provide clear upgrade prompt in error message
- [ ] Write integration tests for premium content endpoints
  - Test content creation for each content_type
  - Test tier access enforcement (free tier blocked, tier2 allowed)
  - Test content update and delete operations
  - Test JSONB validation for each content type
- [ ] Document API endpoints with JSONB schema examples

**Acceptance Criteria**:
- Premium content CRUD operations work correctly
- Tier access control prevents unauthorized content creation
- JSONB validation catches malformed content_data
- Integration tests achieve >85% coverage
- API docs include complete JSONB schema for each content type

---

## 3. Frontend Components & UI

### 3.1 Vendor Location Filter Component
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.5

**Tasks**:
- [ ] Create component: `components/VendorLocationFilter.tsx`
  - Implement country select dropdown (shadcn Select component)
  - Implement state select dropdown (filtered by selected country)
  - Implement city select dropdown (filtered by selected state)
  - Add proximity search toggle with radius slider (shadcn Slider)
  - Add "Clear Filters" button to reset all selections
- [ ] Implement filter state management
  - Use URL query params for filter persistence (useSearchParams)
  - Update URL on filter change for shareable links
  - Read initial filter state from URL on component mount
- [ ] Add geolocation support for proximity search
  - Request user's current location with browser Geolocation API
  - Use location as center point for proximity radius
  - Handle geolocation permission denial gracefully
- [ ] Style component with Tailwind CSS
  - Responsive layout: vertical stack on mobile, horizontal row on desktop
  - Match existing design system colors and spacing
  - Add loading states for async operations
- [ ] Write component tests
  - Test filter selection updates URL params
  - Test URL params load initial filter state
  - Test geolocation integration (mock browser API)
  - Test clear filters functionality
- [ ] Add accessibility features
  - ARIA labels for all form controls
  - Keyboard navigation support
  - Screen reader announcements for filter changes

**Acceptance Criteria**:
- Filter component renders correctly on all screen sizes
- URL updates reflect filter selections (shareable links work)
- Geolocation integration works when user grants permission
- Component tests achieve >85% coverage
- WCAG 2.1 AA accessibility compliance

### 3.2 Vendor Service Area Map Component
**Priority**: MEDIUM | **Size**: L | **Dependencies**: 2.1

**Tasks**:
- [ ] Install Leaflet.js and OpenFreeMap dependencies
  - `npm install leaflet react-leaflet`
  - Configure OpenFreeMap tile layer (https://openfreemap.org)
- [ ] Create component: `components/VendorServiceAreaMap.tsx`
  - Initialize Leaflet map with OpenFreeMap tiles
  - Render vendor service region markers from coordinates
  - Add map controls (zoom, pan, fullscreen)
  - Implement marker clustering for dense regions
- [ ] Add interactive features
  - Marker click shows vendor details popup
  - Hover highlights service region boundaries (if available)
  - Center map on user's location or primary vendor location
- [ ] Optimize map performance
  - Lazy load map component (React.lazy + Suspense)
  - Use Intersection Observer to load map when visible
  - Throttle map interactions to prevent performance issues
- [ ] Style map to match site theme
  - Custom marker icons matching brand colors
  - Dark mode support for map tiles
  - Responsive map container (full-width on mobile)
- [ ] Write component tests
  - Test marker rendering for sample coordinates
  - Test popup display on marker click
  - Test map centering logic
- [ ] Add accessibility features
  - Keyboard navigation for map markers
  - Screen reader descriptions for service regions
  - Skip link to bypass map for screen readers

**Acceptance Criteria**:
- Map displays vendor service regions accurately
- Interactive features work on desktop and mobile
- Map loads performantly (lazy loading reduces initial bundle size)
- Component tests cover core functionality
- Accessibility features support keyboard and screen reader users

### 3.3 Tier Comparison Table Component
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.3

**Tasks**:
- [ ] Create component: `components/TierComparisonTable.tsx`
  - Render three columns: Free, Tier 1, Tier 2
  - Display tier features with checkmarks and X icons
  - Highlight current vendor tier with badge
  - Add "Select Tier" button for each upgradeable tier
- [ ] Fetch tier feature data from TierFeatureService
  - Call `getAvailableFeatures(tier)` for each tier
  - Display feature list with visual indicators (checkmarks)
  - Show tier limits (max products, max gallery images, etc.)
- [ ] Implement tier selection interaction
  - Disable "Select Tier" button for current tier
  - Click button opens TierUpgradeRequestForm modal
  - Pass selected tier to modal as prop
- [ ] Style component with shadcn Card components
  - Use Card, CardHeader, CardTitle, CardContent, CardFooter
  - Add hover effects on tier cards
  - Highlight recommended tier (Tier 2) with accent color
- [ ] Add responsive design
  - Desktop: 3-column side-by-side layout
  - Tablet: 2-column layout with third card below
  - Mobile: Single-column stacked layout with collapsible feature lists
- [ ] Write component tests
  - Test current tier highlighting
  - Test tier selection button click opens modal
  - Test responsive layout rendering
- [ ] Add accessibility features
  - ARIA labels for tier selection buttons
  - Focus management when modal opens
  - Screen reader descriptions for tier features

**Acceptance Criteria**:
- Tier comparison table displays all three tiers correctly
- Current tier is clearly highlighted
- Tier selection opens modal with correct tier pre-selected
- Responsive layouts work on all device sizes
- Component tests achieve >85% coverage

### 3.4 Tier Upgrade Request Form Component
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.6

**Tasks**:
- [ ] Create component: `components/TierUpgradeRequestForm.tsx`
  - Implement modal dialog (shadcn Dialog component)
  - Display current tier and requested tier
  - Add radio button group for tier selection (pre-selected)
  - Add textarea for optional reason (max 500 characters)
  - Add submit and cancel buttons
- [ ] Implement form state management
  - Use React Hook Form for form state
  - Add Zod schema for form validation
  - Validate requested tier differs from current tier
  - Validate reason max length
- [ ] Integrate with tier request API
  - Use TanStack Query useMutation for API call
  - POST to `/api/tier-requests` on form submit
  - Show loading spinner on submit button during API call
  - Handle success: close modal, show success toast, invalidate tier request cache
  - Handle errors: display error message in modal, keep modal open
- [ ] Style form with shadcn components
  - Use Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter
  - Use RadioGroup for tier selection
  - Use Textarea for reason field
  - Use Button for submit/cancel actions
- [ ] Add form validation feedback
  - Show error message if requested tier same as current
  - Show character count for reason field (XXX/500)
  - Disable submit button if form invalid
- [ ] Write component tests
  - Test form submission with valid data
  - Test validation errors prevent submission
  - Test API error handling
  - Test success flow (modal closes, toast shows)
- [ ] Add accessibility features
  - Focus trap in modal dialog
  - ARIA labels for all form fields
  - Screen reader announcements for validation errors

**Acceptance Criteria**:
- Form modal opens with correct tier pre-selected
- Form validation prevents invalid submissions
- API integration creates tier request successfully
- Success and error states handled gracefully
- Component tests achieve >85% coverage
- WCAG 2.1 AA accessibility compliance

### 3.5 Tier Request Status Card Component
**Priority**: MEDIUM | **Size**: S | **Dependencies**: 2.6

**Tasks**:
- [ ] Create component: `components/TierRequestStatusCard.tsx`
  - Display pending tier request status with badge
  - Show requested tier and submission date
  - Display admin notes if request approved/rejected
  - Add "Cancel Request" button if status is pending
- [ ] Fetch tier request data from API
  - Use TanStack Query useQuery to fetch vendor's tier requests
  - Filter for most recent request (or pending request)
  - Handle loading and error states
- [ ] Implement cancel request functionality
  - Add DELETE endpoint to API (or PATCH status to 'cancelled')
  - Confirm cancellation with dialog before API call
  - Update UI on successful cancellation
- [ ] Style component with shadcn Card
  - Use Badge component for status indicator (pending, approved, rejected)
  - Color code status: yellow for pending, green for approved, red for rejected
  - Add icon for each status type
- [ ] Write component tests
  - Test status badge rendering for each status type
  - Test cancel request confirmation dialog
  - Test successful cancellation updates UI
- [ ] Add accessibility features
  - ARIA labels for status badge
  - Keyboard accessible cancel button
  - Screen reader announcements for status changes

**Acceptance Criteria**:
- Status card displays current tier request accurately
- Status badge color-coded and clear
- Cancel request workflow functions correctly
- Component tests cover all status types
- Accessibility features support keyboard and screen reader users

### 3.6 Admin Tier Approval Queue Component
**Priority**: HIGH | **Size**: L | **Dependencies**: 2.6

**Tasks**:
- [ ] Create component: `components/AdminTierApprovalQueue.tsx`
  - Render data table with pending tier requests (shadcn Table)
  - Display columns: Vendor Name, Current Tier, Requested Tier, Request Date, Actions
  - Add status filter dropdown (All, Pending, Approved, Rejected)
  - Add search input for vendor name filtering
  - Implement pagination controls (prev/next, page numbers)
- [ ] Fetch tier request data from admin API
  - Use TanStack Query useQuery with admin endpoint
  - Support filtering by status
  - Support pagination (limit, offset)
  - Handle loading state with skeleton table rows
- [ ] Implement approval/rejection actions
  - Add "Approve" and "Reject" buttons in Actions column
  - Click button opens confirmation dialog with notes field
  - Submit calls PATCH `/api/tier-requests/:id` with status
  - Show success toast and refresh table on completion
- [ ] Add bulk actions (optional enhancement)
  - Checkbox column for row selection
  - "Approve Selected" and "Reject Selected" buttons in table header
  - Confirm bulk action before execution
- [ ] Style component with shadcn Table components
  - Use Table, TableHeader, TableBody, TableRow, TableHead, TableCell
  - Add hover effects on table rows
  - Color-code status badges in table cells
- [ ] Add responsive design
  - Desktop: Full table with all columns
  - Tablet: Hide less critical columns (request date)
  - Mobile: Card-based view instead of table (stack vendor info vertically)
- [ ] Write component tests
  - Test table rendering with sample data
  - Test filtering by status
  - Test approval workflow
  - Test rejection workflow
  - Test pagination behavior
- [ ] Add accessibility features
  - Sortable table headers with ARIA labels
  - Keyboard navigation for table rows
  - Screen reader descriptions for action buttons

**Acceptance Criteria**:
- Admin approval queue table displays pending requests
- Filtering and pagination work correctly
- Approval and rejection workflows update tier successfully
- Responsive design works on all device sizes
- Component tests achieve >85% coverage
- WCAG 2.1 AA accessibility compliance

### 3.7 Enhanced TierGate Component
**Priority**: MEDIUM | **Size**: M | **Dependencies**: 2.3

**Tasks**:
- [ ] Extend existing `components/TierGate.tsx` component
  - Add `showUpgradePrompt` prop (default true)
  - Add `upgradeCallToAction` prop for custom CTA text
  - Add `fallback` prop for custom blocked content UI
  - Add `featureName` prop for logging and analytics
- [ ] Implement granular feature access checking
  - Call TierFeatureService `checkFeatureAccess(vendorId, feature)`
  - Conditionally render children if access granted
  - Render TierUpgradePrompt if access denied and showUpgradePrompt=true
- [ ] Add upgrade prompt component
  - Create `TierUpgradePrompt.tsx` as separate component
  - Display locked feature name and required tier
  - Add "Upgrade to Tier X" CTA button linking to subscription page
  - Add "Learn More" link to tier comparison
- [ ] Style upgrade prompt with shadcn components
  - Use Card component for prompt container
  - Add lock icon and clear messaging
  - Match existing design system
- [ ] Write component tests
  - Test access granted renders children
  - Test access denied renders upgrade prompt
  - Test custom fallback rendering
  - Test feature name logging
- [ ] Add accessibility features
  - ARIA role="alert" for blocked content message
  - Keyboard accessible upgrade CTA button
  - Screen reader friendly upgrade messaging

**Acceptance Criteria**:
- TierGate correctly gates features based on vendor tier
- Upgrade prompt displays clearly when access denied
- Custom fallback rendering works as expected
- Component tests achieve >85% coverage
- Accessibility features support keyboard and screen reader users

### 3.8 Tier 2 Premium Profile Editor Component
**Priority**: MEDIUM | **Size**: XL | **Dependencies**: 2.7, 3.7

**Tasks**:
- [ ] Create component: `components/PremiumProfileEditor.tsx`
  - Implement tabbed interface for content types (certifications, case studies, etc.)
  - Gate entire component with TierGate (requiredTier='tier2')
  - Add "Add New" button for each content type
- [ ] Create sub-component: `CertificationEditor.tsx`
  - Form fields: name, issuing org, issue date, expiry date, verification URL, badge image upload
  - Use React Hook Form with Zod validation
  - Submit to premium content API
- [ ] Create sub-component: `CaseStudyEditor.tsx`
  - Form fields: title, yacht name, project date, challenge, solution, results, images, testimonial
  - Rich text editor for challenge/solution/results fields
  - Multiple image upload with preview
  - Submit to premium content API
- [ ] Create sub-component: `MediaGalleryEditor.tsx`
  - Image upload with drag-and-drop
  - Video URL input (YouTube, Vimeo embed)
  - 3D model upload (if applicable)
  - Organize media into albums
  - Submit to premium content API
- [ ] Create sub-component: `TeamMemberEditor.tsx`
  - Form fields: name, role, expertise areas, bio, photo upload, LinkedIn URL
  - Multiple expertise tags with autocomplete
  - Submit to premium content API
- [ ] Implement service region map editor
  - Integrate VendorServiceAreaMap component in edit mode
  - Add marker by clicking map or entering address
  - Geocode addresses to coordinates
  - Save to vendor geographic fields
- [ ] Add content list view for each type
  - Display existing certifications, case studies, etc. in cards
  - Add edit and delete actions on each card
  - Confirm delete before removal
- [ ] Style all sub-components with shadcn components
  - Use Tabs component for content type navigation
  - Use Form components for all input fields
  - Use Card components for content list items
  - Add loading states and success/error toasts
- [ ] Write component tests for each sub-component
  - Test form submission for each content type
  - Test validation errors prevent submission
  - Test edit and delete operations
  - Test tier gate enforcement
- [ ] Add accessibility features
  - ARIA labels for all form fields
  - Keyboard navigation for tabbed interface
  - Screen reader support for file uploads

**Acceptance Criteria**:
- Premium profile editor only accessible to Tier 2+ vendors
- All content type editors function correctly
- CRUD operations for premium content work end-to-end
- Component tests achieve >80% coverage (complex component)
- WCAG 2.1 AA accessibility compliance

### 3.9 Vendor Dashboard Subscription Page
**Priority**: HIGH | **Size**: M | **Dependencies**: 3.3, 3.4, 3.5

**Tasks**:
- [ ] Create page: `app/vendor/dashboard/subscription/page.tsx`
  - Render DashboardHeader with breadcrumbs and current tier badge
  - Render TierComparisonTable component
  - Conditionally render TierRequestStatusCard if pending request exists
  - Add page title and description
- [ ] Implement page layout
  - Use existing DashboardSidebar component
  - Main content area with TierComparisonTable
  - Sidebar shows current tier status
- [ ] Add route guard for vendor authentication
  - Redirect to /login if not authenticated
  - Verify vendor role (not admin or public user)
- [ ] Fetch vendor tier data on page load
  - Use TanStack Query to fetch current tier
  - Use TanStack Query to fetch pending tier request
  - Show loading skeleton while fetching
- [ ] Style page with consistent dashboard design
  - Match existing dashboard page styles
  - Use grid layout for responsive design
- [ ] Write page integration tests
  - Test page renders for authenticated vendor
  - Test unauthenticated user redirects to login
  - Test tier comparison table displays correctly
  - Test tier request status card shows when applicable
- [ ] Add SEO metadata
  - Page title: "Subscription | Vendor Dashboard"
  - Meta description for tier upgrade benefits

**Acceptance Criteria**:
- Subscription page accessible only to authenticated vendors
- Page displays current tier and tier comparison
- Pending tier request status shown if applicable
- Page layout matches existing dashboard design
- Integration tests cover authentication and data fetching

### 3.10 Admin Tier Management Pages
**Priority**: HIGH | **Size**: M | **Dependencies**: 3.6

**Tasks**:
- [ ] Create page: `app/admin/tier-requests/page.tsx`
  - Render AdminTierApprovalQueue component
  - Add page title and filters header
  - Implement pagination controls
- [ ] Create page: `app/admin/tier-audit/page.tsx`
  - Render tier audit log table with filtering
  - Add date range picker for filtering audit history
  - Add export to CSV button
- [ ] Implement admin route guards
  - Redirect non-admins to /vendor/dashboard
  - Verify admin role on page load
- [ ] Add admin sidebar navigation updates
  - Add "Tier Requests" menu item
  - Add "Tier Audit" menu item under "Reports" section
- [ ] Style pages with consistent admin design
  - Match existing admin page styles
  - Use data table layouts
- [ ] Write page integration tests
  - Test admin can access tier request page
  - Test non-admin redirected
  - Test audit history filtering works
  - Test CSV export generates correct data
- [ ] Add SEO metadata for admin pages

**Acceptance Criteria**:
- Admin tier pages accessible only to authenticated admins
- Tier request approval queue functions correctly
- Tier audit log displays complete history
- CSV export works for audit data
- Integration tests cover admin authorization

---

## 4. Integration & Testing

### 4.1 End-to-End Tier Upgrade Workflow Test
**Priority**: HIGH | **Size**: M | **Dependencies**: All 2.x, All 3.x

**Tasks**:
- [ ] Write E2E test: Vendor submits tier upgrade request
  - Log in as test vendor (free tier)
  - Navigate to subscription page
  - Select Tier 2 and submit request with reason
  - Verify success toast and pending status badge
  - Verify tier request appears in database
- [ ] Write E2E test: Admin approves tier request
  - Log in as test admin
  - Navigate to tier requests page
  - Approve pending request with admin notes
  - Verify success toast and request status updated
  - Verify vendor tier updated in database
  - Verify audit log entry created
- [ ] Write E2E test: Vendor accesses premium features after approval
  - Log in as test vendor (now tier 2)
  - Navigate to premium profile editor
  - Verify access granted (TierGate allows entry)
  - Create sample certification content
  - Verify content saved and displays on vendor profile
- [ ] Verify notification system (placeholder for Phase 3B)
  - Check logs for notification events
  - Verify notification hooks called correctly

**Acceptance Criteria**:
- E2E tests pass for complete tier upgrade workflow
- All database changes persist correctly
- Audit trail records all steps
- No errors in console or logs during workflow

### 4.2 Location-Based Vendor Discovery Test
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.1, 2.5, 3.1, 3.2

**Tasks**:
- [ ] Write E2E test: Filter vendors by country
  - Navigate to /vendors page
  - Select "United States" from country filter
  - Verify URL updates with ?country=US
  - Verify only US vendors displayed in results
  - Verify vendor count accurate
- [ ] Write E2E test: Filter vendors by state
  - Select "California" from state filter (after selecting US)
  - Verify URL updates with ?country=US&state=CA
  - Verify only California vendors displayed
  - Verify map shows only California vendors
- [ ] Write E2E test: Proximity search
  - Enable proximity search toggle
  - Grant geolocation permission (mock in test)
  - Set radius to 50 km
  - Verify vendors within radius displayed
  - Verify distance sorting applied
- [ ] Write E2E test: Clear filters
  - Apply multiple filters (country, state, city)
  - Click "Clear Filters" button
  - Verify URL params cleared
  - Verify all vendors displayed again

**Acceptance Criteria**:
- E2E tests pass for all geographic filtering scenarios
- URL params correctly persist filter state
- Map displays filtered vendors accurately
- Performance acceptable (results load in <2 seconds)

### 4.3 Premium Content CRUD Operations Test
**Priority**: MEDIUM | **Size**: M | **Dependencies**: 2.7, 3.8

**Tasks**:
- [ ] Write E2E test: Create certification content
  - Log in as Tier 2 vendor
  - Navigate to premium profile editor
  - Open certifications tab
  - Fill out certification form with valid data
  - Submit form and verify success
  - Verify certification displays in content list
- [ ] Write E2E test: Edit certification content
  - Click edit on existing certification
  - Modify certification name and expiry date
  - Submit changes and verify success
  - Verify updated data displays correctly
- [ ] Write E2E test: Delete certification content
  - Click delete on certification
  - Confirm deletion in dialog
  - Verify certification removed from list
  - Verify deletion persisted in database
- [ ] Write E2E test: Tier access enforcement
  - Log in as free tier vendor
  - Attempt to navigate to premium profile editor
  - Verify TierGate blocks access
  - Verify upgrade prompt displayed

**Acceptance Criteria**:
- E2E tests pass for all premium content CRUD operations
- Content changes persist correctly in database
- Tier gating prevents unauthorized access
- No errors during content creation/editing

### 4.4 API Integration Testing
**Priority**: HIGH | **Size**: L | **Dependencies**: All 2.x

**Tasks**:
- [ ] Write integration tests for all API endpoints
  - Test success scenarios with valid data
  - Test validation errors with invalid data
  - Test authentication/authorization enforcement
  - Test error handling (404, 500, etc.)
- [ ] Test database transaction integrity
  - Verify tier request approval updates vendor tier atomically
  - Verify rollback on failure
  - Verify foreign key constraints enforced
- [ ] Test API performance under load
  - Simulate 100 concurrent vendor requests
  - Measure response times for geography endpoints
  - Identify bottlenecks and optimize
- [ ] Test API security
  - Verify JWT token validation
  - Test CSRF protection (if applicable)
  - Test SQL injection prevention
  - Test XSS prevention in API responses

**Acceptance Criteria**:
- All integration tests pass (>90% API coverage)
- Database transactions maintain integrity
- API performance meets requirements (<500ms p95)
- No security vulnerabilities found

### 4.5 Cross-Browser and Responsive Design Testing
**Priority**: MEDIUM | **Size**: M | **Dependencies**: All 3.x

**Tasks**:
- [ ] Test all components in Chrome, Firefox, Safari, Edge
  - Verify UI renders correctly
  - Verify interactive features work
  - Identify browser-specific issues
- [ ] Test responsive layouts on multiple device sizes
  - Mobile (375px width): iPhone SE
  - Tablet (768px width): iPad
  - Desktop (1920px width): Standard monitor
  - Large desktop (2560px width): 4K monitor
- [ ] Test map component performance on mobile devices
  - Verify map loads and interacts smoothly
  - Check for memory leaks or crashes
  - Optimize if performance issues found
- [ ] Test form interactions on touch devices
  - Verify touch events work for dropdowns, sliders, etc.
  - Check for touch target size issues (min 44x44px)

**Acceptance Criteria**:
- All components render correctly in all major browsers
- Responsive layouts work on all tested device sizes
- No JavaScript errors in browser consoles
- Touch interactions work smoothly on mobile devices

---

## 5. Documentation & Deployment

### 5.1 API Documentation
**Priority**: MEDIUM | **Size**: S | **Dependencies**: All 2.x

**Tasks**:
- [ ] Document all API endpoints in OpenAPI/Swagger format
  - Include request/response schemas
  - Include authentication requirements
  - Include error response examples
- [ ] Generate API documentation website (optional)
  - Use Swagger UI or similar tool
  - Deploy to /api-docs route
- [ ] Write API integration guide for frontend developers
  - Example API calls with curl and fetch
  - Authentication flow explanation
  - Error handling best practices
- [ ] Document rate limiting and pagination strategies

**Acceptance Criteria**:
- All API endpoints documented with complete schemas
- API docs accessible and easy to navigate
- Integration guide includes working code examples

### 5.2 Developer Documentation
**Priority**: MEDIUM | **Size**: M | **Dependencies**: All sections

**Tasks**:
- [ ] Update CLAUDE.md with Phase 3A architecture
  - Document new database tables and relationships
  - Document tier management workflow
  - Document geographic vendor discovery features
- [ ] Write migration guide for database schema changes
  - Step-by-step instructions for running migrations
  - Rollback procedures if needed
  - Data backfill instructions for existing vendors
- [ ] Document tier feature configuration
  - How to add new tier-specific features
  - How to modify tier limits
  - How to configure feature access rules
- [ ] Create troubleshooting guide
  - Common issues and solutions
  - Debugging tier upgrade workflow
  - Debugging geographic filtering issues

**Acceptance Criteria**:
- CLAUDE.md updated with Phase 3A architecture
- Migration guide complete and tested
- Developer documentation clear and comprehensive

### 5.3 User Documentation
**Priority**: LOW | **Size**: S | **Dependencies**: All 3.x

**Tasks**:
- [ ] Write vendor user guide for tier upgrade process
  - How to view tier options
  - How to submit upgrade request
  - What to expect after submission
- [ ] Write vendor user guide for premium features
  - How to access premium profile editor
  - How to create certifications, case studies, etc.
  - How to manage service regions on map
- [ ] Write admin user guide for tier management
  - How to review tier requests
  - How to approve/reject requests
  - How to view audit history

**Acceptance Criteria**:
- User guides written in clear, non-technical language
- Guides include screenshots or video walkthroughs
- Guides cover all major workflows

### 5.4 Deployment Preparation
**Priority**: HIGH | **Size**: M | **Dependencies**: All sections

**Tasks**:
- [ ] Create deployment checklist
  - Database migration steps
  - Environment variable updates
  - Feature flag configuration (if applicable)
  - Rollback plan
- [ ] Set up staging environment for Phase 3A testing
  - Deploy to staging with database migrations
  - Run full test suite on staging
  - Perform manual QA testing
- [ ] Prepare production deployment plan
  - Schedule deployment window
  - Notify stakeholders of deployment
  - Prepare monitoring alerts
- [ ] Configure environment variables for production
  - OpenStreetMap Nominatim API URL
  - OpenFreeMap tile server URL
  - Database connection strings
- [ ] Set up monitoring and logging
  - Add error tracking for new API endpoints
  - Set up performance monitoring for geographic queries
  - Configure alerts for tier upgrade workflow failures

**Acceptance Criteria**:
- Deployment checklist complete and reviewed
- Staging environment fully functional
- Production deployment plan approved
- Monitoring and logging configured

### 5.5 Post-Deployment Validation
**Priority**: HIGH | **Size**: S | **Dependencies**: 5.4

**Tasks**:
- [ ] Run smoke tests on production after deployment
  - Test vendor tier upgrade workflow end-to-end
  - Test geographic vendor filtering
  - Test admin tier approval queue
- [ ] Monitor error rates and performance metrics
  - Check for increased error rates after deployment
  - Verify API response times within acceptable range
  - Check database query performance
- [ ] Validate data integrity
  - Verify migrations applied correctly
  - Check for orphaned records or constraint violations
  - Verify audit logs capturing tier changes
- [ ] Gather initial user feedback
  - Monitor vendor support requests
  - Track tier upgrade request volume
  - Collect admin feedback on approval workflow

**Acceptance Criteria**:
- Smoke tests pass on production
- No significant increase in errors or performance degradation
- Data integrity verified
- Initial user feedback collected and documented

---

## Implementation Timeline

### Week 1: Database & Core Services
- Days 1-2: Database schema migrations (1.1, 1.2, 1.3, 1.4)
- Days 3-4: Migration execution and testing (1.5)
- Day 5: Vendor Geography Service (2.1)

### Week 2: Backend API Development
- Days 1-2: Tier Request Service (2.2)
- Day 3: Tier Feature Service and Tier Audit Service (2.3, 2.4)
- Days 4-5: Geography API endpoints (2.5)

### Week 3: Backend API & Frontend Start
- Days 1-2: Tier Request API endpoints (2.6)
- Day 3: Premium Content API (2.7)
- Days 4-5: Location Filter Component and Service Map (3.1, 3.2)

### Week 4: Frontend Components
- Days 1-2: Tier Comparison and Upgrade Form (3.3, 3.4)
- Day 3: Tier Request Status Card (3.5)
- Days 4-5: Admin Approval Queue (3.6)

### Week 5: Premium Features & Pages
- Days 1-3: Enhanced TierGate and Premium Profile Editor (3.7, 3.8)
- Days 4-5: Dashboard pages (3.9, 3.10)

### Week 6: Testing & Documentation
- Days 1-2: E2E workflow tests (4.1, 4.2, 4.3)
- Day 3: API integration testing (4.4)
- Day 4: Cross-browser testing (4.5)
- Day 5: Documentation (5.1, 5.2, 5.3)

### Week 7: Deployment
- Days 1-2: Deployment preparation and staging (5.4)
- Day 3: Production deployment
- Days 4-5: Post-deployment validation and monitoring (5.5)

---

## Risk Assessment

### High-Risk Items
1. **Database Migrations** - Risk: Data loss or corruption during migration
   - Mitigation: Comprehensive testing on staging, backup before production migration, rollback scripts ready
2. **Geographic Query Performance** - Risk: Slow queries on large datasets
   - Mitigation: GIN indexes, query optimization, pagination enforcement, load testing
3. **Tier Upgrade Atomicity** - Risk: Vendor tier updated but request not marked approved (data inconsistency)
   - Mitigation: Database transactions, thorough integration testing, audit log validation

### Medium-Risk Items
1. **Map Component Performance on Mobile** - Risk: Poor performance or crashes on low-end devices
   - Mitigation: Lazy loading, Intersection Observer, marker clustering, performance profiling
2. **Premium Content JSONB Validation** - Risk: Malformed content_data causing frontend errors
   - Mitigation: Strict Zod schemas, backend validation, comprehensive error handling
3. **External API Dependency (Geocoding)** - Risk: OpenStreetMap Nominatim API downtime or rate limiting
   - Mitigation: Caching geocoded results, fallback to manual coordinate entry, retry logic with backoff

### Low-Risk Items
1. **UI Component Styling Consistency** - Risk: Inconsistent design across components
   - Mitigation: Use shadcn/ui components consistently, design system documentation, code reviews
2. **Browser Compatibility** - Risk: UI issues in specific browsers
   - Mitigation: Cross-browser testing, polyfills if needed, progressive enhancement

---

## Success Criteria

### Technical Success Criteria
- [ ] All database migrations run successfully without data loss
- [ ] All API endpoints return correct data with <500ms p95 response time
- [ ] All frontend components render correctly across browsers and devices
- [ ] Integration tests achieve >85% code coverage
- [ ] E2E tests pass for all major workflows
- [ ] Zero critical bugs in production after deployment

### Business Success Criteria
- [ ] Vendors can successfully submit tier upgrade requests
- [ ] Admins can approve/reject requests with full audit trail
- [ ] Vendors can create and manage premium content (Tier 2+)
- [ ] Users can filter vendors by geographic location
- [ ] Map displays vendor service areas accurately
- [ ] Tier-based feature access enforced correctly

### User Experience Success Criteria
- [ ] Tier comparison table clearly communicates value of each tier
- [ ] Tier upgrade request process takes <2 minutes to complete
- [ ] Admin approval queue allows processing requests in <30 seconds each
- [ ] Location filter reduces vendor results to relevant regional providers
- [ ] Premium profile editor is intuitive and easy to use
- [ ] All components meet WCAG 2.1 AA accessibility standards

---

## Notes

- **Payment Integration Deferred**: Phase 3A focuses on functionality-first approach. Stripe payment integration and automated billing will be implemented in Phase 3B.
- **Email Notifications Placeholder**: Notification hooks are included in code but email service integration deferred to Phase 3B.
- **External Dependencies**: OpenStreetMap Nominatim API (free, no API key required) for geocoding. OpenFreeMap (free, open-source) for map tiles.
- **Performance Target**: All API endpoints should respond in <500ms for p95, geographic queries optimized with GIN indexes and pagination.
- **Accessibility Commitment**: All UI components must meet WCAG 2.1 AA standards for keyboard navigation, screen readers, and color contrast.

---

## Appendix: Quick Reference

### Key Files to Create
- `lib/services/vendor-geography-service.ts`
- `lib/services/tier-request-service.ts`
- `lib/services/tier-feature-service.ts`
- `lib/services/tier-audit-service.ts`
- `app/api/vendors/route.ts` (extend)
- `app/api/vendors/[id]/service-regions/route.ts`
- `app/api/tier-requests/route.ts`
- `app/api/tier-requests/[id]/route.ts`
- `app/api/admin/vendors/[id]/tier/route.ts`
- `app/api/admin/tier-audit/route.ts`
- `app/api/vendors/[id]/premium-content/route.ts`
- `components/VendorLocationFilter.tsx`
- `components/VendorServiceAreaMap.tsx`
- `components/TierComparisonTable.tsx`
- `components/TierUpgradeRequestForm.tsx`
- `components/TierRequestStatusCard.tsx`
- `components/AdminTierApprovalQueue.tsx`
- `components/TierGate.tsx` (extend)
- `components/PremiumProfileEditor.tsx`
- `app/vendor/dashboard/subscription/page.tsx`
- `app/admin/tier-requests/page.tsx`
- `app/admin/tier-audit/page.tsx`

### Database Tables to Create
- `tier_requests` - Vendor tier upgrade/downgrade requests
- `tier_audit_log` - Complete tier change history
- `vendor_premium_content` - Tier-specific premium content storage
- `vendors` (extend) - Add geographic service region fields

### shadcn/ui Components to Use
- Select, Card, Badge, Button, Dialog, Table, Textarea, Toast, RadioGroup, Tabs, Form, Slider

### External Dependencies to Install
- `leaflet` - Map rendering library
- `react-leaflet` - React wrapper for Leaflet.js
- OpenFreeMap tiles (no installation, CDN-based)
- OpenStreetMap Nominatim API (no installation, REST API)

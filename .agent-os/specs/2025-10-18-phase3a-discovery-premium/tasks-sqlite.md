# Phase 3A Implementation Tasks - SQLite Version

> **Spec**: Phase 3A - Enhanced Discovery & Premium Services  
> **Database**: SQLite (Development & Initial Implementation)  
> **Created**: 2025-10-18  
> **Status**: Ready for Implementation

## Overview

This document provides the **SQLite-first implementation path** for Phase 3A features. This approach allows for rapid development and testing with SQLite, with a planned migration to PostgreSQL for production (see `tasks-postgres.md`).

**Key SQLite Adaptations**:
- TEXT columns with JSON serialization instead of arrays and JSONB
- Application-layer UUID generation instead of database defaults
- Application-layer enforcement of unique constraints instead of partial indexes
- JSON query functions instead of GIN indexes

**Estimated Timeline**: 3-4 weeks for SQLite implementation  
**PostgreSQL Migration**: Additional 1-2 weeks (see separate task document)

---

## Task Categories

### 1. Database Schema & Migrations (SQLite) (4-5 days)
### 2. Backend API Development (7-10 days)
### 3. Frontend Components & UI (7-10 days)
### 4. Integration & Testing (3-5 days)
### 5. Documentation & Deployment (2-3 days)

---

## 1. Database Schema & Migrations (SQLite)

### 1.1 Geographic Vendor Fields (SQLite)
**Priority**: HIGH | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Create migration file: `add-vendor-geographic-fields-sqlite.ts`
  - Add `service_countries` TEXT column (stores JSON array: `'["US", "Canada"]'`)
  - Add `service_states` TEXT column (stores JSON array: `'[{"country":"US","state":"CA"}]'`)
  - Add `service_cities` TEXT column (stores JSON array: `'[{"country":"US","state":"CA","city":"San Diego"}]'`)
  - Add `service_coordinates` TEXT column (stores JSON array: `'[{"lat":32.7157,"lon":-117.1611,"label":"HQ"}]'`)
  - Add `coverage_notes` TEXT column
- [ ] Create basic indexes for geographic search
  ```sql
  CREATE INDEX idx_vendors_service_countries ON vendors(service_countries);
  -- Note: SQLite will do full scans for JSON array searches, optimize in application layer
  ```
- [ ] Update Payload CMS vendor collection schema
  - Add `serviceCountries` array field (will serialize to JSON on save)
  - Add `serviceStates` array field with nested structure
  - Add `serviceCities` array field with nested structure
  - Add `serviceCoordinates` array field with lat/lon/label
  - Add `coverageNotes` textarea field
- [ ] Create helper functions for JSON serialization
  ```typescript
  // lib/utils/json-helpers.ts
  export const serializeCountries = (countries: string[]): string => JSON.stringify(countries)
  export const deserializeCountries = (json: string): string[] => JSON.parse(json || '[]')
  ```
- [ ] Create rollback migration for geographic fields
- [ ] Test migration on development SQLite database
- [ ] Document JSON data format and query patterns

**Acceptance Criteria**:
- Migration runs successfully without errors
- JSON serialization/deserialization works correctly
- Payload admin UI shows new geographic fields
- Helper functions handle edge cases (null, empty, malformed JSON)

**SQLite Limitations to Note**:
- ⚠️ No native array containment queries (e.g., `WHERE 'US' = ANY(service_countries)`)
- ⚠️ JSON queries require full table scans (no indexes on JSON fields)
- ✅ Workaround: Application-layer filtering for complex queries
- ✅ Performance acceptable for <10,000 vendors

### 1.2 Tier Requests Table (SQLite)
**Priority**: HIGH | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Create migration file: `create-tier-requests-table-sqlite.ts`
  ```sql
  CREATE TABLE tier_requests (
    id TEXT PRIMARY KEY,  -- UUIDs generated in application layer
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    current_tier TEXT NOT NULL CHECK (current_tier IN ('free', 'tier1', 'tier2')),
    requested_tier TEXT NOT NULL CHECK (requested_tier IN ('free', 'tier1', 'tier2')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    vendor_reason TEXT,
    admin_notes TEXT,
    admin_id TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
  );
  ```
- [ ] Create indexes for tier requests
  ```sql
  CREATE INDEX idx_tier_requests_vendor ON tier_requests(vendor_id);
  CREATE INDEX idx_tier_requests_status ON tier_requests(status);
  CREATE INDEX idx_tier_requests_created ON tier_requests(created_at DESC);
  ```
- [ ] Implement application-layer unique constraint for pending requests
  ```typescript
  // In TierRequestService.createTierRequest()
  const existingPending = await db.tierRequests.findFirst({
    where: { vendor_id, status: 'pending' }
  })
  if (existingPending) {
    throw new Error('DUPLICATE_REQUEST: Vendor already has pending tier request')
  }
  ```
- [ ] Create UUID generation helper
  ```typescript
  // lib/utils/uuid.ts
  import { randomUUID } from 'crypto'
  export const generateUUID = (): string => randomUUID()
  ```
- [ ] Update TypeScript types in `lib/types.ts`
  - Add `TierRequest` interface with id as string (not UUID type)
  - Add `TierRequestStatus` enum type
- [ ] Create rollback migration for tier_requests table
- [ ] Test unique constraint enforcement in application layer
- [ ] Document tier request workflow in schema docs

**Acceptance Criteria**:
- Table created with all constraints enforced
- Application-layer duplicate pending request check works
- UUID generation produces valid v4 UUIDs
- Foreign key cascade deletes work correctly
- TypeScript types match database schema exactly

**SQLite vs PostgreSQL Differences**:
- ❌ No `gen_random_uuid()` → Application generates UUIDs
- ❌ No partial unique index → Application checks before insert
- ✅ CHECK constraints work identically
- ✅ Foreign key cascades work identically

### 1.3 Tier Audit Log Table (SQLite)
**Priority**: HIGH | **Size**: S | **Dependencies**: 1.2

**Tasks**:
- [ ] Create migration file: `create-tier-audit-log-table-sqlite.ts`
  ```sql
  CREATE TABLE tier_audit_log (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    previous_tier TEXT NOT NULL,
    new_tier TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN (
      'request_approved',
      'request_rejected',
      'admin_override',
      'system_automatic'
    )),
    admin_id TEXT REFERENCES users(id),
    tier_request_id TEXT REFERENCES tier_requests(id),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Create indexes for audit queries
  ```sql
  CREATE INDEX idx_tier_audit_vendor ON tier_audit_log(vendor_id);
  CREATE INDEX idx_tier_audit_created ON tier_audit_log(created_at DESC);
  CREATE INDEX idx_tier_audit_admin ON tier_audit_log(admin_id);
  -- Note: SQLite doesn't support partial indexes with WHERE, so index all rows
  ```
- [ ] Update TypeScript types in `lib/types.ts`
  - Add `TierAuditLog` interface
  - Add `TierChangeType` enum type
- [ ] Create rollback migration for tier_audit_log table
- [ ] Test audit log integrity (immutable, append-only)
- [ ] Document audit log purpose and retention policy

**Acceptance Criteria**:
- Audit log table created successfully
- All foreign key relationships work correctly
- Indexes optimize audit history queries
- TypeScript types exported and usable

### 1.4 Vendor Premium Content Table (SQLite)
**Priority**: MEDIUM | **Size**: L | **Dependencies**: None

**Tasks**:
- [ ] Create migration file: `create-vendor-premium-content-table-sqlite.ts`
  ```sql
  CREATE TABLE vendor_premium_content (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN (
      'certification',
      'case_study',
      'media_gallery',
      'team_member',
      'product_catalog',
      'performance_metric'
    )),
    required_tier TEXT NOT NULL CHECK (required_tier IN ('tier1', 'tier2')),
    content_data TEXT NOT NULL,  -- JSON string
    is_published INTEGER DEFAULT 0,  -- SQLite uses 0/1 for boolean
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Create indexes for content queries
  ```sql
  CREATE INDEX idx_premium_content_vendor ON vendor_premium_content(vendor_id);
  CREATE INDEX idx_premium_content_type ON vendor_premium_content(content_type);
  CREATE INDEX idx_premium_content_published ON vendor_premium_content(is_published);
  -- Note: Can't filter WHERE is_published = 1 in index, so index all rows
  ```
- [ ] Define JSON schemas for each content type (same as PostgreSQL version)
  - Document certification schema (name, issuing_org, dates, badge)
  - Document case study schema (title, yacht, challenge, solution, results)
  - Document media gallery schema (images, videos, 3D models)
  - Document team member schema (name, role, expertise, photo)
  - Document product catalog schema (specs, pricing, availability)
- [ ] Create JSON serialization helpers
  ```typescript
  // lib/utils/premium-content-helpers.ts
  export const serializeCertification = (cert: Certification): string => 
    JSON.stringify(cert)
  export const deserializeCertification = (json: string): Certification => 
    JSON.parse(json)
  // ... similar for other content types
  ```
- [ ] Update TypeScript types in `lib/types.ts`
  - Add `VendorPremiumContent` interface
  - Add `ContentType` enum
  - Add specific interfaces for each content type (Certification, CaseStudy, etc.)
- [ ] Create rollback migration for vendor_premium_content table
- [ ] Test JSON storage and retrieval with sample data
- [ ] Document content type schemas with examples

**Acceptance Criteria**:
- Premium content table created with all constraints
- JSON content_data stores and retrieves complex objects
- Indexes optimize content queries
- Boolean is_published works with 0/1 values
- TypeScript types cover all content type variations

**SQLite Boolean Handling**:
- SQLite doesn't have native BOOLEAN type
- Use INTEGER with 0 (false) and 1 (true)
- Application layer converts to/from boolean
- ```typescript
  const toSQLiteBoolean = (value: boolean): number => value ? 1 : 0
  const fromSQLiteBoolean = (value: number): boolean => value === 1
  ```

### 1.5 Migration Execution & Verification (SQLite)
**Priority**: HIGH | **Size**: S | **Dependencies**: 1.1, 1.2, 1.3, 1.4

**Tasks**:
- [ ] Run all migrations in order on local SQLite database
- [ ] Verify schema changes with SQLite inspection
  ```bash
  sqlite3 payload.db ".schema vendors"
  sqlite3 payload.db ".schema tier_requests"
  ```
- [ ] Seed test data for each new table
  - Create sample tier requests (pending, approved, rejected)
  - Create sample audit log entries
  - Create sample premium content items (JSON serialized)
  - Add geographic data to test vendors (JSON arrays)
- [ ] Test JSON serialization/deserialization
  - Verify countries array: `'["US", "Canada"]'` → `["US", "Canada"]`
  - Verify nested objects in states/cities
  - Verify premium content data integrity
- [ ] Test foreign key constraints with delete operations
- [ ] Verify index usage with EXPLAIN QUERY PLAN
  ```sql
  EXPLAIN QUERY PLAN SELECT * FROM tier_requests WHERE vendor_id = 'test-id';
  ```
- [ ] Backup SQLite database before production migration
- [ ] Document migration order and dependencies

**Acceptance Criteria**:
- All migrations run successfully in sequence
- No database errors or constraint violations
- Test data populates all new tables correctly
- JSON data round-trips without corruption
- Indexes are used in query plans
- Schema matches SQLite-adapted technical specification

**SQLite-Specific Testing**:
- [ ] Test CURRENT_TIMESTAMP generates correct datetime format
- [ ] Test JSON functions: `json_extract()`, `json_array_length()`
- [ ] Test CHECK constraints enforce enum values
- [ ] Test CASCADE deletes work across foreign keys

---

## 2. Backend API Development

### 2.1 Vendor Geography Service (SQLite-Optimized)
**Priority**: HIGH | **Size**: L | **Dependencies**: 1.1, 1.5

**Tasks**:
- [ ] Create `lib/services/vendor-geography-service.ts`
  - Implement `getVendorsByRegion(region)` with JSON parsing
    ```typescript
    // SQLite-specific implementation
    const vendors = await db.vendors.findMany()
    const filtered = vendors.filter(v => {
      const countries = JSON.parse(v.service_countries || '[]')
      return countries.includes(region.country)
    })
    ```
  - Implement `getVendorsByProximity(lat, lon, radius)` using haversine formula
    ```typescript
    // Application-layer distance calculation (SQLite has no PostGIS)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      // Haversine formula implementation
    }
    ```
  - Implement `updateServiceRegions(vendorId, regions)` with JSON serialization
  - Implement `geocodeLocation(address)` using OpenStreetMap Nominatim API
  - Add result caching for geocoded addresses (5-minute TTL)
- [ ] Create JSON helper functions
  ```typescript
  // lib/utils/geographic-helpers.ts
  export const parseCountries = (json: string): string[] => 
    JSON.parse(json || '[]')
  export const parseStates = (json: string): ServiceState[] => 
    JSON.parse(json || '[]')
  export const parseCoordinates = (json: string): Coordinate[] => 
    JSON.parse(json || '[]')
  ```
- [ ] Write unit tests for VendorGeographyService
  - Test region filtering with JSON parsing
  - Test proximity search with haversine calculation
  - Test geocoding API integration (mock external API)
  - Test coordinate validation (lat/lon ranges)
  - Test JSON parsing edge cases (null, empty, malformed)
- [ ] Implement geographic query optimization
  - Cache parsed JSON results per request
  - Add pagination for large result sets (max 100 vendors)
  - Pre-filter by country before complex state/city checks
- [ ] Add error handling for geocoding API failures
  - Retry logic with exponential backoff
  - Fallback to existing coordinates if geocoding fails
  - Log errors for monitoring
- [ ] Document service API in JSDoc comments
- [ ] Add performance warnings for large datasets
  ```typescript
  // TODO: Replace with PostgreSQL GIN indexes in production for >1000 vendors
  // Current SQLite implementation requires full table scan for JSON queries
  ```

**Acceptance Criteria**:
- Service methods return correctly filtered vendors
- Proximity search calculates distances accurately (±1% error)
- Unit tests achieve >90% code coverage
- Geographic queries execute in <1000ms for datasets up to 1000 vendors
- JSON parsing handles all edge cases gracefully

**SQLite Performance Notes**:
- ⚠️ Full table scans required for JSON array searches (no indexes)
- ⚠️ Application-layer filtering less efficient than database queries
- ✅ Acceptable for development and small deployments (<1000 vendors)
- ✅ Will migrate to PostgreSQL GIN indexes for production scale

### 2.2 Tier Request Service (SQLite-Adapted)
**Priority**: HIGH | **Size**: L | **Dependencies**: 1.2, 1.3, 1.5

**Tasks**:
- [ ] Create `lib/services/tier-request-service.ts`
  - Implement `createTierRequest(vendorId, requestedTier, reason)` with UUID generation
    ```typescript
    import { generateUUID } from '@/lib/utils/uuid'
    
    const id = generateUUID()
    const tierRequest = await db.tierRequests.create({
      data: { id, vendor_id: vendorId, ... }
    })
    ```
  - Implement duplicate pending request check (application-layer)
    ```typescript
    const pending = await db.tierRequests.findFirst({
      where: { vendor_id: vendorId, status: 'pending' }
    })
    if (pending) throw new Error('DUPLICATE_REQUEST')
    ```
  - Implement `getTierRequests(filters)` method for vendors and admins
  - Implement `approveTierRequest(requestId, adminId, notes)` method
  - Implement `rejectTierRequest(requestId, adminId, notes)` method
  - Add validation: requested tier must differ from current tier
- [ ] Integrate with TierAuditService for logging
  - Call `logTierChange()` on approval with generated UUID
  - Call `logTierChange()` on rejection with change_type='request_rejected'
  - Pass admin_id and tier_request_id to audit log
- [ ] Implement automatic vendor tier update on approval
  - Update vendors.tier field when request approved
  - Use database transaction for atomicity
    ```typescript
    await db.$transaction([
      db.vendors.update({ where: { id: vendorId }, data: { tier: newTier }}),
      db.tierRequests.update({ where: { id }, data: { status: 'approved' }}),
      db.tierAuditLog.create({ data: { id: generateUUID(), ... }})
    ])
    ```
  - Rollback on any failure
- [ ] Write unit tests for TierRequestService
  - Test duplicate pending request rejection (application-layer check)
  - Test tier validation (current vs requested)
  - Test approval workflow with vendor tier update
  - Test rejection workflow without tier change
  - Test transaction rollback on failure
  - Test UUID generation produces unique IDs
- [ ] Add notification hooks for request status changes
  - Placeholder for email notifications (implementation in Phase 3B)
  - Log notification events for debugging
- [ ] Document service API and business rules

**Acceptance Criteria**:
- Service enforces single pending request constraint via application logic
- Approval updates vendor tier atomically using transactions
- Audit log entries created with valid UUIDs
- Unit tests achieve >90% code coverage
- Business rules documented in code comments

**SQLite Transaction Handling**:
- ✅ SQLite supports transactions (`BEGIN`, `COMMIT`, `ROLLBACK`)
- ✅ Payload ORM provides `db.$transaction()` API
- ⚠️ SQLite uses database-level locking (entire DB locked during transaction)
- ✅ Acceptable for low-concurrency scenarios (development, small deployments)

### 2.3 Tier Feature Service
**Priority**: MEDIUM | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Create `lib/services/tier-feature-service.ts`
  - Implement `checkFeatureAccess(vendorId, feature)` method
  - Implement `getAvailableFeatures(tier)` method returning feature list
  - Implement `getTierLimits(tier)` method returning limit config
  - Define tier feature configuration object (TypeScript config)
    ```typescript
    // lib/config/tier-features.ts
    export const TIER_FEATURES = {
      free: ['basic_profile', 'product_listings'],
      tier1: ['basic_profile', 'product_listings', 'certifications', 'analytics'],
      tier2: ['basic_profile', 'product_listings', 'certifications', 'analytics', 
              'case_studies', 'media_galleries', 'team_profiles', 'service_maps']
    }
    ```
- [ ] Define tier feature mapping configuration
  - Free tier: Basic profile, product listings
  - Tier 1: + Certification badges, enhanced analytics
  - Tier 2: + Case studies, media galleries, team profiles, service maps
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

**No SQLite-Specific Changes Needed**:
- This service is database-agnostic (reads vendor tier, checks config)
- Works identically for SQLite and PostgreSQL

### 2.4 Tier Audit Service (SQLite-Adapted)
**Priority**: MEDIUM | **Size**: S | **Dependencies**: 1.3, 1.5

**Tasks**:
- [ ] Create `lib/services/tier-audit-service.ts`
  - Implement `logTierChange()` with UUID generation
    ```typescript
    import { generateUUID } from '@/lib/utils/uuid'
    
    const id = generateUUID()
    await db.tierAuditLog.create({
      data: { id, vendor_id, previous_tier, new_tier, change_type, admin_id, notes }
    })
    ```
  - Implement `getTierAuditHistory(filters)` method for admin queries
  - Implement `exportAuditLog(filters)` method for CSV export
- [ ] Add validation for audit log entries
  - Ensure previous_tier and new_tier are valid enums
  - Validate change_type enum
  - Verify vendor_id and admin_id foreign keys exist
- [ ] Write unit tests for TierAuditService
  - Test audit log creation with UUID for all change types
  - Test audit history filtering by vendor and date range
  - Test CSV export formatting
- [ ] Document audit log retention policy (if applicable)

**Acceptance Criteria**:
- Audit log entries created with unique UUIDs for all tier changes
- Audit history queries support filtering and pagination
- CSV export includes all relevant fields
- Unit tests achieve >90% code coverage

**SQLite Date Handling**:
- SQLite stores dates as TEXT in ISO 8601 format: `'2025-10-18T14:30:00Z'`
- Query with date range filters: `WHERE created_at BETWEEN ? AND ?`
- Application layer converts to/from JavaScript Date objects

### 2.5 API Endpoints - Vendor Geography (SQLite-Optimized)
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.1

**Tasks**:
- [ ] Create API route: `app/api/vendors/route.ts` (extend existing)
  - Add query param support for geographic filtering (country, state, city)
    ```typescript
    // Parse query params and filter in application layer (SQLite has no JSON indexes)
    const { country, state, city } = req.query
    const vendors = await VendorGeographyService.getVendorsByRegion({ country, state, city })
    ```
  - Add query param support for proximity search (lat, lon, radius)
  - Add query param support for category filtering
  - Implement pagination (limit, offset)
  - Return vendors array + total count + available filter options
- [ ] Create API route: `app/api/vendors/[id]/service-regions/route.ts`
  - Return detailed service region data for specific vendor
  - Parse JSON fields before returning to client
    ```typescript
    const vendor = await db.vendors.findUnique({ where: { id }})
    return {
      countries: JSON.parse(vendor.service_countries || '[]'),
      states: JSON.parse(vendor.service_states || '[]'),
      // ...
    }
    ```
- [ ] Add input validation with Zod schemas
  - Validate lat/lon ranges (-90 to 90, -180 to 180)
  - Validate radius (1-1000 km)
  - Validate pagination limits (max 100)
- [ ] Implement error handling
  - 400 for invalid query params
  - 404 for vendor not found
  - 500 for service errors (with JSON parse error handling)
- [ ] Write integration tests for geography endpoints
  - Test country filtering with JSON parsing
  - Test state filtering
  - Test city filtering
  - Test proximity search with haversine calculation
  - Test pagination behavior
  - Test malformed JSON handling
- [ ] Document API endpoints in OpenAPI/Swagger format

**Acceptance Criteria**:
- Endpoints return correctly filtered vendor data
- JSON parsing handles edge cases (null, empty, malformed)
- Input validation rejects invalid params with clear error messages
- Integration tests achieve >85% coverage
- API documentation is accurate and complete

**SQLite Performance Warnings**:
- Add header: `X-DB-Engine: SQLite` (for debugging)
- Add response time header: `X-Query-Time-Ms: 250`
- Log slow queries (>500ms) for PostgreSQL migration candidates

### 2.6 API Endpoints - Tier Requests (SQLite-Adapted)
**Priority**: HIGH | **Size**: L | **Dependencies**: 2.2

**Tasks**:
- [ ] Create API route: `app/api/tier-requests/route.ts`
  - POST: Create new tier upgrade/downgrade request with UUID generation
    ```typescript
    const id = generateUUID()
    const tierRequest = await TierRequestService.createTierRequest(vendorId, requestedTier, reason)
    ```
  - GET: Retrieve tier requests (vendors see own, admins see all)
  - Add authentication middleware for JWT verification
  - Add authorization checks (vendor role for POST, vendor/admin for GET)
- [ ] Create API route: `app/api/tier-requests/[id]/route.ts`
  - PATCH: Admin approve/reject tier request (admin auth required)
  - Add admin-only authorization middleware
  - Validate status transitions (pending → approved/rejected only)
  - Update `updated_at` timestamp manually (SQLite doesn't auto-update)
    ```typescript
    await db.tierRequests.update({
      where: { id },
      data: { status, admin_notes, updated_at: new Date().toISOString() }
    })
    ```
- [ ] Create API route: `app/api/admin/vendors/[id]/tier/route.ts`
  - POST: Admin direct tier assignment with UUID for audit log
  - Add admin-only authorization
  - Log as 'admin_override' in audit trail
- [ ] Create API route: `app/api/admin/tier-audit/route.ts`
  - GET: Retrieve complete tier audit history
  - Support filtering by vendor, date range (ISO 8601 string comparison)
  - Support pagination
  - Admin-only access
- [ ] Add request validation with Zod schemas
  - Validate tier enums (free, tier1, tier2)
  - Validate status enums (pending, approved, rejected)
  - Validate reason max length (500 characters)
  - Validate UUID format (v4 UUIDs)
- [ ] Implement comprehensive error handling
  - 400: Invalid tier, duplicate request, invalid status, invalid UUID
  - 401: Not authenticated
  - 403: Not authorized (wrong role)
  - 404: Request not found
  - 500: Server error (including JSON parse errors)
- [ ] Write integration tests for tier request endpoints
  - Test vendor tier request creation with UUID
  - Test duplicate request rejection (application-layer check)
  - Test admin approval workflow
  - Test admin rejection workflow
  - Test direct tier assignment
  - Test audit history retrieval with date filtering
- [ ] Document API endpoints with request/response examples

**Acceptance Criteria**:
- All tier request endpoints function correctly
- UUIDs generated consistently (v4 format)
- Authentication and authorization enforced properly
- Validation rejects invalid requests with clear errors
- Integration tests achieve >90% coverage
- API documentation includes all error scenarios

**SQLite Timestamp Handling**:
- Manual `updated_at` updates (no automatic triggers)
- Use `new Date().toISOString()` for consistent format
- Date filtering: `WHERE created_at >= ? AND created_at <= ?`

### 2.7 Vendor Premium Content API (SQLite-Adapted)
**Priority**: MEDIUM | **Size**: L | **Dependencies**: 1.4, 1.5, 2.3

**Tasks**:
- [ ] Create API route: `app/api/vendors/[id]/premium-content/route.ts`
  - POST: Create new premium content item with JSON serialization
    ```typescript
    const id = generateUUID()
    const content_data = JSON.stringify(contentData)  // Serialize to JSON string
    await db.vendorPremiumContent.create({
      data: { id, vendor_id, content_type, required_tier, content_data, is_published: 0 }
    })
    ```
  - GET: Retrieve vendor's premium content with JSON parsing
    ```typescript
    const items = await db.vendorPremiumContent.findMany({ where: { vendor_id }})
    return items.map(item => ({
      ...item,
      content_data: JSON.parse(item.content_data),  // Deserialize for client
      is_published: item.is_published === 1  // Convert 0/1 to boolean
    }))
    ```
  - Validate tier access for content_type creation
  - Enforce tier-specific content limits
- [ ] Create API route: `app/api/vendors/[id]/premium-content/[contentId]/route.ts`
  - PATCH: Update premium content item with JSON serialization
    ```typescript
    const content_data = JSON.stringify(updatedContentData)
    const updated_at = new Date().toISOString()  // Manual timestamp update
    await db.vendorPremiumContent.update({
      where: { id: contentId },
      data: { content_data, updated_at }
    })
    ```
  - DELETE: Delete premium content item
  - Validate content_data JSON structure based on content_type
- [ ] Implement content type validation with Zod
  - Create Zod schemas for each content type (certification, case_study, etc.)
  - Validate JSON structure before serialization
  - Reject invalid content_data with field-level errors
- [ ] Add tier-based access control
  - Check vendor tier before allowing premium content creation
  - Return 403 if vendor tier insufficient for content_type
  - Provide clear upgrade prompt in error message
- [ ] Write integration tests for premium content endpoints
  - Test content creation with JSON serialization for each content_type
  - Test tier access enforcement (free tier blocked, tier2 allowed)
  - Test content update and delete operations
  - Test JSON validation for each content type
  - Test boolean conversion (0/1 to true/false)
- [ ] Document API endpoints with JSON schema examples

**Acceptance Criteria**:
- Premium content CRUD operations work correctly
- JSON serialization/deserialization round-trips without data loss
- Tier access control prevents unauthorized content creation
- Boolean values convert correctly (0/1 ↔ true/false)
- Integration tests achieve >85% coverage
- API docs include complete JSON schema for each content type

**SQLite JSON Handling**:
- Store JSON as TEXT: `content_data TEXT`
- Serialize before save: `JSON.stringify(data)`
- Deserialize after read: `JSON.parse(json)`
- Validate before serialization to prevent malformed JSON
- Handle parse errors gracefully with try/catch

---

## 3. Frontend Components & UI

> **Note**: Frontend components are largely database-agnostic. The sections below reference SQLite considerations only where API response handling differs.

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
- [ ] Handle API responses with awareness of backend filtering
  ```typescript
  // SQLite backend returns pre-filtered results (no client-side filtering needed)
  const { data: vendors } = useQuery(['vendors', filters], () =>
    fetch(`/api/vendors?country=${filters.country}`)
  )
  ```
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

**SQLite Backend Consideration**:
- Backend does application-layer filtering (slower than database queries)
- Add loading spinner during filter operations (may take 200-500ms vs <50ms with PostgreSQL)
- Consider client-side caching of filter results to reduce API calls

### 3.2 Vendor Service Area Map Component
**Priority**: MEDIUM | **Size**: L | **Dependencies**: 2.1

> **No SQLite-specific changes needed** - This component is purely frontend. See main tasks.md section 3.2 for full implementation details.

**Key Tasks** (summary):
- Install Leaflet.js and react-leaflet
- Configure OpenFreeMap tile layer
- Render vendor markers from coordinates (parsed from JSON on backend)
- Add interactive features (click, hover, zoom)
- Optimize performance (lazy loading, Intersection Observer)
- Accessibility features

### 3.3 - 3.10 Frontend Components

> **All remaining frontend components (3.3 through 3.10) are identical to the main tasks.md**  
> No SQLite-specific adaptations needed for:
> - Tier Comparison Table (3.3)
> - Tier Upgrade Request Form (3.4)
> - Tier Request Status Card (3.5)
> - Admin Tier Approval Queue (3.6)
> - Enhanced TierGate Component (3.7)
> - Tier 2 Premium Profile Editor (3.8)
> - Vendor Dashboard Subscription Page (3.9)
> - Admin Tier Management Pages (3.10)

**Key Frontend Considerations for SQLite Backend**:
- API responses include JSON-parsed data (backend handles serialization)
- Boolean values come as `true`/`false` (backend converts from 0/1)
- UUIDs are strings (not UUID type)
- Timestamps are ISO 8601 strings (parse with `new Date()`)

---

## 4. Integration & Testing

### 4.1 End-to-End Tier Upgrade Workflow Test (SQLite)
**Priority**: HIGH | **Size**: M | **Dependencies**: All 2.x, All 3.x

**Tasks**:
- [ ] Write E2E test: Vendor submits tier upgrade request
  - Log in as test vendor (free tier)
  - Navigate to subscription page
  - Select Tier 2 and submit request with reason
  - Verify success toast and pending status badge
  - Verify tier request in SQLite database with valid UUID
    ```typescript
    const tierRequest = await db.tierRequests.findFirst({ where: { vendor_id }})
    expect(tierRequest.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    ```
- [ ] Write E2E test: Admin approves tier request
  - Log in as test admin
  - Navigate to tier requests page
  - Approve pending request with admin notes
  - Verify success toast and request status updated
  - Verify vendor tier updated in SQLite database
  - Verify audit log entry created with UUID
- [ ] Write E2E test: Vendor accesses premium features after approval
  - Log in as test vendor (now tier 2)
  - Navigate to premium profile editor
  - Verify access granted (TierGate allows entry)
  - Create sample certification content (JSON serialized on backend)
  - Verify content saved and displays on vendor profile
- [ ] Test SQLite-specific edge cases
  - Verify JSON round-trip (create content, retrieve, verify no data loss)
  - Verify boolean conversion (is_published 0/1 ↔ true/false)
  - Verify timestamp formats (ISO 8601 strings)
- [ ] Verify notification system (placeholder for Phase 3B)
  - Check logs for notification events
  - Verify notification hooks called correctly

**Acceptance Criteria**:
- E2E tests pass for complete tier upgrade workflow on SQLite
- All database changes persist correctly
- UUIDs are valid v4 format
- JSON data round-trips without corruption
- Audit trail records all steps
- No errors in console or logs during workflow

### 4.2 Location-Based Vendor Discovery Test (SQLite)
**Priority**: HIGH | **Size**: M | **Dependencies**: 2.1, 2.5, 3.1, 3.2

**Tasks**:
- [ ] Write E2E test: Filter vendors by country
  - Navigate to /vendors page
  - Select "United States" from country filter
  - Verify URL updates with ?country=US
  - Verify only US vendors displayed (backend filters JSON)
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
  - Verify vendors within radius displayed (haversine calculation on backend)
  - Verify distance sorting applied
- [ ] Test SQLite performance with geographic filters
  - Measure query time with 100 vendors (should be <500ms)
  - Measure query time with 1000 vendors (may be 500-1000ms - acceptable for SQLite)
  - Log performance data for PostgreSQL migration comparison
- [ ] Write E2E test: Clear filters
  - Apply multiple filters (country, state, city)
  - Click "Clear Filters" button
  - Verify URL params cleared
  - Verify all vendors displayed again

**Acceptance Criteria**:
- E2E tests pass for all geographic filtering scenarios on SQLite
- URL params correctly persist filter state
- Map displays filtered vendors accurately
- Performance acceptable for datasets up to 1000 vendors (<1000ms)
- Performance data logged for PostgreSQL migration planning

### 4.3 Premium Content CRUD Operations Test (SQLite)
**Priority**: MEDIUM | **Size**: M | **Dependencies**: 2.7, 3.8

**Tasks**:
- [ ] Write E2E test: Create certification content
  - Log in as Tier 2 vendor
  - Navigate to premium profile editor
  - Open certifications tab
  - Fill out certification form with valid data
  - Submit form and verify success
  - Verify certification displays in content list
  - Verify JSON stored correctly in SQLite database
    ```typescript
    const content = await db.vendorPremiumContent.findFirst({ where: { vendor_id }})
    const parsed = JSON.parse(content.content_data)
    expect(parsed.name).toBe('ISO 9001:2015 Certified')
    ```
- [ ] Write E2E test: Edit certification content
  - Click edit on existing certification
  - Modify certification name and expiry date
  - Submit changes and verify success
  - Verify updated data displays correctly
  - Verify JSON serialization round-trips without data loss
- [ ] Write E2E test: Delete certification content
  - Click delete on certification
  - Confirm deletion in dialog
  - Verify certification removed from list
  - Verify deletion persisted in SQLite database
- [ ] Test SQLite-specific scenarios
  - Create content with special characters in JSON (quotes, newlines)
  - Verify emoji support in JSON strings
  - Test maximum JSON size (SQLite TEXT limit is 1GB, more than sufficient)
- [ ] Write E2E test: Tier access enforcement
  - Log in as free tier vendor
  - Attempt to navigate to premium profile editor
  - Verify TierGate blocks access
  - Verify upgrade prompt displayed

**Acceptance Criteria**:
- E2E tests pass for all premium content CRUD operations on SQLite
- JSON data round-trips without corruption or data loss
- Special characters and emoji handled correctly
- Tier gating prevents unauthorized access
- No errors during content creation/editing

### 4.4 API Integration Testing (SQLite-Specific)
**Priority**: HIGH | **Size**: L | **Dependencies**: All 2.x

**Tasks**:
- [ ] Write integration tests for all API endpoints
  - Test success scenarios with valid data
  - Test validation errors with invalid data
  - Test authentication/authorization enforcement
  - Test error handling (404, 500, etc.)
  - Test JSON parsing errors (malformed data in database)
  - Test UUID validation (invalid format rejection)
- [ ] Test SQLite database transaction integrity
  - Verify tier request approval updates vendor tier atomically
  - Verify rollback on failure (simulate error mid-transaction)
  - Verify foreign key constraints enforced
- [ ] Test API performance under load (SQLite-specific)
  - Simulate 10 concurrent vendor requests (SQLite locks database)
  - Measure response times for geography endpoints (expect 200-500ms with JSON parsing)
  - Identify bottlenecks for PostgreSQL migration
  - Document performance baseline for comparison
- [ ] Test SQLite-specific edge cases
  - Test concurrent writes (SQLite database locking)
  - Test JSON parse error handling (corrupted data)
  - Test boolean conversion (0/1 to true/false)
  - Test timestamp parsing (ISO 8601 strings)
- [ ] Test API security
  - Verify JWT token validation
  - Test CSRF protection (if applicable)
  - Test SQL injection prevention (parameterized queries)
  - Test XSS prevention in API responses

**Acceptance Criteria**:
- All integration tests pass (>90% API coverage)
- SQLite database transactions maintain integrity
- API performance meets SQLite expectations (200-1000ms p95 depending on query)
- Performance baseline documented for PostgreSQL comparison
- No security vulnerabilities found

**SQLite Performance Baselines** (for PostgreSQL comparison):
- Simple queries (by ID): <50ms
- JSON array filtering: 100-500ms (vs <20ms with PostgreSQL GIN indexes)
- Proximity search: 200-800ms (vs <50ms with PostGIS)
- Concurrent writes: Serialized due to database lock (vs parallel with PostgreSQL)

### 4.5 Cross-Browser and Responsive Design Testing
**Priority**: MEDIUM | **Size**: M | **Dependencies**: All 3.x

> **No SQLite-specific changes needed** - See main tasks.md section 4.5 for full testing requirements.

**Key Tasks** (summary):
- Test all components in Chrome, Firefox, Safari, Edge
- Test responsive layouts on multiple device sizes
- Test map component performance on mobile devices
- Test form interactions on touch devices

---

## 5. Documentation & Deployment

### 5.1 API Documentation (SQLite Version)
**Priority**: MEDIUM | **Size**: S | **Dependencies**: All 2.x

**Tasks**:
- [ ] Document all API endpoints in OpenAPI/Swagger format
  - Include request/response schemas
  - Include authentication requirements
  - Include error response examples
  - **Add SQLite-specific notes**: JSON serialization, UUID format, boolean as 0/1
- [ ] Generate API documentation website (optional)
  - Use Swagger UI or similar tool
  - Deploy to /api-docs route
  - Add banner: "Using SQLite backend - see PostgreSQL docs for production"
- [ ] Write API integration guide for frontend developers
  - Example API calls with curl and fetch
  - Authentication flow explanation
  - Error handling best practices
  - **SQLite-specific guidance**: Expect slower geographic queries, JSON responses
- [ ] Document rate limiting and pagination strategies
- [ ] Document SQLite limitations and workarounds
  - JSON array filtering requires full table scan
  - Proximity search uses application-layer haversine calculation
  - Database-level locking for concurrent writes

**Acceptance Criteria**:
- All API endpoints documented with complete schemas
- SQLite-specific behaviors clearly noted
- API docs accessible and easy to navigate
- Integration guide includes working code examples
- Performance expectations documented (SQLite vs PostgreSQL)

### 5.2 Developer Documentation (SQLite Version)
**Priority**: MEDIUM | **Size**: M | **Dependencies**: All sections

**Tasks**:
- [ ] Update CLAUDE.md with Phase 3A SQLite architecture
  - Document new database tables and relationships (SQLite schema)
  - Document tier management workflow
  - Document geographic vendor discovery features
  - **Add section**: "SQLite vs PostgreSQL: When to Migrate"
- [ ] Write migration guide for SQLite database schema changes
  - Step-by-step instructions for running migrations
  - Rollback procedures if needed
  - Data backfill instructions for existing vendors
  - JSON serialization/deserialization patterns
- [ ] Document SQLite-specific implementation details
  - UUID generation in application layer (not database)
  - JSON storage as TEXT with manual parsing
  - Boolean as INTEGER (0/1) with conversion helpers
  - Timestamp as DATETIME in ISO 8601 format
  - Application-layer unique constraint enforcement
- [ ] Document tier feature configuration
  - How to add new tier-specific features
  - How to modify tier limits
  - How to configure feature access rules
- [ ] Create troubleshooting guide
  - Common issues and solutions
  - Debugging tier upgrade workflow
  - Debugging geographic filtering issues
  - **SQLite-specific**: JSON parse errors, database locking, performance issues
- [ ] Document PostgreSQL migration plan (reference tasks-postgres.md)
  - When to migrate (vendor count >1000, performance issues)
  - Data migration strategy (SQLite → PostgreSQL)
  - Testing migration in staging environment

**Acceptance Criteria**:
- CLAUDE.md updated with Phase 3A SQLite architecture
- Migration guide complete and tested on SQLite
- SQLite-specific patterns documented with code examples
- Developer documentation clear and comprehensive
- PostgreSQL migration plan referenced

### 5.3 User Documentation
**Priority**: LOW | **Size**: S | **Dependencies**: All 3.x

> **No SQLite-specific changes needed** - User-facing documentation is database-agnostic.

**Key Tasks** (summary):
- Write vendor user guide for tier upgrade process
- Write vendor user guide for premium features
- Write admin user guide for tier management

### 5.4 Deployment Preparation (SQLite)
**Priority**: HIGH | **Size**: M | **Dependencies**: All sections

**Tasks**:
- [ ] Create deployment checklist (SQLite version)
  - SQLite database migration steps
  - Environment variable updates
  - Feature flag configuration (if applicable)
  - Rollback plan
  - **SQLite-specific**: Backup .db file before migration
- [ ] Set up staging environment for Phase 3A testing
  - Deploy to staging with SQLite database migrations
  - Run full test suite on staging
  - Perform manual QA testing
  - Test SQLite performance with production-like data volume
- [ ] Prepare production deployment plan
  - Schedule deployment window
  - Notify stakeholders of deployment
  - Prepare monitoring alerts
  - **Decision point**: Deploy with SQLite or migrate to PostgreSQL first?
- [ ] Configure environment variables for production
  - OpenStreetMap Nominatim API URL
  - OpenFreeMap tile server URL
  - SQLite database path (or PostgreSQL connection string if migrating)
- [ ] Set up monitoring and logging
  - Add error tracking for new API endpoints
  - Set up performance monitoring for geographic queries
  - Configure alerts for tier upgrade workflow failures
  - **SQLite-specific**: Monitor database lock timeouts, slow JSON queries
- [ ] Create SQLite database backup strategy
  - Automated backups before each deployment
  - Point-in-time recovery capability (periodic .db file snapshots)
  - Test restore procedure

**Acceptance Criteria**:
- Deployment checklist complete and reviewed
- Staging environment fully functional with SQLite
- Production deployment plan approved
- Monitoring and logging configured
- SQLite backup strategy in place
- **Decision made**: Deploy with SQLite or PostgreSQL for production

**SQLite Production Considerations**:
- ✅ Acceptable for deployments with <1000 vendors
- ✅ Simple backup/restore (just copy .db file)
- ⚠️ Performance degrades with large datasets (>1000 vendors)
- ⚠️ Database-level locking limits concurrency
- 🔄 Plan PostgreSQL migration when limits are reached

### 5.5 Post-Deployment Validation (SQLite)
**Priority**: HIGH | **Size**: S | **Dependencies**: 5.4

**Tasks**:
- [ ] Run smoke tests on production after deployment
  - Test vendor tier upgrade workflow end-to-end
  - Test geographic vendor filtering
  - Test admin tier approval queue
  - Test premium content creation (JSON serialization)
- [ ] Monitor error rates and performance metrics
  - Check for increased error rates after deployment
  - Verify API response times within SQLite expectations (200-1000ms)
  - Check database query performance
  - **SQLite-specific**: Monitor database lock timeouts
- [ ] Validate data integrity
  - Verify migrations applied correctly
  - Check for orphaned records or constraint violations
  - Verify audit logs capturing tier changes
  - Verify JSON data integrity (no parse errors)
- [ ] Monitor SQLite performance metrics
  - Track geographic query response times
  - Track database file size growth
  - Track concurrent request handling
  - **Set threshold**: Migrate to PostgreSQL if response times >2000ms p95
- [ ] Gather initial user feedback
  - Monitor vendor support requests
  - Track tier upgrade request volume
  - Collect admin feedback on approval workflow
  - Identify performance bottlenecks for PostgreSQL migration

**Acceptance Criteria**:
- Smoke tests pass on production
- No significant increase in errors or performance degradation
- SQLite performance within acceptable range for current data volume
- Data integrity verified (JSON parsing, UUIDs, booleans)
- Initial user feedback collected and documented
- PostgreSQL migration triggers identified

---

## SQLite Implementation Timeline

### Week 1: Database & Core Services (SQLite)
- Days 1-2: SQLite database schema migrations (1.1, 1.2, 1.3, 1.4)
- Days 3-4: Migration execution and testing with JSON serialization (1.5)
- Day 5: Vendor Geography Service with haversine calculation (2.1)

### Week 2: Backend API Development
- Days 1-2: Tier Request Service with UUID generation (2.2)
- Day 3: Tier Feature Service and Tier Audit Service (2.3, 2.4)
- Days 4-5: Geography API endpoints with JSON parsing (2.5)

### Week 3: Backend API & Frontend Start
- Days 1-2: Tier Request API endpoints with SQLite transactions (2.6)
- Day 3: Premium Content API with JSON serialization (2.7)
- Days 4-5: Location Filter Component and Service Map (3.1, 3.2)

### Week 4: Frontend Components
- Days 1-2: Tier Comparison and Upgrade Form (3.3, 3.4)
- Day 3: Tier Request Status Card (3.5)
- Days 4-5: Admin Approval Queue (3.6)

### Week 5: Premium Features & Pages
- Days 1-3: Enhanced TierGate and Premium Profile Editor (3.7, 3.8)
- Days 4-5: Dashboard pages (3.9, 3.10)

### Week 6: Testing & Documentation
- Days 1-2: E2E workflow tests with SQLite verification (4.1, 4.2, 4.3)
- Day 3: API integration testing with SQLite baselines (4.4)
- Day 4: Cross-browser testing (4.5)
- Day 5: Documentation with SQLite notes (5.1, 5.2, 5.3)

### Week 7: Deployment
- Days 1-2: Deployment preparation with SQLite backup strategy (5.4)
- Day 3: Production deployment (SQLite)
- Days 4-5: Post-deployment validation and PostgreSQL migration planning (5.5)

---

## SQLite Limitations Summary

### What Works Well with SQLite
✅ **Tier management workflow** - Application-layer logic, small data volume  
✅ **Audit logging** - Append-only, no complex queries  
✅ **Premium content storage** - JSON serialization works fine  
✅ **Authentication & authorization** - Database-agnostic  
✅ **Small to medium deployments** - <1000 vendors, <100 concurrent users

### What's Slower with SQLite
⚠️ **Geographic filtering** - No GIN indexes, full table scans for JSON arrays  
⚠️ **Proximity search** - Application-layer haversine calculation (no PostGIS)  
⚠️ **Concurrent writes** - Database-level locking serializes transactions  
⚠️ **Large datasets** - Performance degrades significantly >1000 vendors

### When to Migrate to PostgreSQL
🔄 **Vendor count >1000** - Geographic queries become unacceptably slow  
🔄 **Geographic query p95 >2000ms** - User experience degradation  
🔄 **Concurrent write conflicts** - Database lock timeouts under load  
🔄 **Production deployment** - PostgreSQL recommended for scalability

---

## Success Criteria (SQLite Version)

### Technical Success Criteria
- [ ] All SQLite database migrations run successfully without data loss
- [ ] All API endpoints return correct data with <1000ms p95 response time (SQLite)
- [ ] JSON serialization/deserialization works correctly for all content types
- [ ] UUID generation produces valid v4 UUIDs consistently
- [ ] All frontend components render correctly across browsers and devices
- [ ] Integration tests achieve >85% code coverage
- [ ] E2E tests pass for all major workflows on SQLite
- [ ] Zero critical bugs in production after deployment

### Business Success Criteria
- [ ] Vendors can successfully submit tier upgrade requests
- [ ] Admins can approve/reject requests with full audit trail
- [ ] Vendors can create and manage premium content (Tier 2+)
- [ ] Users can filter vendors by geographic location (with acceptable performance)
- [ ] Map displays vendor service areas accurately
- [ ] Tier-based feature access enforced correctly

### User Experience Success Criteria
- [ ] Tier comparison table clearly communicates value of each tier
- [ ] Tier upgrade request process takes <2 minutes to complete
- [ ] Admin approval queue allows processing requests in <30 seconds each
- [ ] Location filter reduces vendor results to relevant regional providers
- [ ] Premium profile editor is intuitive and easy to use
- [ ] All components meet WCAG 2.1 AA accessibility standards
- [ ] Geographic queries respond in <1 second for datasets up to 1000 vendors

### PostgreSQL Migration Readiness
- [ ] Performance baseline documented for all SQLite queries
- [ ] PostgreSQL migration tasks documented (see tasks-postgres.md)
- [ ] Migration triggers defined (vendor count, query performance)
- [ ] Data migration strategy prepared (SQLite → PostgreSQL)

---

## Notes

- **Database**: SQLite for development and initial implementation
- **PostgreSQL Migration**: Separate task document (tasks-postgres.md) for production scaling
- **Payment Integration Deferred**: Phase 3B will add Stripe integration
- **Email Notifications Placeholder**: Hooks included but service integration deferred to Phase 3B
- **External Dependencies**: OpenStreetMap Nominatim API (free), OpenFreeMap (free)
- **Performance Target**: <1000ms p95 for SQLite (vs <500ms for PostgreSQL)
- **Accessibility Commitment**: WCAG 2.1 AA standards throughout

---

## Appendix: SQLite Quick Reference

### Key Differences from PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Array Types** | TEXT with JSON: `'["US","CA"]'` | Native: `TEXT[]` |
| **JSONB** | TEXT with JSON | Native JSONB with indexes |
| **UUID** | TEXT, app-generated | UUID with `gen_random_uuid()` |
| **Boolean** | INTEGER (0/1) | Native BOOLEAN |
| **Timestamps** | DATETIME, ISO 8601 string | TIMESTAMP with NOW() |
| **Unique Constraints** | Simple only, app enforces partial | Partial indexes with WHERE |
| **JSON Indexes** | No indexes, full scans | GIN indexes for fast queries |
| **Geospatial** | App-layer haversine | PostGIS extension |
| **Concurrency** | Database-level lock | Row-level locking |

### Helper Functions to Create

```typescript
// lib/utils/sqlite-helpers.ts

// UUID generation
import { randomUUID } from 'crypto'
export const generateUUID = (): string => randomUUID()

// JSON serialization
export const toJSON = (obj: any): string => JSON.stringify(obj)
export const fromJSON = <T>(json: string): T => JSON.parse(json || '{}')

// Boolean conversion
export const toSQLiteBoolean = (value: boolean): number => value ? 1 : 0
export const fromSQLiteBoolean = (value: number): boolean => value === 1

// Timestamp helpers
export const toSQLiteTimestamp = (date: Date): string => date.toISOString()
export const fromSQLiteTimestamp = (str: string): Date => new Date(str)

// Geographic helpers
export const parseCountries = (json: string): string[] => fromJSON(json)
export const parseCoordinates = (json: string): Coordinate[] => fromJSON(json)
```

### Common Queries

```sql
-- Get vendors by country (full table scan, no index help)
SELECT * FROM vendors WHERE json_extract(service_countries, '$') LIKE '%"US"%';

-- Get tier requests by status
SELECT * FROM tier_requests WHERE status = 'pending' ORDER BY created_at DESC;

-- Get audit log for vendor
SELECT * FROM tier_audit_log WHERE vendor_id = ? ORDER BY created_at DESC;

-- Get premium content for vendor (with boolean conversion needed)
SELECT *, CASE WHEN is_published = 1 THEN 'true' ELSE 'false' END as published 
FROM vendor_premium_content WHERE vendor_id = ?;
```

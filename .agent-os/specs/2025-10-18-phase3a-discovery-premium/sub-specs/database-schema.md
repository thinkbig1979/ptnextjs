# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-10-18-phase3a-discovery-premium/spec.md

## Schema Changes Overview

This spec requires extending the existing **vendors** table and creating three new tables: **tier_requests**, **tier_audit_log**, and **vendor_premium_content** to support location-based discovery, tier management workflow, and premium feature content storage.

## New Tables

### tier_requests

**Purpose**: Track vendor-initiated tier upgrade/downgrade requests awaiting admin approval

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

-- Indexes for performance
CREATE INDEX idx_tier_requests_vendor ON tier_requests(vendor_id);
CREATE INDEX idx_tier_requests_status ON tier_requests(status);
CREATE INDEX idx_tier_requests_created ON tier_requests(created_at DESC);
```

**Rationale**:
- **no_duplicate_pending constraint**: Prevents vendors from submitting multiple tier requests before admin processes the first one
- **Partial unique index**: Uses PostgreSQL partial index to enforce uniqueness only for pending requests, allowing multiple approved/rejected requests in history
- **Cascading delete**: If vendor is deleted, their tier requests are automatically cleaned up
- **Admin tracking**: Records which admin processed the request for accountability

### tier_audit_log

**Purpose**: Immutable audit trail of all tier changes for compliance and billing tracking

```sql
CREATE TABLE tier_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  previous_tier VARCHAR(10) NOT NULL,
  new_tier VARCHAR(10) NOT NULL,
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN (
    'request_approved',
    'request_rejected',
    'admin_override',
    'system_automatic'
  )),
  admin_id UUID REFERENCES users(id),
  tier_request_id UUID REFERENCES tier_requests(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_tier_audit_vendor ON tier_audit_log(vendor_id);
CREATE INDEX idx_tier_audit_created ON tier_audit_log(created_at DESC);
CREATE INDEX idx_tier_audit_admin ON tier_audit_log(admin_id) WHERE admin_id IS NOT NULL;
```

**Rationale**:
- **Immutable log**: No UPDATE or DELETE operations on audit logs, only INSERT for complete history
- **Change type tracking**: Differentiates between approved requests, admin overrides, and system-triggered changes (future automated tier upgrades)
- **Referential linking**: Links back to originating tier_request for context, but audit log persists even if request is deleted
- **Admin accountability**: Records which admin made the change for compliance and troubleshooting

### vendor_premium_content

**Purpose**: Store tier-specific premium content (certifications, case studies, media galleries, etc.) with tier access control

```sql
CREATE TABLE vendor_premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
    'certification',
    'case_study',
    'media_gallery',
    'team_member',
    'product_catalog',
    'performance_metric'
  )),
  required_tier VARCHAR(10) NOT NULL CHECK (required_tier IN ('tier1', 'tier2')),
  content_data JSONB NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for content queries
CREATE INDEX idx_premium_content_vendor ON vendor_premium_content(vendor_id);
CREATE INDEX idx_premium_content_type ON vendor_premium_content(content_type);
CREATE INDEX idx_premium_content_published ON vendor_premium_content(is_published)
  WHERE is_published = true;
```

**Content Data Schema Examples**:

**Certification** (required_tier: 'tier2'):
```json
{
  "name": "ISO 9001:2015 Certified",
  "issuing_org": "International Organization for Standardization",
  "issue_date": "2023-01-15",
  "expiry_date": "2026-01-15",
  "verification_url": "https://example.com/verify/12345",
  "badge_image": "/uploads/iso-9001-badge.png"
}
```

**Case Study** (required_tier: 'tier2'):
```json
{
  "title": "Navigation System Integration on M/Y Eclipse",
  "yacht_name": "M/Y Eclipse",
  "project_date": "2024-03-01",
  "challenge": "Integrate multi-vendor navigation systems into unified bridge display",
  "solution": "Custom middleware layer for real-time data aggregation",
  "results": "30% faster route planning, 99.9% system uptime",
  "images": ["/uploads/eclipse-bridge-1.jpg", "/uploads/eclipse-bridge-2.jpg"],
  "testimonial": "Outstanding integration work - Captain Smith"
}
```

**Rationale**:
- **JSONB storage**: Flexible schema for different content types while maintaining queryability
- **Tier gating**: required_tier field enforces feature access control
- **Published flag**: Allows vendors to draft content before publishing to public profile
- **Content type enum**: Prevents typos and ensures consistent categorization

## Modified Tables

### vendors (extend existing table)

**New columns to add**:

```sql
ALTER TABLE vendors ADD COLUMN service_countries TEXT[] DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN service_states JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN service_cities JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN service_coordinates JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN coverage_notes TEXT;
```

**Data format examples**:

```typescript
// service_countries: Simple array of country names
["United States", "Canada", "United Kingdom"]

// service_states: Array of objects with country and state
[
  { "country": "United States", "state": "California" },
  { "country": "United States", "state": "Florida" },
  { "country": "Canada", "state": "British Columbia" }
]

// service_cities: Array of objects with full location hierarchy
[
  { "country": "United States", "state": "California", "city": "San Diego" },
  { "country": "United States", "state": "California", "city": "Los Angeles" }
]

// service_coordinates: Array of lat/lon points with labels
[
  { "lat": 32.7157, "lon": -117.1611, "label": "San Diego HQ" },
  { "lat": 33.7701, "lon": -118.1937, "label": "Long Beach Service Center" }
]

// coverage_notes: Free-form text
"We provide on-site service for all Southern California ports and remote support globally."
```

**Indexes for geographic queries**:

```sql
CREATE INDEX idx_vendors_service_countries ON vendors USING GIN(service_countries);
CREATE INDEX idx_vendors_service_states ON vendors USING GIN(service_states);
CREATE INDEX idx_vendors_service_cities ON vendors USING GIN(service_cities);
```

**Rationale**:
- **Array for countries**: Simple string array sufficient for country-level filtering
- **JSONB for states/cities**: Hierarchical structure needed to maintain country/state/city relationships
- **JSONB for coordinates**: Flexible structure allows adding multiple locations with labels
- **GIN indexes**: Enable fast containment queries for location-based filtering (e.g., "show vendors in California")
- **Coverage notes**: Provides human-readable explanation of service areas for edge cases

## Migrations

### Migration 001: Add geographic fields to vendors

```sql
-- Add new columns
ALTER TABLE vendors ADD COLUMN service_countries TEXT[] DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN service_states JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN service_cities JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN service_coordinates JSONB DEFAULT '[]';
ALTER TABLE vendors ADD COLUMN coverage_notes TEXT;

-- Add indexes
CREATE INDEX idx_vendors_service_countries ON vendors USING GIN(service_countries);
CREATE INDEX idx_vendors_service_states ON vendors USING GIN(service_states);
CREATE INDEX idx_vendors_service_cities ON vendors USING GIN(service_cities);
```

**Rollback**:
```sql
DROP INDEX IF EXISTS idx_vendors_service_cities;
DROP INDEX IF EXISTS idx_vendors_service_states;
DROP INDEX IF EXISTS idx_vendors_service_countries;

ALTER TABLE vendors DROP COLUMN IF EXISTS coverage_notes;
ALTER TABLE vendors DROP COLUMN IF EXISTS service_coordinates;
ALTER TABLE vendors DROP COLUMN IF EXISTS service_cities;
ALTER TABLE vendors DROP COLUMN IF EXISTS service_states;
ALTER TABLE vendors DROP COLUMN IF EXISTS service_countries;
```

### Migration 002: Create tier_requests table

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

**Rollback**:
```sql
DROP TABLE IF EXISTS tier_requests CASCADE;
```

### Migration 003: Create tier_audit_log table

```sql
CREATE TABLE tier_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  previous_tier VARCHAR(10) NOT NULL,
  new_tier VARCHAR(10) NOT NULL,
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN (
    'request_approved',
    'request_rejected',
    'admin_override',
    'system_automatic'
  )),
  admin_id UUID REFERENCES users(id),
  tier_request_id UUID REFERENCES tier_requests(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tier_audit_vendor ON tier_audit_log(vendor_id);
CREATE INDEX idx_tier_audit_created ON tier_audit_log(created_at DESC);
CREATE INDEX idx_tier_audit_admin ON tier_audit_log(admin_id) WHERE admin_id IS NOT NULL;
```

**Rollback**:
```sql
DROP TABLE IF EXISTS tier_audit_log CASCADE;
```

### Migration 004: Create vendor_premium_content table

```sql
CREATE TABLE vendor_premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
    'certification',
    'case_study',
    'media_gallery',
    'team_member',
    'product_catalog',
    'performance_metric'
  )),
  required_tier VARCHAR(10) NOT NULL CHECK (required_tier IN ('tier1', 'tier2')),
  content_data JSONB NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_premium_content_vendor ON vendor_premium_content(vendor_id);
CREATE INDEX idx_premium_content_type ON vendor_premium_content(content_type);
CREATE INDEX idx_premium_content_published ON vendor_premium_content(is_published)
  WHERE is_published = true;
```

**Rollback**:
```sql
DROP TABLE IF EXISTS vendor_premium_content CASCADE;
```

### Migration 005: Backfill service_countries for existing vendors

```sql
-- Set default empty arrays for existing vendors
UPDATE vendors
SET service_countries = '{}',
    service_states = '[]',
    service_cities = '[]',
    service_coordinates = '[]'
WHERE service_countries IS NULL;

-- Manual data entry required: Admins should update vendor service regions via admin panel
```

**Rationale**: Existing vendors won't have geographic data populated. This migration ensures schema consistency, but admin manual entry will be needed to populate accurate service regions for each vendor.

## Data Integrity Rules

1. **Tier Request Constraints**:
   - Vendor can only have ONE pending tier request at a time (enforced by `no_duplicate_pending` constraint)
   - Requested tier must differ from current tier (application-level validation)
   - Only admin users can update tier_request.status (authorization enforcement)

2. **Audit Log Integrity**:
   - Audit logs are append-only (no UPDATEs or DELETEs allowed except via admin override)
   - Every tier change must create an audit log entry (enforced by TierRequestService)
   - Audit logs link to tier_requests when applicable for traceability

3. **Geographic Data Validation**:
   - Latitude must be between -90 and 90 (application-level validation)
   - Longitude must be between -180 and 180 (application-level validation)
   - service_states JSONB must include valid country field for each entry
   - service_cities JSONB must include valid country and state fields

4. **Premium Content Access**:
   - Content with required_tier='tier2' is only accessible to Tier 2 vendors (application-level enforcement)
   - Unpublished content (is_published=false) is only visible in vendor's own dashboard
   - Content_type enum prevents invalid content categories

## Performance Considerations

**Index Strategy**:
- **GIN indexes** on geographic arrays/JSONB enable fast containment queries (e.g., `WHERE service_countries @> ARRAY['United States']`)
- **B-tree indexes** on foreign keys (vendor_id, admin_id) for join performance
- **Partial indexes** on filtered columns (e.g., `WHERE is_published = true`) reduce index size and improve write performance

**Query Optimization**:
- Location-based vendor queries should use GIN indexes on service_countries/states/cities
- Avoid full table scans by always filtering on indexed columns (status, vendor_id)
- Pagination required for vendor listings (max 100 per page) to prevent memory issues

**Expected Data Volume**:
- **vendors**: 10,000 records (current: ~100)
- **tier_requests**: 50,000 records (accumulates over time, mostly historical)
- **tier_audit_log**: 50,000+ records (grows with every tier change)
- **vendor_premium_content**: 100,000 records (multiple content items per vendor)

Indexes and query optimization strategies are designed to handle 10x current data volume efficiently.

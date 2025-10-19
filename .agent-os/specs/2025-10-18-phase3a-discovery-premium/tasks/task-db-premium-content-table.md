# Task: db-premium-content-table - Create Vendor Premium Content Table (SQLite)

## Task Metadata
- **Task ID**: db-premium-content-table
- **Phase**: Phase 3A: Database Schema & Migrations
- **Agent**: backend-database-specialist
- **Estimated Time**: 40-50 minutes
- **Dependencies**: None
- **Status**: [ ] Not Started

## Task Description
Create the vendor_premium_content table in SQLite to store tier-specific premium content (certifications, case studies, media galleries, team profiles, etc.) using JSON serialization for flexible content_data storage.

## Specifics
- **Migration File to Create**:
  - `/home/edwin/development/ptnextjs/payload/migrations/create-vendor-premium-content-sqlite.ts`
- **Table Schema**:
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
    is_published INTEGER DEFAULT 0,  -- SQLite boolean: 0=false, 1=true
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX idx_premium_content_vendor ON vendor_premium_content(vendor_id);
  CREATE INDEX idx_premium_content_type ON vendor_premium_content(content_type);
  CREATE INDEX idx_premium_content_published ON vendor_premium_content(is_published);
  ```
- **JSON Content Schemas to Document** (`lib/types.ts`):
  ```typescript
  // Certification content
  export interface CertificationContent {
    name: string
    issuing_org: string
    issue_date: string  // ISO 8601
    expiry_date: string  // ISO 8601
    verification_url?: string
    badge_image?: string  // Upload path
  }
  
  // Case Study content
  export interface CaseStudyContent {
    title: string
    yacht_name: string
    project_date: string  // ISO 8601
    challenge: string
    solution: string
    results: string
    images: string[]  // Upload paths
    testimonial?: string
  }
  
  // Media Gallery content
  export interface MediaGalleryContent {
    album_name: string
    images: string[]
    videos: { url: string, thumbnail?: string }[]
    models_3d: { url: string, format: string }[]
  }
  
  // Team Member content
  export interface TeamMemberContent {
    name: string
    role: string
    expertise: string[]
    bio: string
    photo?: string
    linkedin_url?: string
  }
  
  // Product Catalog content
  export interface ProductCatalogContent {
    product_name: string
    specifications: Record<string, string>
    pricing: { base_price: number, currency: string, notes?: string }
    availability: string
  }
  
  // Performance Metric content
  export interface PerformanceMetricContent {
    metric_name: string
    value: number
    unit: string
    period: string
    comparison?: { previous: number, change_pct: number }
  }
  
  export type PremiumContentData = 
    | CertificationContent 
    | CaseStudyContent 
    | MediaGalleryContent 
    | TeamMemberContent 
    | ProductCatalogContent 
    | PerformanceMetricContent
  
  export interface VendorPremiumContent {
    id: string
    vendor_id: string
    content_type: string
    required_tier: 'tier1' | 'tier2'
    content_data: PremiumContentData
    is_published: boolean
    created_at: Date
    updated_at: Date
  }
  ```
- **Helper Functions to Create** (`lib/utils/premium-content-helpers.ts`):
  ```typescript
  export const serializePremiumContent = (data: PremiumContentData): string => 
    JSON.stringify(data)
  
  export const deserializePremiumContent = (json: string): PremiumContentData => 
    JSON.parse(json)
  
  export const toSQLiteBoolean = (value: boolean): number => value ? 1 : 0
  export const fromSQLiteBoolean = (value: number): boolean => value === 1
  ```

## Acceptance Criteria
- [ ] Migration file created with complete table schema
- [ ] CHECK constraints enforce content_type and required_tier enums
- [ ] is_published uses INTEGER (0/1) for SQLite boolean compatibility
- [ ] Three indexes created (vendor_id, content_type, is_published)
- [ ] TypeScript interfaces defined for all 6 content types
- [ ] Helper functions created for JSON serialization and boolean conversion
- [ ] Rollback migration created (DROP TABLE IF EXISTS vendor_premium_content CASCADE)
- [ ] Migration runs successfully on development database
- [ ] Sample content inserted for each content_type to validate JSON storage

## Testing Requirements
- **Unit Tests**:
  - Test serializePremiumContent with each content type
  - Test deserializePremiumContent handles malformed JSON gracefully
  - Test boolean conversion helpers (0 ↔ false, 1 ↔ true)
  - Test JSON roundtrip (serialize → deserialize) preserves data
- **Integration Tests**:
  - Run migration and verify table exists
  - Insert certification with JSON content_data
  - Retrieve and verify JSON parses correctly
  - Test CHECK constraint: invalid content_type rejected
  - Test CHECK constraint: invalid required_tier rejected
  - Test foreign key: invalid vendor_id rejected
  - Test CASCADE delete: deleting vendor removes premium content
  - Test is_published values (0 and 1 only)
  - Verify indexes with EXPLAIN QUERY PLAN
- **Manual Verification**:
  - Insert content for each type (certification, case_study, etc.)
  - Verify JSON stored as TEXT in database
  - Check special characters, unicode, emoji in JSON strings

## Evidence Required
- Migration file with complete schema
- Helper functions with error handling
- Test results for all 6 content types
- Sample JSON data for each content type
- Proof of JSON roundtrip without data loss

## Context Requirements
- SQLite schema patterns from tasks-sqlite.md section 1.4
- UUID helper from task-db-tier-requests-table
- Database schema spec from sub-specs/database-schema.md
- Existing vendors table structure

## Implementation Notes
- **SQLite Boolean Handling**:
  - SQLite has no native BOOLEAN type
  - Use INTEGER: 0 for false, 1 for true
  - Application layer converts to/from JavaScript boolean
  - Validation: Only allow 0 or 1 (not other integers)
- **JSON Content Data**:
  - Store as TEXT (not JSONB like PostgreSQL)
  - Serialize before save: `JSON.stringify(contentData)`
  - Deserialize after read: `JSON.parse(contentData)`
  - Handle parse errors with try-catch → return null or empty object
- **Content Type Tier Requirements**:
  - Tier 1 content: `certification`, `team_member` (basic enhancements)
  - Tier 2 content: `case_study`, `media_gallery`, `product_catalog`, `performance_metric` (advanced features)
  - Enforce tier access in application layer (not database)
- **is_published Workflow**:
  - Vendors create content as draft (is_published=0)
  - Vendors publish when ready (is_published=1)
  - Only published content shown on public vendor profile
  - Drafts visible in vendor dashboard for editing
- **Updated_at Handling**:
  - SQLite doesn't auto-update updated_at column
  - Application must manually set: `updated_at = new Date().toISOString()`
  - Consider trigger for auto-update (optional):
    ```sql
    CREATE TRIGGER update_premium_content_timestamp
    AFTER UPDATE ON vendor_premium_content
    FOR EACH ROW
    BEGIN
      UPDATE vendor_premium_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
    ```

## Quality Gates
- [ ] JSON serialization never loses data (roundtrip test)
- [ ] Boolean conversion is consistent (0/1 ↔ false/true)
- [ ] All content types have complete TypeScript interfaces
- [ ] Special characters and unicode handled correctly in JSON
- [ ] Indexes improve query performance for vendor content lookups

## Related Files
- Main Tasks: `tasks-sqlite.md` section 1.4
- Database Schema: `sub-specs/database-schema.md` (vendor_premium_content table)
- Technical Spec: `sub-specs/technical-spec.md` (Premium Content System)
- UUID Helper: `/home/edwin/development/ptnextjs/lib/utils/uuid.ts`

## Next Steps After Completion
- Create Premium Content API endpoints (task-api-premium-content-endpoints)
- Build Premium Profile Editor UI component (task-ui-premium-profile-editor)
- Integrate tier access control (task-ui-enhanced-tier-gate)

# Task: db-vendor-geographic-fields - Add Geographic Fields to Vendors Table (SQLite)

## Task Metadata
- **Task ID**: db-vendor-geographic-fields
- **Phase**: Phase 3A: Database Schema & Migrations
- **Agent**: backend-database-specialist
- **Estimated Time**: 30-40 minutes
- **Dependencies**: None
- **Status**: [ ] Not Started

## Task Description
Extend the existing vendors table with geographic service region fields using SQLite-compatible schema. Add TEXT columns with JSON serialization for countries, states, cities, and coordinates. Create helper functions for JSON parsing and serialization.

## Specifics
- **Migration File to Create**:
  - `/home/edwin/development/ptnextjs/payload/migrations/add-vendor-geographic-fields-sqlite.ts`
- **Schema Changes**:
  ```sql
  ALTER TABLE vendors ADD COLUMN service_countries TEXT DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN service_states TEXT DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN service_cities TEXT DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN service_coordinates TEXT DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN coverage_notes TEXT;
  
  -- Create basic indexes
  CREATE INDEX idx_vendors_service_countries ON vendors(service_countries);
  ```
- **JSON Data Formats**:
  - `service_countries`: `'["United States", "Canada"]'`
  - `service_states`: `'[{"country":"US","state":"CA"},{"country":"US","state":"FL"}]'`
  - `service_cities`: `'[{"country":"US","state":"CA","city":"San Diego"}]'`
  - `service_coordinates`: `'[{"lat":32.7157,"lon":-117.1611,"label":"HQ"}]'`
- **Helper Functions to Create**:
  - `/home/edwin/development/ptnextjs/lib/utils/geographic-helpers.ts`
  ```typescript
  export const serializeCountries = (countries: string[]): string => JSON.stringify(countries)
  export const deserializeCountries = (json: string): string[] => JSON.parse(json || '[]')
  export const serializeStates = (states: ServiceState[]): string => JSON.stringify(states)
  export const deserializeStates = (json: string): ServiceState[] => JSON.parse(json || '[]')
  // ... similar for cities and coordinates
  ```

## Acceptance Criteria
- [ ] Migration file created and follows Payload migration patterns
- [ ] All 5 new columns added to vendors table with correct types
- [ ] Default values set to empty JSON arrays (`'[]'`)
- [ ] Basic indexes created on service_countries column
- [ ] Helper functions created in geographic-helpers.ts
- [ ] Helper functions handle edge cases (null, empty string, malformed JSON)
- [ ] TypeScript interfaces defined for ServiceState, ServiceCity, Coordinate
- [ ] Rollback migration created and tested
- [ ] Migration runs successfully without errors
- [ ] Existing vendor data preserved (no data loss)

## Testing Requirements
- **Unit Tests**:
  - Test serializeCountries with empty array, single country, multiple countries
  - Test deserializeCountries with valid JSON, null, empty string, malformed JSON
  - Test coordinate validation (lat: -90 to 90, lon: -180 to 180)
  - Test edge cases: special characters, unicode in country names
- **Integration Tests**:
  - Run migration on test database
  - Verify all columns added with PRAGMA table_info(vendors)
  - Insert test vendor with geographic data
  - Retrieve and verify JSON round-trip (serialize → store → retrieve → deserialize)
  - Test rollback migration restores original schema
- **Manual Verification**:
  - Run migration on local development database
  - Check vendors table schema in SQLite browser
  - Verify default values for existing vendors

## Evidence Required
- Migration file showing schema changes
- Helper functions with error handling
- Test results showing 100% pass rate for helper functions
- SQLite schema dump showing new columns
- Sample vendor record with populated geographic data

## Context Requirements
- SQLite migration patterns from tasks-sqlite.md section 1.1
- Database schema spec from sub-specs/database-schema.md
- Existing vendors table structure
- Payload CMS migration API documentation

## Implementation Notes
- **SQLite Limitations**:
  - No native array types → use TEXT with JSON
  - No JSONB → use TEXT with JSON.parse/stringify
  - Indexes on JSON columns don't help query performance (full table scans)
  - Performance acceptable for <1000 vendors
- **Error Handling**:
  - Wrap JSON.parse in try-catch with fallback to empty array
  - Validate JSON structure before serialization
  - Log malformed JSON for debugging
- **Migration Safety**:
  - Use IF NOT EXISTS for columns (idempotent migrations)
  - Test on backup database first
  - Keep rollback migration in same directory
- **TypeScript Types**:
  ```typescript
  interface ServiceState {
    country: string
    state: string
  }
  
  interface ServiceCity {
    country: string
    state: string
    city: string
  }
  
  interface Coordinate {
    lat: number
    lon: number
    label: string
  }
  ```

## Quality Gates
- [ ] Migration is idempotent (can run multiple times safely)
- [ ] No data loss when adding columns
- [ ] Helper functions never throw unhandled exceptions
- [ ] JSON validation prevents malformed data in database
- [ ] TypeScript strict mode passes

## Related Files
- Main Tasks: `tasks-sqlite.md` section 1.1
- Database Schema: `sub-specs/database-schema.md`
- Technical Spec: `sub-specs/technical-spec.md` (Database Schema section)
- Payload Config: `/home/edwin/development/ptnextjs/payload.config.ts`

## Next Steps After Completion
- Update Payload CMS vendor collection schema (separate task)
- Create VendorGeographyService to use these fields (task-api-vendor-geography-service)
- Build frontend components for geographic filtering (task-ui-vendor-location-filter)

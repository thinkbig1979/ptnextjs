# PostgreSQL Migration Tasks

> **Spec**: Phase 3A - PostgreSQL Production Migration  
> **Database**: PostgreSQL (Production & Staging)  
> **Created**: 2025-10-18  
> **Status**: Post-SQLite Implementation

## Overview

This document provides the **PostgreSQL migration path** for Phase 3A after SQLite implementation is complete. This migration enables production-scale performance with proper indexing, native array types, JSONB support, and PostGIS for geographic queries.

**When to Migrate**:
- Vendor count exceeds 1000 (geographic queries become slow)
- SQLite query p95 exceeds 2000ms
- Concurrent write conflicts occur (database lock timeouts)
- Preparing for production deployment with scale requirements

**Estimated Timeline**: 1-2 weeks  
**Dependencies**: SQLite implementation complete (tasks-sqlite.md)

---

## Migration Categories

### 1. PostgreSQL Setup & Configuration (1-2 days)
### 2. Schema Migration (SQLite → PostgreSQL) (2-3 days)
### 3. Data Migration & Verification (1-2 days)
### 4. Code Refactoring for PostgreSQL (2-3 days)
### 5. Performance Testing & Optimization (1-2 days)
### 6. Deployment & Rollback Planning (1 day)

---

## 1. PostgreSQL Setup & Configuration

### 1.1 PostgreSQL Installation & Setup
**Priority**: HIGH | **Size**: M | **Dependencies**: None

**Tasks**:
- [ ] Choose PostgreSQL hosting option
  - **Option A**: Managed service (Neon, Supabase, AWS RDS, Render)
    - ✅ Automatic backups, scaling, maintenance
    - ✅ Free tier available (Neon: 512MB, Supabase: 500MB)
    - ⚠️ Cost increases with usage
  - **Option B**: Self-hosted (DigitalOcean Droplet, Hetzner VPS)
    - ✅ Full control, lower long-term cost
    - ⚠️ Manual backups, maintenance, security
  - **Recommendation**: Neon or Supabase for free tier + easy migration path
- [ ] Provision PostgreSQL database
  - Create database instance
  - Configure connection string
  - Set up SSL/TLS for secure connections
  - Create database user with appropriate permissions
- [ ] Install PostgreSQL locally for development
  ```bash
  # macOS
  brew install postgresql@15
  brew services start postgresql@15
  
  # Ubuntu/Debian
  sudo apt install postgresql-15 postgresql-contrib
  
  # Create local database
  createdb ptnextjs_dev
  ```
- [ ] Configure Payload CMS for PostgreSQL
  - Update `payload.config.ts` with PostgreSQL adapter
  - Install `@payloadcms/db-postgres` package
  ```typescript
  import { postgresAdapter } from '@payloadcms/db-postgres'
  
  export default buildConfig({
    db: postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URL
      }
    })
  })
  ```
- [ ] Set up environment variables
  ```bash
  # .env.local (development)
  DATABASE_URL=postgresql://user:password@localhost:5432/ptnextjs_dev
  
  # .env.production (production)
  DATABASE_URL=postgresql://user:password@host:5432/ptnextjs_prod
  ```
- [ ] Test PostgreSQL connection
  - Verify Payload admin connects to PostgreSQL
  - Run simple queries to verify permissions

**Acceptance Criteria**:
- PostgreSQL installed locally and accessible
- Production PostgreSQL database provisioned
- Payload CMS connects successfully to PostgreSQL
- Environment variables configured for dev and prod
- Connection pooling configured (max 20 connections)

### 1.2 PostgreSQL Extensions Setup
**Priority**: HIGH | **Size**: S | **Dependencies**: 1.1

**Tasks**:
- [ ] Enable required PostgreSQL extensions
  ```sql
  -- UUID support (required)
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- PostGIS for geographic queries (optional for now, future use)
  -- CREATE EXTENSION IF NOT EXISTS "postgis";
  
  -- pg_trgm for fuzzy text search (optional, future use)
  -- CREATE EXTENSION IF NOT EXISTS "pg_trgm";
  ```
- [ ] Verify extension installation
  ```sql
  SELECT * FROM pg_extension;
  ```
- [ ] Test UUID generation
  ```sql
  SELECT uuid_generate_v4();
  ```
- [ ] Document installed extensions in README

**Acceptance Criteria**:
- uuid-ossp extension enabled
- UUID generation works (`uuid_generate_v4()`)
- Extensions documented

---

## 2. Schema Migration (SQLite → PostgreSQL)

### 2.1 Create PostgreSQL-Native Schema
**Priority**: HIGH | **Size**: L | **Dependencies**: 1.1, 1.2

**Tasks**:
- [ ] Create migration: `vendors-geographic-fields-postgres.sql`
  ```sql
  -- Add geographic fields with native PostgreSQL types
  ALTER TABLE vendors ADD COLUMN service_countries TEXT[] DEFAULT '{}';
  ALTER TABLE vendors ADD COLUMN service_states JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN service_cities JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN service_coordinates JSONB DEFAULT '[]';
  ALTER TABLE vendors ADD COLUMN coverage_notes TEXT;
  
  -- Create GIN indexes for fast array/JSONB queries
  CREATE INDEX idx_vendors_service_countries ON vendors USING GIN(service_countries);
  CREATE INDEX idx_vendors_service_states ON vendors USING GIN(service_states);
  CREATE INDEX idx_vendors_service_cities ON vendors USING GIN(service_cities);
  ```
- [ ] Create migration: `tier-requests-postgres.sql`
  ```sql
  CREATE TABLE tier_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    -- Partial unique index (PostgreSQL-specific)
    CONSTRAINT no_duplicate_pending UNIQUE NULLS NOT DISTINCT (vendor_id, status) 
      WHERE status = 'pending'
  );
  
  CREATE INDEX idx_tier_requests_vendor ON tier_requests(vendor_id);
  CREATE INDEX idx_tier_requests_status ON tier_requests(status);
  CREATE INDEX idx_tier_requests_created ON tier_requests(created_at DESC);
  ```
- [ ] Create migration: `tier-audit-log-postgres.sql`
  ```sql
  CREATE TABLE tier_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
- [ ] Create migration: `vendor-premium-content-postgres.sql`
  ```sql
  CREATE TABLE vendor_premium_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
- [ ] Create rollback migrations for all tables
- [ ] Verify schema with PostgreSQL inspector tools
  ```bash
  psql $DATABASE_URL -c "\d vendors"
  psql $DATABASE_URL -c "\d tier_requests"
  ```

**Acceptance Criteria**:
- All tables created with native PostgreSQL types
- GIN indexes created on array and JSONB columns
- Partial unique index works on tier_requests
- UUID defaults work (`uuid_generate_v4()`)
- Rollback migrations tested
- Schema matches technical specification exactly

**PostgreSQL Advantages Gained**:
- ✅ Native TEXT[] arrays (no JSON parsing needed)
- ✅ JSONB with GIN indexes (fast queries on nested data)
- ✅ Partial unique indexes (database-enforced constraints)
- ✅ UUID generation in database (no application logic)
- ✅ Native BOOLEAN type (no 0/1 conversion)
- ✅ Automatic updated_at with triggers (optional)

### 2.2 Create Updated Triggers (Optional Performance Enhancement)
**Priority**: LOW | **Size**: S | **Dependencies**: 2.1

**Tasks**:
- [ ] Create automatic updated_at trigger
  ```sql
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  CREATE TRIGGER update_tier_requests_updated_at
    BEFORE UPDATE ON tier_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  CREATE TRIGGER update_premium_content_updated_at
    BEFORE UPDATE ON vendor_premium_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  ```
- [ ] Test trigger functionality
  ```sql
  UPDATE tier_requests SET status = 'approved' WHERE id = 'test-uuid';
  SELECT updated_at FROM tier_requests WHERE id = 'test-uuid';
  -- Verify updated_at changed automatically
  ```

**Acceptance Criteria**:
- Triggers created successfully
- updated_at updates automatically on row changes
- No manual timestamp updates needed in code

---

## 3. Data Migration & Verification

### 3.1 SQLite to PostgreSQL Data Migration Script
**Priority**: HIGH | **Size**: L | **Dependencies**: 2.1

**Tasks**:
- [ ] Create migration script: `scripts/migrate-sqlite-to-postgres.ts`
  ```typescript
  import { openSQLiteDB, connectPostgres } from './db-helpers'
  
  async function migrateTierRequests() {
    const sqlite = openSQLiteDB()
    const postgres = await connectPostgres()
    
    const tierRequests = sqlite.prepare('SELECT * FROM tier_requests').all()
    
    for (const request of tierRequests) {
      await postgres.query(`
        INSERT INTO tier_requests (
          id, vendor_id, current_tier, requested_tier, status,
          vendor_reason, admin_notes, admin_id, created_at, updated_at, processed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        request.id,  // Keep existing UUIDs
        request.vendor_id,
        request.current_tier,
        request.requested_tier,
        request.status,
        request.vendor_reason,
        request.admin_notes,
        request.admin_id,
        new Date(request.created_at),
        new Date(request.updated_at),
        request.processed_at ? new Date(request.processed_at) : null
      ])
    }
    
    console.log(`Migrated ${tierRequests.length} tier requests`)
  }
  
  async function migrateVendorGeography() {
    const sqlite = openSQLiteDB()
    const postgres = await connectPostgres()
    
    const vendors = sqlite.prepare('SELECT id, service_countries, service_states, service_cities, service_coordinates, coverage_notes FROM vendors').all()
    
    for (const vendor of vendors) {
      // Parse JSON strings from SQLite
      const countries = JSON.parse(vendor.service_countries || '[]')
      const states = JSON.parse(vendor.service_states || '[]')
      const cities = JSON.parse(vendor.service_cities || '[]')
      const coordinates = JSON.parse(vendor.service_coordinates || '[]')
      
      // Insert into PostgreSQL with native types
      await postgres.query(`
        UPDATE vendors SET
          service_countries = $1::text[],  -- Cast to TEXT array
          service_states = $2::jsonb,
          service_cities = $3::jsonb,
          service_coordinates = $4::jsonb,
          coverage_notes = $5
        WHERE id = $6
      `, [countries, states, cities, coordinates, vendor.coverage_notes, vendor.id])
    }
    
    console.log(`Migrated geography data for ${vendors.length} vendors`)
  }
  
  async function migratePremiumContent() {
    const sqlite = openSQLiteDB()
    const postgres = await connectPostgres()
    
    const content = sqlite.prepare('SELECT * FROM vendor_premium_content').all()
    
    for (const item of content) {
      const contentData = JSON.parse(item.content_data)
      
      await postgres.query(`
        INSERT INTO vendor_premium_content (
          id, vendor_id, content_type, required_tier, content_data, is_published,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
      `, [
        item.id,
        item.vendor_id,
        item.content_type,
        item.required_tier,
        contentData,  // Will be cast to JSONB
        item.is_published === 1,  // Convert 0/1 to boolean
        new Date(item.created_at),
        new Date(item.updated_at)
      ])
    }
    
    console.log(`Migrated ${content.length} premium content items`)
  }
  
  async function main() {
    console.log('Starting SQLite → PostgreSQL migration...')
    await migrateTierRequests()
    await migrateVendorGeography()
    await migratePremiumContent()
    await migrateAuditLog()  // Similar pattern
    console.log('Migration complete!')
  }
  
  main().catch(console.error)
  ```
- [ ] Add data validation step
  - Count rows in SQLite and PostgreSQL (must match)
  - Verify JSON data integrity (no parse errors)
  - Verify foreign key relationships intact
  - Verify UUID format correct
- [ ] Add error handling and logging
  - Log each migration step
  - Rollback transaction on any error
  - Save migration report to file
- [ ] Test migration on staging database first
- [ ] Create migration rollback script (PostgreSQL → SQLite if needed)

**Acceptance Criteria**:
- Migration script successfully transfers all data
- Row counts match between SQLite and PostgreSQL
- No data corruption or loss
- Foreign keys intact
- JSON/JSONB data valid
- UUIDs preserved correctly
- Migration script tested on staging environment

### 3.2 Data Verification & Integrity Checks
**Priority**: HIGH | **Size**: M | **Dependencies**: 3.1

**Tasks**:
- [ ] Verify row counts match
  ```bash
  # SQLite
  sqlite3 payload.db "SELECT COUNT(*) FROM tier_requests;"
  
  # PostgreSQL
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM tier_requests;"
  ```
- [ ] Verify data integrity
  ```sql
  -- Check for NULL values that shouldn't exist
  SELECT * FROM tier_requests WHERE vendor_id IS NULL;
  
  -- Verify foreign key relationships
  SELECT COUNT(*) FROM tier_requests tr
  LEFT JOIN vendors v ON tr.vendor_id = v.id
  WHERE v.id IS NULL;
  
  -- Verify JSON validity
  SELECT id FROM vendors WHERE service_countries IS NULL;
  ```
- [ ] Verify indexes created
  ```sql
  SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'vendors';
  ```
- [ ] Run sample queries and compare results
  - Geographic filtering: same vendors returned?
  - Tier requests: same pending requests?
  - Premium content: same content items?
- [ ] Test CRUD operations on PostgreSQL
  - Create new tier request
  - Update vendor geography
  - Delete premium content
  - Verify audit log entries

**Acceptance Criteria**:
- All row counts match exactly
- No orphaned foreign keys
- All indexes present and functional
- Query results identical between SQLite and PostgreSQL
- CRUD operations work correctly

---

## 4. Code Refactoring for PostgreSQL

### 4.1 Remove SQLite-Specific Code
**Priority**: HIGH | **Size**: L | **Dependencies**: 3.1, 3.2

**Tasks**:
- [ ] Update VendorGeographyService for PostgreSQL
  ```typescript
  // BEFORE (SQLite - application-layer filtering)
  const vendors = await db.vendors.findMany()
  const filtered = vendors.filter(v => {
    const countries = JSON.parse(v.service_countries || '[]')
    return countries.includes(region.country)
  })
  
  // AFTER (PostgreSQL - database-level filtering)
  const vendors = await db.vendors.findMany({
    where: {
      service_countries: {
        has: region.country  // Native array containment
      }
    }
  })
  ```
- [ ] Update proximity search to use PostGIS (future enhancement)
  ```typescript
  // Current: Application-layer haversine calculation
  // Future with PostGIS:
  // SELECT * FROM vendors 
  // WHERE ST_DWithin(
  //   ST_MakePoint(lon, lat)::geography,
  //   ST_MakePoint($1, $2)::geography,
  //   $3 * 1000  // radius in meters
  // );
  ```
- [ ] Remove UUID generation helpers
  ```typescript
  // REMOVE: lib/utils/uuid.ts (no longer needed)
  // PostgreSQL generates UUIDs automatically
  
  // BEFORE
  import { generateUUID } from '@/lib/utils/uuid'
  const id = generateUUID()
  await db.tierRequests.create({ data: { id, ...} })
  
  // AFTER
  await db.tierRequests.create({ data: { ...} })  // id auto-generated
  ```
- [ ] Remove JSON serialization helpers
  ```typescript
  // REMOVE: lib/utils/json-helpers.ts (for geographic fields)
  // REMOVE: lib/utils/premium-content-helpers.ts
  
  // BEFORE (SQLite)
  const content_data = JSON.stringify(certificationData)
  await db.vendorPremiumContent.create({ data: { content_data }})
  
  // AFTER (PostgreSQL with JSONB)
  await db.vendorPremiumContent.create({ 
    data: { content_data: certificationData }  // Payload ORM handles JSONB
  })
  ```
- [ ] Remove boolean conversion helpers
  ```typescript
  // REMOVE: toSQLiteBoolean, fromSQLiteBoolean
  
  // BEFORE (SQLite)
  const is_published = toSQLiteBoolean(true)  // 1
  await db.vendorPremiumContent.create({ data: { is_published }})
  
  // AFTER (PostgreSQL)
  await db.vendorPremiumContent.create({ 
    data: { is_published: true }  // Native boolean
  })
  ```
- [ ] Update TierRequestService to remove duplicate check
  ```typescript
  // REMOVE: Application-layer unique constraint enforcement
  // const pending = await db.tierRequests.findFirst({ 
  //   where: { vendor_id, status: 'pending' }
  // })
  // if (pending) throw new Error('DUPLICATE_REQUEST')
  
  // PostgreSQL partial unique index enforces this at database level
  // Will throw unique constraint violation error if duplicate
  ```
- [ ] Update API endpoints to remove manual timestamp updates
  ```typescript
  // REMOVE: Manual updated_at updates
  // const updated_at = new Date().toISOString()
  
  // If using triggers (section 2.2), updated_at updates automatically
  // Otherwise, PostgreSQL DEFAULT NOW() handles it
  ```

**Acceptance Criteria**:
- All SQLite-specific helper functions removed
- No JSON.parse/JSON.stringify for geographic or premium content data
- No manual UUID generation
- No boolean conversion (0/1 ↔ true/false)
- No application-layer unique constraint checks
- All unit tests pass with PostgreSQL

### 4.2 Optimize Queries for PostgreSQL Performance
**Priority**: MEDIUM | **Size**: M | **Dependencies**: 4.1

**Tasks**:
- [ ] Update geographic queries to use native array operators
  ```typescript
  // Country filtering (uses GIN index)
  await db.vendors.findMany({
    where: {
      service_countries: {
        has: 'US'  // Fast with GIN index
      }
    }
  })
  
  // Multiple countries (any match)
  await db.vendors.findMany({
    where: {
      service_countries: {
        hasSome: ['US', 'Canada']  // Fast with GIN index
      }
    }
  })
  ```
- [ ] Update JSONB queries for states/cities
  ```typescript
  // Find vendors in specific state
  await db.vendors.findMany({
    where: {
      service_states: {
        path: '$[*].state',
        array_contains: 'California'
      }
    }
  })
  ```
- [ ] Add query performance logging
  ```typescript
  const startTime = Date.now()
  const vendors = await db.vendors.findMany({ where: filters })
  const queryTime = Date.now() - startTime
  
  if (queryTime > 100) {
    console.warn(`Slow query: ${queryTime}ms`, filters)
  }
  ```
- [ ] Add EXPLAIN ANALYZE for complex queries
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM vendors 
  WHERE service_countries @> ARRAY['US']::text[]
  AND service_states @> '[{"country":"US","state":"CA"}]'::jsonb;
  ```
- [ ] Optimize pagination queries
  ```typescript
  // Use cursor-based pagination for large datasets
  await db.vendors.findMany({
    cursor: { id: lastVendorId },
    take: 100,
    orderBy: { created_at: 'desc' }
  })
  ```

**Acceptance Criteria**:
- All geographic queries use GIN indexes (verify with EXPLAIN)
- Query performance <50ms p95 for typical filters
- Slow query logging captures queries >100ms
- Pagination optimized for large datasets
- No full table scans for indexed columns

### 4.3 Update TypeScript Types
**Priority**: LOW | **Size**: S | **Dependencies**: 4.1

**Tasks**:
- [ ] Update `lib/types.ts` for native PostgreSQL types
  ```typescript
  // BEFORE (SQLite)
  interface TierRequest {
    id: string  // TEXT
    vendor_id: string
    created_at: string  // ISO 8601 string
    is_published: number  // 0 or 1
  }
  
  // AFTER (PostgreSQL)
  interface TierRequest {
    id: string  // Still string (UUID as string)
    vendor_id: string
    created_at: Date  // Native Date object
    is_published: boolean  // Native boolean
  }
  ```
- [ ] Update Payload CMS collection schemas
  ```typescript
  // payload/collections/TierRequests.ts
  export const TierRequests: CollectionConfig = {
    fields: [
      {
        name: 'id',
        type: 'text',
        // No longer need custom UUID generation
        // PostgreSQL handles this automatically
      },
      {
        name: 'is_published',
        type: 'checkbox',  // Maps to boolean, not integer
      }
    ]
  }
  ```
- [ ] Remove SQLite-specific type guards
  ```typescript
  // REMOVE: Type guards for SQLite quirks
  // const isPublished = typeof value === 'number' ? value === 1 : value
  ```

**Acceptance Criteria**:
- TypeScript types reflect native PostgreSQL types
- No type coercion needed for booleans or dates
- Payload schemas updated for PostgreSQL
- All type errors resolved

---

## 5. Performance Testing & Optimization

### 5.1 Benchmark PostgreSQL vs SQLite
**Priority**: HIGH | **Size**: M | **Dependencies**: 4.1, 4.2

**Tasks**:
- [ ] Create benchmark script: `scripts/benchmark-postgres.ts`
  ```typescript
  async function benchmarkGeographicQuery() {
    console.log('Benchmarking geographic queries...')
    
    // Test: Find vendors in California
    const iterations = 100
    const times = []
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now()
      await db.vendors.findMany({
        where: {
          service_countries: { has: 'US' },
          service_states: { path: '$[*].state', array_contains: 'California' }
        }
      })
      times.push(Date.now() - start)
    }
    
    const avg = times.reduce((a, b) => a + b) / times.length
    const p95 = times.sort()[Math.floor(times.length * 0.95)]
    
    console.log(`Geographic query - Avg: ${avg}ms, p95: ${p95}ms`)
  }
  
  async function benchmarkProximitySearch() {
    // Test: Find vendors within 50km of San Diego
    const lat = 32.7157, lon = -117.1611, radius = 50
    
    // ... benchmark proximity search (haversine or PostGIS)
  }
  
  async function main() {
    await benchmarkGeographicQuery()
    await benchmarkProximitySearch()
    await benchmarkTierRequestWorkflow()
    await benchmarkPremiumContentCreation()
  }
  ```
- [ ] Run benchmarks on both SQLite and PostgreSQL
  - Document baseline: SQLite performance from tasks-sqlite.md
  - Measure PostgreSQL performance with same queries
  - Compare results in table format
- [ ] Create performance comparison report
  | Query Type | SQLite p95 | PostgreSQL p95 | Improvement |
  |------------|-----------|---------------|-------------|
  | Country filter | 300ms | 15ms | 20x faster |
  | State filter | 450ms | 25ms | 18x faster |
  | Proximity search | 800ms | 40ms (PostGIS) | 20x faster |
  | Tier request create | 50ms | 30ms | 1.7x faster |
- [ ] Identify any performance regressions
- [ ] Optimize slow queries with EXPLAIN ANALYZE

**Acceptance Criteria**:
- Benchmark script runs successfully on both databases
- Performance comparison documented
- PostgreSQL queries faster than SQLite for all operations
- No performance regressions found
- Optimization opportunities identified

### 5.2 Load Testing with PostgreSQL
**Priority**: MEDIUM | **Size**: M | **Dependencies**: 5.1

**Tasks**:
- [ ] Create load test script with k6 or Artillery
  ```javascript
  // k6-load-test.js
  import http from 'k6/http'
  
  export let options = {
    stages: [
      { duration: '1m', target: 10 },   // Ramp up to 10 users
      { duration: '3m', target: 50 },   // Ramp up to 50 users
      { duration: '1m', target: 0 },    // Ramp down
    ],
  }
  
  export default function () {
    // Test geographic filtering
    http.get('http://localhost:3000/api/vendors?country=US&state=CA')
    
    // Test tier request creation
    http.post('http://localhost:3000/api/tier-requests', JSON.stringify({
      requested_tier: 'tier2',
      reason: 'Load test'
    }), { headers: { 'Content-Type': 'application/json' }})
  }
  ```
- [ ] Run load tests on staging environment
  - 50 concurrent users
  - 1000 requests/minute
  - Monitor PostgreSQL connection pool usage
- [ ] Monitor PostgreSQL metrics during load test
  - Active connections
  - Query response times
  - CPU and memory usage
  - Slow query log
- [ ] Identify bottlenecks
  - Connection pool exhaustion?
  - Slow queries under load?
  - Database CPU saturation?
- [ ] Optimize based on findings
  - Increase connection pool size if needed
  - Add missing indexes
  - Optimize slow queries

**Acceptance Criteria**:
- Load tests complete without errors
- PostgreSQL handles 50 concurrent users smoothly
- Connection pool usage <80% of max
- Query response times <100ms p95 under load
- No connection timeouts or database errors

---

## 6. Deployment & Rollback Planning

### 6.1 Staging Deployment & Testing
**Priority**: HIGH | **Size**: M | **Dependencies**: All previous sections

**Tasks**:
- [ ] Deploy PostgreSQL-enabled code to staging
  - Update environment variables (DATABASE_URL)
  - Run database migrations
  - Verify all services start successfully
- [ ] Run full test suite on staging
  - Unit tests (>90% passing)
  - Integration tests (>85% passing)
  - E2E tests (all critical workflows)
- [ ] Perform manual QA testing
  - Test vendor tier upgrade workflow
  - Test geographic filtering
  - Test premium content creation
  - Test admin approval queue
- [ ] Test data migration on staging
  - Backup staging SQLite database
  - Run migration script (SQLite → PostgreSQL)
  - Verify data integrity
  - Test rollback (PostgreSQL → SQLite)
- [ ] Monitor staging for 48 hours
  - Check error logs
  - Monitor query performance
  - Verify no memory leaks
  - Check PostgreSQL connection pool

**Acceptance Criteria**:
- Staging deployment successful
- All tests pass on staging
- Manual QA testing complete with no critical bugs
- Data migration tested and verified
- 48-hour monitoring shows no issues

### 6.2 Production Migration Plan
**Priority**: HIGH | **Size**: M | **Dependencies**: 6.1

**Tasks**:
- [ ] Create production migration checklist
  - [ ] Backup current SQLite database
  - [ ] Provision production PostgreSQL database
  - [ ] Update production environment variables
  - [ ] Schedule maintenance window (low-traffic time)
  - [ ] Notify stakeholders of downtime (estimate 30-60 minutes)
  - [ ] Run database migrations
  - [ ] Run data migration script (SQLite → PostgreSQL)
  - [ ] Verify data integrity
  - [ ] Deploy PostgreSQL-enabled code
  - [ ] Run smoke tests
  - [ ] Monitor for 2 hours
  - [ ] Update DNS/load balancer if needed
- [ ] Create rollback plan
  - Step 1: Stop application servers
  - Step 2: Restore SQLite database from backup
  - Step 3: Deploy SQLite-compatible code (from previous commit)
  - Step 4: Verify rollback successful
  - Step 5: Notify stakeholders
  - **Time estimate**: 15 minutes to rollback
- [ ] Prepare monitoring alerts
  - Database connection errors
  - Slow query alerts (>500ms)
  - High error rates (>1% of requests)
  - PostgreSQL connection pool exhaustion
- [ ] Document migration runbook
  - Pre-migration steps
  - Migration execution steps
  - Post-migration verification steps
  - Rollback procedure

**Acceptance Criteria**:
- Production migration checklist complete
- Rollback plan tested on staging
- Monitoring alerts configured
- Migration runbook documented
- Stakeholder communication plan ready

### 6.3 Post-Migration Monitoring
**Priority**: HIGH | **Size**: S | **Dependencies**: 6.2

**Tasks**:
- [ ] Monitor production for first 48 hours
  - Check error logs every 2 hours
  - Review slow query log
  - Monitor PostgreSQL metrics (CPU, memory, connections)
  - Track API response times
- [ ] Run smoke tests every 4 hours
  - Test vendor tier upgrade workflow
  - Test geographic filtering
  - Test premium content CRUD
- [ ] Compare performance metrics to baseline
  - Response times: should be faster than SQLite
  - Error rates: should be same or lower
  - Database CPU: should be <50% under normal load
- [ ] Document any issues and resolutions
  - Create incident reports for any problems
  - Update troubleshooting guide
- [ ] Optimize based on production data
  - Add missing indexes if slow queries found
  - Adjust connection pool size if needed
  - Tune PostgreSQL configuration (shared_buffers, work_mem)

**Acceptance Criteria**:
- 48-hour monitoring complete with no critical issues
- Performance metrics better than SQLite baseline
- Error rates same or lower than before migration
- Any issues documented and resolved
- Production optimization complete

---

## PostgreSQL Migration Timeline

### Week 1: Setup & Schema Migration
- Days 1-2: PostgreSQL setup and configuration (1.1, 1.2)
- Days 3-5: Schema migration and testing (2.1, 2.2)

### Week 2: Data Migration & Code Refactoring
- Days 1-2: Data migration script and verification (3.1, 3.2)
- Days 3-5: Code refactoring for PostgreSQL (4.1, 4.2, 4.3)

### Week 3: Testing & Deployment (if needed)
- Days 1-2: Performance testing and benchmarking (5.1, 5.2)
- Days 3-4: Staging deployment and testing (6.1)
- Day 5: Production migration (6.2, 6.3)

---

## Success Criteria

### Technical Success Criteria
- [ ] PostgreSQL database provisioned and accessible
- [ ] All schemas migrated with native PostgreSQL types (TEXT[], JSONB, UUID, BOOLEAN)
- [ ] GIN indexes created and verified with EXPLAIN ANALYZE
- [ ] All SQLite data migrated without loss
- [ ] All SQLite-specific code removed
- [ ] PostgreSQL queries 10-20x faster than SQLite for geographic operations
- [ ] Load testing passes with 50 concurrent users
- [ ] Production deployment successful with <1 hour downtime

### Performance Success Criteria
- [ ] Geographic filtering p95 <50ms (vs 300-500ms SQLite)
- [ ] Proximity search p95 <100ms (vs 800ms SQLite)
- [ ] Tier request creation p95 <30ms (same as SQLite)
- [ ] Premium content CRUD p95 <50ms (vs 100-200ms SQLite)
- [ ] API response times <500ms p95 for all endpoints
- [ ] PostgreSQL connection pool usage <80% under normal load

### Business Success Criteria
- [ ] Zero data loss during migration
- [ ] All vendor data accessible after migration
- [ ] Geographic filtering noticeably faster for users
- [ ] System scales to 10,000+ vendors without performance degradation
- [ ] Production deployment with <1 hour downtime window

---

## PostgreSQL Advantages Summary

### Performance Improvements
| Feature | SQLite | PostgreSQL | Improvement |
|---------|--------|------------|-------------|
| **Geographic Filtering** | 300-500ms (full scan) | <50ms (GIN index) | 10-20x faster |
| **Proximity Search** | 800ms (app-layer) | <100ms (PostGIS future) | 8x faster |
| **JSON Queries** | 200-400ms (parse + filter) | <30ms (JSONB index) | 10x faster |
| **Concurrent Writes** | Serialized (DB lock) | Parallel (row-level locks) | 10-100x throughput |
| **Scalability** | <1000 vendors | 10,000+ vendors | 10x capacity |

### Developer Experience
- ✅ No JSON.parse/stringify needed
- ✅ No manual UUID generation
- ✅ No boolean conversion (0/1)
- ✅ No application-layer unique constraints
- ✅ Database-enforced data integrity
- ✅ Native array and JSON operators
- ✅ Better error messages (constraint violations)
- ✅ Industry-standard SQL patterns

### Production Readiness
- ✅ Proven scalability (millions of rows)
- ✅ Advanced indexing (GIN, GiST, BRIN)
- ✅ Row-level locking (high concurrency)
- ✅ Built-in replication and backup
- ✅ Extension ecosystem (PostGIS, pg_trgm, etc.)
- ✅ Comprehensive monitoring tools (pg_stat_statements)
- ✅ Managed hosting options (Neon, Supabase, AWS RDS)

---

## Notes

- **Migration Timing**: Migrate when vendor count >1000 or SQLite p95 >2000ms
- **Downtime Window**: Estimate 30-60 minutes for production migration
- **Rollback Time**: 15 minutes to rollback to SQLite if issues occur
- **Cost**: Free tier options available (Neon 512MB, Supabase 500MB)
- **Future Enhancements**: PostGIS for advanced geospatial queries (Phase 4)

---

## Appendix: PostgreSQL Quick Reference

### Common Queries

```sql
-- Geographic filtering with GIN index
SELECT * FROM vendors 
WHERE service_countries @> ARRAY['US']::text[];

-- JSONB state filtering
SELECT * FROM vendors 
WHERE service_states @> '[{"country":"US","state":"CA"}]'::jsonb;

-- UUID generation
SELECT uuid_generate_v4();

-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM vendors WHERE service_countries @> ARRAY['US']::text[];

-- Monitor active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Find slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Useful Extensions

```sql
-- UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS (geospatial queries)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Query statistics
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

### Performance Tuning

```sql
-- Increase shared memory (PostgreSQL config)
shared_buffers = 256MB  # Default: 128MB

-- Increase work memory for complex queries
work_mem = 16MB  # Default: 4MB

-- Enable parallel query execution
max_parallel_workers_per_gather = 4  # Default: 2

-- Vacuum analyze for query optimization
VACUUM ANALYZE vendors;
```

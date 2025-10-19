# Phase 3A Implementation Tasks - Micro-Granular Task Files

This directory contains detailed, micro-granular task files for implementing Phase 3A features. Each task file provides step-by-step instructions, acceptance criteria, testing requirements, and implementation notes for a specific component.

## Task Execution Order

Tasks should be completed in dependency order. The recommended sequence is below:

### Phase 1: Database Schema & Migrations (Days 1-5)

#### Core Tables
1. **[task-db-vendor-geographic-fields.md](./task-db-vendor-geographic-fields.md)** ✅ START HERE
   - Add geographic fields to vendors table (SQLite)
   - Create JSON serialization helpers
   - **Time**: 30-40 minutes
   - **Dependencies**: None

2. **[task-db-tier-requests-table.md](./task-db-tier-requests-table.md)**
   - Create tier_requests table (SQLite)
   - Create UUID generation helper
   - **Time**: 35-45 minutes
   - **Dependencies**: None

3. **task-db-tier-audit-log.md** (TO BE CREATED)
   - Create tier_audit_log table (SQLite)
   - **Time**: 25-30 minutes
   - **Dependencies**: [task-db-tier-requests-table]

4. **task-db-premium-content-table.md** (TO BE CREATED)
   - Create vendor_premium_content table (SQLite)
   - Create JSONB validation schemas
   - **Time**: 40-50 minutes
   - **Dependencies**: None

#### Payload CMS Integration
5. **task-payload-vendor-collection-update.md** (TO BE CREATED)
   - Update Payload vendors collection with geographic fields
   - Add UI for editing service regions in admin panel
   - **Time**: 30-40 minutes
   - **Dependencies**: [task-db-vendor-geographic-fields]

6. **task-payload-tier-collections.md** (TO BE CREATED)
   - Create Payload collections for tier_requests, audit_log
   - Configure admin UI for tier management
   - **Time**: 40-50 minutes
   - **Dependencies**: [task-db-tier-requests-table, task-db-tier-audit-log]

### Phase 2: Backend Services & APIs (Days 6-15)

#### Core Services
7. **[task-api-vendor-geography-service.md](./task-api-vendor-geography-service.md)**
   - Implement VendorGeographyService (SQLite-optimized)
   - Haversine distance calculation
   - OpenStreetMap geocoding integration
   - **Time**: 45-60 minutes
   - **Dependencies**: [task-db-vendor-geographic-fields]

8. **[task-api-tier-request-service.md](./task-api-tier-request-service.md)**
   - Implement TierRequestService with approval workflow
   - Application-layer duplicate check
   - Atomic tier updates with transactions
   - **Time**: 50-65 minutes
   - **Dependencies**: [task-db-tier-requests-table, task-db-tier-audit-log]

9. **task-api-tier-feature-service.md** (TO BE CREATED)
   - Implement TierFeatureService for access control
   - Define tier feature configuration
   - **Time**: 30-40 minutes
   - **Dependencies**: None

10. **task-api-tier-audit-service.md** (TO BE CREATED)
    - Implement TierAuditService for compliance logging
    - CSV export functionality
    - **Time**: 25-30 minutes
    - **Dependencies**: [task-db-tier-audit-log]

#### API Endpoints
11. **task-api-vendor-geography-endpoints.md** (TO BE CREATED)
    - GET /api/vendors (with geographic filters)
    - GET /api/vendors/:id/service-regions
    - **Time**: 40-50 minutes
    - **Dependencies**: [task-api-vendor-geography-service]

12. **task-api-tier-request-endpoints.md** (TO BE CREATED)
    - POST /api/tier-requests (create request)
    - GET /api/tier-requests (list requests)
    - PATCH /api/tier-requests/:id (approve/reject)
    - **Time**: 55-70 minutes
    - **Dependencies**: [task-api-tier-request-service]

13. **task-api-admin-tier-endpoints.md** (TO BE CREATED)
    - POST /api/admin/vendors/:id/tier (direct assignment)
    - GET /api/admin/tier-audit (audit history)
    - **Time**: 35-45 minutes
    - **Dependencies**: [task-api-tier-request-service, task-api-tier-audit-service]

14. **task-api-premium-content-endpoints.md** (TO BE CREATED)
    - POST /api/vendors/:id/premium-content (create)
    - PATCH /api/vendors/:id/premium-content/:contentId (update)
    - DELETE /api/vendors/:id/premium-content/:contentId (delete)
    - **Time**: 50-60 minutes
    - **Dependencies**: [task-db-premium-content-table, task-api-tier-feature-service]

### Phase 3: Frontend Components (Days 16-25)

#### Geographic Discovery Components
15. **task-ui-vendor-location-filter.md** (TO BE CREATED)
    - Build location filter component (country/state/city dropdowns)
    - URL query param persistence
    - Geolocation integration
    - **Time**: 45-60 minutes
    - **Dependencies**: [task-api-vendor-geography-endpoints]

16. **task-ui-vendor-service-map.md** (TO BE CREATED)
    - Build Leaflet.js map component with OpenFreeMap
    - Render vendor service area markers
    - Interactive map features
    - **Time**: 60-75 minutes
    - **Dependencies**: [task-api-vendor-geography-endpoints]

#### Tier Management Components
17. **task-ui-tier-comparison-table.md** (TO BE CREATED)
    - Build tier comparison table component
    - Display features and pricing for each tier
    - Highlight current tier
    - **Time**: 35-45 minutes
    - **Dependencies**: [task-api-tier-feature-service]

18. **task-ui-tier-upgrade-form.md** (TO BE CREATED)
    - Build tier upgrade request form modal
    - Form validation with Zod
    - TanStack Query integration
    - **Time**: 40-50 minutes
    - **Dependencies**: [task-api-tier-request-endpoints]

19. **task-ui-tier-request-status.md** (TO BE CREATED)
    - Build tier request status card component
    - Show pending/approved/rejected state
    - Cancel request functionality
    - **Time**: 25-30 minutes
    - **Dependencies**: [task-api-tier-request-endpoints]

20. **task-ui-admin-approval-queue.md** (TO BE CREATED)
    - Build admin tier approval queue table
    - Approve/reject actions with notes
    - Filtering and pagination
    - **Time**: 55-70 minutes
    - **Dependencies**: [task-api-tier-request-endpoints]

21. **task-ui-enhanced-tier-gate.md** (TO BE CREATED)
    - Enhance existing TierGate component
    - Granular feature access checking
    - Upgrade prompts
    - **Time**: 30-40 minutes
    - **Dependencies**: [task-api-tier-feature-service]

#### Premium Profile Components
22. **task-ui-premium-profile-editor.md** (TO BE CREATED)
    - Build premium profile editor with tabs
    - Certification editor sub-component
    - Case study editor sub-component
    - Media gallery editor
    - Team member editor
    - Service region map editor
    - **Time**: 120-150 minutes (complex component)
    - **Dependencies**: [task-api-premium-content-endpoints, task-ui-vendor-service-map, task-ui-enhanced-tier-gate]

#### Dashboard Pages
23. **task-ui-vendor-subscription-page.md** (TO BE CREATED)
    - Build vendor subscription management page
    - Integrate tier comparison and upgrade form
    - **Time**: 30-40 minutes
    - **Dependencies**: [task-ui-tier-comparison-table, task-ui-tier-upgrade-form, task-ui-tier-request-status]

24. **task-ui-admin-tier-pages.md** (TO BE CREATED)
    - Build admin tier requests page
    - Build admin tier audit page with CSV export
    - **Time**: 40-50 minutes
    - **Dependencies**: [task-ui-admin-approval-queue]

### Phase 4: Integration & Testing (Days 26-30)

#### End-to-End Tests
25. **task-test-e2e-tier-upgrade.md** (TO BE CREATED)
    - E2E test: Vendor tier upgrade workflow
    - E2E test: Admin approval process
    - E2E test: Premium feature access
    - **Time**: 60-75 minutes
    - **Dependencies**: All UI components, All API endpoints

26. **task-test-e2e-location-discovery.md** (TO BE CREATED)
    - E2E test: Geographic filtering
    - E2E test: Proximity search
    - E2E test: Map display
    - **Time**: 45-60 minutes
    - **Dependencies**: [task-ui-vendor-location-filter, task-ui-vendor-service-map]

27. **task-test-e2e-premium-content.md** (TO BE CREATED)
    - E2E test: Premium content CRUD
    - E2E test: Tier access enforcement
    - E2E test: JSON data integrity
    - **Time**: 50-60 minutes
    - **Dependencies**: [task-ui-premium-profile-editor]

#### Integration Tests
28. **task-test-api-integration.md** (TO BE CREATED)
    - Integration tests for all API endpoints
    - SQLite transaction integrity tests
    - Performance benchmarking (SQLite baselines)
    - **Time**: 90-120 minutes
    - **Dependencies**: All API endpoints

29. **task-test-cross-browser.md** (TO BE CREATED)
    - Cross-browser testing (Chrome, Firefox, Safari, Edge)
    - Responsive design testing (mobile, tablet, desktop)
    - Touch interaction testing
    - **Time**: 60-75 minutes
    - **Dependencies**: All UI components

### Phase 5: Documentation & Deployment (Days 31-35)

30. **task-doc-api-documentation.md** (TO BE CREATED)
    - OpenAPI/Swagger documentation for all endpoints
    - SQLite-specific notes
    - **Time**: 45-60 minutes
    - **Dependencies**: All API endpoints

31. **task-doc-developer-guide.md** (TO BE CREATED)
    - Update CLAUDE.md with Phase 3A architecture
    - Migration guide for database changes
    - SQLite implementation details
    - **Time**: 50-65 minutes
    - **Dependencies**: All sections complete

32. **task-deploy-staging.md** (TO BE CREATED)
    - Deploy to staging environment
    - Run full test suite
    - 48-hour monitoring
    - **Time**: Ongoing (2 days)
    - **Dependencies**: All sections complete

33. **task-deploy-production.md** (TO BE CREATED)
    - Production deployment checklist
    - SQLite database backup
    - Post-deployment validation
    - **Time**: 4-6 hours (with monitoring)
    - **Dependencies**: [task-deploy-staging]

## Task Status Legend

- ✅ **Complete** - Task finished and verified
- 🚧 **In Progress** - Currently being worked on
- ⏸️ **Blocked** - Waiting on dependency
- 📝 **Ready** - Dependencies met, ready to start
- 🔜 **Planned** - Will be created based on this README

## Quick Reference

### Total Tasks: 33
- **Database & Schema**: 6 tasks (Days 1-5)
- **Backend Services & APIs**: 8 tasks (Days 6-15)
- **Frontend Components**: 10 tasks (Days 16-25)
- **Integration & Testing**: 5 tasks (Days 26-30)
- **Documentation & Deployment**: 4 tasks (Days 31-35)

### Estimated Timeline: 5-7 weeks
- **Critical Path**: Database → Services → APIs → UI → Testing → Deploy
- **Parallel Work Opportunities**: 
  - Frontend components can be built in parallel once APIs are ready
  - Unit tests can be written alongside implementation
  - Documentation can be written incrementally

### Files Created So Far
1. ✅ task-db-vendor-geographic-fields.md
2. ✅ task-db-tier-requests-table.md
3. ✅ task-db-tier-audit-log.md
4. ✅ task-db-premium-content-table.md
5. ✅ task-payload-vendor-collection-update.md
6. ✅ task-api-vendor-geography-service.md
7. ✅ task-api-tier-request-service.md
8. ✅ task-api-tier-feature-service.md
9. ✅ task-ui-vendor-location-filter.md
10. ✅ task-ui-tier-comparison-table.md
11. ✅ task-test-e2e-tier-upgrade.md

### Files To Be Created: 22 remaining

## How to Use These Tasks

1. **Start at the top** - Tasks are ordered by dependency
2. **Read the entire task file** - Understand requirements before coding
3. **Check dependencies** - Ensure prerequisite tasks are complete
4. **Follow acceptance criteria** - Don't skip testing requirements
5. **Provide evidence** - Document completion with screenshots, test results
6. **Update status** - Mark tasks as complete in this README

## SQLite vs PostgreSQL

All tasks in this directory use SQLite-compatible implementations. For PostgreSQL migration tasks, see:
- **File**: `../tasks-postgres.md`
- **Trigger**: Migrate when vendor count >1000 or query p95 >2000ms

## Related Documentation

- **Main Spec**: `../spec.md` - Feature requirements and user stories
- **SQLite Tasks**: `../tasks-sqlite.md` - High-level SQLite implementation guide
- **PostgreSQL Tasks**: `../tasks-postgres.md` - Migration guide for production scale
- **Technical Spec**: `../sub-specs/technical-spec.md` - Detailed technical specifications
- **Database Schema**: `../sub-specs/database-schema.md` - Complete schema definitions
- **API Spec**: `../sub-specs/api-spec.md` - API endpoint specifications

## Questions or Issues?

- Check the main task document for context: `../tasks-sqlite.md`
- Review technical specs for implementation details
- Consult Phase 2 task files for similar patterns: `../../2025-10-11-payload-cms-vendor-enrollment/tasks/`

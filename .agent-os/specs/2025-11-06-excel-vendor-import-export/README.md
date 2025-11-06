# Excel-Based Vendor Data Import/Export System

> **Spec Status**: Ready for Implementation
> **Created**: 2025-11-06
> **Complexity**: Moderate (12-20 hours estimated)
> **Type**: Full-stack (Backend API + Frontend Portal)

## Quick Overview

Self-service Excel import/export system enabling vendors to bulk manage their company information, products, and locations through tier-based templates. Vendors download pre-configured Excel files matching their subscription tier, fill data offline, and upload for atomic import with validation preview.

## Key Features

✅ **Tier-Based Templates** - Dynamic Excel generation with columns filtered by vendor tier (Free/1/2/3)
✅ **Pre-filled Exports** - Existing vendors get Excel with current data + empty tier-unlocked fields
✅ **Validation Preview** - Review all changes before committing import
✅ **Atomic Imports** - All-or-nothing transactions with detailed error reporting
✅ **Admin Bulk Import** - Multi-vendor imports with partial success capability
✅ **Schema Flexibility** - Configuration-driven field mapping adapts to CMS changes

## Files in This Spec

- **[spec.md](./spec.md)** - Complete requirements document with user stories, scope, acceptance criteria
- **[spec-lite.md](./spec-lite.md)** - One-paragraph summary for quick reference
- **[sub-specs/technical-spec.md](./sub-specs/technical-spec.md)** - Technical architecture with:
  - Complete tier-to-field mapping configuration
  - API endpoint specifications with request/response formats
  - Service layer implementation details
  - Database schema for import history tracking
  - Testing strategy and performance benchmarks

## Implementation Approach

### Phase 1: Foundation (4-6 hours)
1. Set up Excel library (`exceljs`)
2. Create field mapping configuration
3. Implement `ExcelTemplateService` for template generation
4. Build API endpoint for template download

### Phase 2: Import Pipeline (6-8 hours)
1. Implement `ExcelParserService` for file parsing
2. Build `ImportValidationService` with tier checks
3. Create `ImportExecutionService` with atomic transactions
4. Implement API endpoint for file upload and import

### Phase 3: Export & UI (4-6 hours)
1. Implement `ExcelExportService` with pre-filled data
2. Build vendor portal UI components (download/upload)
3. Create preview screen with diff display
4. Add import history tracking

### Phase 4: Admin & Polish (2-4 hours)
1. Build admin bulk import tool
2. Add comprehensive error handling
3. Write tests (unit, integration, E2E)
4. Performance optimization

## Technology Stack

- **Excel Library**: `exceljs` (read/write .xlsx files)
- **Validation**: `zod` (already in project)
- **File Upload**: Next.js API routes with FormData
- **Data Access**: Payload CMS collections API
- **UI Components**: shadcn/ui (already in project)

## Tier-Based Field Access

| Tier | Products | Images/Product | Locations | Key Unlocked Fields |
|------|----------|----------------|-----------|---------------------|
| Free | 1 | 1 | 1 | Basic profile (name, description, contact) |
| Tier 1 | 5 | 3 | 3 | Website, founded year, LinkedIn, certifications |
| Tier 2 | 25 | 10 | 10 | Long description, case studies, team members |
| Tier 3 | Unlimited | Unlimited | 10 | Promotion pack, editorial content |

## User Workflows

### New Vendor Onboarding
1. Vendor registers → selects tier
2. Downloads blank template for tier
3. Fills Company Info, Products, Locations offline
4. Uploads Excel file
5. Reviews validation preview
6. Confirms → all records created atomically

### Vendor Tier Upgrade
1. Vendor upgrades tier (e.g., Free → Tier 2)
2. Downloads export with existing data + new empty columns
3. Adds information to newly unlocked fields
4. Uploads updated file
5. Reviews diff (additions/modifications)
6. Confirms → enhanced profile published

### Admin Partner Onboarding
1. Admin prepares Excel with multiple vendors
2. Uploads via admin bulk import tool
3. Reviews validation report
4. Chooses: skip errors and import valid rows, or fix and re-upload
5. Confirms → all valid vendors created

## API Endpoints

```
GET  /api/portal/vendors/[id]/excel-template  - Download tier-based template
GET  /api/portal/vendors/[id]/excel-export    - Export existing data
POST /api/portal/vendors/[id]/excel-import    - Upload & import (with preview mode)
GET  /api/portal/vendors/[id]/import-history  - View import history
POST /api/admin/vendors/bulk-import           - Admin multi-vendor import
```

## Data Structure

### Excel File Structure
```
📄 vendor-template-tier2-2025-11-06.xlsx
├── 📋 Instructions (read-only)
├── 📋 Company Information (1 row)
├── 📋 Products (up to tier limit)
└── 📋 Locations (up to tier limit)
```

### Field Mapping Configuration
- **Company Info**: 30+ fields (tier-filtered)
- **Products**: 15+ fields (tier-filtered)
- **Locations**: 6 fields (tier-count-limited)

Each field includes:
- Payload CMS field name
- Excel column header
- Tier restriction (minTier)
- Data type and validation rules
- Excel configuration (width, format, dropdowns, descriptions)

## Acceptance Criteria Highlights

✅ Template downloads with correct tier-filtered columns
✅ Validation catches all schema violations with row/column references
✅ Tier restrictions enforced (reject fields not allowed for tier)
✅ Preview shows accurate diff (additions/modifications)
✅ Atomic imports (all succeed or all rollback)
✅ Export includes existing data + new tier-unlocked columns
✅ Admin can import multiple vendors with partial success
✅ Performance: <30 seconds for 100 products

## Security & Access Control

- ✅ Vendors can only import/export their own data
- ✅ Admins can manage any vendor's data
- ✅ Server-side tier validation (never trust client)
- ✅ File sanitization (XSS, SQL injection prevention)
- ✅ Temp file cleanup (auto-delete after 1 hour)

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Template Generation | <2s | Any tier |
| File Upload | <5s | 10MB limit |
| Validation | <10s | 100 products |
| Import | <30s | 100 products |
| Export | <5s | 100 products |

## Out of Scope (Future Enhancements)

- ❌ Image upload in Excel (URLs only initially)
- ❌ Real-time validation during editing
- ❌ Excel macros or advanced features
- ❌ CSV format support
- ❌ Collaborative cloud editing

## Next Steps

1. Review and approve specification
2. Create task breakdown (estimate 15-20 tasks)
3. Begin implementation with Phase 1 (Foundation)
4. Iterative development with user testing

## Questions or Clarifications?

Contact the product team or refer to:
- [Full Specification](./spec.md) - Complete requirements
- [Technical Details](./sub-specs/technical-spec.md) - Implementation guide
- [Mission Context](../../product/mission-lite.md) - Product vision

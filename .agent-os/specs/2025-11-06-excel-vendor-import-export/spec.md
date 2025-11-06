# Spec Requirements Document

> Spec: Excel-Based Vendor Data Import/Export System
> Created: 2025-11-06
> Detail Level: Standard
> Feature Type: FULL_STACK (Backend API + Frontend Portal)

## Overview

Implement a self-service Excel-based import/export system that enables vendors to bulk upload and update their company information, products, and locations through downloadable Excel templates with tier-based field access control. The system provides pre-filled templates for existing vendors showing only fields accessible at their current tier, automatically unlocking new fields when they upgrade tiers.

## User Stories

### Story 1: Vendor Bulk Data Upload (New Vendor Onboarding)

**As a** new vendor joining the platform,
**I want to** download an Excel template matching my subscription tier, fill it offline with all my company and product data, and upload it once,
**So that** I can onboard quickly without manually entering hundreds of fields through web forms.

**Detailed Workflow**:
1. New vendor registers and selects tier (Free, Tier 1, Tier 2, or Tier 3)
2. System generates blank Excel template with sheets and fields matching their tier
3. Vendor downloads template, sees clear instructions and field descriptions
4. Vendor fills Company Info, Products, and Locations sheets offline
5. Vendor uploads completed Excel file through vendor portal
6. System validates all data, shows preview of what will be imported
7. Vendor confirms import, system creates all records atomically
8. Vendor sees confirmation with link to their new profile

**Problem Solved**: Eliminates tedious form-filling for vendors with extensive product catalogs, reducing onboarding friction from hours to minutes.

### Story 2: Vendor Data Update After Tier Upgrade

**As a** vendor who just upgraded from Free to Tier 2,
**I want to** download an Excel file pre-filled with my existing data plus empty columns for newly unlocked fields,
**So that** I can easily see what additional information I can now provide without re-entering everything.

**Detailed Workflow**:
1. Vendor upgrades tier (e.g., Free → Tier 2)
2. Vendor navigates to "Export Data" in dashboard
3. System exports Excel with:
   - All existing data pre-filled (company, products, locations)
   - New tier-unlocked columns added but empty
   - Clear highlighting showing which fields are new
4. Vendor adds information to newly unlocked fields
5. Vendor uploads updated Excel file
6. System detects update operation (vendor ID matches existing), validates changes
7. System shows diff preview (additions, modifications)
8. Vendor confirms, system updates records
9. Enhanced profile published with new content

**Problem Solved**: Makes tier upgrades valuable by showing vendors exactly what new capabilities they've unlocked, encouraging them to maximize profile completeness.

### Story 3: Admin Bulk Data Import

**As an** admin managing platform migrations or partner onboarding,
**I want to** import vendor data from Excel files on behalf of vendors,
**So that** I can efficiently migrate legacy data or onboard partners with pre-negotiated data packages.

**Detailed Workflow**:
1. Admin accesses admin panel bulk import tool
2. Admin uploads Excel file with multiple vendors
3. System validates against all tier restrictions and data schemas
4. Admin reviews detailed validation report with errors/warnings
5. Admin can:
   - Skip invalid rows and import valid ones (partial import)
   - Fix errors and re-upload
   - Override tier restrictions (admin privilege)
6. Admin confirms import
7. System creates/updates vendor records
8. Admin receives import summary with links to created profiles

**Problem Solved**: Enables efficient platform migrations and partner onboarding without manual data entry.

## Spec Scope

1. **Tier-Based Template Generation** - Generate Excel templates with sheets and columns dynamically filtered based on vendor tier (Free/1/2/3), including data validation dropdowns, field descriptions, and example data.

2. **Excel File Parsing & Validation** - Parse uploaded Excel files (Company Info, Products, Locations sheets), validate all fields against Payload CMS schemas, enforce tier restrictions, check data types, required fields, string lengths, and relationships.

3. **Data Preview & Diff System** - Display preview of data to be imported before committing changes, show additions/modifications/deletions in readable format, allow users to review and cancel before final import.

4. **Atomic Import Operations** - Import all records (vendor + products + locations) in single atomic transaction, rollback entirely on errors, ensure data consistency, provide detailed error messages with row/column references.

5. **Export with Pre-filled Data** - Export vendor's existing data to Excel (all current fields populated), add empty columns for tier-unlocked fields if vendor upgraded, preserve all relationships and array data structures.

6. **Vendor Portal Integration** - Add "Import/Export Data" section to vendor dashboard, show import history with timestamps and status, provide download links for templates and exports, display validation errors in user-friendly format.

7. **Admin Bulk Import Tool** - Admin panel interface for bulk vendor imports, support multiple vendors per file, partial import capability (skip errors, import valid rows), admin override for tier restrictions.

8. **Field Mapping & Schema Flexibility** - Use configuration-driven field mapping (not hard-coded), automatically adapt to Payload CMS schema changes, support for all field types (text, richText, relationships, arrays, uploads), handle nested objects and array structures.

## Out of Scope

- **Image Upload in Excel**: Initial version uses image URLs only (system downloads images from URLs). ZIP file upload with images folder is future enhancement.
- **Real-time Validation During Editing**: Validation happens only on upload, not while editing Excel offline.
- **Excel Macros or Advanced Features**: Templates are standard Excel files without macros, formulas, or advanced features.
- **Automatic Schema Detection**: Field mapping configuration must be manually updated when CMS schema changes (not auto-detected).
- **Version Control for Templates**: No versioning system for template formats. Single active template version per tier.
- **Collaborative Editing**: Excel files are single-user offline editing. No cloud-based collaborative editing.
- **CSV Format Support**: Excel (.xlsx) only. CSV import/export is future enhancement.

## Expected Deliverables

1. **Download Excel Template**: Vendor can download tier-appropriate Excel template from dashboard, template contains 3 sheets (Company Info, Products, Locations) with columns matching tier, data validation and instructions included.

2. **Upload & Import Data**: Vendor can upload completed Excel file, system validates and shows preview, vendor confirms and all data imports successfully, error messages reference specific rows/columns.

3. **Export Existing Data**: Vendor can export current profile to Excel with all existing data pre-filled, upgraded tiers see new empty columns for unlocked fields, export includes all products and locations.

4. **Admin Bulk Import**: Admin can upload multi-vendor Excel file from admin panel, system processes with partial import capability, admin receives detailed import report.

5. **Browser-Testable Validation**: Can verify Excel download, upload, validation errors display, preview accuracy, successful import, data persistence, and export completeness entirely through browser UI.

## Technical Requirements

### Excel Generation Library
- **Library**: `exceljs` (npm package, 13k+ stars, actively maintained)
- **Rationale**: Industry standard, supports .xlsx format, cell styles, data validation, rich formatting
- **Version**: Latest stable (5.x+)

### Excel Parsing Library
- **Library**: `exceljs` (same library for consistency)
- **Rationale**: Read and write with same library, familiar API, robust error handling
- **Alternative**: `xlsx` package if performance becomes critical (faster but less features)

### File Upload Handling
- **Library**: Next.js built-in API routes with `formidable` or native FormData
- **Size Limit**: 10MB per file (configurable)
- **Validation**: File extension check (.xlsx), MIME type validation

### Data Validation
- **Library**: `zod` (already in project) for schema validation
- **Approach**: Generate Zod schemas from Payload CMS field definitions
- **Error Format**: Array of `{ sheet, row, column, field, error }` objects

### Tier Access Control
- **Implementation**: Leverage existing `useTierAccess` hook logic
- **Server-side**: Re-implement tier checks in API routes (never trust client)
- **Configuration**: Centralized tier-to-fields mapping in config file

## User Experience Requirements

### Template Download
- **Button Location**: Vendor dashboard, "Data Management" section
- **Download Trigger**: Single click, immediate download (no form)
- **File Naming**: `vendor-template-{tier}-{date}.xlsx` (e.g., `vendor-template-tier2-2025-11-06.xlsx`)
- **Instructions**: First sheet contains comprehensive instructions with examples

### Upload Interface
- **UI Component**: Drag-and-drop upload zone with file picker fallback
- **File Preview**: Show filename, size, sheet names after selection
- **Progress Indicator**: Upload progress bar, parsing progress, validation progress
- **Error Display**: Table format with sheet/row/column, sortable and filterable

### Preview Screen
- **Data Display**: Tabs for each sheet (Company, Products, Locations)
- **Change Indicators**: New records (green), updates (yellow), unchanged (gray)
- **Row Limit**: Show first 100 rows, indicate total count
- **Action Buttons**: "Confirm Import" (primary), "Cancel" (secondary), "Download Errors" (if any)

### Import Confirmation
- **Success Message**: Toast notification with "Import successful: X records created, Y updated"
- **Navigation**: Auto-redirect to vendor profile or provide link
- **Email Notification**: Send confirmation email with import summary

## Security & Privacy

### Access Control
- **Vendor Access**: Can only import/export their own data
- **Admin Access**: Can import/export any vendor's data
- **Authentication**: Require active session (Payload CMS auth)
- **Authorization**: Verify vendor ownership before export/import

### Data Sanitization
- **Input**: Strip HTML tags from text fields (except richText)
- **URLs**: Validate URL format, sanitize for XSS
- **SQL Injection**: Use Payload CMS query API (parameterized)
- **File Path Traversal**: Validate uploaded files stay in temp directory

### File Storage
- **Temp Files**: Store uploads in `/tmp` directory, auto-delete after 1 hour
- **No Permanent Storage**: Don't store Excel files permanently
- **Exports**: Generate on-demand, stream to client, no server storage

## Performance Considerations

### Large File Handling
- **Streaming**: Use streaming Excel parsing for files >1MB
- **Batch Processing**: Import in batches of 100 records
- **Progress Updates**: WebSocket or polling for real-time progress
- **Timeout**: 5 minute timeout for imports (adjustable)

### Optimization Strategies
- **Validation**: Validate all rows before starting import (fail fast)
- **Database**: Use transactions for atomicity, single commit at end
- **Caching**: Cache tier-to-fields mapping (don't recalculate per row)
- **Parallel Processing**: Validate rows in parallel (Node.js worker threads)

## Acceptance Criteria

### Template Generation
- [ ] Excel template downloads successfully for each tier (Free, 1, 2, 3)
- [ ] Templates contain correct sheets (Company Info, Products, Locations)
- [ ] Only tier-appropriate columns are included
- [ ] Data validation dropdowns work for categorical fields
- [ ] Instructions sheet is clear and includes examples
- [ ] File downloads with correct filename format

### Data Import
- [ ] Excel file upload works via drag-and-drop and file picker
- [ ] Validation catches all schema violations (types, required, lengths)
- [ ] Tier restrictions are enforced (reject tier-restricted fields)
- [ ] Preview screen shows accurate data with correct change indicators
- [ ] Import creates all records atomically (all succeed or all fail)
- [ ] Error messages reference specific sheet/row/column
- [ ] Success confirmation displays with correct record counts
- [ ] Email notification sent on successful import

### Data Export
- [ ] Export generates Excel with all existing vendor data
- [ ] All products included in Products sheet
- [ ] All locations included in Locations sheet
- [ ] Array fields properly serialized (comma-separated or JSON)
- [ ] Relationship fields resolved to names/IDs
- [ ] Upgraded tiers see new empty columns
- [ ] File downloads with correct filename

### Admin Features
- [ ] Admin can access bulk import tool from admin panel
- [ ] Multi-vendor import processes correctly
- [ ] Partial import works (skips errors, imports valid rows)
- [ ] Admin receives detailed import report
- [ ] Admin can override tier restrictions (checkbox)

### Data Integrity
- [ ] All imports are atomic (rollback on error)
- [ ] No duplicate vendors created
- [ ] Relationships maintained correctly (products → vendor)
- [ ] Location HQ validation enforced (exactly one HQ)
- [ ] Re-importing same file is idempotent (no duplicates)

### Performance
- [ ] Template generation completes in <2 seconds
- [ ] File upload works for files up to 10MB
- [ ] Validation completes in <10 seconds for 100 products
- [ ] Import completes in <30 seconds for 100 products
- [ ] Export completes in <5 seconds for 100 products

### Security
- [ ] Vendors can only export their own data
- [ ] Vendors can only import to their own account
- [ ] Admin access properly gated (role-based)
- [ ] File uploads sanitized and validated
- [ ] No XSS vulnerabilities in error messages

## Integration Points

### Payload CMS Collections
- **Vendors Collection**: Read schema for field definitions, write imported records
- **Products Collection**: Read schema, create/update products
- **Categories Collection**: Resolve category names to IDs
- **Tags Collection**: Resolve tag names to IDs
- **Users Collection**: Associate vendors with users
- **Media Collection**: Handle image URLs (download and create media records)

### Existing Services
- **TierService**: Use `isTierEligibleForFeature()` for tier checks
- **LocationService**: Use for location validation and geocoding
- **PayloadCMSDataService**: Use for data queries (don't bypass)

### New Services to Create
- **ExcelTemplateService**: Generate tier-based templates
- **ExcelParserService**: Parse uploaded files
- **ExcelExportService**: Export vendor data to Excel
- **ImportValidationService**: Validate parsed data
- **ImportExecutionService**: Execute atomic imports

### API Routes
- **GET** `/api/portal/vendors/[id]/excel-template` - Download template
- **GET** `/api/portal/vendors/[id]/excel-export` - Export data
- **POST** `/api/portal/vendors/[id]/excel-import` - Upload and import
- **GET** `/api/portal/vendors/[id]/import-history` - View import history
- **POST** `/api/admin/vendors/bulk-import` - Admin bulk import (multi-vendor)

## Future Enhancements

1. **ZIP File Upload**: Support Excel + /images/ folder in ZIP for image uploads
2. **CSV Format**: Support CSV import/export as alternative to Excel
3. **Template Versioning**: Track template versions, support migration
4. **Real-time Validation**: Provide validation API endpoint for live checking
5. **Import Scheduling**: Schedule imports for off-peak hours
6. **Incremental Updates**: Smart merge instead of full replacement
7. **Import Rollback**: Allow rollback of recent imports
8. **Export Filtering**: Export only specific products or date ranges
9. **Batch Operations**: Delete or publish multiple records via Excel
10. **API Import**: RESTful API for programmatic imports (not just UI)

## Success Metrics

- **Onboarding Time**: Reduce average vendor onboarding time from 2 hours to <15 minutes
- **Data Completeness**: Increase average profile completeness from 40% to 80%
- **Tier Upgrades**: 30% of vendors who upgrade tiers use export feature within 7 days
- **Error Rate**: <5% of uploads fail validation on first attempt
- **Support Tickets**: Reduce "how do I add products" support tickets by 70%
- **Adoption**: 60% of new vendors use Excel import instead of manual form entry

## Risks & Mitigations

### Risk: Excel Format Incompatibility
**Mitigation**: Use standard Excel format (.xlsx), test with Excel, Google Sheets, LibreOffice

### Risk: Schema Drift (CMS changes break imports)
**Mitigation**: Configuration-driven field mapping, automated tests that fail on schema changes

### Risk: Large File Memory Issues
**Mitigation**: Streaming parsing, batch processing, memory limits

### Risk: Data Loss on Failed Imports
**Mitigation**: Atomic transactions, preview before commit, import history for rollback

### Risk: User Confusion with Tier Restrictions
**Mitigation**: Clear error messages, visual indicators in template, help documentation

### Risk: Performance Degradation with Scale
**Mitigation**: Background job processing for large imports, progress tracking, queue system

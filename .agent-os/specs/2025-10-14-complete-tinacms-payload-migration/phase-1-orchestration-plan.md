# Phase 1 Orchestration Execution Plan

> Created: 2025-10-14
> Orchestrator: task-orchestrator
> Executor: integration-coordinator
> Tasks: PRE-1, PRE-2

## Orchestration Strategy

### Task Dependencies
- **PRE-1**: Integration Strategy and Transformation Layer Design (No dependencies)
- **PRE-2**: Migration Validation and Rollback Planning (Depends on PRE-1)

### Execution Approach
**Sequential Execution** - PRE-2 depends on PRE-1 design decisions, so tasks must run sequentially.

Both tasks assigned to same agent (integration-coordinator), so they can be executed in one orchestration session with checkpoint between tasks.

---

## Phase 1 Execution Flow

### Step 1: Context Preparation
**Orchestrator Actions:**
1. Load deliverable manifest: `phase-1-deliverable-manifest.md`
2. Extract focused context from technical spec
3. Analyze existing codebase for reference patterns
4. Prepare context package for integration-coordinator

**Context Package Contents:**
- Deliverable manifest (complete)
- Task detail files (PRE-1, PRE-2)
- TinaCMSDataService analysis (method signatures, transformation patterns)
- Existing Payload collections structure
- Frontend page file paths
- Technical spec relevant sections

---

### Step 2: PRE-1 Delegation

**Task:** Integration Strategy and Transformation Layer Design

**Instructions to Integration-Coordinator:**

```markdown
You are the integration-coordinator agent executing Task PRE-1: Integration Strategy and Transformation Layer Design.

## Your Mission
Design the complete integration strategy and transformation layer architecture for migrating TinaCMS markdown-based content to Payload CMS database collections.

## Deliverables (MANDATORY - Reference: phase-1-deliverable-manifest.md)

### 1. integration-strategy.md
Create comprehensive integration strategy document with:
- Transformation layer architecture (`src/lib/transformers/` structure)
- Data service interface contract (PayloadCMSDataService with 1:1 parity to TinaCMSDataService)
- Markdown-to-Lexical conversion strategy
- Backward compatibility approach

**Verification:** All 7 transformation functions specified, method signatures match TinaCMSDataService, caching strategy maintains 5-minute TTL.

### 2. field-mappings.md
Create complete field mapping tables for all 8 collections:
- Vendors (100+ enhanced fields)
- Products (80+ enhanced fields)
- Yachts (new collection with timeline, supplier map, sustainability)
- Blog Posts
- Team Members
- Company Info (singleton)
- Categories
- Tags (new collection)

**Verification:** 100% TinaCMS field coverage + all enhanced fields with default values specified.

### 3. integration-points.md
Document all 11 frontend pages requiring updates:
- List all pages (vendors, products, yachts, blog, team, about, homepage)
- Specify import statement changes per page
- Identify custom transformations

**Verification:** All 11 pages documented with file paths and required changes.

## Context Provided

### Current Data Service (TinaCMSDataService)
**File:** lib/tinacms-data-service.ts (1337 lines)

**Key Methods to Replicate:**
- Vendors: getAllVendors(), getVendors(), getVendorBySlug(), getVendorById(), searchVendors(), getVendorSlugs()
- Products: getAllProducts(), getProducts(), getProductBySlug(), getProductById(), getProductsByVendor(), searchProducts(), getProductSlugs()
- Yachts: getAllYachts(), getYachts(), getYachtBySlug(), getYachtById(), getFeaturedYachts(), searchYachts(), getYachtSlugs()
- Blog: getAllBlogPosts(), getBlogPosts(), getBlogPostBySlug(), searchBlogPosts(), getBlogPostSlugs()
- Team: getTeamMembers()
- Categories: getCategories(), getBlogCategories()
- Company: getCompanyInfo()
- Legacy: getAllPartners(), getPartners(), getPartnerBySlug(), getPartnerById(), getFeaturedPartners(), searchPartners(), getPartnerSlugs()

**Caching Strategy:**
- 5-minute TTL (MUST be maintained)
- LRU eviction
- Cache key patterns: `vendors`, `products`, `vendor-{id}`, `enhanced-vendor:{id}`

**Transformation Patterns:**
- transformTinaVendor() - Vendor transformation logic (lines 267-363)
- transformTinaProduct() - Product transformation logic (lines 372-418)
- transformTinaYacht() - Yacht transformation logic (lines 454-575)
- transformTinaBlogPost() - Blog transformation logic (lines 420-439)
- transformTinaTeamMember() - Team member transformation logic (lines 441-452)
- transformMediaPath() - Media URL transformation (lines 235-265)

### Enhanced Fields (From Technical Spec)

**Vendors Enhanced Fields:**
- certifications: array of { name, issuer, year, expiryDate, certificateUrl, logo }
- awards: array of { title, year, organization, category, description }
- socialProof: { followers, projectsCompleted, yearsInBusiness, customerList }
- videoIntroduction: { videoUrl, thumbnailImage, title, description }
- caseStudies: array of { title, slug, client, challenge, solution, results, images, technologies }
- innovationHighlights: array of { technology, description, uniqueApproach, benefitsToClients }
- teamMembers: array of { name, position, bio, photo, linkedinUrl, expertise }
- yachtProjects: array of { yachtName, systems, projectYear, role, description }

**Products Enhanced Fields:**
- comparisonMetrics: { performance, efficiency, reliability, durability, easeOfUse, valueForMoney }
- integrationCompatibility: array of { system, compatible, notes }
- ownerReviews: array of { reviewerName, yachtName, rating, review, verifiedPurchase, date }
- visualDemoContent: { images360: array, models3D: array, interactiveHotspots: array, arViewEnabled }

**Yachts New Collection:**
- timeline: array of { date, event, description, category, location, images }
- supplierMap: array of { vendorId, vendorName, discipline, systems, role, projectPhase }
- sustainabilityScore: { co2Emissions, energyEfficiency, wasteManagement, waterConservation, materialSustainability, overallScore, certifications }
- customizations: array of { category, description, vendor, images, cost, completedDate }
- maintenanceHistory: array of { date, type, system, description, vendor, cost, nextService, status }

### Existing Payload Collections
**Location:** payload/collections/
- Users.ts
- Vendors.ts (basic fields only)
- Products.ts (basic fields only)
- Categories.ts
- BlogPosts.ts
- TeamMembers.ts
- CompanyInfo.ts

**Missing Collections:** Yachts, Tags

### Frontend Pages (Integration Points)
1. app/vendors/page.tsx - Vendors list
2. app/vendors/[slug]/page.tsx - Vendor detail
3. app/products/page.tsx - Products list
4. app/products/[slug]/page.tsx - Product detail
5. app/blog/page.tsx - Blog list
6. app/blog/[slug]/page.tsx - Blog post detail
7. app/team/page.tsx - Team members
8. app/about/page.tsx - About page (company info)
9. app/page.tsx - Homepage (featured partners, products)
10. app/yachts/page.tsx - Yachts list (TO BE CREATED)
11. app/yachts/[slug]/page.tsx - Yacht detail (TO BE CREATED)

## Design Requirements

### Transformation Layer Architecture
**Location:** `src/lib/transformers/`

**Required Transformers:**
1. `base-transformer.ts` - Shared utilities (media path transformation, reference resolution)
2. `vendor-transformer.ts` - TinaCMS vendor → Payload vendor (with enhanced fields)
3. `product-transformer.ts` - TinaCMS product → Payload product (with enhanced fields)
4. `yacht-transformer.ts` - TinaCMS yacht → Payload yacht (new collection)
5. `blog-transformer.ts` - TinaCMS blog post → Payload blog post
6. `team-transformer.ts` - TinaCMS team member → Payload team member
7. `category-transformer.ts` - TinaCMS category → Payload category
8. `tag-transformer.ts` - Extract tags from content → Payload tags
9. `markdown-to-lexical.ts` - Markdown → Lexical rich text conversion

**Design Principles:**
- Each transformer is a pure function (no side effects)
- Type-safe with full TypeScript signatures
- Reusable across migration and data service
- Error handling with meaningful error messages
- Support for partial transformations (optional fields)

### Data Service Interface Contract

**Class:** `PayloadCMSDataService`
**Location:** `lib/payload-cms-data-service.ts`

**Requirements:**
- 1:1 method parity with TinaCMSDataService
- Identical method signatures (parameter types, return types)
- Same caching strategy (5-minute TTL, LRU eviction)
- Same error handling patterns
- Support for static site generation (build-time data access)
- Backward compatibility (Partner methods as aliases to Vendor methods)

**Data Flow:**
1. Page calls data service method
2. Data service checks cache
3. If cache miss, fetch from Payload REST API
4. Transform Payload response to match TinaCMS format
5. Cache result
6. Return data

**Key Differences from TinaCMS:**
- Data source: Payload REST API instead of markdown files
- Reference resolution: Database IDs instead of file paths
- Rich text: Lexical format instead of markdown
- Media paths: Transform from Payload upload paths to public URLs

### Markdown-to-Lexical Conversion

**Required Support:**
- Headings (h1-h6)
- Paragraphs
- Lists (ordered, unordered)
- Links
- Images
- Code blocks
- Blockquotes
- Bold, italic, strikethrough
- Tables (if present in content)

**Error Handling:**
- Unsupported syntax: Log warning, convert to paragraph
- Invalid markdown: Return error with line number
- Empty content: Return empty Lexical document

### Backward Compatibility

**Vendor/Partner Unification:**
- Vendor interface includes `partner: boolean` field
- Partner interface extends Vendor (no `partner` field)
- Products have both `vendorId`/`vendorName` and `partnerId`/`partnerName`
- PayloadCMSDataService provides both Vendor and Partner methods
- Partner methods filter for `partner === true`

**Reference Resolution:**
- TinaCMS: `vendor: "content/vendors/acme.md"`
- Payload: `vendor: "cm3abc123def"` (database ID)
- Transformation: File path → Find vendor by slug → Get database ID

## Acceptance Criteria

Before marking PRE-1 complete, ensure:
- [ ] integration-strategy.md created with all required sections
- [ ] field-mappings.md created with all 8 collections mapped
- [ ] integration-points.md created with all 11 pages documented
- [ ] All transformation functions have TypeScript signatures
- [ ] PayloadCMSDataService has 1:1 method parity with TinaCMSDataService
- [ ] Caching strategy maintains 5-minute TTL
- [ ] Markdown-to-Lexical strategy covers all required features
- [ ] Backward compatibility approach preserves existing interfaces

## Next Steps After PRE-1

Once PRE-1 is complete, you will proceed to PRE-2 (Migration Validation and Rollback Planning) using the design decisions from PRE-1.
```

**Expected Deliverables from PRE-1:**
- integration-strategy.md
- field-mappings.md
- integration-points.md

**Checkpoint:** Verify all 3 files exist before proceeding to PRE-2.

---

### Step 3: PRE-1 Verification

**Orchestrator Actions:**
1. Verify all 3 PRE-1 deliverables exist using Read tool
2. Check each file against verification criteria from manifest
3. Validate completeness of each section
4. Confirm evidence requirements are met

**Verification Checklist:**
- [ ] integration-strategy.md exists and contains all 4 required sections
- [ ] All 7 transformation functions specified with TypeScript signatures
- [ ] PayloadCMSDataService method signatures documented (30+ methods)
- [ ] Caching strategy specified (5-minute TTL)
- [ ] Markdown-to-Lexical strategy complete
- [ ] Backward compatibility approach documented
- [ ] field-mappings.md exists and contains all 8 collections
- [ ] All TinaCMS fields mapped (100% coverage)
- [ ] Enhanced fields have default values
- [ ] Type conversions specified
- [ ] integration-points.md exists and documents all 11 pages
- [ ] Import statement changes specified
- [ ] Custom transformations identified

**If Verification Fails:**
- Identify missing/incomplete sections
- Request integration-coordinator to complete deliverables
- Re-verify after corrections

---

### Step 4: PRE-2 Delegation

**Task:** Migration Validation and Rollback Planning

**Instructions to Integration-Coordinator:**

```markdown
You are the integration-coordinator agent executing Task PRE-2: Migration Validation and Rollback Planning.

## Your Mission
Design comprehensive validation strategies and rollback procedures to ensure zero data loss during the TinaCMS to Payload migration.

## Deliverables (MANDATORY - Reference: phase-1-deliverable-manifest.md)

### 4. validation-strategy.md
Create comprehensive validation strategy document with:
- Pre-migration validation checks (entity counts, reference integrity, duplicates)
- Post-migration validation checks (count verification, field comparison, relationship resolution)
- Data integrity checks (required fields, data types, relationships)
- Validation script specifications (3 scripts)

**Verification:** All 8 collections included, success criteria defined (0% data loss), all 3 scripts specified.

### 5. rollback-plan.md
Create step-by-step rollback plan with:
- Backup strategy (locations, retention, verification)
- Rollback procedure (7+ steps)
- Restoration validation
- Risk mitigation measures
- Rollback script specification

**Verification:** Complete backup strategy, step-by-step procedure, idempotent script specification.

### 6. validation-checklist.md
Create actionable validation checklist with:
- Pre-migration checklist (all 8 collections)
- Post-migration checklist (all 8 collections)
- Sign-off criteria (aligned with spec: 0% data loss, <5 min build)

**Verification:** Checklist covers all collections, actionable format, sign-off criteria match spec.

## Context Provided

### Integration Strategy (From PRE-1)
**Reference:** integration-strategy.md
- Transformation layer architecture
- Field mappings for all collections
- Integration points documentation

### Current Content Inventory (TinaCMS)
**Locations:**
- content/vendors/*.md
- content/products/*.md
- content/categories/*.md
- content/blog/posts/*.md
- content/blog/categories/*.md
- content/team/*.md
- content/company/info.json
- content/yachts/*.md (if exists)

### Existing Validation Patterns (TinaCMSDataService)
**Method:** validateCMSContent() (lines 1262-1332)

**Validation Checks:**
- Entity count verification
- Vendor-product relationship integrity
- Slug uniqueness
- Orphaned content detection

**Pattern to Replicate:**
- Pre-migration: Run on TinaCMS content
- Post-migration: Run on Payload database
- Compare results: TinaCMS counts === Payload counts

### Backup Location
**Existing Backup:** .agent-os/.backup-20251014-214720/
**New Backup Format:** .agent-os/.backup-YYYYMMDD-HHMMSS/

### Success Criteria (From Spec)
- 0% data loss (100% entity count match)
- 100% field parity
- Build time < 5 minutes
- All relationships intact
- All media paths valid

## Design Requirements

### Pre-Migration Validation

**Purpose:** Establish baseline before migration

**Checks:**
1. Entity Count Inventory
   - Count all vendors in content/vendors/
   - Count all products in content/products/
   - Count all blog posts in content/blog/posts/
   - Count all categories in content/categories/
   - Count all team members in content/team/
   - Count all yachts in content/yachts/ (if exists)
   - Verify company info exists
   - Extract unique tags from content

2. Reference Integrity
   - Products → Vendors (all product.vendor references valid)
   - Products → Categories (all product.category references valid)
   - Blog Posts → Categories (all post.blog_category references valid)
   - Content → Tags (all tag references valid)
   - Yachts → Vendors (all yacht.supplierMap.vendorId references valid)

3. Duplicate Detection
   - Vendor slug uniqueness
   - Product slug uniqueness
   - Blog post slug uniqueness
   - Category slug uniqueness
   - Yacht slug uniqueness

4. Required Field Validation
   - All vendors have name, slug, description
   - All products have name, slug, description, vendor reference
   - All blog posts have title, slug, content
   - All team members have name, role

5. Media File Accessibility
   - All image paths in vendor logos exist
   - All image paths in product images exist
   - All image paths in blog post images exist

**Output:** Pre-migration validation report (JSON format)
```json
{
  "timestamp": "2025-10-14T10:00:00Z",
  "counts": {
    "vendors": 15,
    "products": 45,
    "blogPosts": 12,
    "categories": 8,
    "teamMembers": 5,
    "yachts": 3,
    "companyInfo": 1
  },
  "referenceIntegrity": {
    "valid": true,
    "errors": []
  },
  "duplicateSlugs": {
    "vendors": [],
    "products": [],
    "blogPosts": [],
    "yachts": []
  },
  "requiredFields": {
    "valid": true,
    "errors": []
  },
  "mediaFiles": {
    "valid": true,
    "missing": []
  }
}
```

### Post-Migration Validation

**Purpose:** Verify migration success

**Checks:**
1. Entity Count Verification
   - Payload vendors count === TinaCMS vendors count
   - Payload products count === TinaCMS products count
   - Payload blog posts count === TinaCMS blog posts count
   - Payload categories count === TinaCMS categories count
   - Payload team members count === TinaCMS team members count
   - Payload yachts count === TinaCMS yachts count
   - Payload company info exists
   - Payload tags count >= unique tags in TinaCMS

2. Field-Level Data Comparison (10% Sample)
   - Select 10% of each collection
   - Compare field-by-field: TinaCMS data vs Payload data
   - Verify all base fields match
   - Verify enhanced fields have default values or migrated values
   - Verify data types correct (dates, numbers, arrays)

3. Rich Text Conversion Verification
   - Sample 10 blog posts
   - Verify markdown → Lexical conversion
   - Check for conversion errors
   - Verify formatting preserved

4. Reference Resolution Validation
   - Products → Vendors (file paths → database IDs)
   - Products → Categories (file paths → database IDs)
   - Blog Posts → Categories (file paths → database IDs)
   - Content → Tags (file paths → database IDs)
   - Yachts → Vendors (file paths → database IDs)

5. Media Path Transformation
   - Verify all image URLs transformed correctly
   - Check media paths accessible
   - Verify transformation function applied consistently

6. Slug Uniqueness in Payload
   - All vendor slugs unique
   - All product slugs unique
   - All blog post slugs unique
   - All yacht slugs unique
   - All category slugs unique
   - All tag slugs unique

**Output:** Post-migration validation report (JSON format)
```json
{
  "timestamp": "2025-10-14T12:00:00Z",
  "entityCounts": {
    "match": true,
    "tinacms": { "vendors": 15, "products": 45, ... },
    "payload": { "vendors": 15, "products": 45, ... },
    "differences": []
  },
  "fieldComparison": {
    "samplesCompared": 15,
    "matches": 15,
    "mismatches": [],
    "details": []
  },
  "richTextConversion": {
    "valid": true,
    "errors": []
  },
  "referenceResolution": {
    "valid": true,
    "broken": []
  },
  "mediaPaths": {
    "valid": true,
    "invalid": []
  },
  "slugUniqueness": {
    "valid": true,
    "duplicates": []
  }
}
```

### Data Integrity Checks

**Purpose:** Deep validation of data quality

**Checks:**
1. Required Field Presence
   - All required fields present in Payload
   - No null values for required fields
   - No empty strings for required text fields

2. Data Type Validation
   - Dates in correct format (ISO 8601)
   - Numbers are numeric types
   - Booleans are boolean types
   - Arrays are array types

3. Array Field Length Preservation
   - Vendor certifications array length matches
   - Product features array length matches
   - Yacht timeline array length matches
   - All array fields preserved

4. Relationship Integrity
   - All product.vendor IDs exist in vendors collection
   - All product.categories IDs exist in categories collection
   - All blogPost.category IDs exist in categories collection
   - All content.tags IDs exist in tags collection
   - All yacht.supplierMap.vendorId IDs exist in vendors collection

5. Enum Value Validation
   - Status fields have valid enum values
   - Category fields have valid enum values
   - Role fields have valid enum values

6. Image URL Format Validation
   - All image URLs start with `/` or `http`
   - All image URLs point to accessible files
   - No broken image references

**Output:** Data integrity report (JSON format)

### Validation Scripts

#### Script 1: validate-tinacms-content.ts
**Purpose:** Pre-migration validation

**Functionality:**
- Count entities per content type
- Check reference integrity
- Validate required fields
- Detect duplicate slugs
- Check media file accessibility
- Output summary report (JSON + console)

**Exit Codes:**
- 0: All validations pass
- 1: Validation failures detected

**Usage:**
```bash
npm run validate:tinacms
# or
node scripts/validate-tinacms-content.ts
```

**Output:**
- Console: Summary of validation results
- File: `validation-reports/pre-migration-YYYYMMDD-HHMMSS.json`

#### Script 2: validate-migration-success.ts
**Purpose:** Post-migration validation

**Functionality:**
- Compare entity counts (TinaCMS vs Payload)
- Sample and compare field values (10%)
- Validate relationships (database IDs)
- Check rich text conversion
- Verify media path transformation
- Output detailed validation report (JSON + console)

**Exit Codes:**
- 0: Migration successful (0% data loss)
- 1: Migration failures detected

**Usage:**
```bash
npm run validate:migration
# or
node scripts/validate-migration-success.ts
```

**Output:**
- Console: Detailed validation results
- File: `validation-reports/post-migration-YYYYMMDD-HHMMSS.json`

#### Script 3: compare-data-integrity.ts
**Purpose:** Field-level comparison utility

**Functionality:**
- Field-by-field comparison for specific collection
- Support for partial collection comparison (sample size)
- Diff output for mismatches
- Detailed error reporting

**Exit Codes:**
- 0: All comparisons match
- 1: Mismatches detected

**Usage:**
```bash
npm run validate:integrity -- --collection vendors --sample 10
# or
node scripts/compare-data-integrity.ts --collection vendors --sample 10
```

**Output:**
- Console: Diff output for mismatches
- File: `validation-reports/integrity-{collection}-YYYYMMDD-HHMMSS.json`

### Rollback Procedure

**Backup Strategy:**

1. **Markdown Content Backup**
   - Location: `.agent-os/.backup-YYYYMMDD-HHMMSS/content/`
   - Contents: Complete copy of content/ directory
   - Verification: File count check, size verification
   - Retention: Keep until migration confirmed successful

2. **Database Backup**
   - Location: `.agent-os/.backup-YYYYMMDD-HHMMSS/database/`
   - Contents: SQLite database dump (development) or PostgreSQL dump (production)
   - Verification: Test restore in isolated environment
   - Retention: Keep until migration confirmed successful

3. **Environment Variable Backup**
   - Location: `.agent-os/.backup-YYYYMMDD-HHMMSS/.env.backup`
   - Contents: Copy of .env file
   - Verification: File exists and readable

4. **Code State Backup**
   - Git commit: Tag migration start point
   - Git tag: `pre-payload-migration-YYYYMMDD`
   - Branch: Create rollback branch for safety

**Rollback Steps:**

1. **Stop Application Servers**
   ```bash
   npm run stop:dev
   pkill -f "next dev"
   pkill -f "payload"
   ```

2. **Clear Payload Collections**
   ```bash
   npm run payload:clear-collections
   # or
   node scripts/rollback-migration.ts --step clear-db
   ```

3. **Restore Markdown Content**
   ```bash
   rm -rf content/
   cp -r .agent-os/.backup-YYYYMMDD-HHMMSS/content/ content/
   ```

4. **Restore Environment Variables**
   ```bash
   cp .agent-os/.backup-YYYYMMDD-HHMMSS/.env.backup .env
   ```

5. **Revert Data Service Imports**
   - Find all files importing PayloadCMSDataService
   - Replace with TinaCMSDataService
   ```bash
   node scripts/rollback-migration.ts --step revert-imports
   ```

6. **Rebuild Application**
   ```bash
   npm run build
   ```

7. **Verify Rollback Success**
   ```bash
   npm run validate:tinacms
   npm run dev
   # Manually test key pages
   ```

**Restoration Validation:**
- [ ] Entity counts match pre-migration baseline
- [ ] All content files restored
- [ ] Application builds successfully
- [ ] Homepage renders correctly
- [ ] Vendor pages render correctly
- [ ] Product pages render correctly
- [ ] Blog pages render correctly
- [ ] No console errors

**Rollback Script:** `scripts/rollback-migration.ts`

**Features:**
- Idempotent (safe to run multiple times)
- Step-by-step execution
- Dry-run mode
- Automatic backup verification
- Restoration confirmation prompts
- Comprehensive logging

**Usage:**
```bash
# Dry run
npm run rollback:migration -- --dry-run

# Full rollback
npm run rollback:migration

# Specific step
npm run rollback:migration -- --step clear-db
npm run rollback:migration -- --step restore-content
npm run rollback:migration -- --step revert-imports
```

## Acceptance Criteria

Before marking PRE-2 complete, ensure:
- [ ] validation-strategy.md created with all required sections
- [ ] All 3 validation phases documented (pre, post, integrity)
- [ ] All 8 collections included in validation strategy
- [ ] All 3 validation scripts specified with I/O requirements
- [ ] Exit codes defined for automated validation
- [ ] rollback-plan.md created with complete procedure
- [ ] Backup strategy includes all critical data
- [ ] Rollback procedure is step-by-step and idempotent
- [ ] Rollback script specification is complete
- [ ] validation-checklist.md created with actionable format
- [ ] Checklist covers all 8 collections
- [ ] Sign-off criteria aligned with spec (0% data loss, <5 min build)

## Dependencies from PRE-1

- Use field mappings from field-mappings.md to design validation comparisons
- Use transformation layer architecture to understand data flow
- Use integration points to identify all pages requiring validation

```

**Expected Deliverables from PRE-2:**
- validation-strategy.md
- rollback-plan.md
- validation-checklist.md

---

### Step 5: PRE-2 Verification

**Orchestrator Actions:**
1. Verify all 3 PRE-2 deliverables exist using Read tool
2. Check each file against verification criteria from manifest
3. Validate completeness of each section
4. Confirm evidence requirements are met

**Verification Checklist:**
- [ ] validation-strategy.md exists and contains all required sections
- [ ] Pre-migration validation checks specified (5+ checks)
- [ ] Post-migration validation checks specified (6+ checks)
- [ ] Data integrity checks specified (6+ checks)
- [ ] All 3 validation scripts specified with I/O requirements
- [ ] Exit codes defined (0 = success, 1 = failure)
- [ ] rollback-plan.md exists and contains all required sections
- [ ] Backup strategy includes markdown, database, env variables
- [ ] Rollback procedure has 7+ steps
- [ ] Restoration validation checklist included
- [ ] Rollback script specification is complete and idempotent
- [ ] validation-checklist.md exists and is actionable
- [ ] Pre-migration checklist covers all 8 collections
- [ ] Post-migration checklist covers all 8 collections
- [ ] Sign-off criteria match spec (0% data loss, <5 min build)

**If Verification Fails:**
- Identify missing/incomplete sections
- Request integration-coordinator to complete deliverables
- Re-verify after corrections

---

### Step 6: Phase 1 Completion

**Orchestrator Actions:**
1. Confirm all 6 deliverables exist and pass verification
2. Update task status in tasks.md:
   - PRE-1: Status → Complete
   - PRE-2: Status → Complete
   - Phase 1 Progress: 2/2 complete (100%)
3. Create Phase 1 completion summary
4. Prepare Phase 2 readiness assessment

**Phase 1 Completion Checklist:**
- [ ] integration-strategy.md ✓
- [ ] field-mappings.md ✓
- [ ] integration-points.md ✓
- [ ] validation-strategy.md ✓
- [ ] rollback-plan.md ✓
- [ ] validation-checklist.md ✓
- [ ] All verification criteria passed
- [ ] Phase 2 dependencies satisfied

---

## Deliverable Verification Matrix

| Deliverable | File Exists | Complete Sections | Verification Criteria | Evidence Requirements |
|-------------|-------------|-------------------|----------------------|----------------------|
| integration-strategy.md | ☐ | ☐ | ☐ | ☐ |
| field-mappings.md | ☐ | ☐ | ☐ | ☐ |
| integration-points.md | ☐ | ☐ | ☐ | ☐ |
| validation-strategy.md | ☐ | ☐ | ☐ | ☐ |
| rollback-plan.md | ☐ | ☐ | ☐ | ☐ |
| validation-checklist.md | ☐ | ☐ | ☐ | ☐ |

---

## Risk Mitigation

### Risk: Incomplete Deliverables
**Mitigation:** Mandatory verification before marking tasks complete. Use Read tool to verify file existence and content.

### Risk: Design Decisions Conflict
**Mitigation:** PRE-2 uses PRE-1 outputs as dependencies. Integration-coordinator reviews PRE-1 decisions before PRE-2.

### Risk: Missing Technical Context
**Mitigation:** Comprehensive context package provided upfront with all necessary files and spec sections.

### Risk: Verification Criteria Ambiguous
**Mitigation:** Detailed verification criteria and evidence requirements in manifest.

---

## Success Metrics

Phase 1 is successful when:
- 100% deliverable completion (6/6 files)
- 100% verification criteria passed
- All evidence requirements met
- Phase 2 can proceed without missing information
- Design decisions documented and accessible
- Integration-coordinator confirms understanding of all requirements

---

## Next Steps After Phase 1

1. **Phase 2 Preparation:** Use Phase 1 outputs to prepare Backend Implementation tasks
2. **Agent Assignments:** Assign backend-nodejs-specialist for implementation tasks
3. **Context Optimization:** Use field mappings and transformation specs for focused context
4. **Parallel Execution:** Phase 2 tasks can run in parallel with proper dependencies

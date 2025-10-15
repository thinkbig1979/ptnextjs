# Validation Strategy - TinaCMS to Payload CMS Migration

> Created: 2025-10-14
> Task: PRE-2
> Author: integration-coordinator

## Overview

This document defines a comprehensive validation strategy to ensure zero data loss during the TinaCMS to Payload CMS migration. The strategy includes pre-migration validation, post-migration validation, data integrity checks, and validation script specifications.

**Success Criteria:** 0% data loss, 100% field parity, all relationships intact

---

## 1. Pre-Migration Validation

**Purpose:** Establish baseline and identify issues before migration begins

### 1.1 Entity Count Inventory

**Script:** `scripts/validate-tinacms-content.ts`

**Validation Checks:**
- Count all vendors in `content/vendors/*.md`
- Count all products in `content/products/*.md`
- Count all blog posts in `content/blog/posts/*.md`
- Count all categories in `content/categories/*.md`
- Count all blog categories in `content/blog/categories/*.md`
- Count all team members in `content/team/*.md`
- Count all yachts in `content/yachts/*.md` (if directory exists)
- Verify company info exists in `content/company/info.json`
- Extract and count unique tags from all content

**Expected Output:**
```json
{
  "timestamp": "2025-10-14T10:00:00Z",
  "phase": "pre-migration",
  "counts": {
    "vendors": 15,
    "products": 45,
    "blogPosts": 12,
    "productCategories": 8,
    "blogCategories": 5,
    "teamMembers": 5,
    "yachts": 3,
    "companyInfo": 1,
    "uniqueTags": 25
  },
  "totalEntities": 119
}
```

### 1.2 Reference Integrity Verification

**Purpose:** Ensure all relationship references are valid

**Validation Checks:**
- **Products → Vendors**: Verify all `product.vendor` or `product.partner` file references exist
- **Products → Categories**: Verify all `product.category` file references exist
- **Products → Tags**: Verify all `product.tags[]` file references exist
- **Blog Posts → Categories**: Verify all `blogPost.blog_category` file references exist
- **Blog Posts → Tags**: Verify all `blogPost.tags[]` file references exist
- **Vendors → Categories**: Verify all `vendor.category` file references exist
- **Vendors → Tags**: Verify all `vendor.tags[]` file references exist
- **Yachts → Vendors**: Verify all `yacht.supplierMap[].vendor` file references exist
- **Yachts → Categories**: Verify all `yacht.category` file references exist
- **Yachts → Tags**: Verify all `yacht.tags[]` file references exist

**Expected Output:**
```json
{
  "referenceIntegrity": {
    "valid": true,
    "errors": [],
    "summary": {
      "totalReferences": 150,
      "validReferences": 150,
      "brokenReferences": 0
    }
  }
}
```

**If Errors Found:**
```json
{
  "referenceIntegrity": {
    "valid": false,
    "errors": [
      {
        "type": "broken_reference",
        "file": "content/products/product-a.md",
        "field": "vendor",
        "reference": "content/vendors/missing-vendor.md",
        "message": "Referenced file does not exist"
      }
    ]
  }
}
```

### 1.3 Duplicate Slug Detection

**Purpose:** Ensure slug uniqueness across all collections

**Validation Checks:**
- Check for duplicate vendor slugs
- Check for duplicate product slugs
- Check for duplicate blog post slugs
- Check for duplicate yacht slugs
- Check for duplicate category slugs
- Check for duplicate tag slugs (after extraction)

**Expected Output:**
```json
{
  "duplicateSlugs": {
    "vendors": [],
    "products": [],
    "blogPosts": [],
    "yachts": [],
    "categories": [],
    "tags": []
  },
  "totalDuplicates": 0
}
```

**If Duplicates Found:**
```json
{
  "duplicateSlugs": {
    "products": [
      {
        "slug": "navigation-system",
        "files": [
          "content/products/navigation-system.md",
          "content/products/navigation-system-v2.md"
        ]
      }
    ]
  },
  "totalDuplicates": 1
}
```

### 1.4 Required Field Validation

**Purpose:** Verify all markdown files have required fields

**Validation Checks:**

**Vendors:**
- `name` (required)
- `slug` (required)
- `description` (required or extracted from body)

**Products:**
- `name` (required)
- `slug` (required)
- `description` (required)
- `vendor` OR `partner` (required)

**Blog Posts:**
- `title` (required)
- `slug` (required)
- `excerpt` (required)
- `author` (required)
- `published_at` (required)

**Team Members:**
- `name` (required)
- `role` (required)

**Yachts:**
- `name` (required)
- `slug` (required)
- `description` (required)

**Expected Output:**
```json
{
  "requiredFields": {
    "valid": true,
    "errors": [],
    "summary": {
      "totalEntities": 83,
      "validEntities": 83,
      "invalidEntities": 0
    }
  }
}
```

### 1.5 Media File Accessibility

**Purpose:** Verify all referenced media files exist

**Validation Checks:**
- Verify all vendor logo paths exist
- Verify all vendor image paths exist
- Verify all product image paths exist
- Verify all blog post featured image paths exist
- Verify all team member image paths exist
- Verify all yacht image paths exist
- Verify all certification logo paths exist
- Verify all case study image paths exist

**Expected Output:**
```json
{
  "mediaFiles": {
    "valid": true,
    "missing": [],
    "summary": {
      "totalMediaReferences": 200,
      "accessibleFiles": 200,
      "missingFiles": 0
    }
  }
}
```

### 1.6 Orphaned Content Detection

**Purpose:** Identify content not referenced by any other content

**Validation Checks:**
- Identify categories not used by any vendors, products, blog posts, or yachts
- Identify tags not used by any content
- Identify vendors with no products
- Identify products with no vendor reference

**Expected Output:**
```json
{
  "orphanedContent": {
    "categories": [],
    "tags": [],
    "vendorsWithoutProducts": ["vendor-xyz"],
    "productsWithoutVendor": []
  },
  "totalOrphaned": 1
}
```

---

## 2. Post-Migration Validation

**Purpose:** Verify migration success and data integrity

### 2.1 Entity Count Verification

**Script:** `scripts/validate-migration-success.ts`

**Validation Checks:**
- Compare TinaCMS counts with Payload counts
- Ensure 100% entity preservation (TinaCMS count === Payload count)

**Comparison Table:**
```
| Collection      | TinaCMS | Payload | Match | Status |
|-----------------|---------|---------|-------|--------|
| Vendors         | 15      | 15      | ✓     | PASS   |
| Products        | 45      | 45      | ✓     | PASS   |
| Blog Posts      | 12      | 12      | ✓     | PASS   |
| Categories      | 8       | 8       | ✓     | PASS   |
| Team Members    | 5       | 5       | ✓     | PASS   |
| Yachts          | 3       | 3       | ✓     | PASS   |
| Company Info    | 1       | 1       | ✓     | PASS   |
| Tags            | 25      | 25      | ✓     | PASS   |
```

**Expected Output:**
```json
{
  "entityCounts": {
    "match": true,
    "tinacms": {
      "vendors": 15,
      "products": 45,
      "blogPosts": 12,
      "categories": 8,
      "teamMembers": 5,
      "yachts": 3,
      "companyInfo": 1,
      "tags": 25
    },
    "payload": {
      "vendors": 15,
      "products": 45,
      "blogPosts": 12,
      "categories": 8,
      "teamMembers": 5,
      "yachts": 3,
      "companyInfo": 1,
      "tags": 25
    },
    "differences": []
  },
  "totalEntitiesMatch": true
}
```

### 2.2 Field-Level Data Comparison (10% Sample)

**Purpose:** Deep validation of data accuracy

**Validation Approach:**
- Select random 10% sample from each collection
- Compare field-by-field between TinaCMS and Payload
- Flag any mismatches for review

**Sample Selection:**
- Vendors: 2 random records (10% of 15)
- Products: 5 random records (10% of 45)
- Blog Posts: 2 random records (10% of 12)
- Categories: 1 random record (10% of 8)
- Team Members: 1 random record (10% of 5)
- Yachts: 1 random record (10% of 3)

**Comparison Fields per Collection:**

**Vendors:**
- Base fields: name, slug, description, logo, image, website, founded, location, featured, partner
- Enhanced fields: certifications, awards, socialProof, videoIntroduction, caseStudies, innovationHighlights, teamMembers, yachtProjects
- Relationships: category (name match), tags (array match)

**Products:**
- Base fields: name, slug, description, price, images, features, specifications
- Enhanced fields: comparisonMetrics, integrationCompatibility, ownerReviews, visualDemo, benefits, services, pricing, actionButtons, badges
- Relationships: vendor (name match), categories (name match), tags (array match)

**Expected Output:**
```json
{
  "fieldComparison": {
    "samplesCompared": 12,
    "matches": 12,
    "mismatches": [],
    "matchRate": 1.0,
    "details": [
      {
        "collection": "vendors",
        "slug": "acme-systems",
        "fieldsCompared": 15,
        "fieldMatches": 15,
        "fieldMismatches": []
      }
    ]
  }
}
```

**If Mismatches Found:**
```json
{
  "fieldComparison": {
    "mismatches": [
      {
        "collection": "products",
        "slug": "product-a",
        "field": "price",
        "tinacmsValue": "$1,000",
        "payloadValue": "$1000",
        "severity": "minor",
        "note": "Formatting difference only"
      }
    ]
  }
}
```

### 2.3 Rich Text Conversion Verification

**Purpose:** Verify markdown → Lexical conversion accuracy

**Validation Checks:**
- Sample 10 blog posts
- Verify markdown content converted to Lexical JSON
- Check for conversion errors
- Verify formatting preserved (headings, lists, links, images, code blocks)

**Conversion Quality Checks:**
- Headings (h1-h6) converted correctly
- Paragraphs preserved
- Lists (ordered/unordered) maintained
- Links functional
- Images included with correct paths
- Code blocks formatted properly
- Bold/italic/strikethrough preserved

**Expected Output:**
```json
{
  "richTextConversion": {
    "valid": true,
    "samplesChecked": 10,
    "successfulConversions": 10,
    "errors": [],
    "warnings": []
  }
}
```

### 2.4 Reference Resolution Validation

**Purpose:** Verify file path references converted to database IDs

**Validation Checks:**
- **Products → Vendors**: Verify vendor database IDs resolve correctly
- **Products → Categories**: Verify category database IDs resolve correctly
- **Blog Posts → Categories**: Verify category database IDs resolve correctly
- **Content → Tags**: Verify tag database IDs resolve correctly
- **Yachts → Vendors**: Verify vendor database IDs in supplier map resolve correctly

**Resolution Verification:**
```typescript
// Example validation
const product = await payload.findByID({ collection: 'products', id: productId, depth: 2 });
const vendorName = product.vendor?.companyName;
const tinacmsVendorName = /* fetch from TinaCMS */;

assert(vendorName === tinacmsVendorName, 'Vendor reference mismatch');
```

**Expected Output:**
```json
{
  "referenceResolution": {
    "valid": true,
    "broken": [],
    "summary": {
      "totalReferences": 150,
      "resolvedReferences": 150,
      "brokenReferences": 0
    }
  }
}
```

### 2.5 Media Path Transformation Verification

**Purpose:** Verify all media paths transformed correctly

**Validation Checks:**
- Verify all image URLs start with `/media/` or `http`
- Verify transformed paths point to accessible files
- Compare TinaCMS paths with Payload paths

**Expected Output:**
```json
{
  "mediaPaths": {
    "valid": true,
    "invalid": [],
    "summary": {
      "totalMediaPaths": 200,
      "validPaths": 200,
      "invalidPaths": 0
    }
  }
}
```

### 2.6 Slug Uniqueness in Payload

**Purpose:** Verify slug uniqueness constraints in database

**Validation Checks:**
- Query Payload database for duplicate slugs in each collection
- Verify database unique constraints are enforced

**Expected Output:**
```json
{
  "slugUniqueness": {
    "valid": true,
    "duplicates": [],
    "summary": {
      "totalSlugs": 113,
      "uniqueSlugs": 113,
      "duplicateSlugs": 0
    }
  }
}
```

---

## 3. Data Integrity Checks

**Purpose:** Deep validation of data quality and consistency

### 3.1 Required Field Presence Validation

**Validation Checks:**
- Verify all required fields are present in Payload
- Verify no `null` values for required fields
- Verify no empty strings for required text fields

**Required Fields per Collection:**

**Vendors:**
- companyName, slug, description

**Products:**
- name, slug, description, vendor (relationship)

**Blog Posts:**
- title, slug, excerpt, content, author, publishedAt

**Team Members:**
- name, role

**Yachts:**
- name, slug, description

**Expected Output:**
```json
{
  "requiredFieldPresence": {
    "valid": true,
    "errors": [],
    "summary": {
      "totalEntities": 114,
      "validEntities": 114,
      "invalidEntities": 0
    }
  }
}
```

### 3.2 Data Type Validation

**Validation Checks:**
- Verify dates in correct ISO 8601 format
- Verify numbers are numeric types (not strings)
- Verify booleans are boolean types
- Verify arrays are array types

**Type Checks:**
```typescript
// Example validations
assert(typeof vendor.founded === 'number', 'founded must be number');
assert(typeof vendor.partner === 'boolean', 'partner must be boolean');
assert(Array.isArray(vendor.certifications), 'certifications must be array');
assert(Date.parse(blogPost.publishedAt), 'publishedAt must be valid date');
```

**Expected Output:**
```json
{
  "dataTypeValidation": {
    "valid": true,
    "errors": [],
    "summary": {
      "totalFields": 500,
      "validFields": 500,
      "invalidFields": 0
    }
  }
}
```

### 3.3 Array Field Length Preservation

**Purpose:** Verify arrays maintain correct element count

**Validation Checks:**
- Compare array lengths between TinaCMS and Payload
- Verify no array elements lost during migration

**Arrays to Validate:**
- Vendor certifications
- Vendor awards
- Vendor case studies
- Vendor innovation highlights
- Vendor team members
- Vendor yacht projects
- Product images
- Product features
- Product specifications
- Product benefits
- Product comparison metrics
- Product owner reviews
- Yacht timeline
- Yacht supplier map
- Yacht customizations
- Yacht maintenance history

**Expected Output:**
```json
{
  "arrayFieldLength": {
    "valid": true,
    "mismatches": [],
    "summary": {
      "totalArrays": 150,
      "matchingArrays": 150,
      "mismatchedArrays": 0
    }
  }
}
```

### 3.4 Relationship Integrity

**Purpose:** Verify all foreign key relationships are valid

**Validation Checks:**
- All `product.vendor` IDs exist in vendors collection
- All `product.categories` IDs exist in categories collection
- All `blogPost.categories` IDs exist in categories collection
- All `content.tags` IDs exist in tags collection
- All `yacht.supplierMap.vendor` IDs exist in vendors collection

**Relationship Queries:**
```typescript
// Example validation
const orphanedProducts = await payload.find({
  collection: 'products',
  where: {
    vendor: {
      exists: false
    }
  }
});

assert(orphanedProducts.docs.length === 0, 'Found products without valid vendor');
```

**Expected Output:**
```json
{
  "relationshipIntegrity": {
    "valid": true,
    "brokenRelationships": [],
    "summary": {
      "totalRelationships": 150,
      "validRelationships": 150,
      "brokenRelationships": 0
    }
  }
}
```

### 3.5 Enum Value Validation

**Purpose:** Verify all enum fields have valid values

**Validation Checks:**
- Verify `timeline[].category` has valid enum value (launch, delivery, refit, milestone, service)
- Verify `supplierMap[].role` has valid enum value (primary, subcontractor, consultant)
- Verify `maintenanceHistory[].type` has valid enum value (routine, repair, upgrade, inspection)
- Verify `maintenanceHistory[].status` has valid enum value (completed, in-progress, scheduled)
- Verify `sustainabilityScore` fields have valid enum values

**Expected Output:**
```json
{
  "enumValidation": {
    "valid": true,
    "invalidValues": [],
    "summary": {
      "totalEnumFields": 50,
      "validEnumFields": 50,
      "invalidEnumFields": 0
    }
  }
}
```

### 3.6 Image URL Format Validation

**Purpose:** Verify all image URLs are accessible

**Validation Checks:**
- All image URLs start with `/` or `http`
- All image URLs point to existing files (or return 200 status)
- No broken image references

**Expected Output:**
```json
{
  "imageUrlValidation": {
    "valid": true,
    "brokenUrls": [],
    "summary": {
      "totalImageUrls": 200,
      "validUrls": 200,
      "brokenUrls": 0
    }
  }
}
```

---

## 4. Validation Script Specifications

### 4.1 Script: validate-tinacms-content.ts

**Purpose:** Pre-migration validation

**Location:** `scripts/validate-tinacms-content.ts`

**Functionality:**
```typescript
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface ValidationReport {
  timestamp: string;
  phase: 'pre-migration';
  counts: {
    vendors: number;
    products: number;
    blogPosts: number;
    categories: number;
    teamMembers: number;
    yachts: number;
    companyInfo: number;
    uniqueTags: number;
  };
  referenceIntegrity: {
    valid: boolean;
    errors: any[];
  };
  duplicateSlugs: Record<string, string[]>;
  requiredFields: {
    valid: boolean;
    errors: any[];
  };
  mediaFiles: {
    valid: boolean;
    missing: string[];
  };
  orphanedContent: {
    categories: string[];
    tags: string[];
    vendorsWithoutProducts: string[];
  };
}

async function validateTinaCMSContent(): Promise<ValidationReport> {
  const report: ValidationReport = { /* ... */ };

  // Count entities
  report.counts.vendors = await countMarkdownFiles('content/vendors');
  report.counts.products = await countMarkdownFiles('content/products');
  // ... count other collections

  // Validate references
  report.referenceIntegrity = await validateReferences();

  // Check for duplicates
  report.duplicateSlugs = await checkDuplicateSlugs();

  // Validate required fields
  report.requiredFields = await validateRequiredFields();

  // Check media files
  report.mediaFiles = await validateMediaFiles();

  // Detect orphaned content
  report.orphanedContent = await detectOrphanedContent();

  return report;
}

export default validateTinaCMSContent;
```

**Exit Codes:**
- `0`: All validations pass
- `1`: Validation failures detected

**Usage:**
```bash
npm run validate:tinacms
# or
node scripts/validate-tinacms-content.ts
```

**Output:**
- Console: Summary of validation results with colored output
- File: `validation-reports/pre-migration-YYYYMMDD-HHMMSS.json`

### 4.2 Script: validate-migration-success.ts

**Purpose:** Post-migration validation

**Location:** `scripts/validate-migration-success.ts`

**Functionality:**
```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';
import validateTinaCMSContent from './validate-tinacms-content';

interface PostMigrationReport {
  timestamp: string;
  phase: 'post-migration';
  entityCounts: {
    match: boolean;
    tinacms: Record<string, number>;
    payload: Record<string, number>;
    differences: any[];
  };
  fieldComparison: {
    samplesCompared: number;
    matches: number;
    mismatches: any[];
  };
  richTextConversion: {
    valid: boolean;
    errors: any[];
  };
  referenceResolution: {
    valid: boolean;
    broken: any[];
  };
  mediaPaths: {
    valid: boolean;
    invalid: any[];
  };
  slugUniqueness: {
    valid: boolean;
    duplicates: any[];
  };
}

async function validateMigrationSuccess(): Promise<PostMigrationReport> {
  const payload = await getPayload({ config });
  const report: PostMigrationReport = { /* ... */ };

  // Get pre-migration counts
  const preMigrationReport = await validateTinaCMSContent();

  // Compare entity counts
  report.entityCounts = await compareEntityCounts(preMigrationReport.counts, payload);

  // Sample and compare fields
  report.fieldComparison = await compareSampleFields(payload);

  // Validate rich text conversion
  report.richTextConversion = await validateRichTextConversion(payload);

  // Validate reference resolution
  report.referenceResolution = await validateReferenceResolution(payload);

  // Validate media paths
  report.mediaPaths = await validateMediaPaths(payload);

  // Check slug uniqueness
  report.slugUniqueness = await checkSlugUniqueness(payload);

  return report;
}

export default validateMigrationSuccess;
```

**Exit Codes:**
- `0`: Migration successful (0% data loss)
- `1`: Migration failures detected

**Usage:**
```bash
npm run validate:migration
# or
node scripts/validate-migration-success.ts
```

**Output:**
- Console: Detailed validation results with colored output
- File: `validation-reports/post-migration-YYYYMMDD-HHMMSS.json`

### 4.3 Script: compare-data-integrity.ts

**Purpose:** Field-level comparison utility

**Location:** `scripts/compare-data-integrity.ts`

**Functionality:**
```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';
import tinaCMSDataService from '@/lib/tinacms-data-service';

interface ComparisonOptions {
  collection: string;
  sample: number;
  fields?: string[];
}

async function compareDataIntegrity(options: ComparisonOptions) {
  const payload = await getPayload({ config });

  // Fetch sample from Payload
  const payloadDocs = await payload.find({
    collection: options.collection,
    limit: options.sample,
    depth: 2
  });

  // Fetch corresponding TinaCMS data
  const tinacmsDocs = await fetchTinaCMSDocs(options.collection, payloadDocs.docs);

  // Compare field-by-field
  const mismatches = [];

  for (let i = 0; i < payloadDocs.docs.length; i++) {
    const payloadDoc = payloadDocs.docs[i];
    const tinacmsDoc = tinacmsDocs[i];

    const fieldMismatches = compareFields(payloadDoc, tinacmsDoc, options.fields);
    if (fieldMismatches.length > 0) {
      mismatches.push({
        slug: payloadDoc.slug,
        mismatches: fieldMismatches
      });
    }
  }

  return {
    collection: options.collection,
    samplesCompared: payloadDocs.docs.length,
    matches: payloadDocs.docs.length - mismatches.length,
    mismatches
  };
}

export default compareDataIntegrity;
```

**Exit Codes:**
- `0`: All comparisons match
- `1`: Mismatches detected

**Usage:**
```bash
npm run validate:integrity -- --collection vendors --sample 10
# or
node scripts/compare-data-integrity.ts --collection vendors --sample 10
```

**Output:**
- Console: Diff output for mismatches with colored highlighting
- File: `validation-reports/integrity-{collection}-YYYYMMDD-HHMMSS.json`

---

## 5. Validation Execution Plan

### Phase 1: Pre-Migration Validation

**When:** Before running migration scripts

**Steps:**
1. Run `npm run validate:tinacms`
2. Review validation report
3. Fix any errors found
4. Re-run validation until all checks pass
5. Save baseline report for comparison

**Acceptance Criteria:**
- [ ] 0 broken references
- [ ] 0 duplicate slugs
- [ ] 0 missing required fields
- [ ] 0 missing media files
- [ ] Exit code 0

### Phase 2: Migration Execution

**When:** After pre-migration validation passes

**Steps:**
1. Run backup procedure (see rollback-plan.md)
2. Run migration scripts
3. Monitor for errors
4. Log any warnings or issues

### Phase 3: Post-Migration Validation

**When:** Immediately after migration completes

**Steps:**
1. Run `npm run validate:migration`
2. Review validation report
3. Compare entity counts (must match 100%)
4. Review field comparison results (10% sample)
5. Check rich text conversion quality
6. Verify reference resolution
7. Validate media paths
8. Confirm slug uniqueness

**Acceptance Criteria:**
- [ ] 100% entity count match
- [ ] 0% data loss
- [ ] 0 field mismatches (or only minor formatting differences)
- [ ] 100% reference resolution success
- [ ] 100% media path validation success
- [ ] Exit code 0

### Phase 4: Data Integrity Validation

**When:** After post-migration validation passes

**Steps:**
1. Run targeted integrity checks for each collection
2. Validate 100% sample for critical collections (e.g., vendors, products)
3. Verify relationship integrity
4. Check data types
5. Validate array lengths
6. Confirm enum values

**Acceptance Criteria:**
- [ ] All required fields present
- [ ] All data types correct
- [ ] All arrays preserved
- [ ] All relationships valid
- [ ] All enum values valid
- [ ] All image URLs accessible

---

## 6. Success Criteria Summary

**Migration is successful when:**

- [ ] **Zero Data Loss**: TinaCMS entity counts === Payload entity counts (100% match)
- [ ] **Field Parity**: All fields migrated correctly (100% field coverage)
- [ ] **Reference Integrity**: All relationships resolved correctly (100% success rate)
- [ ] **Rich Text Conversion**: All markdown → Lexical conversions successful
- [ ] **Media Paths**: All image URLs valid and accessible (100% validation)
- [ ] **Slug Uniqueness**: All slugs unique across collections
- [ ] **Required Fields**: All required fields present and valid
- [ ] **Data Types**: All fields have correct data types
- [ ] **Array Preservation**: All array elements preserved
- [ ] **Enum Validation**: All enum values valid
- [ ] **Build Success**: Application builds successfully (<5 minutes)
- [ ] **Page Rendering**: All pages render correctly in browser
- [ ] **Test Pass**: All automated tests pass

---

## 7. Validation Report Format

All validation reports are saved in JSON format with timestamps:

**File Naming:**
- Pre-migration: `validation-reports/pre-migration-YYYYMMDD-HHMMSS.json`
- Post-migration: `validation-reports/post-migration-YYYYMMDD-HHMMSS.json`
- Integrity checks: `validation-reports/integrity-{collection}-YYYYMMDD-HHMMSS.json`

**Report Structure:**
```json
{
  "timestamp": "2025-10-14T10:00:00Z",
  "phase": "pre-migration | post-migration | integrity-check",
  "status": "PASS | FAIL",
  "summary": {
    "totalChecks": 10,
    "passedChecks": 10,
    "failedChecks": 0
  },
  "details": { /* ... */ },
  "errors": [],
  "warnings": []
}
```

---

## 8. Automated Validation Integration

**CI/CD Integration:**

```yaml
# GitHub Actions workflow
name: Validate Migration

on:
  push:
    branches: [migration/*]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run pre-migration validation
        run: npm run validate:tinacms
      - name: Run migration
        run: npm run migrate:tinacms-to-payload
      - name: Run post-migration validation
        run: npm run validate:migration
      - name: Upload validation reports
        uses: actions/upload-artifact@v2
        with:
          name: validation-reports
          path: validation-reports/
```

---

## Notes

- All validation scripts must be idempotent (safe to run multiple times)
- Validation reports are retained for audit trail
- Failed validations block migration progression
- 0% data loss is non-negotiable success criterion

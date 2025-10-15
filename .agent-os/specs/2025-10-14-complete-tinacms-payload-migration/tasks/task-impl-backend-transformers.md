# Task IMPL-BACKEND-TRANSFORMERS: Create Shared Transformation Layer

## Task Metadata
- **Task ID**: impl-backend-transformers
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: backend-nodejs-specialist
- **Estimated Time**: 5 hours
- **Dependencies**: pre-1, impl-backend-vendor-enhance, impl-backend-product-enhance, impl-backend-yachts
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Create a shared transformation layer with utilities for converting TinaCMS markdown data to Payload CMS collection formats. This includes vendor transformers, product transformers, yacht transformers, and shared utilities for reference resolution and data normalization.

## Specifics

### Files to Create

#### 1. Base Transformer Utility
`/home/edwin/development/ptnextjs/src/lib/transformers/base.ts`

```typescript
/**
 * Base transformation utilities shared across all transformers
 */

import slugify from 'slugify';

export interface TransformOptions {
  dryRun?: boolean;
  skipValidation?: boolean;
}

export interface TransformResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

// Generate slug from text
export function generateSlug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

// Parse date string to Date object
export function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

// Resolve file reference to database ID
export async function resolveReference(
  filePath: string,
  collection: string,
  payload: any
): Promise<string | null> {
  // Extract slug from file path (e.g., content/vendors/company.md -> company)
  const slug = filePath.replace(/^content\/[^/]+\//, '').replace(/\.md$/, '');

  // Query Payload to find matching record
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1
  });

  return result.docs[0]?.id || null;
}

// Transform array of file references to array of IDs
export async function resolveReferences(
  filePaths: string[] | undefined,
  collection: string,
  payload: any
): Promise<string[]> {
  if (!filePaths || filePaths.length === 0) return [];

  const ids = await Promise.all(
    filePaths.map(path => resolveReference(path, collection, payload))
  );

  return ids.filter(id => id !== null) as string[];
}

// Extract numeric value from string (e.g., "50 meters" -> 50)
export function extractNumericValue(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Validate email format
export function isValidEmail(email: string | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

#### 2. Vendor Transformer
`/home/edwin/development/ptnextjs/src/lib/transformers/vendor.ts`

```typescript
/**
 * Transform TinaCMS vendor markdown to Payload Vendor collection format
 */

import { Vendor } from '@/payload-types';
import { generateSlug, parseDate, resolveReferences, isValidEmail, isValidUrl, TransformResult } from './base';
import { markdownToLexical } from './markdown-to-lexical';

export interface TinaCMSVendor {
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  headquarters?: string;
  foundedYear?: number;
  specialties?: string[];
  logo?: string;
  coverImage?: string;
  featured?: boolean;
  partner?: boolean;
  // ... other TinaCMS fields
}

export async function transformVendorFromMarkdown(
  tinaCMSData: TinaCMSVendor,
  payload: any
): Promise<TransformResult<Partial<Vendor>>> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const vendorData: Partial<Vendor> = {
      name: tinaCMSData.name,
      slug: generateSlug(tinaCMSData.name),
      tagline: tinaCMSData.description?.substring(0, 200), // First 200 chars as tagline
      featured: tinaCMSData.featured || false,
      partner: tinaCMSData.partner || false,

      // Convert markdown description to Lexical rich text
      description: tinaCMSData.description
        ? await markdownToLexical(tinaCMSData.description)
        : undefined,

      // Contact information
      website: tinaCMSData.website,
      email: tinaCMSData.email,
      phone: tinaCMSData.phone,

      // Company info
      headquarters: tinaCMSData.headquarters,
      foundedYear: tinaCMSData.foundedYear,

      // Initialize empty arrays for enhanced fields
      certifications: [],
      awards: [],
      innovations: [],
      teamMembers: [],
      yachtProjects: [],
      caseStudies: [],

      // Initialize social proof with defaults
      socialProof: {
        yearsInBusiness: tinaCMSData.foundedYear
          ? new Date().getFullYear() - tinaCMSData.foundedYear
          : undefined
      }
    };

    // Validate email format
    if (vendorData.email && !isValidEmail(vendorData.email)) {
      warnings.push(`Invalid email format: ${vendorData.email}`);
      vendorData.email = undefined;
    }

    // Validate URL format
    if (vendorData.website && !isValidUrl(vendorData.website)) {
      warnings.push(`Invalid website URL: ${vendorData.website}`);
      vendorData.website = undefined;
    }

    return {
      success: true,
      data: vendorData,
      warnings
    };
  } catch (error) {
    errors.push(`Failed to transform vendor: ${error.message}`);
    return {
      success: false,
      errors
    };
  }
}
```

#### 3. Product Transformer
`/home/edwin/development/ptnextjs/src/lib/transformers/product.ts`

```typescript
/**
 * Transform TinaCMS product markdown to Payload Product collection format
 */

import { Product } from '@/payload-types';
import { generateSlug, parseDate, resolveReference, TransformResult } from './base';
import { markdownToLexical } from './markdown-to-lexical';

export interface TinaCMSProduct {
  name: string;
  description?: string;
  vendor?: string; // File path reference
  categories?: string[]; // File path references
  price?: number;
  image?: string;
  featured?: boolean;
  // ... other TinaCMS fields
}

export async function transformProductFromMarkdown(
  tinaCMSData: TinaCMSProduct,
  payload: any
): Promise<TransformResult<Partial<Product>>> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Resolve vendor reference
    const vendorId = tinaCMSData.vendor
      ? await resolveReference(tinaCMSData.vendor, 'vendors', payload)
      : null;

    if (tinaCMSData.vendor && !vendorId) {
      warnings.push(`Could not resolve vendor reference: ${tinaCMSData.vendor}`);
    }

    const productData: Partial<Product> = {
      name: tinaCMSData.name,
      slug: generateSlug(tinaCMSData.name),
      featured: tinaCMSData.featured || false,

      // Convert markdown to Lexical
      description: tinaCMSData.description
        ? await markdownToLexical(tinaCMSData.description)
        : undefined,

      // Relationships
      vendor: vendorId,

      // Pricing
      price: tinaCMSData.price,

      // Initialize empty arrays for enhanced fields
      comparisonMetrics: [],
      ownerReviews: [],
      technicalDocumentation: []
    };

    return {
      success: true,
      data: productData,
      warnings
    };
  } catch (error) {
    errors.push(`Failed to transform product: ${error.message}`);
    return {
      success: false,
      errors
    };
  }
}
```

#### 4. Yacht Transformer
`/home/edwin/development/ptnextjs/src/lib/transformers/yacht.ts`

```typescript
/**
 * Transform yacht data to Payload Yachts collection format
 */

import { Yacht } from '@/payload-types';
import { generateSlug, parseDate, TransformResult } from './base';
import { markdownToLexical } from './markdown-to-lexical';

export interface TinaCMSYacht {
  name: string;
  builder?: string;
  lengthMeters?: number;
  launchYear?: number;
  description?: string;
  // ... other fields
}

export async function transformYachtFromMarkdown(
  tinaCMSData: TinaCMSYacht,
  payload: any
): Promise<TransformResult<Partial<Yacht>>> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const yachtData: Partial<Yacht> = {
      name: tinaCMSData.name,
      slug: generateSlug(tinaCMSData.name),

      specifications: {
        builder: tinaCMSData.builder,
        lengthMeters: tinaCMSData.lengthMeters,
        launchYear: tinaCMSData.launchYear
      },

      description: tinaCMSData.description
        ? await markdownToLexical(tinaCMSData.description)
        : undefined,

      // Initialize empty arrays
      timeline: [],
      supplierMap: [],
      maintenanceHistory: [],

      status: 'active'
    };

    return {
      success: true,
      data: yachtData,
      warnings
    };
  } catch (error) {
    errors.push(`Failed to transform yacht: ${error.message}`);
    return {
      success: false,
      errors
    };
  }
}
```

#### 5. Index Exporter
`/home/edwin/development/ptnextjs/src/lib/transformers/index.ts`

```typescript
/**
 * Central export for all transformers
 */

export * from './base';
export * from './vendor';
export * from './product';
export * from './yacht';
export * from './markdown-to-lexical';
```

### Implementation Requirements

1. **Error Handling**
   - All transformers return TransformResult with success/errors/warnings
   - Gracefully handle missing data
   - Log warnings for invalid data without failing

2. **Reference Resolution**
   - Convert TinaCMS file paths to Payload database IDs
   - Handle missing references gracefully
   - Support both single and array references

3. **Data Validation**
   - Validate email formats
   - Validate URL formats
   - Validate numeric ranges
   - Provide helpful warning messages

4. **TypeScript Types**
   - Import generated Payload types
   - Define TinaCMS data interfaces
   - Ensure type safety throughout

## Acceptance Criteria

- [ ] File created: `src/lib/transformers/base.ts` (base utilities)
- [ ] File created: `src/lib/transformers/vendor.ts` (vendor transformer)
- [ ] File created: `src/lib/transformers/product.ts` (product transformer)
- [ ] File created: `src/lib/transformers/yacht.ts` (yacht transformer)
- [ ] File created: `src/lib/transformers/index.ts` (central exports)
- [ ] All transformers return TransformResult interface
- [ ] Reference resolution implemented (file paths → database IDs)
- [ ] Email and URL validation implemented
- [ ] Slug generation implemented
- [ ] Date parsing implemented
- [ ] All transformers handle errors gracefully

## Testing Requirements

### Unit Tests
Create `src/lib/transformers/__tests__/transformers.test.ts`:
- Test slug generation from various names
- Test email validation (valid/invalid formats)
- Test URL validation (valid/invalid formats)
- Test date parsing (valid/invalid dates)
- Test numeric extraction from strings
- Test reference resolution (mocked Payload queries)
- Test vendor transformation with sample data
- Test product transformation with vendor reference
- Test yacht transformation with sample data

### Integration Tests
- Test transformers with real Payload instance (test database)
- Verify reference resolution works with actual collections
- Test error handling with missing references

## Evidence Required

**Code Files:**
1. `src/lib/transformers/base.ts`
2. `src/lib/transformers/vendor.ts`
3. `src/lib/transformers/product.ts`
4. `src/lib/transformers/yacht.ts`
5. `src/lib/transformers/index.ts`

**Test Files:**
1. `src/lib/transformers/__tests__/transformers.test.ts`

**Test Results:**
- Unit test output showing all transformer tests passing
- Sample transformation results for vendor, product, yacht

**Verification Checklist:**
- [ ] All 5 files created
- [ ] TransformResult interface used consistently
- [ ] Reference resolution working
- [ ] Validation functions working (email, URL)
- [ ] Slug generation working
- [ ] All TypeScript types correct
- [ ] No compilation errors
- [ ] All unit tests pass

## Context Requirements

**Technical Spec Sections:**
- Lines 28-184: Enhanced Vendor Fields (for vendor transformer)
- Lines 194-380: Enhanced Product Fields (for product transformer)
- Lines 383-527: Yachts Collection Schema (for yacht transformer)

**Integration Strategy Document:**
- Reference transformation patterns from task-pre-1

**Dependencies:**
- markdown-to-lexical transformer (see task-impl-backend-richtext)
- Payload types from generated payload-types.ts
- slugify library

**Related Tasks:**
- impl-backend-richtext (markdown-to-lexical converter)
- integ-migration-scripts (will use these transformers)

## Quality Gates

- [ ] All transformers follow consistent pattern
- [ ] Error handling is comprehensive
- [ ] Validation provides helpful warnings
- [ ] Reference resolution handles missing refs gracefully
- [ ] TypeScript types are accurate
- [ ] No compilation errors
- [ ] No linting errors
- [ ] All unit tests pass
- [ ] Code is well-documented with JSDoc comments

## Notes

- Transformers should be pure functions (no side effects)
- Reference resolution requires async Payload queries
- Some TinaCMS fields won't map directly (requires manual data entry later)
- Enhanced fields (certifications, awards, etc.) will be empty arrays initially
- Transformers are used by migration scripts (see integ-migration-scripts task)
- Consider adding dry-run mode for testing transformations
- Validation should warn but not fail (allow partial migrations)
- Document any TinaCMS→Payload mapping decisions that aren't obvious

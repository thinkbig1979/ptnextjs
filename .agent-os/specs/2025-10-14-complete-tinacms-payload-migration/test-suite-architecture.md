# Test Suite Architecture - Payload CMS Collections

> Created: 2025-10-15
> Task: TEST-BACKEND-COLLECTIONS
> Phase: Phase 2 - Backend Implementation
> Author: test-architect

## Overview

This document defines the comprehensive test suite architecture for all 8 Payload CMS collections in the TinaCMS to Payload migration. The test suite ensures 100% schema validation, hook functionality, access control, data validation, and relationship integrity across the entire backend.

**Test Coverage Target:** 90%+ code coverage for all collections

**Test Framework:** Jest with Payload CMS test utilities

---

## 1. Test Suite Organization

### Directory Structure

```
__tests__/
├── collections/                    # Collection-specific tests
│   ├── vendors.test.ts            # Vendors collection (100+ enhanced fields)
│   ├── products.test.ts           # Products collection (90+ enhanced fields)
│   ├── yachts.test.ts             # Yachts collection (new, with timeline & supplier map)
│   ├── tags.test.ts               # Tags collection (new, admin-only)
│   ├── categories.test.ts         # Categories collection
│   ├── blog-posts.test.ts         # Blog Posts collection
│   ├── team-members.test.ts       # Team Members collection
│   └── company-info.test.ts       # Company Info singleton
├── utils/                         # Test utilities
│   ├── testHelpers.ts            # Mock Payload instance, cleanup, assertions
│   ├── fixtures.ts               # Sample data for all 8 collections
│   └── mockData.ts               # Rich text samples, arrays, relationships
└── integration/                   # Cross-collection integration tests
    ├── relationships.test.ts      # Product→Vendor, many-to-many, orphaned refs
    ├── access-control.test.ts     # RBAC across collections
    └── data-integrity.test.ts     # Referential integrity validation
```

### File Naming Conventions

- **Collection tests:** `{collection-slug}.test.ts` (kebab-case)
- **Utility files:** `{utility-name}.ts` (camelCase)
- **Integration tests:** `{feature}.test.ts` (kebab-case)

---

## 2. Test File Specifications

### 2.1 Vendors Collection Tests

**File:** `__tests__/collections/vendors.test.ts`

**Test Categories:**
1. **Schema Validation** (15+ tests)
   - Required fields: companyName, slug, description, contactEmail, user, tier
   - Optional fields: logo, website, contactPhone, social URLs
   - Enhanced fields: certifications (Tier 1+), awards, socialProof, videoIntroduction
   - Field types: text, email, checkbox, select (tier), array, group
   - Field length limits: companyName (255), slug (255), description (5000)

2. **Hook Tests** (10+ tests)
   - Slug auto-generation from companyName
   - Slug uniqueness enforcement
   - Tier validation in beforeChange hook
   - Tier-restricted field validation (website, LinkedIn, Twitter, certifications)
   - createdAt/updatedAt timestamp auto-population

3. **Access Control Tests** (12+ tests)
   - Admin can CRUD all vendors
   - Vendors can only read/update their own profile
   - Public can read published vendors only
   - Field-level access: tier, featured, published (admin-only)
   - User relationship is unique (one vendor per user)

4. **Data Validation Tests** (20+ tests)
   - Email format validation (contactEmail)
   - URL format validation (website, LinkedIn, Twitter)
   - Tier enum validation (free, tier1, tier2)
   - Certification array validation
   - Featured/published boolean validation

5. **Relationship Tests** (5+ tests)
   - User relationship (one-to-one)
   - Category relationship (optional)
   - Tags relationship (many-to-many, optional)
   - Orphaned vendor detection (no products)

**Total Tests:** ~62+ tests

---

### 2.2 Products Collection Tests

**File:** `__tests__/collections/products.test.ts`

**Test Categories:**
1. **Schema Validation** (18+ tests)
   - Required fields: name, slug, description, vendor
   - Optional fields: shortDescription, images, categories, specifications
   - Enhanced fields: features, benefits, services, pricing, actionButtons, badges
   - Advanced fields: comparisonMetrics, integrationCompatibility, ownerReviews, visualDemo
   - Rich text field: description (Lexical editor)

2. **Hook Tests** (8+ tests)
   - Slug auto-generation from product name
   - Slug uniqueness enforcement
   - Vendor tier validation (tier2 required for product creation)
   - Timestamps auto-population

3. **Access Control Tests** (10+ tests)
   - Admin can CRUD all products
   - Tier 2 vendors can CRUD their own products
   - Vendors cannot create products without tier2
   - Public can read published products only
   - Published field is admin-only

4. **Data Validation Tests** (25+ tests)
   - Product name length (255)
   - Description richText format validation
   - Images array validation (url, altText, isMain, caption)
   - Specifications array validation (label, value pairs)
   - Features array with icon validation (Lucide icons)
   - Owner reviews validation (rating 0-5, verified boolean)
   - Visual demo type enum (360-image, 3d-model, video, interactive)

5. **Relationship Tests** (8+ tests)
   - Vendor relationship (required, hasMany: false)
   - Categories relationship (many-to-many)
   - Tags relationship (many-to-many, optional)
   - Orphaned product detection (vendor deleted)
   - Product cascade on vendor deletion

**Total Tests:** ~69+ tests

---

### 2.3 Yachts Collection Tests

**File:** `__tests__/collections/yachts.test.ts`

**Test Categories:**
1. **Schema Validation** (20+ tests)
   - Required fields: name, slug, description
   - Optional fields: image, images, length, beam, draft, displacement
   - Yacht specs: builder, designer, launchYear, deliveryYear, homePort, flag
   - Performance: cruisingSpeed, maxSpeed, range, guests, crew
   - Enhanced fields: timeline, supplierMap, sustainabilityScore, customizations, maintenanceHistory

2. **Hook Tests** (6+ tests)
   - Slug auto-generation from yacht name
   - Slug uniqueness enforcement
   - Timeline date validation
   - Timestamps auto-population

3. **Access Control Tests** (8+ tests)
   - Admin can CRUD all yachts
   - Public can read published yachts only
   - Featured/published fields are admin-only

4. **Data Validation Tests** (30+ tests)
   - Timeline array validation (date, event, category enum, location, images)
   - Timeline category enum (launch, delivery, refit, milestone, service)
   - Supplier map validation (vendor relationship, discipline, systems, role enum)
   - Supplier map role enum (primary, subcontractor, consultant)
   - Sustainability score validation (co2Emissions, energyEfficiency, ratings)
   - Sustainability ratings enum (excellent, good, fair, poor)
   - Customizations array validation (category, description, vendor, images, cost, completedDate)
   - Maintenance history validation (date, type enum, system, description, status enum)
   - Maintenance type enum (routine, repair, upgrade, inspection)
   - Maintenance status enum (completed, in-progress, scheduled)

5. **Relationship Tests** (6+ tests)
   - Category relationship (optional)
   - Tags relationship (many-to-many, optional)
   - Supplier map vendor relationships (many-to-many through array)
   - Orphaned yacht detection

**Total Tests:** ~70+ tests

---

### 2.4 Tags Collection Tests

**File:** `__tests__/collections/tags.test.ts`

**Test Categories:**
1. **Schema Validation** (8+ tests)
   - Required fields: name, slug
   - Optional fields: description, color
   - Computed field: usageCount (read-only)
   - Color format validation (hex color)

2. **Hook Tests** (4+ tests)
   - Slug auto-generation from name
   - Slug uniqueness enforcement
   - Timestamps auto-population

3. **Access Control Tests** (10+ tests)
   - **Admin-only CRUD** (critical requirement)
   - Public can read tags only
   - Vendors cannot create/update/delete tags
   - Usage count is read-only for all roles

4. **Data Validation Tests** (6+ tests)
   - Name required validation
   - Slug format validation (lowercase, hyphenated)
   - Color hex format validation (#RRGGBB)
   - Description length validation

5. **Relationship Tests** (4+ tests)
   - Tags used by vendors (many-to-many)
   - Tags used by products (many-to-many)
   - Tags used by blog posts (many-to-many)
   - Tags used by yachts (many-to-many)
   - Orphaned tag detection (usageCount = 0)

**Total Tests:** ~32+ tests

---

### 2.5 Categories Collection Tests

**File:** `__tests__/collections/categories.test.ts`

**Test Categories:**
1. **Schema Validation** (8+ tests)
   - Required fields: name, slug
   - Optional fields: description, icon, color, order
   - Icon validation (Lucide icon name or URL)
   - Color format validation (hex color)

2. **Hook Tests** (4+ tests)
   - Slug auto-generation from name
   - Slug uniqueness enforcement
   - Order default value (999)
   - Timestamps auto-population

3. **Access Control Tests** (6+ tests)
   - Admin can CRUD all categories
   - Public can read categories only
   - Vendors cannot create/update/delete categories

4. **Data Validation Tests** (8+ tests)
   - Name required validation
   - Slug format validation
   - Icon format validation (icon name or /media/ URL)
   - Color hex format validation
   - Order numeric validation

5. **Relationship Tests** (5+ tests)
   - Categories used by vendors
   - Categories used by products
   - Categories used by blog posts
   - Categories used by yachts
   - Orphaned category detection

**Total Tests:** ~31+ tests

---

### 2.6 Blog Posts Collection Tests

**File:** `__tests__/collections/blog-posts.test.ts`

**Test Categories:**
1. **Schema Validation** (12+ tests)
   - Required fields: title, slug, excerpt, content, author, publishedAt
   - Optional fields: featuredImage, categories, tags, readTime
   - Rich text field: content (Lexical editor)
   - SEO fields: metaTitle, metaDescription, keywords, ogImage

2. **Hook Tests** (6+ tests)
   - Slug auto-generation from title
   - Slug uniqueness enforcement
   - publishedAt default value (current date)
   - Timestamps auto-population

3. **Access Control Tests** (8+ tests)
   - Admin can CRUD all blog posts
   - Authors can CRUD their own posts
   - Public can read published posts only
   - Published field validation

4. **Data Validation Tests** (15+ tests)
   - Title length validation (255)
   - Excerpt length validation (500)
   - Content richText format validation
   - Author relationship validation
   - Featured image URL validation
   - Read time format validation
   - SEO fields validation

5. **Relationship Tests** (6+ tests)
   - Author relationship (Users collection)
   - Categories relationship (many-to-many)
   - Tags relationship (many-to-many)
   - Orphaned post detection

**Total Tests:** ~47+ tests

---

### 2.7 Team Members Collection Tests

**File:** `__tests__/collections/team-members.test.ts`

**Test Categories:**
1. **Schema Validation** (8+ tests)
   - Required fields: name, role
   - Optional fields: bio, image, email, linkedin, order
   - Rich text field: bio (Lexical editor)
   - Order default value (999)

2. **Hook Tests** (3+ tests)
   - Order default value assignment
   - Timestamps auto-population

3. **Access Control Tests** (6+ tests)
   - Admin can CRUD all team members
   - Public can read team members only

4. **Data Validation Tests** (10+ tests)
   - Name required validation
   - Role required validation
   - Bio richText format validation
   - Image URL validation
   - Email format validation
   - LinkedIn URL format validation
   - Order numeric validation

5. **Relationship Tests** (2+ tests)
   - No direct relationships
   - Team member ordering validation

**Total Tests:** ~29+ tests

---

### 2.8 Company Info Collection Tests

**File:** `__tests__/collections/company-info.test.ts`

**Test Categories:**
1. **Schema Validation** (15+ tests)
   - Required fields: name, email
   - Optional fields: tagline, description, founded, location, address, phone, story, logo
   - Rich text fields: description, story (Lexical editor)
   - Social media group: facebook, twitter, linkedin, instagram, youtube
   - SEO group: metaTitle, metaDescription, keywords, ogImage
   - **Singleton validation** (only one document allowed)

2. **Hook Tests** (2+ tests)
   - Founded default value (current year)
   - Timestamps auto-population

3. **Access Control Tests** (6+ tests)
   - Admin can update company info
   - Public can read company info only
   - Singleton enforcement (cannot create multiple)

4. **Data Validation Tests** (12+ tests)
   - Name required validation
   - Email format validation
   - Phone format validation
   - URL format validation (social media URLs)
   - Founded year validation (numeric)
   - Logo URL validation
   - Description/story richText format validation
   - SEO fields validation

5. **Relationship Tests** (1+ test)
   - No relationships (singleton)

**Total Tests:** ~36+ tests

---

## 3. Test Utilities Specifications

### 3.1 Test Helpers (`testHelpers.ts`)

**Utilities:**

```typescript
/**
 * Create mock Payload instance for testing
 */
export async function createMockPayload(): Promise<Payload>;

/**
 * Clean up test database after each test
 */
export async function cleanupDatabase(payload: Payload): Promise<void>;

/**
 * Create test user with specified role
 */
export async function createTestUser(
  payload: Payload,
  role: 'admin' | 'vendor' | 'author'
): Promise<User>;

/**
 * Create test vendor with specified tier
 */
export async function createTestVendor(
  payload: Payload,
  tier: 'free' | 'tier1' | 'tier2',
  user?: User
): Promise<Vendor>;

/**
 * Assert field validation error
 */
export function assertValidationError(
  error: any,
  field: string,
  message?: string
): void;

/**
 * Assert access denied error
 */
export function assertAccessDenied(error: any): void;

/**
 * Assert relationship integrity
 */
export async function assertRelationshipExists(
  payload: Payload,
  collection: string,
  id: string,
  relationField: string,
  relationId: string
): Promise<void>;

/**
 * Generate test slug from name
 */
export function generateTestSlug(name: string): string;

/**
 * Wait for async hooks to complete
 */
export async function waitForHooks(ms?: number): Promise<void>;
```

**Features:**
- Mock Payload instance with in-memory database
- Automatic cleanup after each test (afterEach hook)
- User/vendor creation helpers for access control tests
- Validation error assertion helpers
- Relationship integrity helpers
- Async hook wait utilities

---

### 3.2 Fixtures (`fixtures.ts`)

**Sample Data:**

```typescript
/**
 * Vendor fixtures for all tiers
 */
export const vendorFixtures = {
  freeVendor: { /* companyName, slug, description, tier: 'free' */ },
  tier1Vendor: { /* + website, certifications */ },
  tier2Vendor: { /* + all fields */ },
};

/**
 * Product fixtures with various configurations
 */
export const productFixtures = {
  basicProduct: { /* name, slug, description, vendor */ },
  fullProduct: { /* + images, features, specifications */ },
  enhancedProduct: { /* + comparisonMetrics, ownerReviews, visualDemo */ },
};

/**
 * Yacht fixtures
 */
export const yachtFixtures = {
  basicYacht: { /* name, slug, description */ },
  fullYacht: { /* + timeline, supplierMap, sustainabilityScore */ },
};

/**
 * Tag fixtures
 */
export const tagFixtures = {
  basicTag: { /* name, slug */ },
  coloredTag: { /* + description, color */ },
};

/**
 * Category fixtures
 */
export const categoryFixtures = {
  basicCategory: { /* name, slug */ },
  fullCategory: { /* + description, icon, color, order */ },
};

/**
 * Blog post fixtures
 */
export const blogPostFixtures = {
  basicPost: { /* title, slug, excerpt, content, author */ },
  fullPost: { /* + featuredImage, categories, tags, SEO */ },
};

/**
 * Team member fixtures
 */
export const teamMemberFixtures = {
  basicMember: { /* name, role */ },
  fullMember: { /* + bio, image, email, linkedin */ },
};

/**
 * Company info fixture (singleton)
 */
export const companyInfoFixture = {
  complete: { /* name, email, + all optional fields */ },
};
```

**Features:**
- Realistic sample data for all 8 collections
- Multiple variants (basic, full, enhanced)
- Valid data that passes all validation rules
- Includes required and optional fields
- Follows field length limits and format rules

---

### 3.3 Mock Data (`mockData.ts`)

**Utilities:**

```typescript
/**
 * Generate mock Lexical rich text content
 */
export function generateMockRichText(paragraphs?: number): LexicalDocument;

/**
 * Generate mock image array
 */
export function generateMockImages(count?: number): ImageArray;

/**
 * Generate mock certifications array
 */
export function generateMockCertifications(count?: number): Certification[];

/**
 * Generate mock awards array
 */
export function generateMockAwards(count?: number): Award[];

/**
 * Generate mock timeline events
 */
export function generateMockTimeline(count?: number): TimelineEvent[];

/**
 * Generate mock supplier map
 */
export function generateMockSupplierMap(vendorIds: string[]): SupplierMapEntry[];

/**
 * Generate mock owner reviews
 */
export function generateMockOwnerReviews(count?: number): OwnerReview[];

/**
 * Generate mock specifications
 */
export function generateMockSpecifications(): Specification[];

/**
 * Generate mock features
 */
export function generateMockFeatures(count?: number): Feature[];

/**
 * Generate random hex color
 */
export function generateRandomColor(): string;

/**
 * Generate random slug
 */
export function generateRandomSlug(prefix?: string): string;
```

**Features:**
- Lexical rich text generation (headings, paragraphs, lists, links)
- Array data generation for complex fields
- Random data generation for testing uniqueness
- Valid enum values for select fields
- Relationship ID helpers

---

## 4. Test Patterns

### 4.1 Schema Validation Pattern

```typescript
describe('Schema Validation', () => {
  it('should validate required fields', async () => {
    const payload = await createMockPayload();

    await expect(
      payload.create({
        collection: 'vendors',
        data: {
          // Missing required field: companyName
          slug: 'test-vendor',
        },
      })
    ).rejects.toThrow(/companyName is required/i);
  });

  it('should enforce field length limits', async () => {
    const payload = await createMockPayload();

    await expect(
      payload.create({
        collection: 'vendors',
        data: {
          companyName: 'A'.repeat(256), // Exceeds 255 limit
          slug: 'test-vendor',
        },
      })
    ).rejects.toThrow(/exceeds maximum length/i);
  });
});
```

---

### 4.2 Hook Testing Pattern

```typescript
describe('Hooks', () => {
  it('should auto-generate slug from companyName', async () => {
    const payload = await createMockPayload();

    const vendor = await payload.create({
      collection: 'vendors',
      data: {
        companyName: 'Test Company Inc.',
        // slug not provided
      },
    });

    expect(vendor.slug).toBe('test-company-inc');
  });

  it('should enforce slug uniqueness', async () => {
    const payload = await createMockPayload();

    await payload.create({
      collection: 'vendors',
      data: { companyName: 'Test', slug: 'test-vendor' },
    });

    await expect(
      payload.create({
        collection: 'vendors',
        data: { companyName: 'Test 2', slug: 'test-vendor' },
      })
    ).rejects.toThrow(/slug must be unique/i);
  });
});
```

---

### 4.3 Access Control Testing Pattern

```typescript
describe('Access Control', () => {
  it('should allow admin to create vendor', async () => {
    const payload = await createMockPayload();
    const admin = await createTestUser(payload, 'admin');

    const vendor = await payload.create({
      collection: 'vendors',
      data: vendorFixtures.freeVendor,
      user: admin,
    });

    expect(vendor.id).toBeDefined();
  });

  it('should deny vendor from updating tier', async () => {
    const payload = await createMockPayload();
    const vendor = await createTestVendor(payload, 'free');

    await expect(
      payload.update({
        collection: 'vendors',
        id: vendor.id,
        data: { tier: 'tier2' },
        user: vendor.user,
      })
    ).rejects.toThrow(/access denied/i);
  });
});
```

---

### 4.4 Data Validation Testing Pattern

```typescript
describe('Data Validation', () => {
  it('should validate email format', async () => {
    const payload = await createMockPayload();

    await expect(
      payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test',
          contactEmail: 'invalid-email',
        },
      })
    ).rejects.toThrow(/invalid email/i);
  });

  it('should validate enum values', async () => {
    const payload = await createMockPayload();

    await expect(
      payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test',
          tier: 'invalid-tier', // Not in enum
        },
      })
    ).rejects.toThrow(/invalid tier/i);
  });
});
```

---

### 4.5 Relationship Testing Pattern

```typescript
describe('Relationships', () => {
  it('should resolve vendor relationship in products', async () => {
    const payload = await createMockPayload();
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'Test Product',
        vendor: vendor.id,
      },
    });

    const productWithVendor = await payload.findByID({
      collection: 'products',
      id: product.id,
      depth: 1,
    });

    expect(productWithVendor.vendor.companyName).toBe(vendor.companyName);
  });

  it('should detect orphaned products when vendor is deleted', async () => {
    const payload = await createMockPayload();
    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: { name: 'Test Product', vendor: vendor.id },
    });

    await payload.delete({ collection: 'vendors', id: vendor.id });

    const orphanedProduct = await payload.findByID({
      collection: 'products',
      id: product.id,
    });

    expect(orphanedProduct.vendor).toBeNull(); // or expect deletion cascade
  });
});
```

---

## 5. Test Coverage Targets

### Minimum Coverage by Collection

| Collection     | Statements | Branches | Functions | Lines | Total Tests |
|----------------|-----------|----------|-----------|-------|-------------|
| Vendors        | 95%       | 90%      | 95%       | 95%   | 62+         |
| Products       | 95%       | 90%      | 95%       | 95%   | 69+         |
| Yachts         | 90%       | 85%      | 90%       | 90%   | 70+         |
| Tags           | 95%       | 90%      | 95%       | 95%   | 32+         |
| Categories     | 95%       | 90%      | 95%       | 95%   | 31+         |
| Blog Posts     | 90%       | 85%      | 90%       | 90%   | 47+         |
| Team Members   | 95%       | 90%      | 95%       | 95%   | 29+         |
| Company Info   | 95%       | 90%      | 95%       | 95%   | 36+         |

**Overall Target:** 90%+ coverage across all metrics

**Total Expected Tests:** 376+ tests

---

## 6. Test Execution Strategy

### Development Workflow

```bash
# Run all collection tests
npm test -- __tests__/collections/

# Run specific collection tests
npm test -- __tests__/collections/vendors.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run integration tests
npm test -- __tests__/integration/
```

### CI/CD Integration

```yaml
# .github/workflows/test-backend.yml
name: Backend Tests

on:
  push:
    branches: [main, migration/*]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '22'
      - name: Install dependencies
        run: npm ci
      - name: Run collection tests
        run: npm test -- __tests__/collections/ --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
      - name: Check coverage threshold
        run: npm run test:coverage-check -- 90
```

### Test Execution Order

1. **Unit Tests (Collections)** - Run first, fast execution
2. **Integration Tests** - Run after unit tests pass
3. **Coverage Report** - Generate after all tests complete

### Performance Targets

- **Single test file:** < 5 seconds
- **All collection tests:** < 60 seconds
- **Full test suite (including integration):** < 120 seconds

---

## 7. CI/CD Integration Approach

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm test -- __tests__/collections/ --bail --findRelatedTests
```

### Pull Request Validation

**Required Checks:**
- [ ] All collection tests pass (376+ tests)
- [ ] Coverage meets 90% threshold
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Integration tests pass

### Branch Protection Rules

- Require status checks to pass before merging
- Require tests to pass on `migration/*` branches
- Require coverage report upload

---

## 8. Mock Data & Fixtures Strategy

### Fixture Design Principles

1. **Realistic Data:** Fixtures use real-world examples
2. **Valid by Default:** All fixtures pass validation
3. **Variants Available:** Basic, full, and enhanced variants
4. **Relationship-Ready:** Fixtures include IDs for relationships
5. **Reusable:** Fixtures can be shared across tests

### Mock Data Generation

1. **Rich Text:** Generated using Lexical JSON structure
2. **Arrays:** Generated with configurable element count
3. **Relationships:** Use fixture IDs or create dependent records
4. **Enums:** Use valid enum values from schema
5. **Dates:** Use valid ISO 8601 format

---

## Success Criteria

- [ ] Test suite architecture documented for all 8 collections ✓
- [ ] Test file specifications created (8 collection test files) ✓
- [ ] Test utilities specifications created (3 utility files) ✓
- [ ] Test patterns defined for schema, hooks, access control, validation ✓
- [ ] Test coverage targets specified (minimum 90%) ✓
- [ ] Mock data fixtures designed for all collections ✓
- [ ] Test execution strategy documented ✓
- [ ] CI/CD integration approach specified ✓
- [ ] 376+ total tests planned across all collections ✓
- [ ] All enhanced fields have dedicated test cases ✓
- [ ] Relationship tests cover all reference types ✓

---

## Next Steps

1. **Implementation Phase:** Create actual test files based on these specifications
2. **Mock Setup:** Implement test utilities (testHelpers, fixtures, mockData)
3. **Collection Tests:** Write tests for each collection following patterns
4. **Integration Tests:** Create cross-collection relationship tests
5. **CI/CD Setup:** Configure GitHub Actions workflow
6. **Coverage Validation:** Ensure 90%+ coverage across all metrics

---

## Notes

- All tests use Jest with Payload CMS test utilities
- Mock Payload instance uses in-memory database for speed
- Tests are isolated (no shared state between tests)
- Fixtures are immutable and reusable
- Enhanced fields (certifications, awards, reviews) have comprehensive coverage
- Admin-only access for Tags collection is thoroughly tested
- Relationship integrity is validated in integration tests

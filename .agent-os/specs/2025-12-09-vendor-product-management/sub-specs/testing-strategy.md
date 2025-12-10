# Testing Strategy

## Overview

This feature has **existing E2E tests** that define the expected behavior. The implementation must pass these tests without modifying the test code (unless fixing broken selectors).

## Existing Tests

**File**: `tests/e2e/vendor-onboarding/09-product-management.spec.ts`

| Test | Status | Description |
|------|--------|-------------|
| 9.1 | PASSING | Access product management (tier 2+ only) |
| 9.2 | FAILING | View product list for vendor |
| 9.3 | FAILING | Add new product with all fields |
| 9.4 | FAILING | Edit existing product details |
| 9.5 | FAILING | Delete product with confirmation |
| 9.6 | FAILING | Publish/unpublish product toggle |
| 9.7 | PASSING | Product categories assignment (soft assertions) |

## Testing Approach

### TDD Alignment

Since tests exist before implementation:
1. **Read tests** to understand expected selectors and behavior
2. **Implement** to match test expectations
3. **Run tests** to verify implementation
4. **Fix selectors** if tests use incorrect/outdated selectors

### Test Execution

```bash
# Run all product management tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --reporter=list

# Run specific failing test
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts:55 --reporter=line

# Run with trace for debugging
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --trace=on

# Run with UI for visual debugging
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --ui
```

---

## Test-by-Test Analysis

### Test 9.1: Access Control (PASSING)
**Location**: Line 17
**What it verifies**:
- Tier 2+ vendor can access products page
- Products tab/link visible in dashboard

**Expected selectors** (from test):
```typescript
page.locator('button[role="tab"], a, nav a').filter({ hasText: /Product/i })
```

**Implementation requirement**:
- Existing page passes this test
- No changes needed

---

### Test 9.2: View Product List (FAILING)
**Location**: Line 55
**What it verifies**:
- Seeds products via API
- Navigates to products page
- Seeded products appear in list

**Expected selectors** (from test):
```typescript
page.locator('text=/Test Product 1/i')
page.locator('text=/Test Product 2/i')
```

**Why failing**: Page shows static "No products yet" instead of fetching products

**Implementation requirement**:
- ProductList must fetch from API
- Product names must be visible in DOM

**Selector compatibility**:
- Use product name as visible text in ProductCard
- Ensure name is not truncated (or use `line-clamp` which still allows text matching)

---

### Test 9.3: Add New Product (FAILING)
**Location**: Line 105
**What it verifies**:
- Click "Add Product" button
- Fill form fields
- Save product
- New product appears in list

**Expected selectors** (from test):
```typescript
// Add button
page.locator('button').filter({ hasText: /Add.*Product|New.*Product|Create.*Product/i })

// Form fields
page.locator('input[name*="name"], input[placeholder*="name"]')
page.locator('textarea[name*="description"], textarea[placeholder*="description"]')
page.locator('select[name*="category"], input[name*="category"]')
page.locator('input[name*="model"]')
page.locator('input[name*="price"], input[type="number"]')

// Save button
page.locator('button').filter({ hasText: /Save|Create|Add/ })

// Result
page.locator('text=/Advanced Navigation System Pro/i')
```

**Implementation requirements**:
- Button text must match: "Add New Product" ✓
- Form fields need name attributes:
  - `name="name"` or placeholder containing "name"
  - `name="description"` or placeholder containing "description"
- Save button text: "Create Product" or "Save"

**Recommended form field names**:
```tsx
<Input name="name" placeholder="Product name" />
<Textarea name="description" placeholder="Product description" />
<Input name="shortDescription" placeholder="Short description" />
// Categories can be complex - test handles missing gracefully
```

---

### Test 9.4: Edit Product (FAILING)
**Location**: Line 170
**What it verifies**:
- Seed a product
- Click edit button
- Modify product name
- Save changes
- Updated name appears

**Expected selectors** (from test):
```typescript
// Edit button
page.locator('button').filter({ hasText: /Edit/i })

// Name input
page.locator('input[name*="name"]')

// Save button
page.locator('button').filter({ hasText: /Save|Update/ })

// Result
page.locator('text=/Updated Product Name/i')
```

**Implementation requirements**:
- Edit button with text "Edit"
- Form pre-populates with existing name
- Save button works for update

---

### Test 9.5: Delete Product (FAILING)
**Location**: Line 219
**What it verifies**:
- Seed a product
- Click delete button
- Confirm deletion
- Product removed from list

**Expected selectors** (from test):
```typescript
// Delete button
page.locator('button').filter({ hasText: /Delete|Remove/i })

// Confirm button
page.locator('button').filter({ hasText: /Confirm|Yes|Delete/i })

// Result (not visible)
page.locator('text=/Product to Delete/i')
```

**Implementation requirements**:
- Delete button with text "Delete" or icon with accessible label
- Confirmation dialog with "Delete" or "Confirm" button
- Product must be removed from DOM after deletion

**Note**: Test looks for button with Delete text. If using icon-only button:
```tsx
<Button aria-label="Delete product">
  <Trash2 className="h-4 w-4" />
</Button>
```
This won't match `hasText: /Delete/i`. Options:
1. Add visible "Delete" text
2. Use sr-only span: `<span className="sr-only">Delete</span>`

---

### Test 9.6: Publish Toggle (FAILING)
**Location**: Line 268
**What it verifies**:
- Seed unpublished product
- Toggle publish status
- Verify status change

**Expected selectors** (from test):
```typescript
// Toggle (checkbox or switch)
page.locator('input[type="checkbox"][name*="publish"], [role="switch"][aria-label*="publish"]')

// Alternative button
page.locator('button').filter({ hasText: /Publish|Make.*Public/i })

// Status indicator
page.locator('text=/Published|Live|Public/i')
```

**Implementation requirements**:
- Switch component with `aria-label="Publish product"` or `name="publish"`
- OR Button with "Publish" text
- Badge showing "Published" status

**shadcn Switch compatibility**:
```tsx
<Switch
  checked={product.published}
  onCheckedChange={...}
  aria-label="Publish product"  // Matches [aria-label*="publish"]
/>
```

---

### Test 9.7: Categories (PASSING)
**Location**: Line 320
**What it verifies**:
- Category selector in form
- Can select categories

Uses soft assertions - passes even if selectors don't match.

---

## Selector Compatibility Matrix

| Element | Test Selector | Recommended Implementation |
|---------|---------------|---------------------------|
| Products nav | `hasText: /Product/i` | Already exists |
| Add button | `hasText: /Add.*Product/i` | `"Add New Product"` |
| Product name | `text=/Test Product 1/i` | `<CardTitle>{product.name}</CardTitle>` |
| Edit button | `hasText: /Edit/i` | `<Button>Edit</Button>` |
| Delete button | `hasText: /Delete|Remove/i` | `<Button>Delete</Button>` or button with sr-only text |
| Confirm delete | `hasText: /Confirm|Yes|Delete/i` | `<Button>Delete</Button>` in dialog |
| Name input | `input[name*="name"]` | `<Input name="name" />` |
| Description | `textarea[name*="description"]` | `<Textarea name="description" />` |
| Save button | `hasText: /Save|Create|Add/` | `"Create Product"` or `"Save Changes"` |
| Publish toggle | `[role="switch"][aria-label*="publish"]` | `<Switch aria-label="Publish product" />` |
| Status badge | `text=/Published|Live|Public/i` | `<Badge>Published</Badge>` |

---

## Test Data Management

### Seed Helpers

Tests use helpers from `tests/e2e/helpers/seed-api-helpers.ts`:
- `seedVendors(page, vendors)` - Creates test vendors
- `seedProducts(page, products)` - Creates test products
- `createTestVendor(overrides)` - Generates vendor data
- `createTestProduct(overrides)` - Generates product data

### Test Products API

Existing endpoint: `app/api/test/products/seed/route.ts`
- Bulk creates products for testing
- Used by E2E tests before each test

---

## Coverage Targets

| Type | Target | Minimum |
|------|--------|---------|
| E2E | 100% pass | 100% (6/6 failing tests pass) |
| Unit | 80% | 70% |
| Integration | 80% | 70% |

### What to Unit Test

1. **ProductService methods**:
   - getVendorProducts filters correctly
   - createProduct validates and creates
   - updateProduct validates ownership
   - deleteProduct validates ownership
   - togglePublish updates field

2. **Validation schemas**:
   - CreateProductSchema accepts valid data
   - CreateProductSchema rejects invalid data
   - UpdateProductSchema allows partial updates

### What to Integration Test

1. **API routes**:
   - GET returns vendor's products only
   - POST creates with correct vendor relation
   - PUT requires ownership
   - DELETE requires ownership
   - PATCH toggles publish status

---

## Running Tests

### Prerequisites

1. Development server running: `npm run dev`
2. Test database has seed data capability
3. Environment variables set

### Commands

```bash
# Full E2E suite
npm run test:e2e

# Just product management
DISABLE_EMAILS=true npx playwright test 09-product-management

# Specific test by line number
DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts:55

# With debugging
DISABLE_EMAILS=true npx playwright test 09-product-management --debug

# Generate trace on failure
DISABLE_EMAILS=true npx playwright test 09-product-management --trace=retain-on-failure
```

### Viewing Traces

```bash
npx playwright show-trace test-results/*/trace.zip
```

---

## Troubleshooting Test Failures

### Test times out
- Check if API endpoints are implemented
- Check if selectors match
- Increase timeout if needed (already at 90s)

### Element not found
1. Open Playwright UI: `npx playwright test --ui`
2. Use "Pick locator" to find correct selector
3. Compare with test expectation
4. Fix component or selector

### API returns 404/500
1. Check route file exists at correct path
2. Check route exports GET/POST/etc
3. Check error logs in terminal

### Product not appearing
1. Verify API returns product
2. Check ProductList receives data
3. Check ProductCard renders name
4. Use React DevTools to inspect state

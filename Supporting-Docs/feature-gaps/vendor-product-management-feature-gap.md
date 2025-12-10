# Vendor Product Management - Feature Gap Analysis

**Date**: 2024-12-09
**Status**: Feature Not Implemented
**Impact**: 5 E2E tests failing (Tests 9.2-9.6)
**Priority**: High - Core vendor functionality

---

## Executive Summary

The **Product Management** feature for vendors is currently a **placeholder implementation**. Tests exist that define the expected behavior, but the underlying functionality has not been built. The UI page exists at `/vendor/dashboard/products` but only displays a static "No products yet" message without actually fetching or displaying any products.

---

## Current State

### What Exists

1. **Payload CMS Products Collection** (`payload/collections/Products.ts`)
   - Full schema with 1400+ lines of field definitions
   - Access control configured (vendors can CRUD their own products)
   - Tier validation hook (requires Tier 2+ for product creation)
   - Relationship to vendors collection

2. **Test Seed API** (`app/api/test/products/seed/route.ts`)
   - Bulk product creation for E2E tests
   - Vendor relationship support
   - Works correctly (verified via curl)

3. **Placeholder UI** (`app/(site)/vendor/dashboard/products/page.tsx`)
   - Basic page structure
   - Tier access check (redirects free tier)
   - Static "No products yet" message
   - "Add New Product" button (non-functional)

### What's Missing

1. **No API endpoints** for vendor product management:
   - `GET /api/portal/vendors/[id]/products` - List vendor's products
   - `POST /api/portal/vendors/[id]/products` - Create product
   - `PUT /api/portal/vendors/[id]/products/[productId]` - Update product
   - `DELETE /api/portal/vendors/[id]/products/[productId]` - Delete product

2. **No product fetching** in the dashboard page
3. **No product list component** to display products
4. **No product form component** for create/edit
5. **No delete confirmation dialog**
6. **No publish/unpublish toggle functionality**

---

## Failing Tests

All tests are in: `tests/e2e/vendor-onboarding/09-product-management.spec.ts`

### Test 9.1: Access product management (tier 2+ only)
**Status**: PASSING
**Location**: Line 17
**What it tests**: Tier 2+ vendors can access the products page
**Current behavior**: Works - page loads and shows tier restriction for free tier

### Test 9.2: View product list for vendor
**Status**: FAILING
**Location**: Line 55
**What it tests**:
- Seed products via API
- Navigate to products page
- Verify seeded products appear in list

**Expected behavior**:
```typescript
// Seeds 2 products for the vendor
const products = [
  createTestProduct({ name: 'Test Product 1', vendor: vendorId, published: true }),
  createTestProduct({ name: 'Test Product 2', vendor: vendorId, published: false }),
];
await seedProducts(page, products);

// Expects products to be visible
const product1 = page.locator('text=/Test Product 1/i');
const product2 = page.locator('text=/Test Product 2/i');
expect(product1Visible || product2Visible).toBeTruthy();
```

**Actual behavior**: Page shows "No products yet" - doesn't fetch from database

**Implementation needed**:
- API endpoint to fetch vendor's products
- Product list component with product cards
- Display product name, status (published/draft), and actions

---

### Test 9.3: Add new product with all fields
**Status**: FAILING
**Location**: Line 105
**What it tests**:
- Click "Add New Product" button
- Fill form fields (name, description, category, model, price)
- Save product
- Verify product appears in list

**Expected behavior**:
```typescript
// Click add button
const addBtn = page.locator('button').filter({ hasText: /Add.*Product|New.*Product|Create.*Product/i });
await addBtn.click();

// Fill fields
await nameInput.fill('Advanced Navigation System Pro');
await descInput.fill('State-of-the-art navigation system...');
await categoryInput.click(); // Select category
await modelInput.fill('NAV-PRO-2024');
await priceInput.fill('25000');

// Save and verify
await saveBtn.click();
const newProduct = page.locator('text=/Advanced Navigation System Pro/i');
await expect(newProduct).toBeVisible();
```

**Implementation needed**:
- Product creation form (modal or page)
- Form fields: name, description (richText), category, model, price
- Category selector (relationship to categories collection)
- Form validation
- API endpoint to create product
- Success/error feedback

---

### Test 9.4: Edit existing product details
**Status**: FAILING
**Location**: Line 170
**What it tests**:
- Seed a product
- Navigate to products page
- Click edit button on product
- Modify product name
- Save changes
- Verify updated name appears

**Expected behavior**:
```typescript
// Find and click edit
const editBtn = page.locator('button').filter({ hasText: /Edit/i });
await editBtn.click();

// Edit name
await nameInput.fill('Updated Product Name');
await saveBtn.click();

// Verify update
const updatedProduct = page.locator('text=/Updated Product Name/i');
await expect(updatedProduct).toBeVisible();
```

**Implementation needed**:
- Edit button on each product card
- Pre-populated edit form
- API endpoint to update product
- Optimistic UI update or refetch

---

### Test 9.5: Delete product with confirmation
**Status**: FAILING
**Location**: Line 219
**What it tests**:
- Seed a product
- Navigate to products page
- Click delete button
- Confirm deletion in dialog
- Verify product is removed from list

**Expected behavior**:
```typescript
// Click delete
const deleteBtn = page.locator('button').filter({ hasText: /Delete|Remove/i });
await deleteBtn.click();

// Confirm deletion
const confirmBtn = page.locator('button').filter({ hasText: /Confirm|Yes|Delete/i });
await confirmBtn.click();

// Verify removed
const deletedProduct = page.locator('text=/Product to Delete/i');
const isGone = !(await deletedProduct.isVisible());
expect(isGone).toBeTruthy();
```

**Implementation needed**:
- Delete button on each product card
- Confirmation dialog (AlertDialog component)
- API endpoint to delete product
- UI update after deletion

---

### Test 9.6: Publish/unpublish product toggle
**Status**: FAILING
**Location**: Line 268
**What it tests**:
- Seed an unpublished product
- Navigate to products page
- Toggle publish status
- Verify status change

**Expected behavior**:
```typescript
// Look for toggle or button
const publishToggle = page.locator('input[type="checkbox"][name*="publish"]');
const publishBtn = page.locator('button').filter({ hasText: /Publish|Make.*Public/i });

// Toggle to published
await publishToggle.check();
expect(await publishToggle.isChecked()).toBeTruthy();

// Or click button and verify status
await publishBtn.click();
const publishedStatus = page.locator('text=/Published|Live|Public/i');
await expect(publishedStatus).toBeVisible();
```

**Implementation needed**:
- Publish toggle (switch component) or button on each product
- API endpoint to update publish status
- Visual indicator of published/draft status

---

### Test 9.7: Product categories assignment (multi-select)
**Status**: PASSING (soft assertions)
**Location**: Line 320
**What it tests**: Category selection in product form

---

## Implementation Specification

### API Endpoints Required

```typescript
// GET /api/portal/vendors/[id]/products
// Returns all products for the authenticated vendor
interface GetProductsResponse {
  products: Product[];
  total: number;
}

// POST /api/portal/vendors/[id]/products
// Creates a new product for the vendor
interface CreateProductRequest {
  name: string;
  description: string; // Will be converted to Lexical JSON
  category?: string;
  categories?: string[]; // Category IDs
  price?: string;
  published?: boolean;
  // ... other fields from Products collection
}

// PUT /api/portal/vendors/[id]/products/[productId]
// Updates an existing product
interface UpdateProductRequest {
  name?: string;
  description?: string;
  published?: boolean;
  // ... partial product fields
}

// DELETE /api/portal/vendors/[id]/products/[productId]
// Deletes a product (must belong to vendor)
```

### UI Components Required

1. **ProductList** - Grid/list of product cards
2. **ProductCard** - Individual product display with actions
3. **ProductForm** - Create/edit form (modal or page)
4. **ProductDeleteDialog** - Confirmation dialog
5. **PublishToggle** - Switch to toggle publish status

### Access Control

- Only Tier 2+ vendors can access product management
- Vendors can only CRUD their own products
- Publish status may require admin approval (check requirements)

---

## Existing Infrastructure to Leverage

1. **Payload CMS Products Collection** - Already has full schema and access control
2. **Test Seed API** - Pattern for bulk operations
3. **Vendor Portal API Pattern** - See `app/api/portal/vendors/[id]/route.ts`
4. **UI Components** - shadcn/ui components (Card, Button, Dialog, Switch, Form)
5. **Auth Context** - `useAuth()` provides vendor ID and tier

---

## Recommended Implementation Order

1. **API: List products** - GET endpoint
2. **UI: Product list** - Display existing products
3. **API: Create product** - POST endpoint
4. **UI: Product form** - Create new product
5. **API: Update product** - PUT endpoint
6. **UI: Edit functionality** - Edit existing product
7. **API: Delete product** - DELETE endpoint
8. **UI: Delete confirmation** - Delete with confirmation
9. **UI: Publish toggle** - Quick publish/unpublish

---

## Test Commands

```bash
# Run all product management tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --reporter=list

# Run specific test
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts:55 --reporter=line

# Run with trace for debugging
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --trace=on
```

---

## Related Files

| File | Purpose |
|------|---------|
| `tests/e2e/vendor-onboarding/09-product-management.spec.ts` | E2E tests defining expected behavior |
| `tests/e2e/helpers/seed-api-helpers.ts` | Test helper for seeding products |
| `app/api/test/products/seed/route.ts` | Test seed API |
| `payload/collections/Products.ts` | Payload CMS collection definition |
| `app/(site)/vendor/dashboard/products/page.tsx` | Current placeholder page |
| `lib/types.ts` | TypeScript types (may need Product type) |

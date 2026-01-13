# Task: test-e2e

## Metadata
- **Phase**: 4 - Validation
- **Agent**: pwtester
- **Estimated Time**: 45-60 min
- **Dependencies**: int-form-assembly, int-tier-gating
- **Status**: pending

## Description

Create end-to-end tests using Playwright for critical user journeys: creating products, editing products, validation errors, and tier gating.

## Specifics

### Files to Create
- `e2e/vendor-product-form.spec.ts` - Main E2E test file

### Files to Reference
- `sub-specs/testing-strategy.md` - E2E test specifications
- Existing E2E tests in `e2e/` directory

### Technical Details

**Test Scenarios:**

1. **Create Product - Basic Fields Only:**
   - Login as tier2 vendor
   - Navigate to create product
   - Fill name and description
   - Submit and verify success

2. **Create Product - With Images:**
   - Add image via URL
   - Set as main image
   - Add alt text
   - Submit and verify

3. **Create Product - With Specifications:**
   - Add multiple spec rows
   - Fill label/value
   - Submit and verify

4. **Create Product - Full Form:**
   - Fill all sections
   - Submit and verify all data persisted

5. **Edit Existing Product:**
   - Load product in edit mode
   - Verify form populated
   - Make changes
   - Submit and verify updates

6. **Validation Errors:**
   - Submit empty form
   - Verify error messages shown
   - Verify focus on first error

7. **Tier Gating - Free Tier:**
   - Login as free vendor
   - Verify locked sections
   - Verify upgrade prompts

8. **Tier Gating - Tier 2:**
   - Login as tier2 vendor
   - Verify all sections unlocked

## Acceptance Criteria

- [ ] All E2E tests pass in CI
- [ ] Tests run in < 2 minutes total
- [ ] Tests are not flaky
- [ ] Tests cover critical paths
- [ ] Tests handle loading states
- [ ] Tests clean up test data

## Testing Requirements

```typescript
// e2e/vendor-product-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Vendor Product Form', () => {
  test.beforeEach(async ({ page }) => {
    // Login as tier2 vendor
  });

  test('creates product with basic info only', async ({ page }) => {});
  test('creates product with images', async ({ page }) => {});
  test('creates product with specifications', async ({ page }) => {});
  test('edits existing product', async ({ page }) => {});
  test('shows validation errors', async ({ page }) => {});
});

test.describe('Tier Gating', () => {
  test('free tier sees locked sections', async ({ page }) => {});
  test('tier2 sees all sections unlocked', async ({ page }) => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `sub-specs/testing-strategy.md` - E2E test specs
- Existing E2E tests for patterns

### Pattern Constraints
- Use page object pattern if complexity warrants
- Use data-testid for reliable selectors
- Handle async operations properly
- Clean up created data

## Implementation Notes

```typescript
// e2e/vendor-product-form.spec.ts
import { test, expect, Page } from '@playwright/test';

// Helper to login as vendor with specific tier
async function loginAsVendor(page: Page, tier: 'free' | 'tier1' | 'tier2') {
  // Implementation depends on auth system
  // Could use fixture data or API to set tier
  await page.goto('/login');
  await page.fill('[name="email"]', `vendor-${tier}@test.com`);
  await page.fill('[name="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Vendor Product Form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVendor(page, 'tier2');
  });

  test('creates product with basic info only', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    // Fill basic fields
    await page.fill('[name="name"]', 'Test Navigation System');
    await page.fill('[name="description"]', 'A comprehensive navigation solution for superyachts');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('creates product with images', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    // Fill basic info
    await page.fill('[name="name"]', 'Product with Images');
    await page.fill('[name="description"]', 'Description');

    // Expand images section
    await page.click('[data-testid="images-section-trigger"]');

    // Add image
    await page.fill('[data-testid="image-url-input"]', 'https://via.placeholder.com/400');
    await page.click('[data-testid="add-image-button"]');

    // Verify image added
    await expect(page.locator('[data-testid="image-item"]')).toHaveCount(1);

    // Fill alt text
    await page.fill('[name="images.0.altText"]', 'Product image');

    // Submit
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('creates product with specifications', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    await page.fill('[name="name"]', 'Product with Specs');
    await page.fill('[name="description"]', 'Description');

    // Expand specifications section
    await page.click('[data-testid="specifications-section-trigger"]');

    // Add specification
    await page.click('[data-testid="add-specification"]');
    await page.fill('[name="specifications.0.label"]', 'Weight');
    await page.fill('[name="specifications.0.value"]', '5kg');

    // Add another
    await page.click('[data-testid="add-specification"]');
    await page.fill('[name="specifications.1.label"]', 'Dimensions');
    await page.fill('[name="specifications.1.value"]', '10x20x30cm');

    // Submit
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('edits existing product', async ({ page }) => {
    // First create a product (or use seeded data)
    const productId = await createTestProduct(page);

    await page.goto(`/dashboard/products/${productId}/edit`);

    // Verify form populated
    await expect(page.locator('[name="name"]')).not.toHaveValue('');

    // Edit name
    await page.fill('[name="name"]', 'Updated Product Name');

    // Submit
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Product updated successfully')).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    // Submit without required fields
    await page.click('button[type="submit"]');

    // Verify error messages
    await expect(page.locator('text=Product name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });
});

test.describe('Tier Gating', () => {
  test('free tier sees locked sections', async ({ page }) => {
    await loginAsVendor(page, 'free');
    await page.goto('/dashboard/products/new');

    // Check locked sections
    await expect(page.locator('[data-testid="images-section"][data-locked="true"]')).toBeVisible();
    await expect(page.locator('text=Requires Tier 2')).toBeVisible();
  });

  test('tier2 sees all sections unlocked', async ({ page }) => {
    await loginAsVendor(page, 'tier2');
    await page.goto('/dashboard/products/new');

    // Check all sections accessible
    await expect(page.locator('text=Requires Tier 2')).not.toBeVisible();
  });
});
```

## Related Files
- `playwright.config.ts` - Playwright configuration
- `e2e/` - Existing E2E tests
- `.env.e2e` - E2E environment variables

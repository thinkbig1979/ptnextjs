# Task: Write E2E Tests for Location Discovery Features

## Metadata
- **Task ID**: test-e2e
- **Phase**: 5 - Testing
- **Agent**: test-architect
- **Estimated Time**: 60-90 min
- **Dependencies**: integrate-product-page, enhance-vendors-client
- **Status**: pending

## Description

Write comprehensive E2E tests for the complete location discovery feature using Playwright.

## Specifics

### Test File to Create
`tests/e2e/location-discovery.spec.ts`

### Test Scenarios

#### Scenario 1: Vendors Near You on Product Page

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vendors Near You', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
  });

  test('shows "Set location" prompt when no location saved', async ({ page }) => {
    await page.goto('/products/some-product');

    const vendorsNearYou = page.locator('[data-testid="vendors-near-you"]');
    await expect(vendorsNearYou).toBeVisible();
    await expect(vendorsNearYou.getByText('Set your location')).toBeVisible();
    await expect(vendorsNearYou.getByRole('link', { name: 'Find Vendors' })).toBeVisible();
  });

  test('shows nearby vendors when location is set', async ({ page }) => {
    // Set location in localStorage
    await page.evaluate(() => {
      localStorage.setItem('pt_user_location', JSON.stringify({
        latitude: 43.7384,
        longitude: 7.4246,
        displayName: 'Monaco',
        timestamp: Date.now()
      }));
    });

    await page.goto('/products/some-product');

    const vendorsNearYou = page.locator('[data-testid="vendors-near-you"]');
    await expect(vendorsNearYou.getByRole('link')).toHaveCount(/* at least 1 */);
  });

  test('clicking vendor card navigates to vendor page', async ({ page }) => {
    // Setup and navigate
    // Click vendor card
    // Verify navigation to /vendors/[slug]
  });

  test('excludes current product vendor from results', async ({ page }) => {
    // Verify current vendor not shown
  });
});
```

#### Scenario 2: Combined Search on Vendors Page

```typescript
test.describe('Vendor Category Search', () => {
  test('filters vendors by product category', async ({ page }) => {
    await page.goto('/vendors');

    // Select category from dropdown
    await page.locator('[data-testid="category-select"]').click();
    await page.getByText('Navigation').click();

    // Verify URL params updated
    await expect(page).toHaveURL(/productCategory=navigation/);

    // Verify filtered results
  });

  test('combines location and category filters', async ({ page }) => {
    // Set location filter
    // Set category filter
    // Verify combined filtering
  });

  test('clear filters resets category selection', async ({ page }) => {
    // Apply filters
    // Click clear
    // Verify reset
  });

  test('URL params persist on page refresh', async ({ page }) => {
    await page.goto('/vendors?productCategory=navigation&location=Monaco');

    // Verify filters applied from URL
    // Refresh page
    // Verify filters still applied
  });
});
```

#### Scenario 3: Location Persistence

```typescript
test.describe('Location Persistence', () => {
  test('remembers location across page navigation', async ({ page }) => {
    // Set location on vendors page
    // Navigate to product page
    // Verify location is used
  });

  test('clears expired location (30+ days)', async ({ page }) => {
    // Set old location in localStorage
    await page.evaluate(() => {
      localStorage.setItem('pt_user_location', JSON.stringify({
        latitude: 43.7384,
        longitude: 7.4246,
        displayName: 'Monaco',
        timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days ago
      }));
    });

    await page.goto('/products/some-product');

    // Verify "Set location" prompt shown (location was cleared)
  });
});
```

### Data Test IDs Required
Add these to components:
- `data-testid="vendors-near-you"` on VendorsNearYou Card
- `data-testid="category-select"` on CategorySelect
- `data-testid="nearby-vendor-card"` on NearbyVendorCard

## Acceptance Criteria

- [ ] All E2E tests passing
- [ ] Tests run in CI pipeline
- [ ] Tests use E2E environment (.env.e2e)
- [ ] Screenshots captured on failure
- [ ] Tests are not flaky (stable selectors)

## Testing Requirements

Run tests:
```bash
npm run test:e2e -- tests/e2e/location-discovery.spec.ts
```

## Related Files
- All components with data-testid attributes
- `playwright.config.ts`
- `.env.e2e` - Test environment variables

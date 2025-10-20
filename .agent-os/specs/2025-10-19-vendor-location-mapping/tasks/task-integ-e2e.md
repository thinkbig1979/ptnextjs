# Task: Comprehensive E2E Testing with Playwright

**Task ID**: integ-e2e
**Phase**: Phase 4 - Integration & Testing
**Agent**: test-architect, qa-specialist
**Estimated Time**: 3 hours
**Dependencies**: integ-data-flow

## Objective

Execute comprehensive end-to-end testing using Playwright to validate all user workflows, cross-browser compatibility, and accessibility requirements for the vendor location mapping feature.

## Context Requirements

**Files to Review**:
- All previous Playwright test files created during implementation
- `/home/edwin/development/ptnextjs/playwright.config.ts` (Playwright configuration)
- `/home/edwin/development/ptnextjs/CLAUDE.md` (testing requirements)

**Testing Principle**: Per CLAUDE.md - "never assume success, always verify. Use playwright to double check assumptions"

## Test Suite Organization

### Test File Structure

```
tests/e2e/
├── vendor-map.spec.ts              (VendorMap component)
├── vendor-location-card.spec.ts    (VendorLocationCard component)
├── location-search.spec.ts         (LocationSearchFilter component)
├── vendor-detail-map.spec.ts       (Vendor detail page integration)
├── vendor-list-search.spec.ts      (Vendor list page integration)
├── data-flow-validation.spec.ts    (End-to-end data flow)
└── accessibility.spec.ts           (Accessibility testing - NEW)
```

## Comprehensive Test Scenarios

### Test Suite 1: User Workflows

Create: `/home/edwin/development/ptnextjs/tests/e2e/user-workflows.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vendor Location Mapping - User Workflows', () => {
  test('Workflow 1: User views vendor with location on detail page', async ({ page }) => {
    // Navigate to vendor with full location data
    await page.goto('/vendors/test-full-location');

    // Verify vendor name
    await expect(page.locator('h1')).toContainText('Test Vendor - Full Location');

    // Verify location section exists
    await expect(page.locator('h2', { hasText: 'Location' })).toBeVisible();

    // Verify map loads
    await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

    // Verify location card
    await expect(page.locator('[data-testid="vendor-location-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Monaco');

    // Click marker to show popup
    await page.locator('.leaflet-marker-icon').click();
    await expect(page.locator('.leaflet-popup')).toBeVisible();

    // Click Get Directions
    const directionsLink = page.locator('[data-testid="get-directions"]');
    await expect(directionsLink).toBeVisible();

    // Take screenshot for documentation
    await page.screenshot({
      path: 'test-results/workflow-vendor-detail.png',
      fullPage: true
    });
  });

  test('Workflow 2: User searches for nearby vendors', async ({ page }) => {
    // Navigate to vendors page
    await page.goto('/vendors');

    // Initial state - all vendors visible
    const initialCount = await page.locator('[data-testid="vendor-card"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // Enter user location (Monaco)
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');

    // Set distance to 100km
    await page.locator('[data-testid="distance-slider"]').fill('100');

    // Verify distance value updated
    await expect(page.locator('[data-testid="distance-value"]')).toContainText('100 km');

    // Click search
    await page.click('[data-testid="search-button"]');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify results shown
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();

    // Verify distance badges appear
    const firstCard = page.locator('[data-testid="vendor-card"]').first();
    await expect(firstCard.locator('[data-testid="vendor-distance"]')).toBeVisible();

    // Verify sorted by distance (first should be closest)
    const firstDistance = await firstCard.locator('[data-testid="vendor-distance"]').textContent();
    expect(firstDistance).toContain('km');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/workflow-location-search.png',
      fullPage: true
    });
  });

  test('Workflow 3: User adjusts search distance', async ({ page }) => {
    await page.goto('/vendors');

    // Perform initial search
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.locator('[data-testid="distance-slider"]').fill('50');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);

    const count50km = await page.locator('[data-testid="vendor-card"]').count();

    // Increase distance
    await page.locator('[data-testid="distance-slider"]').fill('200');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);

    const count200km = await page.locator('[data-testid="vendor-card"]').count();

    // More vendors should appear with larger radius
    expect(count200km).toBeGreaterThanOrEqual(count50km);
  });

  test('Workflow 4: User resets search filters', async ({ page }) => {
    await page.goto('/vendors');

    const initialCount = await page.locator('[data-testid="vendor-card"]').count();

    // Perform search
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);

    // Verify reset button appears
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible();

    // Click reset
    await page.click('[data-testid="reset-button"]');
    await page.waitForTimeout(500);

    // All vendors should show again
    const resetCount = await page.locator('[data-testid="vendor-card"]').count();
    expect(resetCount).toBe(initialCount);

    // Distance badges should not be visible
    await expect(page.locator('[data-testid="vendor-distance"]')).not.toBeVisible();

    // Reset button should be hidden
    await expect(page.locator('[data-testid="reset-button"]')).not.toBeVisible();
  });

  test('Workflow 5: User clicks vendor from search results', async ({ page }) => {
    await page.goto('/vendors');

    // Search for nearby vendors
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(500);

    // Click first vendor card
    const firstCard = page.locator('[data-testid="vendor-card"]').first();
    const vendorName = await firstCard.locator('h3').textContent();
    await firstCard.locator('a').click();

    // Should navigate to vendor detail page
    await expect(page).toHaveURL(/\/vendors\/[a-z0-9-]+/);

    // Verify vendor name matches
    await expect(page.locator('h1')).toContainText(vendorName || '');

    // Verify map displays
    await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();
  });
});
```

### Test Suite 2: Cross-Browser Testing

```typescript
// Run same tests across browsers using Playwright projects
// In playwright.config.ts:
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

Run cross-browser tests:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

### Test Suite 3: Accessibility Testing

Create: `/home/edwin/development/ptnextjs/tests/e2e/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility - Vendor Location Mapping', () => {
  test('VendorMap component is accessible', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="vendor-map"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('VendorLocationCard is accessible', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="vendor-location-card"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('LocationSearchFilter is accessible', async ({ page }) => {
    await page.goto('/vendors');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="location-search-filter"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works for location search', async ({ page }) => {
    await page.goto('/vendors');

    // Tab to location input
    await page.keyboard.press('Tab');
    // Should focus on location input (verify by checking activeElement)

    // Type coordinates
    await page.keyboard.type('43.7384, 7.4246');

    // Press Enter to search
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);

    // Search should execute
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
  });

  test('map controls are keyboard accessible', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    // Wait for map to load
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

    // Check zoom controls are keyboard accessible
    await page.locator('.leaflet-control-zoom-in').focus();
    await page.keyboard.press('Enter');

    // Map should zoom in (verify by checking zoom level change)
    await page.waitForTimeout(500);
  });
});
```

Install accessibility testing:
```bash
npm install --save-dev @axe-core/playwright
```

### Test Suite 4: Performance Testing

Create: `/home/edwin/development/ptnextjs/tests/e2e/performance.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance - Vendor Location Mapping', () => {
  test('vendor detail page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/vendors/test-full-location');

    // Wait for map to fully load
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('location search filters 100+ vendors quickly', async ({ page }) => {
    await page.goto('/vendors');

    const startTime = Date.now();

    // Perform search
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.click('[data-testid="search-button"]');

    // Wait for results
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    console.log(`Search time: ${searchTime}ms`);
    expect(searchTime).toBeLessThan(1000); // Should filter in < 1 second
  });

  test('map initialization does not block page render', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    // Page content should be visible before map loads
    await expect(page.locator('h1')).toBeVisible({ timeout: 1000 });

    // Map loads asynchronously
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });
});
```

## Test Execution Plan

### 1. Run All Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI mode for debugging
npx playwright test --ui

# Run specific test file
npx playwright test vendor-map.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with specific project (browser)
npx playwright test --project=chromium
```

### 2. Generate Test Report

```bash
# Run tests and generate HTML report
npx playwright test --reporter=html

# Open report
npx playwright show-report
```

### 3. Visual Regression Testing

```bash
# Update baseline screenshots
npx playwright test --update-snapshots

# Run visual regression tests
npx playwright test --grep="@visual"
```

### 4. Parallel Execution

```bash
# Run tests in parallel (faster)
npx playwright test --workers=4

# Run tests serially (debugging)
npx playwright test --workers=1
```

## Acceptance Criteria

### Test Coverage
- [ ] All user workflows tested
- [ ] All components tested in isolation
- [ ] All page integrations tested
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing complete (iOS, Android)
- [ ] Accessibility testing complete (WCAG 2.1 AA)
- [ ] Performance benchmarks met

### Test Results
- [ ] All tests pass on Chromium
- [ ] All tests pass on Firefox
- [ ] All tests pass on WebKit (Safari)
- [ ] All tests pass on mobile browsers
- [ ] No accessibility violations
- [ ] Performance targets met (<3s page load, <1s search)

### Test Quality
- [ ] Tests are deterministic (no flakiness)
- [ ] Tests have proper waits (no arbitrary timeouts)
- [ ] Tests use data-testid selectors (not brittle CSS selectors)
- [ ] Tests include assertions for all critical functionality
- [ ] Tests include screenshots for visual verification
- [ ] Tests include descriptive error messages

## Test Results Documentation

Create: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/e2e-test-results.md`

Include:
- Test execution date
- Browser/device matrix with pass/fail status
- Performance metrics (page load, search time)
- Accessibility scan results
- Screenshots of key workflows
- Any failures and resolutions
- Recommendations for improvements

## Common Test Issues and Fixes

### Issue: Map not loading in tests
**Fix**: Increase timeout for map container visibility
```typescript
await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
```

### Issue: Flaky distance calculation tests
**Fix**: Add tolerance to distance comparisons
```typescript
const distance = parseFloat(distanceText?.match(/[\d.]+/)?.[0] || '0');
expect(distance).toBeGreaterThan(0);
expect(distance).toBeLessThan(5); // Within 5km margin
```

### Issue: Tests fail on slow networks
**Fix**: Set global timeout in playwright.config.ts
```typescript
export default defineConfig({
  timeout: 30000, // 30 second timeout
});
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Notes

- Run tests in CI/CD pipeline before deployment
- Keep test data (test vendors) consistent across environments
- NO API KEY REQUIRED - Leaflet.js with OpenFreeMap is completely free
- Take screenshots on failures for debugging
- Monitor test execution time (optimize slow tests)
- Update tests when features change
- Review test reports regularly for flakiness

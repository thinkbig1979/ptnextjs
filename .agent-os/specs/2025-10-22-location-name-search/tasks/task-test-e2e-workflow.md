# Task: test-e2e-workflow - End-to-End Workflow Testing

**Metadata:**
- **Task ID:** test-e2e-workflow
- **Phase:** Phase 4: Frontend-Backend Integration
- **Agent:** test-architect
- **Estimated Time:** 30-35 min
- **Dependencies:** integ-frontend-backend
- **Status:** Pending
- **Priority:** Critical

## Description

Create and execute comprehensive end-to-end tests using Playwright to validate the complete location search feature from user interaction to vendor filtering in a real browser environment.

## Specifics

**E2E Test Scenarios:**

1. **Simple Search Workflow:**
   - User types "Monaco" in location search
   - System debounces input (300ms)
   - Single result returned
   - Coordinates auto-applied
   - Vendors filtered automatically
   - Verify filtered vendor list displayed

2. **Ambiguous Search Workflow:**
   - User types "Paris" in location search
   - Multiple results returned
   - Dialog opens with result list
   - User selects "Paris, France"
   - Dialog closes
   - Filter applied
   - Verify vendors near Paris, France displayed

3. **Regional Search Workflow:**
   - User types "California" in location search
   - Regional results returned
   - Dialog shows multiple California locations
   - User selects specific location
   - Filter applied correctly

4. **Postal Code Search Workflow:**
   - User types "90210" in location search
   - Postal code geocoded
   - Results show Beverly Hills, CA
   - Filter applied to that location

5. **Advanced Coordinate Input Workflow:**
   - User clicks "Advanced" to expand collapsible
   - User enters latitude: 43.7384
   - User enters longitude: 7.4246
   - Filter applied based on coordinates
   - Verify vendors near Monaco displayed

6. **Distance Slider Workflow:**
   - User applies location filter (Monaco)
   - Initial distance: 100 km
   - User adjusts slider to 50 km
   - Vendor list updates in real-time
   - Verify only vendors within 50 km displayed

7. **Reset Workflow:**
   - User applies location filter
   - User adjusts distance slider
   - User clicks "Reset Filter"
   - All inputs cleared
   - All vendors displayed again
   - Verify complete reset

8. **Error Handling Workflow:**
   - User types invalid location "asdfghjkl"
   - API returns empty results
   - "No locations found" message displayed
   - User tries different search
   - Error message clears

9. **Rate Limiting Workflow:**
   - Simulate rapid searches (11+ in 1 minute)
   - Rate limit error displayed
   - Retry-After message shown
   - User waits and retries successfully

10. **Mobile Workflow:**
    - All above workflows tested on mobile viewport
    - Touch interactions work correctly
    - Responsive design verified

**Files to Modify:**
- `/home/edwin/development/ptnextjs/tests/e2e/location-search-verification.spec.ts` (MODIFY/EXTEND)

**Test Framework:**
- Playwright for E2E testing
- Real browser automation (Chromium, Firefox, WebKit)
- Network interception for rate limit testing
- Visual regression testing (optional)

## Acceptance Criteria

- [ ] All 10 E2E test scenarios implemented
- [ ] Tests run in headless mode
- [ ] Tests pass on all browsers (Chromium, Firefox, WebKit)
- [ ] Mobile viewport tests pass
- [ ] Network interception tests work
- [ ] Tests are stable (no flakiness, run 3 times)
- [ ] Test execution time < 5 minutes total
- [ ] Screenshots captured on failure
- [ ] Test reports generated
- [ ] CI/CD compatible

## Testing Requirements

**Functional Testing:**
- Run E2E tests: `npm run test:e2e`
- All scenarios must pass
- Run 3 times to verify stability

**Manual Verification:**
- Review test recordings/traces
- Verify test coverage matches requirements
- Validate error scenarios trigger correctly

**Browser Testing:**
- Chromium: All tests pass
- Firefox: All tests pass
- WebKit (Safari): All tests pass
- Mobile Chromium: Mobile tests pass
- Mobile WebKit: Mobile tests pass

**Performance Requirements:**
- Individual test: < 30 seconds
- Full suite: < 5 minutes
- No timeout errors

**Evidence Required:**
- E2E test execution report (all passing)
- Screenshots/videos of test runs
- Browser compatibility matrix
- Performance metrics per test
- Flakiness report (0% flaky tests)

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-integ-frontend-backend.md
- Existing E2E test file (if any)
- Playwright configuration

**Assumptions:**
- Playwright is installed and configured
- Dev server can run for testing
- Internet connection for real API calls
- Test database/fixtures available

## Implementation Notes

**E2E Test Structure:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Location Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vendors page
    await page.goto('/vendors');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  test('simple search workflow - Monaco', async ({ page }) => {
    // Type in location search
    await page.fill('[aria-label="Location"]', 'Monaco');

    // Wait for debounce and API call
    await page.waitForTimeout(400);

    // Verify loading spinner appeared and disappeared
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();

    // Verify no dialog opened (single result auto-applied)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify vendors filtered
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const count = await vendorCards.count();

    // Should be fewer vendors than total (filtered)
    expect(count).toBeLessThan(50); // Assuming >50 total vendors

    // Verify location input shows selected location
    await expect(page.locator('[aria-label="Location"]')).toHaveValue('Monaco');
  });

  test('ambiguous search workflow - Paris', async ({ page }) => {
    // Type ambiguous location
    await page.fill('[aria-label="Location"]', 'Paris');
    await page.waitForTimeout(400);

    // Verify dialog opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Verify multiple results displayed
    const resultCards = page.locator('[role="option"]');
    const resultCount = await resultCards.count();
    expect(resultCount).toBeGreaterThan(1);

    // Verify results include different Paris locations
    await expect(page.locator('text=Paris, Île-de-France, France')).toBeVisible();
    await expect(page.locator('text=Paris, Texas')).toBeVisible();

    // Select first result (Paris, France)
    await page.click('text=Paris, Île-de-France, France');

    // Verify dialog closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify filter applied
    const filteredVendors = page.locator('[data-testid="vendor-card"]');
    const filteredCount = await filteredVendors.count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('postal code search workflow - 90210', async ({ page }) => {
    await page.fill('[aria-label="Location"]', '90210');
    await page.waitForTimeout(400);

    // Should get Beverly Hills result
    await expect(page.locator('[aria-label="Location"]')).toHaveValue(/Beverly Hills|90210/);

    // Verify filter applied
    const vendors = page.locator('[data-testid="vendor-card"]');
    expect(await vendors.count()).toBeGreaterThan(0);
  });

  test('advanced coordinate input workflow', async ({ page }) => {
    // Click advanced toggle
    await page.click('text=Advanced: Enter coordinates manually');

    // Wait for collapsible to expand
    await page.waitForTimeout(200);

    // Enter coordinates
    await page.fill('[aria-label="Latitude"]', '43.7384');
    await page.fill('[aria-label="Longitude"]', '7.4246');

    // Verify filter applied (vendors near Monaco)
    const vendors = page.locator('[data-testid="vendor-card"]');
    const count = await vendors.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(50); // Filtered
  });

  test('distance slider workflow', async ({ page }) => {
    // Apply location filter first
    await page.fill('[aria-label="Location"]', 'Monaco');
    await page.waitForTimeout(400);

    // Get initial vendor count
    const initialVendors = page.locator('[data-testid="vendor-card"]');
    const initialCount = await initialVendors.count();

    // Adjust distance slider to 50 km
    const slider = page.locator('[aria-label="Distance"]');
    await slider.fill('50');

    // Wait for filter to update
    await page.waitForTimeout(200);

    // Get new vendor count
    const filteredVendors = page.locator('[data-testid="vendor-card"]');
    const filteredCount = await filteredVendors.count();

    // Should be fewer vendors at smaller radius
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify distance display shows 50 km
    await expect(page.locator('text=50 km')).toBeVisible();
  });

  test('reset workflow', async ({ page }) => {
    // Apply location filter
    await page.fill('[aria-label="Location"]', 'Monaco');
    await page.waitForTimeout(400);

    // Adjust distance slider
    const slider = page.locator('[aria-label="Distance"]');
    await slider.fill('50');

    // Get filtered count
    const filteredVendors = page.locator('[data-testid="vendor-card"]');
    const filteredCount = await filteredVendors.count();

    // Click reset
    await page.click('button:has-text("Reset Filter")');

    // Verify input cleared
    await expect(page.locator('[aria-label="Location"]')).toHaveValue('');

    // Verify all vendors shown
    const allVendors = page.locator('[data-testid="vendor-card"]');
    const allCount = await allVendors.count();
    expect(allCount).toBeGreaterThan(filteredCount);
  });

  test('error handling - no results', async ({ page }) => {
    // Type invalid location
    await page.fill('[aria-label="Location"]', 'asdfghjkl');
    await page.waitForTimeout(400);

    // Verify error message displayed
    await expect(page.locator('text=No locations found')).toBeVisible();

    // Verify error icon displayed
    await expect(page.locator('[data-testid="alert-circle-icon"]')).toBeVisible();
  });

  test('debouncing reduces API calls', async ({ page }) => {
    let apiCallCount = 0;

    // Intercept API calls
    await page.route('/api/geocode*', (route) => {
      apiCallCount++;
      route.continue();
    });

    // Type rapidly
    const input = page.locator('[aria-label="Location"]');
    await input.type('Monaco', { delay: 50 }); // 50ms between keys

    // Wait for debounce period
    await page.waitForTimeout(400);

    // Should only have 1 API call despite 6 keystrokes
    expect(apiCallCount).toBe(1);
  });

  test('rate limiting error handling', async ({ page }) => {
    // Mock rate limit response
    await page.route('/api/geocode*', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Too many requests. Please wait a moment.',
          code: 'RATE_LIMIT',
          retryAfter: 45
        })
      });
    });

    // Try to search
    await page.fill('[aria-label="Location"]', 'Monaco');
    await page.waitForTimeout(400);

    // Verify rate limit error displayed
    await expect(page.locator('text=Too many requests')).toBeVisible();
  });

  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('location search works on mobile', async ({ page }) => {
      await page.goto('/vendors');

      // Verify responsive layout
      const locationInput = page.locator('[aria-label="Location"]');
      await expect(locationInput).toBeVisible();

      // Type location
      await locationInput.tap();
      await locationInput.fill('Monaco');
      await page.waitForTimeout(400);

      // Verify filter applied
      const vendors = page.locator('[data-testid="vendor-card"]');
      expect(await vendors.count()).toBeGreaterThan(0);
    });

    test('dialog works on mobile', async ({ page }) => {
      await page.goto('/vendors');

      // Type ambiguous location
      await page.fill('[aria-label="Location"]', 'Paris');
      await page.waitForTimeout(400);

      // Verify dialog responsive
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should take up most of screen width
      const dialogBox = await dialog.boundingBox();
      expect(dialogBox?.width).toBeGreaterThan(300);

      // Tap to select
      await page.tap('text=Paris, Île-de-France, France');

      // Verify dialog closed
      await expect(dialog).not.toBeVisible();
    });
  });
});
```

**Test Configuration:**

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Test Helpers:**

```typescript
// tests/e2e/helpers/location-search.ts
export async function searchLocation(page: Page, location: string) {
  await page.fill('[aria-label="Location"]', location);
  await page.waitForTimeout(400); // Debounce
}

export async function selectFromDialog(page: Page, location: string) {
  await page.click(`text=${location}`);
  await page.waitForTimeout(100);
}

export async function getVendorCount(page: Page): Promise<number> {
  const vendors = page.locator('[data-testid="vendor-card"]');
  return await vendors.count();
}

export async function resetFilter(page: Page) {
  await page.click('button:has-text("Reset Filter")');
  await page.waitForTimeout(100);
}
```

## Quality Gates

- [ ] All E2E tests pass on all browsers
- [ ] Tests stable (0% flakiness over 3 runs)
- [ ] Mobile viewport tests pass
- [ ] Network interception tests work
- [ ] Test execution time acceptable
- [ ] Screenshots/videos captured on failure
- [ ] Test reports generated
- [ ] No hardcoded waits (use waitFor methods)
- [ ] Tests follow Playwright best practices

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Test Files:**
- /home/edwin/development/ptnextjs/tests/e2e/location-search-verification.spec.ts (MODIFY)
- /home/edwin/development/ptnextjs/playwright.config.ts (configure)

**Related Tasks:**
- task-integ-frontend-backend (prerequisite)
- task-valid-full-stack (depends on E2E tests passing)

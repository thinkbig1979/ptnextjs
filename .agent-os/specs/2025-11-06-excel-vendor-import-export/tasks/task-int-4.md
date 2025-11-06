# Task INT-4: End-to-End Workflow Testing

**Status:** 🔒 Blocked (waiting for INT-1,INT-2,INT-3)
**Agent:** test-architect
**Estimated Time:** 6 hours
**Phase:** Frontend-Backend Integration
**Dependencies:** INT-1, INT-2, INT-3

## Objective

Create comprehensive end-to-end tests covering complete import/export workflows using Playwright.

## Context Requirements

- Review Playwright configuration
- Review all previous integration work
- Review happy path and error scenarios

## Acceptance Criteria

- [ ] E2E tests for template download workflow
- [ ] E2E tests for data export workflow
- [ ] E2E tests for complete import workflow (happy path)
- [ ] E2E tests for import with validation errors
- [ ] E2E tests for tier restriction enforcement
- [ ] E2E tests for error handling scenarios
- [ ] Tests run in CI/CD pipeline
- [ ] Tests are stable and reliable
- [ ] Tests clean up test data

## Detailed Specifications

### Test Files Structure

```
e2e/
├── excel-template-download.spec.ts
├── excel-export.spec.ts
├── excel-import-happy-path.spec.ts
├── excel-import-validation-errors.spec.ts
├── excel-import-tier-restrictions.spec.ts
└── excel-import-error-handling.spec.ts
```

### Test Scenarios

**Template Download:**
```typescript
test('should download import template', async ({ page }) => {
  await page.goto('/vendor/dashboard/data-management');

  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Download Template")');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/vendor_import_template.*\.xlsx/);
});
```

**Data Export:**
```typescript
test('should export vendor data', async ({ page }) => {
  await page.goto('/vendor/dashboard/data-management');

  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Export Data")');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/.*_data_.*\.xlsx/);
});
```

**Complete Import Workflow:**
```typescript
test('should complete import workflow successfully', async ({ page }) => {
  await page.goto('/vendor/dashboard/data-management');

  // Upload file
  await page.setInputFiles('input[type="file"]', 'test-fixtures/valid-vendor-data.xlsx');

  // Wait for validation
  await page.waitForSelector('text=Ready for review');

  // Review preview dialog
  expect(await page.textContent('[data-testid="valid-rows-count"]')).toBe('5');

  // Confirm import
  await page.click('button:has-text("Confirm Import")');

  // Wait for completion
  await page.waitForSelector('text=Import complete');

  // Verify success message
  expect(await page.textContent('[data-testid="success-message"]')).toContain('5 rows imported');
});
```

**Validation Errors:**
```typescript
test('should display validation errors', async ({ page }) => {
  await page.goto('/vendor/dashboard/data-management');

  await page.setInputFiles('input[type="file"]', 'test-fixtures/invalid-vendor-data.xlsx');

  await page.waitForSelector('[data-testid="validation-errors"]');

  const errorCount = await page.textContent('[data-testid="error-count"]');
  expect(errorCount).toBe('3');

  // Confirm button should be disabled
  await expect(page.locator('button:has-text("Confirm Import")')).toBeDisabled();
});
```

**Tier Restrictions:**
```typescript
test('should block import for Tier 1 vendor', async ({ page, context }) => {
  // Login as Tier 1 vendor
  await loginAs(page, 'tier1-vendor');

  await page.goto('/vendor/dashboard/data-management');

  // Import card should show upgrade message
  await expect(page.locator('text=Excel import requires Tier 2 or higher')).toBeVisible();

  // Upload button should be disabled
  await expect(page.locator('input[type="file"]')).toBeDisabled();
});
```

### Test Data Fixtures

Create test Excel files:
- `valid-vendor-data.xlsx` - All valid data
- `invalid-vendor-data.xlsx` - Contains validation errors
- `large-vendor-data.xlsx` - 1000+ rows
- `tier-restricted-fields.xlsx` - Contains Tier 2+ fields

## Testing Requirements

Run E2E tests:
```bash
npm run test:e2e
npm run test:e2e:ui  # Visual mode
```

## Evidence Requirements

- [ ] All E2E tests passing
- [ ] Test fixtures created
- [ ] Video recordings of test runs
- [ ] CI/CD integration working

## Implementation Notes

- Use test database separate from development
- Clean up test data after each test
- Use page object model for maintainability
- Add retry logic for flaky tests
- Use screenshots on failure

## Success Metrics

- All workflows tested end-to-end
- Tests are reliable (no flakes)
- Tests run in <5 minutes
- 100% critical path coverage
- Tests catch regressions

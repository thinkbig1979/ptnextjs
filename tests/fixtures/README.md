# Test Fixtures

This directory contains test fixtures for E2E tests.

## Contents

- `test-logo.svg` - Sample vendor logo (SVG format)
- `team-member.jpg` - Sample team member photo
- `case-study-1.jpg` - Sample case study image
- `product-image.jpg` - Sample product image
- `sample-vendors.json` - Sample vendor data for seeding
- `sample-products.json` - Sample product data for seeding

## Usage

```typescript
import { test } from '@playwright/test';

test('should upload logo', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles('tests/fixtures/test-logo.svg');
});
```

## Adding New Fixtures

1. Add the file to this directory
2. Update this README with a description
3. Use relative paths from the project root in tests

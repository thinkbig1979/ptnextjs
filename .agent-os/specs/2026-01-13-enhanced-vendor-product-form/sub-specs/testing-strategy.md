# Testing Strategy: Enhanced Vendor Product Form

## Test Pyramid

```
        ╱╲
       ╱E2E╲         ~5 tests  - Critical user journeys
      ╱──────╲
     ╱Integration╲   ~15 tests - Form + API integration
    ╱──────────────╲
   ╱   Unit Tests    ╲ ~40 tests - Components, validation, hooks
  ╱────────────────────╲
```

## Unit Tests

### Component Tests

**Location**: `__tests__/components/dashboard/product-form/`

#### FormSection.test.tsx
```typescript
describe('FormSection', () => {
  it('renders collapsed by default', () => {});
  it('expands when clicked', () => {});
  it('shows locked state for tier-restricted content', () => {});
  it('shows error count badge when errors exist', () => {});
  it('prevents expansion when locked', () => {});
});
```

#### ImagesSection.test.tsx
```typescript
describe('ImagesSection', () => {
  it('renders empty state initially', () => {});
  it('adds image when valid URL entered', () => {});
  it('shows validation error for invalid URL', () => {});
  it('allows setting main image', () => {});
  it('removes image with confirmation', () => {});
  it('limits images to max allowed', () => {});
});
```

#### SpecificationsSection.test.tsx
```typescript
describe('SpecificationsSection', () => {
  it('adds new specification row', () => {});
  it('validates required label and value', () => {});
  it('removes specification', () => {});
  it('preserves order on removal', () => {});
});
```

#### FeaturesSection.test.tsx
```typescript
describe('FeaturesSection', () => {
  it('adds feature with title', () => {});
  it('validates required title', () => {});
  it('allows optional description and icon', () => {});
  it('removes feature', () => {});
});
```

#### CategoriesTagsSection.test.tsx
```typescript
describe('CategoriesTagsSection', () => {
  it('loads categories from API', () => {});
  it('loads tags from API', () => {});
  it('allows multi-select categories', () => {});
  it('displays selected items as badges', () => {});
  it('removes selection on badge click', () => {});
  it('filters options on search', () => {});
});
```

#### PricingSection.test.tsx
```typescript
describe('PricingSection', () => {
  it('renders all pricing fields', () => {});
  it('toggles contact form switch', () => {});
  it('selects currency from dropdown', () => {});
});
```

#### SeoSection.test.tsx
```typescript
describe('SeoSection', () => {
  it('shows character count for meta title', () => {});
  it('shows character count for meta description', () => {});
  it('warns when exceeding recommended length', () => {});
});
```

### Schema Validation Tests

**Location**: `__tests__/lib/validation/`

#### product-form-schema.test.ts
```typescript
describe('ExtendedProductFormSchema', () => {
  describe('required fields', () => {
    it('requires name', () => {});
    it('requires description', () => {});
  });

  describe('images array', () => {
    it('accepts valid image objects', () => {});
    it('rejects invalid image URLs', () => {});
    it('handles empty array', () => {});
  });

  describe('specifications array', () => {
    it('requires label and value', () => {});
    it('enforces max lengths', () => {});
  });

  describe('features array', () => {
    it('requires title', () => {});
    it('makes description optional', () => {});
  });

  describe('pricing object', () => {
    it('accepts valid pricing config', () => {});
    it('defaults showContactForm to true', () => {});
  });

  describe('seo object', () => {
    it('enforces meta title max length', () => {});
    it('enforces meta description max length', () => {});
  });
});
```

### Hook Tests

**Location**: `__tests__/hooks/`

#### useFormDraft.test.ts
```typescript
describe('useFormDraft', () => {
  it('loads draft from localStorage on mount', () => {});
  it('saves to localStorage periodically', () => {});
  it('clears draft on explicit call', () => {});
  it('handles corrupted localStorage gracefully', () => {});
});
```

#### useProductFormData.test.ts
```typescript
describe('useProductFormData', () => {
  it('fetches categories', () => {});
  it('fetches tags', () => {});
  it('returns loading state', () => {});
  it('handles API errors', () => {});
});
```

## Integration Tests

**Location**: `__tests__/integration/`

### ProductForm Integration

#### product-form-integration.test.tsx
```typescript
describe('ProductForm Integration', () => {
  describe('create mode', () => {
    it('submits basic fields only', async () => {
      // Render form, fill basic fields, submit
      // Verify API called with correct data
    });

    it('submits with images', async () => {
      // Add images, submit
      // Verify images in API payload
    });

    it('submits with specifications', async () => {});
    it('submits with features', async () => {});
    it('submits with categories and tags', async () => {});
    it('submits with pricing config', async () => {});
    it('submits with SEO metadata', async () => {});
  });

  describe('edit mode', () => {
    it('populates form with existing product data', async () => {});
    it('updates only changed fields', async () => {});
    it('preserves unchanged array items', async () => {});
  });

  describe('validation', () => {
    it('shows field errors from API', async () => {});
    it('prevents submit with client validation errors', async () => {});
    it('scrolls to first error', async () => {});
  });

  describe('tier gating', () => {
    it('shows locked sections for free tier', async () => {});
    it('unlocks sections for tier2 vendor', async () => {});
    it('filters tier-restricted data on submit for lower tiers', async () => {});
  });
});
```

## E2E Tests

**Location**: `e2e/vendor-product-form.spec.ts`

### Critical User Journeys

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vendor Product Form', () => {
  test.beforeEach(async ({ page }) => {
    // Login as tier2 vendor
    await loginAsVendor(page, 'tier2');
  });

  test('creates product with basic info only', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    await page.fill('[name="name"]', 'Test Navigation System');
    await page.fill('[name="description"]', 'A comprehensive navigation solution');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('creates product with images', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    // Fill basic info
    await page.fill('[name="name"]', 'Product with Images');
    await page.fill('[name="description"]', 'Description');

    // Expand images section
    await page.click('text=Images');

    // Add image
    await page.fill('[data-testid="image-url-input"]', 'https://example.com/image.jpg');
    await page.click('[data-testid="add-image-button"]');

    // Verify image added
    await expect(page.locator('[data-testid="image-item"]')).toHaveCount(1);

    // Submit
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('creates product with specifications', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    await page.fill('[name="name"]', 'Product with Specs');
    await page.fill('[name="description"]', 'Description');

    await page.click('text=Technical Specifications');

    await page.click('[data-testid="add-specification"]');
    await page.fill('[name="specifications.0.label"]', 'Weight');
    await page.fill('[name="specifications.0.value"]', '5kg');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Product created successfully')).toBeVisible();
  });

  test('edits existing product', async ({ page }) => {
    // Create product first or use seed data
    await page.goto('/dashboard/products/1/edit');

    // Verify form populated
    await expect(page.locator('[name="name"]')).toHaveValue(/./);

    // Edit name
    await page.fill('[name="name"]', 'Updated Product Name');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Product updated successfully')).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    // Submit without required fields
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Product name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });
});

test.describe('Tier Gating', () => {
  test('free tier sees locked sections', async ({ page }) => {
    await loginAsVendor(page, 'free');
    await page.goto('/dashboard/products/new');

    await expect(page.locator('text=Requires Tier 2')).toBeVisible();
    await expect(page.locator('[data-testid="images-section"]')).toHaveAttribute('data-locked', 'true');
  });

  test('tier2 sees all sections unlocked', async ({ page }) => {
    await loginAsVendor(page, 'tier2');
    await page.goto('/dashboard/products/new');

    await expect(page.locator('text=Requires Tier 2')).not.toBeVisible();
  });
});
```

## Test Data

### Fixtures

```typescript
// __tests__/fixtures/product-form.ts

export const validBasicProduct = {
  name: 'Test Product',
  description: 'A test product description',
  shortDescription: 'Brief summary',
};

export const validFullProduct = {
  ...validBasicProduct,
  images: [
    {
      url: 'https://example.com/image1.jpg',
      altText: 'Product image',
      isMain: true,
    },
  ],
  specifications: [
    { label: 'Weight', value: '5kg' },
    { label: 'Dimensions', value: '10x20x30cm' },
  ],
  features: [
    { title: 'Feature 1', description: 'Description 1' },
  ],
  categories: ['cat-1', 'cat-2'],
  tags: ['tag-1'],
  pricing: {
    displayText: 'From $1,000',
    showContactForm: true,
  },
  seo: {
    metaTitle: 'Test Product | Brand',
    metaDescription: 'SEO description',
  },
};

export const invalidProduct = {
  name: '', // Required
  description: '', // Required
};
```

### Mock APIs

```typescript
// __tests__/mocks/handlers.ts

import { rest } from 'msw';

export const handlers = [
  rest.get('/api/categories', (req, res, ctx) => {
    return res(ctx.json({
      docs: [
        { id: 'cat-1', name: 'Navigation' },
        { id: 'cat-2', name: 'Electronics' },
      ],
    }));
  }),

  rest.get('/api/tags', (req, res, ctx) => {
    return res(ctx.json({
      docs: [
        { id: 'tag-1', name: 'GPS' },
        { id: 'tag-2', name: 'Marine' },
      ],
    }));
  }),

  rest.post('/api/portal/vendors/:vendorId/products', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({
      success: true,
      data: { id: 'new-product-id', ...body },
    }));
  }),
];
```

## Accessibility Testing

### Automated (axe-core)

```typescript
// In each component test
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<FormSection {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] Navigate form with keyboard only
- [ ] Test with VoiceOver (macOS)
- [ ] Test with NVDA (Windows)
- [ ] Verify focus order makes sense
- [ ] Verify error announcements
- [ ] Test with 200% zoom

## Coverage Targets

| Type | Target |
|------|--------|
| Statements | ≥80% |
| Branches | ≥75% |
| Functions | ≥80% |
| Lines | ≥80% |

## Test Commands

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific file
npm run test -- ImagesSection.test.tsx

# Run E2E
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui

# Run accessibility audit
npm run test:a11y
```

## CI Integration

```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm run test -- --coverage

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

# Categories Collection Test Specification

> Created: 2025-10-15
> Collection: categories
> Total Tests: 31+
> Coverage Target: 95%

## Overview

This specification defines comprehensive test cases for the Categories collection, used for organizing vendors, products, blog posts, and yachts.

---

## 1. Schema Validation Tests (8 tests)

```typescript
describe('Required Fields', () => {
  it('should require name');
  it('should require slug');
});

describe('Optional Fields', () => {
  it('should allow creation without description');
  it('should allow creation without icon');
  it('should allow creation without color');
  it('should allow creation without order');
  it('should default color to #0066cc');
  it('should default order to 999');
});
```

---

## 2. Hook Tests (4 tests)

```typescript
describe('Slug Auto-Generation', () => {
  it('should auto-generate slug from name');
  it('should handle special characters');
  it('should preserve manually provided slug');
});

describe('Slug Uniqueness', () => {
  it('should enforce slug uniqueness');
});
```

---

## 3. Access Control Tests (6 tests)

```typescript
describe('Admin Access', () => {
  it('should allow admin to CRUD categories');
});

describe('Public Access', () => {
  it('should allow public to read categories');
});

describe('Vendor Access', () => {
  it('should allow vendors to read categories');
  it('should block vendors from creating categories');
  it('should block vendors from updating categories');
  it('should block vendors from deleting categories');
});
```

---

## 4. Data Validation Tests (8 tests)

```typescript
describe('Icon Validation', () => {
  it('should accept Lucide icon name', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'Electronics',
        slug: 'electronics',
        icon: 'Zap',
      },
    });

    expect(category.icon).toBe('Zap');
  });

  it('should accept /media/ URL for icon', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'Custom',
        slug: 'custom',
        icon: '/media/custom-icon.svg',
      },
    });

    expect(category.icon).toBe('/media/custom-icon.svg');
  });

  it('should validate icon format (icon name or URL)');
});

describe('Color Validation', () => {
  it('should accept valid hex color', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'Test',
        slug: 'test',
        color: '#FF5733',
      },
    });

    expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should reject invalid hex color format');
  it('should default to #0066cc');
});

describe('Order Validation', () => {
  it('should accept numeric order', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: {
        name: 'First',
        slug: 'first',
        order: 1,
      },
    });

    expect(category.order).toBe(1);
  });

  it('should default order to 999');
  it('should allow negative order values for prioritization');
});
```

---

## 5. Relationship Tests (5 tests)

```typescript
describe('Categories Used by Vendors', () => {
  it('should track categories used by vendors', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: { name: 'Electronics', slug: 'electronics' },
    });

    const vendor = await createTestVendor(payload, 'free', {
      category: category.id,
    });

    const vendorWithCategory = await payload.findByID({
      collection: 'vendors',
      id: vendor.id,
      depth: 1,
    });

    expect(vendorWithCategory.category.name).toBe('Electronics');
  });
});

describe('Categories Used by Products', () => {
  it('should track categories used by products (many-to-many)', async () => {
    const category1 = await payload.create({
      collection: 'categories',
      data: { name: 'Electronics', slug: 'electronics' },
    });
    const category2 = await payload.create({
      collection: 'categories',
      data: { name: 'Navigation', slug: 'navigation' },
    });

    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        categories: [category1.id, category2.id],
      },
    });

    const productWithCategories = await payload.findByID({
      collection: 'products',
      id: product.id,
      depth: 1,
    });

    expect(productWithCategories.categories).toHaveLength(2);
  });
});

describe('Categories Used by Blog Posts', () => {
  it('should track categories used by blog posts');
});

describe('Categories Used by Yachts', () => {
  it('should track categories used by yachts');
});

describe('Orphaned Categories', () => {
  it('should detect categories not used by any content', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: { name: 'Unused', slug: 'unused' },
    });

    // Check if category is referenced by any content
    const vendors = await payload.find({
      collection: 'vendors',
      where: { category: { equals: category.id } },
    });

    const products = await payload.find({
      collection: 'products',
      where: { categories: { in: [category.id] } },
    });

    expect(vendors.docs).toHaveLength(0);
    expect(products.docs).toHaveLength(0);
  });
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 8         | ✓      |
| Hook Tests             | 4         | ✓      |
| Access Control         | 6         | ✓      |
| Data Validation        | 8         | ✓      |
| Relationship Tests     | 5         | ✓      |
| **Total**              | **31**    | ✓      |

## Notes

- Categories support Lucide icon names or custom /media/ URLs
- Order field allows custom sorting (default 999)
- Categories are shared across vendors, products, blog posts, and yachts
- Admin-only creation/update/deletion
- Public and vendors can read for filtering/organization

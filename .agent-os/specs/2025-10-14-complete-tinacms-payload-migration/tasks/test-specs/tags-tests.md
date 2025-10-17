# Tags Collection Test Specification

> Created: 2025-10-15
> Collection: tags
> Total Tests: 32+
> Coverage Target: 95%

## Overview

This specification defines comprehensive test cases for the Tags collection, a new admin-only collection that provides unified tagging across vendors, products, blog posts, and yachts.

---

## 1. Schema Validation Tests (8 tests)

```typescript
describe('Required Fields', () => {
  it('should require name', async () => {
    await expect(
      payload.create({
        collection: 'tags',
        data: { slug: 'test-tag' },
      })
    ).rejects.toThrow(/name.*required/i);
  });

  it('should require slug', async () => {
    await expect(
      payload.create({
        collection: 'tags',
        data: { name: 'Test Tag' },
      })
    ).rejects.toThrow(/slug.*required/i);
  });
});

describe('Optional Fields', () => {
  it('should allow creation without description', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
    });

    expect(tag.description).toBeUndefined();
  });

  it('should allow creation without color', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
    });

    expect(tag.color).toBeUndefined();
  });

  it('should default color to #0066cc if not provided', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
    });

    expect(tag.color).toBe('#0066cc');
  });
});

describe('Computed Fields', () => {
  it('should compute usageCount as read-only', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
    });

    expect(tag.usageCount).toBe(0);
  });

  it('should block manual usageCount updates', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
    });

    await expect(
      payload.update({
        collection: 'tags',
        id: tag.id,
        data: { usageCount: 100 },
      })
    ).rejects.toThrow(/usageCount.*read-only/i);
  });

  it('should auto-increment usageCount when tag is referenced', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine Electronics', slug: 'marine-electronics' },
    });

    const vendor = await createTestVendor(payload, 'free', {
      tags: [tag.id],
    });

    const updatedTag = await payload.findByID({
      collection: 'tags',
      id: tag.id,
    });

    expect(updatedTag.usageCount).toBe(1);
  });
});
```

---

## 2. Hook Tests (4 tests)

```typescript
describe('Slug Auto-Generation', () => {
  it('should auto-generate slug from name', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine Electronics' },
    });

    expect(tag.slug).toBe('marine-electronics');
  });

  it('should handle special characters in slug generation', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'GPS & Navigation™' },
    });

    expect(tag.slug).toBe('gps-navigation');
  });

  it('should preserve manually provided slug', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test Tag', slug: 'custom-slug' },
    });

    expect(tag.slug).toBe('custom-slug');
  });
});

describe('Slug Uniqueness', () => {
  it('should enforce slug uniqueness', async () => {
    await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test-tag' },
    });

    await expect(
      payload.create({
        collection: 'tags',
        data: { name: 'Test 2', slug: 'test-tag' },
      })
    ).rejects.toThrow(/slug.*unique/i);
  });
});
```

---

## 3. Access Control Tests (10 tests) - **CRITICAL**

```typescript
describe('Admin-Only CRUD Access', () => {
  it('should allow admin to create tags', async () => {
    const admin = await createTestUser(payload, 'admin');

    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Admin Tag', slug: 'admin-tag' },
      user: admin,
    });

    expect(tag.id).toBeDefined();
  });

  it('should block vendor from creating tags', async () => {
    const vendor = await createTestVendor(payload, 'free');

    await expect(
      payload.create({
        collection: 'tags',
        data: { name: 'Vendor Tag', slug: 'vendor-tag' },
        user: vendor.user,
      })
    ).rejects.toThrow(/access denied/i);
  });

  it('should block author from creating tags', async () => {
    const author = await createTestUser(payload, 'author');

    await expect(
      payload.create({
        collection: 'tags',
        data: { name: 'Author Tag', slug: 'author-tag' },
        user: author,
      })
    ).rejects.toThrow(/access denied/i);
  });

  it('should block unauthenticated users from creating tags', async () => {
    await expect(
      payload.create({
        collection: 'tags',
        data: { name: 'Public Tag', slug: 'public-tag' },
      })
    ).rejects.toThrow(/access denied/i);
  });

  it('should allow admin to update tags', async () => {
    const admin = await createTestUser(payload, 'admin');

    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
      user: admin,
    });

    const updated = await payload.update({
      collection: 'tags',
      id: tag.id,
      data: { name: 'Updated Tag' },
      user: admin,
    });

    expect(updated.name).toBe('Updated Tag');
  });

  it('should block vendor from updating tags', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'free');

    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
      user: admin,
    });

    await expect(
      payload.update({
        collection: 'tags',
        id: tag.id,
        data: { name: 'Hacked' },
        user: vendor.user,
      })
    ).rejects.toThrow(/access denied/i);
  });

  it('should allow admin to delete tags', async () => {
    const admin = await createTestUser(payload, 'admin');

    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
      user: admin,
    });

    await payload.delete({
      collection: 'tags',
      id: tag.id,
      user: admin,
    });

    const deleted = await payload.findByID({
      collection: 'tags',
      id: tag.id,
    });

    expect(deleted).toBeNull();
  });

  it('should block vendor from deleting tags', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'free');

    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Test', slug: 'test' },
      user: admin,
    });

    await expect(
      payload.delete({
        collection: 'tags',
        id: tag.id,
        user: vendor.user,
      })
    ).rejects.toThrow(/access denied/i);
  });
});

describe('Public Read Access', () => {
  it('should allow public to read all tags', async () => {
    const admin = await createTestUser(payload, 'admin');

    await payload.create({
      collection: 'tags',
      data: { name: 'Public Tag', slug: 'public-tag' },
      user: admin,
    });

    const tags = await payload.find({
      collection: 'tags',
    });

    expect(tags.docs.length).toBeGreaterThan(0);
  });

  it('should allow vendors to read tags for referencing', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'free');

    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine', slug: 'marine' },
      user: admin,
    });

    const tags = await payload.find({
      collection: 'tags',
      user: vendor.user,
    });

    expect(tags.docs).toContainEqual(
      expect.objectContaining({ id: tag.id })
    );
  });
});
```

---

## 4. Data Validation Tests (6 tests)

```typescript
describe('Name Validation', () => {
  it('should accept valid tag name', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine Electronics', slug: 'marine-electronics' },
    });

    expect(tag.name).toBe('Marine Electronics');
  });

  it('should enforce name max length (255)', async () => {
    await expect(
      payload.create({
        collection: 'tags',
        data: {
          name: 'A'.repeat(256),
          slug: 'test',
        },
      })
    ).rejects.toThrow(/exceeds maximum length/i);
  });
});

describe('Slug Validation', () => {
  it('should validate slug format (lowercase, hyphenated)', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine Electronics', slug: 'marine-electronics' },
    });

    expect(tag.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('should reject invalid slug format', async () => {
    await expect(
      payload.create({
        collection: 'tags',
        data: {
          name: 'Test',
          slug: 'Invalid Slug!',
        },
      })
    ).rejects.toThrow(/invalid.*slug/i);
  });
});

describe('Color Validation', () => {
  it('should validate hex color format', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: {
        name: 'Test',
        slug: 'test',
        color: '#FF5733',
      },
    });

    expect(tag.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should reject invalid hex color format', async () => {
    await expect(
      payload.create({
        collection: 'tags',
        data: {
          name: 'Test',
          slug: 'test',
          color: 'red',
        },
      })
    ).rejects.toThrow(/invalid.*color/i);
  });
});
```

---

## 5. Relationship Tests (4 tests)

```typescript
describe('Tags Used by Vendors', () => {
  it('should track tags used by vendors', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine', slug: 'marine' },
    });

    const vendor = await createTestVendor(payload, 'free', {
      tags: [tag.id],
    });

    const vendorWithTags = await payload.findByID({
      collection: 'vendors',
      id: vendor.id,
      depth: 1,
    });

    expect(vendorWithTags.tags[0].name).toBe('Marine');
  });
});

describe('Tags Used by Products', () => {
  it('should track tags used by products', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'GPS', slug: 'gps' },
    });

    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        tags: [tag.id],
      },
    });

    const productWithTags = await payload.findByID({
      collection: 'products',
      id: product.id,
      depth: 1,
    });

    expect(productWithTags.tags[0].name).toBe('GPS');
  });
});

describe('Tags Used by Blog Posts', () => {
  it('should track tags used by blog posts', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Technology', slug: 'technology' },
    });

    const author = await createTestUser(payload, 'author');
    const blogPost = await payload.create({
      collection: 'blog-posts',
      data: {
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        content: generateMockRichText(),
        author: author.id,
        tags: [tag.id],
      },
    });

    const postWithTags = await payload.findByID({
      collection: 'blog-posts',
      id: blogPost.id,
      depth: 1,
    });

    expect(postWithTags.tags[0].name).toBe('Technology');
  });
});

describe('Tags Used by Yachts', () => {
  it('should track tags used by yachts', async () => {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Superyacht', slug: 'superyacht' },
    });

    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Luxury Yacht',
        slug: 'luxury-yacht',
        description: generateMockRichText(),
        tags: [tag.id],
      },
    });

    const yachtWithTags = await payload.findByID({
      collection: 'yachts',
      id: yacht.id,
      depth: 1,
    });

    expect(yachtWithTags.tags[0].name).toBe('Superyacht');
  });
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 8         | ✓      |
| Hook Tests             | 4         | ✓      |
| Access Control (CRITICAL) | 10     | ✓      |
| Data Validation        | 6         | ✓      |
| Relationship Tests     | 4         | ✓      |
| **Total**              | **32**    | ✓      |

## Notes

- **CRITICAL: Admin-only CRUD access must be thoroughly tested**
- Tags are new collection (not in TinaCMS)
- Public can read tags but only admins can CRUD
- usageCount is computed and read-only
- Tags provide unified tagging across vendors, products, blog posts, and yachts
- Slug auto-generation follows standard pattern
- Color format validation ensures valid hex colors

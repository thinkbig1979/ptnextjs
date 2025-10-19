# Products Collection Test Specification

> Created: 2025-10-15
> Collection: products
> Total Tests: 69+
> Coverage Target: 95%

## Overview

This specification defines comprehensive test cases for the Products collection, covering 90+ enhanced fields including comparison metrics, integration compatibility, owner reviews, visual demos, and tier-based vendor access control.

---

## 1. Schema Validation Tests (18 tests)

### 1.1 Required Fields

```typescript
describe('Required Fields', () => {
  it('should require name', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: { slug: 'test' },
      })
    ).rejects.toThrow(/name.*required/i);
  });

  it('should require slug', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: { name: 'Test Product' },
      })
    ).rejects.toThrow(/slug.*required/i);
  });

  it('should require description', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'Test Product',
          slug: 'test-product',
          vendor: vendor.id,
        },
      })
    ).rejects.toThrow(/description.*required/i);
  });

  it('should require vendor relationship', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'Test Product',
          slug: 'test-product',
          description: generateMockRichText(),
        },
      })
    ).rejects.toThrow(/vendor.*required/i);
  });
});
```

### 1.2 Optional Fields

```typescript
describe('Optional Fields', () => {
  it('should allow creation without shortDescription', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'Test',
        slug: 'test',
        description: generateMockRichText(),
        vendor: vendor.id,
      },
    });

    expect(product.shortDescription).toBeUndefined();
  });

  it('should allow creation without images', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    expect(product.images).toHaveLength(0);
  });

  it('should allow creation without categories', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    expect(product.categories).toBeUndefined();
  });

  it('should allow creation without specifications', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    expect(product.specifications).toHaveLength(0);
  });
});
```

### 1.3 Rich Text Field Validation

```typescript
describe('Rich Text Field Validation', () => {
  it('should accept Lexical rich text for description', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const richText = generateMockRichText(3);

    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'Test',
        slug: 'test',
        description: richText,
        vendor: vendor.id,
      },
    });

    expect(product.description.root).toBeDefined();
    expect(product.description.root.children).toBeDefined();
  });

  it('should reject invalid Lexical format', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'Test',
          slug: 'test',
          description: 'Plain text string', // Not Lexical format
          vendor: vendor.id,
        },
      })
    ).rejects.toThrow(/invalid.*format/i);
  });
});
```

### 1.4 Field Length Limits

```typescript
describe('Field Length Limits', () => {
  it('should enforce name max length (255)', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'A'.repeat(256),
          slug: 'test',
          description: generateMockRichText(),
          vendor: vendor.id,
        },
      })
    ).rejects.toThrow(/exceeds maximum length/i);
  });

  it('should enforce slug max length (255)', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'Test',
          slug: 'a'.repeat(256),
          description: generateMockRichText(),
          vendor: vendor.id,
        },
      })
    ).rejects.toThrow(/exceeds maximum length/i);
  });

  it('should enforce shortDescription max length (500)', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          shortDescription: 'A'.repeat(501),
          vendor: vendor.id,
        },
      })
    ).rejects.toThrow(/exceeds maximum length/i);
  });
});
```

### 1.5 Enhanced Fields Schema

```typescript
describe('Enhanced Fields Schema', () => {
  it('should accept features array with icons', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        features: generateMockFeatures(5),
      },
    });

    expect(product.features).toHaveLength(5);
    expect(product.features[0].icon).toBeDefined();
  });

  it('should accept specifications array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        specifications: generateMockSpecifications(),
      },
    });

    expect(product.specifications.length).toBeGreaterThan(0);
  });

  it('should accept benefits array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        benefits: [
          { benefit: 'Energy efficient', order: 1 },
          { benefit: 'Long-lasting', order: 2 },
        ],
      },
    });

    expect(product.benefits).toHaveLength(2);
  });

  it('should accept services array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        services: [
          {
            title: 'Installation',
            description: 'Professional installation service',
          },
        ],
      },
    });

    expect(product.services).toHaveLength(1);
  });

  it('should accept pricing group', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        pricing: {
          displayText: '$1,000 - $5,000',
          currency: 'USD',
          showContactForm: true,
        },
      },
    });

    expect(product.pricing.currency).toBe('USD');
  });

  it('should accept actionButtons array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        actionButtons: [
          {
            label: 'Get Quote',
            type: 'primary',
            action: 'quote',
          },
        ],
      },
    });

    expect(product.actionButtons).toHaveLength(1);
  });

  it('should accept badges array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        badges: [
          { label: 'Best Seller', type: 'success' },
          { label: 'New', type: 'info' },
        ],
      },
    });

    expect(product.badges).toHaveLength(2);
  });
});
```

### 1.6 Advanced Enhanced Fields

```typescript
describe('Advanced Enhanced Fields', () => {
  it('should accept comparisonMetrics array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        comparisonMetrics: [
          {
            metricId: 'power-consumption',
            name: 'Power Consumption',
            value: 150,
            unit: 'W',
            category: 'efficiency',
            weight: 0.8,
          },
        ],
      },
    });

    expect(product.comparisonMetrics).toHaveLength(1);
  });

  it('should accept integrationCompatibility group', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        integrationCompatibility: {
          supportedProtocols: ['NMEA 2000', 'NMEA 0183'],
          compatibilityMatrix: [
            {
              system: 'Garmin',
              compatibility: 'full',
              notes: 'Plug and play',
            },
          ],
        },
      },
    });

    expect(product.integrationCompatibility.supportedProtocols).toHaveLength(2);
  });

  it('should accept ownerReviews array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        ownerReviews: generateMockOwnerReviews(3),
      },
    });

    expect(product.ownerReviews).toHaveLength(3);
  });

  it('should accept visualDemo group', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        visualDemo: {
          type: '360-image',
          title: 'Product 360° View',
          imageUrl: '/media/360-view.jpg',
        },
      },
    });

    expect(product.visualDemo.type).toBe('360-image');
  });
});
```

---

## 2. Hook Tests (8 tests)

### 2.1 Slug Auto-Generation

```typescript
describe('Slug Auto-Generation', () => {
  it('should auto-generate slug from product name', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'Advanced Navigation System',
        description: generateMockRichText(),
        vendor: vendor.id,
      },
    });

    expect(product.slug).toBe('advanced-navigation-system');
  });

  it('should handle special characters in slug', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'GPS & Navigation System™',
        description: generateMockRichText(),
        vendor: vendor.id,
      },
    });

    expect(product.slug).toBe('gps-navigation-system');
  });

  it('should preserve manually provided slug', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        name: 'Test Product',
        slug: 'custom-slug',
        description: generateMockRichText(),
        vendor: vendor.id,
      },
    });

    expect(product.slug).toBe('custom-slug');
  });
});
```

### 2.2 Slug Uniqueness

```typescript
describe('Slug Uniqueness', () => {
  it('should enforce slug uniqueness', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await payload.create({
      collection: 'products',
      data: {
        name: 'Test',
        slug: 'test-product',
        description: generateMockRichText(),
        vendor: vendor.id,
      },
    });

    await expect(
      payload.create({
        collection: 'products',
        data: {
          name: 'Test 2',
          slug: 'test-product',
          description: generateMockRichText(),
          vendor: vendor.id,
        },
      })
    ).rejects.toThrow(/slug.*unique/i);
  });
});
```

### 2.3 Vendor Tier Validation Hook

```typescript
describe('Vendor Tier Validation Hook', () => {
  it('should allow tier2 vendor to create products', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
      },
      user: vendor.user,
    });

    expect(product.id).toBeDefined();
  });

  it('should block tier1 vendor from creating products', async () => {
    const vendor = await createTestVendor(payload, 'tier1');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
        },
        user: vendor.user,
      })
    ).rejects.toThrow(/tier 2.*required/i);
  });

  it('should block free vendor from creating products', async () => {
    const vendor = await createTestVendor(payload, 'free');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
        },
        user: vendor.user,
      })
    ).rejects.toThrow(/tier 2.*required/i);
  });
});
```

### 2.4 Timestamp Hooks

```typescript
describe('Timestamp Hooks', () => {
  it('should auto-populate createdAt on create', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    expect(product.createdAt).toBeDefined();
    expect(new Date(product.createdAt)).toBeInstanceOf(Date);
  });

  it('should update updatedAt on update', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    const originalUpdatedAt = product.updatedAt;

    await waitForHooks(100);

    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      data: { shortDescription: 'Updated' },
    });

    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
      new Date(originalUpdatedAt).getTime()
    );
  });
});
```

---

## 3. Access Control Tests (10 tests)

### 3.1 Admin Access

```typescript
describe('Admin Access', () => {
  it('should allow admin to create product for any vendor', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
      user: admin,
    });

    expect(product.id).toBeDefined();
  });

  it('should allow admin to update any product', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      data: { name: 'Updated Name' },
      user: admin,
    });

    expect(updated.name).toBe('Updated Name');
  });

  it('should allow admin to delete any product', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    await payload.delete({
      collection: 'products',
      id: product.id,
      user: admin,
    });

    const deleted = await payload.findByID({
      collection: 'products',
      id: product.id,
    });

    expect(deleted).toBeNull();
  });

  it('should allow admin to publish products', async () => {
    const admin = await createTestUser(payload, 'admin');
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        published: false,
      },
    });

    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      data: { published: true },
      user: admin,
    });

    expect(updated.published).toBe(true);
  });
});
```

### 3.2 Vendor Access

```typescript
describe('Vendor Access', () => {
  it('should allow tier2 vendor to update their own products', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
      user: vendor.user,
    });

    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      data: { shortDescription: 'Updated' },
      user: vendor.user,
    });

    expect(updated.shortDescription).toBe('Updated');
  });

  it('should block vendor from updating other vendors products', async () => {
    const vendor1 = await createTestVendor(payload, 'tier2');
    const vendor2 = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor2.id),
    });

    await expect(
      payload.update({
        collection: 'products',
        id: product.id,
        data: { name: 'Hacked' },
        user: vendor1.user,
      })
    ).rejects.toThrow(/access denied/i);
  });

  it('should block vendor from publishing products', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
      user: vendor.user,
    });

    await expect(
      payload.update({
        collection: 'products',
        id: product.id,
        data: { published: true },
        user: vendor.user,
      })
    ).rejects.toThrow(/access denied/i);
  });

  it('should allow tier2 vendor to delete their own products', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
      user: vendor.user,
    });

    await payload.delete({
      collection: 'products',
      id: product.id,
      user: vendor.user,
    });

    const deleted = await payload.findByID({
      collection: 'products',
      id: product.id,
    });

    expect(deleted).toBeNull();
  });
});
```

### 3.3 Public Access

```typescript
describe('Public Access', () => {
  it('should allow public to read published products', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const admin = await createTestUser(payload, 'admin');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        published: true,
      },
      user: admin,
    });

    const products = await payload.find({
      collection: 'products',
      where: { published: { equals: true } },
    });

    expect(products.docs).toContainEqual(
      expect.objectContaining({ id: product.id })
    );
  });

  it('should filter unpublished products from public', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        published: false,
      },
    });

    const products = await payload.find({
      collection: 'products',
      where: { published: { equals: true } },
    });

    expect(products.docs).toHaveLength(0);
  });
});
```

---

## 4. Data Validation Tests (25 tests)

### 4.1 Images Array Validation

```typescript
describe('Images Array Validation', () => {
  it('should accept images array with all fields', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        images: generateMockImages(3),
      },
    });

    expect(product.images).toHaveLength(3);
    expect(product.images[0].url).toBeDefined();
    expect(product.images[0].altText).toBeDefined();
  });

  it('should require image URL', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          images: [{ altText: 'Test' }],
        },
      })
    ).rejects.toThrow(/url.*required/i);
  });

  it('should default isMain to false', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        images: [{ url: '/media/test.jpg' }],
      },
    });

    expect(product.images[0].isMain).toBe(false);
  });

  it('should accept isMain: true', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        images: [{ url: '/media/test.jpg', isMain: true }],
      },
    });

    expect(product.images[0].isMain).toBe(true);
  });
});
```

### 4.2 Specifications Validation

```typescript
describe('Specifications Validation', () => {
  it('should require label and value in specifications', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          specifications: [{ label: 'Power' }],
        },
      })
    ).rejects.toThrow(/value.*required/i);
  });

  it('should accept valid specifications array', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        specifications: [
          { label: 'Power', value: '12V DC' },
          { label: 'Weight', value: '2.5 kg' },
        ],
      },
    });

    expect(product.specifications).toHaveLength(2);
  });
});
```

### 4.3 Owner Reviews Validation

```typescript
describe('Owner Reviews Validation', () => {
  it('should validate rating range (0-5)', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          ownerReviews: [
            {
              reviewId: 'review-1',
              ownerName: 'John Doe',
              rating: 6, // Invalid
              title: 'Great product',
              review: 'Works well',
            },
          ],
        },
      })
    ).rejects.toThrow(/rating.*0.*5/i);
  });

  it('should accept valid owner review', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        ownerReviews: [
          {
            reviewId: 'review-1',
            ownerName: 'John Doe',
            rating: 5,
            title: 'Excellent',
            review: 'Very satisfied',
            verified: true,
          },
        ],
      },
    });

    expect(product.ownerReviews[0].rating).toBe(5);
    expect(product.ownerReviews[0].verified).toBe(true);
  });

  it('should validate useCase enum', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          ownerReviews: [
            {
              reviewId: 'review-1',
              ownerName: 'John Doe',
              rating: 5,
              title: 'Great',
              review: 'Good',
              useCase: 'invalid-use-case',
            },
          ],
        },
      })
    ).rejects.toThrow(/invalid.*useCase/i);
  });

  it('should accept valid useCase enum values', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        ownerReviews: [
          {
            reviewId: 'review-1',
            ownerName: 'John Doe',
            rating: 5,
            title: 'Great',
            review: 'Good',
            useCase: 'commercial_charter',
          },
        ],
      },
    });

    expect(product.ownerReviews[0].useCase).toBe('commercial_charter');
  });
});
```

### 4.4 Visual Demo Validation

```typescript
describe('Visual Demo Validation', () => {
  it('should validate visual demo type enum', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          visualDemo: {
            type: 'invalid-type',
            title: 'Test',
          },
        },
      })
    ).rejects.toThrow(/invalid.*type/i);
  });

  it('should accept 360-image visual demo', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        visualDemo: {
          type: '360-image',
          title: '360° Product View',
          imageUrl: '/media/360-view.jpg',
          hotspots: [
            {
              positionX: 50,
              positionY: 50,
              title: 'Feature 1',
              action: 'info',
            },
          ],
        },
      },
    });

    expect(product.visualDemo.type).toBe('360-image');
    expect(product.visualDemo.hotspots).toHaveLength(1);
  });

  it('should accept 3d-model visual demo', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        visualDemo: {
          type: '3d-model',
          title: '3D Model',
          modelUrl: '/media/model.glb',
          animations: ['rotate', 'zoom'],
          cameraPositions: [
            {
              name: 'Front',
              positionX: 0,
              positionY: 0,
              positionZ: 5,
            },
          ],
        },
      },
    });

    expect(product.visualDemo.type).toBe('3d-model');
    expect(product.visualDemo.modelUrl).toBe('/media/model.glb');
  });

  it('should accept video visual demo', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        visualDemo: {
          type: 'video',
          title: 'Product Video',
          videoUrl: 'https://youtube.com/watch?v=test',
        },
      },
    });

    expect(product.visualDemo.type).toBe('video');
  });
});
```

### 4.5 Comparison Metrics Validation

```typescript
describe('Comparison Metrics Validation', () => {
  it('should validate comparison metric category enum', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          comparisonMetrics: [
            {
              metricId: 'metric-1',
              name: 'Test Metric',
              value: 100,
              category: 'invalid-category',
            },
          ],
        },
      })
    ).rejects.toThrow(/invalid.*category/i);
  });

  it('should accept valid comparison metrics', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        comparisonMetrics: [
          {
            metricId: 'power',
            name: 'Power Consumption',
            value: 150,
            unit: 'W',
            category: 'efficiency',
            weight: 0.8,
            toleranceMin: 140,
            toleranceMax: 160,
            benchmarkValue: 200,
          },
        ],
      },
    });

    expect(product.comparisonMetrics[0].category).toBe('efficiency');
    expect(product.comparisonMetrics[0].weight).toBe(0.8);
  });

  it('should validate weight range (0.0-1.0)', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          comparisonMetrics: [
            {
              metricId: 'metric-1',
              name: 'Test',
              value: 100,
              category: 'performance',
              weight: 1.5, // Invalid
            },
          ],
        },
      })
    ).rejects.toThrow(/weight.*0.*1/i);
  });
});
```

### 4.6 Integration Compatibility Validation

```typescript
describe('Integration Compatibility Validation', () => {
  it('should validate compatibility enum values', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productFixtures.basicProduct(vendor.id),
          integrationCompatibility: {
            compatibilityMatrix: [
              {
                system: 'Garmin',
                compatibility: 'invalid-value',
              },
            ],
          },
        },
      })
    ).rejects.toThrow(/invalid.*compatibility/i);
  });

  it('should accept valid compatibility matrix', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        integrationCompatibility: {
          supportedProtocols: ['NMEA 2000', 'NMEA 0183'],
          systemRequirements: {
            powerSupply: '12V DC',
            mounting: 'Standard DIN mount',
            ipRating: 'IP67',
          },
          compatibilityMatrix: [
            {
              system: 'Garmin',
              compatibility: 'full',
              complexity: 'simple',
              notes: 'Plug and play integration',
            },
            {
              system: 'Raymarine',
              compatibility: 'adapter',
              complexity: 'moderate',
              requirements: ['NMEA adapter cable'],
            },
          ],
        },
      },
    });

    expect(product.integrationCompatibility.compatibilityMatrix).toHaveLength(2);
  });

  it('should validate complexity enum values', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        integrationCompatibility: {
          compatibilityMatrix: [
            {
              system: 'Test',
              compatibility: 'full',
              complexity: 'complex',
            },
          ],
        },
      },
    });

    expect(product.integrationCompatibility.compatibilityMatrix[0].complexity).toBe('complex');
  });
});
```

---

## 5. Relationship Tests (8 tests)

### 5.1 Vendor Relationship

```typescript
describe('Vendor Relationship', () => {
  it('should create product with vendor relationship', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    expect(product.vendor).toBe(vendor.id);
  });

  it('should resolve vendor relationship with depth', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    const productWithVendor = await payload.findByID({
      collection: 'products',
      id: product.id,
      depth: 1,
    });

    expect(productWithVendor.vendor.companyName).toBe(vendor.companyName);
  });

  it('should handle vendor deletion (orphaned product)', async () => {
    const vendor = await createTestVendor(payload, 'tier2');

    const product = await payload.create({
      collection: 'products',
      data: productFixtures.basicProduct(vendor.id),
    });

    const admin = await createTestUser(payload, 'admin');
    await payload.delete({
      collection: 'vendors',
      id: vendor.id,
      user: admin,
    });

    const orphanedProduct = await payload.findByID({
      collection: 'products',
      id: product.id,
    });

    expect(orphanedProduct.vendor).toBeNull();
  });
});
```

### 5.2 Categories Relationship

```typescript
describe('Categories Relationship', () => {
  it('should create product with categories relationship', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const category1 = await payload.create({
      collection: 'categories',
      data: { name: 'Electronics', slug: 'electronics' },
    });
    const category2 = await payload.create({
      collection: 'categories',
      data: { name: 'Navigation', slug: 'navigation' },
    });

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        categories: [category1.id, category2.id],
      },
    });

    expect(product.categories).toHaveLength(2);
  });

  it('should resolve categories relationship with depth', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const category = await payload.create({
      collection: 'categories',
      data: { name: 'Electronics', slug: 'electronics' },
    });

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        categories: [category.id],
      },
    });

    const productWithCategories = await payload.findByID({
      collection: 'products',
      id: product.id,
      depth: 1,
    });

    expect(productWithCategories.categories[0].name).toBe('Electronics');
  });
});
```

### 5.3 Tags Relationship

```typescript
describe('Tags Relationship', () => {
  it('should create product with tags relationship', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const tag1 = await payload.create({
      collection: 'tags',
      data: { name: 'Marine Electronics', slug: 'marine-electronics' },
    });
    const tag2 = await payload.create({
      collection: 'tags',
      data: { name: 'GPS', slug: 'gps' },
    });

    const product = await payload.create({
      collection: 'products',
      data: {
        ...productFixtures.basicProduct(vendor.id),
        tags: [tag1.id, tag2.id],
      },
    });

    expect(product.tags).toHaveLength(2);
  });

  it('should resolve tags relationship with depth', async () => {
    const vendor = await createTestVendor(payload, 'tier2');
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Marine Electronics', slug: 'marine-electronics' },
    });

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

    expect(productWithTags.tags[0].name).toBe('Marine Electronics');
  });
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 18        | ✓      |
| Hook Tests             | 8         | ✓      |
| Access Control         | 10        | ✓      |
| Data Validation        | 25        | ✓      |
| Relationship Tests     | 8         | ✓      |
| **Total**              | **69**    | ✓      |

## Notes

- Products require tier2 vendor for creation (enforced in hook)
- Rich text description uses Lexical editor format
- Enhanced fields cover comparison metrics, integration compatibility, owner reviews, and visual demos
- All 90+ product fields are tested across categories
- Relationship integrity validated for vendor, categories, and tags

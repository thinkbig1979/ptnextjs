# Yachts Collection Test Specification

> Created: 2025-10-15
> Collection: yachts
> Total Tests: 70+
> Coverage Target: 90%

## Overview

This specification defines comprehensive test cases for the Yachts collection, a new collection with timeline events, supplier mapping, sustainability scoring, customizations, and maintenance history tracking.

---

## 1. Schema Validation Tests (20 tests)

```typescript
describe('Required Fields', () => {
  it('should require name');
  it('should require slug');
  it('should require description');
});

describe('Optional Base Fields', () => {
  it('should allow creation without image');
  it('should allow creation without images array');
  it('should allow creation without length/beam/draft');
  it('should allow creation without builder/designer');
  it('should allow creation without launchYear/deliveryYear');
  it('should allow creation without cruisingSpeed/maxSpeed/range');
  it('should allow creation without guests/crew capacity');
});

describe('Field Length Limits', () => {
  it('should enforce name max length (255)');
  it('should enforce slug max length (255)');
  it('should enforce description richText format');
});

describe('Yacht Specifications', () => {
  it('should accept numeric length/beam/draft/displacement');
  it('should accept numeric cruisingSpeed/maxSpeed/range');
  it('should accept numeric launchYear/deliveryYear');
  it('should accept numeric guests/crew');
});

describe('Enhanced Fields Schema', () => {
  it('should accept timeline array');
  it('should accept supplierMap array');
  it('should accept sustainabilityScore group');
  it('should accept customizations array');
  it('should accept maintenanceHistory array');
});
```

---

## 2. Hook Tests (6 tests)

```typescript
describe('Slug Auto-Generation', () => {
  it('should auto-generate slug from yacht name');
  it('should handle special characters in slug');
  it('should preserve manually provided slug');
});

describe('Slug Uniqueness', () => {
  it('should enforce slug uniqueness');
});

describe('Timeline Date Validation', () => {
  it('should validate timeline dates are ISO 8601 format');
  it('should sort timeline events by date');
});
```

---

## 3. Access Control Tests (8 tests)

```typescript
describe('Admin Access', () => {
  it('should allow admin to create yacht');
  it('should allow admin to update any yacht');
  it('should allow admin to delete any yacht');
  it('should allow admin to feature/publish yachts');
});

describe('Public Access', () => {
  it('should allow public to read published yachts');
  it('should filter unpublished yachts from public');
});

describe('Vendor Access', () => {
  it('should block vendors from creating yachts');
  it('should allow vendors to read published yachts');
});
```

---

## 4. Data Validation Tests (30 tests)

### 4.1 Timeline Validation

```typescript
describe('Timeline Validation', () => {
  it('should require date in timeline events', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test Yacht',
          slug: 'test-yacht',
          description: generateMockRichText(),
          timeline: [
            { event: 'Launch' }, // Missing date
          ],
        },
      })
    ).rejects.toThrow(/date.*required/i);
  });

  it('should require event in timeline entries', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test Yacht',
          slug: 'test-yacht',
          description: generateMockRichText(),
          timeline: [
            { date: '2023-01-01' }, // Missing event
          ],
        },
      })
    ).rejects.toThrow(/event.*required/i);
  });

  it('should validate timeline category enum (launch, delivery, refit, milestone, service)', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          timeline: [
            {
              date: '2023-01-01',
              event: 'Test Event',
              category: 'invalid-category',
            },
          ],
        },
      })
    ).rejects.toThrow(/invalid.*category/i);
  });

  it('should accept valid timeline with all fields', async () => {
    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Test Yacht',
        slug: 'test-yacht',
        description: generateMockRichText(),
        timeline: [
          {
            date: '2023-01-01',
            event: 'Yacht Launch',
            description: 'Successful launch ceremony',
            category: 'launch',
            location: 'Monaco',
            images: ['/media/launch1.jpg', '/media/launch2.jpg'],
          },
        ],
      },
    });

    expect(yacht.timeline[0].category).toBe('launch');
    expect(yacht.timeline[0].images).toHaveLength(2);
  });

  it('should accept multiple timeline events');
  it('should validate timeline dates are valid ISO dates');
});
```

### 4.2 Supplier Map Validation

```typescript
describe('Supplier Map Validation', () => {
  it('should require vendor relationship in supplier map', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          supplierMap: [
            {
              discipline: 'Electronics',
              systems: ['Navigation'],
            },
          ],
        },
      })
    ).rejects.toThrow(/vendor.*required/i);
  });

  it('should require discipline in supplier map', async () => {
    const vendor = await createTestVendor(payload, 'free');

    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          supplierMap: [
            {
              vendor: vendor.id,
              systems: ['Navigation'],
            },
          ],
        },
      })
    ).rejects.toThrow(/discipline.*required/i);
  });

  it('should require systems array in supplier map', async () => {
    const vendor = await createTestVendor(payload, 'free');

    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          supplierMap: [
            {
              vendor: vendor.id,
              discipline: 'Electronics',
            },
          ],
        },
      })
    ).rejects.toThrow(/systems.*required/i);
  });

  it('should validate role enum (primary, subcontractor, consultant)', async () => {
    const vendor = await createTestVendor(payload, 'free');

    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          supplierMap: [
            {
              vendor: vendor.id,
              discipline: 'Electronics',
              systems: ['Navigation'],
              role: 'invalid-role',
            },
          ],
        },
      })
    ).rejects.toThrow(/invalid.*role/i);
  });

  it('should accept valid supplier map', async () => {
    const vendor1 = await createTestVendor(payload, 'free');
    const vendor2 = await createTestVendor(payload, 'free');

    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Test Yacht',
        slug: 'test-yacht',
        description: generateMockRichText(),
        supplierMap: [
          {
            vendor: vendor1.id,
            discipline: 'Electronics',
            systems: ['Navigation', 'Communication'],
            role: 'primary',
            projectPhase: 'Build',
          },
          {
            vendor: vendor2.id,
            discipline: 'Lighting',
            systems: ['Interior Lighting'],
            role: 'subcontractor',
            projectPhase: 'Fit-out',
          },
        ],
      },
    });

    expect(yacht.supplierMap).toHaveLength(2);
    expect(yacht.supplierMap[0].role).toBe('primary');
  });

  it('should default role to primary');
  it('should resolve vendor relationships with depth');
});
```

### 4.3 Sustainability Score Validation

```typescript
describe('Sustainability Score Validation', () => {
  it('should accept sustainabilityScore with all numeric fields', async () => {
    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Eco Yacht',
        slug: 'eco-yacht',
        description: generateMockRichText(),
        sustainabilityScore: {
          co2Emissions: 15.5,
          energyEfficiency: 2.3,
          overallScore: 85,
        },
      },
    });

    expect(yacht.sustainabilityScore.co2Emissions).toBe(15.5);
    expect(yacht.sustainabilityScore.overallScore).toBe(85);
  });

  it('should validate wasteManagement enum (excellent, good, fair, poor)', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          sustainabilityScore: {
            wasteManagement: 'invalid-value',
          },
        },
      })
    ).rejects.toThrow(/invalid.*wasteManagement/i);
  });

  it('should accept valid sustainability ratings', async () => {
    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Green Yacht',
        slug: 'green-yacht',
        description: generateMockRichText(),
        sustainabilityScore: {
          wasteManagement: 'excellent',
          waterConservation: 'good',
          materialSustainability: 'fair',
          overallScore: 75,
          certifications: ['ISO 14001', 'Green Marine'],
        },
      },
    });

    expect(yacht.sustainabilityScore.wasteManagement).toBe('excellent');
    expect(yacht.sustainabilityScore.certifications).toHaveLength(2);
  });

  it('should validate overallScore range (1-100)');
});
```

### 4.4 Customizations Validation

```typescript
describe('Customizations Validation', () => {
  it('should require category and description in customizations', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          customizations: [
            { vendor: 'Test Vendor' },
          ],
        },
      })
    ).rejects.toThrow(/category.*description.*required/i);
  });

  it('should accept valid customizations with all fields', async () => {
    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Custom Yacht',
        slug: 'custom-yacht',
        description: generateMockRichText(),
        customizations: [
          {
            category: 'Interior Design',
            description: 'Custom mahogany paneling',
            vendor: 'Luxury Interiors Inc.',
            images: ['/media/custom1.jpg'],
            cost: '$250,000',
            completedDate: '2023-06-15',
          },
        ],
      },
    });

    expect(yacht.customizations[0].category).toBe('Interior Design');
    expect(yacht.customizations[0].completedDate).toBeDefined();
  });

  it('should validate completedDate is ISO date format');
});
```

### 4.5 Maintenance History Validation

```typescript
describe('Maintenance History Validation', () => {
  it('should require date, type, system, description in maintenance history', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          maintenanceHistory: [
            { vendor: 'Test' },
          ],
        },
      })
    ).rejects.toThrow(/required/i);
  });

  it('should validate type enum (routine, repair, upgrade, inspection)', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          maintenanceHistory: [
            {
              date: '2023-01-01',
              type: 'invalid-type',
              system: 'Engine',
              description: 'Test',
            },
          ],
        },
      })
    ).rejects.toThrow(/invalid.*type/i);
  });

  it('should validate status enum (completed, in-progress, scheduled)', async () => {
    await expect(
      payload.create({
        collection: 'yachts',
        data: {
          name: 'Test',
          slug: 'test',
          description: generateMockRichText(),
          maintenanceHistory: [
            {
              date: '2023-01-01',
              type: 'routine',
              system: 'Engine',
              description: 'Oil change',
              status: 'invalid-status',
            },
          ],
        },
      })
    ).rejects.toThrow(/invalid.*status/i);
  });

  it('should accept valid maintenance history', async () => {
    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Maintained Yacht',
        slug: 'maintained-yacht',
        description: generateMockRichText(),
        maintenanceHistory: [
          {
            date: '2023-01-15',
            type: 'routine',
            system: 'Engine',
            description: 'Annual engine service',
            vendor: 'Marine Services Ltd.',
            cost: '$5,000',
            nextService: '2024-01-15',
            status: 'completed',
          },
          {
            date: '2023-03-20',
            type: 'upgrade',
            system: 'Navigation',
            description: 'GPS system upgrade',
            status: 'in-progress',
          },
        ],
      },
    });

    expect(yacht.maintenanceHistory).toHaveLength(2);
    expect(yacht.maintenanceHistory[0].type).toBe('routine');
    expect(yacht.maintenanceHistory[1].status).toBe('in-progress');
  });

  it('should default status to completed');
  it('should validate nextService is ISO date format');
});
```

---

## 5. Relationship Tests (6 tests)

```typescript
describe('Category Relationship', () => {
  it('should accept optional category relationship');
  it('should allow yacht without category');
  it('should resolve category with depth');
});

describe('Tags Relationship', () => {
  it('should accept tags relationship (many-to-many)');
  it('should resolve tags with depth');
});

describe('Supplier Map Vendor Relationships', () => {
  it('should resolve multiple vendor relationships in supplier map', async () => {
    const vendor1 = await createTestVendor(payload, 'free');
    const vendor2 = await createTestVendor(payload, 'free');

    const yacht = await payload.create({
      collection: 'yachts',
      data: {
        name: 'Multi-Vendor Yacht',
        slug: 'multi-vendor-yacht',
        description: generateMockRichText(),
        supplierMap: [
          {
            vendor: vendor1.id,
            discipline: 'Electronics',
            systems: ['Navigation'],
            role: 'primary',
          },
          {
            vendor: vendor2.id,
            discipline: 'Lighting',
            systems: ['LED Systems'],
            role: 'subcontractor',
          },
        ],
      },
    });

    const yachtWithVendors = await payload.findByID({
      collection: 'yachts',
      id: yacht.id,
      depth: 2,
    });

    expect(yachtWithVendors.supplierMap[0].vendor.companyName).toBe(vendor1.companyName);
    expect(yachtWithVendors.supplierMap[1].vendor.companyName).toBe(vendor2.companyName);
  });
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 20        | ✓      |
| Hook Tests             | 6         | ✓      |
| Access Control         | 8         | ✓      |
| Data Validation        | 30        | ✓      |
| Relationship Tests     | 6         | ✓      |
| **Total**              | **70**    | ✓      |

## Notes

- Yachts collection is new (not in TinaCMS)
- Timeline tracks launch, delivery, refits, milestones, and service events
- Supplier map creates many-to-many relationships with vendors
- Sustainability scoring supports green yacht initiatives
- Customizations and maintenance history provide complete yacht lifecycle tracking
- All enum validations are critical for data integrity

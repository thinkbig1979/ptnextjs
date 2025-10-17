# Company Info Collection Test Specification

> Created: 2025-10-15
> Collection: company-info (singleton)
> Total Tests: 36+
> Coverage Target: 95%

## Overview

This specification defines comprehensive test cases for the Company Info singleton collection, including company details, social media, and SEO fields.

---

## 1. Schema Validation Tests (15 tests)

```typescript
describe('Required Fields', () => {
  it('should require name', async () => {
    await expect(
      payload.create({
        collection: 'company-info',
        data: { email: 'info@example.com' },
      })
    ).rejects.toThrow(/name.*required/i);
  });

  it('should require email', async () => {
    await expect(
      payload.create({
        collection: 'company-info',
        data: { name: 'Test Company' },
      })
    ).rejects.toThrow(/email.*required/i);
  });
});

describe('Optional Fields', () => {
  it('should allow creation without tagline');
  it('should allow creation without description');
  it('should allow creation without founded');
  it('should allow creation without location');
  it('should allow creation without address');
  it('should allow creation without phone');
  it('should allow creation without story');
  it('should allow creation without logo');
  it('should allow creation without socialMedia group');
  it('should allow creation without SEO group');
});

describe('Singleton Validation', () => {
  it('should enforce singleton (only one document allowed)', async () => {
    await payload.create({
      collection: 'company-info',
      data: {
        name: 'Company 1',
        email: 'info@company1.com',
      },
    });

    await expect(
      payload.create({
        collection: 'company-info',
        data: {
          name: 'Company 2',
          email: 'info@company2.com',
        },
      })
    ).rejects.toThrow(/singleton.*only one/i);
  });

  it('should allow updating existing singleton', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Original Company',
        email: 'info@original.com',
      },
    });

    const updated = await payload.update({
      collection: 'company-info',
      id: companyInfo.id,
      data: {
        name: 'Updated Company',
      },
    });

    expect(updated.name).toBe('Updated Company');
  });
});
```

---

## 2. Hook Tests (2 tests)

```typescript
describe('Founded Default', () => {
  it('should default founded to current year', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
      },
    });

    const currentYear = new Date().getFullYear();
    expect(companyInfo.founded).toBe(currentYear);
  });

  it('should accept manually provided founded year', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        founded: 2010,
      },
    });

    expect(companyInfo.founded).toBe(2010);
  });
});
```

---

## 3. Access Control Tests (6 tests)

```typescript
describe('Admin Access', () => {
  it('should allow admin to create company info', async () => {
    const admin = await createTestUser(payload, 'admin');

    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
      },
      user: admin,
    });

    expect(companyInfo.id).toBeDefined();
  });

  it('should allow admin to update company info', async () => {
    const admin = await createTestUser(payload, 'admin');

    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Original',
        email: 'info@test.com',
      },
    });

    const updated = await payload.update({
      collection: 'company-info',
      id: companyInfo.id,
      data: { name: 'Updated' },
      user: admin,
    });

    expect(updated.name).toBe('Updated');
  });

  it('should block admin from deleting company info (singleton)');
});

describe('Public Access', () => {
  it('should allow public to read company info', async () => {
    await payload.create({
      collection: 'company-info',
      data: {
        name: 'Public Company',
        email: 'info@public.com',
      },
    });

    const companyInfo = await payload.find({
      collection: 'company-info',
    });

    expect(companyInfo.docs).toHaveLength(1);
  });
});

describe('Vendor Access', () => {
  it('should allow vendors to read company info');
  it('should block vendors from updating company info');
});
```

---

## 4. Data Validation Tests (12 tests)

```typescript
describe('Email Validation', () => {
  it('should accept valid email format', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@example.com',
      },
    });

    expect(companyInfo.email).toBe('info@example.com');
  });

  it('should reject invalid email format');
});

describe('Phone Validation', () => {
  it('should accept valid phone format', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        phone: '+1-555-123-4567',
      },
    });

    expect(companyInfo.phone).toBe('+1-555-123-4567');
  });

  it('should validate phone format');
});

describe('Founded Year Validation', () => {
  it('should accept valid year', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        founded: 2000,
      },
    });

    expect(companyInfo.founded).toBe(2000);
  });

  it('should reject future years');
  it('should reject invalid year format');
});

describe('RichText Fields Validation', () => {
  it('should accept Lexical rich text for description', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        description: generateMockRichText(3),
      },
    });

    expect(companyInfo.description.root).toBeDefined();
  });

  it('should accept Lexical rich text for story', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        story: generateMockRichText(5),
      },
    });

    expect(companyInfo.story.root).toBeDefined();
  });
});

describe('Logo URL Validation', () => {
  it('should accept valid logo URL', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        logo: '/media/logo.png',
      },
    });

    expect(companyInfo.logo).toBe('/media/logo.png');
  });

  it('should validate logo URL format');
});

describe('Social Media URLs Validation', () => {
  it('should accept valid social media URLs', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        socialMedia: {
          facebook: 'https://facebook.com/testcompany',
          twitter: 'https://twitter.com/testcompany',
          linkedin: 'https://linkedin.com/company/testcompany',
          instagram: 'https://instagram.com/testcompany',
          youtube: 'https://youtube.com/@testcompany',
        },
      },
    });

    expect(companyInfo.socialMedia.facebook).toBe('https://facebook.com/testcompany');
    expect(companyInfo.socialMedia.linkedin).toBe('https://linkedin.com/company/testcompany');
  });

  it('should validate social media URL formats');
});

describe('SEO Fields Validation', () => {
  it('should accept SEO group with all fields', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
        seo: {
          metaTitle: 'Test Company - Marine Technology',
          metaDescription: 'Leading provider of marine technology solutions',
          keywords: 'marine, technology, yachts',
          ogImage: '/media/og-image.jpg',
        },
      },
    });

    expect(companyInfo.seo.metaTitle).toBe('Test Company - Marine Technology');
    expect(companyInfo.seo.ogImage).toBe('/media/og-image.jpg');
  });

  it('should validate SEO field lengths');
});
```

---

## 5. Relationship Tests (1 test)

```typescript
describe('No Relationships', () => {
  it('should not have relationships to other collections (singleton)', async () => {
    const companyInfo = await payload.create({
      collection: 'company-info',
      data: {
        name: 'Test Company',
        email: 'info@test.com',
      },
    });

    // Company info is standalone, no relationships
    expect(companyInfo.vendors).toBeUndefined();
    expect(companyInfo.products).toBeUndefined();
  });
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 15        | ✓      |
| Hook Tests             | 2         | ✓      |
| Access Control         | 6         | ✓      |
| Data Validation        | 12        | ✓      |
| Relationship Tests     | 1         | ✓      |
| **Total**              | **36**    | ✓      |

## Notes

- **Singleton collection - only one document allowed**
- Founded defaults to current year
- Description and story use Lexical richText editor
- Social media group is optional but structured
- SEO fields are optional but recommended
- Admin-only updates
- Public can read company info
- No relationships (standalone singleton)

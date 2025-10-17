# Team Members Collection Test Specification

> Created: 2025-10-15
> Collection: team-members
> Total Tests: 29+
> Coverage Target: 95%

## Overview

This specification defines comprehensive test cases for the Team Members collection, including profile information and ordering.

---

## 1. Schema Validation Tests (8 tests)

```typescript
describe('Required Fields', () => {
  it('should require name');
  it('should require role');
});

describe('Optional Fields', () => {
  it('should allow creation without bio');
  it('should allow creation without image');
  it('should allow creation without email');
  it('should allow creation without linkedin');
  it('should allow creation without order');
  it('should default order to 999');
});
```

---

## 2. Hook Tests (3 tests)

```typescript
describe('Order Default', () => {
  it('should default order to 999', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
      },
    });

    expect(member.order).toBe(999);
  });

  it('should accept custom order', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'Jane Smith',
        role: 'CTO',
        order: 1,
      },
    });

    expect(member.order).toBe(1);
  });
});

describe('Timestamps', () => {
  it('should auto-populate createdAt and updatedAt');
});
```

---

## 3. Access Control Tests (6 tests)

```typescript
describe('Admin Access', () => {
  it('should allow admin to create team members', async () => {
    const admin = await createTestUser(payload, 'admin');

    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
      },
      user: admin,
    });

    expect(member.id).toBeDefined();
  });

  it('should allow admin to update team members');
  it('should allow admin to delete team members');
});

describe('Public Access', () => {
  it('should allow public to read team members', async () => {
    await payload.create({
      collection: 'team-members',
      data: {
        name: 'Public Member',
        role: 'Developer',
      },
    });

    const members = await payload.find({
      collection: 'team-members',
    });

    expect(members.docs.length).toBeGreaterThan(0);
  });
});

describe('Vendor Access', () => {
  it('should allow vendors to read team members');
  it('should block vendors from creating/updating/deleting team members');
});
```

---

## 4. Data Validation Tests (10 tests)

```typescript
describe('Name Validation', () => {
  it('should accept valid name', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
      },
    });

    expect(member.name).toBe('John Doe');
  });

  it('should enforce name max length (255)');
});

describe('Role Validation', () => {
  it('should accept valid role', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'Jane Smith',
        role: 'Chief Technology Officer',
      },
    });

    expect(member.role).toBe('Chief Technology Officer');
  });

  it('should enforce role max length (255)');
});

describe('Bio RichText Validation', () => {
  it('should accept Lexical rich text for bio', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
        bio: generateMockRichText(2),
      },
    });

    expect(member.bio.root).toBeDefined();
  });

  it('should allow empty bio');
  it('should validate Lexical format');
});

describe('Email Validation', () => {
  it('should accept valid email format', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
        email: 'john@example.com',
      },
    });

    expect(member.email).toBe('john@example.com');
  });

  it('should reject invalid email format');
});

describe('LinkedIn URL Validation', () => {
  it('should accept valid LinkedIn URL', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
        linkedin: 'https://linkedin.com/in/johndoe',
      },
    });

    expect(member.linkedin).toBe('https://linkedin.com/in/johndoe');
  });

  it('should validate URL format');
});

describe('Image URL Validation', () => {
  it('should accept valid image URL', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
        image: '/media/team/john-doe.jpg',
      },
    });

    expect(member.image).toBe('/media/team/john-doe.jpg');
  });
});
```

---

## 5. Relationship Tests (2 tests)

```typescript
describe('Team Member Ordering', () => {
  it('should order team members by order field', async () => {
    await payload.create({
      collection: 'team-members',
      data: { name: 'Third', role: 'Developer', order: 3 },
    });

    await payload.create({
      collection: 'team-members',
      data: { name: 'First', role: 'CEO', order: 1 },
    });

    await payload.create({
      collection: 'team-members',
      data: { name: 'Second', role: 'CTO', order: 2 },
    });

    const members = await payload.find({
      collection: 'team-members',
      sort: 'order',
    });

    expect(members.docs[0].name).toBe('First');
    expect(members.docs[1].name).toBe('Second');
    expect(members.docs[2].name).toBe('Third');
  });
});

describe('No Direct Relationships', () => {
  it('should not have relationships to other collections', async () => {
    const member = await payload.create({
      collection: 'team-members',
      data: {
        name: 'John Doe',
        role: 'CEO',
      },
    });

    // Team members are standalone, no relationships
    expect(member.vendor).toBeUndefined();
    expect(member.products).toBeUndefined();
  });
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 8         | ✓      |
| Hook Tests             | 3         | ✓      |
| Access Control         | 6         | ✓      |
| Data Validation        | 10        | ✓      |
| Relationship Tests     | 2         | ✓      |
| **Total**              | **29**    | ✓      |

## Notes

- Team members are standalone (no relationships to other collections)
- Order field allows custom sorting (default 999)
- Bio uses Lexical richText editor
- Admin-only creation/update/deletion
- Public can read team member profiles
- Email and LinkedIn are optional contact fields

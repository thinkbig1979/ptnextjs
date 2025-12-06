# Vendor Collection - Developer Guide

## Quick Reference

The Vendors collection has been refactored into a modular structure for better maintainability.

## File Structure

```
payload/collections/vendors/
├── index.ts                    # Main collection (import this)
├── access/
│   └── tier-access.ts          # Reusable access control functions
├── fields/
│   ├── core.ts                 # Basic fields (all tiers)
│   ├── enhanced-profile.ts     # Tier 1+ profile enhancements
│   ├── certifications.ts       # Certifications array
│   ├── awards.ts               # Awards array
│   ├── social-proof.ts         # Social proof metrics
│   ├── video.ts                # Video introduction
│   ├── case-studies.ts         # Case studies array
│   ├── innovation.ts           # Innovation highlights
│   ├── team.ts                 # Team members array
│   ├── yacht-projects.ts       # Yacht projects array
│   ├── media-gallery.ts        # Media gallery array
│   ├── extended-content.ts     # Rich text content
│   ├── locations.ts            # Locations array
│   ├── tier2-fields.ts         # Tier 2 specific fields
│   ├── tier3-promotion.ts      # Tier 3 promotion pack
│   └── metadata.ts             # Status and SEO fields
└── hooks/
    └── index.ts                # Email notification hooks
```

## Common Tasks

### Adding a New Field

1. **Determine the field group** (e.g., social proof, media, etc.)
2. **Edit the appropriate field file** in `fields/`
3. **Add the field to the exported array**

**Example: Add `facebookFollowers` to social proof**

```typescript
// payload/collections/vendors/fields/social-proof.ts

export const socialProofFields: Field[] = [
  // ... existing fields ...

  {
    name: 'facebookFollowers',
    type: 'number',
    admin: {
      description: 'Facebook follower count (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
];
```

### Adding a New Field Group

1. **Create new file** in `fields/` (e.g., `sustainability.ts`)
2. **Export field array**
3. **Import in `index.ts`**
4. **Spread into fields array**

**Example: Add sustainability fields**

```typescript
// payload/collections/vendors/fields/sustainability.ts

import type { Field } from 'payload';
import { tier2UpdateAccess, tier2Condition, publicReadAccess } from '../access/tier-access';

export const sustainabilityFields: Field[] = [
  {
    name: 'carbonNeutral',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description: 'Carbon neutral certified (Tier 2+ only)',
      condition: tier2Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier2UpdateAccess,
    },
  },
  // ... more fields
];
```

```typescript
// payload/collections/vendors/index.ts

import { sustainabilityFields } from './fields/sustainability';

const Vendors: CollectionConfig = {
  // ...
  fields: [
    // ... existing field groups ...
    ...sustainabilityFields,
    // ...
  ],
};
```

### Changing Tier Access Requirements

**Scenario:** Move `videoUrl` from Tier 1+ to Tier 2+

```typescript
// payload/collections/vendors/fields/video.ts

// Before:
import { tier1UpdateAccess, tier1Condition } from '../access/tier-access';

// After:
import { tier2UpdateAccess, tier2Condition } from '../access/tier-access';

export const videoFields: Field[] = [
  {
    name: 'videoUrl',
    type: 'text',
    admin: {
      description: 'Video introduction URL (Tier 2+ only)', // Update description
      condition: tier2Condition, // Changed from tier1Condition
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier2UpdateAccess, // Changed from tier1UpdateAccess
    },
  },
  // ... rest of fields
];
```

### Adding a New Hook

```typescript
// payload/collections/vendors/hooks/index.ts

export const afterUpdateSlugHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (doc.slug !== previousDoc?.slug) {
    console.log(`Slug changed from ${previousDoc?.slug} to ${doc.slug}`);
    // Perform slug change logic (e.g., update URLs, notify, etc.)
  }
};
```

```typescript
// payload/collections/vendors/index.ts

import { afterCreateHook, afterChangeHook, afterDeleteHook, afterUpdateSlugHook } from './hooks';

const Vendors: CollectionConfig = {
  hooks: {
    afterChange: [afterCreateHook, afterChangeHook, afterUpdateSlugHook],
    afterDelete: [afterDeleteHook],
  },
};
```

### Creating Custom Access Control

```typescript
// payload/collections/vendors/access/tier-access.ts

/**
 * Only Tier 3 vendors can update, but Tier 2+ can read
 */
export const tier3UpdateTier2Read: FieldAccess = ({ req: { user }, data }) => {
  if (!user) return { read: true, update: false };
  if (user.role === 'admin') return true;

  const vendorTier = data?.tier || 'free';
  return {
    read: ['tier2', 'tier3'].includes(vendorTier),
    update: vendorTier === 'tier3',
  };
};
```

## Access Control Reference

### Available Access Functions

| Function | Description | Read | Update |
|----------|-------------|------|--------|
| `publicReadAccess` | Everyone can read | ✅ All | ❌ None |
| `adminOnlyUpdateAccess` | Only admins can update | ✅ All | ✅ Admin only |
| `tier1UpdateAccess` | Tier 1+ can update | ✅ All | ✅ Tier 1+ & Admin |
| `tier2UpdateAccess` | Tier 2+ can update | ✅ All | ✅ Tier 2+ & Admin |
| `tier3UpdateAccess` | Tier 3 only can update | ✅ All | ✅ Tier 3 & Admin |

### Available Condition Functions

| Function | Shows field for |
|----------|----------------|
| `tier1Condition` | Tier 1, 2, 3 |
| `tier2Condition` | Tier 2, 3 |
| `tier3Condition` | Tier 3 only |

### Access Control Pattern

Standard pattern for tier-restricted fields:

```typescript
{
  name: 'fieldName',
  type: 'text',
  admin: {
    description: 'Field description (Tier X+ only)',
    condition: tierXCondition, // Shows/hides in admin UI
  },
  access: {
    read: publicReadAccess, // Public can read
    // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
    update: tierXUpdateAccess, // Only Tier X+ can update
  },
}
```

## Field Types Reference

### Common Field Types

```typescript
// Text field
{
  name: 'companyName',
  type: 'text',
  required: true,
  maxLength: 255,
}

// Number field
{
  name: 'employeeCount',
  type: 'number',
  min: 0,
}

// Email field
{
  name: 'contactEmail',
  type: 'email',
  required: true,
}

// Checkbox
{
  name: 'featured',
  type: 'checkbox',
  defaultValue: false,
}

// Select dropdown
{
  name: 'tier',
  type: 'select',
  options: [
    { label: 'Free', value: 'free' },
    { label: 'Tier 1', value: 'tier1' },
  ],
}

// Rich text
{
  name: 'longDescription',
  type: 'richText',
  editor: lexicalEditor(),
}

// Relationship
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  hasMany: false,
}

// Upload (media)
{
  name: 'logo',
  type: 'upload',
  relationTo: 'media',
}

// Array
{
  name: 'certifications',
  type: 'array',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'year', type: 'number' },
  ],
}
```

## Validation Patterns

### Add field validation

```typescript
{
  name: 'website',
  type: 'text',
  validate: (value) => {
    if (!value) return true; // Optional field

    try {
      new URL(value);
      return true;
    } catch {
      return 'Please enter a valid URL';
    }
  },
}
```

### Add field hook

```typescript
import { sanitizeUrlHook } from '../../../../lib/utils/url';

{
  name: 'website',
  type: 'text',
  hooks: {
    beforeChange: [sanitizeUrlHook], // Sanitize before saving
  },
}
```

## Testing

### Test field visibility

```typescript
// Test that tier 1 vendors can see tier 1 fields
const tier1Vendor = { tier: 'tier1' };
expect(tier1Condition(tier1Vendor)).toBe(true);

// Test that free tier cannot see tier 1 fields
const freeVendor = { tier: 'free' };
expect(tier1Condition(freeVendor)).toBe(false);
```

### Test access control

```typescript
const adminUser = { role: 'admin' };
const vendorUser = { role: 'vendor' };
const tier1Data = { tier: 'tier1' };

// Admin can always update
expect(tier1UpdateAccess({ req: { user: adminUser }, data: tier1Data })).toBe(true);

// Vendor with tier 1 can update tier 1 fields
expect(tier1UpdateAccess({ req: { user: vendorUser }, data: tier1Data })).toBe(true);

// Free tier vendor cannot update tier 1 fields
expect(tier1UpdateAccess({ req: { user: vendorUser }, data: { tier: 'free' } })).toBe(false);
```

## Best Practices

### 1. Group Related Fields
Keep logically related fields in the same file (e.g., all video fields in `video.ts`)

### 2. Consistent Naming
- Field files: lowercase with hyphens (e.g., `social-proof.ts`)
- Access functions: camelCase with descriptive names (e.g., `tier1UpdateAccess`)
- Exports: Named exports for arrays, default export for main collection

### 3. Document Field Purpose
Always include `admin.description` to explain field purpose and tier requirements

### 4. Use Reusable Access Control
Always use access control functions from `tier-access.ts` instead of inline logic

### 5. Type Safety
Export proper TypeScript types for field arrays:
```typescript
export const socialProofFields: Field[] = [ /* ... */ ];
```

### 6. Conditional Fields
Use tier conditions for admin UI visibility:
```typescript
admin: {
  condition: tier1Condition, // Hide from free tier in admin UI
}
```

## Troubleshooting

### Field not showing in admin UI

1. Check tier condition matches vendor's tier
2. Verify field exported in field file
3. Verify field group imported and spread in `index.ts`

### Access control not working

1. Check access functions imported from `tier-access.ts`
2. Verify `@ts-expect-error` comment for field-level access
3. Test with different user roles and tiers

### Build errors

1. Run `npm run type-check` to see TypeScript errors
2. Check all imports resolve correctly
3. Verify field types are correct (use `Field` from 'payload')

## Migration from Old Structure

If you have old code referencing the monolithic file:

```diff
- import Vendors from './payload/collections/Vendors';
+ import Vendors from './payload/collections/vendors';
```

The collection slug and all fields remain the same - only the file structure changed.

## Support

For questions or issues:
1. Review this guide
2. Check `/home/edwin/development/ptnextjs/Supporting-Docs/vendor-collection-refactoring/phase1-summary.md`
3. Search for similar patterns in other field files
4. Consult Payload CMS documentation: https://payloadcms.com/docs

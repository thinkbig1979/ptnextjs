# Vendors Collection

Modular vendor/partner management with tier-based access control.

## Structure

```
vendors/
├── index.ts              # Main collection config (import this)
├── access/               # Access control utilities
│   └── tier-access.ts    # Reusable tier-based access functions
├── fields/               # Field definitions by feature group
│   ├── core.ts           # Basic company info (all tiers)
│   ├── enhanced-profile.ts
│   ├── certifications.ts
│   ├── awards.ts
│   ├── social-proof.ts
│   ├── video.ts
│   ├── case-studies.ts
│   ├── innovation.ts
│   ├── team.ts
│   ├── yacht-projects.ts
│   ├── media-gallery.ts
│   ├── extended-content.ts
│   ├── locations.ts
│   ├── tier2-fields.ts
│   ├── tier3-promotion.ts
│   └── metadata.ts
└── hooks/                # Collection hooks
    └── index.ts          # Email notifications
```

## Usage

### Import Collection

```typescript
import Vendors from './payload/collections/vendors';

export default buildConfig({
  collections: [
    Vendors,
    // ... other collections
  ],
});
```

### Add New Field

1. Edit appropriate field file in `fields/`
2. Add field to exported array
3. Use reusable access control from `access/tier-access.ts`

Example:
```typescript
// fields/social-proof.ts
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const socialProofFields: Field[] = [
  {
    name: 'newMetric',
    type: 'number',
    admin: {
      description: 'New metric (Tier 1+ only)',
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

## Access Control

Pre-built access control functions:

- `tier1UpdateAccess` - Tier 1+ can update
- `tier2UpdateAccess` - Tier 2+ can update
- `tier3UpdateAccess` - Tier 3 can update
- `publicReadAccess` - All can read
- `adminOnlyUpdateAccess` - Only admins can update
- `tier1Condition`, `tier2Condition`, `tier3Condition` - Admin UI visibility

## Field Groups

| Group | Tier | Description |
|-------|------|-------------|
| Core | All | Basic company info, contact, category |
| Enhanced Profile | 1+ | Social media, website, founded year |
| Certifications | 1+ | Certifications array |
| Awards | 1+ | Awards array |
| Social Proof | 1+ | Metrics, followers, satisfaction |
| Video | 1+ | Video introduction |
| Case Studies | 1+ | Project case studies |
| Innovation | 1+ | Innovation highlights |
| Team | 1+ | Team members |
| Yacht Projects | 1+ | Yacht projects |
| Media Gallery | 1+ | Image/video gallery |
| Extended Content | 1+ | Rich text, service areas, values |
| Locations | 1+ | Office/service locations |
| Tier 2 Fields | 2+ | Product limits |
| Tier 3 Promotion | 3 | Promotion pack |
| Metadata | All | Published, featured, SEO |

## Hooks

- `afterCreateHook` - Send vendor registration email
- `afterChangeHook` - Send approval/rejection emails
- `afterDeleteHook` - Cleanup (placeholder)

## Documentation

See `/home/edwin/development/ptnextjs/Supporting-Docs/vendor-collection-refactoring/`:
- `phase1-summary.md` - Detailed refactoring summary
- `developer-guide.md` - How to work with this collection
- `migration-checklist.md` - Migration steps

## Benefits

- **Maintainable:** 101 lines main file vs. 1,929 lines monolithic file
- **Reusable:** Single source of truth for access control
- **Organized:** Logical field groupings
- **Testable:** Easy to test individual components
- **Scalable:** Simple to add new fields/groups

# Task: impl-backend-collection

## Task Metadata
- **Task ID**: impl-backend-collection
- **Task Title**: Implement TierUpgradeRequests Payload Collection
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [test-backend-schema]
- **Status**: Pending
- **References**: ptnextjs-bbec (Backend API/Database)

## Objective
Create the TierUpgradeRequests Payload CMS collection following established patterns from the Vendors collection, implementing all schema validations, relationships, access control rules, and hooks required by the test specifications.

## Context
- **Integration Strategy**: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-11-04-tier-upgrade-request-system/integration-strategy.md`
- **Schema Tests**: `/home/edwin/development/ptnextjs/__tests__/payload/collections/TierUpgradeRequests.test.ts`
- **Reference Collection**: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`
- **Config File**: `/home/edwin/development/ptnextjs/payload.config.ts`

## Implementation Details

### File to Create
**Path**: `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts`

### Collection Configuration

#### Basic Structure
```typescript
import type { CollectionConfig } from 'payload';

const TierUpgradeRequests: CollectionConfig = {
  slug: 'tier_upgrade_requests',

  admin: {
    useAsTitle: 'id',
    group: 'Administration',
    defaultColumns: ['vendor', 'currentTier', 'requestedTier', 'status', 'requestedAt'],
  },

  access: {
    // Access control rules (see below)
  },

  fields: [
    // Field definitions (see below)
  ],

  hooks: {
    // Validation hooks (see below)
  },

  timestamps: true, // Auto createdAt/updatedAt
};

export default TierUpgradeRequests;
```

#### Field Definitions (Required by Tests)

1. **vendor** - Relationship to vendors collection
   - Type: `relationship`
   - relationTo: `'vendors'`
   - required: `true`
   - hasMany: `false`
   - index: `true`

2. **user** - Relationship to users collection (submitting user)
   - Type: `relationship`
   - relationTo: `'users'`
   - required: `true`
   - hasMany: `false`

3. **currentTier** - Snapshot of vendor's tier at request time
   - Type: `select`
   - options: `['free', 'tier1', 'tier2', 'tier3']`
   - required: `true`
   - **Auto-populated in beforeChange hook from vendor.tier**

4. **requestedTier** - Requested tier (must be higher than current)
   - Type: `select`
   - options: `['tier1', 'tier2', 'tier3']` (cannot request 'free')
   - required: `true`

5. **status** - Request status
   - Type: `select`
   - options: `['pending', 'approved', 'rejected', 'cancelled']`
   - defaultValue: `'pending'`
   - required: `true`
   - index: `true`

6. **vendorNotes** - Business justification from vendor
   - Type: `textarea`
   - maxLength: `500`
   - required: `false`

7. **rejectionReason** - Admin's reason for rejection
   - Type: `textarea`
   - maxLength: `1000`
   - required: `false`

8. **reviewedBy** - Admin who reviewed the request
   - Type: `relationship`
   - relationTo: `'users'`
   - required: `false`
   - hasMany: `false`

9. **requestedAt** - Timestamp of request submission
   - Type: `date`
   - required: `true`
   - defaultValue: Current timestamp
   - index: `true`

10. **reviewedAt** - Timestamp of admin review
    - Type: `date`
    - required: `false`

#### Access Control Rules (Required by Tests)

**Read Access:**
```typescript
read: ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'vendor') {
    // Vendors can only see their own requests
    return {
      vendor: { equals: user.vendorId }
    };
  }
  return false;
}
```

**Create Access:**
```typescript
create: ({ req: { user } }) => user?.role === 'vendor'
```

**Update Access:**
```typescript
update: ({ req: { user } }) => user?.role === 'admin'
```

**Delete Access:**
```typescript
delete: ({ req: { user } }) => user?.role === 'admin'
```

#### Validation Hooks (Required by Tests)

**beforeChange Hook:**
```typescript
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      // 1. Auto-populate currentTier from vendor on create
      if (operation === 'create' && data.vendor) {
        const vendor = await req.payload.findByID({
          collection: 'vendors',
          id: typeof data.vendor === 'object' ? data.vendor.id : data.vendor,
        });
        data.currentTier = vendor.tier;
      }

      // 2. Validate requested tier > current tier
      if (data.requestedTier && data.currentTier) {
        const tierOrder: Record<string, number> = {
          free: 0,
          tier1: 1,
          tier2: 2,
          tier3: 3
        };

        if (tierOrder[data.requestedTier] <= tierOrder[data.currentTier]) {
          throw new Error('Requested tier must be higher than current tier');
        }
      }

      // 3. Auto-set requestedAt if not provided (on create)
      if (operation === 'create' && !data.requestedAt) {
        data.requestedAt = new Date().toISOString();
      }

      // 4. Validate unique pending request per vendor
      if (operation === 'create' && data.status === 'pending') {
        const existingPending = await req.payload.find({
          collection: 'tier_upgrade_requests',
          where: {
            and: [
              { vendor: { equals: typeof data.vendor === 'object' ? data.vendor.id : data.vendor } },
              { status: { equals: 'pending' } }
            ]
          },
          limit: 1,
        });

        if (existingPending.docs.length > 0) {
          throw new Error('Vendor already has a pending tier upgrade request');
        }
      }

      return data;
    },
  ],
}
```

### Integration with payload.config.ts

Add the collection import and registration:

```typescript
// In payload.config.ts
import TierUpgradeRequests from './payload/collections/TierUpgradeRequests';

export default buildConfig({
  collections: [
    Users,
    Vendors,
    Products,
    Categories,
    Blog,
    Team,
    Company,
    TierUpgradeRequests, // ADD HERE - after Company
  ],
  // ... rest of config
})
```

## Acceptance Criteria

### Schema Validation Tests Pass
- [ ] All required fields validated correctly
- [ ] Optional fields allow undefined values
- [ ] Tier value enums enforced (free/tier1/tier2/tier3 for current, tier1/tier2/tier3 for requested)
- [ ] Cannot request 'free' tier (downgrade prevention)
- [ ] Status enum enforced (pending/approved/rejected/cancelled)
- [ ] Character limits enforced (vendorNotes 500, rejectionReason 1000)

### Tier Upgrade Validation Works
- [ ] Accepts tier1 upgrade from free
- [ ] Accepts tier2 upgrade from tier1
- [ ] Accepts tier3 upgrade from tier2
- [ ] Accepts tier3 upgrade from tier1 (skip tier)
- [ ] Rejects same tier request (tier2 → tier2)
- [ ] Rejects downgrade (tier2 → tier1)
- [ ] Rejects downgrade (tier3 → tier2)
- [ ] Rejects downgrade to free (tier1 → free)

### Unique Pending Constraint Works
- [ ] Allows first pending request for vendor
- [ ] Blocks second pending request for same vendor
- [ ] Allows new request after previous approved
- [ ] Allows new request after previous rejected
- [ ] Allows new request after previous cancelled
- [ ] Allows multiple completed requests (various statuses)

### Relationship Validation Works
- [ ] Requires valid vendor relationship
- [ ] Requires valid user relationship
- [ ] Allows optional reviewedBy relationship
- [ ] Accepts reviewedBy for approved status
- [ ] Accepts reviewedBy for rejected status

### Auto-Population Works
- [ ] Auto-populates currentTier from vendor.tier on create
- [ ] Respects explicitly set currentTier (doesn't override)
- [ ] Handles vendor with free tier
- [ ] Handles vendor with tier3
- [ ] Auto-populates requestedAt if not provided
- [ ] Accepts valid ISO 8601 timestamps

### Access Control Rules Work
- [ ] Admin can read all requests
- [ ] Vendor can read own requests only
- [ ] Vendor cannot read another vendor's requests
- [ ] Vendor can create requests
- [ ] Admin cannot create requests (vendor-only operation)
- [ ] Only admin can update requests
- [ ] Vendor cannot update requests
- [ ] Only admin can delete requests

### Collection Integration Works
- [ ] Collection appears in Payload CMS admin UI under "Administration" group
- [ ] Default columns display correctly in list view
- [ ] Relationships populate correctly in admin UI
- [ ] Foreign key constraints enforced
- [ ] Timestamps (createdAt, updatedAt) auto-generated

## Testing Requirements

### Run Schema Tests
```bash
npm run test -- __tests__/payload/collections/TierUpgradeRequests.test.ts
```

**Expected Result**: All 40+ test cases pass

### Verify Collection in Admin UI
1. Start dev server: `npm run dev`
2. Navigate to `/admin/collections/tier_upgrade_requests`
3. Verify collection appears under "Administration" group
4. Verify default columns display correctly
5. Attempt to create test request (should enforce validation)

### Verify Integration
```bash
# Check collection is registered
grep -A 5 "collections:" payload.config.ts | grep -i "TierUpgradeRequests"
```

## Implementation Checklist

- [ ] Create `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts`
- [ ] Import and register collection in `/home/edwin/development/ptnextjs/payload.config.ts`
- [ ] Implement all 10 field definitions with correct types and constraints
- [ ] Implement all 4 access control rules (read/create/update/delete)
- [ ] Implement beforeChange hook with 4 validation steps
- [ ] Run schema tests and verify all pass
- [ ] Verify collection appears in admin UI
- [ ] Verify timestamps auto-generated
- [ ] Verify relationships populate correctly
- [ ] Mark task complete in tasks.md

## Success Evidence

Provide evidence that the collection is working correctly:

1. **Test Results**: Screenshot or output showing all schema tests passing
2. **Admin UI**: Screenshot of collection in admin UI showing correct columns
3. **Validation**: Screenshot of validation error when attempting invalid request
4. **Relationships**: Screenshot showing vendor/user relationships populated

## Notes

- Follow Payload CMS 3.x type patterns from Vendors collection
- Use `@ts-expect-error` comments for known Payload type mismatches (field-level access control)
- Ensure all database operations are async with proper error handling
- Index vendor_id and status fields for query performance
- The unique pending constraint is enforced in beforeChange hook (database-level constraint may be added later)

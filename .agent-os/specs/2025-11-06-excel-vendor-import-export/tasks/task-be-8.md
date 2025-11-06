# Task BE-8: Create ImportHistory Collection

**Status:** 🔒 Blocked (waiting for BE-1)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 3 hours
**Phase:** Backend Implementation
**Dependencies:** BE-1

## Objective

Create a Payload CMS collection to track import history with metadata, status, changes, and audit trail.

## Context Requirements

- Review payload.config.ts for collection patterns
- Review existing collections (tier_upgrade_requests, vendor_locations)
- Review technical-spec.md section 2.6 on import tracking

## Acceptance Criteria

- [ ] Collection added to `/home/edwin/development/ptnextjs/payload.config.ts`
- [ ] Schema includes: vendor, user, importDate, status, rowsProcessed, successfulRows, failedRows, changes, errors
- [ ] Relationships to vendors and users collections
- [ ] Admin interface for viewing import history
- [ ] Indexes for performance
- [ ] Timestamps (createdAt, updatedAt)
- [ ] Access control (vendors can view their own, admins see all)

## Detailed Specifications

### Collection Schema

```typescript
{
  slug: 'import_history',
  admin: {
    useAsTitle: 'importDate',
    defaultColumns: ['importDate', 'vendor', 'status', 'rowsProcessed'],
    group: 'Vendor Management'
  },
  access: {
    read: ({ req: { user } }) => {
      if (user.role === 'admin') return true;
      return { 'vendor.id': { equals: user.vendorId } };
    }
  },
  fields: [
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'importDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } }
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Partial Success', value: 'partial' },
        { label: 'Failed', value: 'failed' }
      ]
    },
    {
      name: 'rowsProcessed',
      type: 'number',
      required: true
    },
    {
      name: 'successfulRows',
      type: 'number',
      required: true
    },
    {
      name: 'failedRows',
      type: 'number',
      required: true
    },
    {
      name: 'changes',
      type: 'json',
      admin: { description: 'Field-by-field changes made during import' }
    },
    {
      name: 'errors',
      type: 'json',
      admin: { description: 'Errors encountered during import' }
    },
    {
      name: 'filename',
      type: 'text'
    }
  ]
}
```

## Testing Requirements

- Create collection successfully
- Query import history
- Access control works
- Relationships resolve correctly

## Evidence Requirements

- [ ] Collection added to payload.config.ts
- [ ] Admin interface accessible
- [ ] Can create and query records

## Next Steps

Used by BE-7 (ImportExecutionService) and BE-12 (import history API)

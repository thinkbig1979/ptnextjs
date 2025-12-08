# Task: impl-token-version - Implement Token Versioning

## Task Metadata
- **Task ID**: impl-token-version
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-40 minutes
- **Dependencies**: [test-token-version]
- **Status**: [ ] Not Started

## Task Description
Implement token versioning in the Users collection with automatic version increment on password changes and account status changes (suspended/rejected).

## Specifics
- **Files to Modify**:
  - `payload/collections/Users.ts` - Add tokenVersion field and hooks

- **New Field Definition**:
  ```typescript
  {
    name: 'tokenVersion',
    type: 'number',
    defaultValue: 0,
    admin: {
      position: 'sidebar',
      description: 'Incremented to invalidate all existing tokens',
      readOnly: true,
    },
    access: {
      update: () => false, // Only updated via hooks
    },
  }
  ```

- **beforeChange Hook**:
  ```typescript
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        // Increment on password change
        if (operation === 'update' && data.password && originalDoc) {
          data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
        }

        // Increment on status change to suspended/rejected
        if (operation === 'update' && originalDoc) {
          const statusChanged = data.status !== originalDoc.status;
          const newStatusRevokes = ['suspended', 'rejected'].includes(data.status);

          if (statusChanged && newStatusRevokes) {
            data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
          }
        }

        return data;
      },
    ],
  }
  ```

## Acceptance Criteria
- [ ] tokenVersion field exists on Users collection
- [ ] Default value is 0
- [ ] Field is read-only in admin UI
- [ ] Field cannot be directly updated via API
- [ ] Password change triggers version increment
- [ ] Suspension triggers version increment
- [ ] Rejection triggers version increment
- [ ] All test-token-version tests pass

## Context Requirements
- Reference existing Users.ts structure
- Ensure hooks don't conflict with existing hooks

## Implementation Notes
- Use beforeChange hook (not afterChange) to modify data before save
- Handle null/undefined originalDoc for create operations
- Only increment for security-relevant status changes

## Quality Gates
- [ ] All test-token-version tests pass
- [ ] TypeScript compiles without errors
- [ ] Existing user operations still work
- [ ] No regression in vendor registration flow

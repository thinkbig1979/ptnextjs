# Task: impl-audit-collection - Implement AuditLogs Collection

## Task Metadata
- **Task ID**: impl-audit-collection
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [test-audit]
- **Status**: [ ] Not Started

## Task Description
Create the AuditLogs Payload CMS collection with proper schema, access controls, and admin configuration.

## Specifics
- **Files to Create**:
  - `payload/collections/AuditLogs.ts`

- **Files to Modify**:
  - `payload.config.ts` - Register collection

- **Collection Schema**:
  ```typescript
  export const AuditLogs: CollectionConfig = {
    slug: 'audit_logs',
    admin: {
      useAsTitle: 'event',
      description: 'Authentication audit trail',
      defaultColumns: ['event', 'email', 'ipAddress', 'timestamp'],
      group: 'System',
    },
    access: {
      read: ({ req: { user } }) => user?.role === 'admin',
      create: () => false, // Server-only via local API
      update: () => false,
      delete: () => false,
    },
    fields: [
      { name: 'event', type: 'select', required: true, options: [...] },
      { name: 'user', type: 'relationship', relationTo: 'users' },
      { name: 'email', type: 'text', required: true },
      { name: 'ipAddress', type: 'text' },
      { name: 'userAgent', type: 'text' },
      { name: 'tokenId', type: 'text' },
      { name: 'metadata', type: 'json' },
      { name: 'timestamp', type: 'date', required: true },
    ],
    timestamps: false,
  };
  ```

- **Event Types**:
  - LOGIN_SUCCESS, LOGIN_FAILED
  - LOGOUT
  - TOKEN_REFRESH, TOKEN_REFRESH_FAILED
  - PASSWORD_CHANGED
  - ACCOUNT_SUSPENDED, ACCOUNT_APPROVED, ACCOUNT_REJECTED

## Acceptance Criteria
- [ ] Collection file created with correct schema
- [ ] All event types defined in select options
- [ ] Read access restricted to admin only
- [ ] Create/update/delete disabled for external access
- [ ] Collection registered in payload.config.ts
- [ ] Admin UI shows collection in System group
- [ ] Timestamp field configured correctly

## Context Requirements
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/implementation-spec.md`
- Follow existing collection patterns in project

## Implementation Notes
- Use timestamps: false (we have custom timestamp field)
- email field preserved for audit history if user deleted
- metadata field for context-specific info (JSON)
- tokenId captures jti for token tracking

## Quality Gates
- [ ] TypeScript compiles without errors
- [ ] Collection appears in Payload admin
- [ ] Access controls working correctly

# Architecture Decisions

This is the architecture decisions record (ADR) for the spec detailed in @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md

> Created: 2025-11-04
> Version: 1.0.0

## Introduction

This document records the key architectural decisions made during the design and implementation of the tier upgrade request system. Each decision is documented with context, rationale, alternatives considered, and consequences.

## Decision Format

Each architectural decision follows this structure:
- **ID**: Unique identifier (ADR-XXX)
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Context**: What forces are at play? What problem are we solving?
- **Decision**: What did we decide?
- **Alternatives Considered**: What other options did we evaluate?
- **Rationale**: Why did we choose this approach?
- **Consequences**: What are the positive and negative outcomes?
- **Related Decisions**: Links to other ADRs

---

## ADR-001: Use Payload CMS Collection for Tier Requests

**Status**: Accepted

**Date**: 2025-11-04

**Context**

We need persistent storage for tier upgrade requests with the following characteristics:
- Store request metadata (vendor, tiers, justification, status)
- Track approval workflow (reviewer, timestamps, reasons)
- Support querying and filtering (by status, vendor, date)
- Integrate with existing authentication and authorization
- Provide admin interface for management

**Decision**

Create a new Payload CMS collection called `tier_upgrade_requests` to store all tier upgrade request data.

**Alternatives Considered**

1. **Separate database table (outside Payload)**
   - Pros: More control over schema, potentially simpler queries
   - Cons: Separate admin UI needed, duplicate auth logic, no built-in admin interface
   - Rejected: Would require significant additional development for admin UI

2. **File-based storage (JSON files)**
   - Pros: Simple implementation, no database setup
   - Cons: No concurrent access control, difficult to query, doesn't scale
   - Rejected: Not suitable for production use

3. **Use existing vendor collection with nested requests**
   - Pros: No new collection needed
   - Cons: Makes vendor schema complex, difficult to query across all requests, couples unrelated concerns
   - Rejected: Violates single responsibility principle

**Rationale**

Payload CMS collections provide:
- **Built-in admin UI**: Automatic CRUD interface with minimal configuration
- **Authentication/Authorization**: Reuses existing Payload auth system
- **Type safety**: Automatic TypeScript types generated from schema
- **Relationships**: Native support for vendor/user relationships
- **Hooks**: Lifecycle hooks for business logic (e.g., send email on status change)
- **Consistency**: Matches existing data model patterns in the application

**Consequences**

**Positive:**
- Faster development (leverage existing Payload features)
- Consistent with rest of application architecture
- Automatic admin UI with filtering, sorting, pagination
- Type-safe data access with generated types
- Built-in validation and hooks system

**Negative:**
- Coupled to Payload CMS (harder to migrate away if needed)
- Must follow Payload's data modeling constraints
- Performance limited by Payload's query layer

**Mitigation:**
- Abstract data access behind service layer (TierUpgradeRequestService)
- Can add custom indexes to underlying database if needed
- Can implement custom queries if Payload's query layer insufficient

**Related Decisions**: ADR-004 (Payload Admin UI)

---

## ADR-002: Separate Vendor and Admin API Endpoints

**Status**: Accepted

**Date**: 2025-11-04

**Context**

We need API endpoints for two different user types with different permissions:
- **Vendors**: Submit, view, and cancel own requests
- **Admins**: View all requests, approve, reject

These have different authorization requirements and rate limits.

**Decision**

Create two separate API endpoint namespaces:
- `/api/portal/vendors/[id]/tier-upgrade-requests` - Vendor endpoints
- `/api/admin/tier-upgrade-requests` - Admin endpoints

**Alternatives Considered**

1. **Single unified API endpoint with role-based filtering**
   - Example: `/api/tier-upgrade-requests` (role determines what you see)
   - Pros: Simpler URL structure, fewer endpoints
   - Cons: Complex authorization logic, easy to accidentally leak data, harder to apply different rate limits
   - Rejected: Security risk too high

2. **Use Payload CMS API directly**
   - Example: `/api/tier-upgrade-requests` (Payload's auto-generated API)
   - Pros: No custom endpoints needed, automatic CRUD
   - Cons: Less control over business logic, harder to customize responses, exposes Payload internals
   - Rejected: Insufficient control for complex business logic

3. **GraphQL API with field-level authorization**
   - Pros: Flexible querying, single endpoint
   - Cons: Adds complexity, no existing GraphQL setup, learning curve
   - Rejected: Overkill for this feature

**Rationale**

Separate endpoints provide:
- **Clear separation of concerns**: Vendor actions vs admin actions
- **Easier authorization**: Simple checks per namespace (vendor owns resource vs user is admin)
- **Different rate limits**: Vendors limited to 10/hour, admins 1000/hour
- **Explicit security**: No chance of accidentally exposing admin actions to vendors
- **RESTful design**: Resource-based URLs align with REST principles

**Consequences**

**Positive:**
- Authorization logic is simple and explicit
- Rate limiting can be applied differently per role
- API surface is clear (vendors can't accidentally access admin endpoints)
- Easier to audit and secure (fewer code paths)
- URL structure is self-documenting

**Negative:**
- More endpoint files to maintain
- Some code duplication (e.g., request retrieval logic)
- More test coverage needed (test both namespaces)

**Mitigation:**
- Extract shared logic to service layer (TierUpgradeRequestService)
- Use shared validation schemas (Zod)
- Comprehensive integration tests for both namespaces

**Related Decisions**: ADR-003 (Atomic Tier Update)

---

## ADR-003: Atomic Tier Update on Approval

**Status**: Accepted

**Date**: 2025-11-04

**Context**

When an admin approves a tier upgrade request, two things must happen:
1. Vendor's tier must be updated
2. Request status must be updated to "approved"

These updates must be atomic - either both succeed or both fail. Partial updates would leave the system in an inconsistent state (e.g., request marked approved but tier unchanged).

**Decision**

Use a database transaction to update both the vendor tier and request status atomically in a single API call.

**Alternatives Considered**

1. **Two-phase commit with manual rollback**
   - Update vendor tier first, then request status
   - If second update fails, manually revert first update
   - Pros: More control over rollback logic
   - Cons: Complex error handling, risk of partial state if rollback fails
   - Rejected: Too error-prone

2. **Optimistic update (update request first, tier eventually)**
   - Update request to "approved", then update tier asynchronously
   - Pros: Faster response to admin, decouples operations
   - Cons: System in inconsistent state temporarily, complex retry logic if tier update fails
   - Rejected: Violates consistency requirements

3. **Saga pattern with compensation**
   - Use distributed transaction pattern with compensating actions
   - Pros: More robust for distributed systems
   - Cons: Overkill for single-database operations, added complexity
   - Rejected: Not necessary for this use case

**Rationale**

Database transactions provide:
- **ACID guarantees**: Atomicity ensures both updates happen or neither
- **Simplicity**: Single transaction block, easy to understand
- **Consistency**: System never in intermediate state
- **Built-in rollback**: Database handles rollback on error automatically

**Consequences**

**Positive:**
- Data consistency guaranteed (no partial updates)
- Simpler error handling (single try/catch block)
- Database handles concurrency and locking
- Clear semantics (approval is all-or-nothing)

**Negative:**
- Transaction locks both records (small performance impact)
- Longer-running transactions if email notification added
- Must ensure transaction timeout is reasonable

**Mitigation:**
- Keep transaction scope small (just database updates)
- Send email notifications *after* transaction commits
- Set reasonable transaction timeout (5 seconds)
- Monitor for transaction deadlocks

**Implementation Example:**

```typescript
async approveTierUpgradeRequest(requestId: string, adminUserId: string) {
  await payload.db.beginTransaction()

  try {
    const request = await payload.findByID({
      collection: 'tier-upgrade-requests',
      id: requestId
    })

    // Update vendor tier
    await payload.update({
      collection: 'vendors',
      id: request.vendor.id,
      data: { tier: request.targetTier }
    })

    // Update request status
    await payload.update({
      collection: 'tier-upgrade-requests',
      id: requestId,
      data: {
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: new Date()
      }
    })

    await payload.db.commitTransaction()

    // Send notification AFTER commit (outside transaction)
    await sendApprovalEmail(request)
  } catch (error) {
    await payload.db.rollbackTransaction()
    throw error
  }
}
```

**Related Decisions**: ADR-002 (API Endpoints)

---

## ADR-004: Use Payload Admin UI for Request Management

**Status**: Accepted

**Date**: 2025-11-04

**Context**

Admins need an interface to:
- View all tier upgrade requests
- Filter by status, tier, date
- Approve or reject requests
- View vendor context and justification

We need to decide whether to build a custom admin portal or extend the existing Payload CMS admin interface.

**Decision**

Extend the Payload CMS admin interface at `/admin` with custom components for tier upgrade request management.

**Alternatives Considered**

1. **Separate admin portal (custom React app)**
   - Build standalone admin dashboard (e.g., `/admin-portal`)
   - Pros: Complete control over UI/UX, no Payload constraints
   - Cons: Must implement auth, navigation, CRUD UI from scratch, more development time
   - Rejected: Too much additional development for marginal benefit

2. **Build admin interface in vendor portal**
   - Add admin-only pages to `/portal/admin/...`
   - Pros: Single application, consistent with vendor portal
   - Cons: Mixes concerns (vendors and admins), complex permission logic
   - Rejected: Confusing UX, security risk

3. **Command-line interface (CLI) for admins**
   - Approve/reject requests via CLI commands
   - Pros: Simple implementation, no UI needed
   - Cons: Poor UX, no visual context, requires terminal access
   - Rejected: Unacceptable UX for admins

**Rationale**

Extending Payload admin UI provides:
- **Existing authentication**: Reuse Payload's admin auth system
- **Built-in components**: Tables, forms, filters already provided
- **Consistent UX**: Matches other admin tasks (vendor management, user management)
- **Rapid development**: Customize existing UI rather than build from scratch
- **Maintainability**: Single admin interface to maintain

Payload admin customization options:
- Custom collection views (list and edit)
- Custom components within admin UI
- Custom dashboard widgets
- Hooks for business logic

**Consequences**

**Positive:**
- Faster development (reuse Payload components)
- Consistent admin UX across all collections
- Built-in auth and permissions
- Automatic responsive design
- No separate admin app to deploy

**Negative:**
- Constrained by Payload's UI framework
- Must learn Payload's component system
- Limited customization (must work within Payload's structure)
- Performance tied to Payload admin

**Mitigation:**
- For complex UI needs, can embed custom React components
- Can add custom API endpoints for advanced queries
- Can optimize with database indexes if performance issues

**Implementation Approach:**

```typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'tier-upgrade-requests',
      admin: {
        useAsTitle: 'id',
        defaultColumns: ['vendor', 'currentTier', 'targetTier', 'status', 'createdAt'],
        components: {
          views: {
            List: {
              Component: '/components/admin/TierUpgradeRequestList',
            },
            Edit: {
              Component: '/components/admin/TierUpgradeRequestEdit',
            }
          }
        }
      },
      fields: [
        // ... field definitions
      ],
      hooks: {
        afterChange: [
          async ({ doc, operation }) => {
            // Send email on status change
            if (operation === 'update' && doc.status !== 'pending') {
              await sendStatusChangeEmail(doc)
            }
          }
        ]
      }
    }
  ]
})
```

**Related Decisions**: ADR-001 (Payload Collection)

---

## ADR-005: Use SQLite for Development, PostgreSQL for Production

**Status**: Accepted

**Date**: 2025-11-04

**Context**

The application currently uses SQLite for local development and will use PostgreSQL for production. We need to ensure the tier upgrade request system works with both databases.

**Decision**

Design the data model and queries to be compatible with both SQLite (development) and PostgreSQL (production), using Payload CMS as the abstraction layer.

**Alternatives Considered**

1. **Use PostgreSQL for both dev and production**
   - Pros: Identical environments, no compatibility issues
   - Cons: Requires Docker/Postgres setup for every developer, slower dev setup
   - Rejected: Added friction for local development

2. **Use SQLite for both dev and production**
   - Pros: Simple setup, file-based database
   - Cons: Not suitable for production (concurrency, performance, backup limitations)
   - Rejected: Production requirements demand PostgreSQL

3. **Different schemas for SQLite vs PostgreSQL**
   - Use features specific to each database
   - Pros: Optimize for each database
   - Cons: Complex migrations, dual codebases, testing complexity
   - Rejected: Maintenance burden too high

**Rationale**

Using Payload CMS as abstraction layer:
- **Database agnostic**: Payload handles SQL differences
- **Consistent API**: Same code works with both databases
- **Easy migrations**: Payload migrations work for both
- **Type safety**: Generated types work with both

Constraints to maintain compatibility:
- Use standard SQL types (TEXT, INTEGER, TIMESTAMP)
- Avoid database-specific features (e.g., PostgreSQL arrays, JSON columns)
- Test with both databases in CI

**Consequences**

**Positive:**
- Developers can use lightweight SQLite locally
- Production uses robust PostgreSQL
- Single codebase for both environments
- Easier onboarding (no DB setup required locally)

**Negative:**
- Cannot use PostgreSQL-specific features (e.g., full-text search)
- Must test with both databases
- Slight performance differences between environments

**Mitigation:**
- Use Payload's built-in search (works with both)
- Add PostgreSQL-specific optimizations only if needed (feature flags)
- Run E2E tests against PostgreSQL in CI

**Testing Strategy:**
- Unit/integration tests: SQLite (faster)
- E2E tests (CI): PostgreSQL (production-like)
- Manual testing: Both databases

**Related Decisions**: ADR-001 (Payload Collection)

---

## ADR-006: Rate Limiting Strategy

**Status**: Accepted

**Date**: 2025-11-04

**Context**

We need to prevent abuse of the tier upgrade request system:
- Prevent spam requests from single vendor
- Protect admin endpoints from DDoS
- Ensure fair resource usage

**Decision**

Implement tiered rate limiting:
- **Vendor POST (submit)**: 10 requests/hour per vendor
- **Vendor GET (list)**: 100 requests/hour per vendor
- **Admin endpoints**: 1000 requests/hour per user

**Alternatives Considered**

1. **No rate limiting**
   - Pros: Simpler implementation, no false positives
   - Cons: Vulnerable to abuse, spam requests
   - Rejected: Unacceptable security risk

2. **Very strict rate limiting (1 request/day)**
   - Pros: Prevents abuse completely
   - Cons: Legitimate users might hit limit (e.g., fixing mistakes)
   - Rejected: Too restrictive for legitimate use

3. **Adaptive rate limiting (based on behavior)**
   - Increase limits for well-behaved users, decrease for suspicious
   - Pros: More flexible, better UX
   - Cons: Complex to implement, hard to predict behavior
   - Rejected: Overengineered for MVP

4. **CAPTCHA-based rate limiting**
   - Require CAPTCHA after N requests
   - Pros: Blocks bots, allows legitimate users
   - Cons: Poor UX, adds dependency
   - Rejected: Hurts UX for rare event

**Rationale**

Chosen limits balance:
- **Security**: Prevent spam and abuse
- **Usability**: Allow legitimate use cases (resubmit after rejection)
- **Fairness**: No single vendor can overwhelm system

10 requests/hour for submissions is generous because:
- Tier upgrade is rare event (maybe once per quarter)
- Allows for mistakes (wrong tier, typo in justification)
- Still prevents spam (120 requests/day is clearly abuse)

**Consequences**

**Positive:**
- Protects system from spam and abuse
- Prevents accidental infinite loops in integrations
- Fair resource allocation across vendors
- Simple to implement (using express-rate-limit)

**Negative:**
- Edge case: Vendor might hit limit if testing integration
- Must communicate limits clearly to users
- Need to handle rate limit errors gracefully

**Mitigation:**
- Display remaining requests in UI (header: X-RateLimit-Remaining)
- Clear error message when limit hit
- Admins can manually submit on vendor's behalf if needed
- Can increase limit for specific vendors if justified

**Implementation:**

```typescript
import rateLimit from 'express-rate-limit'

const vendorSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user.vendorId,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many tier upgrade requests. You can submit up to 10 requests per hour.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    })
  },
  skip: (req) => req.user.role === 'admin' // Admins exempt
})
```

**Related Decisions**: ADR-002 (API Endpoints)

---

## ADR-007: Request Status State Machine

**Status**: Accepted

**Date**: 2025-11-04

**Context**

Tier upgrade requests go through different states:
- pending → approved
- pending → rejected
- pending → cancelled

We need to define valid state transitions and prevent invalid ones.

**Decision**

Implement a state machine with these states and transitions:

```
pending → approved  (admin action)
pending → rejected  (admin action)
pending → cancelled (vendor action)
```

Final states (no further transitions):
- approved
- rejected
- cancelled

**Alternatives Considered**

1. **Allow any status change**
   - Pros: Maximum flexibility
   - Cons: Can create invalid states (e.g., approved → cancelled)
   - Rejected: Too error-prone

2. **Allow re-opening requests**
   - rejected → pending (vendor resubmits same request)
   - Pros: Saves vendor from creating new request
   - Cons: Loses audit trail, confusing history
   - Rejected: Better to create new request

3. **Add "processing" intermediate state**
   - pending → processing → approved/rejected
   - Pros: Shows admin is reviewing
   - Cons: Adds complexity, not needed for MVP
   - Rejected: Not enough value for complexity

**Rationale**

Simple state machine provides:
- **Clear semantics**: Each status has defined meaning
- **Validation**: Prevent invalid transitions
- **Audit trail**: Status changes are permanent
- **Predictability**: Easy to understand and debug

One-way transitions ensure:
- History is preserved (cannot undo approval)
- Admin decisions are final
- Vendor must create new request if needed

**Consequences**

**Positive:**
- Clear business rules (easy to explain to users)
- Simple validation logic
- Immutable history (good for auditing)
- No ambiguous states

**Negative:**
- Cannot "undo" approval or rejection
- Vendor must create new request if rejected (can't edit existing)
- No "draft" state (submit immediately)

**Mitigation:**
- If admin makes mistake, can manually adjust tier separately
- Vendor can submit unlimited new requests (within rate limit)
- Clear confirmation dialogs before approve/reject

**Implementation:**

```typescript
const VALID_TRANSITIONS = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: [],
  rejected: [],
  cancelled: []
}

function validateStatusTransition(
  currentStatus: Status,
  newStatus: Status
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(newStatus)
}

async function updateStatus(requestId: string, newStatus: Status) {
  const request = await findById(requestId)

  if (!validateStatusTransition(request.status, newStatus)) {
    throw new Error(
      `Invalid status transition: ${request.status} → ${newStatus}`
    )
  }

  // Update status...
}
```

**Related Decisions**: ADR-003 (Atomic Tier Update)

---

## Technical Constraints

### Platform Constraints

**Next.js App Router:**
- All pages must be in `app/` directory
- API routes in `app/api/` directory
- Server components by default (client components marked with 'use client')

**Static Site Generation:**
- All data must be available at build time
- API routes work at runtime (not statically generated)
- Dashboard is client-side rendered (requires authentication)

**Payload CMS 3:**
- Uses Payload 3 authentication system
- Collections defined in `payload.config.ts`
- Automatic TypeScript types generated
- Built-in admin UI customization

### Database Constraints

**SQLite (Development):**
- Single file database (`payload.db`)
- Limited concurrent writes
- No full-text search
- Good for local development

**PostgreSQL (Production):**
- Full ACID compliance
- Better concurrency
- Advanced indexing
- Production-ready

**Compatibility Requirements:**
- Use standard SQL types
- Avoid DB-specific features in business logic
- Test with both databases

### Security Constraints

**Authentication:**
- JWT tokens (Payload CMS)
- HttpOnly cookies for admin
- Bearer tokens for API

**Authorization:**
- Role-based access control (vendor, admin)
- Resource-level permissions (vendor can only access own requests)

**Data Protection:**
- HTTPS only in production
- CSRF protection on all mutations
- Input validation and sanitization
- Rate limiting on all endpoints

### Performance Constraints

**API Response Times (95th percentile):**
- Request submission: <500ms
- List requests: <2s
- Approve/reject: <500ms

**Database:**
- Index on frequently queried fields
- Limit query results (pagination)
- Use eager loading for relationships (avoid N+1)

**Frontend:**
- Lazy load components
- Optimize images
- Minimize bundle size

## Future Considerations

### Potential Future Enhancements

**Email Notifications (Phase 2):**
- Notify admins when request submitted
- Notify vendor when request approved/rejected
- Integration: SendGrid, AWS SES, or Resend

**Bulk Actions (Phase 2):**
- Approve multiple requests at once
- Reject multiple requests with same reason
- Implementation: Batch transaction

**Request History (Phase 2):**
- View all past requests for vendor
- Show timeline of status changes
- Track who made each change

**Analytics (Phase 2):**
- Track request submission rate
- Monitor approval/rejection rates
- Average review time
- Integration: Existing analytics platform

### Scalability Considerations

**Current design supports:**
- 1000s of vendors
- 100s of requests per day
- 10s of admins

**If scale exceeds expectations:**
- Add read replicas for list queries
- Implement caching layer (Redis)
- Add background job queue for email notifications
- Consider event-driven architecture

### Monitoring and Observability

**Metrics to track:**
- Request submission rate (per hour, per day)
- Approval/rejection rates
- Average time to review (submitted → approved/rejected)
- Error rates by endpoint
- API response times

**Alerts:**
- Error rate >1%
- Response time >2s (p95)
- Failed tier updates
- Rate limit exceeded frequently

## Decision Review Process

**When to review:**
- Quarterly architecture review
- Before major feature additions
- When constraints change (e.g., new database, new framework)
- When technical debt becomes problematic

**How to propose changes:**
1. Create new ADR with "Proposed" status
2. Discuss with team (async or meeting)
3. Update status to "Accepted" or "Rejected"
4. If accepted, create implementation plan
5. If superseded, mark old ADR as "Superseded by ADR-XXX"

**Review checklist:**
- Is the decision still valid given current constraints?
- Have any consequences proven problematic?
- Are there better alternatives now available?
- Does the decision still align with project goals?

## Glossary

**ACID**: Atomicity, Consistency, Isolation, Durability (database transaction properties)

**ADR**: Architecture Decision Record (this document)

**CRUD**: Create, Read, Update, Delete (basic data operations)

**DDoS**: Distributed Denial of Service (type of attack)

**JWT**: JSON Web Token (authentication token format)

**MVP**: Minimum Viable Product (initial feature set)

**N+1 Query**: Database anti-pattern where N queries are executed in a loop instead of a single join

**ORM**: Object-Relational Mapping (database abstraction layer)

**CSRF**: Cross-Site Request Forgery (security vulnerability)

**XSS**: Cross-Site Scripting (security vulnerability)

**SLA**: Service Level Agreement (performance target)

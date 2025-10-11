# Integration Requirements

This is the integration requirements specification for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## System Integration Overview

### Integration Architecture and Patterns

**Architecture Pattern**: Layered architecture with clear separation of concerns

```
┌────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                         │
│  (Next.js Pages, React Components, User Interface)            │
└─────────────────┬──────────────────────────────────────────────┘
                  │ HTTP Requests / API Calls
┌─────────────────▼──────────────────────────────────────────────┐
│                      API Gateway Layer                         │
│  (Next.js API Routes, Request Validation, Auth Middleware)    │
└─────────────────┬──────────────────────────────────────────────┘
                  │ Service Invocation
┌─────────────────▼──────────────────────────────────────────────┐
│                    Business Logic Layer                        │
│  (Services: VendorService, AuthService, ApprovalService)      │
└─────────────────┬──────────────────────────────────────────────┘
                  │ Data Access Operations
┌─────────────────▼──────────────────────────────────────────────┐
│                    Data Access Layer                           │
│  (Payload CMS Local API, Database Queries)                    │
└─────────────────┬──────────────────────────────────────────────┘
                  │ SQL Queries / Transactions
┌─────────────────▼──────────────────────────────────────────────┐
│                   Database Layer                               │
│  (PostgreSQL 17+, Schema, Indexes, Constraints)               │
└────────────────────────────────────────────────────────────────┘
```

**Integration Patterns Used**:
1. **Repository Pattern**: PayloadCMSDataService abstracts database access, providing a consistent interface for data operations
2. **Middleware Pattern**: Authentication and authorization implemented as Express-style middleware that wraps API routes
3. **Service Layer Pattern**: Business logic encapsulated in service classes, called by API routes
4. **Adapter Pattern**: TinaCMSDataService interface maintained but backed by Payload CMS for backward compatibility
5. **Factory Pattern**: Migration scripts use factories to transform markdown data to Payload CMS format

### Data Flow Specification

**User Registration Flow**:
```
Browser (VendorRegistrationForm)
  │
  ├─> React Hook Form validation (client-side)
  │
  └─> POST /api/vendors/register (HTTP)
        │
        ├─> API Route Handler
        │     ├─> Zod schema validation (server-side)
        │     └─> VendorService.createVendor()
        │           ├─> Check duplicate email (Payload CMS find query)
        │           ├─> Hash password (bcrypt)
        │           ├─> Create user record (users table, status=pending)
        │           ├─> Create vendor record (vendors table, tier=free)
        │           └─> Commit transaction
        │
        └─> Response { success: true, data: { vendorId, status } }
              │
              └─> SWR cache update (frontend)
                    │
                    └─> Navigate to /vendor/registration-pending
```

**Admin Approval Flow**:
```
Admin Dashboard (AdminApprovalQueue)
  │
  ├─> Fetch pending vendors (GET /api/admin/vendors/pending)
  │     │
  │     └─> SWR caches vendor list
  │
  └─> Admin clicks "Approve" → Dialog opens
        │
        └─> POST /api/admin/vendors/{id}/approve
              │
              ├─> Auth middleware validates admin role
              │
              ├─> ApprovalService.approveVendor()
              │     ├─> Update users.status = 'approved'
              │     ├─> Update users.approved_at = NOW()
              │     ├─> Update vendors.published = true
              │     ├─> Update vendors.tier (if specified)
              │     └─> Commit transaction
              │
              └─> Response { success: true }
                    │
                    └─> SWR revalidates vendor list
                          │
                          └─> Table updates, removes approved vendor
```

**Vendor Profile Edit Flow**:
```
Vendor Dashboard (VendorProfileEditor)
  │
  ├─> Fetch vendor data (GET /api/vendors/{id} via SWR)
  │     │
  │     └─> Pre-fill form fields
  │
  └─> Vendor edits fields → Click "Save"
        │
        └─> PUT /api/vendors/{id}
              │
              ├─> Auth middleware validates JWT token
              │
              ├─> VendorService.updateVendor()
              │     ├─> Validate vendor owns this profile
              │     ├─> Check tier restrictions on fields
              │     ├─> Filter restricted fields from update
              │     ├─> Update vendors table (allowed fields only)
              │     └─> Return updated vendor
              │
              └─> Response { success: true, data: { vendor } }
                    │
                    └─> SWR revalidates vendor data
                          │
                          └─> Form shows updated values
```

### System Interaction Mapping

**Frontend ↔ Backend Interactions**:

| Frontend Component | API Endpoint | HTTP Method | Purpose | Data Flow |
|---|---|---|---|---|
| VendorRegistrationForm | /api/vendors/register | POST | Create new vendor account | Form data → API → Database |
| VendorLoginForm | /api/auth/login | POST | Authenticate user | Credentials → API → JWT token |
| VendorProfileEditor | /api/vendors/{id} | GET | Fetch vendor profile | Database → API → Component |
| VendorProfileEditor | /api/vendors/{id} | PUT | Update vendor profile | Form data → API → Database |
| AdminApprovalQueue | /api/admin/vendors/pending | GET | Fetch pending vendors | Database → API → Component |
| AdminApprovalQueue | /api/admin/vendors/{id}/approve | POST | Approve vendor | Action → API → Database update |
| AdminApprovalQueue | /api/admin/vendors/{id}/reject | POST | Reject vendor | Action + reason → API → Database |
| Public vendor list | /api/vendors | GET | Display vendors | Database → API → Component |
| Public product list | /api/products | GET | Display products | Database → API → Component |

**Backend ↔ Database Interactions**:

| Service Method | Database Operation | Tables Affected | Transaction Scope |
|---|---|---|---|
| VendorService.createVendor() | INSERT | users, vendors | Single transaction |
| AuthService.login() | SELECT | users | Read-only |
| VendorService.updateVendor() | UPDATE | vendors | Single transaction |
| ApprovalService.approveVendor() | UPDATE | users, vendors | Single transaction |
| ApprovalService.rejectVendor() | UPDATE | users | Single transaction |
| VendorService.getVendorById() | SELECT with JOIN | vendors, users | Read-only |
| ProductService.getProductsByVendor() | SELECT with JOIN | products, vendors | Read-only |

**Migration ↔ Payload CMS Interactions**:

| Migration Script | Source | Transformation | Payload CMS Collection | Output |
|---|---|---|---|---|
| migrate-vendors.ts | content/vendors/*.md | Markdown → JSON | Vendors | PostgreSQL vendors table |
| migrate-products.ts | content/products/*.md | Markdown → JSON + resolve vendor refs | Products | PostgreSQL products table |
| migrate-categories.ts | content/categories/*.md | Markdown → JSON + hierarchy | Categories | PostgreSQL categories table |
| migrate-blog.ts | content/blog/*.md | Markdown → JSON + parse date | BlogPosts | PostgreSQL blog_posts table |
| migrate-team.ts | content/team/*.md | Markdown → JSON | TeamMembers | PostgreSQL team_members table |
| migrate-company.ts | content/company/*.md | Markdown → JSON | CompanyInfo | PostgreSQL company_info table |

## API Integration Requirements

### REST API Specifications and Contracts

**API Design Principles**:
- RESTful resource-based URLs
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response format across all endpoints
- Versioning via URL path (currently v1 implicit, future /api/v2)
- Pagination for list endpoints (limit, offset, total)
- Filtering via query parameters

**Standard Response Format**:
```typescript
interface SuccessResponse<T> {
  success: true
  data: T
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
  }
}

interface ErrorResponse {
  success: false
  error: {
    code: string // Machine-readable error code
    message: string // Human-readable error message
    details?: string // Additional technical details
    fields?: { [key: string]: string } // Field-specific errors
    timestamp: string
  }
}
```

**HTTP Status Code Usage**:
- 200 OK: Successful GET, PUT, DELETE
- 201 Created: Successful POST (resource creation)
- 204 No Content: Successful DELETE with no response body
- 400 Bad Request: Validation errors, malformed request
- 401 Unauthorized: Missing or invalid authentication token
- 403 Forbidden: Valid auth but insufficient permissions
- 404 Not Found: Resource does not exist
- 409 Conflict: Duplicate resource (e.g., email already exists)
- 422 Unprocessable Entity: Business logic validation failure
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Unexpected server error

### Authentication and Authorization Requirements

**Authentication Method**: JWT (JSON Web Tokens) with httpOnly cookies

**JWT Token Structure**:
```typescript
interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'vendor'
  tier?: 'free' | 'tier1' | 'tier2' // Only for vendor role
  iat: number // Issued at timestamp
  exp: number // Expiration timestamp
}
```

**Token Lifecycle**:
1. **Login**: User authenticates → API generates access token (1 hour expiry) and refresh token (7 days expiry)
2. **Token Storage**: Access token stored in httpOnly cookie (XSS protection), refresh token stored in separate httpOnly cookie
3. **API Requests**: Frontend automatically sends access token cookie with each request
4. **Token Validation**: Auth middleware validates token signature and expiration on each protected route
5. **Token Refresh**: When access token expires, frontend calls /api/auth/refresh with refresh token to get new access token
6. **Logout**: Frontend calls /api/auth/logout → API blacklists refresh token and clears cookies

**Authorization Middleware**:
```typescript
// lib/middleware/auth.ts
export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get('access_token')
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }), { status: 401 })
  }

  const payload = await verifyJWT(token.value)
  if (!payload) {
    return new Response(JSON.stringify({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } }), { status: 401 })
  }

  // Attach user to request context
  req.user = payload
  return null // Continue to route handler
}

export async function requireAdmin(req: NextRequest) {
  const authError = await requireAuth(req)
  if (authError) return authError

  if (req.user.role !== 'admin') {
    return new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }), { status: 403 })
  }

  return null
}

export async function requireVendor(req: NextRequest) {
  const authError = await requireAuth(req)
  if (authError) return authError

  if (req.user.role !== 'vendor') {
    return new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Vendor access required' } }), { status: 403 })
  }

  return null
}
```

### Rate Limiting and Error Handling

**Rate Limiting Strategy**:
- **Authentication endpoints** (/api/auth/login): 10 requests per minute per IP address (brute force protection)
- **Public endpoints** (/api/vendors, /api/products): 100 requests per minute per IP address
- **Authenticated endpoints**: 200 requests per minute per user (based on JWT user ID)
- **Admin endpoints**: No rate limiting (trusted users)

**Rate Limiting Implementation**:
```typescript
// lib/middleware/rate-limit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible'

const authLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
})

export async function rateLimitAuth(req: NextRequest) {
  const ip = req.ip || 'unknown'
  try {
    await authLimiter.consume(ip)
    return null // Continue
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many login attempts, please try again later',
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 429 }
    )
  }
}
```

**Error Handling Patterns**:

1. **Validation Errors**: Caught by Zod schema validation, formatted as field-specific errors
```typescript
try {
  const validated = schema.parse(requestBody)
} catch (error) {
  if (error instanceof ZodError) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        fields: error.flatten().fieldErrors,
        timestamp: new Date().toISOString(),
      },
    }), { status: 400 })
  }
}
```

2. **Database Errors**: Caught at service layer, logged server-side, generic error returned to client
```typescript
try {
  await vendorService.createVendor(data)
} catch (error) {
  console.error('Database error:', error)
  return new Response(JSON.stringify({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'An error occurred, please try again',
      timestamp: new Date().toISOString(),
    },
  }), { status: 500 })
}
```

3. **Business Logic Errors**: Thrown by services, caught by API routes, specific error messages returned
```typescript
// Service layer
if (vendor.tier !== 'tier2') {
  throw new BusinessError('TIER_RESTRICTED', 'This feature requires Tier 2 subscription', { requiredTier: 'tier2', currentTier: vendor.tier })
}

// API route
try {
  await vendorService.updateVendor(id, data)
} catch (error) {
  if (error instanceof BusinessError) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
    }), { status: 422 })
  }
  // Handle other errors...
}
```

## Database Integration

### Database Connection and Query Patterns

**Connection Management**:

**Development (SQLite)**:
- **File-Based**: Database stored as `./payload.db` file
- **No Connection Pool**: SQLite is serverless, connections managed automatically
- **Zero Configuration**: No connection strings or external servers required

**Production (PostgreSQL)**:
- **Connection Pooling**: PostgreSQL connection pool with max 20 connections (configurable)
- **Connection Lifecycle**: Connections acquired from pool per request, automatically released
- **Connection Timeouts**: Query timeout 30 seconds, connection timeout 10 seconds

**Payload CMS Database Configuration**:
```typescript
// payload.config.ts
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'

const databaseAdapter = process.env.NODE_ENV === 'production'
  ? postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URI,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
    })
  : sqliteAdapter({
      client: {
        url: process.env.DATABASE_URI || 'file:./payload.db',
      },
    })

export default buildConfig({
  db: databaseAdapter,
  // ... other config
})
```

**Query Patterns**:

1. **Simple Read Query** (single record by ID):
```typescript
const vendor = await payload.findByID({
  collection: 'vendors',
  id: vendorId,
})
```

2. **Filtered Read Query** (list with conditions):
```typescript
const vendors = await payload.find({
  collection: 'vendors',
  where: {
    published: { equals: true },
    tier: { equals: 'tier2' },
  },
  limit: 20,
  page: 1,
  sort: '-createdAt',
})
```

3. **Create with Transaction**:
```typescript
const vendor = await payload.create({
  collection: 'vendors',
  data: {
    companyName: 'Test Vendor',
    contactEmail: 'test@example.com',
    tier: 'free',
  },
})
```

4. **Update with Conditions**:
```typescript
const updatedVendor = await payload.update({
  collection: 'vendors',
  id: vendorId,
  data: {
    description: 'Updated description',
    website: 'https://example.com',
  },
})
```

5. **Complex Query with Joins** (relationships):
```typescript
const products = await payload.find({
  collection: 'products',
  where: {
    vendor: { equals: vendorId },
  },
  depth: 1, // Populate vendor relationship
  limit: 50,
})
```

### Data Migration and Synchronization

**Migration Strategy**: One-time bulk migration with validation, no ongoing synchronization

**Migration Process**:
1. **Pre-Migration**: Backup all TinaCMS markdown files to `/content-backup/` directory
2. **Schema Setup**: Run Payload CMS migrations to create database schema
3. **Content Types Migration**: Run migration scripts for each content type sequentially
4. **Validation**: Run validation script to verify data integrity
5. **Post-Migration**: Keep markdown files as backup for 30 days, then archive

**Migration Script Structure**:
```typescript
// scripts/migration/migrate-vendors.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import payload from 'payload'

export async function migrateVendors() {
  const vendorsDir = path.join(process.cwd(), 'content/vendors')
  const files = fs.readdirSync(vendorsDir)

  const results = {
    total: files.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  }

  for (const file of files) {
    try {
      const filePath = path.join(vendorsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      // Transform markdown data to Payload CMS format
      const vendorData = {
        companyName: data.name,
        slug: data.slug || file.replace('.md', ''),
        description: content,
        logo: transformMediaPath(data.logo),
        contactEmail: data.contact?.email,
        contactPhone: data.contact?.phone,
        website: data.website,
        tier: 'free',
        published: data.published !== false,
        featured: data.featured === true,
      }

      // Insert into Payload CMS
      await payload.create({
        collection: 'vendors',
        data: vendorData,
      })

      results.succeeded++
    } catch (error) {
      results.failed++
      results.errors.push({ file, error: error.message })
      console.error(`Failed to migrate ${file}:`, error)
    }
  }

  return results
}
```

**Data Validation Script**:
```typescript
// scripts/migration/validate-migration.ts
export async function validateMigration() {
  const checks = []

  // Check vendors count matches
  const markdownVendorCount = countMarkdownFiles('content/vendors')
  const dbVendorCount = await payload.count({ collection: 'vendors' })
  checks.push({
    name: 'Vendor count match',
    passed: markdownVendorCount === dbVendorCount.totalDocs,
    expected: markdownVendorCount,
    actual: dbVendorCount.totalDocs,
  })

  // Check products have valid vendor references
  const products = await payload.find({ collection: 'products', limit: 1000 })
  const orphanedProducts = products.docs.filter((p) => !p.vendor)
  checks.push({
    name: 'No orphaned products',
    passed: orphanedProducts.length === 0,
    expected: 0,
    actual: orphanedProducts.length,
  })

  // Check categories hierarchy
  const categories = await payload.find({ collection: 'categories', limit: 1000 })
  const invalidParentRefs = categories.docs.filter(
    (c) => c.parent && !categories.docs.find((p) => p.id === c.parent)
  )
  checks.push({
    name: 'Valid category hierarchy',
    passed: invalidParentRefs.length === 0,
    expected: 0,
    actual: invalidParentRefs.length,
  })

  const allPassed = checks.every((c) => c.passed)
  return {
    success: allPassed,
    checks,
  }
}
```

### Transaction Management and Consistency

**Transaction Strategy**: Use database transactions for multi-table operations

**Transaction Patterns**:

1. **Vendor Creation** (users + vendors tables):
```typescript
// VendorService.createVendor()
await payload.db.transaction(async (tx) => {
  // 1. Create user
  const user = await tx.create({
    collection: 'users',
    data: {
      email: data.contactEmail,
      passwordHash: hashedPassword,
      role: 'vendor',
      status: 'pending',
    },
  })

  // 2. Create vendor linked to user
  const vendor = await tx.create({
    collection: 'vendors',
    data: {
      userId: user.id,
      companyName: data.companyName,
      tier: 'free',
      ...data,
    },
  })

  return vendor
})
```

2. **Vendor Approval** (users + vendors tables):
```typescript
// ApprovalService.approveVendor()
await payload.db.transaction(async (tx) => {
  // 1. Update user status
  await tx.update({
    collection: 'users',
    id: userId,
    data: {
      status: 'approved',
      approvedAt: new Date(),
    },
  })

  // 2. Publish vendor profile
  await tx.update({
    collection: 'vendors',
    where: { userId: { equals: userId } },
    data: {
      published: true,
      tier: initialTier || 'free',
    },
  })
})
```

**Rollback Handling**:
- Transactions automatically rolled back on any error
- No partial updates committed if any step fails
- Errors logged with full context for debugging
- User receives generic error message, admin notified of failures

**Consistency Guarantees**:
- Foreign key constraints enforce referential integrity (vendors.userId → users.id)
- Unique constraints prevent duplicate emails and slugs
- CHECK constraints enforce valid enum values (tier, status, role)
- NOT NULL constraints ensure required fields always have values
- Cascading deletes maintain consistency (DELETE user → DELETE vendor)

## External Service Integration

**Note**: This phase focuses on core Payload CMS migration. External services (payment processing, email, analytics) are deferred to future phases per user requirements.

### Future External Services (Out of Scope)

**Payment Processing** (Stripe):
- Purpose: Handle subscription payments for tiered vendor accounts
- Integration: Stripe Checkout for payment flows, Stripe Webhooks for subscription status updates
- Deferred Reason: Payment system not needed for initial migration, vendors manually assigned tiers by admin

**Email Services** (SendGrid/Resend):
- Purpose: Send vendor approval notifications, password reset emails
- Integration: SMTP or API-based email sending
- Deferred Reason: Admin approval currently manual process, email notifications not critical for MVP

**Analytics** (PostHog/Google Analytics):
- Purpose: Track user behavior, vendor engagement, conversion metrics
- Integration: Client-side JavaScript tracking
- Deferred Reason: Analytics can be added after migration without affecting core functionality

## Compatibility Requirements

### Backward Compatibility Constraints

**TinaCMSDataService Interface Compatibility**:

**Requirement**: Maintain same method signatures for existing code that depends on TinaCMSDataService

**Implementation Strategy**:
```typescript
// lib/tinacms-data-service.ts (LEGACY - kept for reference)
export class TinaCMSDataService {
  async getVendors() { /* markdown-based implementation */ }
  async getVendor(slug: string) { /* markdown-based implementation */ }
  async getProducts() { /* markdown-based implementation */ }
  // ... other methods
}

// lib/payload-cms-data-service.ts (NEW)
export class PayloadCMSDataService {
  // Implement same interface, backed by Payload CMS
  async getVendors() {
    const result = await payload.find({
      collection: 'vendors',
      where: { published: { equals: true } },
    })
    return result.docs // Return same shape as TinaCMS version
  }

  async getVendor(slug: string) {
    const result = await payload.find({
      collection: 'vendors',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    return result.docs[0] || null
  }

  // ... other methods with same signatures
}

// Export new implementation with old name for backward compatibility
export { PayloadCMSDataService as TinaCMSDataService }
```

**Data Shape Compatibility**:
- Vendor objects returned by PayloadCMSDataService match the shape expected by components
- Product objects maintain same field names and structure
- Category hierarchy remains consistent
- Blog posts retain same metadata fields

**Breaking Changes** (to be addressed):
- TinaCMS admin interface at /admin will be replaced (Payload CMS admin)
- Markdown file editing no longer possible (database-backed)
- TinaCMS CLI commands no longer work (replaced with Payload CMS CLI)

### Version Compatibility Matrix

| Dependency | Current Version | Required Version | Compatibility Notes |
|---|---|---|---|
| Next.js | 14.2.5 | 14.x | Payload CMS 3+ fully compatible with Next.js 14 |
| React | 18.2.0 | 18.x | No changes required |
| TypeScript | 5.2.2 | 5.x | Payload CMS 3 provides full TypeScript types |
| Node.js | 22 LTS | 18.x+ | Payload CMS 3 requires Node.js 18 or higher |
| SQLite | N/A (file-based) | 3.x | Development database, zero configuration |
| PostgreSQL | N/A | 14+ | Production database, Payload CMS 3 supports PostgreSQL 14+ |
| Payload CMS | N/A | 3.x | Latest stable version (Payload CMS 3+) |
| better-sqlite3 | N/A | 11.x | Required for SQLite adapter in development |
| pg | N/A | 8.x | Required for PostgreSQL adapter in production |
| shadcn/ui | Latest | Latest | No dependency on CMS choice |
| Tailwind CSS | 3.3.3 | 3.x | No changes required |

### Deprecation and Migration Strategies

**TinaCMS Deprecation Timeline**:
1. **Week 1-4**: Install Payload CMS alongside TinaCMS (both running in parallel)
2. **Week 5**: Run migration scripts, populate Payload CMS database
3. **Week 6**: Update frontend to use PayloadCMSDataService
4. **Week 7**: Test migration, validate data integrity
5. **Week 8**: Deploy to production, switch to Payload CMS
6. **Week 9**: Monitor for issues, keep TinaCMS as fallback
7. **Week 10**: Remove TinaCMS dependencies, delete TinaCMS code
8. **Week 11**: Archive markdown files, complete deprecation

**Rollback Strategy**:
- Keep TinaCMS dependencies installed until Week 10
- Maintain markdown files as backup until Week 11
- If critical issues arise, revert to TinaCMSDataService temporarily
- Database migration scripts create timestamped backups before running
- PostgreSQL database can be reset and re-migrated if needed

**Communication Plan**:
- Notify stakeholders before migration cutover
- Document all changes in CHANGELOG.md
- Update README with new Payload CMS setup instructions
- Create migration guide for content editors
- Provide training for admin users on Payload CMS interface

## Integration Testing Requirements

**Scope**: Verify all integration points work correctly end-to-end

**Key Integration Test Scenarios**:
1. Vendor registration creates both user and vendor records (transaction integrity)
2. Admin approval updates both users and vendors tables (transaction integrity)
3. Vendor profile editor enforces tier restrictions at API level (authorization integration)
4. Public pages fetch and display migrated content correctly (data integration)
5. Authentication flow works from login to protected route access (auth integration)
6. SWR cache invalidation works after mutations (frontend-backend integration)
7. Migration scripts correctly transform and insert data (migration integration)

**Integration Test Execution**:
- Run in CI/CD pipeline before deployment
- Use test database with seeded fixtures
- Clean database between tests to ensure isolation
- Test happy paths and error scenarios
- Verify database constraints enforced (foreign keys, unique, not null)

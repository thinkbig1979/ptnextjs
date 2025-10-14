# Integration Strategy and Architecture Plan
## Payload CMS Migration with Vendor Self-Enrollment

> **Version:** 1.0
> **Date:** 2025-10-11
> **Status:** Phase 1 Foundation Plan

---

## Executive Summary

This document defines the comprehensive integration strategy for migrating from TinaCMS (markdown-based) to Payload CMS 3+ (database-backed) while introducing vendor self-enrollment capabilities. The migration will follow a **hybrid execution approach** with foundational setup done sequentially, followed by parallel implementation of independent components.

**Key Decisions:**
- **Development Database:** SQLite (zero-configuration, file-based)
- **Production Database:** PostgreSQL 17+ (scalable, production-ready)
- **Database Portability:** All schema changes managed via Payload CMS migration functions
- **Authentication:** Payload CMS built-in auth with JWT tokens
- **Authorization:** RBAC with tiered vendor permissions (Free, Tier 1, Tier 2)
- **Migration Strategy:** Automated scripts with validation and rollback capability

---

## 1. Payload CMS Installation Plan

### 1.1 Package Dependencies

**Core Payload CMS Packages:**
```json
{
  "payload": "^3.0.0",
  "@payloadcms/db-sqlite": "^3.0.0",
  "@payloadcms/db-postgres": "^3.0.0",
  "@payloadcms/next": "^3.0.0",
  "better-sqlite3": "^11.0.0",
  "pg": "^8.11.0"
}
```

**Authentication & Security:**
```json
{
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "zod": "^3.23.8"
}
```

**Migration Utilities:**
```json
{
  "gray-matter": "^4.0.3"
}
```

### 1.2 Installation Sequence

1. **Install Core Packages**
   ```bash
   npm install payload@^3.0.0 @payloadcms/next@^3.0.0
   ```

2. **Install Database Adapters**
   ```bash
   npm install @payloadcms/db-sqlite@^3.0.0 better-sqlite3@^11.0.0
   npm install @payloadcms/db-postgres@^3.0.0 pg@^8.11.0
   ```

3. **Install Authentication Packages**
   ```bash
   npm install jsonwebtoken@^9.0.0 bcrypt@^5.1.0
   ```

4. **Install Migration Utilities**
   ```bash
   npm install gray-matter@^4.0.3
   ```

### 1.3 Configuration Files

**File: `/home/edwin/development/ptnextjs/payload.config.ts`**
- Configure SQLite adapter for development (file: `./data/payload.db`)
- Configure PostgreSQL adapter for production (env: DATABASE_URL)
- Set up authentication with JWT secret
- Register all collections (Users, Vendors, Products, Categories, BlogPosts, TeamMembers, CompanyInfo)
- Configure admin user collection
- Set up media storage (local filesystem)

**Environment Variables:**
```env
# Development (SQLite)
DATABASE_URL=sqlite://./data/payload.db
PAYLOAD_SECRET=<generated-secret>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Production (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database
PAYLOAD_SECRET=<production-secret>
NEXT_PUBLIC_SERVER_URL=https://production-domain.com
```

### 1.4 Next.js Integration

**Update `next.config.js`:**
- Remove `output: 'export'` (Payload CMS requires server-side rendering)
- Add Payload CMS webpack configuration
- Configure API routes for Payload admin interface at `/admin`

---

## 2. TinaCMS to Payload CMS Migration Strategy

### 2.1 Migration Approach

**Philosophy:** Automated, validated, reversible migration with zero data loss

**Strategy Components:**
1. **Pre-Migration Validation** - Verify all markdown files are valid and parseable
2. **Automated Transformation** - Convert markdown frontmatter to Payload CMS fields
3. **Database Import** - Insert transformed data into Payload CMS collections
4. **Post-Migration Validation** - Verify data integrity and completeness
5. **Backup Preservation** - Keep original markdown files as backup

### 2.2 Migration Execution Sequence

**Phase 1: Foundation (Sequential)**
1. Install Payload CMS and configure database adapters
2. Create all collection schemas
3. Run Payload CMS database migrations

**Phase 2: Content Migration (Sequential by Collection)**
1. Migrate Categories (no dependencies)
2. Migrate Vendors (depends on Categories)
3. Migrate Products (depends on Vendors and Categories)
4. Migrate BlogPosts (depends on Categories)
5. Migrate TeamMembers (no dependencies)
6. Migrate CompanyInfo (no dependencies)

**Phase 3: Validation**
1. Run automated validation checks
2. Compare record counts (markdown vs database)
3. Spot-check content accuracy
4. Verify relationships are correctly resolved

### 2.3 Data Transformation Mappings

**Vendors (TinaCMS → Payload CMS):**
| TinaCMS Field | Payload CMS Field | Transformation |
|---------------|-------------------|----------------|
| `name` | `company_name` | Direct mapping |
| `slug` | `slug` | Auto-generate if missing |
| `description` | `description` | Direct mapping |
| `logo` | `logo` | Transform media path |
| `image` | `logo` (fallback) | If logo missing |
| `website` | `website` | Direct mapping |
| `category` | N/A | Removed (vendors don't have categories) |
| `tags` | N/A | Removed (vendors don't have tags) |
| `partner: true` | `tier: 'tier1'` | Existing partners → Tier 1 |
| `partner: false` | `tier: 'free'` | Regular vendors → Free |

**Products (TinaCMS → Payload CMS):**
| TinaCMS Field | Payload CMS Field | Transformation |
|---------------|-------------------|----------------|
| `name` | `name` | Direct mapping |
| `slug` | `slug` | Auto-generate if missing |
| `description` | `description` | Direct mapping |
| `images[]` | `images[]` | Transform media paths |
| `vendor` (reference) | `vendor_id` | Resolve vendor by slug |
| `category` (reference) | `categories[]` | Resolve category by slug |
| `tags[]` | `categories[]` | Merge with categories |
| `specifications[]` | `specifications (JSONB)` | Convert to key-value object |

**Categories (TinaCMS → Payload CMS):**
| TinaCMS Field | Payload CMS Field | Transformation |
|---------------|-------------------|----------------|
| `name` | `name` | Direct mapping |
| `slug` | `slug` | Direct mapping |
| `description` | `description` | Direct mapping |
| `icon` | `icon` | Direct mapping |
| `parent` (reference) | `parent_id` | Resolve parent by slug |

**BlogPosts (TinaCMS → Payload CMS):**
| TinaCMS Field | Payload CMS Field | Transformation |
|---------------|-------------------|----------------|
| `title` | `title` | Direct mapping |
| `slug` | `slug` | Direct mapping |
| `content` | `content` | Direct mapping |
| `excerpt` | `excerpt` | Direct mapping |
| `author` | `author_id` | Create/resolve author user |
| `image` | `featured_image` | Transform media path |
| `category` (reference) | `categories[]` | Resolve category by slug |
| `tags[]` | `tags[]` | Direct mapping |

### 2.4 Media Path Transformation

**TinaCMS Media Paths:**
- Format: `/images/vendors/logo.png`
- Storage: Files in `/public/images/` directory

**Payload CMS Media Paths:**
- Format: `/media/logo.png`
- Storage: Files in `/public/media/` directory
- Metadata: Stored in database with file references

**Transformation Strategy:**
1. Copy files from `/public/images/` to `/public/media/`
2. Update database references to point to new paths
3. Maintain original files as backup

### 2.5 Slug Generation Strategy

**Auto-Generation Rules:**
1. Convert `name` or `title` to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep only alphanumeric and hyphens)
4. Ensure uniqueness by appending counter if duplicate exists

**Example:**
- `"Marine Navigation System"` → `"marine-navigation-system"`
- `"Marine Navigation System"` (duplicate) → `"marine-navigation-system-2"`

### 2.6 Relationship Resolution

**Vendor → Product Relationship:**
- TinaCMS: Products reference vendor by file path (`content/vendors/company.md`)
- Payload CMS: Products reference vendor by UUID (`vendor_id`)
- Resolution: Look up vendor by slug, get UUID, insert into product

**Category Hierarchy:**
- TinaCMS: Categories reference parent by file path
- Payload CMS: Categories reference parent by UUID (`parent_id`)
- Resolution: Perform two-pass migration (create all categories first, then update parent references)

### 2.7 Error Handling Strategy

**Validation Errors:**
- Log all validation errors to `migration-errors.log`
- Continue migration with warnings for non-critical errors
- Halt migration for critical errors (missing required fields, broken references)

**Rollback Procedures:**
1. Keep original markdown files untouched during migration
2. Create database backup before migration starts
3. If migration fails, restore database from backup
4. If migration succeeds but validation fails, rollback and fix issues

**Recovery Actions:**
- Missing vendor reference: Create placeholder vendor with name "Unknown Vendor"
- Missing category reference: Assign to "Uncategorized" category
- Invalid media path: Log warning and set field to null
- Duplicate slug: Auto-generate unique slug with counter

---

## 3. Authentication Integration Approach

### 3.1 Authentication Method

**Primary Method:** Email/Password authentication with JWT tokens

**Implementation:**
- Use Payload CMS built-in authentication system
- Extend Users collection with custom fields (role, status, vendor relationship)
- JWT tokens stored in httpOnly cookies (XSS protection)
- Access token expiry: 1 hour
- Refresh token expiry: 7 days

### 3.2 Password Requirements

**Strength Requirements:**
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Validation:**
- Client-side validation with Zod schema
- Server-side validation with bcrypt hashing (12 rounds)
- Password history tracking to prevent reuse (future enhancement)

### 3.3 User Roles

**Admin Role:**
- Full CRUD access to all collections
- Can approve/reject vendor registrations
- Can manage vendor tiers
- Can access admin-only API endpoints

**Vendor Role:**
- Can register new account (pending approval)
- Can log in after approval
- Can edit own vendor profile (tier-restricted fields)
- Can manage own products (Tier 2 only)
- Cannot access other vendors' data

### 3.4 Authentication Flow

**Registration Flow:**
1. Vendor fills registration form (company name, email, password, contact info)
2. Frontend validates input with Zod schema
3. Backend creates user with status='pending' and role='vendor'
4. Backend creates vendor record linked to user
5. Frontend redirects to "Awaiting approval" page
6. Admin receives notification (future: email)
7. Admin approves/rejects registration
8. Vendor receives notification (future: email)
9. Approved vendors can log in

**Login Flow:**
1. Vendor enters email and password
2. Backend validates credentials with bcrypt
3. Backend checks user status (must be 'approved')
4. Backend generates JWT access and refresh tokens
5. Tokens stored in httpOnly cookies
6. Frontend redirects to vendor dashboard
7. Dashboard loads vendor-specific data with tier restrictions

---

## 4. Data Service Replacement Strategy

### 4.1 Current Architecture (TinaCMS)

**File:** `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts`

**Key Methods:**
- `getVendors()` - Fetch all vendors from markdown files
- `getVendorBySlug(slug)` - Fetch single vendor by slug
- `getProducts()` - Fetch all products from markdown files
- `getProductBySlug(slug)` - Fetch single product by slug
- `getCategories()` - Fetch all categories
- `getBlogPosts()` - Fetch all blog posts
- `transformMediaPath(path)` - Convert TinaCMS media paths

**Caching Strategy:**
- In-memory cache with 5-minute TTL
- Cache invalidation on content changes (via TinaCMS webhook)

### 4.2 Target Architecture (Payload CMS)

**File:** `/home/edwin/development/ptnextjs/lib/payload-cms-data-service.ts`

**Key Methods:**
- `getVendors()` - Fetch vendors from Payload CMS API
- `getVendorBySlug(slug)` - Fetch single vendor by slug
- `getProducts()` - Fetch products from Payload CMS API
- `getProductBySlug(slug)` - Fetch single product by slug
- `getCategories()` - Fetch categories from Payload CMS API
- `getBlogPosts()` - Fetch blog posts from Payload CMS API
- `transformMediaPath(path)` - Convert Payload CMS media paths

**Caching Strategy:**
- SWR (Stale-While-Revalidate) for frontend data fetching
- 5-minute stale time, automatic revalidation
- Optimistic updates for mutations

### 4.3 Migration Approach

**Backward Compatibility:**
- Maintain identical method signatures
- Return same data structures
- Preserve TypeScript interfaces in `lib/types.ts`
- Update internal implementation only

**Phased Replacement:**
1. Create `PayloadCMSDataService` alongside `TinaCMSDataService`
2. Update frontend pages to use new service (one page at a time)
3. Test each page after update
4. Remove `TinaCMSDataService` after all pages migrated
5. Clean up unused TinaCMS dependencies

**Example Migration:**

**Before (TinaCMS):**
```typescript
import { TinaCMSDataService } from '@/lib/tinacms-data-service';

export default async function VendorsPage() {
  const vendors = await TinaCMSDataService.getVendors();
  return <VendorList vendors={vendors} />;
}
```

**After (Payload CMS):**
```typescript
import { PayloadCMSDataService } from '@/lib/payload-cms-data-service';

export default async function VendorsPage() {
  const vendors = await PayloadCMSDataService.getVendors();
  return <VendorList vendors={vendors} />;
}
```

---

## 5. API Route Architecture for Vendor Endpoints

### 5.1 Endpoint Structure

**Base Path:** `/api/`

**Vendor Endpoints:**
- `POST /api/vendors/register` - Register new vendor
- `PUT /api/vendors/{id}` - Update vendor profile
- `GET /api/vendors` - List all vendors (public)
- `GET /api/vendors/{slug}` - Get single vendor by slug (public)

**Authentication Endpoints:**
- `POST /api/auth/login` - Vendor/admin login
- `POST /api/auth/logout` - Logout and invalidate token
- `POST /api/auth/refresh` - Refresh access token

**Admin Endpoints:**
- `GET /api/admin/vendors/pending` - List pending vendor registrations
- `POST /api/admin/vendors/{id}/approve` - Approve vendor
- `POST /api/admin/vendors/{id}/reject` - Reject vendor

### 5.2 Middleware Stack

**Authentication Middleware:**
```typescript
// File: /home/edwin/development/ptnextjs/lib/middleware/auth.ts
export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get('access_token');
  if (!token) throw new UnauthorizedError();

  const payload = await validateJWT(token);
  req.user = payload;
  return payload;
}
```

**Authorization Middleware:**
```typescript
// File: /home/edwin/development/ptnextjs/lib/middleware/rbac.ts
export function requireRole(role: 'admin' | 'vendor') {
  return async (req: NextRequest) => {
    await requireAuth(req);
    if (req.user.role !== role) throw new ForbiddenError();
  };
}

export function requireTier(minTier: 'free' | 'tier1' | 'tier2') {
  return async (req: NextRequest) => {
    await requireAuth(req);
    if (!canAccessTier(req.user.tier, minTier)) {
      throw new ForbiddenError('This feature requires a higher subscription tier');
    }
  };
}
```

### 5.3 Response Format

**Success Response:**
```typescript
interface SuccessResponse {
  success: true;
  data: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Error Response:**
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    fields?: { [key: string]: string };
    timestamp: string;
  };
}
```

### 5.4 Tier Restriction Enforcement

**UI-Level Restrictions (TierGate Component):**
```typescript
// File: /home/edwin/development/ptnextjs/components/shared/TierGate.tsx
export function TierGate({
  requiredTier,
  currentTier,
  children,
  upgradeMessage
}: TierGateProps) {
  if (!canAccessTier(currentTier, requiredTier)) {
    return <UpgradePrompt message={upgradeMessage} />;
  }
  return <>{children}</>;
}
```

**API-Level Restrictions (Middleware):**
```typescript
// File: /home/edwin/development/ptnextjs/app/api/vendors/[id]/route.ts
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req);
  const vendor = await getVendorById(params.id);

  // Verify vendor owns this profile
  if (vendor.user_id !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('You can only edit your own profile');
  }

  // Validate tier restrictions on fields
  const updates = await req.json();
  const restrictedFields = getRestrictedFields(vendor.tier);
  const invalidFields = Object.keys(updates).filter(f => restrictedFields.includes(f));

  if (invalidFields.length > 0) {
    throw new TierRestrictedError(`Fields require higher tier: ${invalidFields.join(', ')}`);
  }

  // Update vendor profile
  const updatedVendor = await updateVendor(params.id, updates);
  return NextResponse.json({ success: true, data: { vendor: updatedVendor } });
}
```

---

## 6. Frontend-Backend Integration Patterns

### 6.1 Data Fetching Strategy

**Server Components (Default):**
- Use Payload CMS local API for server-side data fetching
- Pre-render pages at build time for public content
- No client-side data fetching needed for static content

**Client Components (Interactive):**
- Use SWR for client-side data fetching with caching
- Automatic revalidation on focus/reconnect
- Optimistic updates for mutations

### 6.2 Form Submission Pattern

**Client Component (Form):**
```typescript
// File: /home/edwin/development/ptnextjs/components/vendor/VendorProfileEditor.tsx
export function VendorProfileEditor({ vendor }: { vendor: Vendor }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      toast.success('Profile updated successfully');
      mutate(`/api/vendors/${vendor.id}`); // Revalidate SWR cache
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </Form>
  );
}
```

### 6.3 Error Handling Pattern

**Client-Side Error Handling:**
```typescript
// File: /home/edwin/development/ptnextjs/lib/utils/api-client.ts
export async function apiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/vendor/login?returnUrl=' + window.location.pathname;
      }
      throw new ApiError(data.error.code, data.error.message, response.status);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new NetworkError('Network request failed. Please check your connection.');
  }
}
```

---

## 7. Risk Mitigation Strategies

### 7.1 Migration Risks

**Risk 1: Data Loss During Migration**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Create full backup of markdown files before migration
  - Implement transaction-based migration (rollback on error)
  - Perform dry-run migration in staging environment
  - Validate data integrity after migration with automated checks

**Risk 2: Broken Relationships After Migration**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Use two-pass migration for hierarchical data (categories)
  - Validate all foreign key references after migration
  - Create placeholder records for missing references
  - Log all unresolved references for manual review

**Risk 3: Performance Degradation with Database**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Add database indexes on frequently queried fields (slug, published, status)
  - Implement connection pooling for PostgreSQL (max 20 connections)
  - Use SWR caching on frontend to reduce API calls
  - Monitor database query performance with EXPLAIN ANALYZE

### 7.2 Authentication Risks

**Risk 4: Weak Password Security**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Enforce strong password requirements (12+ characters, mixed case, numbers, special chars)
  - Use bcrypt with 12 rounds for password hashing
  - Implement rate limiting on login endpoint (5 attempts per 15 minutes)
  - Add account lockout after 5 failed login attempts

**Risk 5: JWT Token Theft**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - Store JWT tokens in httpOnly cookies (XSS protection)
  - Use short-lived access tokens (1 hour expiry)
  - Implement token rotation on refresh
  - Add CSRF protection with SameSite cookie attribute

### 7.3 Tier Restriction Bypass Risks

**Risk 6: Unauthorized Tier Access**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Implement defense-in-depth: UI-level AND API-level tier checks
  - Validate tier restrictions in Payload CMS access control hooks
  - Log all tier restriction violations for audit trail
  - Add integration tests for tier restriction enforcement

---

## 8. Rollback Procedures

### 8.1 Database Rollback

**Procedure:**
1. Stop all application instances accessing the database
2. Restore database from pre-migration backup
3. Verify database integrity with consistency checks
4. Restart application instances
5. Validate application functionality with smoke tests

**Backup Creation:**
```bash
# PostgreSQL backup
pg_dump -U postgres -d payload_cms > backup-$(date +%Y%m%d-%H%M%S).sql

# SQLite backup
sqlite3 data/payload.db ".backup 'backup-$(date +%Y%m%d-%H%M%S).db'"
```

**Backup Restoration:**
```bash
# PostgreSQL restore
psql -U postgres -d payload_cms < backup-20250410-120000.sql

# SQLite restore
cp backup-20250410-120000.db data/payload.db
```

### 8.2 Code Rollback

**Git Rollback:**
```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or reset to specific commit (use with caution)
git reset --hard <commit-hash>
git push --force origin main
```

### 8.3 Content Rollback

**TinaCMS Content Restoration:**
- Original markdown files preserved in `/content/` directory
- If migration fails or is rolled back, frontend can be reverted to use TinaCMS
- No data loss as markdown files remain untouched

---

## 9. Implementation Architecture Decisions

### 9.1 Collection Schema Design

**Design Principles:**
1. **Normalization:** Separate concerns (Users, Vendors, Products) into distinct collections
2. **Relationships:** Use foreign keys for one-to-many and many-to-many relationships
3. **Extensibility:** Use JSONB fields for flexible data (specifications, certifications)
4. **Auditability:** Add timestamps (created_at, updated_at) to all collections

### 9.2 Access Control Implementation

**Strategy:** Payload CMS access control hooks with role and tier checks

**Implementation:**
```typescript
// File: /home/edwin/development/ptnextjs/payload/access/tierRestrictions.ts
export const tierRestrictions = {
  update: ({ req: { user }, data }) => {
    // Admins can update anything
    if (user.role === 'admin') return true;

    // Vendors can only update their own profile
    if (user.role === 'vendor') {
      const vendor = await getVendorByUserId(user.id);
      if (data.id !== vendor.id) return false;

      // Check tier restrictions on fields
      const restrictedFields = getTierRestrictedFields(vendor.tier);
      const updatedFields = Object.keys(data);
      const unauthorizedFields = updatedFields.filter(f => restrictedFields.includes(f));

      if (unauthorizedFields.length > 0) {
        throw new ForbiddenError(`Fields require higher tier: ${unauthorizedFields.join(', ')}`);
      }

      return true;
    }

    return false;
  }
};
```

### 9.3 Migration Script Execution Order

**Execution Sequence:**
1. **Pre-Migration:** Backup markdown files and database
2. **Schema Migration:** Run Payload CMS database migrations
3. **Content Migration:**
   - Step 1: Migrate Categories (no dependencies)
   - Step 2: Migrate Vendors (depends on Categories for tags)
   - Step 3: Migrate Products (depends on Vendors and Categories)
   - Step 4: Migrate BlogPosts (depends on Categories)
   - Step 5: Migrate TeamMembers (no dependencies)
   - Step 6: Migrate CompanyInfo (no dependencies)
4. **Post-Migration Validation:** Run automated validation checks
5. **Verification:** Manual spot-checks and smoke tests

### 9.4 Error Handling and Rollback Strategy

**Error Categories:**
- **Critical Errors:** Missing required fields, broken database constraints → Halt and rollback
- **Warning Errors:** Missing optional fields, unresolved references → Log and continue
- **Info Messages:** Successful records, skipped duplicates → Log for reference

**Rollback Triggers:**
- Any critical error during migration
- Validation failure rate > 10%
- Manual intervention by administrator

---

## 10. Testing Strategy

### 10.1 Unit Testing

**Backend Services:**
- VendorService: createVendor, updateVendor, validateTierAccess
- AuthService: login, validateToken, hashPassword
- ApprovalService: approveVendor, rejectVendor
- MigrationService: data transformation functions

**Frontend Components:**
- VendorRegistrationForm: validation, submission, error handling
- TierGate: tier restriction rendering logic
- AdminApprovalQueue: approval/rejection actions

### 10.2 Integration Testing

**API Endpoints:**
- POST /api/vendors/register - validation, duplicate detection
- POST /api/auth/login - authentication success/failure
- PUT /api/vendors/{id} - tier restriction enforcement
- Admin approval endpoints - RBAC validation

**Database Operations:**
- CRUD operations on all collections
- Foreign key constraint validation
- Cascading delete behavior
- Index performance verification

### 10.3 End-to-End Testing

**Critical User Flows:**
1. Vendor registration → admin approval → vendor login → profile edit
2. Tier restriction enforcement (free tier vendor cannot access products)
3. Admin approval workflow (pending list → approve → vendor can login)

**Error Scenarios:**
- Registration with duplicate email shows error
- Password requirements enforced in UI and API
- Unauthorized access redirects to login

---

## 11. Success Criteria

### 11.1 Functional Requirements

✅ **Payload CMS 3+ Installation**
- Payload CMS running with SQLite (development) and PostgreSQL (production)
- Admin interface accessible at `/admin`
- All collections defined and functional
- Database migrations working across both databases

✅ **Content Migration**
- All TinaCMS content successfully migrated to Payload CMS
- Data integrity verified (no data loss, relationships intact)
- Original markdown files preserved as backup

✅ **Vendor Registration**
- Vendors can register new accounts
- Admin can approve/reject registrations
- Approved vendors can log in
- Vendor dashboard displays tier-appropriate content

✅ **Tiered Access Control**
- Free tier: Basic vendor profile (description, logo, contact info)
- Tier 1: Enhanced profile (website, social links, certifications)
- Tier 2: Full product/service management
- Backend validation prevents unauthorized tier access

✅ **Frontend Integration**
- Public-facing website displays content from Payload CMS
- No functionality regression from TinaCMS version
- Page performance maintained or improved

✅ **Admin Management Tools**
- Admin can approve/reject vendor registrations
- Admin can manage vendor tiers
- Admin has full CRUD access to all collections

### 11.2 Non-Functional Requirements

✅ **Performance**
- API response time < 500ms (95th percentile)
- Page load time < 2 seconds (FCP)
- Database query time < 100ms (simple queries)

✅ **Security**
- Strong password requirements enforced
- JWT tokens stored in httpOnly cookies
- RBAC prevents unauthorized access
- Tier restrictions enforced at UI and API levels

✅ **Reliability**
- Zero data loss during migration
- Rollback capability in case of errors
- Automated validation checks
- Transaction-based migration for atomicity

---

## 12. Next Steps (Post-Foundation)

### 12.1 Phase 2: Parallel Implementation

After Phase 1 foundation tasks complete and user verifies Payload CMS works:

**Parallel Task Group 1 (Backend):**
- impl-auth-system: Implement authentication and JWT token management
- impl-migration-scripts: Build automated migration scripts
- impl-payload-data-service: Create PayloadCMSDataService

**Parallel Task Group 2 (API Endpoints - after auth-system):**
- impl-api-vendor-registration: POST /api/vendors/register
- impl-api-auth-login: POST /api/auth/login
- impl-api-vendor-update: PUT /api/vendors/{id}
- impl-api-admin-approval: POST /api/admin/vendors/{id}/approve

**Final Task (Integration):**
- test-backend-integration: Run comprehensive backend integration tests

### 12.2 Future Enhancements (Out of Scope)

- Payment processing (Stripe integration)
- Email verification for vendor accounts
- Multi-user support per vendor company
- Two-factor authentication (2FA)
- OAuth integration (Google, LinkedIn login)
- Lead tracking and CRM integration
- Advanced search functionality (Algolia)

---

## Appendices

### Appendix A: Payload CMS 3 Configuration Example

```typescript
// File: /home/edwin/development/ptnextjs/payload.config.ts
import { buildConfig } from 'payload/config';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  db: process.env.NODE_ENV === 'production'
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL,
        },
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL || 'sqlite://./data/payload.db',
        },
      }),
  collections: [
    // Collections will be imported here
  ],
});
```

### Appendix B: Migration Script Structure

```typescript
// File: /home/edwin/development/ptnextjs/scripts/migration/migrate-vendors.ts
import { migrateCollection } from './utils/migration-helper';
import { readMarkdownFiles } from './utils/markdown-parser';
import { validateVendorData } from './utils/validation';

export async function migrateVendors() {
  console.log('Starting vendor migration...');

  // Read markdown files
  const vendorFiles = await readMarkdownFiles('content/vendors');
  console.log(`Found ${vendorFiles.length} vendor files`);

  // Transform and validate
  const vendors = vendorFiles.map(transformVendor).filter(validateVendorData);
  console.log(`Validated ${vendors.length} vendors`);

  // Insert into Payload CMS
  const results = await migrateCollection('vendors', vendors);
  console.log(`Migrated ${results.success} vendors, ${results.errors} errors`);

  return results;
}
```

### Appendix C: Environment Variable Template

```env
# Development Environment
NODE_ENV=development
DATABASE_URL=sqlite://./data/payload.db
PAYLOAD_SECRET=your-secret-key-here-minimum-32-characters
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Production Environment
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
PAYLOAD_SECRET=your-production-secret-key-minimum-32-characters
NEXT_PUBLIC_SERVER_URL=https://your-production-domain.com

# JWT Configuration
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=7d

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!@#SecurePassword
```

---

**Document Status:** ✅ Complete
**Review Status:** Pending User Verification
**Next Action:** Proceed to Task 2 (test-backend)

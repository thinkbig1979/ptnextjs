# API Routes Quality Review

**Review Date:** 2025-12-31
**Reviewer:** Quality Control
**Task ID:** ptnextjs-33qn
**Priority:** P1 Critical

## Summary

- **Routes reviewed:** 51
- **Issues found:** 17 (Critical: 0, High: 4, Medium: 9, Low: 4)

**Overall Assessment:** The API routes demonstrate good quality with consistent patterns. The codebase follows modern Next.js 14 App Router conventions with proper TypeScript typing. Authentication, validation, and error handling are well-implemented across most routes. No critical security issues were found.

---

## Route Inventory

### Authentication Routes (`/api/auth/`)
| Route | Methods | Rate Limited | Auth Required |
|-------|---------|--------------|---------------|
| `/api/auth/login` | POST | Yes (5/15min) | No |
| `/api/auth/logout` | POST | No | No |
| `/api/auth/me` | GET | No | Yes |
| `/api/auth/refresh` | POST | Yes (10/1min) | No |

### Admin Routes (`/api/admin/`)
| Route | Methods | Rate Limited | Auth Required |
|-------|---------|--------------|---------------|
| `/api/admin/vendors/pending` | GET | No | Admin |
| `/api/admin/vendors/approval` | - | No | Admin |
| `/api/admin/vendors/[id]/approve` | POST | No | Admin |
| `/api/admin/vendors/[id]/reject` | POST | No | Admin |
| `/api/admin/vendors/[id]/tier` | PUT | No | Admin |
| `/api/admin/tier-upgrade-requests` | GET | Yes | Admin |
| `/api/admin/tier-upgrade-requests/[id]/approve` | PUT | Yes | Admin |
| `/api/admin/tier-upgrade-requests/[id]/reject` | PUT | Yes | Admin |

### Portal Routes (`/api/portal/`)
| Route | Methods | Rate Limited | Auth Required |
|-------|---------|--------------|---------------|
| `/api/portal/me` | GET | No | Yes |
| `/api/portal/vendors/register` | POST | Yes (3/1hr) | No |
| `/api/portal/vendors/profile` | - | No | Yes |
| `/api/portal/vendors/[id]` | GET, PUT, PATCH | No | Vendor/Admin |
| `/api/portal/vendors/[id]/products` | GET, POST | No | Vendor/Admin |
| `/api/portal/vendors/[id]/products/[productId]` | GET, PUT, DELETE | No | Vendor/Admin |
| `/api/portal/vendors/[id]/products/[productId]/publish` | - | No | Vendor/Admin |
| `/api/portal/vendors/[id]/tier-upgrade-request` | GET, POST | Yes | Vendor |
| `/api/portal/vendors/[id]/tier-downgrade-request` | GET, POST | No | Vendor |
| `/api/portal/vendors/[id]/excel-import` | POST | No | Vendor/Admin |
| `/api/portal/vendors/[id]/excel-export` | GET | No | Vendor/Admin |
| `/api/portal/vendors/[id]/excel-template` | GET | No | Vendor/Admin |
| `/api/portal/vendors/[id]/import-history` | GET | No | Vendor/Admin |
| `/api/portal/vendors/[id]/submit-profile` | - | No | Vendor |

### Public Routes (`/api/public/`)
| Route | Methods | Rate Limited | Auth Required |
|-------|---------|--------------|---------------|
| `/api/public/vendors/[slug]` | GET | No | No |
| `/api/public/vendors/[slug]/reviews` | GET, POST | No | No |

### General API Routes
| Route | Methods | Rate Limited | Auth Required |
|-------|---------|--------------|---------------|
| `/api/vendors` | GET | No | No |
| `/api/vendors/[id]` | GET | No | No |
| `/api/products` | GET | No | No |
| `/api/products/[id]` | GET | No | No |
| `/api/products/[id]/reviews` | - | No | No |
| `/api/blog` | GET | No | No |
| `/api/geocode` | GET | Yes (10/1min) | No |
| `/api/health` | GET, HEAD | No | No |
| `/api/health/ready` | GET | No | No |
| `/api/media/upload` | POST | No | No |
| `/api/notifications` | GET | No | Yes |
| `/api/notifications/[id]/read` | PUT | No | Yes |
| `/api/notifications/mark-all-read` | - | No | Yes |

### Test Routes (`/api/test/`)
| Route | Methods | Environment Guard |
|-------|---------|-------------------|
| `/api/test/vendors/seed` | POST | Non-production only |
| `/api/test/vendors/reset-tier` | - | Non-production only |
| `/api/test/products/seed` | POST | Non-production only |
| `/api/test/health` | GET | Non-production only |
| `/api/test/rate-limit/clear` | - | Non-production only |
| `/api/test/admin/vendors/[id]` | - | Non-production only |
| `/api/test/admin/tier-requests` | - | Non-production only |
| `/api/test/admin/tier-requests/approve` | - | Non-production only |
| `/api/test/admin/tier-requests/reject` | - | Non-production only |

---

## Critical Issues

**None identified.** The codebase demonstrates good security practices:
- No exposed secrets in code
- Proper authentication checks on protected routes
- Test routes are properly guarded with environment checks
- Password hashing is delegated to Payload CMS
- Token rotation implemented for refresh tokens

---

## High Priority Issues

### H1. Inconsistent Authentication Mechanisms
**Location:** Multiple routes
**Severity:** High
**Description:** Two different authentication patterns are used across the codebase:
1. **`@/lib/auth` module** (unified) - Used in portal routes with `validateToken()`, `requireAdmin()`, `requireVendorOwnership()`
2. **Payload CMS native auth** - Used in admin tier-upgrade routes and notifications via `payload.auth({ headers })`

**Evidence:**
- `/api/admin/tier-upgrade-requests/route.ts` uses `payload.auth({ headers })` with cookie `payload-token`
- `/api/portal/vendors/[id]/route.ts` uses `validateToken(request)` from `@/lib/auth` with cookie `access_token`

**Impact:** This creates maintenance overhead and potential security gaps if one authentication flow is updated but not the other.

**Recommendation:** Standardize on the unified `@/lib/auth` module across all routes for consistency. The admin tier-upgrade routes should be migrated to use `requireAdmin()` from `@/lib/auth`.

---

### H2. Missing Rate Limiting on Sensitive Admin Routes
**Location:** `/api/admin/vendors/[id]/approve`, `/api/admin/vendors/[id]/reject`, `/api/admin/vendors/[id]/tier`
**Severity:** High
**Description:** Some admin routes that perform state-changing operations are not rate-limited, while others (tier-upgrade-requests) are.

**Evidence:**
- `/api/admin/vendors/[id]/approve/route.ts` - No rate limiting
- `/api/admin/tier-upgrade-requests/[id]/approve/route.ts` - Has rate limiting

**Impact:** Could allow automated abuse of vendor approval/rejection workflows.

**Recommendation:** Add rate limiting to all state-changing admin endpoints using the existing `rateLimit()` middleware.

---

### H3. Missing Rate Limiting on Portal CRUD Operations
**Location:** `/api/portal/vendors/[id]/*`, `/api/portal/vendors/[id]/products/*`
**Severity:** High
**Description:** Portal routes for updating vendor profiles and managing products lack rate limiting. Only the tier-upgrade-request POST has rate limiting.

**Impact:** Could allow rapid automated requests for profile/product manipulation.

**Recommendation:** Add rate limiting with appropriate limits (e.g., 30 requests/minute for read, 10 requests/minute for write operations).

---

### H4. Media Upload Route Lacks Authentication
**Location:** `/api/media/upload/route.ts`
**Severity:** High
**Description:** The media upload endpoint has no authentication, allowing unauthenticated users to upload files.

**Evidence:**
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // No authentication check
  const formData = await request.formData();
```

**Impact:** Allows anonymous file uploads which could lead to storage abuse or hosting of unwanted content.

**Recommendation:** Add authentication requirement using `validateToken()` from `@/lib/auth`. At minimum, require user to be authenticated; ideally restrict to specific roles.

---

## Medium Priority Issues

### M1. Inconsistent Response Format for Error Responses
**Location:** Various routes
**Severity:** Medium
**Description:** Error responses vary in structure across different route groups:

**Pattern A (Portal routes - recommended):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description",
    "fields": { ... }
  }
}
```

**Pattern B (Simple routes):**
```json
{
  "error": "Description"
}
```

**Evidence:**
- `/api/products/[id]/route.ts` uses Pattern B
- `/api/portal/vendors/[id]/route.ts` uses Pattern A

**Recommendation:** Standardize on Pattern A with structured error objects for better client-side error handling.

---

### M2. Inconsistent Success Response Format
**Location:** Various routes
**Severity:** Medium
**Description:** Success responses vary between:

**Pattern A (Portal routes):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Pattern B (Repository-based routes):**
```json
{
  "docs": [...],
  "totalDocs": 100,
  "page": 1
}
```

**Evidence:**
- `/api/vendors/route.ts` returns repository pagination format directly
- `/api/portal/vendors/[id]/products/route.ts` wraps in `success: true, data: [...]`

**Recommendation:** Create a standardized response wrapper or document the intentional difference between public API and portal API response formats.

---

### M3. Missing Input Validation on Some GET Endpoints
**Location:** `/api/vendors/route.ts`, `/api/products/route.ts`, `/api/blog/route.ts`
**Severity:** Medium
**Description:** Query parameter parsing lacks validation. Invalid values (non-numeric page/limit) are parsed with `parseInt()` which may produce `NaN`.

**Evidence:**
```typescript
const page = parseInt(searchParams.get('page') || '1', 10);
const limit = parseInt(searchParams.get('limit') || '20', 10);
```
If `page=abc` is passed, `parseInt('abc', 10)` returns `NaN`.

**Recommendation:** Add validation to ensure numeric parameters are valid:
```typescript
const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
```

---

### M4. Duplicate authenticateAdmin() Implementation
**Location:** `/api/admin/tier-upgrade-requests/route.ts`, `/api/admin/tier-upgrade-requests/[id]/approve/route.ts`
**Severity:** Medium
**Description:** The `authenticateAdmin()` function is duplicated in multiple admin route files instead of being extracted to a shared module.

**Recommendation:** Use the existing `requireAdmin()` from `@/lib/auth` or extract the Payload-based auth to a shared utility.

---

### M5. Duplicate authenticateVendor() Implementation
**Location:** `/api/portal/vendors/[id]/tier-upgrade-request/route.ts`
**Severity:** Medium
**Description:** Contains its own `authenticateVendor()` function that duplicates logic already available in `requireVendorOwnership()` from `@/lib/auth`.

**Recommendation:** Refactor to use `requireVendorOwnership()` from `@/lib/auth`.

---

### M6. Debug Logging in Production Code
**Location:** `/api/portal/vendors/[id]/route.ts`
**Severity:** Medium
**Description:** Contains verbose debug logging that should be conditionally enabled:
```typescript
// DEBUG: Log received body for troubleshooting 400 errors
console.log('[VendorUpdate] Received body:', JSON.stringify(body, null, 2));
```

**Recommendation:** Use a logging utility with log levels that can be configured per environment, or wrap debug statements in environment checks.

---

### M7. Missing CORS Configuration
**Location:** All API routes
**Severity:** Medium
**Description:** No explicit CORS handling is present in the API routes. While Next.js has default behavior, explicit CORS headers would be beneficial for public APIs.

**Recommendation:** Add CORS middleware or headers for public-facing API routes, especially `/api/geocode`, `/api/public/*`, and `/api/vendors`.

---

### M8. Missing Request Size Limits on JSON Endpoints
**Location:** Multiple routes
**Severity:** Medium
**Description:** While media upload has a 10MB limit, JSON body parsing routes don't have explicit size limits.

**Recommendation:** Configure Next.js body parser limits or add explicit checks before parsing large payloads.

---

### M9. Potential Integer Overflow in Pagination
**Location:** `/api/admin/tier-upgrade-requests/route.ts`
**Severity:** Medium
**Description:** While limit has a max check, page number has no upper bound:
```typescript
const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
// page has no max check
```

**Recommendation:** Add reasonable upper bounds to pagination parameters.

---

## Low Priority Issues

### L1. Missing TypeScript Return Types on Some Handlers
**Location:** `/api/blog/route.ts`, `/api/products/route.ts`, `/api/vendors/route.ts`
**Severity:** Low
**Description:** Some route handlers don't have explicit return type annotations:
```typescript
export async function GET(request: NextRequest) { // Missing return type
```

**Recommendation:** Add explicit `Promise<NextResponse>` or `Promise<NextResponse<T>>` return types for consistency with other routes.

---

### L2. Inconsistent Error Code Casing
**Location:** Various routes
**Severity:** Low
**Description:** Error codes use different casing conventions:
- `VALIDATION_ERROR` (SCREAMING_SNAKE_CASE)
- `INTERNAL_ERROR` (SCREAMING_SNAKE_CASE)
- Some routes use lowercase in error generation

**Recommendation:** Standardize on SCREAMING_SNAKE_CASE for all error codes and define them as constants.

---

### L3. Missing JSDoc Documentation on Some Routes
**Location:** `/api/vendors/route.ts`, `/api/products/route.ts`
**Severity:** Low
**Description:** Some routes lack JSDoc comments documenting authentication requirements and response schemas.

**Recommendation:** Add JSDoc comments following the pattern used in well-documented routes like `/api/admin/vendors/[id]/tier/route.ts`.

---

### L4. Inconsistent Use of `dynamic` Export
**Location:** Various routes
**Severity:** Low
**Description:** Only some routes explicitly disable Next.js route caching with `export const dynamic = 'force-dynamic'`.

**Evidence:** `/api/portal/vendors/[id]/route.ts` has this export, but similar portal routes do not.

**Recommendation:** Review which routes need dynamic rendering and apply consistently.

---

## Positive Observations

### Strong Patterns Found

1. **Comprehensive Zod Validation**: The `/api/portal/vendors/register` route demonstrates excellent validation with Zod schemas, including detailed field-level error reporting.

2. **Well-Implemented Rate Limiting**: The `@/lib/middleware/rateLimit.ts` implementation is robust with:
   - IP extraction from proxy headers
   - Configurable per-route limits
   - Proper 429 responses with Retry-After headers
   - Rate limit headers on all responses

3. **Unified Auth Module**: The `@/lib/auth/index.ts` module provides a clean, well-documented authentication API with:
   - Token extraction from headers and cookies
   - Token version validation for revocation
   - Role-based access control helpers
   - Type guards for auth results

4. **Proper HTTP Status Codes**: Routes consistently use appropriate status codes (201 for creation, 404 for not found, 403 for forbidden, etc.)

5. **Audit Logging**: Authentication routes include comprehensive audit logging for security events.

6. **Test Route Protection**: All test routes include proper environment guards to prevent production access.

7. **Graceful Error Handling**: Portal routes implement proper try-catch with specific error type handling.

---

## Recommendations Summary

### Priority Actions

1. **[HIGH]** Add authentication to `/api/media/upload`
2. **[HIGH]** Add rate limiting to admin vendor approval/rejection routes
3. **[HIGH]** Standardize authentication to use unified `@/lib/auth` module
4. **[MEDIUM]** Create shared error response utilities for consistency
5. **[MEDIUM]** Extract duplicate `authenticateAdmin`/`authenticateVendor` to shared modules

### Future Improvements

1. Create API documentation (OpenAPI/Swagger) for public endpoints
2. Implement API versioning strategy for breaking changes
3. Add request tracing/correlation IDs for debugging
4. Consider implementing API response compression for large payloads
5. Add metrics collection for API performance monitoring

---

## Appendix: Authentication Patterns Reference

### Recommended Pattern (from @/lib/auth)

```typescript
import { validateToken, requireAdmin, requireVendorOwnership } from '@/lib/auth';

// For any authenticated route
const auth = await validateToken(request);
if (!auth.success) {
  return NextResponse.json(
    { success: false, error: { code: auth.code, message: auth.error } },
    { status: auth.status }
  );
}

// For admin-only routes
const auth = await requireAdmin(request);

// For vendor-owned resources
const auth = await requireVendorOwnership(vendorId)(request);
```

### Recommended Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;      // e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED'
    message: string;   // Human-readable message
    fields?: Record<string, string>;  // For validation errors
    details?: string;  // Additional context
  };
}
```

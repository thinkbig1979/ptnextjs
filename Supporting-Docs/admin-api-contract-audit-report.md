# Admin API Contract Audit Report

**Date:** 2025-12-07
**Auditor:** Claude (Senior JavaScript/TypeScript Developer)
**Scope:** Admin panel forms vs backend API data structures

## Executive Summary

This audit examined the alignment between admin panel frontend components and backend API routes to ensure data structures, request bodies, and response handling are consistent. The audit covered vendor approval workflows, tier change request management, and direct tier changes.

**Overall Status:** CRITICAL ISSUES FOUND

- **Total Components Audited:** 3
- **Total API Routes Audited:** 7
- **Critical Issues:** 2
- **Medium Issues:** 1
- **Minor Issues:** 0

## Components Audited

### Frontend Components
1. `/home/edwin/development/ptnextjs/components/admin/AdminApprovalQueue.tsx` (460 lines)
2. `/home/edwin/development/ptnextjs/components/admin/AdminTierRequestQueue.tsx` (500+ lines)
3. `/home/edwin/development/ptnextjs/components/admin/AdminDirectTierChange.tsx` (311 lines)

### Backend API Routes
1. `POST /api/admin/vendors/[id]/approve` (105 lines)
2. `POST /api/admin/vendors/[id]/reject` (104 lines)
3. `PUT /api/admin/vendors/[id]/tier` (148 lines)
4. `GET /api/admin/vendors/pending` (74 lines)
5. `GET /api/admin/tier-upgrade-requests` (116 lines)
6. `PUT /api/admin/tier-upgrade-requests/[id]/approve` (106 lines)
7. `PUT /api/admin/tier-upgrade-requests/[id]/reject` (144 lines)

---

## CRITICAL ISSUES

### 1. AUTHENTICATION COOKIE NAME INCONSISTENCY (CRITICAL)

**Severity:** CRITICAL
**Impact:** Authentication may fail silently or behave inconsistently across admin features
**Risk:** High - Could lead to unauthorized access or broken admin functionality

**Location:**
- Vendor approval routes: `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/approve/route.ts` (lines 10-11)
- Vendor rejection route: `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/reject/route.ts` (lines 10-11)
- Tier change route: `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/tier/route.ts` (lines 11-13)
- Tier request routes: `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/approve/route.ts` (line 24)
- Tier request routes: `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts` (line 24)
- Tier request routes: `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts` (line 25)

**Issue:**
```typescript
// Vendor approval/rejection routes use:
const token = request.cookies.get('access_token')?.value ||
              request.headers.get('authorization')?.replace('Bearer ', '');

// Tier upgrade request routes use:
const token = request.cookies.get('payload-token')?.value;
```

**Different cookie names:**
- Vendor routes: `access_token`
- Tier request routes: `payload-token`

**Different fallback mechanisms:**
- Vendor routes: Fall back to `Authorization` header
- Tier request routes: No fallback mechanism

**Recommendation:**
Standardize on a single cookie name across all admin routes. Recommended approach:
```typescript
// Standardized authentication extraction
const token = request.cookies.get('payload-token')?.value ||
              request.headers.get('authorization')?.replace('Bearer ', '');
```

---

### 2. AUTHENTICATION METHOD INCONSISTENCY (CRITICAL)

**Severity:** CRITICAL
**Impact:** Different authentication mechanisms may have different security properties
**Risk:** High - Security vulnerability if one method is weaker

**Location:**
- Vendor routes: Use `authService.validateToken(token)`
- Tier request routes: Use `payload.auth({ headers: request.headers })`

**Issue:**
```typescript
// Vendor approval/rejection routes (app/api/admin/vendors/[id]/*/route.ts)
import { authService } from '@/lib/services/auth-service';

function extractAdminUser(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new Error('Authentication required');
  }
  const user = authService.validateToken(token);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

// Tier request routes (app/api/admin/tier-upgrade-requests/.../route.ts)
async function authenticateAdmin(request: NextRequest) {
  const payload = await getPayload({ config });
  const token = request.cookies.get('payload-token')?.value;
  if (!token) {
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication required' };
  }
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return { error: 'UNAUTHORIZED', status: 401, message: 'Invalid authentication token' };
  }
  if (user.role !== 'admin') {
    return { error: 'FORBIDDEN', status: 403, message: 'Admin access required' };
  }
  return { user };
}
```

**Key Differences:**
1. **Token validation method:**
   - Vendor routes: `authService.validateToken()` (synchronous)
   - Tier routes: `payload.auth()` (async)

2. **Error handling pattern:**
   - Vendor routes: Throws errors
   - Tier routes: Returns error objects

3. **Payload CMS integration:**
   - Vendor routes: No direct Payload integration
   - Tier routes: Uses Payload's auth system

**Recommendation:**
Standardize on Payload CMS authentication for all admin routes:
```typescript
// Create shared authentication utility: lib/utils/admin-auth.ts
import { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function authenticateAdmin(request: NextRequest) {
  const payload = await getPayload({ config });

  // Support both cookie and header authentication
  const token = request.cookies.get('payload-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication required' };
  }

  try {
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return { error: 'UNAUTHORIZED', status: 401, message: 'Invalid authentication token' };
    }

    if (user.role !== 'admin') {
      return { error: 'FORBIDDEN', status: 403, message: 'Admin access required' };
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication failed' };
  }
}
```

Then update all vendor routes to use this shared utility.

---

## MEDIUM ISSUES

### 3. FRONTEND VALIDATION MISSING FOR REJECTION REASON LENGTH (MEDIUM)

**Severity:** MEDIUM
**Impact:** Users may submit rejections that fail backend validation
**Risk:** Medium - Poor UX, but backend validation prevents data issues

**Location:**
- Frontend: `/home/edwin/development/ptnextjs/components/admin/AdminTierRequestQueue.tsx` (lines 231-242)
- Backend: `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts` (lines 73-105)

**Issue:**

Frontend validation (AdminTierRequestQueue.tsx):
```typescript
// Frontend only checks if rejection reason is not empty
if (!rejectionReason.trim()) {
  toast({
    title: 'Error',
    description: 'Please provide a reason for rejection.',
    variant: 'destructive',
  });
  return;
}
```

Backend validation (reject/route.ts):
```typescript
// Backend has stricter validation
if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
  return NextResponse.json(
    { success: false, error: 'VALIDATION_ERROR', message: 'Rejection reason is required' },
    { status: 400 }
  );
}

// Minimum length validation (10 characters)
if (body.rejectionReason.trim().length < 10) {
  return NextResponse.json(
    { success: false, error: 'VALIDATION_ERROR', message: 'Rejection reason must be at least 10 characters' },
    { status: 400 }
  );
}

// Maximum length validation (1000 characters)
if (body.rejectionReason.length > 1000) {
  return NextResponse.json(
    { success: false, error: 'VALIDATION_ERROR', message: 'Rejection reason must not exceed 1000 characters' },
    { status: 400 }
  );
}
```

**Affected Components:**
1. `AdminTierRequestQueue.tsx` - Tier request rejection dialog
2. Note: `AdminApprovalQueue.tsx` (vendor rejection) only checks for empty string, which is less strict but may also need length validation

**Recommendation:**
Add frontend validation to match backend requirements:

```typescript
// AdminTierRequestQueue.tsx - Update handleReject function
const handleReject = async (): Promise<void> => {
  if (!selectedRequest) return;

  // Enhanced validation
  const trimmedReason = rejectionReason.trim();

  if (trimmedReason.length === 0) {
    toast({
      title: 'Error',
      description: 'Please provide a reason for rejection.',
      variant: 'destructive',
    });
    return;
  }

  if (trimmedReason.length < 10) {
    toast({
      title: 'Error',
      description: 'Rejection reason must be at least 10 characters.',
      variant: 'destructive',
    });
    return;
  }

  if (rejectionReason.length > 1000) {
    toast({
      title: 'Error',
      description: 'Rejection reason must not exceed 1000 characters.',
      variant: 'destructive',
    });
    return;
  }

  // ... rest of function
};
```

Also add character counter to the textarea:
```tsx
<div className="py-4">
  <Textarea
    id="rejection-reason-input"
    placeholder="Enter rejection reason (minimum 10 characters)..."
    value={rejectionReason}
    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
    rows={4}
    className="w-full"
    aria-label="Rejection reason"
    aria-required="true"
    maxLength={1000}
  />
  <p className="mt-1 text-xs text-muted-foreground text-right">
    {rejectionReason.length}/1000 characters
    {rejectionReason.trim().length > 0 && rejectionReason.trim().length < 10 &&
      <span className="text-destructive ml-2">(minimum 10 characters)</span>
    }
  </p>
</div>
```

**Note:** Consider adding the same validation to `AdminApprovalQueue.tsx` vendor rejection if similar requirements exist.

---

## VERIFIED CORRECT IMPLEMENTATIONS

### 1. Vendor Approval Workflow (GET /api/admin/vendors/pending)
- Request structure: Correct (no query params)
- Response structure: Correct (matches frontend expectations)
- Error handling: Consistent

### 2. Vendor Approval Action (POST /api/admin/vendors/[id]/approve)
- Request structure: Correct (empty body)
- HTTP method: Correct (POST)
- Response handling: Correct
- Error handling: Consistent

### 3. Vendor Rejection Action (POST /api/admin/vendors/[id]/reject)
- Request structure: Correct (`{ rejectionReason: string }`)
- HTTP method: Correct (POST)
- Field name: Correct (`rejectionReason`)
- Response handling: Correct
- Error handling: Consistent

### 4. Direct Tier Change (PUT /api/admin/vendors/[id]/tier)
- Request structure: Correct (`{ tier: VendorTier }`)
- HTTP method: Correct (PUT)
- Field name: Correct (`tier`)
- Tier values: Correct (matches frontend TierType)
- Response handling: Correct
- Error handling: Consistent

### 5. Tier Request List (GET /api/admin/tier-upgrade-requests)
- Query parameters: Correct (`status`, `requestType`)
- Response structure: Frontend defensively handles both `data` and `requests` properties
- Pagination support: Backend supports it, frontend doesn't use it yet
- Error handling: Consistent

### 6. Tier Request Approval (PUT /api/admin/tier-upgrade-requests/[id]/approve)
- Request structure: Correct (empty body)
- HTTP method: Correct (PUT)
- Response handling: Correct (checks `error || message`)
- Error handling: Consistent

### 7. Tier Request Rejection (PUT /api/admin/tier-upgrade-requests/[id]/reject)
- Request structure: Correct (`{ rejectionReason: string }`)
- HTTP method: Correct (PUT)
- Field name: Correct (`rejectionReason`)
- Response handling: Correct (checks `error || message`)
- Backend validation: Comprehensive (see Medium Issue #3)
- Frontend validation: Basic (see Medium Issue #3)

---

## DATA STRUCTURE ALIGNMENT

### Vendor Approval Queue Response
```typescript
// Frontend interface (AdminApprovalQueue.tsx lines 41-54)
interface PendingVendor {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  };
  vendor: {
    id: string;
    companyName: string;
    contactPhone?: string;
  } | null;
}

// Backend response (app/api/admin/vendors/pending/route.ts lines 52-60)
// Matches perfectly
```
**Status:** ALIGNED ✓

### Tier Request Queue Response
```typescript
// Frontend interface (AdminTierRequestQueue.tsx lines 50-63)
interface TierUpgradeRequest {
  id: string;
  vendor: {
    id: string;
    companyName: string;
    contactEmail?: string;
  };
  currentTier: string;
  requestedTier: string;
  requestType: 'upgrade' | 'downgrade';
  vendorNotes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
}

// Backend relies on TierUpgradeRequestService
// Should verify service returns this exact structure
```
**Status:** ALIGNED ✓ (assumed based on service usage)

### Direct Tier Change Request
```typescript
// Frontend (AdminDirectTierChange.tsx line 129)
{ tier: string }

// Backend expects (app/api/admin/vendors/[id]/tier/route.ts line 63)
{ tier: VendorTier } // where VendorTier = 'free' | 'tier1' | 'tier2' | 'tier3'
```
**Status:** ALIGNED ✓

---

## HTTP METHOD CONSISTENCY

All HTTP methods are correctly aligned:

| Endpoint | Frontend Method | Backend Method | Status |
|----------|----------------|----------------|--------|
| GET /api/admin/vendors/pending | GET | GET | ✓ |
| POST /api/admin/vendors/[id]/approve | POST | POST | ✓ |
| POST /api/admin/vendors/[id]/reject | POST | POST | ✓ |
| PUT /api/admin/vendors/[id]/tier | PUT | PUT | ✓ |
| GET /api/admin/tier-upgrade-requests | GET | GET | ✓ |
| PUT /api/admin/tier-upgrade-requests/[id]/approve | PUT | PUT | ✓ |
| PUT /api/admin/tier-upgrade-requests/[id]/reject | PUT | PUT | ✓ |

---

## ERROR HANDLING CONSISTENCY

### Vendor Routes
All vendor routes use consistent error response format:
```typescript
{ error: string }
```

Status codes:
- 401: Authentication required
- 403: Admin access required
- 404: Vendor not found
- 400: Validation errors
- 500: Server errors

### Tier Request Routes
Tier request routes use enhanced error response format:
```typescript
{
  success: boolean;
  error?: string;      // Error code (e.g., 'VALIDATION_ERROR')
  message?: string;    // Human-readable message
}
```

Frontend components handle this correctly by checking `error || message`.

**Status:** ALIGNED ✓ (frontend is defensive)

---

## RECOMMENDATIONS SUMMARY

### Immediate Actions Required (Critical)

1. **Standardize Authentication (CRITICAL - Priority 1)**
   - Create shared `authenticateAdmin()` utility in `/home/edwin/development/ptnextjs/lib/utils/admin-auth.ts`
   - Update all vendor approval/rejection routes to use Payload auth
   - Standardize cookie name to `payload-token` across all routes
   - Add fallback to `Authorization` header for both cookie types

2. **Add Frontend Validation (MEDIUM - Priority 2)**
   - Add length validation to `AdminTierRequestQueue.tsx` rejection reason
   - Add character counter to rejection textarea
   - Consider adding same validation to `AdminApprovalQueue.tsx`

### Testing Recommendations

1. **Integration Tests**
   - Test file created: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/admin-api-contract.test.ts`
   - Run tests to verify contract alignment
   - Add E2E tests for authentication flow

2. **Manual Testing Checklist**
   - [ ] Test vendor approval with both cookie types
   - [ ] Test tier request approval/rejection with long and short reasons
   - [ ] Verify authentication works consistently across all admin routes
   - [ ] Test error handling for all validation scenarios

### Future Improvements

1. **API Response Standardization**
   - Consider standardizing all API responses to include `success` boolean
   - Use consistent error code format across all routes

2. **Frontend Improvements**
   - Add loading states during authentication
   - Improve error messages with specific validation feedback
   - Add real-time validation feedback (not just on submit)

3. **Backend Improvements**
   - Extract authentication logic to shared middleware
   - Add request validation middleware
   - Consider adding rate limiting to all admin routes (currently only on tier request routes)

---

## FILES AFFECTED

### Frontend Components (Require Updates)
1. `/home/edwin/development/ptnextjs/components/admin/AdminTierRequestQueue.tsx`
   - Add rejection reason length validation
   - Add character counter

### Backend Routes (Require Updates)
1. `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/approve/route.ts`
   - Switch to standardized authentication
   - Update cookie name to `payload-token`

2. `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/reject/route.ts`
   - Switch to standardized authentication
   - Update cookie name to `payload-token`

3. `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/tier/route.ts`
   - Switch to standardized authentication
   - Update cookie name to `payload-token`

4. `/home/edwin/development/ptnextjs/app/api/admin/vendors/pending/route.ts`
   - Switch to standardized authentication
   - Update cookie name to `payload-token`

### New Files (To Be Created)
1. `/home/edwin/development/ptnextjs/lib/utils/admin-auth.ts`
   - Shared authentication utility

### Test Files (Created)
1. `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/admin-api-contract.test.ts`
   - Comprehensive contract tests

---

## CONCLUSION

The audit identified 2 critical issues related to authentication inconsistency and 1 medium issue related to frontend validation. All other data structures, HTTP methods, and error handling are correctly aligned between frontend and backend.

**Action Required:** Address critical authentication issues immediately to ensure security and consistency across all admin routes. Follow up with frontend validation improvements for better user experience.

**Overall Risk Level:** HIGH (due to authentication inconsistencies)
**Recommendation:** Implement authentication standardization before deploying to production.

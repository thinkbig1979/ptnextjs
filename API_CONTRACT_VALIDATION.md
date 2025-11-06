# API Contract Validation Report
## Tier Upgrade Request System Integration

### Executive Summary
This document validates the frontend-backend API contract for the Tier Upgrade Request system and documents findings from the integration audit.

**Status**: ISSUES IDENTIFIED - Authentication Error Handling Missing
**Severity**: MEDIUM - Missing critical error handling paths
**Date**: 2025-11-05

---

## 1. API Contract Analysis

### 1.1 POST /api/portal/vendors/[id]/tier-upgrade-request
**Purpose**: Submit a new tier upgrade request
**Frontend Component**: `components/dashboard/TierUpgradeRequestForm.tsx` (lines 105-151)
**Backend**: `app/api/portal/vendors/[id]/tier-upgrade-request/route.ts` (lines 62-151)

**Request Contract**:
```typescript
POST /api/portal/vendors/{id}/tier-upgrade-request
Headers: { 'Content-Type': 'application/json' }
Body: {
  requestedTier: 'tier1' | 'tier2' | 'tier3',
  vendorNotes?: string (min 20, max 500 chars if provided)
}
```

**Response Contract**:
- Status 201: `{ success: true, data: TierUpgradeRequest }`
- Status 400: `{ success: false, error: 'VALIDATION_ERROR', message: string, details?: array }`
- Status 401: `{ success: false, error: 'UNAUTHORIZED', message: string }`
- Status 403: `{ success: false, error: 'FORBIDDEN', message: string }`
- Status 409: `{ success: false, error: 'DUPLICATE_REQUEST', message: string, existingRequest?: object }`
- Status 500: `{ success: false, error: 'INTERNAL_ERROR', message: string }`

**Frontend Error Handling Analysis**:
```
CURRENT (Lines 125-133):
- Handles 409: "You already have a pending upgrade request" ✓
- Handles 400: Uses result.message from response ✓
- Handles other: Generic "Failed to submit request" ✗

MISSING:
- 401 (Unauthorized) - Should redirect to /vendor/login
- 403 (Forbidden) - Should redirect to /vendor/dashboard
- 500 (Server Error) - Should show specific error message
```

**Status**: ISSUE FOUND - Missing 401 and 403 error handling

---

### 1.2 GET /api/portal/vendors/[id]/tier-upgrade-request
**Purpose**: Fetch pending or most recent tier upgrade request
**Frontend Components**:
  - `app/(site)/vendor/dashboard/subscription/page.tsx` (lines 54-89)
**Backend**: `app/api/portal/vendors/[id]/tier-upgrade-request/route.ts` (lines 156-182)

**Request Contract**:
```typescript
GET /api/portal/vendors/{id}/tier-upgrade-request
Authentication: Required (payload-token cookie)
```

**Response Contract**:
- Status 200: `{ success: true, data: TierUpgradeRequest | null }`
- Status 401: `{ success: false, error: 'UNAUTHORIZED', message: string }`
- Status 403: `{ success: false, error: 'FORBIDDEN', message: string }`
- Status 404: Returns 200 with `data: null` (no pending request)
- Status 500: `{ success: false, error: 'INTERNAL_ERROR', message: string }`

**Frontend Error Handling Analysis**:
```
CURRENT (Lines 62-77):
- Handles 200 with data.data?.status === 'pending' ✓
- Treats 404 as expected (no pending request) ✓
- Other errors: Sets requestError = 'Failed to load upgrade request' ✗

MISSING:
- 401 (Unauthorized) - Should redirect to /vendor/login
- 403 (Forbidden) - Should redirect to /vendor/dashboard
- Distinction between 401, 403, 500 errors
```

**Status**: ISSUE FOUND - Missing auth error handling and distinction

---

### 1.3 DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]
**Purpose**: Cancel a pending tier upgrade request
**Frontend Component**: `components/dashboard/UpgradeRequestStatusCard.tsx` (lines 86-107)
**Backend**: `app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts` (lines 61-107)

**Request Contract**:
```typescript
DELETE /api/portal/vendors/{id}/tier-upgrade-request/{requestId}
Authentication: Required (payload-token cookie)
```

**Response Contract**:
- Status 200: `{ success: true, message: 'Request cancelled successfully' }`
- Status 400: `{ success: false, error: 'CAN_ONLY_CANCEL_PENDING_REQUESTS', message: string }`
- Status 401: `{ success: false, error: 'UNAUTHORIZED', message: string }`
- Status 403: `{ success: false, error: 'FORBIDDEN', message: string }`
- Status 404: `{ success: false, error: 'REQUEST_NOT_FOUND', message: string }`
- Status 500: `{ success: false, error: 'INTERNAL_ERROR', message: string }`

**Frontend Error Handling Analysis**:
```
CURRENT (Lines 95-106):
- Checks response.ok ✓
- Generic error: "Failed to cancel request" ✗

MISSING:
- 401 (Unauthorized) - Should redirect to /vendor/login
- 403 (Forbidden) - Should redirect to /vendor/dashboard
- 400 (Invalid status) - Should show specific error
- 404 (Not found) - Should show specific error
- 500 (Server error) - Should show specific error
```

**Status**: ISSUE FOUND - Missing specific error handling for all error codes

---

## 2. Authentication & Authorization Issues

### 2.1 Session Expiration (401)
**Issue**: Frontend does not handle 401 Unauthorized errors
**Impact**: When session expires, users see generic error messages and unclear redirects
**Required Fix**:
- Show toast: "Your session has expired. Please log in again."
- Redirect to `/vendor/login` after brief delay (1500ms to show toast)
- Applies to: POST, GET, DELETE endpoints

### 2.2 Permission Errors (403)
**Issue**: Frontend does not handle 403 Forbidden errors
**Impact**: Users attempting to access other vendor's data see generic errors
**Required Fix**:
- Show toast: "You do not have permission to perform this action."
- Redirect to `/vendor/dashboard` after brief delay (1500ms to show toast)
- Applies to: POST, GET, DELETE endpoints

---

## 3. Request Validation Contract

### 3.1 Tier Upgrade Validation (Service Layer)
**Source**: `lib/services/TierUpgradeRequestService.ts` (lines 101-170)

**Validation Rules**:
```typescript
- requestedTier: Required, one of ['tier1', 'tier2', 'tier3']
- currentTier: Derived from vendor.tier at request time
- vendorNotes: Optional, max 500 characters, min 20 if provided
- Must be upgrade (requestedTier > currentTier)
- Cannot request 'free' tier (downgrades not allowed)
```

**Frontend Validation** (`TierUpgradeRequestForm.tsx`):
```typescript
- requestedTier: Zod enum validation ✓
- vendorNotes: Min 20, max 500 character validation ✓
- Available tiers filtered by current tier ✓
- Tier display only if not at tier3 ✓
```

**Status**: PASS - Frontend validation matches backend requirements

---

## 4. Data Type Compatibility

### 4.1 TierUpgradeRequest Type Definition
**Source**: `lib/types.ts` (lines 420-439)

```typescript
export interface TierUpgradeRequest {
  id: string;
  vendor: string | Vendor;
  user: string | User;
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  requestedTier: 'tier1' | 'tier2' | 'tier3';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  vendorNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string | User;
  requestedAt: string; // ISO 8601
}
```

**Frontend Usage**:
- `TierUpgradeRequestForm.tsx`: Sends `requestedTier`, `vendorNotes` ✓
- `UpgradeRequestStatusCard.tsx`: Displays all TierUpgradeRequest fields ✓
- `subscription/page.tsx`: Uses TierUpgradeRequest type ✓

**Status**: PASS - Type compatibility correct

---

## 5. HTTP Status Code Contract Verification

| Code | Endpoint | Backend | Frontend |
|------|----------|---------|----------|
| 201 | POST request | ✓ Returns | ✓ Handles |
| 400 | POST request | ✓ Returns | ✓ Handles |
| 401 | POST request | ✓ Returns | **✗ MISSING** |
| 403 | POST request | ✓ Returns | **✗ MISSING** |
| 409 | POST request | ✓ Returns | ✓ Handles |
| 500 | POST request | ✓ Returns | ✗ Generic handling |
| 200 | GET request | ✓ Returns | ✓ Handles |
| 401 | GET request | ✓ Returns | **✗ MISSING** |
| 403 | GET request | ✓ Returns | **✗ MISSING** |
| 200 | DELETE request | ✓ Returns | ✓ Handles |
| 400 | DELETE request | ✓ Returns | **✗ MISSING** |
| 401 | DELETE request | ✓ Returns | **✗ MISSING** |
| 403 | DELETE request | ✓ Returns | **✗ MISSING** |
| 404 | DELETE request | ✓ Returns | **✗ MISSING** |
| 500 | DELETE request | ✓ Returns | **✗ MISSING** |

---

## 6. Required Frontend Fixes

### 6.1 TierUpgradeRequestForm.tsx (POST Endpoint)
**Location**: `components/dashboard/TierUpgradeRequestForm.tsx`, lines 125-133

**Current Code**:
```typescript
if (!response.ok) {
  if (response.status === 409) {
    toast.error('You already have a pending upgrade request');
  } else if (response.status === 400) {
    toast.error(result.message || 'Please fix the errors in the form');
  } else {
    toast.error('Failed to submit request. Please try again.');
  }
  setIsSubmitting(false);
  return;
}
```

**Required Change**:
```typescript
if (!response.ok) {
  if (response.status === 401) {
    toast.error('Your session has expired. Please log in again.');
    setTimeout(() => {
      window.location.href = '/vendor/login';
    }, 1500);
    return;
  } else if (response.status === 403) {
    toast.error('You do not have permission to perform this action.');
    setTimeout(() => {
      window.location.href = '/vendor/dashboard';
    }, 1500);
    return;
  } else if (response.status === 409) {
    toast.error('You already have a pending upgrade request');
  } else if (response.status === 400) {
    toast.error(result.message || 'Please fix the errors in the form');
  } else if (response.status === 500) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.error('Failed to submit request. Please try again.');
  }
  setIsSubmitting(false);
  return;
}
```

**Acceptance Criteria**:
- [ ] 401 errors redirect to `/vendor/login`
- [ ] 403 errors redirect to `/vendor/dashboard`
- [ ] 409 errors show "pending upgrade request" message
- [ ] 500 errors show server error message
- [ ] Toast messages display before redirect (1500ms delay)

---

### 6.2 UpgradeRequestStatusCard.tsx (DELETE Endpoint)
**Location**: `components/dashboard/UpgradeRequestStatusCard.tsx`, lines 86-107

**Current Code**:
```typescript
const handleCancel = async () => {
  try {
    setIsCancelling(true);

    const response = await fetch(
      `/api/portal/vendors/${vendorId}/tier-upgrade-request/${request.id}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel request');
    }

    toast.success('Request cancelled successfully');
    await onCancel?.(request.id);
  } catch (error) {
    toast.error('Failed to cancel request');
    console.error('Failed to cancel tier upgrade request:', error);
  } finally {
    setIsCancelling(false);
  }
};
```

**Required Change**:
```typescript
const handleCancel = async () => {
  try {
    setIsCancelling(true);

    const response = await fetch(
      `/api/portal/vendors/${vendorId}/tier-upgrade-request/${request.id}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/vendor/login';
        }, 1500);
        return;
      } else if (response.status === 403) {
        toast.error('You do not have permission to perform this action.');
        setTimeout(() => {
          window.location.href = '/vendor/dashboard';
        }, 1500);
        return;
      } else if (response.status === 400) {
        toast.error('Can only cancel pending requests');
      } else if (response.status === 404) {
        toast.error('Request not found');
      } else if (response.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to cancel request');
      }
      return;
    }

    toast.success('Request cancelled successfully');
    await onCancel?.(request.id);
  } catch (error) {
    console.error('Failed to cancel tier upgrade request:', error);
    toast.error('Failed to cancel request');
  } finally {
    setIsCancelling(false);
  }
};
```

**Acceptance Criteria**:
- [ ] 401 errors redirect to `/vendor/login`
- [ ] 403 errors redirect to `/vendor/dashboard`
- [ ] 400 errors show "Can only cancel pending requests"
- [ ] 404 errors show "Request not found"
- [ ] 500 errors show server error message
- [ ] Toast messages display before redirect (1500ms delay)

---

### 6.3 subscription/page.tsx (GET Endpoint)
**Location**: `app/(site)/vendor/dashboard/subscription/page.tsx`, lines 54-89

**Current Code**:
```typescript
useEffect(() => {
  const fetchUpgradeRequest = async () => {
    if (!vendor?.id) return;

    try {
      setIsLoadingRequest(true);
      setRequestError(null);

      const response = await fetch(`/api/portal/vendors/${vendor.id}/tier-upgrade-request`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.status === 'pending') {
          setUpgradeRequest(data.data);
        } else {
          setUpgradeRequest(null);
        }
      } else {
        // 404 means no pending request, which is fine
        if (response.status !== 404) {
          setRequestError('Failed to load upgrade request');
        }
      }
    } catch (err) {
      console.error('Failed to fetch upgrade request:', err);
      setRequestError('Failed to load upgrade request');
    } finally {
      setIsLoadingRequest(false);
    }
  };

  if (vendor?.id && !vendorLoading) {
    fetchUpgradeRequest();
  }
}, [vendor?.id, vendorLoading]);
```

**Required Change**:
```typescript
useEffect(() => {
  const fetchUpgradeRequest = async () => {
    if (!vendor?.id) return;

    try {
      setIsLoadingRequest(true);
      setRequestError(null);

      const response = await fetch(`/api/portal/vendors/${vendor.id}/tier-upgrade-request`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/vendor/login');
          return;
        } else if (response.status === 403) {
          router.push('/vendor/dashboard');
          return;
        } else if (response.status === 404) {
          // No pending request, this is fine
          setUpgradeRequest(null);
          return;
        } else if (response.status === 500) {
          setRequestError('Server error. Please try again later.');
          return;
        } else {
          setRequestError('Failed to load upgrade request');
          return;
        }
      }

      const data = await response.json();
      if (data.success && data.data?.status === 'pending') {
        setUpgradeRequest(data.data);
      } else {
        setUpgradeRequest(null);
      }
    } catch (err) {
      console.error('Failed to fetch upgrade request:', err);
      setRequestError('Failed to load upgrade request');
    } finally {
      setIsLoadingRequest(false);
    }
  };

  if (vendor?.id && !vendorLoading) {
    fetchUpgradeRequest();
  }
}, [vendor?.id, vendorLoading, router]);
```

**Acceptance Criteria**:
- [ ] 401 errors redirect to `/vendor/login`
- [ ] 403 errors redirect to `/vendor/dashboard`
- [ ] 404 errors treated as "no pending request" (no error shown)
- [ ] 500 errors show "Server error" message
- [ ] router is added to dependency array

---

## 7. Error Message Standardization

All error responses from backend follow this format:
```typescript
{
  success: false,
  error: string;  // ERROR_CODE in UPPER_SNAKE_CASE
  message: string; // Human-readable error message
  details?: array; // Additional validation details
}
```

Frontend should consistently:
1. Check `response.status` first (401, 403, 500, etc.)
2. Use `result.message` for validation errors (400)
3. Show brief, user-friendly toast messages
4. Redirect on auth errors after toast display

---

## 8. Integration Testing Checklist

### Pre-Integration Tests
- [ ] Verify backend API endpoints are running
- [ ] Check authentication flow (login creates payload-token)
- [ ] Verify database contains test vendor data

### POST Integration Tests
- [ ] Create request with valid tier upgrade
  - Expected: 201, request appears in database
- [ ] Create request when already pending
  - Expected: 409, "You already have a pending upgrade request"
- [ ] Create request without authentication
  - Expected: 401, redirects to login
- [ ] Create request for another vendor
  - Expected: 403, redirects to dashboard
- [ ] Submit with invalid tier (downgrade, 'free')
  - Expected: 400, validation error message
- [ ] Submit with notes too short (<20 chars)
  - Expected: 400, validation error message
- [ ] Submit with notes too long (>500 chars)
  - Expected: 400, validation error message

### GET Integration Tests
- [ ] Fetch pending request
  - Expected: 200, returns TierUpgradeRequest
- [ ] Fetch when no pending request
  - Expected: 200, returns null
- [ ] Fetch without authentication
  - Expected: 401, redirects to login
- [ ] Fetch for another vendor
  - Expected: 403, redirects to dashboard

### DELETE Integration Tests
- [ ] Cancel pending request
  - Expected: 200, request status changes to 'cancelled'
- [ ] Cancel already approved request
  - Expected: 400, "Can only cancel pending requests"
- [ ] Cancel non-existent request
  - Expected: 404, "Request not found"
- [ ] Cancel without authentication
  - Expected: 401, redirects to login
- [ ] Cancel for another vendor
  - Expected: 403, redirects to dashboard

---

## 9. Implementation Priority

### Priority 1 - Security Critical
1. [ ] Add 401 error handling to all three endpoints
2. [ ] Add 403 error handling to all three endpoints
3. [ ] Test auth redirects work correctly

### Priority 2 - User Experience
4. [ ] Add 500 error handling with meaningful messages
5. [ ] Add 400 error handling with validation details
6. [ ] Add 404 error handling for DELETE

### Priority 3 - Polish
7. [ ] Test all error scenarios
8. [ ] Verify error messages are user-friendly
9. [ ] Test loading states during API calls

---

## 10. Conclusion

**Overall Status**: INTEGRATION INCOMPLETE - CRITICAL SECURITY ISSUES

The backend API is properly implemented with comprehensive error handling. However, the frontend is missing critical error handling for authentication (401) and authorization (403) errors on all three endpoints. This creates security and user experience issues.

**Required Actions**:
1. Implement 401 error handling with redirect to `/vendor/login`
2. Implement 403 error handling with redirect to `/vendor/dashboard`
3. Improve generic error handling with status-specific messages
4. Add router to subscription page dependencies
5. Test all error scenarios before deployment

**Estimated Implementation Time**: 30-45 minutes
**Risk Level**: MEDIUM - Missing error handling could expose UX issues
**Testing Required**: Full integration test suite for all error paths


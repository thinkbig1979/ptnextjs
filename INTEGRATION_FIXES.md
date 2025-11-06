# Frontend-Backend Integration Fixes

This document contains the specific code changes required to complete the API contract integration for the Tier Upgrade Request system.

## File 1: components/dashboard/TierUpgradeRequestForm.tsx

### Change Location: Lines 125-133

Replace the error handling in the `onSubmit` function:

```typescript
// OLD CODE (LINES 125-133):
      if (!response.ok) {
        // Handle specific error cases
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

// NEW CODE:
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          // Redirect to login after brief delay to show toast
          setTimeout(() => {
            window.location.href = '/vendor/login';
          }, 1500);
          return;
        } else if (response.status === 403) {
          toast.error('You do not have permission to perform this action.');
          // Redirect to dashboard after brief delay
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

---

## File 2: components/dashboard/UpgradeRequestStatusCard.tsx

### Change Location: Lines 86-107

Replace the entire `handleCancel` function:

```typescript
// OLD CODE (LINES 86-107):
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

// NEW CODE:
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

---

## File 3: app/(site)/vendor/dashboard/subscription/page.tsx

### Change 1: Import useRouter (Line 4)

The router import is already present, so no change needed. Just verify it exists:
```typescript
import { useRouter } from 'next/navigation';
```

### Change 2: Update fetchUpgradeRequest useEffect (Lines 54-89)

Replace the entire useEffect hook:

```typescript
// OLD CODE (LINES 54-89):
  useEffect(() => {
    const fetchUpgradeRequest = async () => {
      if (!vendor?.id) return;

      try {
        setIsLoadingRequest(true);
        setRequestError(null);

        const response = await fetch(`/api/portal/vendors/${vendor.id}/tier-upgrade-request`);

        if (response.ok) {
          const data = await response.json();
          // Only set request if it's pending (don't show old approved/rejected requests)
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

// NEW CODE:
  useEffect(() => {
    const fetchUpgradeRequest = async () => {
      if (!vendor?.id) return;

      try {
        setIsLoadingRequest(true);
        setRequestError(null);

        const response = await fetch(`/api/portal/vendors/${vendor.id}/tier-upgrade-request`);

        if (!response.ok) {
          // Handle authentication errors
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
        // Only set request if it's pending (don't show old approved/rejected requests)
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

**Important**: Add `router` to the dependency array on the last line.

---

## Summary of Changes

### TierUpgradeRequestForm.tsx
- Added 401 error handling with redirect to `/vendor/login`
- Added 403 error handling with redirect to `/vendor/dashboard`
- Added 500 error handling with specific message
- Improved generic error message
- **Lines Changed**: 1-28 (error handling block)

### UpgradeRequestStatusCard.tsx
- Added proper error response parsing with `.json()`
- Added 401 error handling with redirect to `/vendor/login`
- Added 403 error handling with redirect to `/vendor/dashboard`
- Added 400 error handling for invalid request status
- Added 404 error handling for not found
- Added 500 error handling with specific message
- **Lines Changed**: 1-42 (entire handleCancel function)

### subscription/page.tsx
- Added 401 error handling with redirect to `/vendor/login`
- Added 403 error handling with redirect to `/vendor/dashboard`
- Added explicit 404 handling (no error shown)
- Added 500 error handling with specific message
- Added `router` to useEffect dependency array
- **Lines Changed**: 1-39 (entire fetchUpgradeRequest useEffect)

---

## Testing Checklist

After applying these changes, test the following scenarios:

### Create Request Scenarios
- [ ] Valid tier upgrade submits successfully (201)
- [ ] Duplicate request shows appropriate message (409)
- [ ] Validation error shows backend message (400)
- [ ] Session expired redirects to login (401)
- [ ] No permission redirects to dashboard (403)
- [ ] Server error shows message (500)

### Fetch Request Scenarios
- [ ] Pending request loads and displays (200)
- [ ] No pending request treated as empty (200 or 404)
- [ ] Session expired redirects to login (401)
- [ ] No permission redirects to dashboard (403)
- [ ] Server error shows message (500)

### Cancel Request Scenarios
- [ ] Valid cancellation succeeds (200)
- [ ] Already approved shows error (400)
- [ ] Request not found shows error (404)
- [ ] Session expired redirects to login (401)
- [ ] No permission redirects to dashboard (403)
- [ ] Server error shows message (500)

---

## API Endpoint Reference

### Create Request
```bash
POST /api/portal/vendors/{id}/tier-upgrade-request
Content-Type: application/json

{
  "requestedTier": "tier2",
  "vendorNotes": "We need this for expanded operations"
}
```

### Get Request
```bash
GET /api/portal/vendors/{id}/tier-upgrade-request
```

### Cancel Request
```bash
DELETE /api/portal/vendors/{id}/tier-upgrade-request/{requestId}
```

---

## Notes

- All changes maintain backward compatibility
- Toast notifications show before redirects (1500ms delay)
- Error messages are user-friendly and actionable
- Authentication redirects use `window.location.href` for security
- All error responses are parsed and handled properly
- Type safety is maintained throughout


# Quick Start - Apply Integration Fixes

## TL;DR

Apply these 3 code changes to complete the Tier Upgrade Request API contract integration:

---

## File 1: TierUpgradeRequestForm.tsx

**Location**: `components/dashboard/TierUpgradeRequestForm.tsx` (Lines 125-133)

**Replace this**:
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

**With this**:
```typescript
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          setTimeout(() => { window.location.href = '/vendor/login'; }, 1500);
          return;
        } else if (response.status === 403) {
          toast.error('You do not have permission to perform this action.');
          setTimeout(() => { window.location.href = '/vendor/dashboard'; }, 1500);
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

## File 2: UpgradeRequestStatusCard.tsx

**Location**: `components/dashboard/UpgradeRequestStatusCard.tsx` (Lines 86-107)

**Replace this**:
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

**With this**:
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
          setTimeout(() => { window.location.href = '/vendor/login'; }, 1500);
          return;
        } else if (response.status === 403) {
          toast.error('You do not have permission to perform this action.');
          setTimeout(() => { window.location.href = '/vendor/dashboard'; }, 1500);
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

## File 3: subscription/page.tsx

**Location**: `app/(site)/vendor/dashboard/subscription/page.tsx` (Lines 54-89)

**Replace this entire useEffect**:
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

**With this**:
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
  }, [vendor?.id, vendorLoading, router]);  // <-- ADD router TO DEPENDENCY ARRAY
```

---

## After Making Changes

Run these commands:

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start dev server to test
npm run dev
```

---

## Quick Test

1. Open browser to http://localhost:3000/vendor/dashboard/subscription
2. Test creating a tier upgrade request
3. Check error messages for all scenarios
4. Verify auth redirects work (401 → login, 403 → dashboard)

---

## What These Changes Do

| Change | Effect |
|--------|--------|
| Add 401 handling | Redirects to login when session expires |
| Add 403 handling | Redirects to dashboard on permission error |
| Add 400/404/500 handling | Shows specific error messages |
| Add router to deps | Fixes React warning, prevents stale closures |

---

## Automated Method (Optional)

Instead of manual edits, run:

```bash
cd /home/edwin/development/ptnextjs
python3 apply_integration_fixes.py
```

This applies all changes automatically.

---

## Full Documentation

For complete details, see:
- `API_CONTRACT_VALIDATION.md` - Full API contract spec
- `INTEGRATION_FIXES.md` - Step-by-step guide
- `INTEGRATION_SUMMARY.md` - Complete analysis

---

**Status**: All changes required for production-ready integration
**Time to Complete**: 10-15 minutes (manual) or 1 minute (automated)


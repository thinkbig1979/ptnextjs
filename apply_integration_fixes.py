#!/usr/bin/env python3
"""
Script to apply integration fixes to the Tier Upgrade Request system frontend components.

This script applies the API contract fixes documented in INTEGRATION_FIXES.md to ensure
proper error handling for authentication, authorization, and server errors.

Usage:
    python3 apply_integration_fixes.py
"""

import os
import sys
from pathlib import Path

def apply_tier_upgrade_request_form_fixes():
    """Apply fixes to TierUpgradeRequestForm.tsx"""
    file_path = Path("/home/edwin/development/ptnextjs/components/dashboard/TierUpgradeRequestForm.tsx")

    # Read the current file
    with open(file_path, 'r') as f:
        content = f.read()

    # Find and replace the error handling block
    old_error_block = '''      if (!response.ok) {
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
      }'''

    new_error_block = '''      if (!response.ok) {
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
      }'''

    if old_error_block in content:
        content = content.replace(old_error_block, new_error_block)
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✓ Applied fixes to {file_path}")
        return True
    else:
        print(f"✗ Could not find error block in {file_path}")
        return False


def apply_upgrade_request_status_card_fixes():
    """Apply fixes to UpgradeRequestStatusCard.tsx"""
    file_path = Path("/home/edwin/development/ptnextjs/components/dashboard/UpgradeRequestStatusCard.tsx")

    # Read the current file
    with open(file_path, 'r') as f:
        content = f.read()

    # Find and replace the handleCancel function
    old_function = '''  const handleCancel = async () => {
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
  };'''

    new_function = '''  const handleCancel = async () => {
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
  };'''

    if old_function in content:
        content = content.replace(old_function, new_function)
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✓ Applied fixes to {file_path}")
        return True
    else:
        print(f"✗ Could not find handleCancel function in {file_path}")
        return False


def apply_subscription_page_fixes():
    """Apply fixes to subscription/page.tsx"""
    file_path = Path("/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/subscription/page.tsx")

    # Read the current file
    with open(file_path, 'r') as f:
        content = f.read()

    # Fix 1: Update the useEffect hook
    old_useeffect = '''  useEffect(() => {
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
  }, [vendor?.id, vendorLoading]);'''

    new_useeffect = '''  useEffect(() => {
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
  }, [vendor?.id, vendorLoading, router]);'''

    if old_useeffect in content:
        content = content.replace(old_useeffect, new_useeffect)
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✓ Applied fixes to {file_path}")
        return True
    else:
        print(f"✗ Could not find useEffect hook in {file_path}")
        return False


def main():
    """Apply all integration fixes"""
    print("Applying integration fixes for Tier Upgrade Request System...\n")

    results = [
        apply_tier_upgrade_request_form_fixes(),
        apply_upgrade_request_status_card_fixes(),
        apply_subscription_page_fixes(),
    ]

    print(f"\nSummary: {sum(results)}/{len(results)} files fixed successfully")

    if all(results):
        print("\nAll fixes applied successfully!")
        print("Next steps:")
        print("1. Run: npm run type-check")
        print("2. Run: npm run lint")
        print("3. Test error scenarios manually")
        return 0
    else:
        print("\nSome fixes failed. Please review the INTEGRATION_FIXES.md document")
        print("and apply changes manually.")
        return 1


if __name__ == '__main__':
    sys.exit(main())

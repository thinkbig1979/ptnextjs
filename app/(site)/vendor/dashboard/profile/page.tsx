'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { VendorProfileEditor } from '@/components/vendor/VendorProfileEditor';

/**
 * VendorProfilePage Component
 *
 * Profile editing page for authenticated vendors.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - Renders VendorProfileEditor component
 * - Loading state during authentication check
 */
export default function VendorProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  /**
   * Route Guard: Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/vendor/login');
    }

    // Also check if user is a vendor (not admin)
    if (!isLoading && isAuthenticated && role !== 'vendor') {
      router.push('/vendor/dashboard');
    }
  }, [isAuthenticated, isLoading, role, router]);

  /**
   * Show loading state while checking authentication
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Don't render if not authenticated (redirect will happen via useEffect)
   */
  if (!isAuthenticated || role !== 'vendor') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your company information and profile details.
        </p>
      </header>

      {/* Profile Editor */}
      <VendorProfileEditor />
    </div>
  );
}

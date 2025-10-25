'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { ProfileEditTabs } from '../components/ProfileEditTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * VendorProfilePage Component
 *
 * Profile editing page for authenticated vendors.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - Renders ProfileEditTabs with tier-based access control
 * - Integrates with VendorDashboardContext for state management
 * - Loading state during authentication and data fetch
 */
export default function VendorProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const { vendor, isLoading: vendorLoading, error, saveVendor } = useVendorDashboard();

  /**
   * Route Guard: Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/vendor/login');
    }

    // Also check if user is a vendor (not admin)
    if (!authLoading && isAuthenticated && role !== 'vendor') {
      router.push('/vendor/dashboard');
    }
  }, [isAuthenticated, authLoading, role, router]);

  /**
   * Show loading state while checking authentication or loading vendor data
   */
  if (authLoading || vendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  /**
   * Show error state if vendor data failed to load
   */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message || 'An error occurred while loading your profile.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Don't render if not authenticated (redirect will happen via useEffect)
   */
  if (!isAuthenticated || role !== 'vendor' || !vendor) {
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

      {/* Profile Edit Tabs */}
      <ProfileEditTabs vendor={vendor} onSave={saveVendor} />
    </div>
  );
}

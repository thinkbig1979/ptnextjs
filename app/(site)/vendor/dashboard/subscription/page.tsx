'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionTierBadge } from '@/components/shared/SubscriptionTierBadge';
import { TierComparisonTable } from '@/components/TierComparisonTable';
import { TierUpgradeRequestForm } from '@/components/dashboard/TierUpgradeRequestForm';
import { UpgradeRequestStatusCard } from '@/components/dashboard/UpgradeRequestStatusCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { TierUpgradeRequest } from '@/lib/types';

/**
 * SubscriptionPage Component
 *
 * Central hub for vendors to view tier comparison, submit upgrade requests,
 * and track request status.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - Displays current subscription tier
 * - Shows tier comparison table
 * - Displays pending upgrade request status or upgrade request form
 * - Auto-refresh on successful request submission
 * - Loading and error states
 */
export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, role, user } = useAuth();
  const { vendor, isLoading: vendorLoading, error } = useVendorDashboard();
  const [upgradeRequest, setUpgradeRequest] = useState<TierUpgradeRequest | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

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
   * Fetch pending upgrade request for vendor
   */
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
            // 404 means no pending request, which is fine
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

  /**
   * Handle successful request submission - refresh data
   */
  const handleRequestSuccess = async () => {
    // Refresh the upgrade request
    if (vendor?.id) {
      try {
        const response = await fetch(`/api/portal/vendors/${vendor.id}/tier-upgrade-request`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.status === 'pending') {
            setUpgradeRequest(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to refresh upgrade request:', err);
      }
    }
  };

  /**
   * Handle request cancellation - clear request
   */
  const handleRequestCancel = async () => {
    setUpgradeRequest(null);
  };

  /**
   * Show loading state while checking authentication or loading vendor data
   */
  if (authLoading || vendorLoading || isLoadingRequest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading subscription information...</p>
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
                Failed to Load Subscription
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message || 'An error occurred while loading your subscription information.'}
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
          Subscription & Tier Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription tier and unlock additional features
        </p>
      </header>

      {/* Current Tier Display */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            Your current subscription level and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <SubscriptionTierBadge tier={vendor.tier as 'free' | 'tier1' | 'tier2'} size="lg" />
            <div>
              <p className="text-sm text-muted-foreground">
                You are currently on the <span className="font-medium text-foreground">{vendor.tier}</span> tier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Comparison Table */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Feature Comparison
        </h2>
        <TierComparisonTable currentTier={vendor.tier} />
      </div>

      {/* Upgrade Request Form or Status */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {upgradeRequest ? 'Upgrade Request Status' : 'Request Tier Upgrade'}
        </h2>
        {upgradeRequest ? (
          <UpgradeRequestStatusCard
            request={upgradeRequest}
            vendorId={vendor.id}
            onCancel={handleRequestCancel}
            showActions={true}
          />
        ) : (
          <TierUpgradeRequestForm
            currentTier={vendor.tier as 'free' | 'tier1' | 'tier2' | 'tier3'}
            vendorId={vendor.id}
            onSuccess={handleRequestSuccess}
          />
        )}
      </div>

      {/* Request Error */}
      {requestError && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="h-5 w-5" />
              <p>{requestError}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionTierBadge } from '@/components/shared/SubscriptionTierBadge';
import { TierComparisonTable } from '@/components/TierComparisonTable';
import { TierUpgradeRequestForm } from '@/components/dashboard/TierUpgradeRequestForm';
import { TierDowngradeRequestForm } from '@/components/dashboard/TierDowngradeRequestForm';
import { UpgradeRequestStatusCard } from '@/components/dashboard/UpgradeRequestStatusCard';
import { Loader2, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { TierUpgradeRequest } from '@/lib/types';

// Interface for downgrade request (mirrors upgrade request structure)
interface TierDowngradeRequest {
  id: string;
  vendor: string;
  user: string;
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  requestedTier: 'free' | 'tier1' | 'tier2';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  vendorNotes?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * SubscriptionPage Component
 *
 * Central hub for vendors to view tier comparison, submit upgrade/downgrade requests,
 * and track request status.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - Displays current subscription tier
 * - Shows tier comparison table
 * - Tabbed interface for upgrade and downgrade requests
 * - Displays pending request status or request forms
 * - Auto-refresh on successful request submission
 * - Loading and error states
 */
export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, role, user } = useAuth();
  const { vendor, isLoading: vendorLoading, error } = useVendorDashboard();
  const [upgradeRequest, setUpgradeRequest] = useState<TierUpgradeRequest | null>(null);
  const [downgradeRequest, setDowngradeRequest] = useState<TierDowngradeRequest | null>(null);
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
   * Fetch pending upgrade and downgrade requests for vendor
   */
  useEffect(() => {
    const fetchRequests = async () => {
      if (!vendor?.id) return;

      try {
        setIsLoadingRequest(true);
        setRequestError(null);

        // Fetch upgrade request
        const upgradeResponse = await fetch(`/api/portal/vendors/${vendor.id}/tier-upgrade-request`);

        if (upgradeResponse.ok) {
          const upgradeData = await upgradeResponse.json();
          if (upgradeData.success && upgradeData.data?.status === 'pending') {
            setUpgradeRequest(upgradeData.data);
          } else {
            setUpgradeRequest(null);
          }
        } else if (upgradeResponse.status === 401) {
          router.push('/vendor/login');
          return;
        } else if (upgradeResponse.status === 403) {
          router.push('/vendor/dashboard');
          return;
        } else if (upgradeResponse.status !== 404) {
          // 404 is fine (no request), other errors should be logged
          console.error('Failed to fetch upgrade request:', upgradeResponse.status);
        }

        // Fetch downgrade request
        const downgradeResponse = await fetch(`/api/portal/vendors/${vendor.id}/tier-downgrade-request`);

        if (downgradeResponse.ok) {
          const downgradeData = await downgradeResponse.json();
          if (downgradeData.success && downgradeData.data?.status === 'pending') {
            setDowngradeRequest(downgradeData.data);
          } else {
            setDowngradeRequest(null);
          }
        } else if (downgradeResponse.status === 401) {
          router.push('/vendor/login');
          return;
        } else if (downgradeResponse.status === 403) {
          router.push('/vendor/dashboard');
          return;
        } else if (downgradeResponse.status !== 404) {
          // 404 is fine (no request), other errors should be logged
          console.error('Failed to fetch downgrade request:', downgradeResponse.status);
        }
      } catch (err) {
        console.error('Failed to fetch tier requests:', err);
        setRequestError('Failed to load tier requests');
      } finally {
        setIsLoadingRequest(false);
      }
    };

    if (vendor?.id && !vendorLoading) {
      fetchRequests();
    }
  }, [vendor?.id, vendorLoading, router]);

  /**
   * Handle successful upgrade request submission - refresh data
   */
  const handleUpgradeSuccess = async () => {
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
   * Handle successful downgrade request submission - refresh data
   */
  const handleDowngradeSuccess = async () => {
    if (vendor?.id) {
      try {
        const response = await fetch(`/api/portal/vendors/${vendor.id}/tier-downgrade-request`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.status === 'pending') {
            setDowngradeRequest(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to refresh downgrade request:', err);
      }
    }
  };

  /**
   * Handle upgrade request cancellation - clear request
   */
  const handleUpgradeCancel = async () => {
    setUpgradeRequest(null);
  };

  /**
   * Handle downgrade request cancellation - clear request
   */
  const handleDowngradeCancel = async () => {
    setDowngradeRequest(null);
  };

  /**
   * Show loading state while checking authentication or loading vendor data
   */
  if (authLoading || vendorLoading || isLoadingRequest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-accent dark:text-accent mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground dark:text-muted-foreground">Loading subscription information...</p>
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
              <h2 className="text-xl font-semibold text-foreground dark:text-white mb-2">
                Failed to Load Subscription
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground mb-4">
                {error.message || 'An error occurred while loading your subscription information.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-accent dark:text-accent hover:underline"
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

  // Determine if upgrade/downgrade options should be shown
  const canUpgrade = vendor.tier !== 'tier3';
  const canDowngrade = vendor.tier !== 'free';
  const showTabs = canUpgrade && canDowngrade;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">
          Subscription & Tier Management
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground">
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
            <SubscriptionTierBadge tier={vendor.tier as 'free' | 'tier1' | 'tier2'} className="text-lg px-4 py-2" />
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
        <h2 className="text-2xl font-semibold text-foreground dark:text-white mb-4">
          Feature Comparison
        </h2>
        <TierComparisonTable currentTier={vendor.tier} />
      </div>

      {/* Tier Change Requests */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground dark:text-white mb-4">
          Tier Change Requests
        </h2>

        {showTabs ? (
          <Tabs defaultValue="upgrade" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="upgrade" className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                Upgrade
              </TabsTrigger>
              <TabsTrigger value="downgrade" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Downgrade
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upgrade" className="mt-4">
              {upgradeRequest ? (
                <UpgradeRequestStatusCard
                  request={upgradeRequest}
                  vendorId={vendor.id}
                  onCancel={handleUpgradeCancel}
                  showActions={true}
                />
              ) : (
                <TierUpgradeRequestForm
                  currentTier={vendor.tier as 'free' | 'tier1' | 'tier2' | 'tier3'}
                  vendorId={vendor.id}
                  onSuccess={handleUpgradeSuccess}
                />
              )}
            </TabsContent>

            <TabsContent value="downgrade" className="mt-4">
              {downgradeRequest ? (
                <UpgradeRequestStatusCard
                  request={downgradeRequest as any}
                  vendorId={vendor.id}
                  onCancel={handleDowngradeCancel}
                  showActions={true}
                />
              ) : (
                <TierDowngradeRequestForm
                  currentTier={vendor.tier as 'free' | 'tier1' | 'tier2' | 'tier3'}
                  vendorId={vendor.id}
                  onSuccess={handleDowngradeSuccess}
                />
              )}
            </TabsContent>
          </Tabs>
        ) : canUpgrade ? (
          // Only show upgrade if not on tier3
          <>
            {upgradeRequest ? (
              <UpgradeRequestStatusCard
                request={upgradeRequest}
                vendorId={vendor.id}
                onCancel={handleUpgradeCancel}
                showActions={true}
              />
            ) : (
              <TierUpgradeRequestForm
                currentTier={vendor.tier as 'free' | 'tier1' | 'tier2' | 'tier3'}
                vendorId={vendor.id}
                onSuccess={handleUpgradeSuccess}
              />
            )}
          </>
        ) : canDowngrade ? (
          // Only show downgrade if not on free
          <>
            {downgradeRequest ? (
              <UpgradeRequestStatusCard
                request={downgradeRequest as any}
                vendorId={vendor.id}
                onCancel={handleDowngradeCancel}
                showActions={true}
              />
            ) : (
              <TierDowngradeRequestForm
                currentTier={vendor.tier as 'free' | 'tier1' | 'tier2' | 'tier3'}
                vendorId={vendor.id}
                onSuccess={handleDowngradeSuccess}
              />
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No tier changes available at this time.
              </p>
            </CardContent>
          </Card>
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

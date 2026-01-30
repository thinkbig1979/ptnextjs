'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { VendorDashboardProvider } from '@/lib/context/VendorDashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { TierBadge } from '@/components/vendors/TierBadge';
import { Tier } from '@/lib/services/TierService';
import {
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { SubmitProfileCard } from '@/components/dashboard/SubmitProfileCard';
import { HelpTooltip } from '@/components/help';

/**
 * VendorDashboard Component
 *
 * Main dashboard page for authenticated vendors with profile status,
 * tier information, quick actions, and navigation.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - VendorDashboardProvider integration for state management
 * - DashboardHeader with breadcrumbs and action buttons
 * - Full-width single panel layout
 * - Loading and error states
 * - Displays vendor information and tier
 * - Shows profile completion status and approval status
 * - Quick action buttons integrated inline
 * - Responsive layout
 */
export default function VendorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, tier, status } = useAuth();

  /**
   * Route Guard: Redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/vendor/login');
    }
  }, [isAuthenticated, isLoading, router]);

  /**
   * Show loading state while checking authentication
   */
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  /**
   * Don't render if not authenticated (redirect will happen via useEffect)
   */
  if (!isAuthenticated || !user) {
    return null;
  }

  // Get vendor ID from user (vendors use their user ID)
  const vendorId = user.role === 'vendor' ? user.id : undefined;

  /**
   * Get real approval status from user authentication context
   */
  const approvalStatus = status || 'pending';

  /**
   * Mock profile completion (in real app, calculate from user profile data)
   */
  const profileCompletion = 75;

  // Render dashboard content wrapped with VendorDashboardProvider
  return (
    <VendorDashboardProvider vendorId={vendorId}>
      <DashboardContent
        user={user}
        tier={tier}
        approvalStatus={approvalStatus}
        profileCompletion={profileCompletion}
        router={router}
      />
    </VendorDashboardProvider>
  );
}

/**
 * DashboardContent Component
 *
 * Inner component that has access to VendorDashboardContext
 */
function DashboardContent({
  user,
  tier,
  approvalStatus,
  profileCompletion,
  router,
}: {
  user: any;
  tier: any;
  approvalStatus: string;
  profileCompletion: number;
  router: any;
}) {
  const normalizedTier = (tier as Tier) || 'free';
  const isMaxTier = normalizedTier === 'tier3';

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user.email.split('@')[0]}
        </h1>
      </header>

      {/* Pending Approval Banner */}
      {approvalStatus === 'pending' && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your account is <strong>pending approval</strong>. You&apos;ll receive an email once an
                admin reviews your application.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Profile Card - Only shown for approved vendors who haven't submitted */}
      {approvalStatus === 'approved' && <SubmitProfileCard />}

      {/* Two Column Layout for Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Profile Status Card */}
            <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg">
              <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Profile Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3 pb-4">
                {/* Profile Completion */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      Completion
                      <HelpTooltip
                        content="Complete your company details, add a logo, description, contact info, and business locations to reach 100%."
                        iconSize={12}
                        side="right"
                      />
                    </span>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                      role="progressbar"
                      aria-valuenow={profileCompletion}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Profile completion: ${profileCompletion} percent`}
                    />
                  </div>
                </div>

                {/* Approval Status */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      Status
                      <HelpTooltip
                        content="Pending: Under review. Approved: Profile is live. Rejected: Contact support."
                        iconSize={12}
                        side="right"
                      />
                    </span>
                    {approvalStatus === 'approved' ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Approved
                      </span>
                    ) : approvalStatus === 'pending' ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                        Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Tier Card */}
            <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg">
              <CardHeader className="py-3 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-md">
                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">Subscription</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3 pb-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    Current Plan
                    <HelpTooltip
                      content="Higher tiers unlock more locations, products, and premium features."
                      iconSize={12}
                      side="right"
                    />
                  </span>
                  <TierBadge tier={normalizedTier} size="md" />
                </div>

                {!isMaxTier ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/vendor/dashboard/subscription')}
                  >
                    View Options
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-md">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All premium features unlocked
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </div>
  );
}

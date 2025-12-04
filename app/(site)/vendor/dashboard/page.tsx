'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { VendorDashboardProvider } from '@/lib/context/VendorDashboardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { TierBadge } from '@/components/vendors/TierBadge';
import { Tier } from '@/lib/services/TierService';
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Mail,
  HelpCircle,
  Bell,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { SubmitProfileCard } from '@/components/dashboard/SubmitProfileCard';

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
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <DashboardHeader
        vendorSlug={user.slug}
        title="Vendor Dashboard"
        showActions={true}
      />

      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Header */}
          <header>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user.email.split('@')[0]}
            </h1>
            <p className="text-muted-foreground">
              Manage your vendor profile, products, and account settings.
            </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Status Card - Enhanced Design */}
            <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Profile Status</CardTitle>
                    <CardDescription>Your account information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Profile Completion with Prominent Progress */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Profile Completion</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${profileCompletion}%` }}
                      role="progressbar"
                      aria-valuenow={profileCompletion}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Profile completion: ${profileCompletion} percent`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {100 - profileCompletion}% remaining to complete your profile
                  </p>
                </div>

                {/* Approval Status with Styled Indicator */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Approval Status</span>
                    {approvalStatus === 'approved' ? (
                      <span className="flex items-center gap-2 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Approved
                      </span>
                    ) : approvalStatus === 'pending' ? (
                      <span className="flex items-center gap-2 text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        Pending Review
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Tier Card */}
            <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Subscription Tier</CardTitle>
                    <CardDescription>Your current plan and features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <TierBadge tier={normalizedTier} size="lg" />
                </div>

                <p className="text-sm text-muted-foreground">
                  Your subscription tier determines which features and tools you have access to.
                </p>

                {!isMaxTier ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Upgrade to unlock more features and grow your business.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/vendor/dashboard/subscription')}
                    >
                      View Subscription Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      You have access to all premium features!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Card - Full Width with Interactive Steps */}
          <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Complete these steps to make the most of your vendor account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Complete Profile */}
                <button
                  onClick={() => router.push('/vendor/dashboard/profile')}
                  className="group p-4 rounded-lg border border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-200 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mb-3">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Complete your profile</p>
                  <p className="text-sm text-muted-foreground">
                    Add company information, logo, and contact details
                  </p>
                </button>

                {/* Step 2: Add Products (Tier 2+) */}
                {normalizedTier !== 'free' && normalizedTier !== 'tier1' && (
                  <button
                    onClick={() => router.push('/vendor/dashboard/products')}
                    className="group p-4 rounded-lg border border-border bg-card hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mb-3">
                        <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="font-medium text-foreground mb-1">Add your products</p>
                    <p className="text-sm text-muted-foreground">
                      Showcase your products to potential customers
                    </p>
                  </button>
                )}

                {/* Step 3: Configure Notifications */}
                <button
                  onClick={() => router.push('/vendor/dashboard/profile')}
                  className="group p-4 rounded-lg border border-border bg-card hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all duration-200 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mb-3">
                      <Bell className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Configure notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your email preferences and alerts
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => router.push('/vendor/dashboard/profile')}
                >
                  <FileText className="mr-3 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <div className="text-left min-w-0">
                    <div className="font-medium text-sm">Edit Profile</div>
                    <div className="text-xs text-muted-foreground truncate">Update your company details</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => router.push('/contact')}
                >
                  <Mail className="mr-3 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                  <div className="text-left min-w-0">
                    <div className="font-medium text-sm">Contact Support</div>
                    <div className="text-xs text-muted-foreground truncate">Get help from our team</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => window.open('/help', '_blank')}
                >
                  <HelpCircle className="mr-3 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <div className="text-left min-w-0">
                    <div className="font-medium text-sm">Help Center</div>
                    <div className="text-xs text-muted-foreground truncate">Browse documentation</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Documentation and guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href="/docs/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <p className="font-medium text-foreground mb-1">Getting Started Guide</p>
                  <p className="text-sm text-muted-foreground">Learn the basics</p>
                </a>
                <a
                  href="/docs/features"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <p className="font-medium text-foreground mb-1">Feature Documentation</p>
                  <p className="text-sm text-muted-foreground">Explore all features</p>
                </a>
                <a
                  href="/docs/best-practices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <p className="font-medium text-foreground mb-1">Best Practices</p>
                  <p className="text-sm text-muted-foreground">Optimize your profile</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

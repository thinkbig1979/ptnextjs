#!/bin/bash

# Script to restructure the vendor dashboard by removing sidebar

DASHBOARD_FILE="/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/page.tsx"

# Create a temporary file with the restructured content
cat > /tmp/dashboard-restructured.tsx << 'EOF'
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
import { UpgradePromptCard } from '@/components/dashboard/UpgradePromptCard';
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Mail,
  HelpCircle,
} from 'lucide-react';

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
 * - Full-width single panel layout (sidebar removed)
 * - Loading and error states
 * - Displays vendor information and tier
 * - Shows profile completion status and approval status
 * - Tier-based UI (Products link only for tier2)
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
  const normalizedTier = (tier as string) || 'free';
  const isMaxTier = normalizedTier === 'tier3';

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <DashboardHeader
        vendorSlug={user.slug}
        title="Vendor Dashboard"
        showActions={true}
      />

      {/* Main Dashboard Container - Full Width Single Column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Header with Tier Badge */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome, {user.email.split('@')[0]}
              </h1>
              <p className="text-muted-foreground">
                Manage your vendor profile, products, and account settings.
              </p>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm font-medium text-foreground">Current Tier:</span>
              <TierBadge tier={normalizedTier} size="md" />
            </div>
          </header>

          {/* Pending Approval Banner */}
          {approvalStatus === 'pending' && (
            <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
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

          {/* Profile Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                Profile Status
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Profile Completion</span>
                  <span className="text-sm font-semibold text-foreground">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                    role="progressbar"
                    aria-valuenow={profileCompletion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Profile completion percentage"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approval Status</span>
                  {approvalStatus === 'approved' ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-500">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Approved
                    </span>
                  ) : approvalStatus === 'pending' ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-500">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-500">
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Card */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete these steps to make the most of your vendor account</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">Complete your profile</p>
                    <p className="text-sm text-muted-foreground">
                      Add company information, logo, and contact details
                    </p>
                  </div>
                </li>
                {tier === 'tier2' && (
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">Add your products</p>
                      <p className="text-sm text-muted-foreground">
                        Showcase your products to potential customers
                      </p>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">Configure notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Manage your email preferences and alerts
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Subscription Tier Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tier</CardTitle>
              <CardDescription>Your current plan level and upgrade options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Your current subscription tier determines which features and tools you have access to.
                </p>
                {!isMaxTier && (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to unlock more features and grow your business.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push('/vendor/dashboard/subscription')}
                    >
                      View Subscription Options
                    </Button>
                  </>
                )}
                {isMaxTier && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    You&apos;re on the highest tier with access to all premium features!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt Card (if not Tier 3) */}
          {!isMaxTier && (
            <UpgradePromptCard
              currentTier={normalizedTier}
              targetTier={normalizedTier === 'free' ? 'tier1' : normalizedTier === 'tier1' ? 'tier2' : 'tier3'}
              feature="Premium Features"
              variant="card"
            />
          )}

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => router.push('/vendor/dashboard/profile')}
              >
                <FileText className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-medium text-sm">Edit Profile</div>
                  <div className="text-xs text-muted-foreground">Update your company details</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => router.push('/contact')}
              >
                <Mail className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-medium text-sm">Contact Support</div>
                  <div className="text-xs text-muted-foreground">Get help from our team</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => window.open('/help', '_blank')}
              >
                <HelpCircle className="mr-3 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-medium text-sm">Help Center</div>
                  <div className="text-xs text-muted-foreground">Browse documentation</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Documentation and guides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/docs/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Getting Started Guide
              </a>
              <a
                href="/docs/features"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Feature Documentation
              </a>
              <a
                href="/docs/best-practices"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Best Practices
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
EOF

# Copy the restructured file back
cp /tmp/dashboard-restructured.tsx "$DASHBOARD_FILE"

echo "Dashboard restructured successfully!"

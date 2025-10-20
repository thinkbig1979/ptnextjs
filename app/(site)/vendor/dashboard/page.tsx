'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionTierBadge } from '@/components/shared/SubscriptionTierBadge';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Package,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * VendorDashboard Component
 *
 * Main dashboard page for authenticated vendors with profile status,
 * tier information, quick actions, and navigation.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - Displays vendor information and tier
 * - Shows profile completion status and approval status
 * - Tier-based UI (Products link only for tier2)
 * - Quick action buttons
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /**
   * Don't render if not authenticated (redirect will happen via useEffect)
   */
  if (!isAuthenticated || !user) {
    return null;
  }

  /**
   * Get real approval status from user authentication context
   */
  const approvalStatus = status || 'pending';

  /**
   * Mock profile completion (in real app, calculate from user profile data)
   */
  const profileCompletion = 75;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {user.email.split('@')[0]}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your vendor profile, products, and account settings.
        </p>
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

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-semibold text-gray-900">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approval Status</span>
                {approvalStatus === 'approved' ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Approved
                  </span>
                ) : approvalStatus === 'pending' ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    Pending
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-red-600">
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Tier</CardTitle>
            <CardDescription>Your current subscription level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Tier</span>
              {tier && <SubscriptionTierBadge tier={tier} />}
            </div>
            {tier === 'free' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  Upgrade to unlock premium features like product management.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Upgrade Options
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
            {tier === 'tier1' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  You&apos;re on Tier 1. Upgrade to Tier 2 for advanced product management.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Upgrade to Tier 2
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
            {tier === 'tier2' && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-green-600 font-medium">
                  You have access to all premium features!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/vendor/dashboard/profile')}
              aria-label="Edit Profile"
            >
              <Edit className="mr-3 h-4 w-4" aria-hidden="true" />
              Edit Profile
            </Button>
            {tier === 'tier2' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/vendor/dashboard/products')}
                aria-label="View Products"
              >
                <Package className="mr-3 h-4 w-4" aria-hidden="true" />
                View Products
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/contact')}
              aria-label="Contact Support"
            >
              <HelpCircle className="mr-3 h-4 w-4" aria-hidden="true" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Section */}
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
                <p className="font-medium text-gray-900 dark:text-white">Complete your profile</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add company information, logo, and contact details
                </p>
              </div>
            </li>
            {tier === 'tier2' && (
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Add your products</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showcase your products to potential customers
                  </p>
                </div>
              </li>
            )}
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Configure notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your email preferences and alerts
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

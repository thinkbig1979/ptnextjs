'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminTierRequestQueue from '@/components/admin/AdminTierRequestQueue';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';

/**
 * Admin Tier Request Queue Page
 *
 * Admin-only page for reviewing and approving/rejecting tier upgrade requests.
 * Features:
 * - Admin-only access (redirects non-admin to login)
 * - Displays pending tier upgrade requests in table format
 * - Approve/reject actions with confirmations
 * - Toast notifications
 * - Logout button
 * - Back to admin navigation
 *
 * Route: /admin/tier-requests/pending
 */
export default function AdminTierRequestsPage() {
  const { isAuthenticated, isLoading, role, user, logout } = useAuth();
  const router = useRouter();

  /**
   * Route guard: Redirect non-admin users to login
   */
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to admin login
        router.push('/admin/login');
      } else if (role !== 'admin') {
        // Authenticated but not admin, redirect to vendor login
        router.push('/vendor/login');
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * Loading state while checking authentication
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  /**
   * Not authenticated or not admin
   */
  if (!isAuthenticated || role !== 'admin') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-4">
            <Link
              href="/admin/vendors/pending"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Vendor Approvals
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tier Upgrade Requests</h1>
          <p className="mt-2 text-muted-foreground">
            Review and approve or reject tier upgrade requests from vendors
          </p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-muted-foreground">
              {user.email}
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <AdminTierRequestQueue />
    </div>
  );
}

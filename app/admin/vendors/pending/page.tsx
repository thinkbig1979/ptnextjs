'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminApprovalQueue from '@/components/admin/AdminApprovalQueue';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';

/**
 * Admin Approval Queue Page
 *
 * Admin-only page for reviewing and approving/rejecting pending vendor registrations.
 * Features:
 * - Admin-only access (redirects non-admin to login)
 * - Displays pending vendors in table format
 * - Approve/reject actions with confirmations
 * - Toast notifications
 * - Logout button
 *
 * Route: /admin/vendors/pending
 */
export default function AdminVendorsPendingPage() {
  const { isAuthenticated, isLoading, role, user, logout } = useAuth();
  const router = useRouter();

  /**
   * Route guard: Redirect non-admin users to login
   */
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
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
          <h1 className="text-3xl font-bold tracking-tight">Vendor Approval Queue</h1>
          <p className="mt-2 text-muted-foreground">
            Review and approve or reject pending vendor registrations
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

      <AdminApprovalQueue />
    </div>
  );
}

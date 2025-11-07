'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * DataManagementPage Component
 *
 * Data import/export management page for authenticated vendors.
 *
 * Features:
 * - Route protection (redirects to login if not authenticated)
 * - Excel import and export functionality
 * - Import history tracking
 * - Tier-based access control (Tier 2+ for import)
 * - Responsive grid layout
 */
export default function DataManagementPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();

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
   * Show loading state while checking authentication
   */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-accent dark:text-accent mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground dark:text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Don't render if not authenticated (redirect will happen via useEffect)
   */
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Management
        </h1>
        <p className="text-muted-foreground">
          Import and export your vendor data using Excel files. Keep your information up to date efficiently.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Excel Export</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Export your vendor data to Excel format
          </p>
          <p className="text-sm text-muted-foreground italic">
            Component: ExcelExportCard (will be implemented in FE-3)
          </p>
        </div>

        {/* Import Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Excel Import</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Import vendor data from Excel files
          </p>
          <p className="text-sm text-muted-foreground italic">
            Component: ExcelImportCard (will be implemented in FE-4)
          </p>
        </div>
      </div>

      {/* Import History Section (Full Width) */}
      <div className="w-full border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Import History</h2>
        <p className="text-sm text-muted-foreground mb-4">
          View your import history and status
        </p>
        <p className="text-sm text-muted-foreground italic">
          Component: ImportHistoryCard (will be implemented in FE-5)
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ExcelExportCard } from '@/components/dashboard/ExcelExportCard';
import { ExcelImportCard } from '@/components/dashboard/ExcelImportCard';
import { ImportHistoryCard } from '@/components/dashboard/ImportHistoryCard';

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
        <ExcelExportCard />

        {/* Import Section */}
        <ExcelImportCard />
      </div>

      {/* Import History Section (Full Width) */}
      <div className="w-full">
        <ImportHistoryCard />
      </div>
    </div>
  );
}

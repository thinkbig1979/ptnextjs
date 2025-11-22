'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Eye, Save, Loader2 } from 'lucide-react';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';

export interface DashboardHeaderProps {
  /**
   * Vendor slug for preview URL
   */
  vendorSlug?: string;

  /**
   * Current page title
   */
  title?: string;

  /**
   * Show action buttons (Preview, Save)
   */
  showActions?: boolean;
}

/**
 * DashboardHeader Component
 *
 * Displays breadcrumb navigation, page title, and action buttons (Preview, Save)
 * for the vendor dashboard.
 *
 * Features:
 * - Breadcrumb navigation (Home > Dashboard)
 * - Page title
 * - Preview button (opens vendor profile in new tab)
 * - Save button (saves vendor profile changes, disabled when no changes)
 */
export function DashboardHeader({
  vendorSlug,
  title = 'Dashboard',
  showActions = true,
}: DashboardHeaderProps) {
  const { isSaving, isDirty, saveVendor } = useVendorDashboard();

  const handlePreview = () => {
    if (vendorSlug) {
      window.open(`/vendors/${vendorSlug}`, '_blank');
    }
  };

  const handleSave = async () => {
    try {
      await saveVendor();
    } catch (error) {
      // Error handling done in context (toast)
      console.error('Save error:', error);
    }
  };

  return (
    <div className="border-b border-border dark:border-border bg-card dark:bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Breadcrumbs and Title */}
          <div className="space-y-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground">
              {title}
            </h1>
          </div>

          {/* Right: Action Buttons */}
          {showActions && (
            <div className="flex items-center gap-3">
              {/* Preview Button */}
              {vendorSlug && (
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="gap-2"
                  aria-label="Preview vendor profile"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Preview
                </Button>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="gap-2"
                aria-label="Save changes"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;

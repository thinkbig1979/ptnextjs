'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { HelpTooltip } from '@/components/help';

/**
 * ExcelExportCard Component
 *
 * Dashboard card component for downloading Excel templates and exporting vendor data.
 *
 * Features:
 * - Download tier-appropriate Excel import template
 * - Export current vendor data to Excel format
 * - Optional metadata inclusion in exports
 * - Loading states for async operations
 * - Error handling with toast notifications
 * - Responsive design
 *
 * API Endpoints:
 * - GET /api/portal/vendors/[id]/excel-template - Download template
 * - GET /api/portal/vendors/[id]/excel-export - Export vendor data
 */
export function ExcelExportCard() {
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [downloadingExport, setDownloadingExport] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const { vendor } = useVendorDashboard();

  /**
   * Handle downloading the Excel import template
   * Template is tier-appropriate and includes example data
   */
  const handleDownloadTemplate = async () => {
    if (!vendor) {
      toast.error('Vendor information not available', {
        description: 'Please refresh the page and try again'
      });
      return;
    }

    try {
      setDownloadingTemplate(true);
      const response = await fetch(`/api/portal/vendors/${vendor.id}/excel-template`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor_import_template_${vendor.tier}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded', {
        description: 'Your import template is ready to use'
      });
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  /**
   * Handle exporting current vendor data to Excel
   * Includes option to add metadata sheet
   */
  const handleExportData = async () => {
    if (!vendor) {
      toast.error('Vendor information not available', {
        description: 'Please refresh the page and try again'
      });
      return;
    }

    try {
      setDownloadingExport(true);
      const response = await fetch(
        `/api/portal/vendors/${vendor.id}/excel-export?metadata=${includeMetadata}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vendor.name.replace(/[^a-z0-9]/gi, '_')}_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported', {
        description: 'Your vendor data has been exported successfully'
      });
    } catch (error) {
      console.error('Data export error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setDownloadingExport(false);
    }
  };

  // Show loading state if vendor data hasn't loaded yet
  if (!vendor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Export
          </CardTitle>
          <CardDescription>
            Loading vendor information...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel Export
        </CardTitle>
        <CardDescription>
          Download templates or export your current vendor data to Excel
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Download Template Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Download Import Template</h4>
            <HelpTooltip
              title="Import Template"
              content="Download a pre-formatted Excel template that matches your subscription tier. Use this template to prepare your data for bulk import. Column headers must remain unchanged for successful import."
              side="right"
              iconSize={14}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Get a pre-formatted Excel template with your tier-appropriate fields
          </p>
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Download the template first to ensure your data matches the required format before importing.
            </p>
          </div>
          <Button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            variant="outline"
            className="w-full"
            aria-label="Download Excel template"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloadingTemplate ? 'Downloading...' : 'Download Template'}
          </Button>
        </div>

        <div className="border-t pt-4" />

        {/* Export Data Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Export Current Data</h4>
            <HelpTooltip
              title="Data Export"
              content="Download your current vendor data as an Excel file for backup, editing, or record-keeping. Includes all your profile information, products, certifications, and locations."
              side="right"
              iconSize={14}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Export your current vendor profile data to Excel
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
              aria-label="Include export metadata"
            />
            <label
              htmlFor="metadata"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Include export metadata
            </label>
            <HelpTooltip
              title="Export Metadata"
              content="Adds a separate sheet with export date, vendor information, and data summary. Useful for tracking when exports were created."
              side="top"
              iconSize={14}
            />
          </div>

          <Button
            onClick={handleExportData}
            disabled={downloadingExport}
            className="w-full"
            aria-label="Export vendor data to Excel"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloadingExport ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        Files are generated in .xlsx format (Excel 2007+)
      </CardFooter>
    </Card>
  );
}

# Task FE-3: Create ExcelExportCard Component

**Status:** 🔒 Blocked (waiting for FE-1)
**Agent:** frontend-react-specialist
**Estimated Time:** 4 hours
**Phase:** Frontend Implementation
**Dependencies:** FE-1

## Objective

Create a dashboard card component for downloading Excel templates and exporting vendor data.

## Context Requirements

- Review LocationsManagerCard pattern for dashboard card structure
- Review useTierAccess hook for tier-based UI
- Review Button and Card components from shadcn/ui

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/components/dashboard/ExcelExportCard.tsx`
- [ ] Card shows two download options: template and export
- [ ] Download template button (all tiers)
- [ ] Export data button (all tiers, includes metadata checkbox)
- [ ] Loading states during download
- [ ] Error handling and toast notifications
- [ ] Tier badge display
- [ ] Responsive design
- [ ] Accessible (ARIA labels, keyboard navigation)

## Detailed Specifications

### Component Structure

```typescript
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVendor } from '@/hooks/useVendor';

export function ExcelExportCard() {
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [downloadingExport, setDownloadingExport] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const { vendor } = useVendor();
  const { toast } = useToast();

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await fetch(`/api/portal/vendors/${vendor.id}/excel-template`);

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor_import_template_${vendor.tier}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Template downloaded',
        description: 'Your import template is ready to use'
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleExportData = async () => {
    try {
      setDownloadingExport(true);
      const response = await fetch(
        `/api/portal/vendors/${vendor.id}/excel-export?metadata=${includeMetadata}`
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vendor.name.replace(/[^a-z0-9]/gi, '_')}_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your vendor data has been exported'
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setDownloadingExport(false);
    }
  };

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
          <h4 className="text-sm font-medium">Download Import Template</h4>
          <p className="text-sm text-muted-foreground">
            Get a pre-formatted Excel template with your tier-appropriate fields
          </p>
          <Button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloadingTemplate ? 'Downloading...' : 'Download Template'}
          </Button>
        </div>

        <div className="border-t pt-4" />

        {/* Export Data Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Export Current Data</h4>
          <p className="text-sm text-muted-foreground">
            Export your current vendor profile data to Excel
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
            />
            <label
              htmlFor="metadata"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include export metadata
            </label>
          </div>

          <Button
            onClick={handleExportData}
            disabled={downloadingExport}
            className="w-full"
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
```

## Testing Requirements

### Unit Tests

```typescript
describe('ExcelExportCard', () => {
  it('should render download template button');
  it('should render export data button');
  it('should handle template download');
  it('should handle data export');
  it('should show loading states');
  it('should handle errors with toast');
  it('should trigger file downloads');
});
```

## Evidence Requirements

- [ ] Component file created
- [ ] Component renders correctly (screenshot)
- [ ] Template download works
- [ ] Data export works
- [ ] Loading states work
- [ ] Error handling works (toast notification)
- [ ] Unit tests passing

## Success Metrics

- Downloads trigger correctly
- Error handling is user-friendly
- Loading states are clear
- UI matches dashboard design

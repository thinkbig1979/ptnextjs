# Task FE-1: Create Data Management Dashboard Page

**Status:** 📋 Ready
**Agent:** frontend-react-specialist
**Estimated Time:** 3 hours
**Phase:** Frontend Implementation
**Dependencies:** PRE-2

## Objective

Create the main data management page that hosts Excel import/export functionality in the vendor dashboard.

## Context Requirements

- Review existing dashboard page structure: /app/(site)/vendor/dashboard/page.tsx
- Review dashboard layout patterns (card-based, responsive grid)
- Review navigation patterns in VendorNavigation component

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/data-management/page.tsx`
- [ ] Page layout matches existing dashboard style
- [ ] Responsive grid layout for cards
- [ ] Page title and description
- [ ] Protected route (requires authentication)
- [ ] Breadcrumb navigation
- [ ] Loading states
- [ ] Error boundaries

## Detailed Specifications

### Page Structure

```typescript
// /home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/data-management/page.tsx

import { Metadata } from 'next';
import { ExcelExportCard } from '@/components/dashboard/ExcelExportCard';
import { ExcelImportCard } from '@/components/dashboard/ExcelImportCard';
import { ImportHistoryCard } from '@/components/dashboard/ImportHistoryCard';

export const metadata: Metadata = {
  title: 'Data Management | Vendor Dashboard',
  description: 'Import and export your vendor data using Excel files'
};

export default function DataManagementPage() {
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
```

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Data Management                         │
│ Import and export your vendor data...   │
├──────────────────┬──────────────────────┤
│                  │                      │
│ ExcelExportCard  │  ExcelImportCard    │
│                  │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
│                                         │
│       ImportHistoryCard                │
│                                         │
└─────────────────────────────────────────┘
```

### Styling Requirements

- Use existing dashboard card patterns
- Match spacing and padding from other dashboard pages
- Responsive: stack vertically on mobile
- Consistent typography with dashboard
- Use theme colors (shadcn/ui tokens)

## Testing Requirements

### Unit Tests

```typescript
// __tests__/app/data-management/page.test.tsx

describe('DataManagementPage', () => {
  it('should render page title and description');
  it('should render export card');
  it('should render import card');
  it('should render import history card');
  it('should have responsive grid layout');
});
```

## Evidence Requirements

- [ ] Page file created
- [ ] Page renders correctly in browser (screenshot)
- [ ] Responsive layout works (mobile + desktop screenshots)
- [ ] Matches dashboard styling
- [ ] Unit tests passing

## Implementation Notes

- Follow existing dashboard page patterns exactly
- Use consistent spacing and card components
- Ensure page is SSR-compatible (no client-side only code at page level)
- Add proper loading/error boundaries

## Next Steps

This page will be referenced by:
- FE-2: Navigation link addition
- FE-3: ExcelExportCard component
- FE-4: ExcelImportCard component
- FE-5: ImportHistoryCard component

## Success Metrics

- Page matches dashboard design system
- Layout is responsive and accessible
- Navigation is clear and intuitive
- Page loads quickly (<1s)

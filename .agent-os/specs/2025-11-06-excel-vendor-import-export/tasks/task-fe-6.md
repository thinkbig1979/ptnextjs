# Task FE-6: Create ExcelPreviewDialog Component

**Status:** 🔒 Blocked (waiting for FE-4)
**Agent:** frontend-react-specialist
**Estimated Time:** 5 hours
**Phase:** Frontend Implementation
**Dependencies:** FE-4

## Objective

Create a modal dialog for previewing Excel import data with validation errors and change indicators.

## Context Requirements

- Review Dialog component from shadcn/ui
- Review validation result structure from ImportValidationService
- Review scroll area patterns for long content

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/components/dashboard/ExcelPreviewDialog.tsx`
- [ ] Full-screen or large modal dialog
- [ ] Summary section (total rows, valid, errors, warnings)
- [ ] Tabs: Data Preview, Validation Errors, Changes
- [ ] Data preview table with row numbers
- [ ] Error highlighting in preview table
- [ ] ValidationErrorsTable component integration
- [ ] Changes table (field, old value, new value)
- [ ] Confirm import button (disabled if errors)
- [ ] Cancel button
- [ ] Scrollable content
- [ ] Responsive design

## Detailed Specifications

```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ValidationErrorsTable } from './ValidationErrorsTable';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExcelPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validationResult: ValidationResult;
  parseResult: ParseResult;
}

export function ExcelPreviewDialog({
  open,
  onClose,
  onConfirm,
  validationResult,
  parseResult
}: ExcelPreviewDialogProps) {
  // Implementation:
  // - Summary cards at top
  // - Tabs for different views
  // - Scrollable tables
  // - Conditional confirm button
  // Full implementation (~250 lines)
}
```

## Testing Requirements

- Test dialog open/close
- Test tabs navigation
- Test data display
- Test error highlighting
- Test confirm/cancel actions

## Evidence Requirements

- [ ] Component created
- [ ] Dialog renders correctly
- [ ] All tabs work
- [ ] Confirm/cancel work
- [ ] Tests passing

## Success Metrics

- Preview is clear and informative
- Errors are easy to identify
- Confirmation flow is intuitive

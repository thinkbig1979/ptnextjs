# Task FE-4: Create ExcelImportCard Component

**Status:** 🔒 Blocked (waiting for FE-1)
**Agent:** frontend-react-specialist
**Estimated Time:** 6 hours
**Phase:** Frontend Implementation
**Dependencies:** FE-1

## Objective

Create a dashboard card component for uploading and importing Excel files with validation preview and tier restrictions.

## Context Requirements

- Review file upload patterns in existing components
- Review useTierAccess for Tier 2+ restriction
- Review react-dropzone or native file input patterns

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/components/dashboard/ExcelImportCard.tsx`
- [ ] File upload dropzone (drag-and-drop + click)
- [ ] Tier 2+ restriction enforcement with upgrade prompt
- [ ] File validation (type, size)
- [ ] Progress indicator (upload → parse → validate → import)
- [ ] Shows validation preview dialog
- [ ] Error display for validation failures
- [ ] Confirm import button after validation passes
- [ ] Loading states throughout workflow
- [ ] Toast notifications for success/failure

## Detailed Specifications

### Component Structure

```typescript
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { useTierAccess } from '@/hooks/useTierAccess';
import { ExcelPreviewDialog } from './ExcelPreviewDialog';
import { useToast } from '@/hooks/use-toast';

type ImportPhase = 'idle' | 'uploading' | 'validating' | 'preview' | 'importing' | 'complete';

export function ExcelImportCard() {
  const [phase, setPhase] = useState<ImportPhase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState(null);
  const { hasAccess, tierLevel } = useTierAccess('excel-import');
  const { toast } = useToast();

  // Implementation:
  // 1. File selection handler
  // 2. Upload to preview API
  // 3. Show validation results
  // 4. Confirm import
  // 5. Execute import
  // 6. Show success/failure

  // Full implementation required (~300 lines)
}
```

### Workflow States

1. **Idle**: Show upload dropzone
2. **Uploading**: Show progress bar
3. **Validating**: Show "Validating data..." spinner
4. **Preview**: Open dialog with validation results
5. **Importing**: Show "Importing..." with progress
6. **Complete**: Show success message

## Testing Requirements

- Test file selection
- Test upload workflow
- Test validation display
- Test import confirmation
- Test tier restriction
- Test error handling

## Evidence Requirements

- [ ] Component created
- [ ] Upload works
- [ ] Tier restriction enforced
- [ ] Validation preview shown
- [ ] Import executes correctly
- [ ] Tests passing

## Success Metrics

- Complete workflow works end-to-end
- Error handling is robust
- UI feedback is clear at each step

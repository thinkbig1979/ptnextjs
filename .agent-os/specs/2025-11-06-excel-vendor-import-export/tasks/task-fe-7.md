# Task FE-7: Create ValidationErrorsTable Component

**Status:** 🔒 Blocked (waiting for FE-6)
**Agent:** frontend-react-specialist
**Estimated Time:** 4 hours
**Phase:** Frontend Implementation
**Dependencies:** FE-6

## Objective

Create a sortable and filterable table component for displaying validation errors.

## Context Requirements

- Review Table component from shadcn/ui
- Review validation error structure from ImportValidationService
- Review sorting and filtering patterns

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/components/dashboard/ValidationErrorsTable.tsx`
- [ ] Table columns: Row, Field, Error Type, Message, Suggestion
- [ ] Sortable by row number or field
- [ ] Filter by error type/code
- [ ] Filter by field name
- [ ] Error severity badges (error vs warning)
- [ ] Pagination for many errors
- [ ] Export errors to clipboard/CSV
- [ ] Responsive design

## Detailed Specifications

```typescript
'use client';

import { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Copy } from 'lucide-react';

interface ValidationErrorsTableProps {
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function ValidationErrorsTable({ errors, warnings }: ValidationErrorsTableProps) {
  const [sortBy, setSortBy] = useState<'row' | 'field'>('row');
  const [filterField, setFilterField] = useState('all');
  const [filterCode, setFilterCode] = useState('all');

  // Implementation:
  // - Combined errors and warnings
  // - Sorting logic
  // - Filtering logic
  // - Pagination
  // - Export functionality
  // Full implementation (~200 lines)
}
```

## Testing Requirements

- Test sorting
- Test filtering
- Test pagination
- Test export functionality

## Evidence Requirements

- [ ] Component created
- [ ] Sorting works
- [ ] Filtering works
- [ ] Export works
- [ ] Tests passing

## Success Metrics

- Errors are easy to navigate
- Filtering helps users find specific issues
- Export helps users fix errors offline

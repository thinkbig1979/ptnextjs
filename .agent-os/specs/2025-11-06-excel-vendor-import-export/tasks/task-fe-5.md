# Task FE-5: Create ImportHistoryCard Component

**Status:** 🔒 Blocked (waiting for FE-1)
**Agent:** frontend-react-specialist
**Estimated Time:** 4 hours
**Phase:** Frontend Implementation
**Dependencies:** FE-1

## Objective

Create a dashboard card displaying import history with filtering and pagination.

## Context Requirements

- Review Table component from shadcn/ui
- Review pagination patterns
- Review Badge component for status indicators

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/components/dashboard/ImportHistoryCard.tsx`
- [ ] Display import history in table format
- [ ] Columns: Date, Status, Rows Processed, Success/Failed Count, Actions
- [ ] Status badges (success, partial, failed)
- [ ] Filter by status dropdown
- [ ] Pagination controls
- [ ] View details button (shows errors/changes)
- [ ] Loading states
- [ ] Empty state message

## Detailed Specifications

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function ImportHistoryCard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch import history from API
  // Display in table with pagination
  // Full implementation required (~200 lines)
}
```

## Testing Requirements

- Test data fetching
- Test filtering
- Test pagination
- Test empty state

## Evidence Requirements

- [ ] Component created
- [ ] Table displays correctly
- [ ] Filters work
- [ ] Pagination works
- [ ] Tests passing

## Success Metrics

- History loads correctly
- Filtering is intuitive
- Pagination works smoothly

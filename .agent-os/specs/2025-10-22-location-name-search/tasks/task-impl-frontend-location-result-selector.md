# Task: impl-frontend-location-result-selector - Create LocationResultSelector Component

**Metadata:**
- **Task ID:** impl-frontend-location-result-selector
- **Phase:** Phase 3: Frontend Implementation
- **Agent:** frontend-react-specialist
- **Estimated Time:** 25-30 min
- **Dependencies:** test-frontend-ui, impl-backend-types
- **Status:** Pending
- **Priority:** High

## Description

Create LocationResultSelector component using shadcn/ui Dialog to display multiple geocoding results and allow user selection.

## Specifics

**Component Requirements:**

1. **Component Structure:**
   - Use shadcn/ui Dialog component
   - ScrollArea for result list (handles overflow)
   - MapPin icon from lucide-react for each result
   - Responsive design (mobile, tablet, desktop)

2. **Props Interface:**
   ```typescript
   interface LocationResultSelectorProps {
     results: GeocodeResult[];
     isOpen: boolean;
     onSelect: (result: GeocodeResult) => void;
     onCancel: () => void;
   }
   ```

3. **Display Format:**
   - Each result shows: "City, Region, Country"
   - If city missing, show: "Region, Country"
   - If region missing, show: "City, Country"
   - Type badge (city, town, village, etc.)
   - MapPin icon on left
   - Hover effect on result items

4. **Interaction:**
   - Click result → calls onSelect(result)
   - Click cancel button → calls onCancel()
   - Click outside dialog → calls onCancel()
   - Press Escape → calls onCancel()
   - Keyboard navigation: Arrow keys to navigate, Enter to select

5. **Styling:**
   - Use Card component for each result
   - Badge component for location type
   - Consistent spacing and padding
   - Responsive width (90% mobile, 500px desktop)
   - Max height with scroll for >5 results

6. **Accessibility:**
   - ARIA role="listbox" for results container
   - ARIA role="option" for each result
   - Proper focus management
   - Screen reader friendly labels

**Files to Create:**
- `/home/edwin/development/ptnextjs/components/location-result-selector.tsx` (NEW)

**Files to Modify:**
- None

## Acceptance Criteria

- [ ] Component renders with multiple results
- [ ] Results displayed in scrollable list
- [ ] Click result triggers onSelect callback
- [ ] Cancel button triggers onCancel callback
- [ ] Dialog closes on outside click
- [ ] Keyboard navigation works (arrow keys, Enter, Escape)
- [ ] Display formatting correct (City, Region, Country)
- [ ] MapPin icon renders for each result
- [ ] Type badge displays location type
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessibility attributes present
- [ ] All tests from test-frontend-ui pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## Testing Requirements

**Functional Testing:**
- Run component tests: `npm test -- LocationResultSelector.test.tsx`
- All tests must pass
- No console errors or warnings

**Manual Verification:**
- Test in Storybook or dev environment:
  ```tsx
  <LocationResultSelector
    isOpen={true}
    results={mockResults}
    onSelect={(result) => console.log('Selected:', result)}
    onCancel={() => console.log('Cancelled')}
  />
  ```

**Browser Testing:**
- Chrome: Component renders and functions correctly
- Firefox: Dialog and interactions work
- Safari: Styling consistent
- Mobile Safari: Touch interactions work
- Mobile Chrome: Responsive design correct

**Error Scenarios:**
- Empty results array → Show "No results found"
- Single result → (Should not use this component, but handle gracefully)
- >20 results → ScrollArea scrolls smoothly

**Evidence Required:**
- All unit tests passing
- Screenshots of component in different states:
  - With 3 results
  - With >10 results (scrolling)
  - Mobile view
  - Hover state
- Accessibility audit results (lighthouse/axe)
- Browser compatibility test results

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-backend-types.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-test-frontend-ui.md
- GeocodeResult type from lib/types.ts
- shadcn/ui Dialog component documentation

**Assumptions:**
- shadcn/ui Dialog component is installed
- shadcn/ui ScrollArea component is installed
- shadcn/ui Card component is installed
- shadcn/ui Badge component is installed
- lucide-react is available for icons

## Implementation Notes

**Component Structure:**

```tsx
'use client';

import { MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GeocodeResult } from '@/lib/types';

interface LocationResultSelectorProps {
  results: GeocodeResult[];
  isOpen: boolean;
  onSelect: (result: GeocodeResult) => void;
  onCancel: () => void;
}

export function LocationResultSelector({
  results,
  isOpen,
  onSelect,
  onCancel,
}: LocationResultSelectorProps) {
  const formatDisplayName = (result: GeocodeResult): string => {
    // Format: "City, Region, Country"
    // Handle missing fields gracefully
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Multiple locations found. Please select the one you're looking for.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div role="listbox" className="space-y-2">
            {results.map((result, index) => (
              <Card
                key={index}
                role="option"
                tabIndex={0}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelect(result)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelect(result);
                }}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{formatDisplayName(result)}</div>
                    {result.type && (
                      <Badge variant="secondary" className="mt-1">
                        {result.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Display Name Formatting Logic:**

```typescript
const formatDisplayName = (result: GeocodeResult): string => {
  const parts: string[] = [];

  // Extract location name from display_name
  // Priority: city > region > country
  if (result.display_name) {
    return result.display_name;
  }

  // Fallback: construct from available parts
  if (result.country) parts.push(result.country);
  if (result.region) parts.push(result.region);

  return parts.join(', ') || 'Unknown Location';
};
```

**Keyboard Navigation:**
- Implement arrow key navigation between results
- Enter key selects focused result
- Escape key closes dialog
- Tab key focuses cancel button

**Responsive Styling:**
```tsx
// Mobile: Full width with padding
// Tablet/Desktop: 500px max width
className="sm:max-w-[500px] w-[90vw] sm:w-full"

// Results container: Max height with scroll
className="max-h-[400px] sm:max-h-[500px]"
```

## Quality Gates

- [ ] Component follows React 19 best practices
- [ ] TypeScript strict mode compliance
- [ ] No prop-drilling (proper component composition)
- [ ] Accessible to screen readers
- [ ] Keyboard navigation fully functional
- [ ] Responsive on all screen sizes
- [ ] No hardcoded strings (use constants)
- [ ] Code reviewed and approved

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/components/location-result-selector.tsx (NEW)
- /home/edwin/development/ptnextjs/lib/types.ts (uses GeocodeResult)

**Test Files:**
- /home/edwin/development/ptnextjs/tests/unit/components/LocationResultSelector.test.tsx

**Related Tasks:**
- task-test-frontend-ui (provides test suite)
- task-impl-backend-types (provides GeocodeResult type)
- task-impl-frontend-location-search-filter (uses this component)

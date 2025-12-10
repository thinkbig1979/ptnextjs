# Task: Create ProductDeleteDialog Component

## Metadata
- **ID**: task-fe-2
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 15-20 min
- **Dependencies**: none
- **Status**: pending

## Description

Create a confirmation dialog for product deletion. The dialog warns the user about permanent deletion and provides Cancel/Delete buttons.

## Specifics

### File to Create
`components/dashboard/ProductDeleteDialog.tsx`

### Component Props

```typescript
interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}
```

### Required Elements (E2E Test Selectors)

**CRITICAL**: The confirm button must match E2E test selector:
- Test selector: `button:has-text("Delete")`
- Implementation: `<Button>Delete</Button>` in the dialog

### Component Structure

```tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function ProductDeleteDialog({
  product,
  open,
  onConfirm,
  onCancel,
  isDeleting,
}: ProductDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Product
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{product?.name}"</strong>?
            This action cannot be undone and the product will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Acceptance Criteria

- [ ] Dialog opens when `open=true`
- [ ] Shows product name in warning message
- [ ] Cancel button closes dialog
- [ ] Delete button triggers `onConfirm`
- [ ] Delete button has visible "Delete" text (for E2E test)
- [ ] Buttons disabled during deletion (isDeleting)
- [ ] Loading spinner shows during deletion
- [ ] Clicking outside closes dialog

## Testing Requirements

E2E test will:
1. Click Delete button on ProductCard
2. Look for confirm button: `button:has-text("Delete")`
3. Click confirm
4. Verify product disappears

## Related Files

- `components/ui/dialog.tsx` - Dialog components
- `components/ui/button.tsx` - Button component

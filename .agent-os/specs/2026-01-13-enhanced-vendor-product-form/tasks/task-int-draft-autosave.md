# Task: int-draft-autosave

## Metadata
- **Phase**: 3 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: int-form-assembly
- **Status**: pending

## Description

Implement automatic draft saving to localStorage with restore prompt on form mount. Prevents data loss if user accidentally closes browser.

## Specifics

### Files to Create
- `hooks/useFormDraft.ts` - Generic draft save/restore hook

### Files to Modify
- `components/dashboard/ProductForm.tsx` - Integrate draft hook

### Technical Details

**Hook Interface:**
```typescript
interface UseFormDraftOptions<T> {
  formId: string;           // Unique identifier (e.g., 'product-new' or 'product-123')
  form: UseFormReturn<T>;   // React Hook Form instance
  interval?: number;        // Auto-save interval in ms (default 30000)
  enabled?: boolean;        // Enable/disable autosave
}

interface UseFormDraftReturn {
  hasDraft: boolean;        // Whether a draft exists
  restoreDraft: () => void; // Restore draft data
  clearDraft: () => void;   // Clear saved draft
  lastSaved: Date | null;   // Timestamp of last save
}
```

**Features:**
1. Auto-save to localStorage every 30 seconds
2. Detect existing draft on mount
3. "Resume draft?" dialog with options: Restore / Discard
4. Clear draft on successful form submission
5. Handle localStorage errors gracefully (quota, private mode)
6. Show "Draft saved" indicator

**LocalStorage Key Format:**
- `product-form-draft-new` for new products
- `product-form-draft-{productId}` for editing

## Acceptance Criteria

- [ ] Draft saves to localStorage every 30 seconds
- [ ] Draft restores when form mounts (with user consent)
- [ ] "Resume draft?" dialog appears if draft exists
- [ ] Clicking "Restore" populates form with draft data
- [ ] Clicking "Discard" clears draft and uses default/existing data
- [ ] Draft clears automatically on successful submission
- [ ] Handles localStorage unavailable (private mode, quota exceeded)
- [ ] Shows "Draft saved" timestamp indicator
- [ ] Draft unique per product (new vs editing product X)

## Testing Requirements

```typescript
describe('useFormDraft', () => {
  it('saves to localStorage periodically', async () => {});
  it('loads draft on mount', () => {});
  it('clears draft on explicit call', () => {});
  it('handles corrupted localStorage gracefully', () => {});
  it('handles localStorage quota exceeded', () => {});
  it('uses correct key format', () => {});
});

describe('ProductForm draft integration', () => {
  it('shows restore dialog when draft exists', () => {});
  it('restores form values from draft', () => {});
  it('discards draft when user declines', () => {});
  it('clears draft on successful submit', () => {});
  it('shows last saved timestamp', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `components/dashboard/ProductForm.tsx` - Form structure
- `sub-specs/technical-spec.md` - Draft save requirements

### Pattern Constraints
- Use React Hook Form's getValues/reset methods
- Use Dialog component for restore prompt
- Handle SSR (localStorage only on client)

## Implementation Notes

```tsx
// hooks/useFormDraft.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseFormDraftOptions<T> {
  formId: string;
  form: UseFormReturn<T>;
  interval?: number;
  enabled?: boolean;
}

export function useFormDraft<T extends Record<string, unknown>>({
  formId,
  form,
  interval = 30000,
  enabled = true,
}: UseFormDraftOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const storageKey = `product-form-draft-${formId}`;

  // Check for existing draft on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHasDraft(true);
      }
    } catch (e) {
      console.warn('localStorage unavailable:', e);
    }
  }, [storageKey, enabled]);

  // Auto-save interval
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    const timer = setInterval(() => {
      try {
        const values = form.getValues();
        const draft = {
          values,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setLastSaved(new Date());
      } catch (e) {
        console.warn('Failed to save draft:', e);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [form, storageKey, interval, enabled]);

  const restoreDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { values } = JSON.parse(saved);
        form.reset(values);
        setHasDraft(false);
      }
    } catch (e) {
      console.warn('Failed to restore draft:', e);
    }
  }, [form, storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setLastSaved(null);
    } catch (e) {
      console.warn('Failed to clear draft:', e);
    }
  }, [storageKey]);

  return {
    hasDraft,
    restoreDraft,
    clearDraft,
    lastSaved,
  };
}

// In ProductForm.tsx
const { hasDraft, restoreDraft, clearDraft, lastSaved } = useFormDraft({
  formId: product?.id || 'new',
  form,
  enabled: true,
});

const [showDraftDialog, setShowDraftDialog] = useState(hasDraft);

// On successful submit
const onSubmit = async (data: ExtendedProductFormValues) => {
  // ... submit logic
  if (response.ok) {
    clearDraft(); // Clear draft on success
    toast.success('Product saved');
    onSuccess?.();
  }
};

// Draft restore dialog
{showDraftDialog && (
  <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Resume your draft?</AlertDialogTitle>
        <AlertDialogDescription>
          You have an unsaved draft from a previous session. Would you like to restore it?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={() => {
            clearDraft();
            setShowDraftDialog(false);
          }}
        >
          Discard Draft
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            restoreDraft();
            setShowDraftDialog(false);
          }}
        >
          Restore Draft
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}

// Last saved indicator
{lastSaved && (
  <p className="text-xs text-muted-foreground">
    Draft saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
  </p>
)}
```

## Related Files
- `components/dashboard/ProductForm.tsx` - Form integration
- `components/ui/alert-dialog.tsx` - Dialog component

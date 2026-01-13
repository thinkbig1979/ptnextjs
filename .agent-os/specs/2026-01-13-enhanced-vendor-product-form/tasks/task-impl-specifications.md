# Task: impl-specifications

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Technical Specifications section with label/value pairs using useFieldArray. Two-column layout with add/remove functionality.

## Specifics

### Files to Create
- `components/dashboard/product-form/SpecificationsSection.tsx`

### Files to Reference
- `lib/validation/product-schema.ts` - SpecificationSchema definition
- `sub-specs/ux-ui-spec.md` - Section 4 for visual design

### Technical Details

**Props:**
```typescript
interface SpecificationsSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Specification Object Shape:**
```typescript
{
  label: string;  // Required, max 100
  value: string;  // Required, max 500
}
```

**Features:**
1. Table-like layout: Label | Value | Remove
2. Add Specification button at bottom
3. Both fields required per row
4. Remove button per row (no undo needed for simple items)
5. Empty state with "Add your first specification" prompt

**Layout:**
```
┌────────────────────┬────────────────────────────┬───┐
│ Label              │ Value                      │   │
├────────────────────┼────────────────────────────┼───┤
│ [Display Size    ] │ [15" Multi-touch         ] │ 🗑 │
├────────────────────┼────────────────────────────┼───┤
│ [Weight          ] │ [5.2 kg                  ] │ 🗑 │
├────────────────────┴────────────────────────────┴───┤
│ [+ Add Specification]                               │
└─────────────────────────────────────────────────────┘
```

## Acceptance Criteria

- [ ] Can add new specification rows
- [ ] Two-column layout (label | value) with remove button
- [ ] Both fields show validation errors when empty
- [ ] Remove button deletes row immediately
- [ ] "Add Specification" button appends new empty row
- [ ] Focus moves to label field on new row creation
- [ ] Empty state shows helpful message
- [ ] Mobile: stacked layout (label above value)

## Testing Requirements

```typescript
describe('SpecificationsSection', () => {
  it('renders empty state initially', () => {});
  it('adds new specification row', () => {});
  it('validates required label', () => {});
  it('validates required value', () => {});
  it('removes specification row', () => {});
  it('focuses label on new row', () => {});
  it('handles multiple rows', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `lib/validation/product-schema.ts` - SpecificationSchema (lines 30-40)
- `sub-specs/ux-ui-spec.md` - Section 4 layout reference

### Pattern Constraints
- Use `useFieldArray` from react-hook-form
- Grid layout with responsive breakpoints
- Use FormField pattern for validation

## Implementation Notes

```tsx
const { fields, append, remove } = useFieldArray({
  control,
  name: 'specifications',
});

const handleAdd = () => {
  append({ label: '', value: '' });
  // Focus on new row's label field after render
  setTimeout(() => {
    const inputs = document.querySelectorAll('[name^="specifications"]');
    const lastLabel = inputs[inputs.length - 2] as HTMLInputElement;
    lastLabel?.focus();
  }, 0);
};

return (
  <FormSection title="Technical Specifications" tierRequired="tier2" icon={<ListChecks />}>
    {fields.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        <ListChecks className="mx-auto h-12 w-12 mb-2" />
        <p>No specifications added yet</p>
        <Button variant="outline" onClick={handleAdd} className="mt-4">
          Add your first specification
        </Button>
      </div>
    ) : (
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start">
            <FormField
              control={control}
              name={`specifications.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="md:sr-only">Label</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Display Size" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`specifications.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="md:sr-only">Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 15 inches" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label={`Remove specification ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Specification
        </Button>
      </div>
    )}
  </FormSection>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - SpecificationSchema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper

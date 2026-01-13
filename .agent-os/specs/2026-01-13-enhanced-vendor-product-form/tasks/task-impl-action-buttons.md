# Task: impl-action-buttons

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 35-45 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Action Buttons section for CTA configuration with label, button type, action type, and optional icon.

## Specifics

### Files to Create
- `components/dashboard/product-form/ActionButtonsSection.tsx`

### Files to Reference
- `payload/collections/Products.ts` - Action button field definition
- `sub-specs/technical-spec.md` - Section 7 for schema details

### Technical Details

**Props:**
```typescript
interface ActionButtonsSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**ActionButton Object Shape:**
```typescript
{
  label: string;      // Required, max 100
  type: 'primary' | 'secondary' | 'outline';
  action: 'contact' | 'quote' | 'download' | 'external_link' | 'video';
  actionData?: string; // URL for external_link/download/video
  icon?: string;       // Lucide icon name
  order?: number;
}
```

**Features:**
1. Card-based layout for each button configuration
2. Label input (required)
3. Button type dropdown (primary/secondary/outline) with preview
4. Action type dropdown (contact/quote/download/external_link/video)
5. Action data input (conditional - shown for external_link/download/video)
6. Icon selector dropdown
7. Live preview of configured button

**Conditional Logic:**
- `actionData` field visible only when action is: external_link, download, or video
- Show URL validation for actionData

## Acceptance Criteria

- [ ] Can add action buttons with label (required)
- [ ] Button type dropdown with visual preview
- [ ] Action type dropdown with contextual data field
- [ ] actionData field shows/hides based on action type
- [ ] URL validation for actionData when visible
- [ ] Icon selector with Lucide icons
- [ ] Live preview shows how button will appear
- [ ] Remove button deletes configuration
- [ ] Order auto-increments

## Testing Requirements

```typescript
describe('ActionButtonsSection', () => {
  it('adds action button with label', () => {});
  it('selects button type with preview', () => {});
  it('selects action type', () => {});
  it('shows actionData for external_link', () => {});
  it('hides actionData for contact', () => {});
  it('validates URL for actionData', () => {});
  it('selects icon', () => {});
  it('shows live button preview', () => {});
  it('removes action button', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `payload/collections/Products.ts` - actionButtons field definition
- `sub-specs/technical-spec.md` - Section 7

### Pattern Constraints
- Use `useFieldArray` for array management
- Use Select components for dropdowns
- Conditional field visibility with React state/watch
- Show live preview using actual Button component

## Implementation Notes

```tsx
const BUTTON_TYPES = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
];

const ACTION_TYPES = [
  { value: 'contact', label: 'Contact Form', needsData: false },
  { value: 'quote', label: 'Request Quote', needsData: false },
  { value: 'download', label: 'Download', needsData: true },
  { value: 'external_link', label: 'External Link', needsData: true },
  { value: 'video', label: 'Video', needsData: true },
];

const { fields, append, remove, update } = useFieldArray({
  control,
  name: 'actionButtons',
});

// Watch action type to show/hide actionData
const watchedButtons = watch('actionButtons');

return (
  <FormSection title="Action Buttons" tierRequired="tier2" icon={<MousePointerClick />}>
    <div className="space-y-4">
      {fields.map((field, index) => {
        const currentAction = watchedButtons?.[index]?.action;
        const needsActionData = ACTION_TYPES.find(a => a.value === currentAction)?.needsData;

        return (
          <Card key={field.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Button {index + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Label */}
              <FormField
                control={control}
                name={`actionButtons.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Label *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Contact Us" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type and Action Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`actionButtons.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUTTON_TYPES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`actionButtons.${index}.action`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ACTION_TYPES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Data (conditional) */}
              {needsActionData && (
                <FormField
                  control={control}
                  name={`actionButtons.${index}.actionData`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>
                        {currentAction === 'download' && 'Link to downloadable file'}
                        {currentAction === 'external_link' && 'External website URL'}
                        {currentAction === 'video' && 'Video URL (YouTube, Vimeo, etc.)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Preview */}
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground mb-2 block">Preview:</span>
                <Button
                  variant={watchedButtons?.[index]?.type || 'default'}
                  size="sm"
                  type="button"
                >
                  {watchedButtons?.[index]?.label || 'Button Preview'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ label: '', type: 'primary', action: 'contact', order: fields.length })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Action Button
      </Button>
    </div>
  </FormSection>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - ActionButtonSchema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper

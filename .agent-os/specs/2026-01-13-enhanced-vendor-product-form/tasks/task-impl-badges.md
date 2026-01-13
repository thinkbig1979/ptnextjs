# Task: impl-badges

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-35 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Quality Badges section for displaying certifications, awards, and quality indicators with label, type (style), and optional icon.

## Specifics

### Files to Create
- `components/dashboard/product-form/BadgesSection.tsx`

### Files to Reference
- `payload/collections/Products.ts` - badges field definition
- `components/ui/badge.tsx` - Badge component variants

### Technical Details

**Props:**
```typescript
interface BadgesSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Badge Object Shape:**
```typescript
{
  label: string;   // Required, max 100
  type: 'secondary' | 'outline' | 'success' | 'warning' | 'info';
  icon?: string;   // Lucide icon name
  order?: number;
}
```

**Features:**
1. Simple card/row layout for each badge
2. Label input (required)
3. Type dropdown with live preview
4. Icon selector (optional)
5. Live preview of configured badge

**Badge Type Visual Mapping:**
- `secondary` - Gray/muted badge
- `outline` - Border only, no fill
- `success` - Green badge (certifications, awards)
- `warning` - Yellow badge (limited, expiring)
- `info` - Blue badge (new, featured)

## Acceptance Criteria

- [ ] Can add badges with label (required)
- [ ] Type dropdown shows all badge variants with preview
- [ ] Icon selector allows choosing Lucide icon
- [ ] Live preview shows badge as it will appear
- [ ] Remove button deletes badge
- [ ] Multiple badges can be added
- [ ] Empty state with "Add your first badge" prompt

## Testing Requirements

```typescript
describe('BadgesSection', () => {
  it('adds badge with label', () => {});
  it('selects badge type', () => {});
  it('shows live preview with selected type', () => {});
  it('selects icon', () => {});
  it('removes badge', () => {});
  it('renders empty state', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `components/ui/badge.tsx` - Badge variants and styling
- `payload/collections/Products.ts` - badges field definition

### Pattern Constraints
- Use `useFieldArray` for array management
- Use shadcn Badge component for preview
- Match badge variant names to type values

## Implementation Notes

```tsx
const BADGE_TYPES = [
  { value: 'secondary', label: 'Default', description: 'Gray, standard badge' },
  { value: 'outline', label: 'Outline', description: 'Border only' },
  { value: 'success', label: 'Success', description: 'Green, for certifications' },
  { value: 'warning', label: 'Warning', description: 'Yellow, for notices' },
  { value: 'info', label: 'Info', description: 'Blue, for features' },
];

// Note: shadcn Badge may need variant mapping or custom variants
const badgeVariantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  secondary: 'secondary',
  outline: 'outline',
  success: 'default', // May need custom class
  warning: 'default', // May need custom class
  info: 'default',    // May need custom class
};

const { fields, append, remove } = useFieldArray({
  control,
  name: 'badges',
});

return (
  <FormSection title="Quality Badges" tierRequired="tier2" icon={<Award />}>
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Award className="mx-auto h-12 w-12 mb-2" />
          <p>No badges added yet</p>
          <p className="text-sm">Add certifications, awards, or quality indicators</p>
          <Button
            variant="outline"
            onClick={() => append({ label: '', type: 'success', order: 0 })}
            className="mt-4"
          >
            Add your first badge
          </Button>
        </div>
      ) : (
        <>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 items-end p-4 border rounded-lg"
            >
              {/* Label */}
              <FormField
                control={control}
                name={`badges.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Text *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ISO 9001 Certified" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={control}
                name={`badges.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BADGE_TYPES.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Preview */}
              <div className="flex items-center">
                <Badge
                  variant={badgeVariantMap[watch(`badges.${index}.type`) || 'secondary']}
                  className={cn(
                    watch(`badges.${index}.type`) === 'success' && 'bg-green-100 text-green-800 border-green-200',
                    watch(`badges.${index}.type`) === 'warning' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    watch(`badges.${index}.type`) === 'info' && 'bg-blue-100 text-blue-800 border-blue-200',
                  )}
                >
                  {watch(`badges.${index}.label`) || 'Preview'}
                </Badge>
              </div>

              {/* Remove */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                aria-label={`Remove badge ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ label: '', type: 'success', order: fields.length })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Badge
          </Button>
        </>
      )}
    </div>
  </FormSection>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - BadgeSchema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper
- `components/ui/badge.tsx` - Base badge component

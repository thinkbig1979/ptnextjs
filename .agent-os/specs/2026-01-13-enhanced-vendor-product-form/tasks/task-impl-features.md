# Task: impl-features

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 40-50 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the Features section with title, description, icon selection, and card-based display using useFieldArray.

## Specifics

### Files to Create
- `components/dashboard/product-form/FeaturesSection.tsx`

### Files to Reference
- `lib/validation/product-schema.ts` - FeatureSchema definition
- `sub-specs/ux-ui-spec.md` - Section 5 for visual design

### Technical Details

**Props:**
```typescript
interface FeaturesSectionProps {
  control: Control<ExtendedProductFormValues>;
  disabled?: boolean;
}
```

**Feature Object Shape:**
```typescript
{
  title: string;        // Required, max 200
  description?: string; // Optional, max 1000
  icon?: string;        // Optional, Lucide icon name
  order?: number;       // Auto-incremented
}
```

**Features:**
1. Card-based layout for each feature
2. Title field (required)
3. Description field (optional textarea)
4. Icon selector (dropdown with common Lucide icons)
5. Remove button with confirmation
6. Add Feature button

**Icon Options (subset):**
Common icons for product features:
- Star, Shield, Zap, Award, Check, Clock, Globe, Heart, Lock, Rocket, Settings, Target, ThumbsUp, TrendingUp, Wifi, Wrench

## Acceptance Criteria

- [ ] Can add features with title (required)
- [ ] Description textarea available (optional)
- [ ] Icon dropdown shows common Lucide icons with preview
- [ ] Remove button with confirmation toast
- [ ] Cards display feature info attractively
- [ ] Order number auto-increments
- [ ] Empty state shows "Add your first feature" prompt
- [ ] Mobile responsive card layout

## Testing Requirements

```typescript
describe('FeaturesSection', () => {
  it('renders empty state initially', () => {});
  it('adds feature with title', () => {});
  it('validates required title', () => {});
  it('allows optional description', () => {});
  it('selects icon from dropdown', () => {});
  it('removes feature with confirmation', () => {});
  it('auto-increments order number', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `lib/validation/product-schema.ts` - FeatureSchema (lines 40-50)
- `sub-specs/ux-ui-spec.md` - Section 5 layout reference

### Pattern Constraints
- Use `useFieldArray` from react-hook-form
- Use shadcn Card for feature items
- Use Select component for icon picker
- Use toast for remove confirmation

## Implementation Notes

```tsx
// Common Lucide icons for features
const FEATURE_ICONS = [
  { value: 'star', label: 'Star', icon: Star },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'check', label: 'Check', icon: Check },
  { value: 'clock', label: 'Clock', icon: Clock },
  { value: 'globe', label: 'Globe', icon: Globe },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'lock', label: 'Lock', icon: Lock },
  { value: 'rocket', label: 'Rocket', icon: Rocket },
  { value: 'settings', label: 'Settings', icon: Settings },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'thumbs-up', label: 'ThumbsUp', icon: ThumbsUp },
  { value: 'trending-up', label: 'TrendingUp', icon: TrendingUp },
  { value: 'wifi', label: 'Wifi', icon: Wifi },
  { value: 'wrench', label: 'Wrench', icon: Wrench },
];

const { fields, append, remove } = useFieldArray({
  control,
  name: 'features',
});

const handleAdd = () => {
  append({
    title: '',
    description: '',
    icon: '',
    order: fields.length,
  });
};

// Feature card structure
<Card key={field.id}>
  <CardHeader className="pb-2">
    <div className="flex justify-between items-start">
      <span className="text-sm text-muted-foreground">Feature {index + 1}</span>
      <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex gap-4">
      {/* Icon selector */}
      <FormField
        control={control}
        name={`features.${index}.icon`}
        render={({ field }) => (
          <FormItem className="w-24">
            <FormLabel>Icon</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {FEATURE_ICONS.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      {/* Title */}
      <FormField
        control={control}
        name={`features.${index}.title`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Title *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Real-time GPS Tracking" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    {/* Description */}
    <FormField
      control={control}
      name={`features.${index}.description`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe this feature..."
              className="resize-none"
              rows={2}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </CardContent>
</Card>
```

## Related Files
- `components/dashboard/product-form/types.ts` - FeatureSchema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper

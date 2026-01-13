# Task: impl-basic-info

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-35 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Extract basic info fields (name, description, shortDescription, slug) into a dedicated section component. Always expanded, available to all tiers.

## Specifics

### Files to Create
- `components/dashboard/product-form/BasicInfoSection.tsx`

### Files to Reference
- `components/dashboard/ProductForm.tsx` - Current implementation to extract from
- `components/dashboard/BasicInfoForm.tsx` - Pattern reference for character counters

### Technical Details

**Props:**
```typescript
interface BasicInfoSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  setValue: UseFormSetValue<ExtendedProductFormValues>;
}
```

**Fields:**
1. **name** (required)
   - Input type: text
   - Max length: 255
   - Character counter
   - Auto-generates slug on change

2. **description** (required)
   - Input type: textarea
   - No max length but recommend <2000
   - Rich text support optional (v2)

3. **shortDescription** (optional)
   - Input type: textarea
   - Max length: 500
   - Character counter
   - Helper text: "Brief summary shown in product listings"

4. **slug** (auto-generated, editable)
   - Input type: text
   - Pattern: lowercase, hyphens only
   - Auto-generates from name via slugify
   - Editable for customization

## Acceptance Criteria

- [ ] All four fields render with proper labels
- [ ] Name and description show validation errors when empty on blur
- [ ] Character counters show current/max for name (255) and shortDescription (500)
- [ ] Slug auto-generates from name (lowercase, spaces→hyphens)
- [ ] Slug field editable after auto-generation
- [ ] Section is always expanded (no collapse)
- [ ] Mobile responsive (full width on small screens)

## Testing Requirements

```typescript
describe('BasicInfoSection', () => {
  it('renders all four fields', () => {});
  it('shows required indicator on name and description', () => {});
  it('auto-generates slug from name', () => {});
  it('allows manual slug editing', () => {});
  it('shows character counter for name', () => {});
  it('shows character counter for shortDescription', () => {});
  it('displays validation errors', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `components/dashboard/ProductForm.tsx` - Lines 1-100 for current field implementation
- `components/dashboard/BasicInfoForm.tsx` - Lines 50-100 for character counter pattern

## Implementation Notes

```tsx
// Slug generation
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Auto-update slug when name changes
useEffect(() => {
  const subscription = watch((value, { name: fieldName }) => {
    if (fieldName === 'name' && value.name) {
      setValue('slug', generateSlug(value.name), { shouldValidate: false });
    }
  });
  return () => subscription.unsubscribe();
}, [watch, setValue]);

// Character counter component
const CharacterCount = ({ current, max }: { current: number; max: number }) => (
  <span className={cn(
    "text-xs",
    current > max ? "text-destructive" : "text-muted-foreground"
  )}>
    {current}/{max}
  </span>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - Form schema
- `components/dashboard/product-form/FormSection.tsx` - Section wrapper

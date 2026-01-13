# Task: impl-seo

## Metadata
- **Phase**: 2 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-30 min
- **Dependencies**: pre-1-types, pre-2-form-section
- **Status**: pending

## Description

Implement the SEO Settings section with meta title, meta description, and keywords fields. Include character counters with warnings for recommended lengths.

## Specifics

### Files to Create
- `components/dashboard/product-form/SeoSection.tsx`

### Files to Reference
- `sub-specs/ux-ui-spec.md` - Section 7 for visual design
- `sub-specs/technical-spec.md` - SeoSchema definition

### Technical Details

**Props:**
```typescript
interface SeoSectionProps {
  control: Control<ExtendedProductFormValues>;
  productName: string; // For placeholder/default hint
  disabled?: boolean;
}
```

**SEO Object Shape:**
```typescript
{
  metaTitle?: string;       // Max 100, recommended 50-60
  metaDescription?: string; // Max 300, recommended 150-160
  keywords?: string;        // Max 500, comma-separated
  ogImage?: string;         // URL, max 500 (optional, v2)
}
```

**Features:**
1. Meta title with character counter (recommended 50-60)
2. Meta description with character counter (recommended 150-160)
3. Keywords input (comma-separated)
4. Visual warning when exceeding recommended lengths
5. Helper text explaining field purpose

**Character Count UX:**
- Green: Under recommended (good)
- Yellow: At recommended limit (warning)
- Red: Over maximum (error)

## Acceptance Criteria

- [ ] Meta title input with character counter
- [ ] Meta description textarea with character counter
- [ ] Keywords input works
- [ ] Character counters show current/max
- [ ] Warning color when exceeding recommended length
- [ ] Error color when exceeding max length
- [ ] Helper text explains SEO best practices
- [ ] All fields are optional

## Testing Requirements

```typescript
describe('SeoSection', () => {
  it('renders all SEO fields', () => {});
  it('shows character count for meta title', () => {});
  it('shows character count for meta description', () => {});
  it('warns when exceeding recommended meta title length', () => {});
  it('warns when exceeding recommended meta description length', () => {});
  it('errors when exceeding max length', () => {});
  it('accepts comma-separated keywords', () => {});
});
```

## Context Requirements

### Must Read Before Implementation
- `sub-specs/ux-ui-spec.md` - Section 7 layout reference
- `sub-specs/technical-spec.md` - SeoSchema

### Pattern Constraints
- Use FormField pattern
- Use Textarea for meta description
- Custom character counter component

## Implementation Notes

```tsx
// Character counter with color states
const CharacterCounter = ({
  current,
  recommended,
  max,
}: {
  current: number;
  recommended: number;
  max: number;
}) => {
  const getColor = () => {
    if (current > max) return 'text-destructive';
    if (current > recommended) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return (
    <span className={cn('text-xs', getColor())}>
      {current}/{recommended}
      {current > recommended && ` (max: ${max})`}
    </span>
  );
};

return (
  <FormSection title="SEO Settings" tierRequired="tier2" icon={<Search />}>
    <div className="space-y-6">
      {/* Meta Title */}
      <FormField
        control={control}
        name="seo.metaTitle"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Meta Title</FormLabel>
              <CharacterCounter
                current={field.value?.length || 0}
                recommended={60}
                max={100}
              />
            </div>
            <FormControl>
              <Input
                placeholder={productName || 'Enter meta title...'}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Leave empty to use product name. Recommended: 50-60 characters.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Meta Description */}
      <FormField
        control={control}
        name="seo.metaDescription"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Meta Description</FormLabel>
              <CharacterCounter
                current={field.value?.length || 0}
                recommended={160}
                max={300}
              />
            </div>
            <FormControl>
              <Textarea
                placeholder="Describe your product for search engine results..."
                className="resize-none"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Shown in search engine results. Recommended: 150-160 characters.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Keywords */}
      <FormField
        control={control}
        name="seo.keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Keywords</FormLabel>
            <FormControl>
              <Input
                placeholder="navigation, GPS, marine electronics, superyacht"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Comma-separated keywords for search optimization.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SEO Preview (optional enhancement) */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-xs text-muted-foreground mb-2">Search Result Preview:</p>
        <div className="space-y-1">
          <p className="text-blue-600 text-lg hover:underline cursor-pointer">
            {watch('seo.metaTitle') || productName || 'Product Title'}
          </p>
          <p className="text-green-700 text-sm">
            www.example.com/products/{watch('slug') || 'product-slug'}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {watch('seo.metaDescription') || 'Your product description will appear here in search results...'}
          </p>
        </div>
      </div>
    </div>
  </FormSection>
);
```

## Related Files
- `components/dashboard/product-form/types.ts` - SeoSchema
- `components/dashboard/product-form/FormSection.tsx` - Wrapper

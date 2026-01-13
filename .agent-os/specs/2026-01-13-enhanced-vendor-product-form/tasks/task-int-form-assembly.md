# Task: int-form-assembly

## Metadata
- **Phase**: 3 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-60 min
- **Dependencies**: impl-basic-info, impl-images, impl-specifications, impl-features, impl-pricing, impl-categories-tags, impl-action-buttons, impl-badges, impl-seo
- **Status**: pending

## Description

Integrate all section components into the main ProductForm component. Replace the current 3-field form with the extended form using collapsible sections.

## Specifics

### Files to Modify
- `components/dashboard/ProductForm.tsx` - Main form component

### Files to Create
- `components/dashboard/product-form/index.ts` - Re-exports

### Files to Reference
- All section components in `components/dashboard/product-form/`
- `lib/validation/product-schema.ts` - API schema for submission

### Technical Details

**Key Changes:**
1. Replace simple schema with ExtendedProductFormSchema
2. Import and render all section components
3. Configure useForm with extended schema
4. Update form submission to include all fields
5. Map API errors to extended field paths

**Form Structure:**
```tsx
<Form>
  <BasicInfoSection {...} />        {/* Always visible */}
  <FormSection tierRequired="tier2">
    <ImagesSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <PricingSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <SpecificationsSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <FeaturesSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <CategoriesTagsSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <ActionButtonsSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <BadgesSection {...} />
  </FormSection>
  <FormSection tierRequired="tier2">
    <SeoSection {...} />
  </FormSection>
  <FormActions />
</Form>
```

**Data Transformation:**
- Filter out empty array items on submit
- Convert empty strings to undefined for optional fields
- Preserve existing data in edit mode

## Acceptance Criteria

- [ ] All sections render in correct order
- [ ] BasicInfoSection always visible
- [ ] Tier-gated sections respect vendor tier
- [ ] Form submits all data to existing API
- [ ] API validation errors map to correct fields
- [ ] Edit mode populates all existing data
- [ ] Create mode initializes with defaults
- [ ] Loading state during submission
- [ ] Success/error toasts display

## Testing Requirements

```typescript
describe('ProductForm Integration', () => {
  describe('create mode', () => {
    it('renders all sections', () => {});
    it('submits basic fields only for minimal product', () => {});
    it('submits with all extended fields', () => {});
    it('shows validation errors from API', () => {});
  });

  describe('edit mode', () => {
    it('populates form with existing product data', () => {});
    it('preserves array items on update', () => {});
    it('handles partial updates', () => {});
  });

  describe('tier gating', () => {
    it('locks sections for free tier', () => {});
    it('unlocks sections for tier2', () => {});
  });
});
```

## Context Requirements

### Must Read Before Implementation
- `components/dashboard/ProductForm.tsx` - Full current implementation
- `components/dashboard/product-form/types.ts` - Extended schema
- `lib/validation/product-schema.ts` - API schema for reference

### Pattern Constraints
- Maintain existing Sheet modal UX (or transition to full page)
- Use zodResolver with ExtendedProductFormSchema
- Preserve existing error handling pattern
- Keep API endpoint unchanged

## Implementation Notes

```tsx
// components/dashboard/product-form/index.ts
export { default as BasicInfoSection } from './BasicInfoSection';
export { default as ImagesSection } from './ImagesSection';
export { default as SpecificationsSection } from './SpecificationsSection';
export { default as FeaturesSection } from './FeaturesSection';
export { default as PricingSection } from './PricingSection';
export { default as CategoriesTagsSection } from './CategoriesTagsSection';
export { default as ActionButtonsSection } from './ActionButtonsSection';
export { default as BadgesSection } from './BadgesSection';
export { default as SeoSection } from './SeoSection';
export { default as FormSection } from './FormSection';
export * from './types';

// ProductForm.tsx updates
import {
  BasicInfoSection,
  ImagesSection,
  SpecificationsSection,
  FeaturesSection,
  PricingSection,
  CategoriesTagsSection,
  ActionButtonsSection,
  BadgesSection,
  SeoSection,
  FormSection,
  ExtendedProductFormSchema,
  type ExtendedProductFormValues,
} from './product-form';

const form = useForm<ExtendedProductFormValues>({
  resolver: zodResolver(ExtendedProductFormSchema),
  defaultValues: product ? transformProductToFormValues(product) : defaultValues,
  mode: 'onBlur',
});

// Transform product data to form values (for edit mode)
function transformProductToFormValues(product: Product): ExtendedProductFormValues {
  return {
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription || '',
    slug: product.slug || '',
    images: product.images || [],
    specifications: product.specifications || [],
    features: product.features || [],
    categories: product.categories?.map(c => typeof c === 'string' ? c : c.id) || [],
    tags: product.tags?.map(t => typeof t === 'string' ? t : t.id) || [],
    price: product.price || '',
    pricing: product.pricing || undefined,
    actionButtons: product.actionButtons || [],
    badges: product.badges || [],
    seo: product.seo || undefined,
  };
}

// Clean form data before submission
function prepareSubmitData(data: ExtendedProductFormValues) {
  return {
    ...data,
    // Filter empty array items
    images: data.images?.filter(img => img.url) || [],
    specifications: data.specifications?.filter(s => s.label && s.value) || [],
    features: data.features?.filter(f => f.title) || [],
    actionButtons: data.actionButtons?.filter(b => b.label) || [],
    badges: data.badges?.filter(b => b.label) || [],
    // Convert empty strings to undefined
    shortDescription: data.shortDescription || undefined,
    slug: data.slug || undefined,
    price: data.price || undefined,
  };
}

const onSubmit = async (data: ExtendedProductFormValues) => {
  setIsSubmitting(true);
  try {
    const cleanData = prepareSubmitData(data);
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    });

    // ... existing error handling
  } finally {
    setIsSubmitting(false);
  }
};
```

## Related Files
- All section components in `components/dashboard/product-form/`
- `hooks/useProductFormData.ts` - Categories/tags fetching
- `hooks/useTierAccess.ts` - Tier checking

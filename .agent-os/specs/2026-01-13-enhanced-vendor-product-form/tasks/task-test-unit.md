# Task: test-unit

## Metadata
- **Phase**: 4 - Validation
- **Agent**: test-architect
- **Estimated Time**: 60-90 min
- **Dependencies**: int-form-assembly
- **Status**: pending

## Description

Create comprehensive unit tests for all form section components, validation schemas, and custom hooks.

## Specifics

### Files to Create
- `__tests__/components/dashboard/product-form/FormSection.test.tsx`
- `__tests__/components/dashboard/product-form/BasicInfoSection.test.tsx`
- `__tests__/components/dashboard/product-form/ImagesSection.test.tsx`
- `__tests__/components/dashboard/product-form/SpecificationsSection.test.tsx`
- `__tests__/components/dashboard/product-form/FeaturesSection.test.tsx`
- `__tests__/components/dashboard/product-form/PricingSection.test.tsx`
- `__tests__/components/dashboard/product-form/CategoriesTagsSection.test.tsx`
- `__tests__/components/dashboard/product-form/ActionButtonsSection.test.tsx`
- `__tests__/components/dashboard/product-form/BadgesSection.test.tsx`
- `__tests__/components/dashboard/product-form/SeoSection.test.tsx`
- `__tests__/hooks/useFormDraft.test.ts`
- `__tests__/hooks/useProductFormData.test.ts`
- `__tests__/lib/validation/extended-product-schema.test.ts`

### Files to Reference
- `tests/unit/components/CategorySelect.test.tsx` - Testing patterns
- `sub-specs/testing-strategy.md` - Test specifications

### Technical Details

**Testing Framework:** Jest + React Testing Library

**Test Categories:**
1. **Component Tests:** Render, user interactions, state changes
2. **Schema Tests:** Zod validation behavior
3. **Hook Tests:** State management, side effects

**Coverage Target:** ≥80% statements, branches, functions, lines

## Acceptance Criteria

- [ ] All section components have unit tests
- [ ] Schema validation tests cover all fields
- [ ] Hook tests cover all states and edge cases
- [ ] Tests pass with `npm run test`
- [ ] Coverage meets ≥80% threshold
- [ ] No flaky tests
- [ ] Tests are independent (no shared state)

## Testing Requirements

See individual task files for component-specific test cases.

**Summary Test Cases:**

**FormSection:**
- Renders collapsed/expanded states
- Tier gating behavior
- Error count badge

**BasicInfoSection:**
- Field rendering
- Character counters
- Slug auto-generation

**ImagesSection:**
- Add/remove images
- URL validation
- Main image selection

**SpecificationsSection:**
- Add/remove specs
- Required field validation

**FeaturesSection:**
- Add/remove features
- Icon selection

**PricingSection:**
- All field rendering
- Toggle behavior

**CategoriesTagsSection:**
- API data loading
- Multi-select behavior

**ActionButtonsSection:**
- Conditional field visibility
- Button preview

**BadgesSection:**
- Badge type selection
- Live preview

**SeoSection:**
- Character counters
- Length warnings

**useFormDraft:**
- localStorage save/load
- Error handling

**useProductFormData:**
- API fetching
- Loading/error states

**ExtendedProductFormSchema:**
- Required field validation
- Array validation
- Nested object validation

## Context Requirements

### Must Read Before Implementation
- `tests/unit/components/CategorySelect.test.tsx` - Full file for patterns
- `sub-specs/testing-strategy.md` - Full testing strategy

### Pattern Constraints
- Use userEvent for interactions
- Mock fetch calls
- Mock localStorage for hook tests
- Use beforeEach to reset mocks

## Implementation Notes

```typescript
// Test setup pattern
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Wrapper for form components
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    resolver: zodResolver(ExtendedProductFormSchema),
    defaultValues: {
      name: '',
      description: '',
      // ... defaults
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

// Example component test
describe('BasicInfoSection', () => {
  const user = userEvent.setup();

  it('renders all four fields', () => {
    render(
      <FormWrapper>
        <BasicInfoSection />
      </FormWrapper>
    );

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/short description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url slug/i)).toBeInTheDocument();
  });

  it('auto-generates slug from name', async () => {
    render(
      <FormWrapper>
        <BasicInfoSection />
      </FormWrapper>
    );

    const nameInput = screen.getByLabelText(/product name/i);
    await user.type(nameInput, 'My New Product');

    const slugInput = screen.getByLabelText(/url slug/i);
    expect(slugInput).toHaveValue('my-new-product');
  });

  it('shows character counter for name', async () => {
    render(
      <FormWrapper>
        <BasicInfoSection />
      </FormWrapper>
    );

    const nameInput = screen.getByLabelText(/product name/i);
    await user.type(nameInput, 'Test');

    expect(screen.getByText('4/255')).toBeInTheDocument();
  });
});

// Schema validation test
describe('ExtendedProductFormSchema', () => {
  it('requires name', () => {
    const result = ExtendedProductFormSchema.safeParse({
      name: '',
      description: 'Test',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name']);
    }
  });

  it('validates image URL format', () => {
    const result = ExtendedProductFormSchema.safeParse({
      name: 'Test',
      description: 'Test',
      images: [{ url: 'not-a-url', altText: '' }],
    });

    expect(result.success).toBe(false);
  });
});

// Hook test
describe('useFormDraft', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('saves to localStorage periodically', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
      useFormDraft({
        formId: 'test',
        form: mockForm,
        interval: 1000,
      })
    );

    jest.advanceTimersByTime(1000);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'product-form-draft-test',
      expect.any(String)
    );

    jest.useRealTimers();
  });
});
```

## Related Files
- All section components to test
- `components/dashboard/product-form/types.ts` - Schema to test
- `hooks/useFormDraft.ts` - Hook to test
- `hooks/useProductFormData.ts` - Hook to test

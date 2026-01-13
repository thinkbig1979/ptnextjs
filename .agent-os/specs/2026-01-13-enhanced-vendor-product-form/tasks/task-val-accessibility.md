# Task: val-accessibility

## Metadata
- **Phase**: 4 - Validation
- **Agent**: quality-assurance
- **Estimated Time**: 40-50 min
- **Dependencies**: int-form-assembly
- **Status**: pending

## Description

Audit and fix accessibility issues to ensure WCAG 2.1 AA compliance. Implement keyboard navigation, screen reader support, ARIA labels, and focus management.

## Specifics

### Files to Modify
- All section components in `components/dashboard/product-form/`
- `components/dashboard/ProductForm.tsx` - Focus management

### Technical Details

**WCAG 2.1 AA Requirements:**

1. **Keyboard Navigation:**
   - All interactive elements focusable via Tab
   - Enter/Space activate buttons
   - Escape closes dropdowns
   - Arrow keys navigate within dropdown

2. **Screen Reader Support:**
   - All form fields have associated labels
   - Error messages announced via aria-live
   - Section state changes announced
   - Array operations (add/remove) announced

3. **Focus Management:**
   - Focus moves to first input when section expands
   - Focus moves to next input after array item removed
   - Focus doesn't get lost
   - Visible focus indicators on all elements

4. **ARIA Attributes:**
   - `aria-expanded` on collapsible triggers
   - `aria-controls` linking triggers to content
   - `aria-describedby` for field descriptions
   - `aria-invalid` on fields with errors
   - `aria-live="polite"` for announcements

**Testing Tools:**
- axe-core (automated)
- VoiceOver (macOS)
- NVDA (Windows)
- Keyboard-only navigation

## Acceptance Criteria

- [ ] All axe-core tests pass (no critical/serious violations)
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader announces form fields correctly
- [ ] Screen reader announces error messages
- [ ] Screen reader announces section expand/collapse
- [ ] Screen reader announces array operations
- [ ] Focus indicators visible on all interactive elements
- [ ] Focus management correct on dynamic operations
- [ ] Color contrast meets WCAG AA (4.5:1 for text)

## Testing Requirements

```typescript
describe('Accessibility', () => {
  it('has no axe-core violations', async () => {
    const { container } = render(<ProductForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('navigates form with keyboard only', () => {});
  it('announces errors to screen readers', () => {});
  it('announces section state changes', () => {});
  it('manages focus on array operations', () => {});
});
```

**Manual Testing Checklist:**
- [ ] Navigate entire form with Tab key
- [ ] Expand/collapse sections with Enter/Space
- [ ] Operate all dropdowns with keyboard
- [ ] Verify VoiceOver announces correctly
- [ ] Verify NVDA announces correctly
- [ ] Check focus indicators visibility
- [ ] Test with 200% zoom

## Context Requirements

### Must Read Before Implementation
- `sub-specs/ux-ui-spec.md` - Accessibility requirements
- `sub-specs/testing-strategy.md` - Accessibility testing section

### Pattern Constraints
- Use semantic HTML where possible
- Add ARIA only when HTML semantics insufficient
- Test with real screen readers

## Implementation Notes

```tsx
// Screen reader announcement component
const [announcement, setAnnouncement] = useState('');

<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>

// Announce array operations
const handleAddImage = () => {
  append({ url: '', altText: '', isMain: false });
  setAnnouncement('Image added. You can now enter the URL.');
};

const handleRemoveImage = (index: number) => {
  remove(index);
  setAnnouncement(`Image ${index + 1} removed.`);
};

// Focus management on section expand
const sectionContentRef = useRef<HTMLDivElement>(null);

const handleExpand = () => {
  setIsOpen(true);
  setTimeout(() => {
    const firstInput = sectionContentRef.current?.querySelector('input, textarea');
    (firstInput as HTMLElement)?.focus();
  }, 100);
};

// ARIA attributes on collapsible section
<button
  type="button"
  onClick={handleExpand}
  aria-expanded={isOpen}
  aria-controls={`section-${id}-content`}
  className="..."
>
  {title}
</button>
<div
  id={`section-${id}-content`}
  ref={sectionContentRef}
  hidden={!isOpen}
>
  {children}
</div>

// Error field ARIA
<FormField
  control={control}
  name="name"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel htmlFor="name">Product Name *</FormLabel>
      <FormControl>
        <Input
          id="name"
          aria-invalid={!!fieldState.error}
          aria-describedby={fieldState.error ? 'name-error' : undefined}
          {...field}
        />
      </FormControl>
      {fieldState.error && (
        <FormMessage id="name-error" role="alert">
          {fieldState.error.message}
        </FormMessage>
      )}
    </FormItem>
  )}
/>

// Focus management on array item removal
const handleRemove = (index: number) => {
  remove(index);

  // Focus on previous item or add button
  setTimeout(() => {
    if (fields.length > 1 && index > 0) {
      const prevInput = document.querySelector(
        `[name="specifications.${index - 1}.label"]`
      );
      (prevInput as HTMLElement)?.focus();
    } else {
      addButtonRef.current?.focus();
    }
  }, 100);
};

// Color contrast - ensure error text has sufficient contrast
// Use text-destructive which should be configured for AA compliance
<span className="text-destructive">Error message</span>

// Visible focus indicators
// Tailwind's focus-visible:ring classes provide good default
<Button className="focus-visible:ring-2 focus-visible:ring-ring">
  Submit
</Button>
```

**axe-core Integration:**

```typescript
// __tests__/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('ProductForm Accessibility', () => {
  it('BasicInfoSection has no violations', async () => {
    const { container } = render(<BasicInfoSection {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ImagesSection has no violations', async () => {
    const { container } = render(<ImagesSection {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // ... test each section
});
```

## Related Files
- All section components
- `components/ui/*.tsx` - Verify base components are accessible
- `tailwind.config.js` - Focus ring configuration

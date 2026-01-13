# Task: val-mobile-responsive

## Metadata
- **Phase**: 4 - Validation
- **Agent**: quality-assurance
- **Estimated Time**: 35-45 min
- **Dependencies**: int-form-assembly
- **Status**: pending

## Description

Ensure the enhanced product form works well on mobile devices. Apply responsive CSS, adjust layouts, and ensure touch interactions work correctly.

## Specifics

### Files to Modify
- All section components in `components/dashboard/product-form/`
- `components/dashboard/ProductForm.tsx` - Overall layout

### Technical Details

**Responsive Breakpoints:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

**Mobile Adaptations:**

1. **Layout Changes:**
   - Single column layout on mobile
   - Full-width form fields
   - Stacked label/value pairs

2. **Touch Targets:**
   - Minimum 44px height for all interactive elements
   - Adequate spacing between buttons

3. **Section Behavior:**
   - Collapsible sections work with touch
   - Easy to expand/collapse
   - No horizontal scroll

4. **Component-Specific:**
   - Images: Vertical list, tap to edit
   - Specifications: Stacked layout
   - Multi-select: Full-width dropdown or bottom sheet
   - Remove buttons: Prominent touch targets

**Testing Devices/Viewports:**
- 320px (iPhone SE)
- 375px (iPhone 12)
- 414px (iPhone 12 Pro Max)
- 768px (iPad)

## Acceptance Criteria

- [ ] Form usable at 320px viewport width
- [ ] No horizontal scrolling on any viewport
- [ ] Touch targets minimum 44px
- [ ] Labels and inputs properly aligned
- [ ] Dropdowns work with touch
- [ ] Collapsible sections easy to tap
- [ ] Form submission works on mobile
- [ ] Keyboard doesn't obscure inputs

## Testing Requirements

```typescript
describe('Mobile Responsiveness', () => {
  it('renders correctly at 320px width', () => {});
  it('has no horizontal scroll', () => {});
  it('touch targets are at least 44px', () => {});
  it('dropdowns open correctly', () => {});
  it('sections expand/collapse on tap', () => {});
});

// Playwright tests
test('mobile: form is fully functional', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // ... test interactions
});
```

## Context Requirements

### Must Read Before Implementation
- `sub-specs/ux-ui-spec.md` - Mobile adaptations section
- Existing responsive patterns in the codebase

### Pattern Constraints
- Use Tailwind responsive prefixes (sm:, md:, lg:)
- Test on actual devices if possible
- Use Chrome DevTools device simulation

## Implementation Notes

```tsx
// Responsive grid patterns
// Desktop: multi-column
// Mobile: single column
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Fields stack on mobile, side-by-side on tablet+ */}
</div>

// Full-width mobile inputs
<Input className="w-full" />

// Touch-friendly buttons
<Button className="h-11 min-h-[44px]" />

// Stacked specifications on mobile
<div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
  <FormField name="label" />
  <FormField name="value" />
  <Button>Remove</Button>
</div>

// Mobile: swipe to delete alternative (optional enhancement)
// Consider react-swipeable for mobile gestures

// Image cards on mobile
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-16 h-32 sm:h-16">
    {/* Image preview */}
  </div>
  <div className="flex-1 space-y-2">
    {/* Image details */}
  </div>
</div>

// Mobile select dropdown
// shadcn Select works on mobile but consider:
// - Full-width trigger
// - Larger touch targets in SelectItem
<Select>
  <SelectTrigger className="w-full h-11">
    <SelectValue />
  </SelectTrigger>
  <SelectContent className="max-h-[50vh]">
    <SelectItem className="py-3">
      {/* Larger touch target */}
    </SelectItem>
  </SelectContent>
</Select>

// Form actions sticky on mobile
<div className="sticky bottom-0 bg-background border-t p-4 md:relative md:border-0 md:p-0">
  <div className="flex flex-col sm:flex-row gap-2">
    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
    <Button type="submit" className="w-full sm:w-auto">Save Product</Button>
  </div>
</div>
```

**Testing Checklist:**
- [ ] Test at 320px width
- [ ] Test at 375px width
- [ ] Test at 414px width
- [ ] Test with on-screen keyboard
- [ ] Test scrolling with many sections
- [ ] Test form submission on mobile
- [ ] Test all dropdowns
- [ ] Test all buttons/icons for touch target size

## Related Files
- All section components
- `tailwind.config.js` - Breakpoint configuration

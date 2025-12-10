# Task: E2E Test Selector Alignment

## Metadata
- **ID**: task-int-2
- **Phase**: 4 - Integration
- **Agent**: quality-assurance
- **Time**: 25-30 min
- **Dependencies**: task-int-1
- **Status**: pending

## Description

Verify all UI elements match the selectors used in E2E tests. Fix any mismatches by adjusting component implementations (not test code).

## Specifics

### E2E Test File
`tests/e2e/vendor-onboarding/09-product-management.spec.ts`

### Selector Verification Matrix

| Element | Test Selector | Required Implementation |
|---------|---------------|------------------------|
| Products nav link | `button[role="tab"], a, nav a:has-text("Product")` | Existing dashboard nav |
| Product name | `text=/Test Product 1/i` | Visible text in ProductCard |
| Add button | `button:has-text("Add.*Product\|New.*Product\|Create.*Product")` | `<Button>Add New Product</Button>` |
| Edit button | `button:has-text("Edit")` | `<Button>Edit</Button>` |
| Delete button | `button:has-text("Delete\|Remove")` | `<Button>Delete</Button>` |
| Confirm delete | `button:has-text("Confirm\|Yes\|Delete")` | `<Button>Delete</Button>` in dialog |
| Name input | `input[name*="name"]` | `<Input name="name" />` |
| Description textarea | `textarea[name*="description"]` | `<Textarea name="description" />` |
| Save button | `button:has-text("Save\|Create\|Add")` | `<Button>Create Product</Button>` or `<Button>Save Changes</Button>` |
| Publish toggle | `[role="switch"][aria-label*="publish"]` | `<Switch aria-label="Publish product" />` |
| Published status | `text=/Published\|Live\|Public/i` | `<Badge>Published</Badge>` |

### Verification Steps

For each selector:

1. **Find in test code**:
   ```typescript
   // Example from test
   const editBtn = page.locator('button').filter({ hasText: /Edit/i }).first();
   ```

2. **Find in component**:
   ```tsx
   // Should exist in ProductCard.tsx
   <Button variant="outline" size="sm">
     Edit
   </Button>
   ```

3. **Run single test**:
   ```bash
   DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts:170 --debug
   ```

4. **If selector fails**:
   - Use Playwright inspector to find actual element
   - Adjust component to match expected selector
   - Re-run test

### Common Selector Issues

#### Issue: Button has icon but no text
```tsx
// ❌ Won't match: button:has-text("Delete")
<Button>
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Will match
<Button>
  <Trash2 className="h-4 w-4 mr-1" />
  Delete
</Button>

// ✅ Or use sr-only for accessibility
<Button>
  <Trash2 className="h-4 w-4" />
  <span className="sr-only">Delete</span>
</Button>
```

#### Issue: Input missing name attribute
```tsx
// ❌ Won't match: input[name*="name"]
<Input placeholder="Product name" {...field} />

// ✅ Will match (react-hook-form spreads name)
<FormField name="name" ...>
  <Input {...field} />  // field includes name="name"
</FormField>
```

#### Issue: Switch missing aria-label
```tsx
// ❌ Won't match: [role="switch"][aria-label*="publish"]
<Switch checked={published} onCheckedChange={...} />

// ✅ Will match
<Switch
  checked={published}
  onCheckedChange={...}
  aria-label="Publish product"
/>
```

### Test Execution

```bash
# Run all product management tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --reporter=list

# Run with UI for debugging
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --ui

# Run specific test by line number
DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts:55 --debug
```

## Acceptance Criteria

- [ ] All test selectors match implementation
- [ ] No changes to test file (unless fixing broken selectors)
- [ ] All elements accessible via documented selectors
- [ ] Components have correct name attributes
- [ ] Switches have aria-labels
- [ ] Buttons have visible text

## Evidence Required

Run tests and document results:
```bash
DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts --reporter=list 2>&1 | tee test-results.txt
```

## Related Files

- `tests/e2e/vendor-onboarding/09-product-management.spec.ts`
- `components/dashboard/ProductCard.tsx`
- `components/dashboard/ProductForm.tsx`
- `components/dashboard/ProductDeleteDialog.tsx`
- `components/dashboard/ProductList.tsx`

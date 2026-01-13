# Task: impl-product-list-nav

## Metadata
- **Phase**: 3 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-35 min
- **Dependencies**: impl-full-page-route
- **Status**: pending

## Description

Update ProductList.tsx and related components to navigate to the new full-page form routes. Per UX spec, keep the Sheet for quick edits (name/description only) with a "Full Editor" link to the full page.

## Specifics

### Files to Modify
- `components/dashboard/ProductList.tsx`
- `components/dashboard/ProductCard.tsx` (if edit button exists)

### Files to Reference
- `sub-specs/ux-ui-spec.md` - Navigation strategy (lines 19-22)
- `app/(site)/vendor/dashboard/products/new/page.tsx` - New product page

### Technical Details

**Navigation Changes:**

1. **"Add Product" button** → Navigate to `/dashboard/products/new`

2. **Product card "Edit" button** → Two options:
   - Option A: Direct to full editor (`/dashboard/products/[id]/edit`)
   - Option B: Open Sheet for quick edit, with "Full Editor" link inside

3. **Quick Edit Sheet** (if keeping):
   - Only show name, description, shortDescription fields
   - Add "Open Full Editor" button/link at bottom
   - Full Editor link navigates to `/dashboard/products/[id]/edit`

**Per UX Spec Decision:**
> "Keep Sheet for quick edits (name/description only)"
> "Full Editor" link from Sheet opens full page"

So we should implement Option B - Sheet for quick edit with Full Editor link.

## Acceptance Criteria

- [ ] "Add Product" button navigates to `/dashboard/products/new`
- [ ] Product edit opens quick edit Sheet (existing behavior preserved)
- [ ] Quick edit Sheet only shows basic fields (name, description, shortDescription)
- [ ] "Open Full Editor" button in Sheet navigates to `/dashboard/products/[id]/edit`
- [ ] Sheet closes when navigating to full editor
- [ ] Back from full editor returns to products list

## Testing Requirements

```typescript
describe('ProductList Navigation', () => {
  it('Add Product button navigates to new product page', async () => {
    await page.click('text=Add Product');
    await expect(page).toHaveURL('/dashboard/products/new');
  });

  it('Edit opens quick edit sheet', async () => {
    await page.click('[data-testid="product-edit-button"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  it('Full Editor link navigates to edit page', async () => {
    await page.click('[data-testid="product-edit-button"]');
    await page.click('text=Open Full Editor');
    await expect(page).toHaveURL(/\/dashboard\/products\/.*\/edit/);
  });
});
```

## Context Requirements

### Must Read Before Implementation
- `components/dashboard/ProductList.tsx` - Current implementation
- `sub-specs/ux-ui-spec.md` - Navigation strategy

## Implementation Notes

```tsx
// ProductList.tsx changes

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Change Add Product button
<Button asChild>
  <Link href="/vendor/dashboard/products/new">
    <Plus className="h-4 w-4 mr-2" />
    Add Product
  </Link>
</Button>

// In Sheet (quick edit) - add Full Editor link
<SheetFooter className="flex-col gap-2">
  <div className="flex justify-between w-full">
    <Button variant="outline" onClick={handleClose}>Cancel</Button>
    <Button onClick={handleQuickSave}>Save</Button>
  </div>
  <Separator />
  <Button variant="link" asChild className="w-full">
    <Link href={`/vendor/dashboard/products/${selectedProduct?.id}/edit`}>
      Open Full Editor
      <ExternalLink className="h-4 w-4 ml-2" />
    </Link>
  </Button>
</SheetFooter>

// ProductCard.tsx - Edit button behavior
// Option 1: Keep opening Sheet (current behavior)
<Button onClick={() => onEdit(product)}>Edit</Button>

// Option 2: Two buttons - Quick Edit and Full Edit
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => onQuickEdit(product)}>
      <Pencil className="h-4 w-4 mr-2" />
      Quick Edit
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link href={`/vendor/dashboard/products/${product.id}/edit`}>
        <ExternalLink className="h-4 w-4 mr-2" />
        Full Editor
      </Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => onDelete(product)} className="text-destructive">
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Related Files
- `components/dashboard/ProductList.tsx`
- `components/dashboard/ProductCard.tsx`
- `components/dashboard/ProductForm.tsx` - Quick edit form
- `app/(site)/vendor/dashboard/products/new/page.tsx`
- `app/(site)/vendor/dashboard/products/[id]/edit/page.tsx`

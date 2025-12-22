# Task: Enhance VendorsClient with Product Category Filter

## Metadata
- **Task ID**: enhance-vendors-client
- **Phase**: 4 - Integration
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-60 min
- **Dependencies**: impl-category-select
- **Status**: completed

## Description

Enhance the VendorsClient component to add product-based category filtering and update URL parameters to persist filter state.

## Specifics

### File to Modify
`app/(site)/components/vendors-client.tsx`

### Current State Analysis
The VendorsClient already has:
- `selectedCategory` state (line 42-44)
- `handleCategoryChange` function (line 227-232)
- Category filtering in filteredVendors (line 117-120)
- URL param handling via `updateUrlParams`

### Required Changes

1. **Add ProductCategorySelect import and state**
The current category filter is on vendor.category. Need a NEW filter for product categories.

```typescript
// Add new state for product category filtering
const [productCategory, setProductCategory] = React.useState<string | null>(
  searchParams?.get('productCategory') || null
);
```

2. **Add product category filtering logic**
```typescript
// In filteredVendors useMemo, add product category filter:
if (productCategory) {
  // Filter to vendors who have products in this category
  const vendorIdsWithCategory = new Set(
    initialProducts
      .filter(p => p.category === productCategory)
      .map(p => p.partnerId || p.vendorId)
      .filter(Boolean)
  );
  filtered = filtered.filter(vendor => vendorIdsWithCategory.has(vendor.id));
}
```

3. **Add CategorySelect to UI**
Position: In the filter area, after existing search/location

```tsx
import { CategorySelect } from "@/components/vendors/CategorySelect";

// Get product categories from products
const productCategories = React.useMemo(() => {
  const uniqueCategories = [...new Set(initialProducts.map(p => p.category))];
  return uniqueCategories.map(cat => ({ id: cat, name: cat, slug: cat }));
}, [initialProducts]);

// In JSX, add CategorySelect
<CategorySelect
  categories={productCategories}
  value={productCategory}
  onChange={handleProductCategoryChange}
  className="w-full md:w-64"
/>
```

4. **Update URL params**
```typescript
const handleProductCategoryChange = React.useCallback(
  (category: string | null) => {
    setProductCategory(category);
    // Add to updateUrlParams
  },
  [updateUrlParams]
);

// Extend updateUrlParams to handle productCategory
```

5. **Show product count per vendor when category selected**
When productCategory is selected, show badge on vendor cards with count:
```typescript
// Calculate products per vendor for the selected category
const vendorProductCounts = React.useMemo(() => {
  if (!productCategory) return {};
  return initialProducts
    .filter(p => p.category === productCategory)
    .reduce((acc, p) => {
      const vendorId = p.partnerId || p.vendorId;
      if (vendorId) {
        acc[vendorId] = (acc[vendorId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
}, [initialProducts, productCategory]);
```

### Props Update
The VendorsClientProps interface already has `initialProducts?: Product[]` so no changes needed.

## Acceptance Criteria

- [ ] CategorySelect component renders in filter area
- [ ] Product category selection filters vendors
- [ ] Only vendors with products in selected category shown
- [ ] Product count shows on vendor cards when category selected
- [ ] URL params persist `productCategory` filter
- [ ] Clear filters resets product category
- [ ] Combined with location filter works correctly
- [ ] Mobile layout stacks filters properly

## Testing Requirements

### Unit Tests
- Test product category filtering logic
- Test vendor product count calculation
- Test URL param sync

### E2E Tests (`tests/e2e/vendor-category-filter.spec.ts`)
- Test category selection
- Test combined filters (location + category)
- Test URL persistence on refresh

## Related Files
- `components/vendors/CategorySelect.tsx`
- `app/(site)/vendors/page.tsx` - May need to pass categories prop
- Technical spec: Section "Modified Components > VendorsClient"

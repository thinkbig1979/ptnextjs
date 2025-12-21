# Task: Implement useNearbyVendorsByCategory Hook

## Metadata
- **Task ID**: impl-nearby-vendors-category-hook
- **Phase**: 2 - Backend/Hooks
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-60 min
- **Dependencies**: impl-location-preference-hook
- **Status**: pending

## Description

Create a React hook that combines location filtering with product category matching for vendor discovery.

## Specifics

### File to Create
`hooks/useNearbyVendorsByCategory.ts`

### Interface Definitions
```typescript
interface UseNearbyVendorsByCategoryOptions {
  userLocation: VendorCoordinates | null;
  category: string;
  excludeVendorId?: string;
  radius?: number;           // Default: 500km
  maxResults?: number;       // Default: 10
}

interface UseNearbyVendorsByCategoryResult {
  vendors: VendorWithCategoryCount[];
  isLoading: boolean;
  error: Error | null;
}

interface VendorWithCategoryCount extends VendorWithDistance {
  productsInCategory: number;  // Count of products in specified category
}
```

### Implementation Algorithm
1. Accept vendors and products arrays (passed in, not fetched)
2. Filter products by category
3. Get unique vendor IDs from filtered products
4. Filter vendors: must be in product vendor IDs
5. Apply location filter (use existing `useLocationFilter` hook)
6. Exclude `excludeVendorId` if provided
7. Calculate `productsInCategory` count per vendor
8. Sort by distance ascending
9. Limit to `maxResults`

### Dependencies to Import
- `hooks/useLocationFilter` - existing location filtering
- `lib/types` - Vendor, Product, VendorCoordinates types

## Acceptance Criteria

- [ ] Hook exports from `hooks/useNearbyVendorsByCategory.ts`
- [ ] Filters vendors by product category correctly
- [ ] Respects radius parameter for distance filtering
- [ ] Excludes specified vendor ID
- [ ] Returns `productsInCategory` count per vendor
- [ ] Results sorted by distance (closest first)
- [ ] Limits results to maxResults
- [ ] Returns empty array when no location provided
- [ ] Handles edge cases (no vendors, no products in category)

## Testing Requirements

### Unit Tests (`hooks/__tests__/useNearbyVendorsByCategory.test.ts`)
- Test category filtering
- Test distance sorting
- Test vendor exclusion
- Test maxResults limiting
- Test productsInCategory calculation
- Test no location scenario

## Related Files
- `hooks/useLocationFilter.ts` - Base location filtering hook
- `lib/types.ts` - Type definitions
- `lib/utils/location.ts` - Distance calculation utilities

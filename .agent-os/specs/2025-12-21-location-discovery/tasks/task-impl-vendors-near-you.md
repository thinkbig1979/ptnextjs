# Task: Implement VendorsNearYou Component

## Metadata
- **Task ID**: impl-vendors-near-you
- **Phase**: 3 - Frontend Components
- **Agent**: frontend-react-specialist
- **Estimated Time**: 45-60 min
- **Dependencies**: impl-location-preference-hook, impl-nearby-vendors-category-hook, impl-nearby-vendor-card
- **Status**: completed

## Description

Create the main sidebar component for product detail pages that shows nearby vendors selling products in the same category.

## Specifics

### File to Create
`components/products/VendorsNearYou.tsx`

### Props Interface
```typescript
interface VendorsNearYouProps {
  category: string;
  currentVendorId?: string;
  maxVendors?: number;        // Default: 4
  defaultRadius?: number;     // Default: 500
  vendors: Vendor[];          // All vendors (passed from parent)
  products: Product[];        // All products (passed from parent)
  className?: string;
}
```

### Component States
1. **Loading**: Show skeleton cards (3 items)
2. **No Location**: Show "Set your location" prompt with link
3. **No Results**: Show "No vendors found within X km"
4. **Results**: Show vendor cards + "View all" link

### Component Structure (from UX spec)
```tsx
<Card className={cn("p-4", className)}>
  <CardHeader className="pb-3 px-0 pt-0">
    <CardTitle className="text-lg font-semibold flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      Vendors Near You
    </CardTitle>
  </CardHeader>

  <CardContent className="px-0 pb-0 space-y-3">
    {/* State-dependent content */}
  </CardContent>
</Card>
```

### Required Imports
- `hooks/useLocationPreference`
- `hooks/useNearbyVendorsByCategory`
- `components/products/NearbyVendorCard`
- `components/ui/card`
- `components/ui/button`
- `components/ui/skeleton`
- `lucide-react:MapPin, ArrowRight`
- `next/link`

### Data Flow
1. Read location from `useLocationPreference()`
2. If location exists, use `useNearbyVendorsByCategory()` with passed vendors/products
3. Render appropriate state

## Acceptance Criteria

- [ ] Component exports from `components/products/VendorsNearYou.tsx`
- [ ] Shows loading skeleton while data loads
- [ ] Shows "Set location" prompt when no location saved
- [ ] Shows "No vendors found" when no results within radius
- [ ] Shows max 4 vendor cards by default
- [ ] Excludes current product's vendor from results
- [ ] "View all vendors" link goes to `/vendors?category={category}`
- [ ] Uses client-side rendering ("use client" directive)
- [ ] Handles edge cases gracefully

## Testing Requirements

### Unit Tests (`components/products/__tests__/VendorsNearYou.test.tsx`)
- Test loading state
- Test no location state
- Test no results state
- Test results display
- Test vendor exclusion
- Test maxVendors prop

## Related Files
- `hooks/useLocationPreference.ts`
- `hooks/useNearbyVendorsByCategory.ts`
- `components/products/NearbyVendorCard.tsx`
- UX spec: `.agent-os/specs/2025-12-21-location-discovery/sub-specs/ux-ui-spec.md`

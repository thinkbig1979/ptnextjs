# Task: Implement NearbyVendorCard Component

## Metadata
- **Task ID**: impl-nearby-vendor-card
- **Phase**: 3 - Frontend Components
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-35 min
- **Dependencies**: None
- **Status**: pending

## Description

Create a compact vendor card component for displaying nearby vendors in the product page sidebar.

## Specifics

### File to Create
`components/products/NearbyVendorCard.tsx`

### Props Interface
```typescript
interface NearbyVendorCardProps {
  vendor: Vendor;
  distance?: number;  // kilometers
}
```

### Component Structure
```tsx
<Link
  href={`/vendors/${vendor.slug}`}
  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
>
  <div className="flex items-start justify-between gap-2">
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm truncate">{vendor.name}</h4>
      <p className="text-xs text-muted-foreground truncate">
        {vendor.location?.city}, {vendor.location?.country}
      </p>
    </div>
    <TierBadge tier={vendor.tier} size="sm" />
  </div>

  {distance !== undefined && (
    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
      <Navigation className="h-3 w-3" />
      <span>{formatDistance(distance)} away</span>
    </div>
  )}
</Link>
```

### Required Imports
- `next/link` - Navigation
- `components/vendors/TierBadge` - Existing tier badge
- `lib/utils/location:formatDistance` - Distance formatting
- `lucide-react:Navigation` - Distance icon

### Styling Requirements
- Compact design (p-3 padding)
- Truncate long vendor names
- Hover state: `hover:bg-muted/50`
- Transition: `transition-colors duration-150`
- Border rounded: `rounded-lg border`

## Acceptance Criteria

- [ ] Component exports from `components/products/NearbyVendorCard.tsx`
- [ ] Links to correct vendor detail page
- [ ] Shows vendor name, city, country
- [ ] Shows TierBadge for vendor tier
- [ ] Shows formatted distance when provided
- [ ] Handles missing location gracefully
- [ ] Hover state is visible
- [ ] Responsive on mobile

## Testing Requirements

### Unit Tests (`components/products/__tests__/NearbyVendorCard.test.tsx`)
- Test vendor info display
- Test link navigation
- Test distance display
- Test missing location handling
- Test tier badge rendering

## Related Files
- `components/vendors/TierBadge.tsx` - Existing tier badge
- `components/vendors/VendorCard.tsx` - Pattern reference
- `lib/utils/location.ts` - formatDistance function
